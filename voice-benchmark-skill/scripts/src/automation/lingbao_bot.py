"""
王者荣耀 灵宝（大厅 AI 助手）自动化

与元宝/豆包的关键差异
─────────────────────────────────────────────────────────────
- **Unity 自绘 UI**：UiAutomator dump 拿不到任何文字，必须用 OCR
- **不连 Appium**：driver 永远为 None，所有 BaseBot 中依赖 self.driver
  的方法都被 override 掉
- **导航靠 shell 脚本**：navigate_lingbao.sh 已用 OCR 校准好坐标
- **TTFT 检测**：OCR 轮询底部对话框区域，检测"和灵宝说句话吧"消失/被
  新文字替换 = AI 首字到达
- **OCR 噪点归一化**：连续模式下"和灵宝说句话吧"会被识别成
  各种变体（如 "• 和灵宝说句话吧•"、"c 和灵宝说句话吧。"），
  baseline 与检测都通过归一化处理过滤掉这些变体

测试前置条件
─────────────────────────────────────────────────────────────
1. AVD `Honor_Lingbao_API_34` 已启动且为前台 console=5554 + gRPC=8554
2. 王者荣耀已登录到大厅，最好用 -snapshot lingbao_logged_in 直接进入
3. 屏幕已强制横屏（脚本会再确认一次）
4. macOS Vision OCR (ocr.swift) 可用 → 需要 swift 命令在 PATH
5. BlackHole 2ch 已安装（音频注入需要）

UI 坐标参考（横屏 2400×1080，ROTATION_90）
─────────────────────────────────────────────────────────────
- 灵宝头像     (2240, 920)
- 互动入口     (229, 328)
- 唤醒/连续    (857, 58)
- 菜单首项     (829, 287)
- 按住说话     (1974, 1025)  — 唤醒模式
- 底部对话框   y≈920-1080, x 全宽 — 连续模式提示文字位置
"""
import os
import re
import time
import difflib
import subprocess
import threading
from pathlib import Path
from typing import List, Optional, Set, Tuple
from loguru import logger

from .base_bot import BaseBot
from ..config import AppConfig, DeviceConfig


# ── 固定文案（baseline 过滤）─────────────────────────────────
LINGBAO_PROMPT_TEXT = "和灵宝说句话吧"
LINGBAO_SYSTEM_TEXTS = {
    LINGBAO_PROMPT_TEXT,
    "灵宝对话由AI生成",
    "灵宝唤醒",
    "唤醒",
    "连续",
    "关闭",
    "按住说话",
    "互动",
    "退出",
    "返回",
    "灵宝",
    "灵宝设置",
    "亲昵度",
    "情报",
    "日记",
    "初见",
    "定制",
    # ── 文字交互模式的 UI 文字（不能误判为 AI 回复）──
    "请点击输入",
    "请点击输入（灵宝对话由AI生成）",
    "发送",
    "互动记录",
}

# ── AI 状态指示条（"系统已识别 AI 在说话"的状态变化文案）──
# 这些是 AI 已经在回复时底部显示的提示条，不是 AI 字幕本身
# 命中这些 = "AI 已开始回复"信号晚到 200-500ms
# 我们改为只用真实 AI 字幕作为首响信号，把这些当作辅信号（仅在没字幕时兜底）
LINGBAO_STATUS_BAR_TEXTS = {
    "说话可打断灵宝",
    "说话可打断灵宝。",
    "可打断灵宝",
}


def _is_status_bar_text(s: str) -> bool:
    """判断是否为 AI 状态指示条（不是真正的 AI 字幕首字）"""
    n = _normalize_text(s) if s else ""
    if not n:
        return False
    # 去掉装饰符 ◎◉○● 前缀后比对
    n2 = n.lstrip("◎◉○●·•◇◆▪▫")
    for ref in LINGBAO_STATUS_BAR_TEXTS:
        if n2 == ref or ref in n2 or n2 in ref:
            return True
        # 模糊匹配，防 OCR 字符抖动
        if abs(len(n2) - len(ref)) <= 2:
            ratio = difflib.SequenceMatcher(None, n2, ref).ratio()
            if ratio >= 0.7:
                return True
    return False


# 灵宝在底部对话框区域显示的字幕
# 横屏 2400×1080，对话框大约 (300, 920) ~ (2100, 1080)
LINGBAO_BOTTOM_BAR_Y_MIN = 920
LINGBAO_BOTTOM_BAR_Y_MAX = 1080

# OCR 噪点字符（导符/装饰符）
_OCR_NOISE_CHARS = "•·.,。， cC、—-_~"


def _normalize_text(s: str) -> str:
    """归一化 OCR 文本，消除连续模式下的噪点变体

    举例:
      "• 和灵宝说句话吧•"  → "和灵宝说句话吧"
      "c 和灵宝说句话吧。" → "和灵宝说句话吧"
      "和灵宝说句话吧 "    → "和灵宝说句话吧"
    """
    if not s:
        return ""
    # 1) 去掉常见噪点字符 + 空白
    s2 = s.strip().strip(_OCR_NOISE_CHARS).strip()
    # 2) 去掉所有内部空格
    s2 = re.sub(r"\s+", "", s2)
    return s2


def _is_prompt_variant(s: str) -> bool:
    """判断一段文字是否为'和灵宝说句话吧'的 OCR 变体"""
    n = _normalize_text(s)
    return n == LINGBAO_PROMPT_TEXT or LINGBAO_PROMPT_TEXT in n


def _is_close_to_baseline(s: str, baseline: Set[str], threshold: float = 0.7) -> bool:
    """模糊匹配：s 是否接近 baseline 中的任何一条

    用于过滤 OCR 单字符抖动（如 "灵宝对话由AI生成" → "灵宝对话由A！生成"）。
    threshold=0.7 意味着字符相似度 ≥70% 视为同一条。

    使用 SequenceMatcher 的 ratio()，复杂度 O(n*m)，对短字符串很快。
    """
    if not s or not baseline:
        return False
    n = _normalize_text(s)
    if not n:
        return True
    # 优先全等
    if n in baseline:
        return True
    # 模糊匹配：取最相似的
    for b in baseline:
        if not b:
            continue
        # 长度差太大直接跳过（避免长 AI 回复匹配到短 baseline）
        if abs(len(n) - len(b)) > max(2, len(b) // 3):
            continue
        ratio = difflib.SequenceMatcher(None, n, b).ratio()
        if ratio >= threshold:
            return True
    return False


class _LingbaoDriverSentinel:
    """占位 driver 对象

    runner.py 用 `if not getattr(bot, 'driver', None)` 判断连接状态，
    LingbaoBot 不连 Appium 但要让 runner 视为已连接。这个 sentinel
    有 truthy 值，并把所有 Appium 风格的方法调用变成 no-op，避免
    runner 里 `bot.driver.terminate_app()` 等调用直接 NPE。
    """

    def __bool__(self):
        return True

    def __getattr__(self, name):
        # 对 page_source 返回非空字符串，让 runner 的健康检查通过
        if name == "page_source":
            return "<lingbao-no-appium/>"
        # 其他方法返回 no-op callable
        def _noop(*args, **kwargs):
            return None
        return _noop


_LINGBAO_DRIVER = _LingbaoDriverSentinel()


class LingbaoCoords:
    """灵宝 UI 元素坐标（横屏 2400×1080）"""
    # 大厅 → 灵宝
    LINGBAO_AVATAR = (2240, 920)
    # 灵宝主页 → 互动
    INTERACTION = (229, 328)
    # 互动页顶部 唤醒/连续 toggle
    MODE_TOGGLE = (857, 58)
    # 弹出菜单首项（当前=唤醒 → 选项是"连续"）
    POPUP_FIRST_ITEM = (829, 287)
    # 唤醒模式下的按住说话按钮
    PUSH_TO_TALK = (1974, 1025)
    # ── 文字交互模式（连续对话页面底部输入栏）──
    # 文本输入框中心（底部中间区域）— 仅在连续对话界面可见
    # 图2校准：PIL红框检测 底部区域 红框中心(1628,990), 暗区(1597,968)
    TEXT_INPUT_FIELD = (1600, 978)
    # 发送按钮中心（右下角蓝色按钮）— 仅在连续对话界面可见
    # 图2校准：右侧蓝色「发送」按钮（需要进一步精确校准）
    SEND_BUTTON = (2220, 985)
    # 麦克风/键盘切换图标（左下角）— 仅在连续对话界面可见
    MIC_ICON = (100, 1017)
    # ── 灵宝主页面（角色展示页）的键盘按钮 ──
    # 右下角的键盘图标（小网格），点击后打开文字对话界面
    # 图1红框校准：PIL红框检测 中心(1960,982)，亮区中心(1963,974)
    KEYBOARD_BUTTON = (1960, 982)


class LingbaoBot(BaseBot):
    """王者荣耀 灵宝助手 自动化控制

    检测策略：OCR 文本检测
      - start_voice_call 时拍 baseline OCR 快照
      - detect_ai_response_state 轮询新文本，新文本出现 = AI 首字到达
    """

    def __init__(self, device_config: DeviceConfig, app_config: AppConfig = None):
        if app_config is None:
            app_config = AppConfig(
                name="lingbao",
                package="com.tencent.tmgp.sgame",
                activity="com.tencent.tmgp.sgame.SGameActivity",
                response_timeout=30.0,
                # 王者冷启动 + 大厅加载相对慢
                post_login_wait=3.0,
            )
        super().__init__(app_config, device_config)

        # OCR / 导航相关
        script_dir = Path(__file__).resolve().parent.parent.parent / "lingbao"
        self._lingbao_dir: Path = script_dir
        self._navigate_script: Path = script_dir / "navigate_lingbao.sh"
        # 优先使用编译后的 binary（330ms vs swift 解释 1300ms，4x 提速）
        ocr_bin = script_dir / "ocr_bin"
        ocr_swift = script_dir / "ocr.swift"
        if ocr_bin.exists():
            self._ocr_cmd: List[str] = [str(ocr_bin)]
        else:
            self._ocr_cmd = ["swift", str(ocr_swift)]
            logger.warning(
                f"[灵宝] ocr_bin 未编译，使用 swift 解释模式 (~1.3s/帧)。"
                f"编译命令: cd {script_dir} && "
                f"swiftc -O -framework Vision -framework AppKit ocr.swift -o ocr_bin"
            )
        self._ocr_swift: Path = ocr_swift

        # OCR 结果缓存（用于多重检测共用同一帧）
        self._last_ocr_lines: List[Tuple[Tuple[int, int, int, int], str]] = []
        self._last_ocr_time: float = 0.0

        # 文本检测状态（与 yuanbao 保持同构）
        self._baseline_texts: Set[str] = set()
        self._ai_responding: bool = False
        self._ai_finished: bool = False
        self._ai_text_stable_count: int = 0
        self._last_ai_text: str = ""
        self._first_ai_text_seen_at: float = 0.0
        self._first_status_bar_seen_at: float = 0.0
        self._poll_count: int = 0
        # 用于 _wait_for_ai_greeting_done 的状态文案接口
        self._call_status: str = ""

    # ─────────────────────────────────────────────────────────
    # connect/disconnect — 不依赖 Appium，只做轻量 ADB 校验
    # ─────────────────────────────────────────────────────────
    def connect(self, skip_reinstall: bool = False):
        """灵宝不连 Appium，只做最小化设备校验 + 音频路由设置

        Args:
            skip_reinstall: 兼容 BaseBot 接口，灵宝忽略此参数
        """
        device = self.device_config.device_name

        # 1. 设备在线检查
        try:
            r = subprocess.run(
                ["adb", "-s", device, "get-state"],
                capture_output=True, text=True, timeout=5,
            )
            if "device" not in (r.stdout or ""):
                raise RuntimeError(f"adb 设备不在线: {device}")
        except Exception as e:
            raise RuntimeError(f"[灵宝] 设备不在线: {e}")

        # 2. 王者前台检查 + 必要时拉起
        try:
            r = subprocess.run(
                ["adb", "-s", device, "shell", "dumpsys", "window"],
                capture_output=True, text=True, timeout=10,
            )
            if "com.tencent.tmgp.sgame" not in (r.stdout or ""):
                logger.info("[灵宝] 王者不在前台，启动中...")
                subprocess.run(
                    ["adb", "-s", device, "shell", "am", "start", "-n",
                     f"{self.app_config.package}/{self.app_config.activity}"],
                    capture_output=True, timeout=15,
                )
                time.sleep(self.app_config.post_login_wait + 4)
        except Exception as e:
            logger.warning(f"[灵宝] 前台检查异常: {e}")

        # 3. driver 设为 sentinel（runner 用 `if not bot.driver` 判断连接）
        self.driver = _LINGBAO_DRIVER
        self._is_connected = True
        logger.info(f"[灵宝] 已就绪（OCR 模式，无 Appium 依赖） device={device}")

        # 4. 音频路由 —— 复用 BaseBot 的实现
        try:
            self._setup_audio_routing()
        except Exception as e:
            logger.warning(f"[灵宝] 音频路由设置异常: {e}")

    def disconnect(self):
        """无需断开 Appium，仅清理标记"""
        self._is_connected = False
        # 注意：保留 driver 为 sentinel 而非 None，否则 runner 的
        # `if not getattr(bot, 'driver', None)` 会触发反复"重连"。
        # 实际清理在 connect 重入时由 _is_connected 控制。

    def _ensure_driver_ready(self) -> bool:
        """OCR 模式下永远 ready，覆盖 BaseBot 默认实现"""
        return True

    # ─────────────────────────────────────────────────────────
    # OCR 工具
    # ─────────────────────────────────────────────────────────
    def _ocr_screen(
        self,
        force_refresh: bool = True,
        fast: bool = False,
        roi: Optional[Tuple[int, int]] = None,
    ) -> List[Tuple[Tuple[int, int, int, int], str]]:
        """OCR 当前屏幕；返回 [(bbox, text), ...]

        bbox 格式：(x1, y1, x2, y2)

        Args:
            force_refresh: 强制刷新（不用 50ms 缓存）
            fast: 用 fast OCR 级别（牺牲少量精度，~14ms 而非 ~330ms）
            roi: (y_min, y_max) 像素坐标 — 只 OCR 屏幕该区域，
                 用于检测态高频轮询时大幅压缩 OCR 时间
                 横屏分辨率下传给 ocr_bin 时需考虑屏幕方向
        """
        if not force_refresh and self._last_ocr_lines and (
            time.time() - self._last_ocr_time < 0.05
        ):
            return self._last_ocr_lines

        device = self.device_config.device_name
        tmp_png = "/tmp/_lingbao_ocr.png"

        # exec-out 直接写文件，避免 pull 的开销
        try:
            with open(tmp_png, "wb") as fout:
                subprocess.run(
                    ["adb", "-s", device, "exec-out", "screencap", "-p"],
                    stdout=fout, stderr=subprocess.DEVNULL,
                    timeout=4,
                )
        except Exception as e:
            logger.debug(f"[灵宝] screencap 失败: {e}")
            return self._last_ocr_lines

        # 拼装 OCR 命令（ocr.swift 要求 args[1] 是图片路径，flags 放后面）
        cmd = list(self._ocr_cmd) + [tmp_png]
        if fast:
            cmd.append("--fast")
        if roi is not None:
            y1, y2 = int(roi[0]), int(roi[1])
            cmd.extend(["--roi", str(y1), str(y2)])

        try:
            r = subprocess.run(
                cmd,
                capture_output=True, text=True, timeout=8,
            )
        except Exception as e:
            logger.debug(f"[灵宝] OCR 失败: {e}")
            return self._last_ocr_lines

        lines = []
        for line in (r.stdout or "").splitlines():
            if "\t" not in line:
                continue
            bbox_str, text = line.split("\t", 1)
            try:
                x1, y1, x2, y2 = [int(v) for v in bbox_str.split(",")]
                lines.append(((x1, y1, x2, y2), text.strip()))
            except Exception:
                continue

        # 仅当 OCR 是"全屏 + accurate"时才更新缓存（避免 ROI/fast 污染缓存）
        if not fast and roi is None:
            self._last_ocr_lines = lines
            self._last_ocr_time = time.time()
        return lines

    def _ocr_texts(self, force_refresh: bool = True) -> List[str]:
        return [t for _, t in self._ocr_screen(force_refresh=force_refresh)]

    def _ocr_contains(self, needle: str, force_refresh: bool = True) -> bool:
        for t in self._ocr_texts(force_refresh=force_refresh):
            if needle in t:
                return True
        return False

    def _ocr_bottom_texts(
        self,
        y_min: int = LINGBAO_BOTTOM_BAR_Y_MIN,
        y_max: int = LINGBAO_BOTTOM_BAR_Y_MAX,
        force_refresh: bool = True,
    ) -> List[str]:
        """只取底部对话框区域的文字（连续模式 AI 字幕在这里出现）"""
        result = []
        for (x1, y1, x2, y2), text in self._ocr_screen(force_refresh=force_refresh):
            cy = (y1 + y2) // 2
            if y_min <= cy <= y_max:
                result.append(text)
        return result

    # ─────────────────────────────────────────────────────────
    # navigate_to_voice_chat — 调脚本 + OCR 校验
    # ─────────────────────────────────────────────────────────
    def navigate_to_voice_chat(self):
        """通过 navigate_lingbao.sh 进入连续对话准备态

        脚本内含 5 步导航 + OCR 校验：
          step1 大厅 → 灵宝头像
          step2 灵宝主页 → 互动
          step3 互动页 → 顶部 唤醒/连续 toggle
          step4 弹出菜单 → 选择"连续"
          step5 校验 "和灵宝说句话吧" 出现
        """
        logger.info("[灵宝] 导航到语音通话界面（连续模式）...")

        # 幂等快路径：已经处于连续模式准备态 → 跳过整段
        if self._ocr_contains(LINGBAO_PROMPT_TEXT):
            logger.info("[灵宝] 已处于连续对话准备态，跳过导航")
            return

        if not self._navigate_script.exists():
            raise RuntimeError(f"[灵宝] 找不到导航脚本: {self._navigate_script}")

        # 调用脚本（不截图以加快速度）
        env = os.environ.copy()
        env["DEVICE_SERIAL"] = self.device_config.device_name
        # adb 必须能找到
        env["PATH"] = (
            os.path.expanduser("~/Library/Android/sdk/platform-tools")
            + ":" + env.get("PATH", "")
        )

        try:
            r = subprocess.run(
                ["bash", str(self._navigate_script), "--no-shots"],
                env=env,
                capture_output=True, text=True, timeout=90,
            )
        except subprocess.TimeoutExpired:
            raise RuntimeError("[灵宝] 导航脚本超时")

        if r.returncode != 0:
            logger.error(
                f"[灵宝] 导航脚本失败 rc={r.returncode}\n"
                f"stdout(tail):\n{(r.stdout or '')[-2000:]}\n"
                f"stderr(tail):\n{(r.stderr or '')[-1000:]}"
            )
            raise RuntimeError(f"[灵宝] 导航脚本失败 rc={r.returncode}")

        # 二次 OCR 校验
        for _ in range(8):
            if self._ocr_contains(LINGBAO_PROMPT_TEXT):
                logger.info("[灵宝] ✅ 连续对话准备态已就绪")
                return
            time.sleep(0.5)

        raise RuntimeError("[灵宝] 导航脚本声明完成，但 OCR 未检测到准备态文字")

    # ─────────────────────────────────────────────────────────
    # baseline / 检测
    # ─────────────────────────────────────────────────────────
    def snapshot_baseline_texts(self):
        """注入音频前拍快照（含 2 帧合并 + 归一化）

        OCR 在连续模式下不稳定，单帧可能漏掉一些字。这里采集 2 帧
        间隔 0.4s，把所有文本归一化后塞进 baseline，提高 baseline 完备度。
        """
        baseline_norm: Set[str] = set()

        for round_i in range(2):
            texts = self._ocr_texts(force_refresh=True)
            for t in texts:
                n = _normalize_text(t)
                if n:
                    baseline_norm.add(n)
                # 同时把"和灵宝说句话吧"的所有变体归并
            if round_i == 0:
                time.sleep(0.4)

        # 系统固定文案（含归一化版本）一并加入
        for t in LINGBAO_SYSTEM_TEXTS:
            baseline_norm.add(_normalize_text(t))

        self._baseline_texts = baseline_norm
        self._ai_responding = False
        self._ai_finished = False
        self._ai_text_stable_count = 0
        self._last_ai_text = ""
        self._first_ai_text_seen_at = 0.0
        self._first_status_bar_seen_at = 0.0
        self._poll_count = 0
        logger.info(
            f"[灵宝] OCR 文本快照已拍摄，baseline={len(self._baseline_texts)} 条"
        )
        logger.debug(f"[灵宝] baseline: {sorted(self._baseline_texts)}")

    def _filter_new_texts(self, texts: List[str]) -> List[str]:
        """从所有 OCR 文本中过滤出"新出现"的文本（已归一化 + 模糊匹配）

        过滤规则：
          1. 长度 ≤1 的字符直接丢
          2. 归一化命中 baseline → 已知，丢
          3. "和灵宝说句话吧" 的任意变体 → 已知，丢
          4. 字符相似度 ≥70% 接近 baseline 任一条 → OCR 抖动，丢
             （捕获 "灵宝对话由AI生成" → "灵宝对话由A！生成" 这类单字符替换）

        返回原始文本（不是归一化后的），以便日志展示。
        """
        new = []
        for t in texts:
            if not t or len(t.strip()) <= 1:
                continue
            n = _normalize_text(t)
            if not n or len(n) <= 1:
                continue
            if n in self._baseline_texts:
                continue
            if _is_prompt_variant(t):
                continue
            # 模糊匹配 baseline，过滤 OCR 字符抖动
            if _is_close_to_baseline(t, self._baseline_texts, threshold=0.7):
                continue
            new.append(t)
        return new

    def detect_ai_response_state(self) -> dict:
        """OCR 轮询检测 AI 回复状态

        关键约束：**只看底部对话框区域 (cy ≥ 920) 的文字**。
        AI 字幕在连续模式下一定出现在这一行（替换掉"和灵宝说句话吧"提示）。
        上方菜单区域的 OCR 抖动（如把"灵宝/灵宝设置/连续"识别成
        "灵宝含［ 灵宝设置 连续"）不会被算作 AI 回复。

        ── TTFT 优化（2026-06-01 P0）──
        1. 使用 `--roi 920 1080` ROI OCR（accurate 级别保留）：
           整链路从 ~810ms→~620ms（screencap 还是 ~480ms 主导）
           注：fast 级别对中文识别太差（"和灵宝说句话吧" 被识别为乱码），不可用
        2. 区分"AI 字幕"与"AI 状态条"：
           - "AI 字幕"：模型说话内容（如"3 加 2 等于 5"）→ 真 ai_start 信号
           - "AI 状态条"："◎ 说话可打断灵宝。"→ 系统状态标记，比真首响晚 200-500ms
           优先认字幕；状态条仅在 1.5s 后还没等到字幕时兜底（保证不漏检）

        Returns:
            dict（与 yuanbao_bot.detect_ai_response_state 同构）
        """
        t0 = time.time()
        # ROI 模式：只 OCR 底部条带
        # 横屏分辨率 2400×1080（adb screencap 旋转后存的图就是横屏的）
        # ocr_bin --roi 输出的 bbox 是原图绝对坐标（已加 roiYOffset）
        all_lines = self._ocr_screen(
            force_refresh=True,
            fast=False,  # 中文 accurate 必须，fast 输出乱码
            roi=(LINGBAO_BOTTOM_BAR_Y_MIN, LINGBAO_BOTTOM_BAR_Y_MAX),
        )
        # 由 ROI 限定，bbox.cy 必在 920-1080 之间，但兜底再过滤一次
        bottom_texts = []
        for (x1, y1, x2, y2), text in all_lines:
            cy = (y1 + y2) // 2
            if LINGBAO_BOTTOM_BAR_Y_MIN <= cy <= LINGBAO_BOTTOM_BAR_Y_MAX:
                bottom_texts.append(text)

        # 过滤新文本（排除归一化 baseline + prompt variants）
        new_texts = self._filter_new_texts(bottom_texts)

        # 区分"真字幕"和"状态条"
        true_subtitle_texts = [t for t in new_texts if not _is_status_bar_text(t)]
        status_bar_texts = [t for t in new_texts if _is_status_bar_text(t)]

        t1 = time.time()
        self._poll_count += 1

        if self._poll_count <= 5:
            logger.debug(
                f"[灵宝] 轮询#{self._poll_count} 计时: "
                f"ocr={int((t1-t0)*1000)}ms, "
                f"bottom={len(bottom_texts)}, "
                f"subtitle={len(true_subtitle_texts)}, "
                f"status_bar={len(status_bar_texts)}, "
                f"texts={bottom_texts[:2]}"
            )

        has_subtitle = len(true_subtitle_texts) > 0
        has_status_bar = len(status_bar_texts) > 0

        # ── 首响判定（修订版）──
        # 状态条 "◎ 说话可打断灵宝" 出现 = AI TTS 已开始（UI 提示用户可打断）
        # 真字幕作为更精确的二次确认信号（OCR 中文有时识别不出，不能依赖）
        # 任一命中立刻判 AI 首响，不再加 1.5s 兜底（之前测试 +1500ms 拉高 TTFT）
        signal_text = None
        signal_kind = None
        if has_subtitle:
            signal_text = true_subtitle_texts[0]
            signal_kind = "subtitle"
        elif has_status_bar:
            signal_text = status_bar_texts[0]
            signal_kind = "status_bar"

        if signal_text and not self._ai_responding:
            self._ai_responding = True
            self._first_ai_text_seen_at = time.time()
            logger.info(
                f"[灵宝] 🤖 AI 开始回复 "
                f"({signal_kind}: \"{signal_text[:60]}\")"
            )
            self._call_status = "responding"

        # 文本稳定计数 → AI 回复完毕（用真字幕，不用状态条）
        # 状态条全程都在，会干扰稳定判定
        current = " ".join(true_subtitle_texts) if true_subtitle_texts else " ".join(status_bar_texts)
        if self._ai_responding:
            if current != self._last_ai_text:
                self._ai_text_stable_count = 0
                self._last_ai_text = current
            else:
                self._ai_text_stable_count += 1
                # 连续 6 次（约 6×poll_interval ≈ 0.6s 以上）不变 → 认为完毕
                if self._ai_text_stable_count >= 6:
                    self._ai_finished = True
                    self._call_status = "finished"
                    logger.info(
                        f"[灵宝] ✅ AI 回复完毕 (OCR 字幕稳定 "
                        f"{self._ai_text_stable_count} 次)"
                    )

        return {
            "has_new_text": has_subtitle or has_status_bar,
            "new_texts": new_texts,
            "ai_responding": self._ai_responding,
            "ai_finished": self._ai_finished,
            "text_stable_count": self._ai_text_stable_count,
            "status_text": self._call_status,
            "status_phase": self._call_status or "idle",
        }

    def is_ai_responding(self) -> bool:
        return self.detect_ai_response_state()["ai_responding"]

    def is_ai_finished(self) -> bool:
        return self.detect_ai_response_state()["ai_finished"]

    # ─────────────────────────────────────────────────────────
    # start / end voice call
    # ─────────────────────────────────────────────────────────
    def start_voice_call(self) -> float:
        """开始语音通话

        灵宝连续模式进入后即处于"听音状态"，不需要点按其他按钮。
        在这里拍 baseline。
        """
        logger.info("[灵宝] 开始语音通话（连续模式已就绪）")
        time.sleep(0.5)
        self.snapshot_baseline_texts()
        start_time = time.time()
        logger.info(f"[灵宝] 通话已开始 (T={start_time:.4f})")
        return start_time

    # ─────────────────────────────────────────────────────────
    # 文字交互模式（2026-06-25 新增：键盘输入代替语音注入）
    # ─────────────────────────────────────────────────────────
    def send_text_message(self, text: str) -> float:
        """发送文字消息给灵宝

        流程：
          0. 检测当前页面状态（主页面 vs 连续对话界面）
          1a. 如果在主页面 → 先点击右下角键盘按钮打开对话界面
          1b. 如果已在连续对话界面 → 直接操作输入框
          2. 点击文本输入框（激活焦点，弹出键盘）
          3. 通过 adb shell input text 输入文字
          4. 点击发送按钮
          5. 返回发送时间戳（用于 TTFT 计算）

        Args:
            text: 要发送的文字内容（建议简短如 "你好"、"今天天气怎么样"）

        Returns:
            float: 发送按钮点击的时间戳（time.time()）
        """
        device = self.device_config.device_name
        coords = LingbaoCoords

        logger.info(f"[灵宝] 📝 开始文字交互: 「{text}」")

        # Step 0: 检测当前页面状态
        # 连续对话界面（有输入栏）的特征：
        #   - 底部有「和灵宝说句话吧」提示（空闲态）
        #   - 或底部有「请点击输入」输入框（已打开键盘态）
        # 注意：「灵宝对话由AI生成」在主页面和对话页面都存在（底部 footer），不能用作判断依据！
        has_input_bar = (
            self._ocr_contains(LINGBAO_PROMPT_TEXT)
            or self._ocr_contains("请点击输入")
        )

        if not has_input_bar:
            # 在主页面 → 需要先点击键盘按钮打开对话界面
            kx, ky = coords.KEYBOARD_BUTTON
            logger.info(f"[灵宝]   Step0: 检测到主页面，点击键盘按钮 ({kx},{ky}) 打开对话")
            subprocess.run(
                ["adb", "-s", device, "shell", "input", "tap", str(kx), str(ky)],
                capture_output=True, timeout=5,
            )
            time.sleep(2.0)  # 等待对话框动画弹出

            # ── 预设默认输入法，防止 IME 选择对话框弹出 ──
            # 先获取当前默认输入法
            r_ime = subprocess.run(
                ["adb", "-s", device, "shell", "settings", "get", "secure",
                 "default_input_method"],
                capture_output=True, text=True, timeout=5,
            )
            current_ime = (r_ime.stdout or "").strip()
            logger.debug(f"[灵宝]   当前默认输入法: {current_ime}")

            # 如果当前没有设置默认输入法（或不是 Gboard），尝试设置为 Gboard
            # 避免 "Choose input method" 弹窗挡住界面
            if not current_ime or current_ime == "null":
                logger.debug("[灵宝]   未检测到默认输入法，查询可用输入法...")
                r_list = subprocess.run(
                    ["adb", "-s", device, "shell", "ime", "list", "-s"],
                    capture_output=True, text=True, timeout=5,
                )
                # 从输出中找 com.google.android.inputmethod.latin (Gboard)
                gboard_ime = None
                for line in (r_list.stdout or "").splitlines():
                    if "com.google.android.inputmethod.latin" in line:
                        gboard_ime = line.strip()
                        break

                if gboard_ime:
                    logger.info(f"[灵宝]   设置 Gboard 为默认输入法: {gboard_ime}")
                    subprocess.run(
                        ["adb", "-s", device, "shell", "ime", "set", gboard_ime],
                        capture_output=True, timeout=5,
                    )

            # 验证是否已切换到对话界面
            has_input_bar = self._ocr_contains(LINGBAO_PROMPT_TEXT)
            if not has_input_bar:
                has_input_bar = self._ocr_contains("请点击输入")
            if not has_input_bar:
                logger.warning("[灵宝]   ⚠️ 键盘按钮点击后未检测到对话界面，继续尝试")

        # Step 1: 点击文本输入框，激活焦点
        fx, fy = coords.TEXT_INPUT_FIELD
        logger.debug(f"[灵宝]   Step1: 点击输入框 ({fx},{fy})")
        subprocess.run(
            ["adb", "-s", device, "shell", "input", "tap", str(fx), str(fy)],
            capture_output=True, timeout=5,
        )
        time.sleep(1.0)  # 等待键盘弹出 + 输入框获得焦点

        # 如果弹出了输入法选择对话框，关闭它（点击 OK 或选择 Gboard）
        # 检测是否有 "Choose input method" / "Gboard" / "OK" 等关键词
        time.sleep(0.5)
        ime_dialog_texts = self._ocr_texts()
        has_ime_dialog = any(
            kw in t for kw in ["Choose input", "Gboard", "Google Voice", "input method"]
            for t in ime_dialog_texts
        )
        if has_ime_dialog:
            logger.info("[灵宝]   检测到输入法选择对话框，点击 OK 关闭")
            # 点击 OK 按钮（通常在对话框右上角）
            subprocess.run(
                ["adb", "-s", device, "shell", "input", "tap", "2250", "300"],
                capture_output=True, timeout=5,
            )
            time.sleep(0.8)

        # Step 2: 输入文字
        logger.debug(f"[灵宝]   Step2: 输入文字 \"{text}\"")

        # ── 中文输入方案（优先级排序）──
        # adb shell input text 不支持中文（Android 14 / API 34）
        
        # 检查是否包含非 ASCII 字符
        is_ascii = all(ord(c) < 128 for c in text)

        if not is_ascii:
            logger.debug("[灵宝]   检测到非ASCII字符，使用Unicode输入方式")
            
            # 方案1：尝试用 ADB Keyboard 广播（如果已安装）
            r_check = subprocess.run(
                ["adb", "-s", device, "shell", "pm", "list",
                 "packages", "net.android9.keyboard"],
                capture_output=True, text=True, timeout=5,
            )
            has_adb_keyboard = "net.android9.keyboard" in (r_check.stdout or "")
            
            if has_adb_keyboard:
                logger.debug("[灵宝]   使用 ADB Keyboard 输入法")
                # 切换到 ADB Keyboard
                subprocess.run(
                    ["adb", "-s", device, "shell", "ime", "set",
                     "net.android9.keyboard/.AdbKeyboard"],
                    capture_output=True, timeout=5,
                )
                time.sleep(0.3)
                # 通过广播发送文字
                subprocess.run(
                    ["adb", "-s", device, "shell", "am", "broadcast",
                     "-a", "ADB_INPUT_TEXT", "--es", "msg", text],
                    capture_output=True, timeout=5,
                    env={**os.environ, "LANG": "en_US.UTF-8"},
                )
                time.sleep(0.5)
                # 切回原输入法（避免影响后续操作）
                subprocess.run(
                    ["adb", "-s", device, "shell", "ime", "set",
                     "com.google.android.inputmethod.latin/.latin"],
                    capture_output=True, timeout=5,
                )
            else:
                # 方案2：clipboard + paste（兼容性最好的 fallback）
                logger.debug("[灵宝]   使用 clipboard+paste 方式输入中文")
                
                # 设置剪贴板
                subprocess.run(
                    ["adb", "-s", device, "shell", "am", "broadcast",
                     "-a", "CLIPBOARD_SET", "--es", "text", text],
                    capture_output=True, timeout=5,
                    env={**os.environ, "LANG": "en_US.UTF-8"},
                )
                time.sleep(0.4)
                
                # 粘贴
                subprocess.run(
                    ["adb", "-s", device, "shell", "input", "keyevent", "KEYCODE_PASTE"],
                    capture_output=True, timeout=5,
                )
        else:
            # 纯 ASCII → 直接 input text（更快）
            subprocess.run(
                ["adb", "-s", device, "shell", "input", "text", text],
                capture_output=True, timeout=5,
            )
        time.sleep(0.5)  # 等待文字渲染到输入框

        # Step 3: 点击发送按钮
        sx, sy = coords.SEND_BUTTON
        logger.info(f"[灵宝]   Step3: 点击发送按钮 ({sx},{sy})")
        t_send = time.time()
        subprocess.run(
            ["adb", "-s", device, "shell", "input", "tap", str(sx), str(sy)],
            capture_output=True, timeout=5,
        )

        logger.info(f"[灵宝] ✅ 消息已发送 (T={t_send:.4f})")
        return t_send

    def start_text_call(self, text: str = "你好") -> dict:
        """开始文字对话（与 start_voice_call 对等的文字版入口）

        流程：
          1. 拍摄 OCR baseline 快照
          2. 发送文字消息
          3. 返回包含时间戳的字典

        Args:
            text: 测试问题文字

        Returns:
            dict: {
                "call_start": baseline 拍摄时间,
                "t_send": 发送按钮点击时间,
                "text": 发送的文本,
            }
        """
        logger.info("[灵宝] 开始文字对话（键盘输入模式）")
        time.sleep(0.3)

        # 拍 baseline（复用语音模式的 baseline 逻辑）
        self.snapshot_baseline_texts()
        call_start = time.time()
        logger.info(f"[灵宝] Baseline 已拍摄 (T={call_start:.4f})")

        # 发送文字
        t_send = self.send_text_message(text)

        return {
            "call_start": call_start,
            "t_send": t_send,
            "text": text,
        }

    @staticmethod
    def _prepare_adb_text(text: str) -> str:
        """将用户文本转为 adb shell input text 可接受的格式

        adb shell input text 的限制：
          - 原生只支持 ASCII 字符和部分特殊字符
          - 中文需要用特殊方式绕过

        对于王者荣耀的 Unity 输入框（Android 14 / API 34）：
          策略：原样返回，由 send_text_message 改用 clipboard + paste 方式输入中文。
          此函数保留接口兼容性，实际中文输入在下层处理。
        """
        return text

    def end_voice_call(self):
        """结束通话

        连续模式没有显式"挂断"按钮。返回大厅的方式：
          - back 键退出灵宝主页 → 大厅
        """
        logger.info("[灵宝] 结束语音通话（按 back 退出灵宝）")
        device = self.device_config.device_name
        try:
            # 灵宝主页 → 大厅 通常 2~3 次 back 即可
            for _ in range(3):
                subprocess.run(
                    ["adb", "-s", device, "shell", "input", "keyevent", "KEYCODE_BACK"],
                    capture_output=True, timeout=4,
                )
                time.sleep(0.6)
                # 大厅出现"开始练习"或"匹配"等关键文案后停止
                if not self._ocr_contains(LINGBAO_PROMPT_TEXT):
                    break
        except Exception as e:
            logger.warning(f"[灵宝] back 退出异常: {e}")

    def reset_app(self):
        """重置 APP 状态以准备新一轮测试

        灵宝不能强杀王者（成本太高），改用：返回大厅 → 重新进灵宝
        runner 调度上 reset_app 在下一轮 navigate_to_voice_chat 之前调用，
        所以这里只需要回到大厅即可。
        """
        logger.info("[灵宝] reset_app: 返回大厅准备下一轮")
        self.end_voice_call()
        time.sleep(1.0)

    # ─────────────────────────────────────────────────────────
    # 兼容 runner 的辅助接口
    # ─────────────────────────────────────────────────────────
    def _get_call_status_fast(self) -> str:
        """供 runner._wait_for_ai_greeting_done 用

        灵宝不会主动问候用户（连续模式只在用户说话后触发），
        始终返回空字符串 → runner 视为 ai_was_speaking=False，
        立即跳过等待 AI 问候的逻辑。
        """
        return ""

    def take_screenshot(self, path: str):
        """OCR 模式下用 ADB 截图替代 Appium driver.save_screenshot"""
        device = self.device_config.device_name
        try:
            with open(path, "wb") as fout:
                subprocess.run(
                    ["adb", "-s", device, "exec-out", "screencap", "-p"],
                    stdout=fout, timeout=5,
                )
            logger.debug(f"[灵宝] 截图已保存: {path}")
        except Exception as e:
            logger.warning(f"[灵宝] 截图失败: {e}")

    def capture_element_info(self, path: str):
        """灵宝没有 UI 元素树（Unity），保存最近一次 OCR 结果"""
        try:
            lines = self._ocr_screen(force_refresh=True)
            with open(path, "w", encoding="utf-8") as f:
                for (x1, y1, x2, y2), txt in lines:
                    f.write(f"{x1},{y1},{x2},{y2}\t{txt}\n")
            logger.debug(f"[灵宝] OCR 结果已保存: {path}")
        except Exception as e:
            logger.warning(f"[灵宝] capture_element_info 失败: {e}")
