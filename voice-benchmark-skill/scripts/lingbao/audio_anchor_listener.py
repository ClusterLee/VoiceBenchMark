#!/usr/bin/env python3
"""audio_anchor_listener.py — 后台进程：监听 BlackHole，等 RMS 跳起就写时间戳到文件

用法（runner 里调用）：
    proc = subprocess.Popen([
        python, audio_anchor_listener.py,
        "--out", "/tmp/anchor_out.json",
        "--device", "BlackHole 2ch",
        "--threshold", "400",
        "--timeout", "10",
    ])
    # 注入音频前: proc 已 ready
    # 注入音频后: 等 proc 退出 → 读 /tmp/anchor_out.json 拿到 ai_start 时间戳

输出 JSON：
    {"ok": true,  "anchor_t": 1717340000.123, "anchor_rms": 482.5, "baseline_rms": 5.2, "max_rms": 1820.3}
    {"ok": false, "reason": "timeout", "max_rms": 12.3}
"""
import sys, time, json, argparse
import numpy as np
import sounddevice as sd

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", required=True, help="输出 JSON 路径")
    ap.add_argument("--device", default="BlackHole 2ch")
    ap.add_argument("--threshold", type=float, default=400.0,
                    help="RMS 跳起阈值，超过即标记为 ai_start")
    ap.add_argument("--timeout", type=float, default=15.0,
                    help="最长等待秒数，超时退出")
    ap.add_argument("--baseline-sec", type=float, default=0.3,
                    help="前 N 秒作为基线，不参与跳变检测")
    ap.add_argument("--block-ms", type=float, default=20.0)
    ap.add_argument("--ready-file", default=None,
                    help="ready 文件路径，stream 准备好后 touch 该文件让父进程感知")
    ap.add_argument("--start-after-ready", type=float, default=0.0,
                    help="ready 后再延迟 N 秒才开始检测（用于跳过环境噪声）")
    args = ap.parse_args()

    # 找 device
    dev_idx = None
    for i, d in enumerate(sd.query_devices()):
        if args.device in d['name'] and d['max_input_channels'] >= 1:
            dev_idx = i
            break
    if dev_idx is None:
        json.dump({"ok": False, "reason": f"device_not_found: {args.device}"}, open(args.out, "w"))
        sys.exit(1)

    sample_rate = 48000
    block_samples = int(sample_rate * args.block_ms / 1000)

    print(f"📍 listener: device #{dev_idx} {sd.query_devices(dev_idx)['name']}, "
          f"sr={sample_rate} block={args.block_ms}ms threshold={args.threshold}", file=sys.stderr)

    state = {
        "first_anchor_t": None,
        "first_anchor_rms": 0.0,
        "max_rms": 0.0,
        "baseline_samples": [],
        "n_blocks": 0,
    }

    try:
        with sd.InputStream(
            device=dev_idx, channels=1, samplerate=sample_rate,
            blocksize=block_samples, dtype='int16',
        ) as stream:
            # 触发 ready 文件
            if args.ready_file:
                with open(args.ready_file, "w") as f:
                    f.write(str(time.time()))
            t_ready = time.time()
            t_start_detect = t_ready + args.start_after_ready
            t_deadline = t_ready + args.timeout

            while time.time() < t_deadline:
                data, overflowed = stream.read(block_samples)
                samples = data[:, 0].astype(np.float32)
                rms = float(np.sqrt(np.mean(samples * samples))) if len(samples) > 0 else 0.0
                state["n_blocks"] += 1
                state["max_rms"] = max(state["max_rms"], rms)

                t_now = time.time()
                # 基线采集
                if t_now - t_ready < args.baseline_sec:
                    state["baseline_samples"].append(rms)
                    continue
                # 起检前
                if t_now < t_start_detect:
                    continue
                # 检测跳起
                if state["first_anchor_t"] is None and rms > args.threshold:
                    state["first_anchor_t"] = t_now
                    state["first_anchor_rms"] = rms
                    print(f"🎯 ANCHOR @ rms={rms:.1f}", file=sys.stderr)
                    break
    except Exception as e:
        json.dump({"ok": False, "reason": f"stream_error: {type(e).__name__}: {e}"}, open(args.out, "w"))
        sys.exit(2)

    baseline = float(np.mean(state["baseline_samples"])) if state["baseline_samples"] else 0.0
    if state["first_anchor_t"]:
        out = {
            "ok": True,
            "anchor_t": state["first_anchor_t"],
            "anchor_rms": state["first_anchor_rms"],
            "baseline_rms": baseline,
            "max_rms": state["max_rms"],
            "n_blocks": state["n_blocks"],
        }
    else:
        out = {
            "ok": False,
            "reason": "timeout",
            "baseline_rms": baseline,
            "max_rms": state["max_rms"],
            "n_blocks": state["n_blocks"],
        }
    with open(args.out, "w") as f:
        json.dump(out, f)
    print(f"=> {out}", file=sys.stderr)
    sys.exit(0 if out["ok"] else 3)

if __name__ == "__main__":
    main()
