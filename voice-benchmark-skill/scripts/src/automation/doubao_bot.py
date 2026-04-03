"""
豆包 APP 自动化

基于 2026-03-30 Appium Inspector 校准的真实元素定位

豆包 v12.6.0 UI 结构:
- 主界面 (对话页):
  - 标题: com.larus.nova:id/title text="豆包"
  - 电话图标: com.larus.nova:id/real_time_call desc="打电话"
  - TTS: com.larus.nova:id/tts desc="朗读已打开"
  - 设置: com.larus.nova:id/more desc="设置页"
  - 输入框: com.larus.nova:id/speak_normal text="按住说话"

- 通话界面 (realtime_call):
  - 根容器: com.larus.nova:id/realtime_call_root
  - 更多菜单: com.larus.nova:id/realtime_more desc="更多菜单"
  - 选择情景: com.larus.nova:id/scene_text text="选择情景"
  - 字幕: com.larus.nova:id/realtime_call_subtitle_button desc="显示字幕"
  - 状态文案: com.larus.nova:id/voice_call_status_text text="你可以开始说话"
  - 麦克风: com.larus.nova:id/realtime_call_mute desc="双击静音，关闭麦克风"
  - 共享屏幕: com.larus.nova:id/voice_call_share_screen desc="共享屏幕"
  - 视频通话: com.larus.nova:id/voice_call_video desc="视频通话"
  - 挂断: com.larus.nova:id/voice_call_hangup desc="挂断通话"
  - 声明: com.larus.nova:id/realtime_call_disclaimer text="内容由 AI 生成"

检测策略 (2026-03-30 v3):
  纯文本检测模式：只有 AI 回复文本出现才触发 ai_responding。
  状态文案仅用于辅助判断回复结束。
  主信号：字幕区文本变化（text_change）
  辅信号：状态文案用于结束检测
"""
import time
from typing import Optional, Set, List
from appium.webdriver.common.appiumby import AppiumBy
from loguru import logger

from .base_bot import BaseBot
from ..config import AppConfig, DeviceConfig


class DoubaoBot(BaseBot):
    """豆包 APP 自动化控制

    检测策略：纯文本检测（text_change），AI 文本出现 = ai_responding。
    状态文案仅用于结束检测。
    """

    # 豆包 UI 元素 ID 常量
    class IDs:
        """Resource IDs"""
        TITLE = "com.larus.nova:id/title"
        PHONE_BUTTON = "com.larus.nova:id/real_time_call"
        PHONE_CONTAINER = "com.larus.nova:id/real_time_call_ic_container"
        TTS_BUTTON = "com.larus.nova:id/tts"
        MORE_BUTTON = "com.larus.nova:id/more"
        SPEAK_AREA = "com.larus.nova:id/speak_normal"
        BACK_ICON = "com.larus.nova:id/back_icon"
        SIDEBAR_NEW_CHAT = "com.larus.nova:id/side_bar_create_conversation"
        # 对话列表页面右上角「创建新对话」按钮 (✏️ 图标)
        LIST_NEW_CHAT = "com.larus.nova:id/right_img"

        # 通话界面
        CALL_ROOT = "com.larus.nova:id/realtime_call_root"
        CALL_STATUS = "com.larus.nova:id/voice_call_status_text"
        CALL_MUTE = "com.larus.nova:id/realtime_call_mute"
        CALL_SHARE = "com.larus.nova:id/voice_call_share_screen"
        CALL_VIDEO = "com.larus.nova:id/voice_call_video"
        CALL_HANGUP = "com.larus.nova:id/voice_call_hangup"
        CALL_MORE = "com.larus.nova:id/realtime_more"
        CALL_SCENE = "com.larus.nova:id/scene_text"
        CALL_SUBTITLE = "com.larus.nova:id/realtime_call_subtitle_button"
        CALL_DISCLAIMER = "com.larus.nova:id/realtime_call_disclaimer"
        CALL_BALL = "com.larus.nova:id/realtime_ball_video"
        # 字幕区精准定位
        SUBTITLE_LAYOUT = "com.larus.nova:id/voice_call_subtitle_layout"
        SUBTITLE_CONTENT = "com.larus.nova:id/content"  # 字幕文本 TextView

    def __init__(self, device_config: DeviceConfig, app_config: AppConfig = None):
        if app_config is None:
            app_config = AppConfig(
                name="doubao",
                package="com.larus.nova",
                activity="com.larus.home.impl.alias.AliasActivity1",
                voice_button_id="com.larus.nova:id/real_time_call",
                response_timeout=30.0,
            )
        super().__init__(app_config, device_config)

        # 字幕相关状态
        self._subtitle_enabled: bool = False
        self._baseline_texts: Set[str] = set()
        self._last_status: str = ""

        # 双通道检测状态（v2：全双工模式支持）
        self._user_text: str = ""          # 锁定的用户转写文本
        self._ai_responding: bool = False  # AI 是否正在回复
        self._ai_finished: bool = False    # AI 是否回复完毕
        self._last_ai_text: str = ""       # 上一次检测到的 AI 文本
        self._text_stable_count: int = 0   # AI 文本稳定计数（用于判断回复结束）

    def enable_subtitle(self):
        """点击字幕按钮启用对话文本显示

        豆包通话界面有 '显示字幕' 按钮（toggle），点击后显示语音转文字。
        
        注意：按钮是 toggle，不能盲点。需要检测按钮的 content-desc：
        - "显示字幕" → 字幕未启用，需要点击
        - "关闭字幕" → 字幕已启用，不需要点击
        """
        try:
            subtitle_btn = self.find_element(
                AppiumBy.ID,
                self.IDs.CALL_SUBTITLE,
                timeout=5,
            )
            # 通过 content-desc 判断当前字幕状态
            desc = subtitle_btn.get_attribute("content-desc") or ""
            logger.debug(f"[豆包] 字幕按钮 desc=\"{desc}\"")

            if "关闭" in desc:
                # "关闭字幕" = 字幕已经是开启状态（点击会关闭）
                self._subtitle_enabled = True
                logger.info("[豆包] ✅ 字幕已启用（按钮状态：关闭字幕）")
                return

            # "显示字幕" = 字幕未启用，点击开启
            subtitle_btn.click()
            time.sleep(1)

            # 验证点击后状态
            try:
                subtitle_btn2 = self.find_element(
                    AppiumBy.ID,
                    self.IDs.CALL_SUBTITLE,
                    timeout=3,
                )
                desc2 = subtitle_btn2.get_attribute("content-desc") or ""
                if "关闭" in desc2:
                    self._subtitle_enabled = True
                    logger.info("[豆包] ✅ 字幕已启用（点击后验证通过）")
                else:
                    logger.warning(f"[豆包] 字幕点击后状态异常: desc=\"{desc2}\"")
                    # 不再重试，避免 toggle 反转
                    self._subtitle_enabled = True
            except Exception:
                self._subtitle_enabled = True
                logger.info("[豆包] ✅ 字幕已启用（无法验证，假定成功）")

        except Exception as e:
            logger.warning(f"[豆包] 启用字幕失败: {e}")

    def snapshot_baseline_texts(self):
        """拍摄文本 baseline（注入音频前调用）

        记录当前字幕区的文本 + 状态文案，用于后续对比检测新文本。
        同时重置双通道检测的所有状态变量。
        """
        # 字幕区文本（快速）
        subtitle_texts = self._get_subtitle_texts_fast()
        # 状态文案也加入 baseline
        status = self._get_call_status_fast()
        self._baseline_texts = set(subtitle_texts)
        if status:
            self._baseline_texts.add(status)
        self._last_status = status

        # 重置双通道检测状态
        self._user_text = ""
        self._ai_responding = False
        self._ai_finished = False
        self._last_ai_text = ""
        self._text_stable_count = 0
        self._poll_count = 0

        logger.info(f"[豆包] 文本快照已拍摄，baseline={len(self._baseline_texts)} 条")

    def _get_subtitle_texts_fast(self) -> List[str]:
        """精准获取字幕区文本（快速版）

        两阶段方法避免全局 ID 匹配:
        1. 先用 ID 找到字幕布局容器
        2. 在容器内用 find_elements 查找 content
        
        如果字幕布局不存在（通话未开始），立即返回空列表（~10ms）
        """
        texts = []
        try:
            # 第1步：快速检查字幕布局是否存在
            layouts = self.driver.find_elements(
                AppiumBy.ID,
                self.IDs.SUBTITLE_LAYOUT,
            )
            if not layouts:
                return texts  # 字幕区不存在，立即返回
            
            # 第2步：在字幕布局内查找 content 元素
            subtitle_layout = layouts[0]
            elements = subtitle_layout.find_elements(
                AppiumBy.ID,
                self.IDs.SUBTITLE_CONTENT,
            )
            for el in elements:
                try:
                    t = el.text
                    if t and t.strip():
                        texts.append(t.strip())
                except Exception:
                    pass
        except Exception:
            pass
        return texts

    def _get_all_text_elements(self) -> List[str]:
        """获取当前界面所有文本内容（慢速全树版，仅 baseline 用）"""
        texts = []
        try:
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
        except Exception:
            pass
        return texts

    def _get_conversation_texts(self) -> list:
        """获取 baseline 之后新出现的字幕文本（快速版）

        Returns:
            新出现的文本列表（排除 baseline 中的文本）
        """
        # 使用精准定位而非全树遍历
        all_texts = self._get_subtitle_texts_fast()
        new_texts = []
        for t in all_texts:
            if t.strip() and t.strip() not in self._baseline_texts:
                new_texts.append(t.strip())
        return new_texts

    def detect_ai_response_state(self) -> dict:
        """检测 AI 回复状态（v3 —— 纯文本检测，统一 text_change 方法）

        核心逻辑：
        只有 AI 回复文本出现才触发 ai_responding = True。
        状态文案仅用于辅助结束检测，不触发 ai_responding。

        检测策略：
        - 文本变化 = 唯一的 ai_responding 触发信号
        - 状态文案（"你可以开始说话" / "正在听..."）用于判断回复结束
        - 文本稳定性计数作为全双工模式的结束检测兜底

        Returns:
            {
                "status_text": str,
                "ai_responding": bool,
                "ai_finished": bool,
                "status_signal": str,
                "new_texts": list,
                "has_new_text": bool,
                "text_stable_count": int,
            }
        """
        # ── 通道1：文本变化（唯一触发通道）──
        t0 = time.time()
        new_texts = self._get_conversation_texts()
        t1 = time.time()
        has_new = len(new_texts) > 0

        # ── 通道2：状态文案（仅用于结束检测）──
        status = self._get_call_status_fast()
        t2 = time.time()

        # 前几次轮询输出计时诊断
        if not hasattr(self, '_poll_count'):
            self._poll_count = 0
        self._poll_count += 1
        if self._poll_count <= 5:
            logger.debug(
                f"[豆包] 轮询#{self._poll_count} 计时: "
                f"texts={int((t1-t0)*1000)}ms, "
                f"status={int((t2-t1)*1000)}ms, "
                f"total={int((t2-t0)*1000)}ms"
            )

        # ── 用户文本锁定 ──
        if has_new and not self._user_text:
            if len(new_texts) == 1:
                self._user_text = new_texts[0]
                logger.debug(f"[豆包] 锁定用户文本: {self._user_text[:50]}")
            else:
                sorted_by_len = sorted(new_texts, key=len)
                self._user_text = sorted_by_len[0]
                logger.info(f"[豆包] 多文本同时出现! 锁定最短为用户文本: "
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
            logger.info(f"[豆包] 🤖 AI 开始回复 (文本通道: \"{ai_texts[0][:60]}\")")

        # ── 辅助：状态文案仅用于结束检测 ──
        if "打断" in status or "对方" in status:
            signal = "responding"
        elif "思考" in status:
            signal = "thinking"
        elif "正在听" in status:
            if self._ai_responding:
                # 从 responding 回到 listening = 回复结束
                if "打断" in self._last_status or "对方" in self._last_status:
                    self._ai_finished = True
                    signal = "finished"
                    logger.info("[豆包] 状态: responding → finished (回到正在听)")
                else:
                    signal = "listening"
            else:
                signal = "listening"
        elif "你可以开始说话" in status:
            if self._ai_responding:
                self._ai_finished = True
                signal = "finished"
                logger.info("[豆包] 状态: → finished (回到等待)")
            else:
                signal = "waiting"
        else:
            signal = "unknown"

        # ── 文本稳定性检测（全双工模式下的结束兜底）──
        current_ai_text = " ".join(ai_texts)
        if self._ai_responding and not self._ai_finished:
            if current_ai_text and current_ai_text == self._last_ai_text:
                self._text_stable_count += 1
                if self._text_stable_count >= 15:
                    self._ai_finished = True
                    logger.info(f"[豆包] ✅ AI 回复结束 (文本稳定 {self._text_stable_count} 次)")
            else:
                self._text_stable_count = 0
        self._last_ai_text = current_ai_text

        self._last_status = status

        return {
            "status_text": status,
            "ai_responding": self._ai_responding,
            "ai_finished": self._ai_finished,
            "status_signal": signal,
            "new_texts": new_texts,
            "has_new_text": has_new,
            "text_stable_count": self._text_stable_count,
        }

    def _is_in_call_screen(self) -> bool:
        """检测是否在通话界面"""
        try:
            self.find_element(
                AppiumBy.ID,
                self.IDs.CALL_ROOT,
                timeout=3,
            )
            return True
        except Exception:
            return False

    def _is_in_chat_screen(self) -> bool:
        """检测是否在对话主界面"""
        try:
            self.find_element(
                AppiumBy.ID,
                self.IDs.PHONE_BUTTON,
                timeout=3,
            )
            return True
        except Exception:
            return False

    def _ensure_app_foreground(self):
        """确保豆包 APP 在前台"""
        try:
            self.driver.activate_app(self.app_config.package)
            time.sleep(1)
            logger.info("[豆包] APP 已激活到前台")
        except Exception as e:
            logger.warning(f"[豆包] activate_app 失败: {e}，尝试用 ADB...")
            try:
                import subprocess
                subprocess.run(
                    ["adb", "-s", self.device_config.device_name,
                     "shell", "am", "start", "-n",
                     f"{self.app_config.package}/{self.app_config.activity}"],
                    capture_output=True, timeout=10
                )
                time.sleep(1)
            except Exception:
                pass

    def _is_in_chat_list(self):
        """判断是否在对话列表页面（底部 Tab 有「对话」「智能体」等入口）"""
        try:
            # 对话列表页顶部标题文字为"对话"，resource-id=title_text
            title_els = self.driver.find_elements(
                AppiumBy.ID, "com.larus.nova:id/title_text",
            )
            if title_els and title_els[0].text == "对话":
                return True
        except Exception:
            pass
        return False

    def _click_new_chat_in_list(self) -> bool:
        """在对话列表页点击「创建新对话」按钮，返回是否成功"""
        try:
            new_chat_btns = self.driver.find_elements(
                AppiumBy.ACCESSIBILITY_ID, "创建新对话",
            )
            if not new_chat_btns:
                new_chat_btns = self.driver.find_elements(
                    AppiumBy.ID, self.IDs.LIST_NEW_CHAT,
                )
            if new_chat_btns:
                new_chat_btns[0].click()
                logger.info("[豆包] 已点击「创建新对话」按钮")
                time.sleep(1.5)
                logger.info("[豆包] ✅ 新对话窗口已创建")
                return True
        except Exception as e:
            logger.warning(f"[豆包] 点击「创建新对话」失败: {e}")
        return False

    def start_new_conversation(self):
        """新建一个干净的对话窗口

        流程：
        1. 确保 APP 在前台
        2. 如果在通话界面，先挂断
        3. 检查当前位置，选择最合适的策略：
           a. 对话列表页 → 点击右上角「创建新对话」按钮
           b. 对话详情页 → 先回到对话列表页，再新建
           c. 其他页面 → 连按 back 回到对话列表页
        """
        logger.info("[豆包] 新建对话窗口...")

        # 如果在通话界面，先挂断
        if self._is_in_call_screen():
            logger.info("[豆包] 当前在通话界面，先挂断...")
            self.end_voice_call()
            time.sleep(2)

        # 确保 APP 在前台
        self._ensure_app_foreground()

        # 诊断：检测当前页面状态
        in_chat_list = self._is_in_chat_list()
        in_chat_screen = self._is_in_chat_screen()
        logger.debug(
            f"[豆包] 页面状态: 对话列表={in_chat_list}, "
            f"对话详情={in_chat_screen}"
        )

        # ---- 策略 1: 已在对话列表页 → 直接点新建 ----
        if in_chat_list:
            logger.info("[豆包] 当前在对话列表页，点击「创建新对话」")
            if self._click_new_chat_in_list():
                return

        # ---- 策略 2: 在对话详情页 → 按 back 回到对话列表页再新建 ----
        if in_chat_screen:
            logger.info("[豆包] 当前在对话详情页，按 back 回对话列表页...")
            self.driver.back()
            time.sleep(1)
            if self._is_in_chat_list():
                logger.info("[豆包] 已回到对话列表页")
                if self._click_new_chat_in_list():
                    return
            else:
                logger.debug("[豆包] back 后未到对话列表页，尝试侧边栏...")

        # ---- 策略 3: 侧边栏方式 ----
        sidebar_btns = self.driver.find_elements(
            AppiumBy.ID, self.IDs.SIDEBAR_NEW_CHAT,
        )
        if not sidebar_btns:
            try:
                back_btn = self.driver.find_elements(
                    AppiumBy.ID, self.IDs.BACK_ICON,
                )
                if back_btn:
                    back_btn[0].click()
                    logger.debug("[豆包] 已点击 back_icon")
                    time.sleep(1.5)

                    # back_icon 点击后可能回到了对话列表页，检查一下
                    if self._is_in_chat_list():
                        logger.info("[豆包] back_icon 后回到对话列表页")
                        if self._click_new_chat_in_list():
                            return
                    else:
                        sidebar_btns = self.driver.find_elements(
                            AppiumBy.ID, self.IDs.SIDEBAR_NEW_CHAT,
                        )
            except Exception as e:
                logger.warning(f"[豆包] 打开侧边栏失败: {e}")

        if sidebar_btns:
            sidebar_btns[0].click()
            logger.info("[豆包] 已点击侧边栏「创建新对话」")
            time.sleep(2)
            logger.info("[豆包] ✅ 新对话窗口已创建（侧边栏方式）")
            return

        # ---- 策略 4: Fallback — 连按 back 回到对话列表页再新建 ----
        logger.warning("[豆包] 策略 1-3 均失败，fallback: 连按 back...")
        for attempt in range(5):
            self.driver.back()
            time.sleep(1.5)

            if self._is_in_chat_list():
                logger.info(f"[豆包] 已回到对话列表页 (back x{attempt+1})")
                if self._click_new_chat_in_list():
                    return
                break

            # 如果 back 到了对话详情页（有电话图标），也可以直接用
            if self._is_in_chat_screen():
                logger.info(
                    f"[豆包] back 到对话详情页 (back x{attempt+1})，"
                    f"跳过新建对话直接进通话"
                )
                return

        logger.warning("[豆包] ⚠️ 所有策略均失败，继续使用当前对话")

    def navigate_to_voice_chat(self):
        """
        导航到语音通话界面

        路径：新建对话 → 点击右上角电话图标 (打电话) → 进入通话界面
        """
        logger.info("[豆包] 导航到语音通话界面...")

        # 如果已经在通话界面，直接返回
        if self._is_in_call_screen():
            logger.info("[豆包] 已在通话界面")
            return

        # 先新建对话窗口（确保干净上下文）
        self.start_new_conversation()

        # 确保在对话页（新建对话后应该已经在了）
        if not self._is_in_chat_screen():
            logger.info("[豆包] 不在对话页，尝试导航...")
            self._ensure_app_foreground()
            time.sleep(2)

        # 点击电话图标进入语音通话
        logger.info("[豆包] 点击「打电话」图标...")
        try:
            # 方案1: 通过 resource-id
            self.click_element(
                AppiumBy.ID,
                self.IDs.PHONE_CONTAINER,
                timeout=8,
            )
        except Exception:
            try:
                # 方案2: 通过 content-desc
                self.click_element(
                    AppiumBy.ACCESSIBILITY_ID,
                    "打电话",
                    timeout=5,
                )
            except Exception:
                # 方案3: 通过 XPath
                self.click_element(
                    AppiumBy.XPATH,
                    '//android.widget.ImageView[@content-desc="打电话"]',
                    timeout=3,
                )

        time.sleep(0.5)  # 基础等待（后面有轮询检测）

        # 等待通话界面加载（polling，最多等 12s，首轮冷启动可能较慢）
        call_wait_start = time.time()
        for _ in range(12):
            if self._is_in_call_screen():
                wait_time = time.time() - call_wait_start
                logger.info(f"[豆包] ✅ 已进入语音通话界面 (等待 {wait_time:.1f}s)")
                break
            # 检查并关闭可能的权限弹窗
            try:
                allow_btns = self.driver.find_elements(
                    AppiumBy.XPATH,
                    '//*[@text="允许" or @text="始终允许" or @text="仅在使用中允许"]',
                )
                if allow_btns:
                    allow_btns[0].click()
                    logger.info("[豆包] 已点击权限允许按钮")
                    time.sleep(1)
                    continue
            except Exception:
                pass
            time.sleep(1)
        else:
            # 12 次都没进入，最后一次检查
            if not self._is_in_call_screen():
                raise RuntimeError("[豆包] 无法进入语音通话界面")

        # 处理可能的更新弹窗
        self._dismiss_update_dialog()

    def _dismiss_update_dialog(self):
        """处理更新弹窗"""
        try:
            self.click_element(
                AppiumBy.XPATH,
                '//*[@text="忽略"]',
                timeout=2,
            )
            logger.info("[豆包] 已关闭更新弹窗")
            time.sleep(1)
        except Exception:
            pass

    def start_voice_call(self) -> float:
        """
        开始语音通话

        豆包进入通话界面后自动开始，等待状态变为 "你可以开始说话"。
        自动启用字幕并拍摄文本 baseline。

        Returns:
            通话开始时间戳
        """
        logger.info("[豆包] 开始语音通话...")

        # 等待 "你可以开始说话" 状态
        try:
            self.wait_for_element(
                AppiumBy.XPATH,
                '//*[contains(@text, "你可以开始说话") or '
                'contains(@text, "对方正在说话")]',
                timeout=15,
            )
            logger.info("[豆包] 通话已就绪")
        except Exception:
            logger.warning("[豆包] 未检测到就绪状态，继续...")

        # 启用字幕（如果还没启用）
        self.enable_subtitle()

        # 拍摄文本 baseline
        self.snapshot_baseline_texts()

        start_time = time.time()
        logger.info(f"[豆包] 通话已开始 (T={start_time:.4f})")
        return start_time

    def end_voice_call(self):
        """结束语音通话"""
        logger.info("[豆包] 结束语音通话...")

        if self._is_in_call_screen():
            try:
                # 点击挂断按钮（有完整的 resource-id）
                self.click_element(
                    AppiumBy.ID,
                    self.IDs.CALL_HANGUP,
                    timeout=5,
                )
            except Exception:
                try:
                    # 备选: content-desc
                    self.click_element(
                        AppiumBy.ACCESSIBILITY_ID,
                        "挂断通话",
                        timeout=3,
                    )
                except Exception:
                    # 按返回键退出
                    self.driver.back()

            time.sleep(1)
        else:
            logger.debug("[豆包] 不在通话界面，可能已结束")

        # 验证
        if self._is_in_chat_screen():
            logger.info("[豆包] ✅ 通话已结束，回到对话页")
        else:
            self.driver.back()
            time.sleep(1)
            logger.info("[豆包] 通话已结束")

    def is_ai_responding(self) -> bool:
        """
        检测 AI 是否正在回复

        豆包通话界面的状态文案:
        - "你可以开始说话" → 等待用户
        - "正在听..."      → 正在听用户说话
        - "对方正在说话"   → AI 在回复
        - "正在思考..."    → AI 在处理
        - "说话或点击打断" → AI 在回复（用户可打断）
        """
        try:
            status_el = self.find_element(
                AppiumBy.ID,
                self.IDs.CALL_STATUS,
                timeout=2,
            )
            status_text = status_el.text
            # AI 在回复的状态
            if "对方" in status_text or "思考" in status_text or "打断" in status_text:
                return True
            return False
        except Exception:
            return False

    def is_ai_finished(self) -> bool:
        """
        检测 AI 是否回复完毕

        当状态回到 "你可以开始说话" 或 "正在听..."（AI 说完后等用户）时，
        AI 已回复完毕
        """
        try:
            status_el = self.find_element(
                AppiumBy.ID,
                self.IDs.CALL_STATUS,
                timeout=2,
            )
            status_text = status_el.text
            return "你可以开始说话" in status_text or "正在听" in status_text
        except Exception:
            return False

    def _get_call_status_fast(self) -> str:
        """快速获取通话状态文案（无 WebDriverWait，~50ms）"""
        try:
            elements = self.driver.find_elements(
                AppiumBy.ID,
                self.IDs.CALL_STATUS,
            )
            if elements:
                return elements[0].text or ""
        except Exception:
            pass
        return ""

    def get_call_status(self) -> str:
        """获取当前通话状态文案"""
        try:
            status_el = self.find_element(
                AppiumBy.ID,
                self.IDs.CALL_STATUS,
                timeout=2,
            )
            return status_el.text
        except Exception:
            return ""

    def get_ui_elements_dump(self) -> str:
        """获取 UI 元素树"""
        if self.driver:
            return self.driver.page_source
        return ""

    def capture_element_info(self, save_path: str = None):
        """捕获元素信息"""
        source = self.get_ui_elements_dump()
        if save_path:
            with open(save_path, "w") as f:
                f.write(source)
            logger.info(f"[豆包] UI 元素树已保存: {save_path}")
        return source
