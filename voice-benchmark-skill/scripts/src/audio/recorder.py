"""
系统音频录制模块

支持两种模式：
1. ADB screenrecord（Android 设备内录）
2. 外部麦克风录制（物理设备场景）
"""
import subprocess
import time
import os
import signal
import threading
from dataclasses import dataclass
from pathlib import Path
from typing import Optional
from loguru import logger


@dataclass
class RecordingSession:
    """录制会话"""
    output_path: str
    start_time: float = 0.0
    end_time: float = 0.0
    process: Optional[subprocess.Popen] = None
    is_recording: bool = False

    @property
    def duration(self) -> float:
        return self.end_time - self.start_time


class ADBRecorder:
    """
    通过 ADB 录制 Android 设备音频

    方案：使用 screenrecord 录制屏幕+音频，后续 FFmpeg 提取音轨
    """

    def __init__(self, device_serial: str = "emulator-5554", adb_path: str = "adb"):
        self.device_serial = device_serial
        self.adb_path = adb_path
        self.session: Optional[RecordingSession] = None

    def _adb(self, *args) -> subprocess.CompletedProcess:
        """执行 ADB 命令"""
        cmd = [self.adb_path, "-s", self.device_serial] + list(args)
        logger.debug(f"ADB: {' '.join(cmd)}")
        return subprocess.run(cmd, capture_output=True, text=True, timeout=30)

    def start_recording(self, output_path: str, max_duration: int = 60) -> RecordingSession:
        """
        开始录制

        Args:
            output_path: 本地输出路径
            max_duration: 最大录制时长（秒）
        """
        remote_path = f"/sdcard/voice_benchmark_{int(time.time())}.mp4"

        # 启动 screenrecord
        cmd = [
            self.adb_path, "-s", self.device_serial,
            "shell", "screenrecord",
            "--time-limit", str(max_duration),
            "--bit-rate", "2000000",
            remote_path,
        ]

        logger.info(f"开始 ADB 录制: {remote_path}")
        process = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
        )

        self.session = RecordingSession(
            output_path=output_path,
            start_time=time.time(),
            process=process,
            is_recording=True,
        )
        self.session._remote_path = remote_path

        return self.session

    def stop_recording(self) -> Optional[RecordingSession]:
        """停止录制并拉取文件"""
        if not self.session or not self.session.is_recording:
            logger.warning("没有进行中的录制")
            return None

        session = self.session
        session.end_time = time.time()
        session.is_recording = False

        # 停止 screenrecord
        if session.process:
            # 发送 SIGINT 让 screenrecord 优雅退出
            self._adb("shell", "kill", "-2",
                      f"$(pidof screenrecord)")
            time.sleep(2)
            try:
                session.process.terminate()
                session.process.wait(timeout=5)
            except Exception:
                session.process.kill()

        # 拉取文件到本地
        remote_path = getattr(session, '_remote_path', '')
        if remote_path:
            time.sleep(1)  # 等待文件写入完成
            self._adb("pull", remote_path, session.output_path)
            self._adb("shell", "rm", remote_path)

        # 用 FFmpeg 提取音轨
        audio_path = session.output_path.replace(".mp4", ".wav")
        self._extract_audio(session.output_path, audio_path)
        session.output_path = audio_path

        logger.info(f"录制完成: {audio_path} ({session.duration:.1f}s)")
        self.session = None
        return session

    def _extract_audio(self, video_path: str, audio_path: str):
        """从视频中提取音频"""
        cmd = [
            "ffmpeg", "-y",
            "-i", video_path,
            "-vn",  # 不要视频
            "-acodec", "pcm_s16le",
            "-ar", "16000",
            "-ac", "1",  # 单声道
            audio_path,
        ]
        logger.debug(f"FFmpeg 提取音频: {' '.join(cmd)}")
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
        if result.returncode != 0:
            logger.error(f"FFmpeg 错误: {result.stderr}")
            raise RuntimeError(f"音频提取失败: {result.stderr}")


class SystemAudioRecorder:
    """
    系统音频录制（macOS/Linux）

    macOS: 使用 BlackHole / Soundflower 虚拟音频设备
    Linux: 使用 PulseAudio monitor
    """

    def __init__(self, sample_rate: int = 16000, device: Optional[str] = None):
        self.sample_rate = sample_rate
        self.device = device
        self.session: Optional[RecordingSession] = None

    def start_recording(self, output_path: str, max_duration: int = 60) -> RecordingSession:
        """开始录制系统音频"""
        cmd = ["ffmpeg", "-y"]

        if self.device:
            # 指定音频设备
            cmd += ["-f", "avfoundation", "-i", f":{self.device}"]
        else:
            # 默认设备
            cmd += ["-f", "avfoundation", "-i", ":0"]

        cmd += [
            "-t", str(max_duration),
            "-acodec", "pcm_s16le",
            "-ar", str(self.sample_rate),
            "-ac", "1",
            output_path,
        ]

        logger.info(f"开始系统音频录制: {output_path}")
        process = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
        )

        self.session = RecordingSession(
            output_path=output_path,
            start_time=time.time(),
            process=process,
            is_recording=True,
        )
        return self.session

    def stop_recording(self) -> Optional[RecordingSession]:
        """停止录制"""
        if not self.session or not self.session.is_recording:
            return None

        session = self.session
        session.end_time = time.time()
        session.is_recording = False

        if session.process:
            session.process.send_signal(signal.SIGINT)
            try:
                session.process.wait(timeout=10)
            except subprocess.TimeoutExpired:
                session.process.kill()

        logger.info(f"系统录制完成: {session.output_path} ({session.duration:.1f}s)")
        self.session = None
        return session
