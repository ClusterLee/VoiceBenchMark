#!/usr/bin/env python3
"""
Voice Latency Benchmark — 主运行脚本

用法:
    python3 runner.py                        # 使用默认配置
    python3 runner.py -c configs/cn.yaml     # 指定配置文件
    python3 runner.py --targets yuanbao      # 只测元宝
    python3 runner.py -n 10                  # 10 大轮测试
    python3 runner.py -n 100 -r 2            # 100 大轮，每轮元宝×2 + 豆包×2 = 400 次
    python3 runner.py --inspect yuanbao      # 调试模式：获取元素树
"""
import os
import sys
import time
import json
import shutil
import signal
import subprocess
import click
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Optional
from urllib.request import urlopen
from urllib.error import URLError
from loguru import logger

# 将 src 加入 path
sys.path.insert(0, str(Path(__file__).parent.parent))

from src.config import load_config, Config, DeviceConfig
from src.audio.analyzer import AudioAnalyzer, LatencyResult, LatencyStats
from src.audio.recorder import ADBRecorder, SystemAudioRecorder
from src.audio.virtual_mic import VirtualMicrophone, EmulatorMicInjector
from src.automation.yuanbao_bot import YuanbaoBot
from src.automation.doubao_bot import DoubaoBot
from src.report.generator import ReportGenerator


class BenchmarkRunner:
    """测试运行器

    使用 gRPC EmulatorMicInjector 注入音频 + UI 状态检测测量延迟。
    支持多轮自动化测试和统计报告生成。
    """

    # ── 可靠性配置 ──
    AUDIO_PIPE_QUICK_FAIL_SECS = 15.0   # 注入后 N 秒无响应 → 快速判定管道失效
    AUDIO_PIPE_RECONNECT_EVERY = 20     # 每 N 轮预防性重建 gRPC channel
    AUDIO_PIPE_MAX_CONSEC_FAIL = 2      # 连续 N 轮失败 → 触发管道恢复
    SESSION_MAX_RECONNECT = 3           # Appium session 崩溃最大重试次数

    def __init__(self, config: Config):
        self.config = config
        self.analyzer = AudioAnalyzer(
            sample_rate=config.audio.sample_rate,
            vad_aggressiveness=config.audio.vad_aggressiveness,
            frame_duration_ms=config.audio.vad_frame_duration_ms,
            energy_threshold_db=config.audio.silence_threshold_db,
        )
        self.recorder = ADBRecorder(
            device_serial=config.device.device_name,
        )
        # gRPC 音频注入器（主方案）
        self.injector = EmulatorMicInjector(
            grpc_host="localhost",
            grpc_port=config.device.grpc_port if hasattr(config.device, 'grpc_port') else 8554,
        )
        # ADB 后备方案（仅 gRPC 不可用时使用）
        self.virtual_mic = VirtualMicrophone(
            device_serial=config.device.device_name,
        )
        self.reporter = ReportGenerator(
            output_dir=config.benchmark.output_dir,
        )
        self.results: Dict[str, List[LatencyResult]] = {}
        self._injector_connected = False
        self._consecutive_audio_failures = 0  # 连续音频管道失败计数
        # 云端实时上报器
        self._cloud_uploader = None
        try:
            from src.report.uploader import CloudUploader
            self._cloud_uploader = CloudUploader()
            logger.info(
                f"☁️ 云端上报已启用: {self._cloud_uploader.api_url}"
            )
        except Exception as e:
            logger.warning(f"☁️ 云端上报初始化失败 (不影响测试): {e}")

    def _get_bot(self, target: str):
        """根据目标名创建对应的 Bot"""
        device_config = self.config.device
        app_config = self.config.apps.get(target)

        if target == "yuanbao":
            return YuanbaoBot(device_config, app_config)
        elif target == "doubao":
            return DoubaoBot(device_config, app_config)
        else:
            raise ValueError(f"未知的测试目标: {target}")

    # ── 环境预检 ──────────────────────────────────────────

    @staticmethod
    def _find_adb() -> str:
        """查找 adb 可执行路径"""
        # 优先 PATH 中的 adb
        adb = shutil.which("adb")
        if adb:
            return adb
        # 常见 macOS 路径
        for candidate in [
            os.path.expanduser("~/Library/Android/sdk/platform-tools/adb"),
            "/usr/local/bin/adb",
        ]:
            if os.path.isfile(candidate):
                return candidate
        return "adb"  # fallback，让调用方报错

    @staticmethod
    def _find_emulator() -> str:
        """查找 emulator 可执行路径"""
        emu = shutil.which("emulator")
        if emu:
            return emu
        candidate = os.path.expanduser(
            "~/Library/Android/sdk/emulator/emulator"
        )
        if os.path.isfile(candidate):
            return candidate
        return "emulator"

    @staticmethod
    def _find_appium() -> str:
        """查找 appium 可执行路径"""
        appium = shutil.which("appium")
        if appium:
            return appium
        # managed Node 环境
        candidate = os.path.expanduser(
            "~/.workbuddy/binaries/node/workspace/node_modules/.bin/appium"
        )
        if os.path.isfile(candidate):
            return candidate
        return "appium"

    @staticmethod
    def _is_appium_running(host: str = "127.0.0.1", port: int = 4723) -> bool:
        """检查 Appium 是否在运行"""
        try:
            resp = urlopen(f"http://{host}:{port}/status", timeout=3)
            return resp.status == 200
        except Exception:
            return False

    @classmethod
    def _is_emulator_running(cls) -> bool:
        """检查 Android 模拟器是否在运行"""
        adb = cls._find_adb()
        try:
            result = subprocess.run(
                [adb, "devices"],
                capture_output=True, text=True, timeout=5,
            )
            return "emulator-" in result.stdout
        except Exception:
            return False

    @classmethod
    def _is_emulator_booted(cls) -> bool:
        """检查模拟器是否已完全启动"""
        adb = cls._find_adb()
        try:
            result = subprocess.run(
                [adb, "-s", "emulator-5554", "shell",
                 "getprop", "sys.boot_completed"],
                capture_output=True, text=True, timeout=5,
            )
            return result.stdout.strip() == "1"
        except Exception:
            return False

    @classmethod
    def _wait_for_adb_device(cls, timeout: float = 90.0) -> bool:
        """等待 adb 设备完全就绪（能实际执行 shell 命令）

        模拟器 boot_completed=1 后，adb 设备可能经历：
        1. 不在 adb devices 列表中
        2. 状态为 'offline'
        3. 状态为 'device' 但 shell 命令返回 'device offline'
        4. shell 命令真正可执行 ← 只有这里才算就绪

        Args:
            timeout: 最大等待时间（秒）

        Returns:
            True = 设备就绪, False = 超时
        """
        adb = cls._find_adb()
        t_start = time.time()
        poll_interval = 3.0
        saw_device = False

        while time.time() - t_start < timeout:
            try:
                # 第一步：检查 adb devices 列表中有 device 状态
                result = subprocess.run(
                    [adb, "devices"],
                    capture_output=True, text=True, timeout=5,
                )
                has_device = False
                for line in result.stdout.strip().split("\n"):
                    if "emulator-" in line and "\tdevice" in line:
                        has_device = True
                        if not saw_device:
                            saw_device = True
                            elapsed = time.time() - t_start
                            logger.info(
                                f"⏳ [ADB] 设备出现在列表中 ({elapsed:.0f}s)，"
                                f"验证 shell 可用性..."
                            )
                        break

                if not has_device:
                    time.sleep(poll_interval)
                    continue

                # 第二步：验证 adb shell 真正可执行
                shell_result = subprocess.run(
                    [adb, "-s", "emulator-5554", "shell", "echo", "ready"],
                    capture_output=True, text=True, timeout=10,
                )
                if (shell_result.returncode == 0
                        and "ready" in shell_result.stdout
                        and "offline" not in shell_result.stderr.lower()):
                    elapsed = time.time() - t_start
                    logger.info(
                        f"✅ [ADB] 设备已就绪且 shell 可用 ({elapsed:.0f}s)"
                    )
                    # 额外等待 8s 让设备服务完全启动
                    # （settings provider 等系统服务可能仍在初始化）
                    time.sleep(8)
                    return True
                else:
                    logger.debug(
                        f"[ADB] shell 尚不可用: "
                        f"rc={shell_result.returncode}, "
                        f"out={shell_result.stdout.strip()!r}, "
                        f"err={shell_result.stderr.strip()!r}"
                    )

            except Exception as e:
                logger.debug(f"[ADB] 检查异常: {e}")

            time.sleep(poll_interval)

        logger.error(f"❌ [ADB] 设备等待超时 ({timeout}s)")
        return False

    @staticmethod
    def _is_qemu_running() -> bool:
        """检查 qemu 进程是否存在（不依赖 adb，直接看进程表）

        用于区分：
        - qemu 进程存在 + adb 能看到 emulator → 模拟器正在启动中
        - qemu 进程存在 + adb 看不到 → 模拟器刚启动还没注册到 adb
        - qemu 进程不存在 → 模拟器已崩溃/未运行，可以安全清理
        """
        try:
            result = subprocess.run(
                ["pgrep", "-f", "qemu-system.*-avd"],
                capture_output=True, text=True, timeout=5,
            )
            return bool(result.stdout.strip())
        except Exception:
            return False

    @staticmethod
    def _restart_coreaudiod() -> None:
        """重启 macOS coreaudiod 守护进程，重置宿主机音频子系统

        模拟器崩溃后 BlackHole 虚拟音频设备状态可能损坏，
        导致新模拟器的 audio_forwarder_enable 空指针崩溃。
        重启 coreaudiod 可重置所有音频设备状态。

        注意：需要 sudo 权限。如果没有无密码 sudo，此操作会跳过。
        """
        logger.info("🔊 [AudioReset] 重启 coreaudiod 以重置音频子系统...")
        try:
            result = subprocess.run(
                ["sudo", "-n", "killall", "coreaudiod"],
                capture_output=True, text=True, timeout=10,
            )
            if result.returncode == 0:
                # coreaudiod 会被 launchd 自动重启，等待其恢复
                time.sleep(5)
                logger.info("✅ [AudioReset] coreaudiod 已重启")
            else:
                # sudo 无密码权限不足，尝试无 sudo 方式
                logger.warning(
                    f"⚠️ [AudioReset] sudo killall 失败 (rc={result.returncode})，"
                    f"尝试 launchctl kickstart..."
                )
                result2 = subprocess.run(
                    ["launchctl", "kickstart", "-k",
                     "system/com.apple.audio.coreaudiod"],
                    capture_output=True, text=True, timeout=10,
                )
                if result2.returncode == 0:
                    time.sleep(5)
                    logger.info("✅ [AudioReset] coreaudiod 已通过 launchctl 重启")
                else:
                    logger.warning(
                        "⚠️ [AudioReset] 无法重启 coreaudiod（需要 sudo 权限），"
                        "跳过音频重置"
                    )
        except Exception as e:
            logger.warning(f"⚠️ [AudioReset] coreaudiod 重启异常: {e}")

    @classmethod
    def _kill_stale_emulator_processes(cls) -> None:
        """清理残留的模拟器进程（qemu、crashpad_handler）和 adb server

        模拟器崩溃后常留下僵尸 crashpad_handler 和 AVD 锁文件，
        导致新模拟器无法正常启动。此方法在启动前强制清理。
        """
        import signal

        # 0. 重启 coreaudiod（修复音频子系统状态）
        cls._restart_coreaudiod()

        # 1. 杀残留 qemu 进程
        try:
            result = subprocess.run(
                ["pgrep", "-f", "qemu-system.*-avd"],
                capture_output=True, text=True, timeout=5,
            )
            for pid_str in result.stdout.strip().split("\n"):
                pid_str = pid_str.strip()
                if pid_str:
                    try:
                        os.kill(int(pid_str), signal.SIGKILL)
                        logger.info(
                            f"🧹 [Cleanup] 已杀残留 qemu 进程: {pid_str}"
                        )
                    except (ProcessLookupError, PermissionError):
                        pass
        except Exception:
            pass

        # 2. 杀残留 crashpad_handler（模拟器崩溃报告进程）
        try:
            result = subprocess.run(
                ["pgrep", "-f", "crashpad_handler.*emu-crash"],
                capture_output=True, text=True, timeout=5,
            )
            for pid_str in result.stdout.strip().split("\n"):
                pid_str = pid_str.strip()
                if pid_str:
                    try:
                        os.kill(int(pid_str), signal.SIGKILL)
                    except (ProcessLookupError, PermissionError):
                        pass
            if result.stdout.strip():
                logger.info("🧹 [Cleanup] 已清理残留 crashpad_handler 进程")
        except Exception:
            pass

        # 2.5 关闭崩溃报告对话框（macOS 上的 "qemu-system-aarch64 意外退出" 窗口）
        # 尝试多种方式关闭，支持中英文系统
        for dismiss_script in [
            # 中文系统："忽略" 按钮
            'tell application "System Events" to try\n'
            'set crashDialogs to every window of every process whose name contains "qemu"\n'
            'repeat with dlg in crashDialogs\n'
            'click button "忽略" of dlg\n'
            'end repeat\n'
            'end try',
            # 英文系统："Ignore" 按钮
            'tell application "System Events" to try\n'
            'set crashDialogs to every window of every process whose name contains "qemu"\n'
            'repeat with dlg in crashDialogs\n'
            'click button "Ignore" of dlg\n'
            'end repeat\n'
            'end try',
            # macOS 用户报告崩溃对话框 — 直接按 Escape 关闭
            'tell application "System Events"\n'
            'try\n'
            'if exists (process "UserNotificationCenter") then\n'
            'tell process "UserNotificationCenter"\n'
            'keystroke (ASCII character 27)\n'
            'end tell\n'
            'end if\n'
            'end try\n'
            'end tell',
        ]:
            try:
                subprocess.run(
                    ["osascript", "-e", dismiss_script],
                    capture_output=True, timeout=5,
                )
            except Exception:
                pass
        # 也尝试直接关闭残留的崩溃报告窗口进程
        try:
            subprocess.run(
                ["pkill", "-f", "CrashReporterSupport"],
                capture_output=True, timeout=5,
            )
        except Exception:
            pass
        # 杀掉可能残留的 Problem Reporter 进程
        try:
            subprocess.run(
                ["pkill", "-f", "Problem Reporter"],
                capture_output=True, timeout=5,
            )
        except Exception:
            pass

        # 3. 删除 AVD 锁文件（防止 "emulator is already running" 误判）
        avd_dir = os.path.expanduser("~/.android/avd")
        if os.path.isdir(avd_dir):
            import glob
            for lock_file in glob.glob(os.path.join(avd_dir, "*.avd/*.lock")):
                try:
                    os.remove(lock_file)
                    logger.info(
                        f"🧹 [Cleanup] 已删除锁文件: "
                        f"{os.path.basename(lock_file)}"
                    )
                except OSError:
                    pass

        # 3.5 清理残留 crash 数据（防止 crashpad 引起新进程崩溃）
        import shutil
        crash_dir = os.path.expanduser("/tmp/android-{}/".format(
            os.environ.get("USER", "unknown")
        ))
        if os.path.isdir(crash_dir):
            for entry in os.listdir(crash_dir):
                if entry.startswith("emu-crash"):
                    crash_path = os.path.join(crash_dir, entry)
                    try:
                        shutil.rmtree(crash_path)
                        logger.info(
                            f"🧹 [Cleanup] 已清理 crash 数据: {entry}"
                        )
                    except OSError:
                        pass

        # 4. 重启 adb server（清除旧设备连接缓存）
        adb = cls._find_adb()
        try:
            subprocess.run(
                [adb, "kill-server"],
                capture_output=True, timeout=5,
            )
            time.sleep(1)
            subprocess.run(
                [adb, "start-server"],
                capture_output=True, timeout=10,
            )
            logger.info("🧹 [Cleanup] adb server 已重启")
        except Exception:
            pass

        # 等待清理生效
        time.sleep(2)

    @classmethod
    def _start_emulator(cls, avd_name: str = "Pixel_6_API_34",
                        grpc_port: int = 8554,
                        timeout: float = 300.0) -> bool:
        """启动 Android 模拟器并等待 boot 完成

        智能清理策略：
        - 如果 qemu 进程存在且 adb 能看到 emulator → 正在启动中，等待即可
        - 如果 qemu 进程存在但 adb 看不到 → 给它一些时间注册到 adb
        - 如果 qemu 不存在 → 安全清理残留锁文件，启动新模拟器

        Args:
            avd_name: AVD 名称
            grpc_port: gRPC 端口
            timeout: 最大等待时间（秒），默认 300s（崩溃后冷启动可能需要更长时间）

        Returns:
            True = 启动成功, False = 超时/失败
        """
        qemu_alive = cls._is_qemu_running()
        adb_visible = cls._is_emulator_running()

        if qemu_alive and adb_visible:
            # ── 情况 1: qemu 在跑 + adb 可见 → 正在启动中，直接等 ──
            logger.info(
                "⏳ [Preflight] qemu 进程存在且 adb 可见 emulator，"
                "判定模拟器正在启动中，等待 boot 完成..."
            )
        elif qemu_alive and not adb_visible:
            # ── 情况 2: qemu 在跑 + adb 看不到 → 给它时间注册 ──
            logger.info(
                "⏳ [Preflight] qemu 进程存在但 adb 未发现设备，"
                "等待最多 60s 让模拟器注册到 adb..."
            )
            grace_start = time.time()
            grace_timeout = 60.0
            while time.time() - grace_start < grace_timeout:
                if cls._is_emulator_running():
                    logger.info(
                        "✅ [Preflight] 模拟器已注册到 adb，继续等待 boot..."
                    )
                    break
                time.sleep(5)
            else:
                # 60s 内 adb 仍看不到 → 这是真正的僵尸进程，清理重来
                logger.warning(
                    f"⚠️ [Preflight] qemu 运行 {grace_timeout:.0f}s 后"
                    f"仍未注册到 adb，判定为僵尸进程，清理后重启..."
                )
                cls._kill_stale_emulator_processes()
                return cls._launch_new_emulator(avd_name, grpc_port, timeout,
                                                after_crash=True)
        else:
            # ── 情况 3: qemu 不存在 → 清理残留 + 启动新模拟器 ──
            logger.info("🧹 [Preflight] 无 qemu 进程，清理残留后启动新模拟器...")
            cls._kill_stale_emulator_processes()
            return cls._launch_new_emulator(avd_name, grpc_port, timeout,
                                            after_crash=False)

        # ── 等待 boot_completed（情况 1 & 2 走到这里）──
        t_start = time.time()
        poll_interval = 5.0
        while time.time() - t_start < timeout:
            if cls._is_emulator_running() and cls._is_emulator_booted():
                elapsed = time.time() - t_start
                logger.info(
                    f"✅ [Preflight] 模拟器已启动 ({elapsed:.0f}s)"
                )
                return True
            # 如果 qemu 进程消失了（崩溃），立即清理重启
            if not cls._is_qemu_running():
                elapsed = time.time() - t_start
                logger.warning(
                    f"⚠️ [Preflight] 等待中 qemu 进程消失了"
                    f" ({elapsed:.0f}s)，清理后重启..."
                )
                cls._kill_stale_emulator_processes()
                remaining = timeout - elapsed
                if remaining > 60:
                    return cls._launch_new_emulator(
                        avd_name, grpc_port, remaining,
                        after_crash=True
                    )
                else:
                    logger.error(
                        f"❌ [Preflight] 剩余时间不足 ({remaining:.0f}s)，放弃"
                    )
                    return False
            time.sleep(poll_interval)

        logger.error(
            f"❌ [Preflight] 模拟器启动超时 ({timeout}s)"
        )
        return False

    # ── 冷却配置 ──
    COOLDOWN_AFTER_CRASH_SECS = 30  # 崩溃恢复后冷却等待秒数

    @classmethod
    def _launch_new_emulator(cls, avd_name: str, grpc_port: int,
                             timeout: float,
                             after_crash: bool = False) -> bool:
        """启动全新模拟器进程并等待 boot 完成（内部方法）

        Args:
            avd_name: AVD 名称
            grpc_port: gRPC 端口
            timeout: 最大等待时间
            after_crash: 是否在崩溃后调用（控制冷却等待）

        Returns:
            True = 启动成功, False = 超时/失败
        """
        # ── 崩溃后冷却等待（让 coreaudiod 完全恢复） ──
        if after_crash:
            logger.info(
                f"❄️ [Cooldown] 崩溃后冷却 {cls.COOLDOWN_AFTER_CRASH_SECS}s，"
                f"等待音频子系统完全恢复..."
            )
            time.sleep(cls.COOLDOWN_AFTER_CRASH_SECS)

        emu = cls._find_emulator()
        logger.info(
            f"🚀 [Preflight] 启动模拟器: {emu} -avd {avd_name} "
            f"-grpc {grpc_port} -gpu host -no-snapshot-load"
        )

        # 设置环境变量（确保 Android SDK 工具链可用）
        env = os.environ.copy()
        android_home = os.path.expanduser("~/Library/Android/sdk")
        if os.path.isdir(android_home):
            env["ANDROID_HOME"] = android_home
            env["PATH"] = (
                f"{android_home}/emulator:{android_home}/platform-tools:"
                + env.get("PATH", "")
            )

        try:
            subprocess.Popen(
                [emu, "-avd", avd_name,
                 "-grpc", str(grpc_port),
                 "-gpu", "host",
                 "-no-snapshot-load"],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                env=env,
            )
        except FileNotFoundError:
            logger.error(f"❌ [Preflight] 找不到 emulator: {emu}")
            return False

        # 等待 boot_completed
        t_start = time.time()
        poll_interval = 5.0
        while time.time() - t_start < timeout:
            if cls._is_emulator_running() and cls._is_emulator_booted():
                elapsed = time.time() - t_start
                logger.info(
                    f"✅ [Preflight] 模拟器已启动 ({elapsed:.0f}s)"
                )
                return True
            time.sleep(poll_interval)

        logger.error(
            f"❌ [Preflight] 模拟器启动超时 ({timeout}s)"
        )
        return False

    @classmethod
    def _start_appium(cls, host: str = "127.0.0.1", port: int = 4723,
                      timeout: float = 30.0) -> bool:
        """启动 Appium 服务器

        Returns:
            True = 启动成功, False = 超时/失败
        """
        appium = cls._find_appium()
        logger.info(
            f"🚀 [Preflight] 启动 Appium: {appium} "
            f"--address {host} --port {port}"
        )

        # 确保 managed Node 在 PATH 中
        env = os.environ.copy()
        node_bin = os.path.expanduser(
            "~/.workbuddy/binaries/node/versions/22.12.0/bin"
        )
        if os.path.isdir(node_bin):
            env["PATH"] = node_bin + ":" + env.get("PATH", "")

        # 也添加 Android SDK 工具
        android_home = os.path.expanduser("~/Library/Android/sdk")
        if os.path.isdir(android_home):
            env["ANDROID_HOME"] = android_home
            env["PATH"] = (
                f"{android_home}/platform-tools:{android_home}/emulator:"
                + env["PATH"]
            )

        try:
            subprocess.Popen(
                [appium, "--address", host,
                 "--port", str(port),
                 "--relaxed-security"],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                env=env,
            )
        except FileNotFoundError:
            logger.error(f"❌ [Preflight] 找不到 appium: {appium}")
            return False

        # 等待 Appium 就绪
        t_start = time.time()
        poll_interval = 2.0
        while time.time() - t_start < timeout:
            if cls._is_appium_running(host, port):
                elapsed = time.time() - t_start
                logger.info(
                    f"✅ [Preflight] Appium 已启动 ({elapsed:.0f}s)"
                )
                return True
            time.sleep(poll_interval)

        logger.error(
            f"❌ [Preflight] Appium 启动超时 ({timeout}s)"
        )
        return False

    def preflight_check(self) -> bool:
        """环境预检：确保模拟器和 Appium 都在运行

        自动检测并按需启动缺失的服务。

        Returns:
            True = 环境就绪, False = 无法恢复
        """
        logger.info("🔍 [Preflight] 环境预检开始...")
        all_ok = True

        # 1. 检查模拟器
        if self._is_emulator_running():
            if self._is_emulator_booted():
                logger.info("✅ [Preflight] 模拟器运行中且已启动完成")
            else:
                logger.info("⏳ [Preflight] 模拟器运行中，等待启动完成...")
                for _ in range(60):  # 最多等 300s（崩溃后冷启动需要更长时间）
                    if self._is_emulator_booted():
                        break
                    time.sleep(5)
                if self._is_emulator_booted():
                    logger.info("✅ [Preflight] 模拟器启动完成")
                else:
                    logger.error("❌ [Preflight] 模拟器启动超时")
                    all_ok = False
        elif self._is_qemu_running():
            # qemu 进程在跑但 adb 没看到 → 模拟器正在启动中
            # 不要杀它！交给 _start_emulator 的智能逻辑处理
            logger.info(
                "⏳ [Preflight] qemu 进程存在但 adb 未发现设备，"
                "模拟器可能正在启动中..."
            )
            avd = getattr(self.config.device, 'avd_name', 'Pixel_6_API_34')
            if not self._start_emulator(avd_name=avd):
                all_ok = False
        else:
            logger.warning("⚠️ [Preflight] 模拟器未运行，尝试自动启动...")
            avd = getattr(self.config.device, 'avd_name', 'Pixel_6_API_34')
            if not self._start_emulator(avd_name=avd):
                all_ok = False

        # 2. 检查 Appium
        host = self.config.device.appium_host
        port = self.config.device.appium_port
        if self._is_appium_running(host, port):
            logger.info("✅ [Preflight] Appium 运行中")
        else:
            logger.warning("⚠️ [Preflight] Appium 未运行，尝试自动启动...")
            if not self._start_appium(host, port):
                all_ok = False

        # 3. 检查 gRPC 端口（仅告警，不阻断）
        import socket
        grpc_port = (
            self.config.device.grpc_port
            if hasattr(self.config.device, 'grpc_port')
            else 8554
        )
        try:
            sock = socket.create_connection(
                ("localhost", grpc_port), timeout=2
            )
            sock.close()
            logger.info(f"✅ [Preflight] gRPC 端口 {grpc_port} 可用")
        except Exception:
            logger.warning(
                f"⚠️ [Preflight] gRPC 端口 {grpc_port} 未开放，"
                f"音频注入可能失败"
            )

        if all_ok:
            # 确保 adb 设备完全就绪（boot_completed ≠ adb ready）
            if not self._wait_for_adb_device(timeout=60):
                logger.warning("⚠️ [Preflight] adb 设备等待超时，继续尝试...")
            logger.info("✅ [Preflight] 环境预检通过")
        else:
            logger.error("❌ [Preflight] 环境预检未通过，测试可能失败")

        return all_ok

    def _wait_for_ai_greeting_done(self, target: str, bot, max_wait: float = 8.0) -> float:
        """等待 AI 主动问候结束

        豆包进入通话后经常主动打招呼（"你好呀！有什么想聊的？"），
        如果在 AI 说话时注入音频，APP 的 VAD 会把注入的音频当噪音丢弃。

        策略：监测状态文案，等 AI 从 "对方正在说话"/"说话或点击打断"
        回到 "你可以开始说话"/"正在听..." 才认为安全。

        Returns:
            实际等待的秒数（0 = 没检测到 AI 在说话，无需等待）
        """
        if not hasattr(bot, '_get_call_status_fast'):
            return 0.0

        t_start = time.time()
        ai_was_speaking = False
        poll_interval = 0.15  # 150ms 轮询（快速检测 AI 问候结束）

        for _ in range(int(max_wait / poll_interval)):
            status = bot._get_call_status_fast()

            # AI 正在说话的状态
            if any(kw in status for kw in ["打断", "对方", "思考"]):
                if not ai_was_speaking:
                    logger.info(f"[{target}] 检测到 AI 主动问候中: \"{status}\"，等待结束...")
                    ai_was_speaking = True

            # AI 说完了
            if ai_was_speaking and ("正在听" in status or "你可以开始说话" in status):
                wait_time = time.time() - t_start
                # 短暂等待让音频管道完全切换到接收模式
                time.sleep(0.3)
                return wait_time

            time.sleep(poll_interval)

        if ai_was_speaking:
            logger.warning(f"[{target}] AI 主动问候等待超时 ({max_wait}s)，继续注入")
            return max_wait
        return 0.0

    @staticmethod
    def _is_ttft_outlier(ttft_ms: float, threshold_ms: float = 8000.0) -> bool:
        """判断 TTFT 是否为异常值

        正常 TTFT 应在 500ms~3000ms 范围内。超过 threshold 视为异常。
        """
        return ttft_ms > threshold_ms

    def _ensure_injector(self):
        """确保 gRPC 注入器已连接

        检查两个条件:
        1. _injector_connected 标志
        2. injector.stub 是否存在（inject_wav 失败后会被清空）
        任一条件不满足都会触发重连。
        """
        if not self._injector_connected or self.injector.stub is None:
            try:
                if self.injector.stub is None and self._injector_connected:
                    # stub 被清空但标志还在 → gRPC 连接级错误导致的自动断开
                    logger.warning("gRPC channel 已失效（连接级错误），重建连接...")
                    self._injector_connected = False
                self.injector.connect()
                self._injector_connected = True
                logger.info("gRPC EmulatorMicInjector 已连接")
            except Exception as e:
                logger.error(f"gRPC 注入器连接失败: {e}")
                raise

    def _recover_audio_pipeline(self, bot):
        """恢复音频管道

        当检测到连续音频注入后 APP 无响应时调用。
        执行完整的管道恢复流程：
        1. 重建 gRPC channel（销毁旧连接 + 创建新连接）
        2. 重置模拟器音频路由（扬声器模式 + 音量最大）
        3. 注入静音预热新管道

        Returns:
            True = 恢复成功, False = 恢复失败
        """
        logger.warning("🔧 [AudioPipeline] 检测到音频管道失效，开始恢复流程...")

        try:
            # Step 1: 重建 gRPC channel
            self.injector.reconnect()
            self._injector_connected = True

            # Step 2: 重置音频路由
            if bot and hasattr(bot, '_setup_audio_routing'):
                bot._setup_audio_routing()
                logger.info("[AudioPipeline] 音频路由已重置")

            # Step 3: 额外预热 — 连续注入两段静音确保管道畅通
            self.injector.inject_warmup(duration_ms=500)
            time.sleep(0.5)
            self.injector.inject_warmup(duration_ms=500)

            self._consecutive_audio_failures = 0
            logger.info("✅ [AudioPipeline] 音频管道恢复完成")
            return True

        except Exception as e:
            logger.error(f"❌ [AudioPipeline] 恢复失败: {e}")
            return False

    def _reconnect_appium_session(self, bot) -> bool:
        """重建 Appium session

        当 Appium session 崩溃（InvalidSessionIdException）时调用。
        断开旧 session → 重新连接 → 验证。

        使用 skip_reinstall=True 跳过 UiAutomator2/Settings APK 重装，
        避免重装触发 force-stop 引起的 race condition。

        Returns:
            True = 恢复成功, False = 恢复失败
        """
        logger.warning("🔧 [Appium] Session 崩溃，尝试重建...")

        try:
            # 断开旧 session（忽略错误）
            try:
                bot.disconnect()
            except Exception:
                pass

            time.sleep(3)

            # 重新建立 session（跳过 APK 重装防止 race condition）
            bot.connect(skip_reinstall=True)

            # 验证：尝试获取 page_source
            source = bot.driver.page_source
            if source and len(source) > 100:
                logger.info("✅ [Appium] Session 重建成功")
                return True
            else:
                logger.warning("[Appium] Session 重建后 page_source 异常")
                return False

        except Exception as e:
            logger.error(f"❌ [Appium] Session 重建失败: {e}")
            return False

    def _should_reconnect_grpc(self, round_num: int) -> bool:
        """判断是否应该预防性重建 gRPC 连接

        条件：
        - 每 AUDIO_PIPE_RECONNECT_EVERY 轮
        - 且不是第 0 轮（刚建立的连接）
        """
        return (
            round_num > 0
            and round_num % self.AUDIO_PIPE_RECONNECT_EVERY == 0
        )

    def _get_question_audio_path(self) -> str:
        """获取测试问题音频文件路径

        使用配置文件中指定的音频文件 (audio.input_file)。
        """
        project_root = Path(__file__).parent.parent

        audio_path = project_root / self.config.audio.input_file
        if not audio_path.exists():
            # 配置的文件不存在，尝试生成默认问候语
            self._generate_hello_audio(str(audio_path))
        return str(audio_path)

    def _generate_hello_audio(self, path: str):
        """
        生成 "你好" 测试音频

        实际使用时应该录制一段真人说"你好"的音频
        这里用 TTS 或静音替代作为 placeholder
        """
        import numpy as np
        try:
            import soundfile as sf
        except ImportError:
            logger.error("需要 soundfile 库来生成音频: pip install soundfile")
            raise

        os.makedirs(os.path.dirname(path), exist_ok=True)

        # 生成 0.8 秒的 440Hz 正弦波作为 placeholder
        # 实际使用需要替换为真人语音
        sr = self.config.audio.sample_rate
        duration = 0.8
        t = np.linspace(0, duration, int(sr * duration))
        audio = 0.5 * np.sin(2 * np.pi * 440 * t).astype(np.float32)

        sf.write(path, audio, sr)
        logger.warning(f"已生成 placeholder 音频: {path}")
        logger.warning("请替换为真人说'你好'的录音文件！")

    def run_single_round(
        self, target: str, round_num: int, bot
    ) -> LatencyResult:
        """执行单轮测试

        流程: 进入通话 → 文本 baseline → gRPC 注入音频 → 文本变化检测 → 测量延迟

        检测策略（2026-03-30 优化）：
        - 元宝：通过通话界面默认显示的对话文本变化检测 AI 回复
        - 豆包：状态文案（主信号）+ 字幕文本（辅信号）
        """
        logger.info(f"{'='*50}")
        logger.info(f"[{target}] 第 {round_num + 1} 轮开始")
        logger.info(f"{'='*50}")

        output_dir = Path(self.config.benchmark.output_dir) / target
        output_dir.mkdir(parents=True, exist_ok=True)

        try:
            # 1. 导航到语音通话
            bot.navigate_to_voice_chat()
            time.sleep(0.5)

            # 2. 开始通话（内部会拍摄文本 baseline）
            call_start = bot.start_voice_call()
            time.sleep(0.5)

            # 2.1 通话已建立，设置通话中音频路由（扬声器 + 通话音量最大）
            #     必须在通话模式建立后调用，否则通话流音量设置不生效
            bot._setup_incall_audio()

            # 2.5 等待 AI 主动问候结束（豆包进入通话后常会主动打招呼）
            #     如果在 AI 说话时注入音频，会被当噪音丢弃
            ai_greeting_wait = self._wait_for_ai_greeting_done(target, bot)
            if ai_greeting_wait > 0:
                logger.info(f"[{target}] AI 主动问候已结束，等待了 {ai_greeting_wait:.1f}s")

            # 3. Appium 预热 —— 让首次轮询不被冷启动拖慢
            #    在注入音频前做多次检测调用，消除 Appium driver/UiAutomator2 JIT 开销
            if hasattr(bot, 'detect_ai_response_state'):
                for warmup_i in range(3):
                    t_warmup_start = time.time()
                    bot.detect_ai_response_state()
                    warmup_ms = (time.time() - t_warmup_start) * 1000
                    if warmup_i == 0:
                        logger.info(f"[{target}] Appium 预热 #{warmup_i+1} ({warmup_ms:.0f}ms)")
                logger.info(f"[{target}] Appium 预热完成 (3 轮)")
                # 预热后重置检测状态（预热不应影响后续检测）
                bot.snapshot_baseline_texts()

            # 4. 通过 gRPC 注入测试问题音频
            self._ensure_injector()

            # 确保 incall_audio 后台设置已完成
            if hasattr(bot, '_incall_audio_proc') and bot._incall_audio_proc:
                bot._incall_audio_proc.wait(timeout=10)
                bot._incall_audio_proc = None
                logger.debug("通话中音频设置已完成")

            question_path = self._get_question_audio_path()
            # 动态获取音频时长
            import wave
            with wave.open(question_path, "rb") as wf:
                audio_duration = wf.getnframes() / wf.getframerate()

            logger.info(f"[{target}] 注入音频: {Path(question_path).name} ({audio_duration:.2f}s)")
            t_inject = self.injector.inject_wav(question_path)
            t_audio_end = t_inject + audio_duration  # 音频播放结束时间点

            # 短暂等待让 APP 处理注入的音频
            time.sleep(0.3)

            # 4. 精确轮询检测 AI 回复
            app_config = self.config.apps.get(target)
            timeout = app_config.response_timeout if app_config else 30.0

            ai_start = 0.0
            ai_end = 0.0
            poll_interval = 0.05  # 50ms 轮询间隔（高精度检测）
            max_polls = int(timeout / poll_interval)
            detection_method = "unknown"

            poll_times = []  # 记录每次轮询的检测耗时
            audio_pipe_dead = False  # 快速失败标记
            ever_saw_status_change = False  # 是否看到过状态变化

            for i in range(max_polls):
                elapsed = time.time() - t_inject
                t_poll_start = time.time()

                # 使用新的综合检测 API
                if hasattr(bot, 'detect_ai_response_state'):
                    state = bot.detect_ai_response_state()

                    t_poll_cost = (time.time() - t_poll_start) * 1000
                    poll_times.append(t_poll_cost)

                    # 跟踪是否有任何信号（status 变化/文本变化）
                    status_text = state.get("status_text", "") or ""
                    phase = state.get("status_phase", "") or state.get("status_signal", "")
                    if state.get("has_new_text"):
                        ever_saw_status_change = True
                    if phase in ("thinking", "responding"):
                        ever_saw_status_change = True

                    # 每 5 秒打印一次状态（调试用）
                    if i % 25 == 0 and not ai_start:
                        avg_poll = sum(poll_times) / len(poll_times) if poll_times else 0
                        logger.debug(
                            f"[{target}] [{elapsed:.1f}s] 轮询#{i}: "
                            f"phase={phase}, "
                            f"status=\"{status_text}\", "
                            f"ai_responding={state['ai_responding']}, "
                            f"poll_cost={t_poll_cost:.0f}ms, "
                            f"avg_poll={avg_poll:.0f}ms, "
                            f"new_texts={state.get('new_texts', [])[:2]}"
                        )

                    # ── 快速失败检测 ──
                    # 如果注入后 QUICK_FAIL_SECS 内没有任何信号，
                    # 大概率是音频管道失效（gRPC 注入成功但 APP 收不到）
                    if (
                        not ai_start
                        and not ever_saw_status_change
                        and elapsed > self.AUDIO_PIPE_QUICK_FAIL_SECS
                    ):
                        logger.warning(
                            f"[{target}] ⚡ 快速失败: {elapsed:.0f}s 内"
                            f"无任何信号（status={status_text}, phase={phase}），"
                            f"判定音频管道失效"
                        )
                        audio_pipe_dead = True
                        break

                    if not ai_start and state["ai_responding"]:
                        ai_start = time.time()
                        e2e = (ai_start - t_inject) * 1000
                        ttft = (ai_start - t_audio_end) * 1000  # TTFT: 音频结束到首次响应

                        # 统一日志格式
                        detection_method = "text_change"
                        avg_poll = sum(poll_times) / len(poll_times) if poll_times else 0
                        max_poll = max(poll_times) if poll_times else 0
                        logger.info(
                            f"[{target}] [{elapsed:.1f}s] 🤖 AI 开始回复! "
                            f"(TTFT={ttft:.0f}ms, E2E={e2e:.0f}ms, 方法={detection_method}, "
                            f"阶段={phase}, 状态=\"{status_text}\", "
                            f"轮询统计: avg={avg_poll:.0f}ms max={max_poll:.0f}ms n={len(poll_times)})"
                        )

                    if ai_start and state.get("ai_finished", False):
                        ai_end = time.time()
                        dur = (ai_end - ai_start) * 1000
                        logger.info(
                            f"[{target}] [{elapsed:.1f}s] ✅ AI 回复完毕 "
                            f"(时长={dur:.0f}ms)"
                        )
                        break
                else:
                    # 降级到旧版检测
                    responding = bot.is_ai_responding()
                    finished = bot.is_ai_finished()

                    if not ai_start and responding:
                        ai_start = time.time()
                        e2e = (ai_start - t_inject) * 1000
                        ttft = (ai_start - t_audio_end) * 1000
                        detection_method = "legacy"
                        logger.info(
                            f"[{target}] [{elapsed:.1f}s] 🤖 AI 开始回复! "
                            f"(TTFT={ttft:.0f}ms, E2E={e2e:.0f}ms, 方法=legacy)"
                        )

                    if ai_start and finished:
                        ai_end = time.time()
                        dur = (ai_end - ai_start) * 1000
                        logger.info(
                            f"[{target}] [{elapsed:.1f}s] ✅ AI 回复完毕 "
                            f"(时长={dur:.0f}ms)"
                        )
                        break

                # 自适应 sleep：如果轮询耗时已超过间隔，不额外等待
                poll_elapsed = time.time() - t_poll_start
                remaining = poll_interval - poll_elapsed
                if remaining > 0:
                    time.sleep(remaining)

            # 5. 构造结果
            if audio_pipe_dead:
                # 音频管道失效 —— 特殊标记，供外层触发恢复
                logger.warning(f"[{target}] ⚠️ 音频管道失效 (快速失败)")
                result = LatencyResult(
                    e2e_latency=0, ttfr=0, total_response_time=0,
                    user_speech_start=t_inject, user_speech_end=t_audio_end,
                    ai_speech_start=0, ai_speech_end=0,
                    target=target, round_num=round_num,
                    is_valid=False,
                    error_msg="AUDIO_PIPE_DEAD: 注入成功但APP无响应",
                )
            elif ai_start:
                e2e_latency = ai_start - t_inject
                total_response = (ai_end - ai_start) if ai_end else 0.0
                ttft = ai_start - t_audio_end  # TTFT: 音频结束 → AI 首次响应

                result = LatencyResult(
                    e2e_latency=e2e_latency,
                    ttfr=ttft,
                    total_response_time=total_response,
                    user_speech_start=t_inject,
                    user_speech_end=t_audio_end,
                    ai_speech_start=ai_start,
                    ai_speech_end=ai_end if ai_end else ai_start,
                    target=target,
                    round_num=round_num,
                    is_valid=True,
                )

                logger.info(
                    f"[{target}] Round {round_num}: "
                    f"TTFT={ttft*1000:.0f}ms, "
                    f"E2E={e2e_latency*1000:.0f}ms, "
                    f"AI回复={total_response*1000:.0f}ms, "
                    f"检测方法={detection_method}"
                )
            else:
                logger.warning(f"[{target}] ⚠️ 未检测到 AI 回复")
                result = LatencyResult(
                    e2e_latency=0, ttfr=0, total_response_time=0,
                    user_speech_start=t_inject, user_speech_end=t_audio_end,
                    ai_speech_start=0, ai_speech_end=0,
                    target=target, round_num=round_num,
                    is_valid=False, error_msg="未检测到 AI 回复",
                )

            # 6. 截图留证
            screenshot_path = str(output_dir / f"round_{round_num}_after.png")
            try:
                bot.take_screenshot(screenshot_path)
            except Exception:
                pass

            # 7. 结束通话
            time.sleep(1)
            bot.end_voice_call()
            time.sleep(1)

            return result

        except Exception as e:
            err_msg = str(e)
            logger.error(f"[{target}] 第 {round_num + 1} 轮失败: {e}")
            import traceback
            traceback.print_exc()

            # gRPC 连接错误 → 标记注入器断开
            if ("StatusCode.UNAVAILABLE" in err_msg
                    or "Too many pings" in err_msg
                    or "DEADLINE_EXCEEDED" in err_msg):
                self._injector_connected = False
                logger.warning(f"[{target}] gRPC 连接异常，已标记注入器断开")
                # 尝试结束通话
                try:
                    bot.end_voice_call()
                except Exception:
                    pass
                time.sleep(2)
                return LatencyResult(
                    e2e_latency=0, ttfr=0, total_response_time=0,
                    user_speech_start=0, user_speech_end=0,
                    ai_speech_start=0, ai_speech_end=0,
                    target=target, round_num=round_num,
                    is_valid=False,
                    error_msg="AUDIO_PIPE_DEAD: gRPC 连接异常",
                )

            # Session/UiAutomator2 崩溃 → 重新抛出让外层 run() 触发恢复
            if ("instrumentation process is not running" in err_msg
                    or "cannot be proxied" in err_msg
                    or "InvalidSessionId" in err_msg
                    or ("session" in err_msg.lower()
                        and "not found" in err_msg.lower())):
                raise

            # 非 session 错误：尝试结束通话并恢复状态
            try:
                bot.end_voice_call()
            except Exception:
                pass
            time.sleep(2)

            return LatencyResult(
                e2e_latency=0, ttfr=0, total_response_time=0,
                user_speech_start=0, user_speech_end=0,
                ai_speech_start=0, ai_speech_end=0,
                target=target, round_num=round_num,
                is_valid=False, error_msg=str(e),
            )

    # ── 全局重置配置 ──
    FULL_RESET_MAX_ATTEMPTS = 3    # 全局重置最大尝试次数

    def _full_environment_reset(self, bots: Dict[str, object]) -> bool:
        """全局完整环境重置（等同于之前 bash 循环的新批次效果）

        执行步骤：
        1. 断开所有 bot
        2. 杀掉模拟器 + 清理残留（含 coreaudiod 重启）
        3. 冷却等待 30s
        4. preflight 重新拉起模拟器 + Appium
        5. 重建 gRPC 连接
        6. 重连所有 bot

        Returns:
            True = 恢复成功, False = 彻底失败
        """
        logger.warning("🔄🔄🔄 [FullReset] 开始全局完整环境重置...")

        # 1. 断开所有 bot（忽略错误）
        for target, bot in bots.items():
            try:
                bot.disconnect()
            except Exception:
                pass

        # 2. 杀掉残留进程（内含 coreaudiod 重启）
        self._kill_stale_emulator_processes()

        # 3. 冷却等待
        logger.info(
            f"❄️ [FullReset] 冷却 {self.COOLDOWN_AFTER_CRASH_SECS}s，"
            f"等待音频子系统完全恢复..."
        )
        time.sleep(self.COOLDOWN_AFTER_CRASH_SECS)

        # 4. preflight 重新拉起环境
        if not self.preflight_check():
            logger.error("❌ [FullReset] 环境预检失败")
            return False

        # 4.5 等待 adb 设备完全就绪（boot_completed ≠ adb ready）
        if not self._wait_for_adb_device(timeout=60):
            logger.error("❌ [FullReset] adb 设备等待超时")
            return False

        # 5. 重建 gRPC 连接
        try:
            self.injector.reconnect()
            self._injector_connected = True
            logger.info("✅ [FullReset] gRPC 连接已重建")
        except Exception as e:
            logger.error(f"❌ [FullReset] gRPC 重建失败: {e}")
            self._injector_connected = False

        # 6. 重连所有 bot
        all_ok = True
        for target, bot in bots.items():
            try:
                bot.connect()
                logger.info(f"✅ [FullReset] [{target}] Bot 已重连")
            except Exception as e:
                logger.error(f"❌ [FullReset] [{target}] Bot 重连失败: {e}")
                all_ok = False

        if all_ok:
            logger.info("✅✅✅ [FullReset] 全局环境重置完成！")
        else:
            logger.warning("⚠️ [FullReset] 部分 Bot 重连失败")

        # 重置计数器
        self._consecutive_audio_failures = 0
        return all_ok

    def _run_target_round(
        self, target: str, round_num: int, sub_round: int,
        bot, session_reconnect_counts: Dict[str, int],
        bots: Dict[str, object] = None,
    ) -> Optional[LatencyResult]:
        """执行单个 target 的一次测试（含错误恢复）

        核心策略变更（v2 崩溃修复）：
        - 移除"不可恢复 → 跳过 target"逻辑
        - Session 恢复失败时，执行全局完整重置（等同于 bash 循环的新批次）
        - 音频管道连续失败时，也触发全局重置而不是放弃

        Args:
            target: 测试目标名
            round_num: 大轮号 (0-based)
            sub_round: 大轮内的子轮号 (0-based)
            bot: 已连接的 Bot 实例
            session_reconnect_counts: 各 target 的 session 重连计数
            bots: 所有 bot 实例的字典（全局重置时需要断开/重连所有 bot）

        Returns:
            LatencyResult 或 None（需要重试当前轮）
        """
        # 全局轮序号（用于 gRPC 预防重建判断）
        global_round = round_num * 2 + sub_round  # 每轮每 target 2 次

        # ── 检查 bot 连接状态，必要时主动连接 ──
        if not getattr(bot, 'driver', None):
            logger.warning(
                f"[{target}] ⚠️ Bot driver 为 None，尝试主动连接..."
            )
            try:
                bot.connect(skip_reinstall=True)
                logger.info(f"[{target}] ✅ Bot 已重新连接")
            except Exception as conn_e:
                logger.error(
                    f"[{target}] ❌ Bot 连接失败: {conn_e}，触发全局重置"
                )
                if bots and self._full_environment_reset(bots):
                    return None  # 信号：重试
                return LatencyResult(
                    e2e_latency=0, ttfr=0,
                    total_response_time=0,
                    user_speech_start=0, user_speech_end=0,
                    ai_speech_start=0, ai_speech_end=0,
                    target=target, round_num=round_num,
                    is_valid=False,
                    error_msg=f"BOT_CONNECT_FAILED: {conn_e}",
                )

        # ── 预防性 gRPC 重建（每 N 轮）──
        if self._should_reconnect_grpc(global_round):
            logger.info(
                f"[{target}] 🔄 预防性重建 gRPC 连接 "
                f"(每 {self.AUDIO_PIPE_RECONNECT_EVERY} 轮)"
            )
            self.injector.reconnect()
            self._injector_connected = True

        # ── 执行单轮测试 ──
        try:
            result = self.run_single_round(target, round_num, bot)
        except Exception as e:
            err_msg = str(e)
            # ── Appium Session 崩溃自动恢复 ──
            if ("session" in err_msg.lower()
                    or "InvalidSessionId" in err_msg
                    or "device not found" in err_msg
                    or "instrumentation process is not running" in err_msg
                    or "cannot be proxied" in err_msg
                    or "'NoneType' object has no attribute" in err_msg):

                count = session_reconnect_counts.get(target, 0)
                if count < self.SESSION_MAX_RECONNECT:
                    session_reconnect_counts[target] = count + 1
                    logger.warning(
                        f"[{target}] 🔧 Appium session 崩溃 "
                        f"(恢复 #{count+1}/"
                        f"{self.SESSION_MAX_RECONNECT}): {err_msg[:80]}"
                    )
                    if self._reconnect_appium_session(bot):
                        logger.info(
                            f"[{target}] ♻️ 重试第 {round_num+1} 轮"
                        )
                        return None  # 信号：重试当前轮

                # ── 轻量恢复失败 → 全局完整重置 ──
                logger.warning(
                    f"[{target}] 🔧 Session 轻量恢复失败，"
                    f"执行全局完整重置..."
                )
                if bots and self._full_environment_reset(bots):
                    session_reconnect_counts[target] = 0
                    logger.info(
                        f"[{target}] ♻️ 全局重置后重试第 {round_num+1} 轮"
                    )
                    return None  # 信号：重试
                else:
                    # 全局重置也失败了，记录失败但不跳过 target
                    logger.error(
                        f"[{target}] ❌ 全局重置失败，记录失败继续下一轮"
                    )
                    return LatencyResult(
                        e2e_latency=0, ttfr=0,
                        total_response_time=0,
                        user_speech_start=0, user_speech_end=0,
                        ai_speech_start=0, ai_speech_end=0,
                        target=target, round_num=round_num,
                        is_valid=False,
                        error_msg=f"FULL_RESET_FAILED: {err_msg[:100]}",
                    )
            else:
                # 非 session 错误，记录并继续
                result = LatencyResult(
                    e2e_latency=0, ttfr=0,
                    total_response_time=0,
                    user_speech_start=0, user_speech_end=0,
                    ai_speech_start=0, ai_speech_end=0,
                    target=target, round_num=round_num,
                    is_valid=False, error_msg=str(e),
                )

        # ── 音频管道失效检测 + 自动恢复 ──
        if (hasattr(result, 'error_msg')
                and result.error_msg
                and "AUDIO_PIPE_DEAD" in result.error_msg):
            self._consecutive_audio_failures += 1
            logger.warning(
                f"[{target}] 连续音频失败: "
                f"{self._consecutive_audio_failures}/"
                f"{self.AUDIO_PIPE_MAX_CONSEC_FAIL}"
            )

            # 第一次失败就立即重建 gRPC 并重试
            if self._consecutive_audio_failures == 1:
                logger.info(
                    f"[{target}] 🔄 首次管道失效，快速重建 gRPC 并重试..."
                )
                try:
                    self.injector.reconnect()
                    self._injector_connected = True
                except Exception as e:
                    logger.error(f"[{target}] gRPC 快速重建失败: {e}")
                    self._injector_connected = False
                try:
                    bot.end_voice_call()
                except Exception:
                    pass
                time.sleep(3)
                return None  # 信号：重试

            if self._consecutive_audio_failures >= self.AUDIO_PIPE_MAX_CONSEC_FAIL:
                # ── 管道恢复失败 → 全局完整重置 ──
                logger.warning(
                    f"[{target}] 🔧 音频管道连续失败 "
                    f"{self._consecutive_audio_failures} 次，"
                    f"执行全局完整重置..."
                )
                if bots and self._full_environment_reset(bots):
                    logger.info(
                        f"[{target}] ♻️ 全局重置后重试"
                        f"第 {round_num+1} 轮"
                    )
                    return None  # 信号：重试
                else:
                    logger.error(
                        f"[{target}] ❌ 全局重置失败，记录失败并继续"
                    )
            return result  # 管道失败的结果

        # ── 成功或非管道失败 ──
        if result.is_valid:
            self._consecutive_audio_failures = 0
            session_reconnect_counts[target] = 0

        # 异常值检测 + 自动重试（最多 1 次）
        ttft_ms = result.ttfr * 1000 if result.is_valid else 0
        if result.is_valid and self._is_ttft_outlier(ttft_ms):
            logger.warning(
                f"[{target}] ⚠️ Round {round_num} "
                f"TTFT={ttft_ms:.0f}ms 异常! "
                f"(>{8000}ms)，标记为无效并自动重试..."
            )
            result.is_valid = False
            result.error_msg = f"TTFT outlier: {ttft_ms:.0f}ms"
            self.results[target].append(result)

            logger.info(f"[{target}] 重置 APP 准备重试...")
            bot.reset_app()
            time.sleep(self.config.benchmark.round_interval + 2)

            retry_result = self.run_single_round(target, round_num, bot)
            retry_ttft = (
                retry_result.ttfr * 1000 if retry_result.is_valid else 0
            )
            if retry_result.is_valid and not self._is_ttft_outlier(retry_ttft):
                logger.info(
                    f"[{target}] ✅ 重试成功! TTFT={retry_ttft:.0f}ms"
                )
            else:
                logger.warning(
                    f"[{target}] 重试仍异常 (TTFT={retry_ttft:.0f}ms)，"
                    f"保留结果"
                )
            return retry_result

        return result

    def run(self, targets: List[str] = None, repeat_per_round: int = 1):
        """运行完整测试

        交替模式：每大轮按 target 顺序轮流测试，每个 target 测 repeat_per_round 次。
        例如 targets=[yuanbao, doubao], repeat_per_round=2, rounds=100:
          大轮 1: yuanbao×2, doubao×2
          大轮 2: yuanbao×2, doubao×2
          ...
          共 100 轮 × 2 target × 2 repeat = 400 次测试

        Args:
            targets: 测试目标列表
            repeat_per_round: 每大轮每个 target 测试次数，默认 1
        """
        if targets is None:
            targets = list(self.config.apps.keys())

        # ── 确保 Android SDK 工具（adb 等）在 PATH 中 ──
        android_home = os.path.expanduser("~/Library/Android/sdk")
        sdk_paths = [
            os.path.join(android_home, "platform-tools"),
            os.path.join(android_home, "emulator"),
        ]
        current_path = os.environ.get("PATH", "")
        for p in sdk_paths:
            if os.path.isdir(p) and p not in current_path:
                os.environ["PATH"] = p + os.pathsep + current_path
                current_path = os.environ["PATH"]
                logger.info(f"🔧 [PATH] 已添加: {p}")

        # ── 环境预检：自动检测并启动模拟器/Appium ──
        if not self.preflight_check():
            logger.error("❌ 环境预检失败，终止测试")
            return {}

        total_tests = self.config.benchmark.num_rounds * len(targets) * repeat_per_round
        logger.info(f"🎙️ Voice Latency Benchmark 开始")
        logger.info(f"   目标: {targets}")
        logger.info(f"   大轮次: {self.config.benchmark.num_rounds}")
        logger.info(f"   每轮每 target 重复: {repeat_per_round} 次")
        logger.info(f"   总测试数: {total_tests}")
        logger.info(f"   节点: {self.config.node_id} ({self.config.node_region})")
        logger.info(f"   方案: gRPC EmulatorMicInjector (交替模式)")
        logger.info(f"   可靠性: 快速失败={self.AUDIO_PIPE_QUICK_FAIL_SECS}s, "
                     f"预防重建=每{self.AUDIO_PIPE_RECONNECT_EVERY}轮, "
                     f"连续失败恢复阈值={self.AUDIO_PIPE_MAX_CONSEC_FAIL}")

        # 初始化各 target 的 bot 和状态
        bots: Dict[str, object] = {}
        session_reconnect_counts: Dict[str, int] = {}
        full_reset_count = 0  # 全局重置计数

        for target in targets:
            self.results[target] = []
            session_reconnect_counts[target] = 0

        try:
            # 预先连接所有 bot
            for target in targets:
                try:
                    bot = self._get_bot(target)
                    bot.connect()
                    bots[target] = bot
                    logger.info(f"✅ [{target}] Bot 已连接")
                except Exception as e:
                    logger.error(f"❌ [{target}] Bot 连接失败: {e}")
                    # 初始连接失败不跳过，后续全局重置可能恢复
                    bots[target] = self._get_bot(target)

            # ── 交替测试主循环 ──
            for round_num in range(self.config.benchmark.num_rounds):
                logger.info(f"\n{'#'*60}")
                logger.info(
                    f"# 大轮 {round_num + 1}/{self.config.benchmark.num_rounds}"
                )
                logger.info(f"{'#'*60}")

                for target in targets:
                    bot = bots[target]
                    self._consecutive_audio_failures = 0

                    for sub in range(repeat_per_round):
                        logger.info(
                            f"\n>>> [{target}] 大轮 {round_num+1} "
                            f"子轮 {sub+1}/{repeat_per_round}"
                        )

                        _round_start_idx = len(self.results[target])
                        max_retries = self.FULL_RESET_MAX_ATTEMPTS + 3
                        for attempt in range(max_retries):
                            result = self._run_target_round(
                                target, round_num, sub, bot,
                                session_reconnect_counts,
                                bots=bots,
                            )

                            if result is None:
                                # 需要重试 — bot 可能已被全局重置更新
                                bot = bots[target]
                                continue
                            else:
                                self.results[target].append(result)
                                break
                        else:
                            # max_retries 用完
                            logger.error(
                                f"[{target}] ❌ 重试 {max_retries} 次仍失败，"
                                f"记录空结果继续"
                            )
                            self.results[target].append(LatencyResult(
                                e2e_latency=0, ttfr=0,
                                total_response_time=0,
                                user_speech_start=0, user_speech_end=0,
                                ai_speech_start=0, ai_speech_end=0,
                                target=target, round_num=round_num,
                                is_valid=False,
                                error_msg="MAX_RETRIES_EXHAUSTED",
                            ))

                        # ── 单轮实时上报 ──
                        if self._cloud_uploader:
                            new_results = self.results[target][
                                _round_start_idx:
                            ]
                            for r in new_results:
                                try:
                                    self._cloud_uploader.upload_round(
                                        r, target, round_num,
                                        node_id=self.config.node_id,
                                        node_region=self.config.node_region,
                                    )
                                except Exception as e:
                                    logger.warning(
                                        f"☁️ [{target}] Round {round_num}"
                                        f" 上报异常: {e}"
                                    )

                        # 子轮间重置 APP
                        if sub < repeat_per_round - 1:
                            logger.info(
                                f"[{target}] 重置 APP (子轮间)..."
                            )
                            bot.reset_app()
                            time.sleep(self.config.benchmark.round_interval)

                    # target 间切换：重置当前 APP
                    try:
                        bot.reset_app()
                    except Exception:
                        pass
                    time.sleep(self.config.benchmark.round_interval)

                # 大轮间等待
                if round_num < self.config.benchmark.num_rounds - 1:
                    logger.info(f"⏸️ 大轮间等待 {self.config.benchmark.round_interval}s...")
                    time.sleep(self.config.benchmark.round_interval)

        finally:
            # 断开所有 bot
            for target, bot in bots.items():
                try:
                    bot.disconnect()
                except Exception:
                    pass

            # 清理 gRPC 连接
            if self._injector_connected:
                self.injector.disconnect()
                self._injector_connected = False

        # 生成报告
        report_files = self.reporter.generate(
            self.results,
            node_id=self.config.node_id,
            node_region=self.config.node_region,
            formats=self.config.benchmark.report_formats,
        )

        # 打印摘要
        self._print_summary()

        return report_files

    def _print_summary(self):
        """打印测试摘要"""
        logger.info(f"\n{'='*60}")
        logger.info("📊 测试结果摘要")
        logger.info(f"{'='*60}")

        for target, results in self.results.items():
            stats = LatencyStats(results)
            s = stats.summary()
            ttft = s["ttfr_ms"]
            e2e = s["e2e_latency_ms"]

            logger.info(f"\n  {target}:")
            logger.info(f"    有效轮次: {s['valid_rounds']}/{s['total_rounds']}")
            if s['valid_rounds'] > 0:
                logger.info(f"    🎯 TTFT (ms) — 音频结束→AI首响:")
                logger.info(f"      平均: {ttft['mean']:.0f}")
                logger.info(f"      中位: {ttft['median']:.0f}")
                logger.info(f"      P95:  {ttft['p95']:.0f}")
                logger.info(f"      范围: {ttft['min']:.0f} ~ {ttft['max']:.0f}")
                logger.info(f"    E2E 延迟 (ms) — 注入开始→AI首响:")
                logger.info(f"      平均: {e2e['mean']:.0f}")
                logger.info(f"      中位: {e2e['median']:.0f}")


def inspect_mode(target: str, config: Config):
    """调试模式：连接 APP 并获取 UI 元素树"""
    logger.info(f"🔍 调试模式: 获取 {target} UI 元素树")

    if target == "yuanbao":
        bot = YuanbaoBot(config.device)
    elif target == "doubao":
        bot = DoubaoBot(config.device)
    else:
        raise ValueError(f"未知目标: {target}")

    try:
        bot.connect()
        time.sleep(3)

        output_path = f"results/{target}_ui_dump_{datetime.now():%Y%m%d_%H%M%S}.xml"
        os.makedirs("results", exist_ok=True)
        bot.capture_element_info(output_path)

        logger.info(f"UI 元素树已保存到: {output_path}")
        logger.info("请用此信息更新 bot 的元素定位")

    finally:
        bot.disconnect()


@click.command()
@click.option("-c", "--config", "config_path", default=None, help="配置文件路径")
@click.option("-t", "--targets", default=None, help="测试目标 (逗号分隔)")
@click.option("-n", "--rounds", default=None, type=int, help="测试轮次（大轮数）")
@click.option("-r", "--repeat", default=1, type=int, help="每大轮每 target 重复次数 (默认 1)")
@click.option("--inspect", default=None, help="调试模式：获取指定 APP 的 UI 元素树")
def main(config_path, targets, rounds, repeat, inspect):
    """🎙️ Voice Latency Benchmark — AI 语音通话延迟评测工具

    交替模式示例:
        python3 runner.py -n 100 -r 2
        # 100 大轮，每轮 yuanbao×2 + doubao×2 = 400 次测试
    """

    # 配置日志
    logger.remove()
    logger.add(sys.stderr, level="INFO", format="{time:HH:mm:ss} | {level} | {message}")
    logger.add("results/benchmark.log", level="DEBUG", rotation="10 MB")

    # 加载配置
    config = load_config(config_path)

    if rounds:
        config.benchmark.num_rounds = rounds

    # 调试模式
    if inspect:
        inspect_mode(inspect, config)
        return

    # 解析目标
    target_list = None
    if targets:
        target_list = [t.strip() for t in targets.split(",")]

    # 运行测试
    runner = BenchmarkRunner(config)
    report_files = runner.run(target_list, repeat_per_round=repeat)

    logger.info(f"\n🏁 测试完成！报告文件:")
    for fmt, path in report_files.items():
        logger.info(f"  {fmt}: {path}")


if __name__ == "__main__":
    main()
