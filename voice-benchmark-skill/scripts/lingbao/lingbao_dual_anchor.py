#!/usr/bin/env python3
"""
lingbao_dual_anchor.py — 灵宝 TTFT 的 dumpsys 双锚点测量（G 方案最终版）

================================================================================
这是 2026-06-02 G 方案完整探索的沉淀版本，重建自丢失的 /tmp/lingbao_g_v4/v5。
所有参数和逻辑均来自当日实证（见 .workbuddy/memory/2026-06-02.md）。
================================================================================

核心方法学
----------
灵宝（王者荣耀大厅 AI）在 Unity OpenGL 上无法用 UiAutomator dump，原 OCR 锚点有
~1000ms 视觉延迟 + 抖动。本方案改用 AudioFlinger 的 Signal power history 做双锚点：

  ┌─ INPUT thread  (AudioIn_56, AUDIO_SOURCE_MIC, 16kHz)
  │    注入语音 → sgame 录音流 dB 跳起（baseline -79 → -17 dBFS，Δ≈60dB）
  │    用途：① 确认注入真的到达 sgame ② 标定 t_audio_arrive（设备时间内）
  │
  └─ OUTPUT thread (AudioOut_D, PRIMARY, 48kHz)
       灵宝 TTS 起播 → dB 跳起
       用途：标定 t_tts_start

  TTFT = t_tts_start - t_audio_end_device

关键验证结论（2026-06-02 N=10）
-------------------------------
✅ injectAudio 不崩 emulator（之前崩是老 crashpad 残骸污染，清场后稳定 41min+）
✅ INPUT 锚点 SNR 极佳（60dB 跳变），是比 OUTPUT 更可靠的「注入到达」锚点
✅ `-allow-host-audio` 与 injectAudio 路径无关；运行时可 `adb emu avd hostmicon`
✅ history 跟随 PRIMARY active write 自动滚动（~130ms/行，7.5 rows/s）
✅ 连续对话模式下 sgame 自动持有麦克风，注入前 tap 一下中央激活更稳

⚠️ 已知坑（本版已修复）
  1. OUTPUT 默认阈值 -45 太宽松 → 把 PRIMARY floor 抖动（-50~-44）误判成 TTS。
     → 本版默认 OUTPUT 阈值 -35 dBFS + 连续 N≥3 帧持续判定。
  2. cooldown 不足导致上一轮 TTS 残留污染下一轮 baseline（round 失败）。
     → 本版默认 cooldown 18s，且每轮重测 baseline，残留过高自动延长等待。
  3. gRPC fork 噪声淹没 stdout → 本版所有日志走 stderr + flush。

用法
----
    # 单次验证（详细 trace）
    python lingbao_dual_anchor.py once

    # N 轮循环统计
    python lingbao_dual_anchor.py loop <N> [cooldown_sec=18]

依赖前置
--------
  - emulator 已起（Honor_Lingbao_API_34 + lingbao_logged_in 快照，-grpc 8554）
  - 灵宝已导航到「连续对话准备态」（navigate_lingbao.sh）
  - sgame 在前台
"""
import sys, os, time, subprocess, threading, json, re, statistics
from datetime import datetime

PROJ = "/Users/licong/Downloads/VoiceBench/voice-benchmark-skill/scripts"
sys.path.insert(0, PROJ)

ADB = "/Users/licong/Library/Android/sdk/platform-tools/adb"
WAV_HELLO = f"{PROJ}/assets/audio/hello_nihao_edge_48k.wav"
WAV_MATH = f"{PROJ}/assets/audio/math_question_edge_48k.wav"
START_EMULATOR_SH = f"{PROJ}/start_honor_emulator.sh"

# 默认用更长的数学问题语料（1.94s），比「你好」更容易触发灵宝完整回应（VAD 友好）
DEFAULT_WAV = WAV_MATH

# 灵宝聆听激活点。新版 v11.3.1.51 王者强制横屏 (2400x1080)。
# 关键发现 2026-06-18（已复测修正）：挂机久了连续模式会话休眠，必须 tap 精灵本体
# (1200,560) 唤醒会话 → 3/3 回话 -18dB。tap mic 按钮 (1080,1010) 无效（旧坐标已废弃）。
# ★ 唤醒坐标 = 灵宝精灵中心（横屏坐标系 x:0-2400, y:0-1080）。
# 实测 2026-06-18：挂机久了连续模式会话会休眠（UI 仍显示「连续」但 VAD 会话已睡），
# 此时注入只到 INPUT、灵宝不回话（OUTPUT 全 floor）。tap 精灵中心可激活会话 → 3/3 回话 -18dB。
# 注意：tap mic 按钮(1080,1010) 无效，必须 tap 精灵本体(1200,560)。
TAP_X, TAP_Y = 1200, 560

# ---- 阈值参数（来自 2026-06-02 实证修正）----
# ★ OUTPUT TTS 起播检测 = 纯【相对 floor】自校准（2026-06-18 精度终版）
# 背景实测：
#   - settle 后真 floor 极干净，-58 ~ -73 dBFS（tap 精灵唤醒后系统更静）
#   - 灵宝 TTS 回话音量【逐轮波动极大】：响轮峰 -15dB，弱轮整段仅 -61dB（贴 floor）
#   - 旧逻辑 out_dyn = max(-50, floor+5)：floor=-71 时被 -50 钳死 → 弱轮(-61) 永远漏抓 → 沉默假象
# ★ 修正：动态阈值 = floor + OUT_DELTA，仅设【绝对上限】OUT_TH_CAP 防 floor 异常高时阈值过严。
#   onset = 首个 db > 动态阈值 且持续 OUT_CONSEC 帧的点（连续段起点 = 真 TTS 第一声）。
#   DELTA=6dB：稳越 floor ±2dB 抖动，抓到斜坡真第一帧（无论响/弱），消除斜坡形状方差。
OUT_DELTA = 6.0
OUT_TH_CAP = -42.0         # 动态阈值上限：floor+6 不得高于 -42（否则弱轮 TTS body -45~-50 漏抓）
OUT_CONSEC = 2             # 2 帧确认（去单点 floor 尖峰，又不延迟锚点）
# 高精度修正(2026-06-22)：连续模式 INPUT floor 偶尔抬到 -27~-36，旧 -30 会误把底噪/残留当 IN。
# 真注入到达 = -14~-17dBFS，故使用更严格的绝对阈值 -24，并叠加 baseline+10dB 动态阈值。
IN_THRESHOLD = -24.0       # INPUT 注入到达绝对阈值（真注入 -14~-17，连续模式底噪约 -27 以下）
IN_DELTA = 10.0            # INPUT 动态阈值 = max(IN_THRESHOLD, in_floor + 10dB)
SETTLE_FLOOR = -49.0       # 注入前要求 OUTPUT 最近峰值低于此值（确认上轮 TTS 已消散）
# 比 OUT_THRESHOLD(-50) 略高 1dB，避免 settle 判定与 onset 判定打架；
# 实测 floor -53~-57，TTS 残留 -42~-46，-49 能可靠区分「已 settle」vs「仍有残留」。
TAIL_SAMPLES = 20          # 最近 20 个 50ms 样本≈1s，用于 floor/settle；比按行 tail 更准
SAMPLE_STEP_SEC = 0.050    # AudioFlinger Signal power history 每个 dB 样本约 50ms
OUT_POST_AUDIO_GUARD = 0.05  # OUT 必须晚于 audio_end+50ms，彻底排除注入串扰/回放残留

log = lambda *a: print(*a, file=sys.stderr, flush=True)

LINE_RE = re.compile(r'^\s+(\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}\.\d{3}):\s+(-?\d+\.\d+(?:\s+-?\d+\.\d+)*)')


def _wav_duration(wav_path):
    """从 wav 头读真实时长（秒）。"""
    import wave
    with wave.open(wav_path, 'rb') as wf:
        return wf.getnframes() / wf.getframerate()


def _adb(*args):
    return subprocess.check_output([ADB, *args], text=True, stderr=subprocess.DEVNULL)


def dump_af():
    return _adb("shell", "dumpsys", "media.audio_flinger")


def parse_thread_history(out, thread_kind):
    """
    thread_kind: 'Input' 或 'Output'
    合并该类型【所有】线程的 history（关键修复 2026-06-18）。

    背景：新版王者 v11.3.1.51 灵宝 TTS 走 MIXER thread，而非旧版 AudioOut_D。
    若只取第一个有 history 的 thread，会漏掉 TTS 所在的 thread。
    故合并所有同类 thread 的 history 行，同一时间戳取各 thread 的最大 dB。
    rows: [(ts_unix, ts_str, [db,...]), ...] 按时间排序。
    """
    blocks = re.split(r'\n(?=Input thread |Output thread )', out)
    merged = {}  # ts_str -> (ts_unix, [max db across threads])
    for b in blocks:
        if not b.startswith(f"{thread_kind} thread"):
            continue
        for ts_unix, ts_str, dbs in _parse_block_history(b):
            mx = max(dbs)
            if ts_str not in merged or mx > max(merged[ts_str][1]):
                merged[ts_str] = (ts_unix, dbs)
    rows = [(v[0], k, v[1]) for k, v in merged.items()]
    rows.sort(key=lambda r: r[0])
    return rows


def _parse_block_history(block):
    in_hist = False
    rows = []
    year = datetime.now().year
    for line in block.splitlines():
        if 'Signal power history:' in line:
            in_hist = True
            continue
        if in_hist:
            m = LINE_RE.match(line)
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


# =============== 双线程监听器 ===============
def listen_thread(kind, threshold, consec, stop_evt, deadline, result):
    """
    监听 INPUT 或 OUTPUT history。
    consec>1 时要求连续 consec 个 dB 值 > threshold 才记 anchor（去假阳性）。
    """
    last_seen_ts = 0
    samples = []
    anchor_ts = None
    anchor_db = None
    n_polls = 0
    run_above = 0  # 连续超阈计数

    # baseline
    try:
        rows = parse_thread_history(dump_af(), kind)
        if rows:
            last_seen_ts = rows[-1][0]
            bvals = [v for r in rows for v in r[2]]
            result['baseline_db'] = round(sum(bvals) / len(bvals), 1)
            result['baseline_max'] = round(max(bvals), 1)
    except Exception as e:
        log(f"[{kind}] baseline err: {e}")

    while not stop_evt.is_set() and time.time() < deadline:
        n_polls += 1
        try:
            rows = parse_thread_history(dump_af(), kind)
        except Exception:
            time.sleep(0.04)
            continue
        for ts_unix, ts_str, dbs in rows:
            if ts_unix <= last_seen_ts:
                continue
            row_max = max(dbs)
            samples.append((ts_unix, ts_str, row_max))
            # 逐帧扫描连续超阈
            for idx, db in enumerate(dbs):
                if db > threshold:
                    run_above += 1
                    if run_above >= consec and anchor_ts is None:
                        # 锚点取连续段的起点（回退 consec-1 帧）
                        anchor_ts = ts_unix + max(0, idx - (consec - 1)) * 0.050
                        anchor_db = db
                        al = datetime.fromtimestamp(anchor_ts).strftime("%H:%M:%S.%f")[:-3]
                        log(f"[{kind}] 🎯 ANCHOR {al} (row={ts_str}) db={db:.1f} (consec={consec})")
                else:
                    run_above = 0
            last_seen_ts = ts_unix
        if anchor_ts is not None and kind == 'Input':
            # INPUT 锚点找到即可（注入到达确认），不必继续；OUTPUT 要继续等
            pass
        time.sleep(0.04)

    result['samples'] = samples
    result['anchor_ts'] = anchor_ts
    result['anchor_db'] = anchor_db
    result['n_polls'] = n_polls


def _collect_merged(kind):
    """单次 dump，返回该 kind 所有 thread 合并的 {ts_str: max_db}。ts_str 含日期前缀。"""
    out = dump_af()
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
    """单次 dump，展开 Signal power history 每个 50ms dB 样本并合并所有同类线程。

    旧逻辑只保留每行 max_db 和行时间戳，若一行包含多个 50ms 样本，会损失 idx*50ms
    的时间信息，锚点误差可达数百毫秒。高精度目标(<=100ms)必须展开到样本级：
    sample_ts = row_ts + idx * 50ms。同一 timestamp/key 多线程取最大 dB。
    返回 [(sample_ts_unix, sample_key, db)]，按 sample_ts 排序。
    """
    out = dump_af()
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


def _tail_sample_max(samples, n=TAIL_SAMPLES):
    """最近 n 个 50ms 样本的峰值；无样本返回 -200。"""
    if not samples:
        return -200.0
    return max(db for _, _, db in samples[-n:])


def _fmt_ts(ts_unix):
    return datetime.fromtimestamp(ts_unix).strftime("%m-%d %H:%M:%S.%f")[:-3]


def _ts_str_to_unix(ts_str):
    year = datetime.now().year
    return datetime.strptime(f"{year}-{ts_str}", "%Y-%m-%d %H:%M:%S.%f").timestamp()


def run_once(wav=DEFAULT_WAV, tap_first=True, watch_sec=12.0, verbose=True):
    """
    单轮 TTFT 测量（2026-06-18 串行单线程架构，验证 5/5 成功）。

    架构变更（关键）：放弃双线程并发监听 —— 两个 listen_thread 各自高频 dumpsys
    会抢 adb 带宽、互相拖慢，导致 OUTPUT 的短脉冲 TTS（peak 仅持续 ~0.5-1s）漏抓。
    改为：注入 → 单线程串行高频轮询，每次 dump 同时解析 INPUT+OUTPUT 合并 history。

    流程：
      1. baseline：采一次 INPUT/OUTPUT，记录已见 ts（避免旧行误锚）
      2. 注入（连续模式灵宝常驻聆听，无需 tap；实测 tap 与否都 5/5 触发）
      3. 高频轮询 watch_sec：找 INPUT 首次 >IN_TH（注入到达）+ OUTPUT 连续 >OUT_TH（TTS 起播）
      4. TTFT = out_anchor - (in_anchor + audio_dur)  —— 全程设备时钟，无 host skew
    """
    from src.audio.virtual_mic import EmulatorMicInjector

    audio_dur = _wav_duration(wav)

    # 0) 严格等待 settle：上一轮注入/TTS 残留若未消散，会污染 baseline → 误锚。
    #    高精度目标下宁可本轮失败，也绝不在 high floor 下继续测出假 TTFT。
    settle_deadline = time.time() + 60
    settled = False
    in_max = out_max = -200.0
    while time.time() < settle_deadline:
        out_samples = _collect_merged_samples('Output')
        in_samples = _collect_merged_samples('Input')
        out_max = _tail_sample_max(out_samples)
        in_max = _tail_sample_max(in_samples)
        if out_max < SETTLE_FLOOR and in_max < IN_THRESHOLD:
            settled = True
            break
        if verbose:
            log(f"[once] waiting strict settle: IN_recent={in_max:.1f} OUT_recent={out_max:.1f} "
                f"(need IN<{IN_THRESHOLD} OUT<{SETTLE_FLOOR})")
        time.sleep(2.0)
    if not settled:
        res = {
            "ok": False,
            "ttft_ms": None,
            "error": "SETTLE_TIMEOUT_HIGH_FLOOR",
            "in_baseline_max": round(in_max, 1),
            "out_baseline_max": round(out_max, 1),
            "audio_dur": round(audio_dur, 2),
            "precision_budget_ms": 100,
        }
        if verbose:
            log(f"[once] RESULT: {json.dumps(res, ensure_ascii=False)}")
            log("[once] ⚠️ settle 超时：floor 仍偏高，本轮拒绝输出高精度 TTFT，避免假阳性")
        return res

    # 1) baseline：记录已见【50ms 样本】key，避免把注入前旧峰当锚点
    in_samples0 = _collect_merged_samples('Input')
    out_samples0 = _collect_merged_samples('Output')
    in_seen = {key for _, key, _ in in_samples0}
    out_seen = {key for _, key, _ in out_samples0}
    in_base_max = _tail_sample_max(in_samples0)
    out_base_max = _tail_sample_max(out_samples0)

    # 2) tap 精灵唤醒会话（默认 True，必需）。
    if tap_first:
        try:
            _adb("shell", "input", "tap", str(TAP_X), str(TAP_Y))
            time.sleep(1.0)  # 等精灵唤醒动画 + 会话激活
        except Exception as e:
            log(f"[once] tap err: {e}")

    # 3) 注入（同步阻塞，返回即播完；AudioFlinger history 保留注入期间样本）
    mic = EmulatorMicInjector()
    mic.connect()
    mic.inject_wav(wav)
    mic.disconnect()
    if verbose:
        log(f"[once] injected {os.path.basename(wav)} dur={audio_dur:.3f}s "
            f"(baseline IN={in_base_max:.1f} OUT={out_base_max:.1f} dBFS)")

    # 4) 串行高频轮询，锚点精度 = AudioFlinger 样本级 50ms，而非 dumpsys 轮询周期
    out_dyn_th = min(OUT_TH_CAP, out_base_max + OUT_DELTA)
    in_dyn_th = max(IN_THRESHOLD, in_base_max + IN_DELTA)
    if verbose:
        log(f"[once] INPUT dyn threshold = {in_dyn_th:.1f} dBFS "
            f"(max abs {IN_THRESHOLD}, floor {in_base_max:.1f}+{IN_DELTA})")
        log(f"[once] OUTPUT dyn threshold = {out_dyn_th:.1f} dBFS "
            f"(floor {out_base_max:.1f}+{OUT_DELTA}, cap {OUT_TH_CAP})")
    in_anchor = None   # 设备时钟：注入语音【开始】到达 sgame 麦克风流
    out_anchor = None  # 设备时钟：TTS【起播】
    in_anchor_db = out_anchor_db = None
    out_run = 0
    deadline = time.time() + watch_sec
    n_polls = 0
    while time.time() < deadline:
        n_polls += 1
        in_samples = _collect_merged_samples('Input')
        out_samples = _collect_merged_samples('Output')
        # --- INPUT：找注入到达（首个 > 动态阈值的新 50ms 样本）---
        for ts_unix, key, db in in_samples:
            if key in in_seen:
                continue
            in_seen.add(key)
            if db > in_dyn_th and in_anchor is None:
                in_anchor = ts_unix
                in_anchor_db = db
                if verbose:
                    log(f"[once] 🎤 IN  ANCHOR {_fmt_ts(ts_unix)} db={db:.1f}")
        # --- OUTPUT：仅在 audio_end 之后找 TTS，彻底排除注入串扰/回放残留 ---
        for ts_unix, key, db in out_samples:
            if key in out_seen:
                continue
            out_seen.add(key)
            if in_anchor is None:
                continue
            min_out_ts = in_anchor + audio_dur + OUT_POST_AUDIO_GUARD
            if ts_unix <= min_out_ts:
                continue
            if db > out_dyn_th:
                out_run += 1
                if out_run >= OUT_CONSEC and out_anchor is None:
                    # 锚点取连续段起点，回退 (OUT_CONSEC-1)*50ms
                    out_anchor = ts_unix - (OUT_CONSEC - 1) * SAMPLE_STEP_SEC
                    out_anchor_db = db
                    if verbose:
                        log(f"[once] 🔊 OUT ANCHOR {_fmt_ts(out_anchor)} db={db:.1f} <<< TTS")
            else:
                out_run = 0
        if in_anchor and out_anchor:
            break
        time.sleep(0.1)

    # ★ TTFT 全程设备时钟（无 host/device skew），量化误差≈50ms，阈值/斜坡误差目标≤100ms
    if in_anchor is not None and out_anchor is not None:
        t_audio_end_device = in_anchor + audio_dur
        ttft_ms = (out_anchor - t_audio_end_device) * 1000
    else:
        ttft_ms = None

    ok = in_anchor is not None and out_anchor is not None and ttft_ms is not None and ttft_ms > 0
    res = {
        "ok": ok,
        "ttft_ms": round(ttft_ms, 0) if ttft_ms is not None else None,
        "in_anchor_db": round(in_anchor_db, 1) if in_anchor_db is not None else None,
        "out_anchor_db": round(out_anchor_db, 1) if out_anchor_db is not None else None,
        "in_baseline_max": round(in_base_max, 1),
        "out_baseline_max": round(out_base_max, 1),
        "in_dyn_threshold": round(in_dyn_th, 1),
        "out_dyn_threshold": round(out_dyn_th, 1),
        "audio_dur": round(audio_dur, 3),
        "polls": n_polls,
        "precision_budget_ms": 100,
        "quantization_ms": int(SAMPLE_STEP_SEC * 1000),
    }
    if verbose:
        log(f"[once] RESULT: {json.dumps(res, ensure_ascii=False)}")
        if not in_anchor:
            log("[once] ⚠️ INPUT 无锚点：注入未到达 sgame（检查 8554 / 灵宝是否在听）")
        if not out_anchor:
            log(f"[once] ⚠️ OUTPUT 无锚点：TTS 未起播或低于 {out_dyn_th:.1f}dBFS（会话可能休眠，需 tap 唤醒）")
    return res


def emulator_alive():
    try:
        out = _adb("devices")
        if "emulator-5554\tdevice" not in out:
            return False
        subprocess.check_output(["lsof", "-nP", "-iTCP:8554", "-sTCP:LISTEN"],
                                text=True, stderr=subprocess.DEVNULL)
        return True
    except Exception:
        return False


def restore_emulator(snapshot="lingbao_logged_in", settle_sec=50):
    """恢复 Honor_Lingbao_API_34 快照，并静默等待 audio gRPC 后端自行初始化。

    emulator 36.6.2 + macOS 的 audio gRPC 后端概率性不稳定；失败后不要原地
    重试注入，应 fresh 恢复 qemu。恢复后纯等待 settle_sec，期间不注入/不探测。
    """
    log(f"[restore] start emulator snapshot={snapshot} ...")
    try:
        subprocess.run(["adb", "kill-server"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=10)
    except Exception:
        pass
    r = subprocess.run(["bash", START_EMULATOR_SH, snapshot], text=True,
                       stdout=subprocess.PIPE, stderr=subprocess.STDOUT, timeout=360)
    tail = "\n".join((r.stdout or "").splitlines()[-8:])
    log(tail)
    if r.returncode != 0:
        log(f"[restore] start_honor_emulator rc={r.returncode}")
        return False
    log(f"[restore] silent settle {settle_sec}s (no inject/probe) ...")
    time.sleep(settle_sec)
    ok = emulator_alive()
    log(f"[restore] emulator_alive={ok}")
    return ok


def run_loop(n, cooldown=18.0):
    """N 轮循环，输出统计。失败后自动 fresh 恢复，不让一次 gRPC 崩溃污染后续轮。"""
    if not emulator_alive():
        log("[loop] emulator 不在线，尝试恢复 Honor_Lingbao_API_34 + lingbao_logged_in 快照")
        if not restore_emulator():
            return 2

    results = []
    for i in range(1, n + 1):
        log(f"\n{'='*50}\n--- Round {i}/{n} ---")
        if not emulator_alive():
            log(f"[loop] emulator 掉线于 round {i}，fresh 恢复后继续")
            if not restore_emulator():
                results.append({"idx": i, "ok": False, "ttft_ms": None, "error": "RESTORE_FAILED"})
                continue
        # 等上一轮 TTS 残留消散
        if i > 1:
            log(f"[loop] cooldown {cooldown}s...")
            time.sleep(cooldown)
            # 检查 OUTPUT 最近 50ms 样本是否已降到 floor
            try:
                samples = _collect_merged_samples('Output')
                if samples:
                    bmax = _tail_sample_max(samples)
                    if bmax > SETTLE_FLOOR:
                        log(f"[loop] OUTPUT recent_max={bmax:.1f} 仍高，额外等 8s")
                        time.sleep(8)
            except Exception:
                pass
        try:
            r = run_once(verbose=True)
        except Exception as e:
            r = {"ok": False, "ttft_ms": None, "error": f"EXCEPTION: {type(e).__name__}: {str(e)[:160]}"}
            log(f"[loop] round {i} exception: {r['error']}")
            if not emulator_alive():
                log(f"[loop] round {i} 后 emulator/gRPC 已挂，fresh 恢复...")
                restore_emulator()
        r['idx'] = i
        results.append(r)
        log(f"[loop] round {i}: ok={r.get('ok')} ttft={r.get('ttft_ms')}ms "
            f"in_db={r.get('in_anchor_db')} out_db={r.get('out_anchor_db')} error={r.get('error')}")

    # 落盘
    ts = int(time.time())
    out_json = f"{PROJ}/lingbao/results/dual_anchor_n{n}_{ts}.json"
    os.makedirs(os.path.dirname(out_json), exist_ok=True)
    with open(out_json, "w") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

    # 统计
    ok = [r for r in results if r['ok']]
    log(f"\n{'='*50}\n=== LOOP SUMMARY (N={n}) ===")
    log(f"成功率: {len(ok)}/{len(results)} ({100*len(ok)/max(1,len(results)):.0f}%)")
    if ok:
        # 全程设备时钟 TTFT，无需 in_delay 校正（in/out anchor 同源 dumpsys）。
        ttfts = [r['ttft_ms'] for r in ok]
        out_db = [r['out_anchor_db'] for r in ok]
        in_db = [r['in_anchor_db'] for r in ok]

        def st(vals, name, unit):
            s = sorted(vals)
            p95 = s[min(len(s) - 1, int(0.95 * len(s)))]
            log(f"{name}: mean={statistics.mean(vals):.0f}{unit} "
                f"median={statistics.median(vals):.0f}{unit} "
                f"std={statistics.pstdev(vals):.0f}{unit} "
                f"min={min(vals):.0f} max={max(vals):.0f} p95={p95:.0f}")
        st(ttfts, "TTFT (设备时钟)", "ms")
        st(out_db, "OUTPUT anchor dB", "dBFS")
        st(in_db, "INPUT anchor dB", "dBFS")
    log(f"results saved: {out_json}")
    return 0


def run_valid(target_valid=3, cooldown=20.0, max_attempts=12):
    """一直跑到拿够 target_valid 个高精度有效样本，或达到 max_attempts。

    用于当前 emulator audio gRPC 概率性崩溃场景：失败自动恢复，最终只统计
    `ok=True` 且带 `precision_budget_ms=100` 的有效样本。
    """
    results = []
    attempts = 0
    while len([r for r in results if r.get('ok')]) < target_valid and attempts < max_attempts:
        attempts += 1
        log(f"\n{'='*50}\n--- Attempt {attempts}/{max_attempts} (valid {len([r for r in results if r.get('ok')])}/{target_valid}) ---")
        if not emulator_alive():
            if not restore_emulator():
                results.append({"idx": attempts, "ok": False, "ttft_ms": None, "error": "RESTORE_FAILED"})
                continue
        if attempts > 1:
            log(f"[valid] cooldown {cooldown}s...")
            time.sleep(cooldown)
        try:
            r = run_once(verbose=True)
        except Exception as e:
            r = {"ok": False, "ttft_ms": None, "error": f"EXCEPTION: {type(e).__name__}: {str(e)[:160]}"}
            log(f"[valid] attempt {attempts} exception: {r['error']}")
            if not emulator_alive() and attempts < max_attempts:
                log("[valid] emulator/gRPC 已挂，fresh 恢复...")
                restore_emulator()
            elif not emulator_alive():
                log("[valid] emulator/gRPC 已挂，但已到 max_attempts，不再额外恢复")
        r['idx'] = attempts
        results.append(r)
        log(f"[valid] attempt {attempts}: ok={r.get('ok')} ttft={r.get('ttft_ms')}ms error={r.get('error')}")

    ts = int(time.time())
    out_json = f"{PROJ}/lingbao/results/dual_anchor_valid{target_valid}_{ts}.json"
    os.makedirs(os.path.dirname(out_json), exist_ok=True)
    with open(out_json, "w") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

    ok = [r for r in results if r.get('ok')]
    log(f"\n{'='*50}\n=== VALID SUMMARY ===")
    log(f"有效样本: {len(ok)}/{target_valid}; attempts={attempts}/{max_attempts}")
    if ok:
        ttfts = [r['ttft_ms'] for r in ok]
        log(f"TTFT valid: mean={statistics.mean(ttfts):.0f}ms median={statistics.median(ttfts):.0f}ms "
            f"std={statistics.pstdev(ttfts):.0f}ms min={min(ttfts):.0f} max={max(ttfts):.0f}")
        log("precision: AudioFlinger sample quantization=50ms, accepted budget<=100ms")
    log(f"results saved: {out_json}")
    return 0 if len(ok) >= target_valid else 1


if __name__ == "__main__":
    mode = sys.argv[1] if len(sys.argv) > 1 else "once"
    if mode == "once":
        run_once()
    elif mode == "loop":
        n = int(sys.argv[2]) if len(sys.argv) > 2 else 10
        cd = float(sys.argv[3]) if len(sys.argv) > 3 else 18.0
        sys.exit(run_loop(n, cd))
    elif mode == "valid":
        n = int(sys.argv[2]) if len(sys.argv) > 2 else 3
        cd = float(sys.argv[3]) if len(sys.argv) > 3 else 20.0
        max_attempts = int(sys.argv[4]) if len(sys.argv) > 4 else max(12, n * 4)
        sys.exit(run_valid(n, cd, max_attempts))
    else:
        print(__doc__)
        sys.exit(1)
