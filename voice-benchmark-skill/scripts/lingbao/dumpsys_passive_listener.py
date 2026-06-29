#!/usr/bin/env python3
"""
dumpsys_passive_listener.py — 被动观测模式

不注入音频，只持续 polling dumpsys media.audio_flinger Signal power history。
用途：
- 验证 PRIMARY output 在 sgame 抢 audio focus 时是否持续输出 dB 序列
- 观察灵宝 TTS 起播时 dB 实际跳起到多少
- 给用户一个"演示窗口"让她手动触发灵宝，我们记录精确时间
"""
import sys, os, time, subprocess, re
from datetime import datetime

ADB = os.path.expanduser("~/Library/Android/sdk/platform-tools/adb")
LINE_RE = re.compile(r'^\s+(\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}\.\d{3}):\s+(-?\d+\.\d+(?:\s+-?\d+\.\d+)*)')


def parse_history(out):
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
                full = f"{datetime.now().year}-{ts_str}"
                try:
                    dt = datetime.strptime(full, "%Y-%m-%d %H:%M:%S.%f")
                    ts_unix = dt.timestamp()
                except Exception:
                    continue
                vals = re.findall(r'-?\d+\.\d+', m.group(2))
                dbs = [float(v) for v in vals]
                rows.append((ts_unix, ts_str, dbs))
            elif line and not line.startswith(' '):
                in_hist = False
    return rows


def main(duration=60, threshold=-40):
    print(f"[passive] starting {duration}s passive observation, threshold={threshold} dBFS", flush=True)
    print(f"[passive] 你可以手动让灵宝说话，我会记录 dB 跳起", flush=True)
    deadline = time.time() + duration
    last_seen_ts = 0
    n_polls = 0
    n_new_rows = 0
    n_peaks = 0
    peak_log = []

    out = subprocess.check_output(
        [ADB, "shell", "dumpsys", "media.audio_flinger"],
        text=True, stderr=subprocess.DEVNULL, timeout=5,
    )
    rows = parse_history(out)
    if rows:
        last_seen_ts = rows[-1][0]
        baseline_mean = sum(v for r in rows for v in r[2]) / sum(len(r[2]) for r in rows)
        print(f"[passive] baseline {len(rows)} rows, last_ts={rows[-1][1]}, mean_db={baseline_mean:.1f}", flush=True)

    while time.time() < deadline:
        n_polls += 1
        try:
            out = subprocess.check_output(
                [ADB, "shell", "dumpsys", "media.audio_flinger"],
                text=True, stderr=subprocess.DEVNULL, timeout=2,
            )
        except Exception as e:
            print(f"[passive] dumpsys err: {e}", flush=True)
            time.sleep(0.1)
            continue
        rows = parse_history(out)
        for ts_unix, ts_str, dbs in rows:
            if ts_unix <= last_seen_ts:
                continue
            n_new_rows += 1
            row_max = max(dbs)
            row_min = min(dbs)
            row_mean = sum(dbs) / len(dbs)
            marker = ""
            if row_max > threshold:
                n_peaks += 1
                marker = f" 🔥 PEAK[idx={dbs.index(row_max)}]"
                peak_log.append((ts_str, row_max, dbs))
            print(f"  ts={ts_str}  max={row_max:6.1f}  min={row_min:6.1f}  mean={row_mean:6.1f}{marker}", flush=True)
            last_seen_ts = ts_unix
        time.sleep(0.1)

    print(f"\n[passive] === SUMMARY ===", flush=True)
    print(f"  polls={n_polls}  new_rows={n_new_rows}  peaks={n_peaks}")
    if duration > 0:
        print(f"  history update rate ~ {n_new_rows / duration:.1f} rows/s")
    if peak_log:
        print(f"\n[passive] === PEAK EVENTS ===")
        for ts_str, row_max, dbs in peak_log[:30]:
            print(f"  {ts_str}  max={row_max:6.1f}  dbs={[round(x,1) for x in dbs]}")


if __name__ == "__main__":
    duration = int(sys.argv[1]) if len(sys.argv) > 1 else 60
    threshold = float(sys.argv[2]) if len(sys.argv) > 2 else -40
    main(duration, threshold)
