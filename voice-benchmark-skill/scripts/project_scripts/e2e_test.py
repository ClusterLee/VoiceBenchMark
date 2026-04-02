#!/usr/bin/env python3
"""
端到端联调脚本 — 验证 Appium 自动化能否正常控制元宝和豆包

Usage:
    python3 scripts/e2e_test.py doubao    # 只测豆包
    python3 scripts/e2e_test.py yuanbao   # 只测元宝
    python3 scripts/e2e_test.py           # 两个都测
"""
import sys
import time
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from loguru import logger
from src.config import load_config

logger.remove()
logger.add(sys.stderr, level="DEBUG", format="{time:HH:mm:ss} | {level} | {message}")


def test_doubao(config):
    """测试豆包自动化流程"""
    from src.automation.doubao_bot import DoubaoBot

    logger.info("=" * 60)
    logger.info("🫘 开始测试豆包自动化")
    logger.info("=" * 60)

    bot = DoubaoBot(config.device, config.apps.get("doubao"))

    try:
        # 1. 连接
        logger.info("[1/5] 连接 Appium...")
        bot.connect()
        logger.info("✅ 连接成功")

        # 2. 导航到语音通话
        logger.info("[2/5] 导航到语音通话界面...")
        bot.navigate_to_voice_chat()
        logger.info("✅ 已进入语音通话界面")

        # 3. 等待通话就绪
        logger.info("[3/5] 等待通话就绪...")
        start_time = bot.start_voice_call()
        logger.info(f"✅ 通话已开始 T={start_time:.4f}")

        # 4. 检查状态
        logger.info("[4/5] 检查通话状态...")
        status = bot.get_call_status()
        logger.info(f"   当前状态: 「{status}」")
        logger.info(f"   AI 在说话: {bot.is_ai_responding()}")
        logger.info(f"   AI 说完了: {bot.is_ai_finished()}")

        # 截图
        bot.take_screenshot("/tmp/e2e_doubao_call.png")
        logger.info("   截图: /tmp/e2e_doubao_call.png")

        # 等3秒看看
        time.sleep(3)
        status2 = bot.get_call_status()
        logger.info(f"   3秒后状态: 「{status2}」")

        # 5. 挂断
        logger.info("[5/5] 挂断通话...")
        bot.end_voice_call()
        logger.info("✅ 通话已结束")

        bot.take_screenshot("/tmp/e2e_doubao_after.png")
        logger.info("   截图: /tmp/e2e_doubao_after.png")

        return True

    except Exception as e:
        logger.error(f"❌ 豆包测试失败: {e}")
        import traceback
        traceback.print_exc()
        return False

    finally:
        bot.disconnect()


def test_yuanbao(config):
    """测试元宝自动化流程"""
    from src.automation.yuanbao_bot import YuanbaoBot

    logger.info("=" * 60)
    logger.info("🟤 开始测试元宝自动化")
    logger.info("=" * 60)

    bot = YuanbaoBot(config.device, config.apps.get("yuanbao"))

    try:
        # 1. 连接
        logger.info("[1/5] 连接 Appium...")
        bot.connect()
        logger.info("✅ 连接成功")

        # 2. 导航到语音通话
        logger.info("[2/5] 导航到语音通话界面...")
        bot.navigate_to_voice_chat()
        logger.info("✅ 已进入语音通话界面")

        # 3. 开始通话
        logger.info("[3/5] 开始通话...")
        start_time = bot.start_voice_call()
        logger.info(f"✅ 通话已开始 T={start_time:.4f}")

        # 4. 检查状态
        logger.info("[4/5] 检查通话状态...")
        logger.info(f"   AI 在说话: {bot.is_ai_responding()}")

        # 截图
        bot.take_screenshot("/tmp/e2e_yuanbao_call.png")
        logger.info("   截图: /tmp/e2e_yuanbao_call.png")

        time.sleep(3)

        # 5. 挂断
        logger.info("[5/5] 挂断通话...")
        bot.end_voice_call()
        logger.info("✅ 通话已结束")

        bot.take_screenshot("/tmp/e2e_yuanbao_after.png")
        logger.info("   截图: /tmp/e2e_yuanbao_after.png")

        return True

    except Exception as e:
        logger.error(f"❌ 元宝测试失败: {e}")
        import traceback
        traceback.print_exc()
        return False

    finally:
        bot.disconnect()


def main():
    config = load_config()

    targets = sys.argv[1:] if len(sys.argv) > 1 else ["doubao", "yuanbao"]

    results = {}
    for target in targets:
        if target == "doubao":
            results["doubao"] = test_doubao(config)
        elif target == "yuanbao":
            results["yuanbao"] = test_yuanbao(config)
        else:
            logger.error(f"未知目标: {target}")

        # 两个测试之间等一下
        if len(targets) > 1:
            time.sleep(3)

    logger.info("")
    logger.info("=" * 60)
    logger.info("📊 联调结果汇总")
    logger.info("=" * 60)
    for name, ok in results.items():
        icon = "✅" if ok else "❌"
        logger.info(f"  {icon} {name}")


if __name__ == "__main__":
    main()
