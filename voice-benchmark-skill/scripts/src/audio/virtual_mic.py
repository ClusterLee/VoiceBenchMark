"""
虚拟麦克风模块

通过 Android 模拟器 gRPC 接口将音频直接注入到虚拟麦克风。
这是最精确的方案——不经过物理音频设备，零延迟注入。

前提:
- 模拟器需要用 `-grpc 8554` 启动（禁用 JWT 认证）
- 或用 `-grpc-use-token` 启动并传入正确的 token
"""
import time
import wave
import os
from typing import Optional, Generator
from loguru import logger

import grpc

# proto 生成的 gRPC 客户端
import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from proto import emulator_controller_pb2 as pb2
from proto import emulator_controller_pb2_grpc as pb2_grpc


class EmulatorMicInjector:
    """
    Android 模拟器 gRPC 音频注入器

    通过 EmulatorController.injectAudio() 将 WAV 文件
    直接注入到模拟器的虚拟麦克风输入。

    优势:
    - 不需要 BlackHole 等虚拟音频设备
    - 不依赖物理扬声器/麦克风
    - 精确可控的时间戳
    - 支持自定义采样率和格式

    可靠性:
    - 支持 reconnect() 重建 gRPC channel（修复音频管道退化）
    - 支持 health_check() 验证注入管道是否真正工作
    - inject_count 跟踪注入次数，供外部定期重建判断
    """

    def __init__(
        self,
        grpc_host: str = "localhost",
        grpc_port: int = 8554,
        chunk_ms: int = 20,
    ):
        self.grpc_host = grpc_host
        self.grpc_port = grpc_port
        self.chunk_ms = chunk_ms
        self.channel: Optional[grpc.Channel] = None
        self.stub: Optional[pb2_grpc.EmulatorControllerStub] = None
        self.inject_count: int = 0  # 累计注入次数（自上次 connect/reconnect）

    def connect(self):
        """连接 gRPC"""
        addr = f"{self.grpc_host}:{self.grpc_port}"
        self.channel = grpc.insecure_channel(
            addr,
            options=[
                # keepalive 调优：降低 ping 频率，防止 "Too many pings" 被服务端拒绝
                ("grpc.keepalive_time_ms", 60000),        # 60s 发 keepalive ping（原 30s 太频繁）
                ("grpc.keepalive_timeout_ms", 10000),     # 10s 超时
                ("grpc.keepalive_permit_without_calls", 0),  # 空闲时不发 ping（关键！）
                ("grpc.max_reconnect_backoff_ms", 5000),
                ("grpc.http2.max_pings_without_data", 0),  # 无数据时不发 ping
            ],
        )
        self.stub = pb2_grpc.EmulatorControllerStub(self.channel)
        self.inject_count = 0
        logger.info(f"[MicInjector] 已连接 gRPC: {addr}")

    def disconnect(self):
        """断开 gRPC"""
        if self.channel:
            try:
                self.channel.close()
            except Exception:
                pass
            self.channel = None
            self.stub = None
            logger.info("[MicInjector] 已断开 gRPC")

    def reconnect(self):
        """重建 gRPC 连接（修复音频管道退化）

        完全销毁旧 channel 并创建新的。用于：
        - 定期刷新（每 N 轮）
        - 检测到音频管道失效后的恢复
        """
        logger.info("[MicInjector] 🔄 重建 gRPC 连接...")
        self.disconnect()
        time.sleep(1)
        self.connect()
        # 注入一小段静音预热新 channel
        self.inject_warmup(duration_ms=300)
        logger.info("[MicInjector] ✅ gRPC 连接已重建")

    def _load_wav(self, path: str):
        """加载 WAV 文件"""
        with wave.open(path, "rb") as wf:
            sr = wf.getframerate()
            ch = wf.getnchannels()
            sw = wf.getsampwidth()
            n_frames = wf.getnframes()
            pcm_data = wf.readframes(n_frames)
            duration = n_frames / sr
            logger.debug(
                f"[MicInjector] WAV: {sr}Hz, {ch}ch, {sw*8}bit, "
                f"{n_frames} frames, {duration:.2f}s"
            )
            return sr, ch, sw, pcm_data, duration

    def _make_audio_format(self, sr: int, ch: int, sw: int) -> pb2.AudioFormat:
        """构造 AudioFormat protobuf"""
        return pb2.AudioFormat(
            samplingRate=sr,
            channels=pb2.AudioFormat.Mono if ch == 1 else pb2.AudioFormat.Stereo,
            format=pb2.AudioFormat.AUD_FMT_S16 if sw == 2 else pb2.AudioFormat.AUD_FMT_U8,
            mode=pb2.AudioFormat.MODE_REAL_TIME,
        )

    def _packet_generator(
        self, pcm_data: bytes, fmt: pb2.AudioFormat, sr: int, sw: int, ch: int
    ) -> Generator[pb2.AudioPacket, None, None]:
        """生成 AudioPacket 流，按实时节奏发送"""
        bytes_per_sample = sw * ch
        samples_per_chunk = int(sr * self.chunk_ms / 1000)
        bytes_per_chunk = samples_per_chunk * bytes_per_sample

        offset = 0
        chunk_count = 0
        t0 = time.time()

        while offset < len(pcm_data):
            chunk = pcm_data[offset:offset + bytes_per_chunk]
            # 最后一块补零
            if len(chunk) < bytes_per_chunk:
                chunk = chunk + b"\x00" * (bytes_per_chunk - len(chunk))

            packet = pb2.AudioPacket(
                format=fmt if chunk_count == 0 else pb2.AudioFormat(),
                timestamp=int(time.time() * 1_000_000),
                audio=chunk,
            )
            yield packet
            chunk_count += 1
            offset += bytes_per_chunk

            # 实时节奏控制
            expected = chunk_count * self.chunk_ms / 1000.0
            elapsed = time.time() - t0
            if expected > elapsed:
                time.sleep(expected - elapsed)

        logger.debug(
            f"[MicInjector] 发送完成: {chunk_count} chunks, "
            f"耗时 {time.time()-t0:.2f}s"
        )

    def inject_warmup(self, sr: int = 48000, duration_ms: int = 500):
        """注入一小段静音预热音频通道

        某些 APP（如元宝）的音频输入通道可能处于休眠状态，
        直接注入语音有概率不被识别。先注入一小段静音可以唤醒通道。

        Args:
            sr: 采样率
            duration_ms: 预热时长（毫秒）
        """
        if not self.stub:
            self.connect()

        ch = 1
        sw = 2  # 16bit
        n_samples = int(sr * duration_ms / 1000)
        silence = b"\x00" * (n_samples * sw * ch)
        fmt = self._make_audio_format(sr, ch, sw)

        try:
            def _gen():
                packet = pb2.AudioPacket(
                    format=fmt,
                    timestamp=int(time.time() * 1_000_000),
                    audio=silence,
                )
                yield packet

            self.stub.injectAudio(_gen(), timeout=10)
            logger.debug(f"[MicInjector] 静音预热完成 ({duration_ms}ms)")
        except grpc.RpcError as e:
            # 不要吞异常：gRPC 失败意味着模拟器崩溃或 channel 已断开，
            # 调用方（runner._full_environment_reset）必须感知到这点，
            # 否则会误判"gRPC 连接已重建"而继续跑，最终 abort。
            logger.error(f"[MicInjector] ❌ 预热失败: {e}")
            raise

    def wait_audio_service_ready(
        self,
        settle_sec: float = 50.0,
        confirm: bool = True,
    ) -> bool:
        """等待一段静默期后可选做轻量确认注入。

        注意：这不是 gRPC 稳定性的根因判定函数。元宝/豆包历史测试说明 gRPC
        injectAudio 本身可以长期稳定；若灵宝出现 `Connection reset`，优先排查
        启动清场、snapshot 状态、App/AudioRecord 时序、导航/唤醒状态，而不是直接
        归因到 emulator 版本或 gRPC 不稳定。

        本方法仅作为保守等待工具：纯 sleep `settle_sec`（期间不连接/注入），
        结束后可选做一次轻量确认注入。调用方不应循环探测式重试注入。

        Args:
            settle_sec: 纯等待秒数（绝不注入），需 >= 实测安全阈值(45s)，默认 50s
            confirm: 等待结束后是否做一次确认注入（300ms 静音）

        Returns:
            True=service 就绪(确认注入成功或未要求确认)；False=确认注入失败
        """
        logger.info(
            f"[MicInjector] ⏳ 静默等待 audio service 初始化 "
            f"({settle_sec:.0f}s，期间绝不注入)..."
        )
        # 关键：等待期间绝不 connect/注入，避免打断 service 初始化
        t0 = time.time()
        while time.time() - t0 < settle_sec:
            time.sleep(2.0)

        if not confirm:
            logger.info(f"[MicInjector] ✅ 静默等待完成 ({settle_sec:.0f}s)")
            return True

        # 确认注入：此时应已过初始化窗口，第一发即应成功
        if not self.stub:
            self.connect()
        sr, ch, sw = 48000, 1, 2
        n_samples = int(sr * 100 / 1000)  # 100ms 静音确认
        silence = b"\x00" * (n_samples * sw * ch)
        fmt = self._make_audio_format(sr, ch, sw)

        def _gen():
            yield pb2.AudioPacket(
                format=fmt,
                timestamp=int(time.time() * 1_000_000),
                audio=silence,
            )
        try:
            self.stub.injectAudio(_gen(), timeout=8)
            logger.info(
                f"[MicInjector] ✅ audio service 就绪 "
                f"(静默 {settle_sec:.0f}s + 确认注入 OK)"
            )
            return True
        except grpc.RpcError as e:
            logger.error(
                f"[MicInjector] ❌ 确认注入失败(service 仍未就绪): "
                f"{str(e)[:120]}"
            )
            return False

    def inject_wav(self, wav_path: str, timeout: float = 30.0) -> float:
        """
        注入 WAV 文件到模拟器麦克风

        Args:
            wav_path: WAV 文件路径
            timeout: gRPC 超时（秒）

        Returns:
            注入开始的时间戳（time.time()）
        """
        if not self.stub:
            self.connect()

        sr, ch, sw, pcm_data, duration = self._load_wav(wav_path)
        fmt = self._make_audio_format(sr, ch, sw)

        logger.info(
            f"[MicInjector] 注入音频: {wav_path} "
            f"({duration:.2f}s, {sr}Hz)"
        )

        start_time = time.time()

        try:
            self.stub.injectAudio(
                self._packet_generator(pcm_data, fmt, sr, sw, ch),
                timeout=timeout,
            )
            elapsed = time.time() - start_time
            self.inject_count += 1
            logger.info(
                f"[MicInjector] ✅ 注入完成 "
                f"(音频 {duration:.2f}s, 耗时 {elapsed:.2f}s, "
                f"累计注入 #{self.inject_count})"
            )
        except grpc.RpcError as e:
            logger.error(f"[MicInjector] gRPC 错误: {e.code()} - {e.details()}")
            # 连接级错误（UNAVAILABLE/DEADLINE_EXCEEDED）→ 标记断开，让外层自动重连
            if e.code() in (grpc.StatusCode.UNAVAILABLE, grpc.StatusCode.DEADLINE_EXCEEDED):
                logger.warning("[MicInjector] 连接级错误，标记 channel 失效，下次调用将自动重建")
                self.disconnect()
            raise

        return start_time

    def inject_wav_async(self, wav_path: str) -> float:
        """
        异步注入（在后台线程中执行）

        Returns:
            注入开始的时间戳
        """
        import threading

        start_time = time.time()
        error_holder = [None]

        def _inject():
            try:
                self.inject_wav(wav_path)
            except Exception as e:
                error_holder[0] = e
                logger.error(f"[MicInjector] 异步注入失败: {e}")

        thread = threading.Thread(target=_inject, daemon=True)
        thread.start()

        return start_time


class PhysicalAudioInjector:
    """物理音频注入器 — 通过 BlackHole 2ch 虚拟音频设备路由

    当 gRPC injectAudio 不可用（emulator bug / macOS 不兼容）时使用。
    原理: Mac 播放音频 → BlackHole 2ch(默认输出) → BlackHole 2ch(默认输入) →
          模拟器虚拟麦克风(连接 host 默认输入) → APP AudioRecord

    前提:
    - BlackHole 2ch 已安装且设为系统默认输入输出设备
    - 模拟器不带 -no-audio 启动（需要连接 host 音频）

    精度: ~50-100ms（afplay 启动延迟 + BlackHole 路由延迟）
    """

    def __init__(self):
        self.inject_count = 0
        self._play_proc = None
        logger.info("[PhysicalAudio] 物理音频注入器已初始化 (BlackHole 2ch 路由)")

    def connect(self):
        """兼容接口 — 物理音频不需要连接"""
        logger.info("[PhysicalAudio] 无需连接（物理音频模式）")
        return True

    def disconnect(self):
        """兼容接口"""
        if self._play_proc:
            self._play_proc.terminate()
            self._play_proc = None

    def reconnect(self):
        """兼容接口"""
        self.disconnect()
        return self.connect()

    def inject_warmup(self, sr: int = 48000, duration_ms: int = 500):
        """兼容接口 — 物理音频不需要预热"""
        logger.debug(f"[PhysicalAudio] warmup 跳过（物理音频模式）")

    def inject_wav(self, wav_path: str, timeout: float = 30.0) -> float:
        """播放 WAV 文件到 BlackHole 2ch（模拟器虚拟麦克风自动录到）

        Args:
            wav_path: WAV 文件路径
            timeout: 超时（秒）

        Returns:
            播放开始的时间戳（time.time()）
        """
        import subprocess

        # 读取 WAV 时长用于日志
        try:
            with wave.open(wav_path, 'rb') as wf:
                duration = wf.getnframes() / wf.getframerate()
        except Exception:
            duration = 0

        logger.info(
            f"[PhysicalAudio] 播放音频: {wav_path} "
            f"({duration:.2f}s) → BlackHole 2ch → 模拟器麦克风"
        )

        start_time = time.time()

        # 用 afplay 播放（输出到系统默认输出 = BlackHole 2ch）
        self._play_proc = subprocess.Popen(
            ["/usr/bin/afplay", wav_path],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )

        # 等待播放完成
        self._play_proc.wait(timeout=timeout)
        elapsed = time.time() - start_time
        self.inject_count += 1
        logger.info(
            f"[PhysicalAudio] ✅ 播放完成 "
            f"(音频 {duration:.2f}s, 耗时 {elapsed:.2f}s, "
            f"累计播放 #{self.inject_count})"
        )

        return start_time

    def inject_wav_async(self, wav_path: str) -> float:
        """异步播放（在后台线程中执行）"""
        import threading

        start_time = time.time()

        def _play():
            try:
                self.inject_wav(wav_path)
            except Exception as e:
                logger.error(f"[PhysicalAudio] 异步播放错误: {e}")

        t = threading.Thread(target=_play, daemon=True)
        t.start()

        return start_time


# 保留旧的 VirtualMicrophone 作为 ADB 方案的后备
class VirtualMicrophone:
    """
    虚拟麦克风（ADB 后备方案）

    通过 ADB 推送音频到设备并播放。
    精度不如 gRPC 方案，仅在 gRPC 不可用时使用。
    """

    def __init__(self, device_serial: str = "emulator-5554", adb_path: str = "adb"):
        self.device_serial = device_serial
        self.adb_path = adb_path

    def _adb(self, *args):
        import subprocess
        cmd = [self.adb_path, "-s", self.device_serial] + list(args)
        return subprocess.run(cmd, capture_output=True, text=True, timeout=30)

    def push_audio(self, local_path: str) -> str:
        filename = os.path.basename(local_path)
        remote_path = f"/sdcard/{filename}"
        self._adb("push", local_path, remote_path)
        return remote_path

    def play_on_device(self, remote_audio_path: str) -> float:
        start_time = time.time()
        self._adb(
            "shell",
            f"am start -W -a android.intent.action.VIEW "
            f"-d file://{remote_audio_path} -t audio/wav"
        )
        return start_time
