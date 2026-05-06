"""
Appium 自动化基类

封装与 Android 设备交互的通用操作
"""
import time
import subprocess
from abc import ABC, abstractmethod
from typing import Optional
from appium import webdriver
from appium.options.android import UiAutomator2Options
from appium.webdriver.common.appiumby import AppiumBy
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from loguru import logger

from ..config import AppConfig, DeviceConfig


class BaseBot(ABC):
    """APP 自动化基类"""

    def __init__(self, app_config: AppConfig, device_config: DeviceConfig):
        self.app_config = app_config
        self.device_config = device_config
        self.driver: Optional[webdriver.Remote] = None
        self._is_connected = False

    def connect(self, skip_reinstall: bool = False):
        """连接到 Appium 服务器并启动 APP

        Args:
            skip_reinstall: 是否跳过 UiAutomator2 server 和 io.appium.settings
                           APK 的重新安装。首次连接传 False（默认），session 重建时
                           传 True 以避免重装 APK 触发 force-stop 导致 race condition
                           （新 UiAutomator2 server 在 session "就绪" 后被延迟杀死）。
        """
        options = UiAutomator2Options()
        options.platform_name = self.device_config.platform
        options.device_name = self.device_config.device_name
        options.platform_version = self.device_config.platform_version
        options.automation_name = self.device_config.automation_name
        options.app_package = self.app_config.package
        options.app_activity = self.app_config.activity
        options.no_reset = True  # 保持登录态
        options.auto_grant_permissions = True
        options.new_command_timeout = 300
        # 🔑 关键：禁止 UiAutomator2 等待 UI idle
        # 默认行为是等 UI 完全空闲才返回 find_elements，
        # 但语音通话中 AI 边说边更新字幕，UI 永远不 idle，
        # 导致 find_elements 阻塞到 AI 说完才返回。
        options.set_capability("disableWindowAnimation", True)
        options.set_capability("waitForIdleTimeout", 0)
        options.set_capability("waitForSelectorTimeout", 0)

        if skip_reinstall:
            # 🔑 跳过 APK 重装，防止 Appium 在 session 创建时重新安装
            # io.appium.settings 和 io.appium.uiautomator2.server APK，
            # 避免 installPackageLI → Force Stop → UiAutomator2 被杀的 race condition。
            # 前提：APK 已经在设备上（首次连接时已安装）。
            options.set_capability("skipServerInstallation", True)
            options.set_capability("skipDeviceInitialization", True)
            logger.info("跳过 UiAutomator2/Settings APK 重装（防 race condition）")

        appium_url = (
            f"http://{self.device_config.appium_host}:"
            f"{self.device_config.appium_port}"
        )

        logger.info(f"连接 Appium: {appium_url}, APP: {self.app_config.package}")

        self.driver = webdriver.Remote(
            command_executor=appium_url,
            options=options,
        )
        # 显式设置隐式等待为 0 —— 确保 find_elements 不会在找不到元素时阻塞
        self.driver.implicitly_wait(0)
        self._is_connected = True
        logger.info(f"已连接到 {self.app_config.name}")

        # 🔑 Post-connect 稳定性验证
        # Appium 创建 session 时会重装 APK（除非 skipServerInstallation），
        # 重装完成后可能有延迟的 force-stop 操作杀掉 UiAutomator2 server，
        # 这里做两轮验证（间隔 2s）确保 UiAutomator2 真正稳定。
        if not skip_reinstall:
            for check in range(2):
                time.sleep(2)
                try:
                    source = self.driver.page_source
                    if source and len(source) > 100:
                        continue
                except Exception as e:
                    logger.warning(
                        f"Post-connect 验证 #{check+1} 失败: "
                        f"{str(e)[:80]}，等待恢复..."
                    )
                    time.sleep(3)
                    # 最后一次验证还失败就算了，让调用方处理
            logger.debug("UiAutomator2 post-connect 稳定性验证通过")

        # 设置音频路由：通话音频切到扬声器外放
        self._setup_audio_routing()

        # 等待 APP 完全加载
        time.sleep(self.app_config.post_login_wait)

    def _setup_audio_routing(self):
        """设置模拟器音频路由（启动时调用）

        精确设置非通话音频流的音量到最大。
        VOICE_CALL 流在非通话模式下无法修改（Android 安全限制），
        需要在通话建立后由 _setup_incall_audio() 处理。

        Android 音频流及其用途:
        - stream 0: VOICE_CALL — 语音通话（只能在通话模式下修改）
        - stream 1: SYSTEM    — 系统提示音
        - stream 2: RING      — 铃声
        - stream 3: MUSIC     — 媒体播放（元宝用这个流）
        - stream 4: ALARM     — 闹钟
        - stream 5: NOTIFICATION — 通知
        """
        device = self.device_config.device_name
        try:
            # 批次1: 设置非通话音频流音量到最大（合并成一条 shell 命令）
            subprocess.run(
                ["adb", "-s", device, "shell",
                 "cmd media_session volume --stream 1 --set 7; "   # SYSTEM
                 "cmd media_session volume --stream 2 --set 7; "   # RING
                 "cmd media_session volume --stream 3 --set 15; "  # MUSIC
                 "cmd media_session volume --stream 4 --set 7; "   # ALARM
                 "cmd media_session volume --stream 5 --set 7"],   # NOTIFICATION
                capture_output=True, timeout=10,
            )

            # 批次2: 写入扬声器偏好（系统级）
            subprocess.run(
                ["adb", "-s", device, "shell", "content", "insert",
                 "--uri", "content://settings/system",
                 "--bind", "name:s:speakerphone_on",
                 "--bind", "value:s:1"],
                capture_output=True, timeout=5,
            )

            logger.info("音频路由已设置: 非通话流音量最大 + 扬声器偏好")
        except Exception as e:
            logger.warning(f"音频路由设置失败(不影响测试): {e}")

    def _setup_incall_audio(self):
        """设置通话中的音频路由（进入通话界面后调用，后台执行不阻塞）

        关键时序：必须在 APP 已经进入通话模式后调用。
        此时 Android 的音频模式为 MODE_IN_COMMUNICATION，
        VOLUME_UP 按键会影响 STREAM_VOICE_CALL 流。

        使用 Popen 后台执行，不阻塞主流程（与 AI 问候等待并行）。
        """
        device = self.device_config.device_name
        try:
            # 全部合并成一条 shell 命令，后台执行
            self._incall_audio_proc = subprocess.Popen(
                ["adb", "-s", device, "shell",
                 "content insert --uri content://settings/system "
                 "--bind name:s:speakerphone_on --bind value:s:1; "
                 "input keyevent KEYCODE_VOLUME_UP KEYCODE_VOLUME_UP "
                 "KEYCODE_VOLUME_UP KEYCODE_VOLUME_UP KEYCODE_VOLUME_UP "
                 "KEYCODE_VOLUME_UP KEYCODE_VOLUME_UP; "
                 "cmd media_session volume --stream 0 --set 5; "
                 "cmd media_session volume --stream 3 --set 15"],
                stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
            )
            logger.info("通话中音频设置已启动（后台执行）")
        except Exception as e:
            logger.warning(f"通话中音频设置失败(不影响测试): {e}")

    def disconnect(self):
        """断开连接"""
        if self.driver:
            try:
                self.driver.quit()
            except Exception as e:
                logger.warning(f"断开连接异常: {e}")
            finally:
                self._is_connected = False
                self.driver = None

    def _ensure_driver_ready(self) -> bool:
        """检测并修复 Appium session

        当 UiAutomator2 instrumentation 崩溃时，session 本身还存在，
        但所有命令都会报 "cannot be proxied / instrumentation not running"。
        用 page_source 做轻量 ping，出现崩溃特征时自动重建 session。

        Returns:
            True = session 可用（或已重建）；False = 无法恢复
        """
        try:
            # 轻量 ping；page_source 会强制与 instrumentation 通信
            _ = self.driver.page_source
            return True
        except Exception as e:
            err = str(e)
            crashed = (
                "instrumentation" in err.lower()
                or "cannot be proxied" in err.lower()
                or "not running" in err.lower()
                or "InvalidSessionId" in err
                or "invalid session id" in err.lower()
            )
            if crashed:
                logger.warning(f"[守护] Session 已崩溃，重建中: {err[:80]}")
                try:
                    self.disconnect()
                except Exception:
                    pass
                time.sleep(3)
                try:
                    self.connect(skip_reinstall=True)
                    logger.info("[守护] Session 重建成功")
                    return True
                except Exception as re:
                    logger.error(f"[守护] Session 重建失败: {re}")
                    return False
            # 其他类型的异常不处理，交由上层 retry
            return True

    def find_element(self, by: str, value: str, timeout: float = 10):
        """查找元素"""
        wait = WebDriverWait(self.driver, timeout)
        return wait.until(EC.presence_of_element_located((by, value)))

    def click_element(self, by: str, value: str, timeout: float = 10):
        """点击元素"""
        element = self.find_element(by, value, timeout)
        element.click()
        return element

    def wait_for_element(self, by: str, value: str, timeout: float = 30) -> bool:
        """等待元素出现"""
        try:
            WebDriverWait(self.driver, timeout).until(
                EC.presence_of_element_located((by, value))
            )
            return True
        except TimeoutException:
            return False

    def wait_for_element_disappear(self, by: str, value: str, timeout: float = 30) -> bool:
        """等待元素消失"""
        try:
            WebDriverWait(self.driver, timeout).until(
                EC.invisibility_of_element_located((by, value))
            )
            return True
        except TimeoutException:
            return False

    def take_screenshot(self, path: str):
        """截图"""
        if self.driver:
            self.driver.save_screenshot(path)
            logger.debug(f"截图已保存: {path}")

    def reset_app(self):
        """强杀 APP 并冷启动，清除所有运行时上下文

        用于保证每轮 benchmark 都是全新对话，没有历史上下文给 AI 做热缓存。
        流程: terminate → 等待进程退出 → 冷启动 → UiAutomator2 健康检查
        """
        pkg = self.app_config.package
        device = self.device_config.device_name
        logger.info(f"[{self.app_config.name}] 强杀 APP 并冷启动...")

        # 1. 优先用 Appium terminate_app（保留 UiAutomator2 instrumentation）
        #    如果失败再降级为 ADB force-stop
        terminated_via_appium = False
        try:
            if self.driver:
                self.driver.terminate_app(pkg)
                terminated_via_appium = True
                logger.debug(f"  terminate_app {pkg} 完成 (Appium)")
        except Exception as e:
            logger.debug(f"  terminate_app 失败: {e}，降级为 force-stop")

        if not terminated_via_appium:
            try:
                subprocess.run(
                    ["adb", "-s", device, "shell", "am", "force-stop", pkg],
                    capture_output=True, timeout=10,
                )
                logger.debug(f"  force-stop {pkg} 完成 (ADB)")
            except Exception as e:
                logger.warning(f"  force-stop 失败: {e}")

        time.sleep(1)

        # 2. 冷启动 APP
        try:
            self.driver.activate_app(pkg)
            logger.debug(f"  activate_app {pkg} 完成")
        except Exception:
            # Appium activate 失败，用 ADB 启动
            try:
                subprocess.run(
                    ["adb", "-s", device, "shell", "am", "start", "-n",
                     f"{pkg}/{self.app_config.activity}"],
                    capture_output=True, timeout=10,
                )
            except Exception as e:
                logger.warning(f"  ADB 启动失败: {e}")

        # 3. 等待 APP 完全加载
        base_wait = self.app_config.post_login_wait + 1
        logger.debug(f"  基础等待 {base_wait}s...")
        time.sleep(base_wait)

        # 4. UiAutomator2 健康检查 + 自愈
        #    force-stop 会连带杀死 UiAutomator2 instrumentation 进程，
        #    导致下一轮 find_elements 必崩。这里提前检测并修复。
        if self.driver:
            ui2_healthy = False
            t_verify_start = time.time()
            for attempt in range(3):
                try:
                    source = self.driver.page_source
                    if source and len(source) > 100:
                        verify_time = time.time() - t_verify_start
                        logger.debug(f"  UiAutomator2 就绪 ({verify_time:.1f}s)")
                        ui2_healthy = True
                        break
                except Exception as e:
                    err_msg = str(e)
                    if ("instrumentation" in err_msg.lower()
                            or "cannot be proxied" in err_msg.lower()
                            or "not running" in err_msg.lower()):
                        logger.warning(
                            f"  UiAutomator2 崩溃 (检测 #{attempt+1})，"
                            f"主动重建 session..."
                        )
                        # 主动重建 session（不等到下一轮崩溃再救）
                        try:
                            self.disconnect()
                        except Exception:
                            pass
                        time.sleep(2)
                        try:
                            self.connect(skip_reinstall=True)
                            ui2_healthy = True
                            logger.info(
                                f"  ✅ Session 主动重建成功 "
                                f"({time.time() - t_verify_start:.1f}s)"
                            )
                            break
                        except Exception as ce:
                            logger.error(f"  Session 主动重建失败: {ce}")
                    else:
                        logger.debug(f"  page_source 异常: {err_msg[:60]}")
                time.sleep(1)

            if not ui2_healthy:
                logger.warning(
                    f"[{self.app_config.name}] ⚠️ UiAutomator2 健康检查未通过，"
                    f"下一轮可能触发 session 恢复"
                )

        logger.info(f"[{self.app_config.name}] APP 已冷启动完成")

    def capture_element_info(self, path: str):
        """导出 UI 元素树到文件"""
        if self.driver:
            source = self.driver.page_source
            with open(path, "w", encoding="utf-8") as f:
                f.write(source)
            logger.debug(f"UI 元素树已保存: {path}")

    @abstractmethod
    def navigate_to_voice_chat(self):
        """导航到语音通话界面"""
        pass

    @abstractmethod
    def start_voice_call(self) -> float:
        """
        开始语音通话

        Returns:
            通话开始的时间戳
        """
        pass

    @abstractmethod
    def end_voice_call(self):
        """结束语音通话"""
        pass

    @abstractmethod
    def is_ai_responding(self) -> bool:
        """检测 AI 是否正在回复"""
        pass

    @abstractmethod
    def is_ai_finished(self) -> bool:
        """检测 AI 是否回复完毕"""
        pass

    def run_single_test(self) -> dict:
        """
        执行单次语音测试

        Returns:
            包含时间戳的测试数据
        """
        result = {
            "target": self.app_config.name,
            "voice_call_start": 0,
            "audio_send_start": 0,
            "audio_send_end": 0,
            "ai_response_detected": 0,
            "ai_response_end": 0,
            "success": False,
            "error": "",
        }

        try:
            # 1. 进入语音通话
            self.navigate_to_voice_chat()
            time.sleep(2)

            # 2. 开始语音通话
            call_start = self.start_voice_call()
            result["voice_call_start"] = call_start
            time.sleep(1)

            # 3. 发送语音（由 runner 层处理音频注入）
            result["audio_send_start"] = time.time()

            # 音频播放由外部控制，这里只记录时间
            # runner 会调用 VirtualMicrophone 注入音频

            result["success"] = True

        except Exception as e:
            logger.error(f"测试执行失败: {e}")
            result["error"] = str(e)

        return result

    def __enter__(self):
        self.connect()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.disconnect()
