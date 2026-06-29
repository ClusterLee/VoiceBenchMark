#!/usr/bin/env python3
"""audio_anchor_probe.py — 从 BlackHole 2ch 监听音频，检测 RMS 跳起作为 ai_start

用法：
    python3 audio_anchor_probe.py [duration_sec=8] [threshold=400]

前提：
    系统默认输出已切到 BlackHole 2ch（或创建 Multi-Output Device 包含 BlackHole）
    emulator 当前的扬声器输出会被 macOS 路由到 BlackHole，本脚本从 BlackHole input 监听
"""
import sys, time, math
import numpy as np
import sounddevice as sd

DEVICE_NAME = "BlackHole 2ch"
SAMPLE_RATE = 48000
BLOCK_MS = 20  # 20ms 一块 → 50 块/s，最高可达 ~20ms 锚点精度
BLOCK_SAMPLES = int(SAMPLE_RATE * BLOCK_MS / 1000)
THRESHOLD = float(sys.argv[2]) if len(sys.argv) > 2 else 400.0
DURATION = float(sys.argv[1]) if len(sys.argv) > 1 else 8.0

# 找 BlackHole input device 索引
dev_idx = None
for i, d in enumerate(sd.query_devices()):
    if DEVICE_NAME in d['name'] and d['max_input_channels'] >= 1:
        dev_idx = i
        break
if dev_idx is None:
    print(f"❌ 找不到 {DEVICE_NAME}，请先安装 BlackHole 2ch", file=sys.stderr)
    sys.exit(1)

print(f"📍 监听设备 #{dev_idx}: {sd.query_devices(dev_idx)['name']}", file=sys.stderr)
print(f"   sample_rate={SAMPLE_RATE} block={BLOCK_MS}ms threshold_rms={THRESHOLD}", file=sys.stderr)
print(f"   duration={DURATION}s", file=sys.stderr)

# === 采集主循环 ===
state = {
    "blocks": 0,
    "noise_baseline": [],
    "first_anchor_t": None,
    "max_rms": 0.0,
    "log": [],
}
start_wall = time.time()

with sd.InputStream(
    device=dev_idx,
    channels=1,
    samplerate=SAMPLE_RATE,
    blocksize=BLOCK_SAMPLES,
    dtype='int16',
) as stream:
    while time.time() - start_wall < DURATION:
        data, overflowed = stream.read(BLOCK_SAMPLES)
        if overflowed:
            print("⚠️  overflow", file=sys.stderr)
        # data shape (n, 1) int16
        samples = data[:, 0].astype(np.float32)
        rms = float(np.sqrt(np.mean(samples * samples))) if len(samples) > 0 else 0.0
        state["blocks"] += 1
        state["max_rms"] = max(state["max_rms"], rms)

        # 前 0.5s 采基线
        elapsed = time.time() - start_wall
        if elapsed < 0.5:
            state["noise_baseline"].append(rms)
        else:
            # 检测跳起
            if state["first_anchor_t"] is None and rms > THRESHOLD:
                state["first_anchor_t"] = elapsed
                print(f"🎯 ANCHOR @ t={elapsed*1000:.0f}ms rms={rms:.1f}", file=sys.stderr)

        # 高 RMS 块输出
        if rms > THRESHOLD * 0.5:
            state["log"].append((elapsed, rms))

elapsed_total = time.time() - start_wall
baseline_mean = float(np.mean(state["noise_baseline"])) if state["noise_baseline"] else 0
print(f"\n=== Summary ===", file=sys.stderr)
print(f"blocks: {state['blocks']} ({state['blocks']/elapsed_total:.1f}/s)", file=sys.stderr)
print(f"baseline RMS (first 0.5s): mean={baseline_mean:.1f}", file=sys.stderr)
print(f"max RMS: {state['max_rms']:.1f}", file=sys.stderr)
print(f"first anchor: {state['first_anchor_t']*1000:.0f}ms" if state["first_anchor_t"] else "first anchor: N/A", file=sys.stderr)
print(f"high-rms blocks: {len(state['log'])}", file=sys.stderr)
if state["log"]:
    print("samples (time_ms, rms):", file=sys.stderr)
    for t, r in state["log"][:10]:
        print(f"  t={t*1000:6.0f}ms rms={r:.1f}", file=sys.stderr)

# 输出机器可读结果
if state["first_anchor_t"]:
    print(f"OK anchor_ms={state['first_anchor_t']*1000:.0f}")
else:
    print("NO_ANCHOR")
