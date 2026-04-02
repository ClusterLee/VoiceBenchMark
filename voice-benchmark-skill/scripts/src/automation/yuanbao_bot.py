"""
腾讯元宝 APP 自动化

基于 2026-03-30 Appium Inspector 校准的真实元素定位

元宝 v2.62.0 UI 结构:
- 主界面：Compose UI，顶栏按钮无 resource-id
- 电话图标：右上角第二个按钮 bounds=[794,89][920,215]
- 通话界面：
  - 标题 "Free Conversation" 可切换角色
  - 底部4个按钮（无id/desc，用坐标）:
    [63,2001][231,2169]  摄像头
    [325,2001][493,2169]  麦克风
    [587,2001][755,2169]  文字输入
    [849,2001][1017,2169] 挂断（红色）
  - 状态文案: "Can't hear you..." / "Enable"
  - AI 动态球在中间区域
  - 对话文本：默认显示，包含用户和AI的语音转文字

检测策略 (2026-03-30 v6):
  纯文本检测模式：只有 AI 回复文本出现才触发 ai_responding。
  状态文案仅用于辅助判断回复结束。
  主信号：对话文本变化（text_change）
  辅信号：状态文案用于结束检测
"""
import time
import re
import subprocess
from typing import List, Optional, Set
from appium.webdriver.common.appiumby import AppiumBy
from loguru import logger

from .base_bot import BaseBot
from ..config import AppConfig, DeviceConfig


# 元宝 UI 坐标常量（屏幕 1080x2400, Android 11 Pixel 6）
class YuanbaoCoords:
    """元宝 UI 元素坐标"""
    # 主界面
    PHONE_ICON = (857, 152)          # 电话图标 [794,89][920,215]
    MUTE_ICON = (734, 152)           # 静音图标 [673,89][794,215]
    SCAN_ICON = (978, 152)           # 扫描图标 [951,127][1004,177]

    # 通话界面底部按钮
    CALL_CAMERA = (147, 2085)        # 摄像头 [63,2001][231,2169]
    CALL_MIC = (409, 2085)           # 麦克风 [325,2001][493,2169]
    CALL_TEXT = (671, 2085)          # 文字输入 [587,2001][755,2169]
    CALL_HANGUP = (933, 2085)        # 挂断 [849,2001][1017,2169]

    # Enable 麦克风按钮
    ENABLE_MIC = (874, 1896)         # [806,1833][941,1959]


# 元宝通话界面的固定/系统文案（这些不是 AI 回复内容）
YUANBAO_SYSTEM_TEXTS = {
    "Free Conversation",
    "AI-generated content",
    "Can't hear you...",
    "Enable",
    "Mic Disabled",
    "Not Now",
    "Yuanbao",
    "Chat",
    # 通话状态文案（会在不同阶段出现）
    "Listening...",
    "Thinking",
    "Thinking...",
    "Speak or click to interrupt",
    "Speaking...",
    "Connecting...",
    "Connected",
}

# 元宝推荐话题前缀（通话界面下方显示的推荐问题）
# 这些以 emoji 开头，在 baseline 中会被包含，但需要额外过滤
YUANBAO_TOPIC_PREFIXES = ("👍", "🏠", "🗣", "💡", "⏱", "💬", "🎯", "📚", "🌍", "🔥")


class YuanbaoBot(BaseBot):
    """腾讯元宝 APP 自动化控制

    检测策略：纯文本检测（text_change），AI 文本出现 = ai_responding。
    状态文案仅用于结束检测。
    """

    def __init__(self, device_config: DeviceConfig, app_config: AppConfig = None):
        if app_config is None:
            app_config = AppConfig(
                name="yuanbao",
                package="com.tencent.hunyuan.app.chat",
                activity=".biz.login.v2.HYLoginMainActivity",
                response_timeout=30.0,
            )
        super().__init__(app_config, device_config)

        # 文本检测状态
        self._baseline_texts: Set[str] = set()   # 注入音频前的文本快照
        self._last_ai_text: str = ""               # 上次检测到的 AI 文本
        self._ai_text_stable_count: int = 0        # AI 文本连续不变次数
        self._ai_responding: bool = False           # AI 是否正在回复
        self._ai_finished: bool = False             # AI 是否回复完毕
        self._user_text: str = ""                   # 用户语音转写文本（检测到后锁定）
        self._status_phase: str = "idle"            # 状态阶段: idle/listening/thinking/responding/finished

    def _tap(self, x: int, y: int, desc: str = ""):
        """点击坐标"""
        if desc:
            logger.debug(f"[元宝] 点击 {desc} ({x}, {y})")
        self.driver.tap([(x, y)])

    def _get_all_text_elements(self) -> List[str]:
        """获取通话界面上所有文本内容

        遍历 UI 树中所有带 text 属性的元素，返回非空文本列表。
        """
        texts = []
        try:
            # 获取所有 TextView 和可能包含文本的元素
            elements = self.driver.find_elements(
                AppiumBy.XPATH,
                '//*[@text!=""]'
            )
            for el in elements:
                try:
                    t = el.text
                    if t and t.strip():
                        texts.append(t.strip())
                except Exception:
                    pass
        except Exception as e:
            logger.debug(f"[元宝] 获取文本元素异常: {e}")
        return texts

    def _get_conversation_texts(self) -> List[str]:
        """获取通话界面上的对话文本（过滤掉系统/固定文案）

        Returns:
            仅包含用户语音和 AI 回复的文本列表
        """
        all_texts = self._get_all_text_elements()
        conv_texts = []
        for t in all_texts:
            # 排除已知的系统/固定文案
            if t in YUANBAO_SYSTEM_TEXTS:
                continue
            # 排除很短的纯数字/符号
            if len(t) <= 1:
                continue
            # 排除已在 baseline 中的文本（注入音频前就存在的）
            if t in self._baseline_texts:
                continue
            conv_texts.append(t)
        return conv_texts

    def snapshot_baseline_texts(self):
        """拍摄注入音频前的文本快照

        在注入音频之前调用，记录当前界面上所有文本。
        之后检测到的新文本就是用户语音转写和 AI 回复。
        """
        all_texts = self._get_all_text_elements()
        self._baseline_texts = set(all_texts)
        self._last_ai_text = ""
        self._ai_text_stable_count = 0
        self._ai_responding = False
        self._ai_finished = False
        self._user_text = ""
        self._status_phase = "idle"
        self._thinking_start = 0
        logger.info(f"[元宝] 文本快照已拍摄，baseline={len(self._baseline_texts)} 条")
        logger.debug(f"[元宝] baseline: {self._baseline_texts}")

    def _get_status_text_fast(self) -> str:
        """快速获取当前通话状态文案（优化版）

        用 UiAutomator 选择器精确匹配已知的状态文案关键词，
        避免 XPath 全树遍历（全树遍历单次 3-7 秒，这个 < 200ms）。

        状态文案流转：
        Listening... → Thinking → Speak or click to interrupt → (idle)
        """
        status_keywords = [
            ("Listening", "Listening..."),
            ("Thinking", "Thinking"),
            ("interrupt", "Speak or click to interrupt"),
            ("Speaking", "Speaking..."),
            ("Connecting", "Connecting..."),
            ("Can't hear", "Can't hear you..."),
        ]
        for keyword, display in status_keywords:
            try:
                # UiAutomator textContains 选择器 —— 比 XPath 快 10-50x
                el = self.driver.find_element(
                    AppiumBy.ANDROID_UIAUTOMATOR,
                    f'new UiSelector().textContains("{keyword}")'
                )
                if el:
                    return el.text
            except Exception:
                continue
        return ""

    def _get_conversation_texts_fast(self) -> List[str]:
        """快速获取新对话文本（优化版）

        只在需要时调用（thinking/responding 阶段），不在每次轮询都全树遍历。
        """
        return self._get_conversation_texts()

    def _get_status_text(self) -> str:
        """获取当前通话界面状态文案（保留旧版作为 fallback）

        元宝的状态文案流转：
        Listening... → Thinking → Speak or click to interrupt → (idle)
        """
        all_texts = self._get_all_text_elements()
        for t in all_texts:
            if t in ("Listening...", "Thinking", "Thinking...",
                      "Speak or click to interrupt", "Speaking...",
                      "Connecting...", "Connected", "Can't hear you..."):
                return t
        return ""

    def detect_ai_response_state(self) -> dict:
        """检测 AI 回复状态（v6 —— 纯文本检测，统一 text_change 方法）

        核心逻辑：
        只有 AI 回复文本出现才触发 ai_responding = True。
        状态文案仅用于辅助结束检测，不触发 ai_responding。

        Returns:
            {
                "has_new_text": bool,
                "new_texts": list,
                "ai_responding": bool,
                "ai_finished": bool,
                "text_stable_count": int,
                "status_text": str,
                "status_phase": str,
            }
        """
        # ── 通道1：文本变化（唯一触发通道）──
        t0 = time.time()
        new_texts = self._get_conversation_texts()
        t1 = time.time()
        current_text = " ".join(new_texts)
        has_new = len(new_texts) > 0

        # ── 通道2：状态文案（仅用于结束检测）──
        status = self._get_status_text_fast()
        t2 = time.time()
        prev_phase = self._status_phase

        # 前几次轮询输出计时诊断
        if not hasattr(self, '_poll_count'):
            self._poll_count = 0
        self._poll_count += 1
        if self._poll_count <= 5:
            logger.debug(
                f"[元宝] 轮询#{self._poll_count} 计时: "
                f"texts={int((t1-t0)*1000)}ms, "
                f"status={int((t2-t1)*1000)}ms, "
                f"total={int((t2-t0)*1000)}ms"
            )

        # ── 用户文本锁定 ──
        if has_new and not self._user_text:
            if len(new_texts) == 1:
                self._user_text = new_texts[0]
                logger.debug(f"[元宝] 锁定用户文本: {self._user_text[:50]}")
            else:
                sorted_by_len = sorted(new_texts, key=len)
                self._user_text = sorted_by_len[0]
                logger.info(f"[元宝] 多文本同时出现! 锁定最短为用户文本: "
                           f"\"{self._user_text}\"，其余视为 AI 回复: "
                           f"{sorted_by_len[1:]}")

        # ── 检测 AI 回复文本 ──
        ai_texts = []
        if has_new and self._user_text:
            for t in new_texts:
                if t.strip() != self._user_text.strip():
                    ai_texts.append(t)

        has_ai_text = len(ai_texts) > 0

        # ── 主信号：AI 文本出现 = ai_responding（唯一触发）──
        if has_ai_text and not self._ai_responding:
            self._ai_responding = True
            self._status_phase = "responding"
            logger.info(f"[元宝] 🤖 AI 开始回复 (文本通道: \"{ai_texts[0][:60]}\")")

        # ── 辅助：状态文案仅用于结束检测 ──
        if "Listening" in status:
            if prev_phase == "responding":
                self._ai_finished = True
                self._status_phase = "finished"
                logger.info("[元宝] 状态: responding → finished (回到 Listening)")
            elif prev_phase == "thinking":
                # thinking → listening = responding 被跳过，但不触发 ai_responding
                if self._ai_responding:
                    self._ai_finished = True
                    self._status_phase = "finished"
                    logger.info("[元宝] 状态: thinking → finished")
                else:
                    self._status_phase = "listening"
            elif not self._ai_responding:
                self._status_phase = "listening"

        elif "Thinking" in status:
            self._status_phase = "thinking"
            if not hasattr(self, '_thinking_start') or self._thinking_start == 0:
                self._thinking_start = time.time()
                logger.debug(f"[元宝] Thinking 开始 T={self._thinking_start:.4f}")

        elif "interrupt" in status or "Speaking" in status:
            # 不触发 ai_responding，仅更新 phase
            if self._status_phase != "responding":
                logger.debug(f"[元宝] 状态文案: {prev_phase} → responding (不触发 ai_responding)")
            self._status_phase = "responding"
            self._ai_finished = False

        elif status == "" and self._status_phase == "responding":
            self._ai_text_stable_count += 1
            if self._ai_text_stable_count >= 3:
                self._ai_finished = True
                self._status_phase = "finished"
                logger.info("[元宝] 状态: responding → finished")

        elif "Can't hear you" in status:
            if self._status_phase in ("responding", "thinking"):
                self._ai_finished = True
                self._status_phase = "finished"
                logger.info(f"[元宝] 状态: {prev_phase} → finished (Can't hear you)")

        # ── 文本稳定计数（结束检测兜底）──
        current_ai_text = " ".join(ai_texts)
        if self._ai_responding:
            if current_ai_text != self._last_ai_text:
                self._ai_text_stable_count = 0
                self._last_ai_text = current_ai_text
            else:
                self._ai_text_stable_count += 1
                if self._status_phase == "responding" and "Listening" in status:
                    if self._ai_text_stable_count >= 5:
                        self._ai_finished = True
                        self._status_phase = "finished"
                        logger.info("[元宝] 全双工: 文本稳定，AI 回复完毕")

        return {
            "has_new_text": has_new,
            "new_texts": new_texts,
            "ai_responding": self._ai_responding,
            "ai_finished": self._ai_finished,
            "text_stable_count": self._ai_text_stable_count,
            "status_text": status,
            "status_phase": self._status_phase,
        }

    def _is_in_call_screen(self) -> bool:
        """检测是否在通话界面

        使用 Activity 名称判断（最可靠），因为 "AI-generated content"
        文案在主界面上也会出现（对话历史）。
        """
        try:
            activity = self.driver.current_activity
            return "VoiceCall" in activity or "voicecall" in activity.lower()
        except Exception:
            # Activity 查询失败，降级到文案检测
            try:
                # 通话界面特有的 "Free Conversation" 标题
                self.find_element(
                    AppiumBy.XPATH,
                    '//*[@text="Free Conversation"]',
                    timeout=2,
                )
                return True
            except Exception:
                return False

    def _is_in_main_screen(self) -> bool:
        """检测是否在主界面"""
        try:
            self.find_element(
                AppiumBy.ID,
                "com.tencent.hunyuan.app.chat:id/edConversationInput",
                timeout=3,
            )
            return True
        except Exception:
            # 尝试检测 Yuanbao 文本
            try:
                self.find_element(
                    AppiumBy.XPATH,
                    '//*[@text="Yuanbao"]',
                    timeout=2,
                )
                return True
            except Exception:
                return False

    def _ensure_app_foreground(self):
        """确保元宝 APP 在前台"""
        try:
            self.driver.activate_app(self.app_config.package)
            time.sleep(3)
            logger.info("[元宝] APP 已激活到前台")
        except Exception as e:
            logger.warning(f"[元宝] activate_app 失败: {e}，尝试用 ADB...")
            try:
                subprocess.run(
                    ["adb", "-s", self.device_config.device_name,
                     "shell", "am", "start", "-n",
                     f"{self.app_config.package}/{self.app_config.activity}"],
                    capture_output=True, timeout=10
                )
                time.sleep(3)
            except Exception:
                pass

    def _handle_disconnect_dialog(self):
        """处理通话超时断开弹窗

        元宝通话长时间无操作会弹出：
        'The voice call is disconnected.'
        'No action performed for a long time. Confirm to log out?'
        [Exit] [Restore]
        """
        try:
            self.find_element(
                AppiumBy.XPATH,
                '//*[contains(@text, "voice call is disconnected") or '
                'contains(@text, "No action performed")]',
                timeout=2,
            )
            logger.info("[元宝] 检测到通话断开弹窗，点击 Exit...")
            try:
                exit_btn = self.find_element(
                    AppiumBy.XPATH,
                    '//*[@text="Exit"]',
                    timeout=2,
                )
                exit_btn.click()
            except Exception:
                # 用坐标点击 Exit 按钮位置
                self._tap(341, 1305, "Exit")
            time.sleep(3)
            logger.info("[元宝] 已关闭断开弹窗")
        except Exception:
            pass

    def navigate_to_voice_chat(self):
        """
        导航到语音通话界面

        路径：主界面 → 点击右上角电话图标 → 进入通话界面
        会自动处理通话超时断开弹窗。
        """
        logger.info("[元宝] 导航到语音通话界面...")

        # 处理可能存在的通话断开弹窗
        self._handle_disconnect_dialog()

        # 如果已经在通话界面，直接返回
        if self._is_in_call_screen():
            logger.info("[元宝] 已在通话界面")
            return

        # 确保元宝在前台
        self._ensure_app_foreground()

        # 处理可能在 activate 后出现的弹窗
        self._handle_disconnect_dialog()

        # 确保在主界面
        if not self._is_in_main_screen():
            logger.info("[元宝] 不在主界面，尝试导航回去...")
            for _ in range(3):
                self.driver.back()
                time.sleep(1)
                self._handle_disconnect_dialog()
                if self._is_in_main_screen():
                    break
            try:
                self.click_element(
                    AppiumBy.XPATH,
                    '//android.widget.TextView[@text="Chat"]',
                    timeout=5,
                )
                time.sleep(2)
            except Exception:
                logger.debug("[元宝] Chat tab 未找到，可能已在主界面")

        time.sleep(2)

        # 点击右上角电话图标进入语音通话
        logger.info("[元宝] 点击电话图标...")
        self._tap(*YuanbaoCoords.PHONE_ICON, "电话图标")
        time.sleep(6)

        if self._is_in_call_screen():
            logger.info("[元宝] ✅ 已进入语音通话界面")
        else:
            logger.warning("[元宝] 第一次点击未生效，重试...")
            from selenium.webdriver.common.action_chains import ActionChains
            from selenium.webdriver.common.actions import interaction
            from selenium.webdriver.common.actions.action_builder import ActionBuilder
            from selenium.webdriver.common.actions.pointer_input import PointerInput

            actions = ActionChains(self.driver)
            actions.w3c_actions = ActionBuilder(
                self.driver,
                mouse=PointerInput(interaction.POINTER_TOUCH, "touch")
            )
            actions.w3c_actions.pointer_action.move_to_location(
                YuanbaoCoords.PHONE_ICON[0], YuanbaoCoords.PHONE_ICON[1]
            )
            actions.w3c_actions.pointer_action.pointer_down()
            actions.w3c_actions.pointer_action.pause(0.1)
            actions.w3c_actions.pointer_action.release()
            actions.perform()

            time.sleep(6)

            if not self._is_in_call_screen():
                raise RuntimeError("[元宝] 无法进入语音通话界面")

        self._handle_mic_permission()

    def _handle_mic_permission(self):
        """处理麦克风权限弹窗"""
        try:
            self.find_element(
                AppiumBy.XPATH,
                '//*[contains(@text, "Mic Disabled")]',
                timeout=3,
            )
            logger.info("[元宝] 检测到麦克风权限弹窗，点击 Not Now")
            try:
                self.click_element(
                    AppiumBy.XPATH,
                    '//*[@text="Not Now"]',
                    timeout=3,
                )
            except Exception:
                self._tap(341, 1400, "Not Now")
            time.sleep(1)
        except Exception:
            logger.debug("[元宝] 无麦克风权限弹窗")

        try:
            self.find_element(
                AppiumBy.XPATH,
                '//*[@text="Enable"]',
                timeout=2,
            )
            logger.info("[元宝] 点击 Enable 开启麦克风")
            self._tap(*YuanbaoCoords.ENABLE_MIC, "Enable")
            time.sleep(1)
        except Exception:
            pass

    def start_voice_call(self) -> float:
        """
        开始语音通话

        元宝进入通话界面后自动开始，无需额外点击。

        Returns:
            通话开始时间戳
        """
        logger.info("[元宝] 开始语音通话...")

        # 通话已在 navigate_to_voice_chat 中自动开始
        time.sleep(2)

        # 拍摄文本 baseline（在注入音频之前）
        self.snapshot_baseline_texts()

        start_time = time.time()
        logger.info(f"[元宝] 通话已开始 (T={start_time:.4f})")
        return start_time

    def end_voice_call(self):
        """结束语音通话"""
        logger.info("[元宝] 结束语音通话...")

        if self._is_in_call_screen():
            self._tap(*YuanbaoCoords.CALL_HANGUP, "挂断")
            time.sleep(2)
        else:
            logger.debug("[元宝] 不在通话界面，可能已结束")

        time.sleep(1)
        if self._is_in_main_screen():
            logger.info("[元宝] ✅ 通话已结束，回到主界面")
        else:
            self.driver.back()
            time.sleep(1)
            logger.info("[元宝] 通话已结束")

    def is_ai_responding(self) -> bool:
        """检测 AI 是否正在回复（基于状态文案信号）"""
        state = self.detect_ai_response_state()
        return state["ai_responding"]

    def is_ai_finished(self) -> bool:
        """检测 AI 是否回复完毕"""
        state = self.detect_ai_response_state()
        return state["ai_finished"]

    def get_ui_elements_dump(self) -> str:
        """获取当前页面的 UI 元素树（调试用）"""
        if self.driver:
            return self.driver.page_source
        return ""

    def capture_element_info(self, save_path: str = None):
        """捕获并保存当前页面的元素信息"""
        source = self.get_ui_elements_dump()
        if save_path:
            with open(save_path, "w") as f:
                f.write(source)
            logger.info(f"[元宝] UI 元素树已保存: {save_path}")
        return source
