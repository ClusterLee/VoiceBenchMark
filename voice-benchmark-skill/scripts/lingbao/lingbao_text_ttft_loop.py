#!/usr/bin/env python3
"""
lingbao_text_ttft_loop.py — 灵宝文字模式 TTFT 高精度循环测量

方法: dumpsys OUTPUT 锚点 + 时钟偏移校准
精度: ~55ms (50ms量化 + ~5ms时钟jitter)

用法:
    python lingbao_text_ttft_loop.py [N=10] [cooldown=20]
"""
import subprocess, time, os, re, json, statistics, sys
from datetime import datetime

ADB = "/Users/licong/Library/Android/sdk/platform-tools/adb"
OCR = "/Users/licong/Downloads/VoiceBench/voice-benchmark-skill/scripts/lingbao/ocr.swift"
PROJ = "/Users/licong/Downloads/VoiceBench/voice-benchmark-skill/scripts"
RESULTS_DIR = f"{PROJ}/lingbao/results"

# dumpsys 参数
SAMPLE_STEP_SEC = 0.050
OUT_DELTA = 6.0
OUT_TH_CAP = -42.0
OUT_CONSEC = 2
LINE_RE = re.compile(r'^\s+(\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}\.\d{3}):\s+(-?\d+\.\d+(?:\s+-?\d+\.\d+)*)')

log = lambda *a: print(*a, flush=True)

def adb(*a, to=10):
    return subprocess.run([ADB]+list(a), capture_output=True, text=True, timeout=to).stdout.strip()

def ocr(p):
    return subprocess.run(["swift", OCR, p], capture_output=True, text=True, timeout=30).stdout or ""

def cap(p):
    with open(p, "wb") as f:
        subprocess.run([ADB, "exec-out", "screencap", "-p"], stdout=f, timeout=10)

def tap(x, y):
    subprocess.run([ADB, "shell", "input", "tap", str(x), str(y)], timeout=5)

def key(k):
    subprocess.run([ADB, "shell", "input", "keyevent", k], timeout=5)

def dump_af():
    return adb("shell", "dumpsys", "media.audio_flinger")

def _parse_block(block):
    in_hist = False; rows = []; year = datetime.now().year
    for line in block.splitlines():
        if 'Signal power history:' in line:
            in_hist = True; continue
        if in_hist:
            m = LINE_RE.match(line)
            if m:
                try:
                    dt = datetime.strptime(f"{year}-{m.group(1)}", "%Y-%m-%d %H:%M:%S.%f")
                    rows.append((dt.timestamp(), m.group(1), [float(v) for v in re.findall(r'-?\d+\.\d+', m.group(2))]))
                except:
                    pass
            elif 'Last write' in line or line.strip() == '':
                in_hist = False
    return rows

def collect_samples(kind):
    out = dump_af()
    blocks = re.split(r'\n(?=Input thread |Output thread )', out)
    merged = {}
    for b in blocks:
        if not b.startswith(f"{kind} thread"):
            continue
        for row_ts, ts_str, dbs in _parse_block(b):
            for idx, db in enumerate(dbs):
                sample_ts = row_ts + idx * SAMPLE_STEP_SEC
                key = f"{ts_str}+{idx:02d}"
                if key not in merged or db > merged[key][1]:
                    merged[key] = (sample_ts, db)
    samples = [(ts, k, db) for k, (ts, db) in merged.items()]
    samples.sort(key=lambda r: r[0])
    return samples

def calibrate_offset(n=5):
    offsets = []
    for _ in range(n):
        t1 = time.time()
        dev = adb("shell", "date", "+%s%N")
        t2 = time.time()
        if dev:
            try:
                offsets.append(int(dev) / 1e9 - (t1 + t2) / 2)
            except:
                pass
        time.sleep(0.1)
    if not offsets:
        return 0, 0
    return statistics.median(offsets), (max(offsets) - min(offsets)) * 1000

def dismiss_ime_if_needed():
    """检查并关闭 IME/退出对话框"""
    cap("/tmp/loop_ime.png")
    t = ocr("/tmp/loop_ime.png")
    if "Choose" in t or "virtual" in t.lower():
        key("KEYCODE_BACK"); time.sleep(1)
    if "退出" in t or "是否" in t:
        for ln in t.split("\n"):
            if "取消" in ln:
                ps = ln.split("\t")
                if len(ps) >= 2:
                    try:
                        ns = [int(x) for x in ps[0].split(",")]
                        if len(ns) == 4:
                            tap((ns[0]+ns[2])//2, (ns[1]+ns[3])//2)
                            time.sleep(1)
                            return
                    except:
                        pass

def run_single_round(test_text="hello", watch_sec=20, offset=0):
    """单轮 TTFT 测量"""
    # Baseline
    out0 = collect_samples('Output')
    out_seen = {k for _, k, _ in out0}
    recent_db = [db for ts, _, db in out0 if time.time() - ts < 5.0]
    floor = max(recent_db) if recent_db else -80.0
    out_dyn_th = min(OUT_TH_CAP, floor + OUT_DELTA)

    # 进入文字模式
    cap("/tmp/loop_b.png"); s = ocr("/tmp/loop_b.png")
    if "请点击输入" not in s:
        tap(1983, 989); time.sleep(3)
        dismiss_ime_if_needed()

    # 点输入框
    tap(1600, 978); time.sleep(2)
    dismiss_ime_if_needed()

    # clipboard+paste
    env = {**os.environ, "LANG": "en_US.UTF-8"}
    subprocess.run([ADB, "shell", "am", "broadcast", "-a", "CLIPBOARD_SET", "--es", "text", test_text],
                   env=env, timeout=5)
    time.sleep(0.4)
    key("KEYCODE_PASTE"); time.sleep(0.5)

    # 关键盘
    key("KEYCODE_BACK"); time.sleep(2)
    dismiss_ime_if_needed()

    # 发送!
    t_send = time.time()
    t_send_dev = t_send + offset
    tap(2220, 985)

    # dumpsys 高频轮询抓 TTS 起播
    out_anchor = None; out_anchor_db = None; out_run = 0; n_polls = 0
    deadline = time.time() + watch_sec

    while time.time() < deadline:
        n_polls += 1
        try:
            out_s = collect_samples('Output')
        except:
            time.sleep(0.05); continue

        for ts_unix, skey, db in out_s:
            if skey in out_seen:
                continue
            out_seen.add(skey)
            if ts_unix <= t_send_dev:
                continue
            if db > out_dyn_th:
                out_run += 1
                if out_run >= OUT_CONSEC and out_anchor is None:
                    out_anchor = ts_unix - (OUT_CONSEC - 1) * SAMPLE_STEP_SEC
                    out_anchor_db = db
            else:
                out_run = 0

        if out_anchor is not None:
            break
        time.sleep(0.05)

    if out_anchor is not None:
        ttft_ms = (out_anchor - t_send_dev) * 1000
        return {
            "ok": True,
            "ttft_ms": round(ttft_ms, 0),
            "out_anchor_db": round(out_anchor_db, 1),
            "floor": round(floor, 1),
            "dyn_th": round(out_dyn_th, 1),
            "n_polls": n_polls,
            "t_send": t_send,
        }
    else:
        return {
            "ok": False,
            "ttft_ms": None,
            "error": "NO_TTS_ANCHOR",
            "floor": round(floor, 1),
            "dyn_th": round(out_dyn_th, 1),
            "n_polls": n_polls,
        }

def run_loop(n=10, cooldown=20.0):
    os.makedirs(RESULTS_DIR, exist_ok=True)

    log(f"\n{'='*60}")
    log(f"灵宝文字模式 TTFT 高精度循环测试 (N={n}, cooldown={cooldown}s)")
    log(f"方法: dumpsys OUTPUT 锚点 + 时钟偏移校准")
    log(f"{'='*60}\n")

    # 时钟校准(一次校准,复用)
    log("[校准] 时钟偏移...")
    offset, jitter = calibrate_offset(5)
    log(f"  offset={offset*1000:.1f}ms jitter={jitter:.1f}ms\n")

    results = []
    for i in range(1, n + 1):
        log(f"\n{'─'*50}")
        log(f"Round {i}/{n}")
        log(f"{'─'*50}")

        if i > 1:
            log(f"  cooldown {cooldown}s...")
            time.sleep(cooldown)
            # 检查 OUTPUT 是否已 settle
            try:
                out_s = collect_samples('Output')
                recent = [db for ts, _, db in out_s if time.time() - ts < 5.0]
                if recent and max(recent) > -50:
                    log(f"  OUTPUT 仍高({max(recent):.1f}), 额外等10s...")
                    time.sleep(10)
            except:
                pass

        # 重新校准时钟(每3轮一次,防止漂移)
        if i % 3 == 1:
            offset, jitter = calibrate_offset(3)
            log(f"  时钟重校: offset={offset*1000:.1f}ms jitter={jitter:.1f}ms")

        try:
            r = run_single_round("hello", watch_sec=20, offset=offset)
        except Exception as e:
            r = {"ok": False, "ttft_ms": None, "error": f"EXCEPTION: {type(e).__name__}: {str(e)[:120]}"}

        r["idx"] = i
        r["offset_ms"] = round(offset * 1000, 1)
        results.append(r)

        if r["ok"]:
            log(f"  ✅ Round {i}: TTFT={r['ttft_ms']}ms (TTS={r['out_anchor_db']}dB floor={r['floor']}dB)")
        else:
            log(f"  ❌ Round {i}: {r.get('error', 'unknown')}")

    # 保存结果
    ts = int(time.time())
    out_json = f"{RESULTS_DIR}/text_ttft_loop_n{n}_{ts}.json"
    with open(out_json, "w") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

    # 统计
    ok = [r for r in results if r["ok"]]
    log(f"\n{'='*60}")
    log(f"=== LOOP SUMMARY (N={n}) ===")
    log(f"成功率: {len(ok)}/{len(results)} ({100*len(ok)/max(1,len(results)):.0f}%)")

    if ok:
        ttfts = [r["ttft_ms"] for r in ok]
        s = sorted(ttfts)
        p95 = s[min(len(s)-1, int(0.95*len(s)))]

        log(f"\nTTFT 统计 (设备时钟, 精度~55ms):")
        log(f"  mean   = {statistics.mean(ttfts):.0f}ms")
        log(f"  median = {statistics.median(ttfts):.0f}ms")
        log(f"  std    = {statistics.pstdev(ttfts):.0f}ms")
        log(f"  min    = {min(ttfts):.0f}ms")
        log(f"  max    = {max(ttfts):.0f}ms")
        log(f"  p95    = {p95:.0f}ms")

        if "out_anchor_db" in ok[0]:
            dbs = [r["out_anchor_db"] for r in ok if r.get("out_anchor_db")]
            if dbs:
                log(f"\nTTS anchor dB:")
                log(f"  mean={statistics.mean(dbs):.1f} median={statistics.median(dbs):.1f} range=[{min(dbs):.1f}, {max(dbs):.1f}]")

        log(f"\n逐轮结果:")
        for r in results:
            status = f"✅ {r['ttft_ms']}ms" if r["ok"] else f"❌ {r.get('error','')}"
            log(f"  Round {r['idx']}: {status}")
    else:
        log("⚠️ 无有效样本")

    log(f"\n结果已保存: {out_json}")
    log(f"{'='*60}")
    return 0 if ok else 1


if __name__ == "__main__":
    n = int(sys.argv[1]) if len(sys.argv) > 1 else 10
    cd = float(sys.argv[2]) if len(sys.argv) > 2 else 20.0
    sys.exit(run_loop(n, cd))
