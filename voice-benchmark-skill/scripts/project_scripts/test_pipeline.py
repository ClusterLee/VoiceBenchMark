#!/usr/bin/env python3
"""
端到端管线测试 v2 — 完整的自动化 + gRPC 音频注入 + 延迟测量

Usage:
    python3 scripts/test_pipeline.py doubao
    python3 scripts/test_pipeline.py yuanbao
    python3 scripts/test_pipeline.py doubao yuanbao
"""
import sys
import time
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from loguru import logger
from src.config import load_config
from src.audio.virtual_mic import EmulatorMicInjector

logger.remove()
logger.add(sys.stderr, level="INFO", format="{time:HH:mm:ss.SSS} | {level:<5} | {message}")


# 默认使用 Edge TTS 生成的高质量中文语音
DEFAULT_WAV = "assets/audio/hello_edge_long_48k.wav"


def test_doubao(config, injector):
    """测试豆包管线"""
    from src.automation.doubao_bot import DoubaoBot

    bot = DoubaoBot(config.device, config.apps.get("doubao"))
    wav = os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
        DEFAULT_WAV,
    )

    logger.info("=" * 60)
    logger.info("🫘 豆包端到端管线测试")
    logger.info("=" * 60)

    try:
        # 连接
        bot.connect()

        # 导航到通话
        bot.navigate_to_voice_chat()
        bot.start_voice_call()
        time.sleep(3)
        logger.info(f"初始状态: 「{bot.get_call_status()}」")

        # 注入音频
        logger.info(f"注入音频: {os.path.basename(wav)}")
        t_inject = injector.inject_wav(wav)

        # 等一下让 APP 处理
        time.sleep(1)

        # 监测状态变化
        seen = set()
        ai_start = 0
        ai_end = 0
        for i in range(80):  # 最多 24 秒
            status = bot.get_call_status()
            elapsed = time.time() - t_inject

            if status not in seen:
                seen.add(status)
                logger.info(f"  [{elapsed:.1f}s] 状态: 「{status}」")

            responding = bot.is_ai_responding()
            finished = bot.is_ai_finished()

            if not ai_start and responding:
                ai_start = time.time()
                e2e = (ai_start - t_inject) * 1000
                logger.info(f"  [{elapsed:.1f}s] 🤖 AI 开始回复! (E2E={e2e:.0f}ms)")

            if ai_start and finished:
                ai_end = time.time()
                dur = (ai_end - ai_start) * 1000
                logger.info(f"  [{elapsed:.1f}s] ✅ AI 回复完毕 (时长={dur:.0f}ms)")
                break

            time.sleep(0.3)

        # 结果
        if ai_start:
            e2e_ms = (ai_start - t_inject) * 1000
            logger.info(f"📊 豆包 E2E 延迟: {e2e_ms:.0f}ms")
            if ai_end:
                total = (ai_end - ai_start) * 1000
                logger.info(f"📊 豆包 AI 回复时长: {total:.0f}ms")
        else:
            logger.warning("⚠️ 未检测到 AI 回复")

        time.sleep(2)
        bot.end_voice_call()

        return {
            "target": "doubao",
            "success": ai_start > 0,
            "e2e_ms": (ai_start - t_inject) * 1000 if ai_start else None,
            "ai_duration_ms": (ai_end - ai_start) * 1000 if ai_end else None,
        }

    except Exception as e:
        logger.error(f"❌ 豆包测试失败: {e}")
        import traceback
        traceback.print_exc()
        return {"target": "doubao", "success": False, "error": str(e)}

    finally:
        bot.disconnect()


def test_yuanbao(config, injector):
    """测试元宝管线"""
    from src.automation.yuanbao_bot import YuanbaoBot

    bot = YuanbaoBot(config.device, config.apps.get("yuanbao"))
    wav = os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
        DEFAULT_WAV,
    )

    logger.info("=" * 60)
    logger.info("🟤 元宝端到端管线测试")
    logger.info("=" * 60)

    try:
        bot.connect()
        bot.navigate_to_voice_chat()
        bot.start_voice_call()
        time.sleep(3)

        # 注入
        logger.info(f"注入音频: {os.path.basename(wav)}")
        t_inject = injector.inject_wav(wav)
        time.sleep(1)

        # 元宝没有精确的文字状态，用 is_ai_responding 检测
        ai_start = 0
        ai_end = 0
        for i in range(80):
            elapsed = time.time() - t_inject
            responding = bot.is_ai_responding()

            if not ai_start and responding:
                ai_start = time.time()
                e2e = (ai_start - t_inject) * 1000
                logger.info(f"  [{elapsed:.1f}s] 🤖 AI 开始回复! (E2E={e2e:.0f}ms)")

            if ai_start and not responding:
                ai_end = time.time()
                dur = (ai_end - ai_start) * 1000
                logger.info(f"  [{elapsed:.1f}s] ✅ AI 回复完毕 (时长={dur:.0f}ms)")
                break

            if elapsed > 25:
                logger.warning("超时")
                break

            time.sleep(0.3)

        if ai_start:
            e2e_ms = (ai_start - t_inject) * 1000
            logger.info(f"📊 元宝 E2E 延迟: {e2e_ms:.0f}ms")
            if ai_end:
                total = (ai_end - ai_start) * 1000
                logger.info(f"📊 元宝 AI 回复时长: {total:.0f}ms")
        else:
            logger.warning("⚠️ 未检测到 AI 回复")

        time.sleep(2)
        bot.end_voice_call()

        return {
            "target": "yuanbao",
            "success": ai_start > 0,
            "e2e_ms": (ai_start - t_inject) * 1000 if ai_start else None,
            "ai_duration_ms": (ai_end - ai_start) * 1000 if ai_end else None,
        }

    except Exception as e:
        logger.error(f"❌ 元宝测试失败: {e}")
        import traceback
        traceback.print_exc()
        return {"target": "yuanbao", "success": False, "error": str(e)}

    finally:
        bot.disconnect()


def main():
    config = load_config()
    targets = sys.argv[1:] if len(sys.argv) > 1 else ["doubao"]

    # gRPC 注入器（共享）
    injector = EmulatorMicInjector(grpc_port=8554)
    injector.connect()

    results = []
    for target in targets:
        if target == "doubao":
            results.append(test_doubao(config, injector))
        elif target == "yuanbao":
            results.append(test_yuanbao(config, injector))
        else:
            logger.error(f"未知: {target}")

        if len(targets) > 1:
            time.sleep(3)

    injector.disconnect()

    # 汇总
    logger.info("")
    logger.info("=" * 60)
    logger.info("📊 管线测试结果汇总")
    logger.info("=" * 60)
    for r in results:
        icon = "✅" if r.get("success") else "❌"
        name = r["target"]
        e2e = r.get("e2e_ms")
        dur = r.get("ai_duration_ms")
        if e2e:
            logger.info(f"  {icon} {name}: E2E={e2e:.0f}ms, AI回复={dur:.0f}ms" if dur else
                       f"  {icon} {name}: E2E={e2e:.0f}ms")
        else:
            logger.info(f"  {icon} {name}: {r.get('error', '未响应')}")


if __name__ == "__main__":
    main()
