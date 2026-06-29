#!/usr/bin/env bash
# 启动 王者荣耀/灵宝 测试专用 emulator (Honor_Lingbao_API_34)
# 与 Yuanbao/Doubao 互斥：启动前自动 kill 现有 emulator
# 资源：RAM 6GB / CPU 6 核 / /data 20GB
set -euo pipefail

AVD_NAME="Honor_Lingbao_API_34"
GRPC_PORT=8554
SNAPSHOT="${1:-}"   # 可选：传入 snapshot 名（如 lingbao_logged_in）

export PATH="$HOME/Library/Android/sdk/platform-tools:$HOME/Library/Android/sdk/emulator:$PATH"
export ANDROID_HOME="$HOME/Library/Android/sdk"

echo "[1/4] 检查并 kill 当前 emulator..."
if adb devices 2>/dev/null | grep -q "emulator-"; then
    adb -s emulator-5554 emu kill 2>/dev/null || true
    sleep 3
fi
# 元宝/豆包早期稳定性经验：测试前必须清理 qemu/crashpad/adb 残留，
# 否则 gRPC audio 后端可能继承脏状态，首发 injectAudio 直接 reset。
pkill -f "qemu-system-aarch64" 2>/dev/null || true
pkill -f "crashpad_handler.*emu-crash" 2>/dev/null || true
pkill -f "CrashReporterSupport" 2>/dev/null || true
pkill -f "Problem Reporter" 2>/dev/null || true
adb kill-server >/dev/null 2>&1 || true
sleep 1
adb start-server >/dev/null 2>&1 || true
sleep 2

echo "[2/4] 验证 AVD 存在..."
if [ ! -d "$HOME/.android/avd/${AVD_NAME}.avd" ]; then
    echo "ERROR: AVD ${AVD_NAME} 不存在，请先克隆"
    exit 1
fi

# snapshot 参数
SNAPSHOT_ARGS=()
if [ -n "${SNAPSHOT}" ]; then
    SNAPSHOT_ARGS=(-snapshot "${SNAPSHOT}")
    echo "    使用 snapshot: ${SNAPSHOT}"
else
    SNAPSHOT_ARGS=(-no-snapshot-load)
    echo "    冷启动（无 snapshot）"
fi

echo "[3/4] 启动 ${AVD_NAME} (gRPC=${GRPC_PORT})..."
nohup emulator -avd "${AVD_NAME}" \
    -grpc "${GRPC_PORT}" \
    -gpu host \
    "${SNAPSHOT_ARGS[@]}" \
    > "/tmp/emu_honor_$(date +%Y%m%d_%H%M%S).log" 2>&1 &

echo "[4/4] 等待 boot_completed..."
# 关闭 -e/pipefail：boot 检测循环里 grep 无匹配会返回非零，
# 在 set -e + pipefail 下会让脚本误判失败立即退出 rc=1（这是反复恢复失败的根因）。
set +e
set +o pipefail
# 王者 AVD 第一次启动要 format 20GB userdata + sdcard，给 5 分钟
# 注意：反复 kill+restart qemu 会让快照内 adb key 与当前 adb server 失配，
# adb devices 显示 unauthorized → getprop 永远读不到。遇到则重启 adb server 清缓存。
for i in $(seq 1 150); do
    DEV_STATE="$(adb devices 2>/dev/null | grep '^emulator-5554' | awk '{print $2}')"
    DEV_STATE="${DEV_STATE:-none}"
    if [ "$DEV_STATE" = "unauthorized" ] || [ "$DEV_STATE" = "offline" ]; then
        # 每隔几次循环重启一次 adb，清授权/离线缓存
        if [ $((i % 3)) -eq 0 ]; then
            echo "    [warn] adb device state=$DEV_STATE, restarting adb server..."
            adb kill-server >/dev/null 2>&1 || true
            sleep 1
            adb start-server >/dev/null 2>&1 || true
            sleep 2
        fi
    fi
    if [ "$(adb -s emulator-5554 shell getprop sys.boot_completed 2>/dev/null | tr -d '\r')" = "1" ]; then
        echo "[OK] ${AVD_NAME} boot done (${i}*2 = $((i*2))s)"
        adb shell df /data | tail -1
        adb shell cat /proc/meminfo | grep MemTotal
        exit 0
    fi
    sleep 2
done
echo "[FAIL] boot timeout (300s)"
exit 1
