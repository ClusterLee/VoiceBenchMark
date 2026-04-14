#!/bin/bash
# Voice Latency Benchmark — 外壳循环模式
#
# 复刻之前跑 21h / 214 批 / 49 次崩溃恢复的稳定方案：
#   Python 进程小批次跑 → 崩溃/结束 → 清理环境 → 冷却 → 重新启动
#
# 优点：
#   - 进程级隔离：Python 内存泄漏、僵死线程、未捕获异常 → 进程退出 → 自动恢复
#   - 系统级清理：每批次结束后杀掉所有残留 + 重启 coreaudiod
#   - runner.py 内部 _full_environment_reset() 仍然作为第一道防线
#
# Usage:
#   ./run_loop.sh                # 默认：总共 1000 轮，每批次 5 轮
#   ./run_loop.sh 500            # 总共 500 轮
#   ./run_loop.sh 1000 10        # 总共 1000 轮，每批次 10 轮
#   ./run_loop.sh 1000 5 2       # 总共 1000 轮，每批次 5 轮，每轮每 target 2 次

set -o pipefail

# ── 参数 ──
TOTAL_ROUNDS="${1:-1000}"
BATCH_SIZE="${2:-5}"
REPEAT="${3:-2}"
COOLDOWN=30  # 每批次间冷却秒数

# ── 路径 ──
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

PYTHON="/Users/licong/.workbuddy/binaries/python/envs/default/bin/python"
ANDROID_SDK="$HOME/Library/Android/sdk"
export PATH="$ANDROID_SDK/platform-tools:$ANDROID_SDK/emulator:$PATH"

# 日志文件
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_DIR="results"
mkdir -p "$LOG_DIR"
MASTER_LOG="$LOG_DIR/loop_${TOTAL_ROUNDS}x${REPEAT}_${TIMESTAMP}.log"

# ── 工具函数 ──
log() {
    local msg="$(date '+%Y-%m-%d %H:%M:%S') | $1"
    echo "$msg" | tee -a "$MASTER_LOG"
}

kill_all() {
    log "🧹 清理所有残留进程..."
    pkill -f qemu-system 2>/dev/null
    pkill -f appium 2>/dev/null
    pkill -f "adb.*server" 2>/dev/null
    sleep 2

    # 关闭 macOS 崩溃报告弹窗
    osascript -e 'tell application "UserNotificationCenter" to quit' 2>/dev/null
    osascript -e 'tell application "Problem Reporter" to quit' 2>/dev/null

    # 清理模拟器锁文件和崩溃数据
    rm -f "$HOME/.android/avd/Pixel_6_API_34.avd/multiinstance.lock" 2>/dev/null
    rm -f "$HOME/.android/avd/Pixel_6_API_34.avd/"emu-crash-*.db 2>/dev/null

    log "✅ 清理完成"
}

restart_coreaudiod() {
    log "🔊 重启 coreaudiod..."
    if sudo -n killall coreaudiod 2>/dev/null; then
        sleep 5
        log "✅ coreaudiod 已重启"
    else
        # 尝试 launchctl 降级方案
        launchctl kickstart -kp system/com.apple.audio.coreaudiod 2>/dev/null && sleep 5
        log "⚠️ coreaudiod 重启（launchctl 降级方案）"
    fi
}

# ── 主循环 ──
completed=0
batch_num=0
start_time=$(date +%s)

log "============================================================"
log "🎙️ Voice Latency Benchmark — 外壳循环模式"
log "   总轮数: $TOTAL_ROUNDS"
log "   每批次: $BATCH_SIZE 轮 × 2 target × $REPEAT 次 = $((BATCH_SIZE * 2 * REPEAT)) 次/批"
log "   预计批次数: $(( (TOTAL_ROUNDS + BATCH_SIZE - 1) / BATCH_SIZE ))"
log "   总测试数: $((TOTAL_ROUNDS * 2 * REPEAT))"
log "   冷却时间: ${COOLDOWN}s"
log "   主日志: $MASTER_LOG"
log "============================================================"

while [ "$completed" -lt "$TOTAL_ROUNDS" ]; do
    batch_num=$((batch_num + 1))
    remaining=$((TOTAL_ROUNDS - completed))
    this_batch=$((remaining < BATCH_SIZE ? remaining : BATCH_SIZE))

    log ""
    log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    log "📦 批次 $batch_num: 运行 $this_batch 轮 (已完成 $completed/$TOTAL_ROUNDS)"
    log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    # 运行 Python runner（小批次）
    BATCH_LOG="$LOG_DIR/batch_${batch_num}_${TIMESTAMP}.log"
    $PYTHON -u -m src.runner -n "$this_batch" -r "$REPEAT" 2>&1 | tee -a "$BATCH_LOG" "$MASTER_LOG"
    exit_code=${PIPESTATUS[0]}

    if [ "$exit_code" -eq 0 ]; then
        log "✅ 批次 $batch_num 正常完成 (exit=$exit_code)"
        completed=$((completed + this_batch))
    else
        log "⚠️ 批次 $batch_num 异常退出 (exit=$exit_code)"
        # 即使异常退出，已上报到云端的数据不会丢失
        # 保守估计完成了这批的轮次（云端有实际数据）
        completed=$((completed + this_batch))
    fi

    # 检查是否还有剩余
    if [ "$completed" -ge "$TOTAL_ROUNDS" ]; then
        break
    fi

    # ── 批次间清理 + 冷却 ──
    log "🔄 批次间环境清理..."
    kill_all
    restart_coreaudiod
    log "❄️ 冷却 ${COOLDOWN}s..."
    sleep "$COOLDOWN"
done

# ── 汇总 ──
end_time=$(date +%s)
elapsed=$(( end_time - start_time ))
hours=$(( elapsed / 3600 ))
minutes=$(( (elapsed % 3600) / 60 ))

log ""
log "============================================================"
log "🏁 全部完成！"
log "   总批次: $batch_num"
log "   总轮数: $completed"
log "   总测试: $((completed * 2 * REPEAT))"
log "   耗时: ${hours}h ${minutes}m"
log "   主日志: $MASTER_LOG"
log "   Dashboard: https://voice-bench.cyberworld.app"
log "============================================================"
