#!/bin/bash
# run_lingbao_loop.sh — 灵宝多轮稳定性测试 wrapper
#
# 逻辑：
#   每轮 runner 单独进程跑 1 次。失败后检测 emulator 是否挂掉（gRPC 8554 / adb），
#   若挂了就用快照 lingbao_logged_in 冷启恢复，再继续下一轮。
#
# 用法：
#   ./run_lingbao_loop.sh 10           # 跑 10 轮
#   ./run_lingbao_loop.sh 10 lingbao_logged_in  # 指定快照
#
# 失败可恢复：
#   - emulator 挂掉 → start_honor_emulator.sh 重启
#   - 王者后台 → adb am start 拉回前台（已在 LingbaoBot.connect 处理）

set -uo pipefail

ROUNDS="${1:-10}"
SNAPSHOT="${2:-lingbao_logged_in}"
# FRESH_EACH_ROUND：注入崩溃应对策略。
#   实证(2026-06-22)：快照恢复出的 qemu 音频转发模块(audio_forwarder)首次 injectAudio
#   有概率撞空指针崩（gRPC Connection reset by peer）。fresh qemu(刚恢复)注入更稳，
#   但同一 fresh qemu 也能连续注入多次成功（实测 3 次）——崩溃是概率性而非"第N次必崩"。
#   =0（默认/平衡）：仅崩溃后被动恢复，单 qemu 尽量多跑，恢复次数少（每轮省 ~3min）。
#   =1（激进）：每轮强制 fresh 恢复，崩溃率趋近 0 但每轮 +3min 恢复成本。
# 关键修复(2026-06-22)：恢复后重启 adb server 清授权缓存，否则 unauthorized 卡 boot 超时。
FRESH_EACH_ROUND="${FRESH_EACH_ROUND:-0}"
# SETTLE_SEC：fresh qemu 恢复后静默等待 audio gRPC service 初始化的秒数。
#   实测安全阈值 45s（纯等待零注入后注入稳定）；默认 50s 留 5s 余量。
#   注意：这段时间内绝不能做任何 gRPC 注入/探测，否则会打断初始化把 service 推崩。
SETTLE_SEC="${SETTLE_SEC:-50}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

export PATH="$HOME/.workbuddy/binaries/python/envs/default/bin:$HOME/Library/Android/sdk/platform-tools:$HOME/Library/Android/sdk/emulator:$PATH"
export ANDROID_HOME="$HOME/Library/Android/sdk"

TS=$(date +%Y%m%d_%H%M%S)
LOG_DIR="$SCRIPT_DIR/results"
LOOP_LOG="$LOG_DIR/lingbao_loop_${ROUNDS}x_${TS}.log"
mkdir -p "$LOG_DIR"

log() {
  echo "$(date '+%H:%M:%S') | $*" | tee -a "$LOOP_LOG"
}

check_emulator_alive() {
  local devices_out
  devices_out=$(adb devices 2>&1)
  if ! echo "$devices_out" | grep -qE "^emulator-[0-9]+\s+device$"; then
    return 1
  fi
  if ! lsof -iTCP:8554 -sTCP:LISTEN > /dev/null 2>&1; then
    return 1
  fi
  return 0
}

restore_emulator() {
  log "🔄 emulator 异常，使用快照 $SNAPSHOT 恢复..."
  # 反复 kill+restart qemu 会导致快照内 adb key 与当前 adb server 失配，
  # 表现为 `adb devices` = unauthorized → boot_completed 永远读不到 → 超时。
  # 对策：恢复前先重启 adb server 清授权缓存。
  adb kill-server >/dev/null 2>&1 || true
  sleep 1
  adb start-server >/dev/null 2>&1 || true
  local rc=0
  bash "$SCRIPT_DIR/start_honor_emulator.sh" "$SNAPSHOT" >> "$LOOP_LOG" 2>&1 || rc=$?
  if [ "$rc" -ne 0 ]; then
    log "start_honor_emulator rc=$rc, retry adb restart then recheck..."
    # 常见原因是 unauthorized 卡 boot 检测；重启 adb 后 qemu 往往已就绪
    adb kill-server >/dev/null 2>&1 || true
    sleep 2
    adb start-server >/dev/null 2>&1 || true
    sleep 4
  fi
  sleep 3
  if check_emulator_alive; then
    # 【关键 settle，2026-06-22 根因定论】fresh qemu boot done 后，audio gRPC
    # service 仍需 ~40s 静默初始化。这段窗口内任何注入都会把 service 推向崩溃
    # (越注入越崩，qemu 会死)。3 组对照实验坐实：纯等待 45s(零注入)后注入才稳。
    # 所以恢复成功后这里【纯 sleep 不碰 service】，等 service 自行初始化完，
    # 之后 runner 第一发确认注入即稳定。绝不在此期间做任何 gRPC 注入/探测。
    log "emulator 恢复成功，静默 settle ${SETTLE_SEC}s 等 audio service 初始化（期间绝不注入）..."
    sleep "$SETTLE_SEC"
    log "✅ settle 完成，emulator 就绪"
    return 0
  fi
  log "❌ 恢复失败（emulator 仍不可用）"
  return 1
}

log "═══════════════════════════════════════════════"
log "灵宝多轮测试 wrapper"
log "  总轮数: $ROUNDS"
log "  快照:   $SNAPSHOT"
log "  日志:   $LOOP_LOG"
log "═══════════════════════════════════════════════"

# 起跑前 sanity check
if ! check_emulator_alive; then
  log "起跑前检测：emulator 异常，先恢复一次"
  if ! restore_emulator; then
    log "❌ 起跑前恢复失败，退出"
    exit 1
  fi
fi

success=0
fail=0
ttft_list=()

for i in $(seq 1 "$ROUNDS"); do
  log "── Round $i / $ROUNDS ──────────────────────────"

  if [ "$FRESH_EACH_ROUND" = "1" ]; then
    # 每轮强制用 fresh qemu：陈旧 qemu 首注入必崩，fresh qemu 稳定。
    # 第 1 轮若 emulator 已是刚启动的 fresh 态可跳过；但为确定性统一恢复。
    log "Round $i 强制 fresh 恢复（fresh qemu 注入稳定）..."
    if ! restore_emulator; then
      log "Round $i fresh 恢复失败，标记失败继续"; ((fail++)); continue
    fi
  else
    # 旧行为：仅在 emulator 离线时被动恢复
    if ! check_emulator_alive; then
      log "Round $i 起跑前 emulator 离线，恢复中..."
      restore_emulator || { log "Round $i 恢复失败，标记失败继续"; ((fail++)); continue; }
    fi
  fi

  ROUND_LOG="$LOG_DIR/lingbao_loop_${TS}_r${i}.log"
  if python3 -m src.runner -t lingbao -n 1 > "$ROUND_LOG" 2>&1; then
    rc=0
  else
    rc=$?
  fi

  # 解析这轮结果
  ttft=$(grep -oE "TTFT=[0-9]+ms" "$ROUND_LOG" | head -1 | grep -oE "[0-9]+" || echo "")
  if [ -n "$ttft" ]; then
    log "Round $i ✅ TTFT=${ttft}ms"
    ttft_list+=("$ttft")
    ((success++))
  else
    err=$(grep -E "ERROR|失败" "$ROUND_LOG" | grep -v "ev_poll" | head -3 | tr '\n' '|')
    log "Round $i ❌ rc=$rc | $err"
    ((fail++))

    # 失败后检测 emulator
    if ! check_emulator_alive; then
      log "Round $i 后 emulator 已挂，恢复中..."
      restore_emulator || log "❌ 恢复失败，下一轮再试"
    fi
  fi
done

log "═══════════════════════════════════════════════"
log "📊 灵宝 ${ROUNDS} 轮测试完成"
log "  成功: $success / $ROUNDS"
log "  失败: $fail / $ROUNDS"

if [ ${#ttft_list[@]} -gt 0 ]; then
  # 简单统计
  ttft_csv=$(IFS=,; echo "${ttft_list[*]}")
  log "  TTFT 列表: [$ttft_csv]"
  python3 -c "
import statistics
vals = [$ttft_csv]
print(f'  TTFT 平均: {statistics.mean(vals):.0f}ms')
print(f'  TTFT 中位: {statistics.median(vals):.0f}ms')
print(f'  TTFT 最小: {min(vals)}ms')
print(f'  TTFT 最大: {max(vals)}ms')
print(f'  TTFT 标准差: {statistics.stdev(vals) if len(vals) >= 2 else 0:.1f}ms')
" | tee -a "$LOOP_LOG"
fi

log "═══════════════════════════════════════════════"
log "完整日志: $LOOP_LOG"
log "各轮日志: $LOG_DIR/lingbao_loop_${TS}_r*.log"
