#!/usr/bin/env python3
"""
audioflinger_anchor.py — 通过 polling `adb shell dumpsys media.audio_flinger`
从 Signal power history 提取实时音频功率（dBFS），监听首次 dB 跳起作为 ai_start anchor。

核心原理：
- AudioFlinger Output thread (AudioOut_D) 在 PRIMARY 输出每 ~100ms 计算 RMS dB 写入 Signal power history
- dumpsys 返回的 history 是滚动窗口（最近 ~3-5 秒），每行格式: "MM-DD HH:MM:SS.mmm: -dB1 -dB2 ... -dB10" (10 个值=500ms)
- baseline ~-65~-77 dBFS（sgame 静音/微弱底噪）
- TTS 起播时 dB 会瞬间跳到 -10~-30 dBFS

用法:
    python audioflinger_anchor.py [duration_sec] [threshold_dbfs] [poll_interval_ms]

参数:
    duration_sec     默认 30
    threshold_dbfs   超过此值视为有效音频（默认 -40，即比 baseline 高 25dB+）
    poll_interval_ms 默认 50ms

输出（stdout）:
    {"baseline_db": -68.5, "anchor_ts_unix": 1780407834.488, "anchor_db": -23.2, "first_high_offset_ms": 1234, "polls": 287, "max_db": -10.5}
"""
import sys, re, time, json, subprocess
from datetime import datetime

ADB = "adb"
LINE_RE = re.compile(r'^\s+(\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}\.\d{3}):\s+(-?\d+\.\d+(?:\s+-?\d+\.\d+)*)')


def parse_history(out):
    """从 dumpsys 输出解析 Signal power history 的所有 (timestamp, dB_list) 行"""
    in_hist = False
    rows = []
    for line in out.splitlines():
        if 'Signal power history:' in line:
            in_hist = True
            continue
        if in_hist:
            m = LINE_RE.match(line)
            if m:
                ts_str = m.group(1)
                # 解析 "MM-DD HH:MM:SS.mmm" → unix
                # 当前年份补齐
                year = datetime.now().year
                full = f"{year}-{ts_str}"
                try:
                    dt = datetime.strptime(full, "%Y-%m-%d %H:%M:%S.%f")
                    ts_unix = dt.timestamp()
                except Exception:
                    continue
                # 解析 dB 列表
                vals = re.findall(r'-?\d+\.\d+', m.group(2))
                dbs = [float(v) for v in vals]
                rows.append((ts_unix, ts_str, dbs))
            elif line.startswith('  ') and ('Last write' in line or 'Track' in line or 'thread' in line):
                in_hist = False
    return rows


def dump_audio_flinger():
    """调一次 dumpsys"""
    return subprocess.check_output(
        [ADB, "shell", "dumpsys", "media.audio_flinger"],
        text=True, stderr=subprocess.DEVNULL,
    )


def main(duration=30.0, threshold=-40.0, poll_ms=50):
    log = lambda *a: print(*a, file=sys.stderr, flush=True)

    log(f"[anchor] duration={duration}s threshold={threshold}dBFS poll={poll_ms}ms")
    log(f"[anchor] start at host time {time.time():.3f}")

    # 1) baseline: 取首次 dump
    out = dump_audio_flinger()
    rows = parse_history(out)
    if not rows:
        log("[anchor] ERROR: no Signal power history found in baseline dump")
        return 2
    last_seen_ts = rows[-1][0]
    all_baseline = [v for r in rows for v in r[2]]
    baseline_db = sum(all_baseline) / len(all_baseline) if all_baseline else -100
    log(f"[anchor] baseline: {len(rows)} rows, mean_db={baseline_db:.1f}, last_ts={rows[-1][1]}")

    # 2) loop poll: 监测新行 → 找首次跳起到 threshold 之上的值
    t_start = time.time()
    deadline = t_start + duration
    anchor_ts = None
    anchor_db = None
    first_high_offset_ms = None
    max_db = -200
    n_polls = 0

    while time.time() < deadline:
        n_polls += 1
        out = dump_audio_flinger()
        rows = parse_history(out)
        if not rows:
            time.sleep(poll_ms / 1000.0)
            continue

        # 取所有 timestamp > last_seen_ts 的新行
        for ts_unix, ts_str, dbs in rows:
            if ts_unix <= last_seen_ts:
                continue
            # 行内每个 dB 值代表 ~50ms 的能量。检测首次 cross threshold
            for idx, db in enumerate(dbs):
                if db > max_db:
                    max_db = db
                if db > threshold and anchor_ts is None:
                    # 首次跳起：用行 timestamp + idx*50ms 作为锚点
                    anchor_ts = ts_unix + idx * 0.050
                    anchor_db = db
                    first_high_offset_ms = (anchor_ts - t_start) * 1000
                    log(f"[anchor] 🎯 FIRST HIGH at {ts_str}+{idx*50}ms db={db:.1f} (offset {first_high_offset_ms:.0f}ms)")
            last_seen_ts = ts_unix

        if anchor_ts is not None:
            break  # 找到首次跳起就立刻退出
        time.sleep(poll_ms / 1000.0)

    elapsed = time.time() - t_start
    result = {
        "baseline_db": round(baseline_db, 2),
        "anchor_ts_unix": anchor_ts,
        "anchor_db": anchor_db,
        "first_high_offset_ms": round(first_high_offset_ms, 1) if first_high_offset_ms else None,
        "polls": n_polls,
        "max_db": round(max_db, 2),
        "elapsed_sec": round(elapsed, 2),
        "threshold_used": threshold,
    }
    print(json.dumps(result), flush=True)
    log(f"[anchor] DONE: {result}")
    return 0 if anchor_ts else 1


if __name__ == "__main__":
    duration = float(sys.argv[1]) if len(sys.argv) > 1 else 30.0
    threshold = float(sys.argv[2]) if len(sys.argv) > 2 else -40.0
    poll_ms = int(sys.argv[3]) if len(sys.argv) > 3 else 50
    sys.exit(main(duration, threshold, poll_ms))
