#!/usr/bin/env python3
"""
文本检测调试脚本

验证元宝/豆包通话界面上的文本元素识别。
需要先手动进入通话界面，然后运行此脚本观察文本检测结果。

Usage:
    python3 scripts/test_text_detection.py yuanbao   # 测试元宝文本检测
    python3 scripts/test_text_detection.py doubao     # 测试豆包文本检测
    python3 scripts/test_text_detection.py yuanbao --inject  # 注入音频并监测
"""
import sys
import os
import time
import argparse

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from loguru import logger
from src.config import load_config

logger.remove()
logger.add(sys.stderr, level="DEBUG", format="{time:HH:mm:ss.SSS} | {level:7s} | {message}")


def test_yuanbao_text_detection(config, inject_audio=False):
    """测试元宝通话界面文本检测"""
    from src.automation.yuanbao_bot import YuanbaoBot

    logger.info("=" * 60)
    logger.info("🟤 元宝文本检测测试")
    logger.info("=" * 60)

    bot = YuanbaoBot(config.device, config.apps.get("yuanbao"))

    try:
        bot.connect()
        logger.info("✅ 连接成功")

        # 导航到通话界面
        bot.navigate_to_voice_chat()
        logger.info("✅ 已进入通话界面")

        # 等待通话稳定
        time.sleep(3)

        # Step 1: 获取所有文本元素
        logger.info("\n--- 步骤1: 获取所有文本元素 ---")
        all_texts = bot._get_all_text_elements()
        for i, t in enumerate(all_texts):
            logger.info(f"  [{i}] \"{t}\"")
        logger.info(f"  共 {len(all_texts)} 个文本元素")

        # Step 2: 拍摄 baseline
        logger.info("\n--- 步骤2: 拍摄文本 baseline ---")
        bot.snapshot_baseline_texts()

        # Step 3: 获取过滤后的对话文本
        logger.info("\n--- 步骤3: 对话文本（过滤系统文案后）---")
        conv = bot._get_conversation_texts()
        if conv:
            for t in conv:
                logger.info(f"  对话: \"{t}\"")
        else:
            logger.info("  （无对话文本 — 预期正确，还没开始说话）")

        # Step 4: 可选 — 注入音频并监测文本变化
        if inject_audio:
            logger.info("\n--- 步骤4: 注入音频并监测文本变化 ---")
            from src.audio.virtual_mic import EmulatorMicInjector
            from pathlib import Path

            injector = EmulatorMicInjector(grpc_host="localhost", grpc_port=8554)
            injector.connect()

            audio_path = str(Path(__file__).parent.parent / "assets" / "audio" / "hello_edge_long_48k.wav")
            logger.info(f"注入音频: {audio_path}")
            t_inject = injector.inject_wav(audio_path)

            # 持续监测 30 秒
            logger.info("开始监测文本变化（30秒）...")
            ai_start_time = 0
            for i in range(150):  # 30s @ 200ms
                elapsed = time.time() - t_inject
                state = bot.detect_ai_response_state()

                phase = state.get("status_phase", "")
                status = state.get("status_text", "")

                # 只在有变化时输出
                if state["has_new_text"] or state["ai_responding"] or state["ai_finished"] or phase not in ("idle", ""):
                    logger.info(
                        f"  [{elapsed:5.1f}s] "
                        f"阶段={phase}, "
                        f"状态=\"{status}\", "
                        f"AI回复={state['ai_responding']}, "
                        f"AI完毕={state['ai_finished']}, "
                        f"稳定={state['text_stable_count']}"
                    )
                    if state["new_texts"]:
                        for t in state["new_texts"][:3]:
                            logger.info(f"         \"{t[:60]}\"")

                    # 标记 AI 开始回复的精确时间
                    if state["ai_responding"] and not ai_start_time:
                        ai_start_time = time.time()
                        e2e = (ai_start_time - t_inject) * 1000
                        logger.info(f"  🤖 AI 开始回复！E2E = {e2e:.0f}ms")

                if state["ai_finished"]:
                    if ai_start_time:
                        dur = (time.time() - ai_start_time) * 1000
                        logger.info(f"  ✅ AI 回复完毕！语音时长 ≈ {dur:.0f}ms")
                    else:
                        logger.info("  ✅ 检测到 AI 回复完毕！")
                    break

                time.sleep(0.2)

            injector.disconnect()
        else:
            logger.info("\n提示: 使用 --inject 参数可注入音频并监测检测效果")

        # Step 5: UI dump
        logger.info("\n--- 步骤5: 保存 UI 元素树 ---")
        dump_path = "/tmp/yuanbao_text_test_dump.xml"
        bot.capture_element_info(dump_path)
        logger.info(f"  UI 元素树已保存: {dump_path}")

        # 截图
        bot.take_screenshot("/tmp/yuanbao_text_test.png")
        logger.info("  截图: /tmp/yuanbao_text_test.png")

        # 挂断
        time.sleep(2)
        bot.end_voice_call()
        logger.info("✅ 通话已结束")

        return True

    except Exception as e:
        logger.error(f"❌ 测试失败: {e}")
        import traceback
        traceback.print_exc()
        return False

    finally:
        bot.disconnect()


def test_doubao_text_detection(config, inject_audio=False):
    """测试豆包通话界面文本检测"""
    from src.automation.doubao_bot import DoubaoBot

    logger.info("=" * 60)
    logger.info("🫘 豆包文本检测测试")
    logger.info("=" * 60)

    bot = DoubaoBot(config.device, config.apps.get("doubao"))

    try:
        bot.connect()
        logger.info("✅ 连接成功")

        bot.navigate_to_voice_chat()
        logger.info("✅ 已进入通话界面")

        # 等待就绪
        start_time = bot.start_voice_call()
        logger.info(f"✅ 通话已就绪 T={start_time:.4f}")

        # Step 1: 获取状态文案
        logger.info("\n--- 步骤1: 状态文案 ---")
        status = bot.get_call_status()
        logger.info(f"  状态: \"{status}\"")

        # Step 2: 所有文本
        logger.info("\n--- 步骤2: 所有文本元素 ---")
        all_texts = bot._get_all_text_elements()
        for i, t in enumerate(all_texts):
            logger.info(f"  [{i}] \"{t}\"")

        # Step 3: 综合状态检测
        logger.info("\n--- 步骤3: 综合状态检测 ---")
        state = bot.detect_ai_response_state()
        logger.info(f"  状态文案: \"{state['status_text']}\"")
        logger.info(f"  信号: {state['status_signal']}")
        logger.info(f"  AI回复: {state['ai_responding']}")
        logger.info(f"  AI完毕: {state['ai_finished']}")

        # Step 4: 注入音频并监测
        if inject_audio:
            logger.info("\n--- 步骤4: 注入音频并监测 ---")
            from src.audio.virtual_mic import EmulatorMicInjector
            from pathlib import Path

            injector = EmulatorMicInjector(grpc_host="localhost", grpc_port=8554)
            injector.connect()

            audio_path = str(Path(__file__).parent.parent / "assets" / "audio" / "hello_edge_long_48k.wav")
            logger.info(f"注入音频: {audio_path}")
            t_inject = injector.inject_wav(audio_path)

            logger.info("开始监测（30秒）...")
            for i in range(150):
                elapsed = time.time() - t_inject
                state = bot.detect_ai_response_state()

                logger.info(
                    f"  [{elapsed:5.1f}s] "
                    f"状态=\"{state['status_text']}\", "
                    f"信号={state['status_signal']}, "
                    f"AI回复={state['ai_responding']}, "
                    f"AI完毕={state['ai_finished']}"
                )

                if state["ai_finished"] and state["status_signal"] in ("waiting", "listening"):
                    logger.info("  ✅ 检测到 AI 回复完毕！")
                    break

                time.sleep(0.2)

            injector.disconnect()

        # 截图
        bot.take_screenshot("/tmp/doubao_text_test.png")
        logger.info("截图: /tmp/doubao_text_test.png")

        time.sleep(2)
        bot.end_voice_call()
        logger.info("✅ 通话已结束")

        return True

    except Exception as e:
        logger.error(f"❌ 测试失败: {e}")
        import traceback
        traceback.print_exc()
        return False

    finally:
        bot.disconnect()


def main():
    parser = argparse.ArgumentParser(description="文本检测调试脚本")
    parser.add_argument("target", choices=["yuanbao", "doubao"], help="测试目标")
    parser.add_argument("--inject", action="store_true", help="注入音频并监测检测效果")
    args = parser.parse_args()

    config = load_config()

    if args.target == "yuanbao":
        test_yuanbao_text_detection(config, args.inject)
    else:
        test_doubao_text_detection(config, args.inject)


if __name__ == "__main__":
    main()
