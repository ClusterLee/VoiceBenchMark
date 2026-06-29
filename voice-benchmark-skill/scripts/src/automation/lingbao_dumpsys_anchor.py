#!/usr/bin/env python3
"""
lingbao_dumpsys_anchor.py — 灵宝 TTFT 的 dumpsys 双锚点测量（runner 集成版 / Phase 2 锚点）

================================================================================
本模块把 scripts/lingbao/lingbao_dual_anchor.py 已验证（N=10 100%）的双锚点方法学
封装为可被 runner.py 复用的类 LingbaoDumpsysAnchor。

与独立脚本 lingbao_dual_anchor.py 的区别：
  - 独立脚本：自包含（含 settle + tap 唤醒 + 注入 + 监听 + 算 TTFT），用于单跑/调试。
  - 本封装类：【不负责注入】。注入由 runner 的现有 gRPC 注入器统一控制，避免双重注入。
    本类只提供三步生命周期，供 runner 在注入前后挂钩：
      1. prime(tap_wake=True)  —— 注入前：settle 等待 + 记录 baseline + tap 精灵唤醒会话
      2. start(t_inject)       —— 注入后立即调用：启动后台监听线程，抓 IN/OUT 锚点
      3. result(audio_dur)     —— OCR 检测完后调用：停线程，算设备时钟 TTFT

方法学（与 lingbao_dual_anchor.py 完全一致）
--------------------------------------------
  INPUT thread (AUDIO_SOURCE_MIC, 16kHz)：注入到达 → dB 跳起，标定 in_anchor（设备时钟）
  OUTPUT thread (MIXER/PRIMARY, 48kHz) ：灵宝 TTS 起播 → dB 跳起，标定 out_anchor
  TTFT = out_anchor - (in_anchor + audio_dur)   —— 全程设备时钟，无 host/device skew

关键正确性保证（2026-06-18 实证）
--------------------------------
  1. 合并所有同类 thread 的 history（新版王者 TTS 走 MIXER 非 AudioOut_D）
  2. 物理因果约束：out_anchor ts 必须晚于 in_anchor（否则匹配到上轮 TTS 残留 → 负 TTFT）
  3. 纯相对 floor 动态阈值（floor+6dB, cap -42）：消除 TTS 渐强斜坡形状方差
  4. floor 只取最近 6 行（_tail_max）：避免 buffer 内上轮 TTS 残留污染 floor → 阈值虚高
  5. IN 锚点阈值 -30：远高于任何残留，确保 IN 锚点是真注入而非回声污染
  6. tap 精灵本体(1200,560)唤醒会话：挂机久连续模式会休眠，不 tap 则灵宝沉默
"""
import os
import re
import time
import threading
import subprocess
from datetime import datetime

ADB = "/Users/licong/Library/Android/sdk/platform-tools/adb"

# ---- 阈值参数（与 lingbao_dual_anchor.py 同源，2026-06-18 实证终版）----
OUT_DELTA = 6.0            # OUTPUT 动态阈值 = floor + DELTA（相对 floor 自校准）
OUT_TH_CAP = -42.0         # 动态阈值上限：floor+6 不得高于 -42（防 floor 异常高漏抓弱轮 TTS）
OUT_CONSEC = 2             # 连续 2 帧确认（去 floor 单点尖峰，又不延迟锚点）
# 高精度修正(2026-06-22)：连续模式 INPUT floor 偶尔抬到 -27~-36，旧 -30 会误把底噪/残留当 IN。
# 真注入到达 = -14~-17dBFS，故使用更严格的绝对阈值 -24，并叠加 baseline+10dB 动态阈值。
IN_THRESHOLD = -24.0       # INPUT 注入到达绝对阈值（真注入 -14~-17，连续模式底噪约 -27 以下）
IN_DELTA = 10.0            # INPUT 动态阈值 = max(IN_THRESHOLD, in_floor + 10dB)
SETTLE_FLOOR = -49.0       # 注入前要求 OUTPUT 最近峰值低于此（确认上轮 TTS 已消散）
TAIL_SAMPLES = 20          # 最近 20 个 50ms 样本≈1s，用于 floor/settle
SAMPLE_STEP_SEC = 0.050    # AudioFlinger Signal power history 每个 dB 样本约 50ms
OUT_POST_AUDIO_GUARD = 0.05  # OUT 必须晚于 audio_end+50ms，排除注入串扰/回放残留

# 灵宝精灵唤醒坐标（新版 v11.3.1.51 王者强制横屏 2400x1080；精灵中心）
TAP_X, TAP_Y = 1200, 560

_LINE_RE = re.compile(
    r'^\s+(\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}\.\d{3}):\s+(-?\d+\.\d+(?:\s+-?\d+\.\d+)*)'
)


def _adb(*args):
    return subprocess.check_output([ADB, *args], text=True, stderr=subprocess.DEVNULL)


def _dump_af():
    return _adb("shell", "dumpsys", "media.audio_flinger")


def _parse_block_history(block):
    in_hist = False
    rows = []
    year = datetime.now().year
    for line in block.splitlines():
        if 'Signal power history:' in line:
            in_hist = True
            continue
        if in_hist:
            m = _LINE_RE.match(line)
            if m:
                ts_str = m.group(1)
                try:
                    dt = datetime.strptime(f"{year}-{ts_str}", "%Y-%m-%d %H:%M:%S.%f")
                    ts_unix = dt.timestamp()
                except Exception:
                    continue
                vals = re.findall(r'-?\d+\.\d+', m.group(2))
                rows.append((ts_unix, ts_str, [float(v) for v in vals]))
            elif 'Last write' in line or line.strip() == '':
                in_hist = False
    return rows


def _collect_merged(kind):
    """单次 dump，返回该 kind 所有 thread 合并的 {ts_str: max_db}。"""
    out = _dump_af()
    blocks = re.split(r'\n(?=Input thread |Output thread )', out)
    rows = {}
    for b in blocks:
        if not b.startswith(f"{kind} thread"):
            continue
        for ts_unix, ts_str, dbs in _parse_block_history(b):
            mx = max(dbs)
            if ts_str not in rows or mx > rows[ts_str]:
                rows[ts_str] = mx
    return rows


def _collect_merged_samples(kind):
    """展开 Signal power history 每个 50ms dB 样本并合并所有同类线程。

    高精度目标(<=100ms)不能只用每行时间戳；若一行含多个 dB 样本，
    必须用 sample_ts = row_ts + idx*50ms，否则锚点误差可达数百毫秒。
    返回 [(sample_ts_unix, sample_key, db)]，按 sample_ts 排序。
    """
    out = _dump_af()
    blocks = re.split(r'\n(?=Input thread |Output thread )', out)
    merged = {}
    for b in blocks:
        if not b.startswith(f"{kind} thread"):
            continue
        for row_ts_unix, ts_str, dbs in _parse_block_history(b):
            for idx, db in enumerate(dbs):
                sample_ts = row_ts_unix + idx * SAMPLE_STEP_SEC
                sample_key = f"{ts_str}+{idx:02d}"
                if sample_key not in merged or db > merged[sample_key][1]:
                    merged[sample_key] = (sample_ts, db)
    samples = [(ts, key, db) for key, (ts, db) in merged.items()]
    samples.sort(key=lambda r: r[0])
    return samples


def _ts_str_to_unix(ts_str):
    year = datetime.now().year
    return datetime.strptime(f"{year}-{ts_str}", "%Y-%m-%d %H:%M:%S.%f").timestamp()


def _tail_max(rows):
    """兼容旧调用：floor 只取最近 ~6 行的峰值，避免残留污染。"""
    return max([-200] + [rows[k] for k in sorted(rows.keys())[-6:]]) if rows else -200


def _tail_sample_max(samples, n=TAIL_SAMPLES):
    """最近 n 个 50ms 样本的峰值；无样本返回 -200。"""
    if not samples:
        return -200.0
    return max(db for _, _, db in samples[-n:])


def _fmt_ts(ts_unix):
    return datetime.fromtimestamp(ts_unix).strftime("%m-%d %H:%M:%S.%f")[:-3]


class LingbaoDumpsysAnchor:
    """
    灵宝 dumpsys 双锚点测量器（runner 集成 / Phase 2 锚点）。

    生命周期：
        anchor = LingbaoDumpsysAnchor(logger=logger)
        anchor.prime(tap_wake=True)      # 注入前：settle + baseline + tap 唤醒
        t_inject = injector.inject_wav() # runner 注入（本类不注入）
        anchor.start()                   # 注入后立即：启动后台监听
        ... runner 跑 OCR 轮询 ...
        res = anchor.result(audio_dur)   # 检测完：停线程，算 TTFT
    """

    def __init__(self, logger=None, watch_sec=14.0, settle_sec=40.0):
        self.log = logger.info if logger else (lambda *a: print(*a))
        self.warn = logger.warning if logger else (lambda *a: print(*a))
        self.watch_sec = watch_sec
        self.settle_sec = settle_sec

        self._in_seen = set()
        self._out_seen = set()
        self._in_base_max = -200.0
        self._out_base_max = -200.0
        self._in_dyn_th = IN_THRESHOLD
        self._out_dyn_th = OUT_TH_CAP
        self._audio_dur = 0.0

        self._in_anchor = None      # 设备时钟：注入到达
        self._out_anchor = None     # 设备时钟：TTS 起播
        self._in_anchor_db = None
        self._out_anchor_db = None
        self._n_polls = 0

        self._thread = None
        self._stop = threading.Event()

    # ── 1) 注入前：settle + baseline + tap 唤醒 ──
    def prime(self, tap_wake=True):
        """settle 等待上轮残留消散 → 记录 baseline → tap 精灵唤醒会话。"""
        # settle：等 INPUT/OUTPUT 最近 50ms 样本都回落到 floor 附近。
        # 高精度目标下宁可失败，也不能在 high floor 下继续测出假 TTFT。
        deadline = time.time() + self.settle_sec
        settled = False
        in_max = out_max = -200.0
        while time.time() < deadline:
            out_recent = _collect_merged_samples('Output')
            in_recent = _collect_merged_samples('Input')
            out_max = _tail_sample_max(out_recent)
            in_max = _tail_sample_max(in_recent)
            if out_max < SETTLE_FLOOR and in_max < IN_THRESHOLD:
                settled = True
                break
            self.log(f"[dumpsys] waiting strict settle: IN={in_max:.1f} OUT={out_max:.1f} "
                     f"(need IN<{IN_THRESHOLD} OUT<{SETTLE_FLOOR})")
            time.sleep(2.0)
        if not settled:
            raise RuntimeError(
                f"dumpsys strict settle timeout: IN={in_max:.1f} OUT={out_max:.1f}; "
                "refuse high-precision measurement under high floor"
            )

        # baseline：记录已见 50ms 样本（注入前的旧峰不当锚点）
        in_samples0 = _collect_merged_samples('Input')
        out_samples0 = _collect_merged_samples('Output')
        self._in_seen = {key for _, key, _ in in_samples0}
        self._out_seen = {key for _, key, _ in out_samples0}
        self._in_base_max = _tail_sample_max(in_samples0)
        self._out_base_max = _tail_sample_max(out_samples0)
        # 动态阈值：INPUT 更严格，OUTPUT 相对 floor 自校准
        self._in_dyn_th = max(IN_THRESHOLD, self._in_base_max + IN_DELTA)
        self._out_dyn_th = min(OUT_TH_CAP, self._out_base_max + OUT_DELTA)
        self.log(f"[dumpsys] baseline IN={self._in_base_max:.1f} OUT={self._out_base_max:.1f} "
                 f"dBFS → IN dyn threshold={self._in_dyn_th:.1f}, "
                 f"OUT dyn threshold={self._out_dyn_th:.1f}")

        # tap 精灵唤醒会话（挂机久连续模式会休眠）
        if tap_wake:
            try:
                _adb("shell", "input", "tap", str(TAP_X), str(TAP_Y))
                time.sleep(1.0)
            except Exception as e:
                self.warn(f"[dumpsys] tap wake err: {e}")

    # ── 2) 注入后：启动后台监听线程 ──
    def start(self, audio_dur=0.0):
        self._audio_dur = float(audio_dur or 0.0)
        self._stop.clear()
        self._thread = threading.Thread(target=self._watch, daemon=True)
        self._thread.start()

    def _watch(self):
        deadline = time.time() + self.watch_sec
        out_run = 0
        while not self._stop.is_set() and time.time() < deadline:
            self._n_polls += 1
            try:
                in_samples = _collect_merged_samples('Input')
                out_samples = _collect_merged_samples('Output')
            except Exception:
                time.sleep(0.1)
                continue
            # INPUT：找注入到达（首个 > 动态阈值的新 50ms 样本）
            for ts_unix, key, db in in_samples:
                if key in self._in_seen:
                    continue
                self._in_seen.add(key)
                if db > self._in_dyn_th and self._in_anchor is None:
                    self._in_anchor = ts_unix
                    self._in_anchor_db = db
                    self.log(f"[dumpsys] 🎤 IN  ANCHOR {_fmt_ts(ts_unix)} db={db:.1f}")
            # OUTPUT：仅在 audio_end 之后找 TTS，彻底排除注入串扰/回放残留
            for ts_unix, key, db in out_samples:
                if key in self._out_seen:
                    continue
                self._out_seen.add(key)
                if self._in_anchor is None:
                    continue
                min_out_ts = self._in_anchor + self._audio_dur + OUT_POST_AUDIO_GUARD
                if ts_unix <= min_out_ts:
                    continue
                if db > self._out_dyn_th:
                    out_run += 1
                    if out_run >= OUT_CONSEC and self._out_anchor is None:
                        # 锚点取连续段起点，回退 (OUT_CONSEC-1)*50ms
                        self._out_anchor = ts_unix - (OUT_CONSEC - 1) * SAMPLE_STEP_SEC
                        self._out_anchor_db = db
                        self.log(f"[dumpsys] 🔊 OUT ANCHOR {_fmt_ts(self._out_anchor)} db={db:.1f} <<< TTS")
                else:
                    out_run = 0
            if self._in_anchor and self._out_anchor:
                break
            time.sleep(0.1)

    # ── 3) 检测完：停线程，算 TTFT ──
    def result(self, audio_dur):
        self._stop.set()
        if self._thread:
            self._thread.join(timeout=self.watch_sec + 2)

        if self._in_anchor is not None and self._out_anchor is not None:
            t_audio_end_device = self._in_anchor + audio_dur
            ttft_ms = (self._out_anchor - t_audio_end_device) * 1000
        else:
            ttft_ms = None

        ok = (self._in_anchor is not None and self._out_anchor is not None
              and ttft_ms is not None and ttft_ms > 0)
        res = {
            "ok": ok,
            "ttft_ms": round(ttft_ms, 0) if ttft_ms is not None else None,
            "in_anchor_db": round(self._in_anchor_db, 1) if self._in_anchor_db is not None else None,
            "out_anchor_db": round(self._out_anchor_db, 1) if self._out_anchor_db is not None else None,
            "in_baseline_max": round(self._in_base_max, 1),
            "out_baseline_max": round(self._out_base_max, 1),
            "in_dyn_threshold": round(self._in_dyn_th, 1),
            "out_dyn_threshold": round(self._out_dyn_th, 1),
            "audio_dur": round(audio_dur, 3),
            "polls": self._n_polls,
            "precision_budget_ms": 100,
            "quantization_ms": int(SAMPLE_STEP_SEC * 1000),
        }
        if not ok:
            if self._in_anchor is None:
                self.warn("[dumpsys] ⚠️ INPUT 无锚点：注入未到达 sgame（检查 8554 / 灵宝是否在听）")
            if self._out_anchor is None:
                self.warn(f"[dumpsys] ⚠️ OUTPUT 无锚点：TTS 未起播或低于 "
                          f"{self._out_dyn_th:.1f}dBFS（会话可能休眠）")
        return res
