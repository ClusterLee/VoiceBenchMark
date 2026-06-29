"""
音频分析引擎 — VAD + 延迟计算

核心职责：
1. 对录制的音频进行 Voice Activity Detection
2. 区分"用户发送段"和"AI 回复段"
3. 精确计算各项延迟指标
"""
import numpy as np
import struct
from dataclasses import dataclass
from typing import List, Optional, Tuple
from pathlib import Path
from loguru import logger

try:
    import webrtcvad
    HAS_WEBRTCVAD = True
except ImportError:
    HAS_WEBRTCVAD = False
    logger.warning("webrtcvad 未安装，将使用能量检测替代")

try:
    import librosa
    import soundfile as sf
    HAS_LIBROSA = True
except ImportError:
    HAS_LIBROSA = False
    logger.warning("librosa 未安装，音频加载功能受限")


@dataclass
class VoiceSegment:
    """一段语音活动"""
    start_time: float  # 秒
    end_time: float    # 秒
    label: str = ""    # "user" 或 "ai"

    @property
    def duration(self) -> float:
        return self.end_time - self.start_time


@dataclass
class LatencyResult:
    """延迟测量结果"""
    # 核心指标
    e2e_latency: float          # 端到端延迟：用户说完 → AI 开始说（秒）
    ttfr: float                 # Time to First Response（秒）
    total_response_time: float  # AI 完整回复时长（秒）

    # 时间戳
    user_speech_start: float    # 用户语音开始时间
    user_speech_end: float      # 用户语音结束时间
    ai_speech_start: float      # AI 回复开始时间
    ai_speech_end: float        # AI 回复结束时间

    # 元数据
    target: str = ""            # "yuanbao" 或 "doubao"
    round_num: int = 0
    is_valid: bool = True
    error_msg: str = ""

    # Phase 2 锚点（dumpsys 双锚点，仅 lingbao）：
    # 用 AudioFlinger Signal power history 测的设备时钟 TTFT，比 OCR 锚点更准。
    # 默认 None（元宝/豆包及 dumpsys 不可用时不填）。
    dumpsys_ttft_ms: float = None      # dumpsys 双锚点 TTFT（毫秒，设备时钟）
    dumpsys_ok: bool = False           # dumpsys 锚点是否成功
    dumpsys_in_db: float = None        # INPUT 注入到达锚点 dB
    dumpsys_out_db: float = None       # OUTPUT TTS 起播锚点 dB

    def to_dict(self) -> dict:
        return {
            "target": self.target,
            "round": self.round_num,
            "e2e_latency_ms": round(self.e2e_latency * 1000, 1),
            "ttft_ms": round(self.ttfr * 1000, 1),
            "ttfr_ms": round(self.ttfr * 1000, 1),  # backward compat
            "total_response_time_ms": round(self.total_response_time * 1000, 1),
            "user_speech_start": round(self.user_speech_start, 4),
            "user_speech_end": round(self.user_speech_end, 4),
            "ai_speech_start": round(self.ai_speech_start, 4),
            "ai_speech_end": round(self.ai_speech_end, 4),
            "is_valid": self.is_valid,
            "error_msg": self.error_msg,
            # Phase 2 dumpsys 锚点（仅 lingbao 有值）
            "dumpsys_ttft_ms": self.dumpsys_ttft_ms,
            "dumpsys_ok": self.dumpsys_ok,
            "dumpsys_in_db": self.dumpsys_in_db,
            "dumpsys_out_db": self.dumpsys_out_db,
        }


class AudioAnalyzer:
    """音频分析器"""

    def __init__(
        self,
        sample_rate: int = 16000,
        vad_aggressiveness: int = 2,
        frame_duration_ms: int = 30,
        energy_threshold_db: float = -40.0,
        min_speech_duration: float = 0.1,
        min_silence_duration: float = 0.3,
    ):
        self.sample_rate = sample_rate
        self.frame_duration_ms = frame_duration_ms
        self.energy_threshold_db = energy_threshold_db
        self.min_speech_duration = min_speech_duration
        self.min_silence_duration = min_silence_duration

        # WebRTC VAD
        if HAS_WEBRTCVAD:
            self.vad = webrtcvad.Vad(vad_aggressiveness)
        else:
            self.vad = None

        self.frame_size = int(sample_rate * frame_duration_ms / 1000)

    def load_audio(self, path: str) -> Tuple[np.ndarray, int]:
        """加载音频文件，返回 (samples, sample_rate)"""
        if HAS_LIBROSA:
            audio, sr = librosa.load(path, sr=self.sample_rate, mono=True)
            return audio, sr
        else:
            # fallback: 用 soundfile
            import soundfile as sf
            audio, sr = sf.read(path)
            if len(audio.shape) > 1:
                audio = audio.mean(axis=1)
            if sr != self.sample_rate:
                # 简单重采样
                ratio = self.sample_rate / sr
                indices = np.arange(0, len(audio), 1 / ratio).astype(int)
                indices = indices[indices < len(audio)]
                audio = audio[indices]
            return audio.astype(np.float32), self.sample_rate

    def detect_voice_segments(self, audio: np.ndarray) -> List[VoiceSegment]:
        """
        检测音频中的语音段

        使用 WebRTC VAD 或能量检测
        """
        if self.vad and HAS_WEBRTCVAD:
            return self._detect_with_webrtcvad(audio)
        else:
            return self._detect_with_energy(audio)

    def _detect_with_webrtcvad(self, audio: np.ndarray) -> List[VoiceSegment]:
        """使用 WebRTC VAD 检测语音段"""
        # 转为 16-bit PCM
        if audio.dtype == np.float32 or audio.dtype == np.float64:
            pcm = (audio * 32767).astype(np.int16)
        else:
            pcm = audio.astype(np.int16)

        frame_bytes = self.frame_size * 2  # 16-bit = 2 bytes per sample
        frames = []
        for i in range(0, len(pcm) - self.frame_size, self.frame_size):
            frame = pcm[i:i + self.frame_size]
            frame_data = struct.pack(f"{len(frame)}h", *frame)
            is_speech = self.vad.is_speech(frame_data, self.sample_rate)
            frames.append(is_speech)

        return self._frames_to_segments(frames)

    def _detect_with_energy(self, audio: np.ndarray) -> List[VoiceSegment]:
        """使用能量检测语音段（fallback）"""
        frames = []
        for i in range(0, len(audio) - self.frame_size, self.frame_size):
            frame = audio[i:i + self.frame_size]
            rms = np.sqrt(np.mean(frame ** 2))
            db = 20 * np.log10(max(rms, 1e-10))
            is_speech = db > self.energy_threshold_db
            frames.append(is_speech)

        return self._frames_to_segments(frames)

    def _frames_to_segments(self, frames: List[bool]) -> List[VoiceSegment]:
        """将帧级别的检测结果合并为语音段"""
        frame_duration_s = self.frame_duration_ms / 1000.0
        min_speech_frames = int(self.min_speech_duration / frame_duration_s)
        min_silence_frames = int(self.min_silence_duration / frame_duration_s)

        segments = []
        in_speech = False
        speech_start = 0
        silence_count = 0

        for i, is_speech in enumerate(frames):
            if is_speech:
                if not in_speech:
                    speech_start = i
                    in_speech = True
                silence_count = 0
            else:
                if in_speech:
                    silence_count += 1
                    if silence_count >= min_silence_frames:
                        speech_end = i - silence_count
                        if speech_end - speech_start >= min_speech_frames:
                            segments.append(VoiceSegment(
                                start_time=speech_start * frame_duration_s,
                                end_time=speech_end * frame_duration_s,
                            ))
                        in_speech = False
                        silence_count = 0

        # 处理最后一段
        if in_speech:
            speech_end = len(frames)
            if speech_end - speech_start >= min_speech_frames:
                segments.append(VoiceSegment(
                    start_time=speech_start * frame_duration_s,
                    end_time=speech_end * frame_duration_s,
                ))

        return segments

    def calculate_latency(
        self,
        audio_path: str,
        trigger_time: float = 0.0,
        hello_duration: float = 0.8,
        target: str = "",
        round_num: int = 0,
    ) -> LatencyResult:
        """
        分析录制音频，计算延迟

        Args:
            audio_path: 录制的音频文件路径
            trigger_time: 触发播放 "你好" 的时间戳（相对于录制开始）
            hello_duration: "你好" 音频的时长（秒）
            target: 评测目标名称
            round_num: 测试轮次

        Returns:
            LatencyResult
        """
        try:
            audio, sr = self.load_audio(audio_path)
            segments = self.detect_voice_segments(audio)

            logger.info(f"检测到 {len(segments)} 个语音段")
            for i, seg in enumerate(segments):
                logger.debug(f"  段 {i}: {seg.start_time:.3f}s - {seg.end_time:.3f}s "
                           f"(时长 {seg.duration:.3f}s)")

            if len(segments) < 2:
                return LatencyResult(
                    e2e_latency=0, ttfr=0, total_response_time=0,
                    user_speech_start=0, user_speech_end=0,
                    ai_speech_start=0, ai_speech_end=0,
                    target=target, round_num=round_num,
                    is_valid=False,
                    error_msg=f"仅检测到 {len(segments)} 个语音段，预期至少 2 个"
                )

            # 第一个语音段 = 用户说的"你好"
            user_seg = segments[0]
            user_seg.label = "user"

            # 第二个语音段 = AI 回复
            ai_seg = segments[1]
            ai_seg.label = "ai"

            # 如果有更多段，合并为完整的 AI 回复
            if len(segments) > 2:
                ai_end = segments[-1].end_time
            else:
                ai_end = ai_seg.end_time

            e2e_latency = ai_seg.start_time - user_seg.end_time
            ttfr = ai_seg.start_time - trigger_time
            total_response = ai_end - ai_seg.start_time

            result = LatencyResult(
                e2e_latency=e2e_latency,
                ttfr=ttfr,
                total_response_time=total_response,
                user_speech_start=user_seg.start_time,
                user_speech_end=user_seg.end_time,
                ai_speech_start=ai_seg.start_time,
                ai_speech_end=ai_end,
                target=target,
                round_num=round_num,
                is_valid=e2e_latency > 0,
                error_msg="" if e2e_latency > 0 else "E2E latency <= 0, 可能检测有误",
            )

            logger.info(
                f"[{target}] Round {round_num}: "
                f"E2E={result.e2e_latency*1000:.0f}ms, "
                f"TTFR={result.ttfr*1000:.0f}ms, "
                f"Total={result.total_response_time*1000:.0f}ms"
            )

            return result

        except Exception as e:
            logger.error(f"音频分析失败: {e}")
            return LatencyResult(
                e2e_latency=0, ttfr=0, total_response_time=0,
                user_speech_start=0, user_speech_end=0,
                ai_speech_start=0, ai_speech_end=0,
                target=target, round_num=round_num,
                is_valid=False,
                error_msg=str(e),
            )


class LatencyStats:
    """延迟统计汇总"""

    def __init__(self, results: List[LatencyResult]):
        self.results = [r for r in results if r.is_valid]
        self.invalid_count = len(results) - len(self.results)

    def _stat(self, values: List[float]) -> dict:
        if not values:
            return {"mean": 0, "median": 0, "p95": 0, "p99": 0, "min": 0, "max": 0, "std": 0}
        arr = np.array(values)
        return {
            "mean": float(np.mean(arr)),
            "median": float(np.median(arr)),
            "p95": float(np.percentile(arr, 95)),
            "p99": float(np.percentile(arr, 99)),
            "min": float(np.min(arr)),
            "max": float(np.max(arr)),
            "std": float(np.std(arr)),
        }

    def summary(self) -> dict:
        """生成统计摘要"""
        e2e = [r.e2e_latency * 1000 for r in self.results]  # ms
        ttft = [r.ttfr * 1000 for r in self.results]  # TTFT (音频结束→AI首响)
        total = [r.total_response_time * 1000 for r in self.results]

        return {
            "total_rounds": len(self.results) + self.invalid_count,
            "valid_rounds": len(self.results),
            "invalid_rounds": self.invalid_count,
            "e2e_latency_ms": self._stat(e2e),
            "ttft_ms": self._stat(ttft),
            "ttfr_ms": self._stat(ttft),  # backward compat
            "total_response_time_ms": self._stat(total),
        }
