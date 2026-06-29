#!/usr/bin/env python3
"""
g_method_validator.py — G 方案核心验证

流程：
1. 启动 audioflinger_anchor listener（后台线程，30s）
2. 注入 hello_nihao 到灵宝
3. listener 监测 dumpsys Signal power history 中是否出现 TTS 跳起
4. 同时记录 OCR 字幕首次出现时间
5. 对比两个 anchor 时间差
"""
import sys, os, time, subprocess, threading, json, re
from datetime import datetime

PROJ = "/Users/licong/Downloads/VoiceBench/voice-benchmark-skill/scripts"
sys.path.insert(0, PROJ)

from src.audio.virtual_mic import EmulatorMicInjector

WAV = f"{PROJ}/assets/audio/hello_nihao_edge_48k.wav"

# =============== AudioFlinger anchor listener ===============
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
                year = datetime.now().year
                full = f"{year}-{ts_str}"
                try:
                    dt = datetime.strptime(full, "%Y-%m-%d %H:%M:%S.%f")
                    ts_unix = dt.timestamp()
                except Exception:
                    continue
                vals = re.findall(r'-?\d+\.\d+', m.group(2))
                dbs = [float(v) for v in vals]
                rows.append((ts_unix, ts_str, dbs))
            elif line.startswith('  ') and ('Last write' in line):
                in_hist = False
    return rows


def listen_audioflinger(stop_evt, deadline, threshold_db, result):
    """后台 polling dumpsys，记录所有新出现的 (ts, max_db) 行 + 首次跳起 anchor"""
    last_seen_ts = 0
    samples = []
    anchor_ts = None
    anchor_db = None
    n_polls = 0

    # baseline
    try:
        out = subprocess.check_output(
            ["adb", "shell", "dumpsys", "media.audio_flinger"],
            text=True, stderr=subprocess.DEVNULL,
        )
        rows = parse_history(out)
        if rows:
            last_seen_ts = rows[-1][0]
            print(f"[anchor] baseline last_ts={rows[-1][1]} mean_db={sum(v for r in rows for v in r[2])/sum(len(r[2]) for r in rows):.1f}", flush=True)
    except Exception as e:
        print(f"[anchor] baseline err: {e}", flush=True)

    while not stop_evt.is_set() and time.time() < deadline:
        n_polls += 1
        try:
            out = subprocess.check_output(
                ["adb", "shell", "dumpsys", "media.audio_flinger"],
                text=True, stderr=subprocess.DEVNULL,
            )
        except Exception:
            time.sleep(0.05)
            continue
        rows = parse_history(out)
        if rows:
            for ts_unix, ts_str, dbs in rows:
                if ts_unix <= last_seen_ts:
                    continue
                # 新行
                row_max = max(dbs)
                samples.append((ts_unix, ts_str, row_max, dbs))
                if anchor_ts is None and row_max > threshold_db:
                    # 找行内首次过 threshold 的 idx
                    idx = next((i for i, d in enumerate(dbs) if d > threshold_db), 0)
                    anchor_ts = ts_unix + idx * 0.050
                    anchor_db = dbs[idx]
                    anchor_local = datetime.fromtimestamp(anchor_ts).strftime("%H:%M:%S.%f")[:-3]
                    print(f"[anchor] 🎯 ANCHOR at {anchor_local} (row_ts={ts_str} +{idx*50}ms) db={anchor_db:.1f}", flush=True)
                last_seen_ts = ts_unix
        time.sleep(0.04)

    result['samples'] = samples
    result['anchor_ts'] = anchor_ts
    result['anchor_db'] = anchor_db
    result['n_polls'] = n_polls


def main():
    print(f"[main] G method validator: AudioFlinger anchor + lingbao TTS", flush=True)

    # 1) launch listener in background, run 25s
    deadline = time.time() + 25
    stop_evt = threading.Event()
    result = {}
    t = threading.Thread(target=listen_audioflinger, args=(stop_evt, deadline, -45.0, result))
    t.start()
    print(f"[main] listener started (host time {time.time():.3f})", flush=True)
    time.sleep(2.0)  # 让 listener 先采到 baseline

    # 2) inject audio
    print(f"\n[main] === Injecting {os.path.basename(WAV)} ===", flush=True)
    mic = EmulatorMicInjector()
    mic.connect()
    t_inject = time.time()
    print(f"[main] t_inject={t_inject:.3f}", flush=True)
    audio_dur = mic.inject_wav(WAV)
    t_audio_end = t_inject + audio_dur
    print(f"[main] inject done, audio_duration={audio_dur:.2f}s, t_audio_end={t_audio_end:.3f}", flush=True)
    mic.disconnect()

    # 3) wait for listener to finish
    t.join(timeout=30)
    stop_evt.set()

    # 4) report
    print(f"\n[main] === RESULT ===", flush=True)
    print(f"[main] n_polls={result.get('n_polls')} samples={len(result.get('samples', []))}", flush=True)
    if result.get('anchor_ts'):
        anchor_offset = (result['anchor_ts'] - t_audio_end) * 1000
        print(f"[main] anchor: {datetime.fromtimestamp(result['anchor_ts']).strftime('%H:%M:%S.%f')[:-3]} db={result['anchor_db']:.1f}", flush=True)
        print(f"[main] TTFT (anchor - audio_end) = {anchor_offset:.0f} ms")
    else:
        print(f"[main] NO ANCHOR — TTS 没让 dumpsys history 出现 > -45 dBFS 的行", flush=True)

    print(f"\n[main] === Sample timeline (last 20 rows of history) ===", flush=True)
    samples = result.get('samples', [])
    for ts_unix, ts_str, row_max, dbs in samples[-20:]:
        offset_from_inject = (ts_unix - t_inject) * 1000
        marker = " ⭐" if row_max > -45 else ""
        print(f"  +{offset_from_inject:7.0f}ms  ts={ts_str}  max_db={row_max:6.1f}  dbs[:5]={[round(x,1) for x in dbs[:5]]}{marker}", flush=True)


if __name__ == "__main__":
    main()
