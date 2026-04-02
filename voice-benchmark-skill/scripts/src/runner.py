#!/usr/bin/env python3
"""
Voice Latency Benchmark — 主运行脚本

用法:
    python3 runner.py                     # 使用默认配置
    python3 runner.py -c configs/cn.yaml  # 指定配置文件
    python3 runner.py --targets yuanbao   # 只测元宝
    python3 runner.py --rounds 10         # 10 轮测试
    python3 runner.py --inspect yuanbao   # 调试模式：获取元素树
"""
import os
import sys
import time
import json
import click
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Optional
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

    def _wait_for_ai_greeting_done(self, target: str, bot, max_wait: float = 12.0) -> float:
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
        poll_interval = 0.3

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
                # 额外等 0.5s 让音频管道完全切换到接收模式
                time.sleep(0.5)
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

            # 重新建立 session
            bot.connect()

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

        优先使用 Edge TTS 生成的高质量 48kHz 中文语音。
        当前问题: "您好" (约 1.63 秒)
        使用简单问候语避免元宝在回复复杂问题时播放"思考音效"，
        导致状态文案提前跳变，干扰 TTFT 测量。
        """
        project_root = Path(__file__).parent.parent

        # 优先使用"您好"音频（简单问候，AI 直接回复，无思考音效干扰）
        hello_audio = project_root / "assets" / "audio" / "hello_nihao_edge_48k.wav"
        if hello_audio.exists():
            return str(hello_audio)

        # 退而求其次用配置的文件
        audio_path = project_root / self.config.audio.input_file
        if not audio_path.exists():
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
            time.sleep(2)

            # 2. 开始通话（内部会拍摄文本 baseline）
            call_start = bot.start_voice_call()
            time.sleep(2)

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
            time.sleep(2)
            bot.end_voice_call()
            time.sleep(2)

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

    def run(self, targets: List[str] = None):
        """运行完整测试"""
        if targets is None:
            targets = list(self.config.apps.keys())

        logger.info(f"🎙️ Voice Latency Benchmark 开始")
        logger.info(f"   目标: {targets}")
        logger.info(f"   轮次: {self.config.benchmark.num_rounds}")
        logger.info(f"   节点: {self.config.node_id} ({self.config.node_region})")
        logger.info(f"   方案: gRPC EmulatorMicInjector")
        logger.info(f"   可靠性: 快速失败={self.AUDIO_PIPE_QUICK_FAIL_SECS}s, "
                     f"预防重建=每{self.AUDIO_PIPE_RECONNECT_EVERY}轮, "
                     f"连续失败恢复阈值={self.AUDIO_PIPE_MAX_CONSEC_FAIL}")

        try:
            for target in targets:
                logger.info(f"\n{'#'*60}")
                logger.info(f"# 开始测试: {target}")
                logger.info(f"{'#'*60}")

                self.results[target] = []
                bot = self._get_bot(target)
                self._consecutive_audio_failures = 0
                session_reconnect_count = 0

                try:
                    bot.connect()

                    round_num = 0
                    while round_num < self.config.benchmark.num_rounds:
                        # 记录本轮开始前 results 长度（用于上报）
                        _round_start_idx = len(self.results[target])

                        # ── 预防性 gRPC 重建（每 N 轮）──
                        if self._should_reconnect_grpc(round_num):
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
                                    or "cannot be proxied" in err_msg):

                                if session_reconnect_count < self.SESSION_MAX_RECONNECT:
                                    session_reconnect_count += 1
                                    logger.warning(
                                        f"[{target}] 🔧 Appium session 崩溃 "
                                        f"(恢复 #{session_reconnect_count}/"
                                        f"{self.SESSION_MAX_RECONNECT}): {err_msg[:80]}"
                                    )
                                    if self._reconnect_appium_session(bot):
                                        # session 恢复成功，重试当前轮
                                        logger.info(
                                            f"[{target}] ♻️ 重试第 {round_num+1} 轮"
                                        )
                                        continue
                                    else:
                                        logger.error(
                                            f"[{target}] ❌ Session 恢复失败，"
                                            f"跳过后续轮次"
                                        )
                                        break
                                else:
                                    logger.error(
                                        f"[{target}] ❌ Session 已恢复 "
                                        f"{self.SESSION_MAX_RECONNECT} 次仍失败，"
                                        f"终止测试"
                                    )
                                    break
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
                            # （不记录失败结果，直接重试当前轮）
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
                                # 结束当前通话，重试当前轮
                                try:
                                    bot.end_voice_call()
                                except Exception:
                                    pass
                                time.sleep(3)
                                continue

                            if self._consecutive_audio_failures >= self.AUDIO_PIPE_MAX_CONSEC_FAIL:
                                # 连续失败 → 完整恢复流程（含 reset_app）
                                if self._recover_audio_pipeline(bot):
                                    logger.info(
                                        f"[{target}] ♻️ 管道恢复后重试"
                                        f"第 {round_num+1} 轮"
                                    )
                                    bot.reset_app()
                                    time.sleep(5)
                                    continue
                                else:
                                    logger.error(
                                        f"[{target}] ❌ 管道恢复失败，"
                                        f"记录失败并继续"
                                    )
                            self.results[target].append(result)
                        else:
                            # 成功或非管道失败 → 重置连续失败计数
                            if result.is_valid:
                                self._consecutive_audio_failures = 0
                                session_reconnect_count = 0  # 成功轮也重置 session 计数

                            # 异常值检测 + 自动重试（最多 1 次）
                            ttft_ms = result.ttfr * 1000 if result.is_valid else 0
                            if result.is_valid and self._is_ttft_outlier(ttft_ms):
                                logger.warning(
                                    f"[{target}] ⚠️ Round {round_num} "
                                    f"TTFT={ttft_ms:.0f}ms 异常! "
                                    f"(>{8000}ms)，标记为无效并自动重试..."
                                )
                                result.is_valid = False
                                result.error_msg = (
                                    f"TTFT outlier: {ttft_ms:.0f}ms"
                                )
                                self.results[target].append(result)

                                # 重置 APP 后重试
                                logger.info(
                                    f"[{target}] 重置 APP 准备重试..."
                                )
                                bot.reset_app()
                                time.sleep(
                                    self.config.benchmark.round_interval + 2
                                )

                                retry_result = self.run_single_round(
                                    target, round_num, bot
                                )
                                retry_ttft = (
                                    retry_result.ttfr * 1000
                                    if retry_result.is_valid else 0
                                )
                                if (retry_result.is_valid
                                        and not self._is_ttft_outlier(
                                            retry_ttft)):
                                    logger.info(
                                        f"[{target}] ✅ 重试成功! "
                                        f"TTFT={retry_ttft:.0f}ms"
                                    )
                                else:
                                    logger.warning(
                                        f"[{target}] 重试仍异常 "
                                        f"(TTFT={retry_ttft:.0f}ms)，"
                                        f"保留结果"
                                    )
                                self.results[target].append(retry_result)
                            else:
                                self.results[target].append(result)

                        # 多轮测试: 强杀 APP 再冷启动
                        if round_num < self.config.benchmark.num_rounds - 1:
                            logger.info(
                                f"[{target}] 重置 APP (清除上下文)..."
                            )
                            bot.reset_app()
                            wait = self.config.benchmark.round_interval
                            logger.info(f"等待 {wait}s 后进行下一轮...")
                            time.sleep(wait)

                        # ── 单轮实时上报（含失败轮次）──
                        if self._cloud_uploader:
                            # 上报本轮新增的所有 results
                            new_results = self.results[target][
                                _round_start_idx:
                            ]
                            for r in new_results:
                                try:
                                    self._cloud_uploader.upload_round(
                                        r,
                                        target,
                                        round_num,
                                        node_id=self.config.node_id,
                                        node_region=self.config.node_region,
                                    )
                                except Exception as e:
                                    logger.warning(
                                        f"☁️ [{target}] Round {round_num}"
                                        f" 上报异常: {e}"
                                    )

                        round_num += 1

                except Exception as e:
                    logger.error(f"[{target}] 测试中断: {e}")
                finally:
                    bot.disconnect()

        finally:
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
@click.option("-n", "--rounds", default=None, type=int, help="测试轮次")
@click.option("--inspect", default=None, help="调试模式：获取指定 APP 的 UI 元素树")
def main(config_path, targets, rounds, inspect):
    """🎙️ Voice Latency Benchmark — AI 语音通话延迟评测工具"""

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
    report_files = runner.run(target_list)

    logger.info(f"\n🏁 测试完成！报告文件:")
    for fmt, path in report_files.items():
        logger.info(f"  {fmt}: {path}")


if __name__ == "__main__":
    main()
