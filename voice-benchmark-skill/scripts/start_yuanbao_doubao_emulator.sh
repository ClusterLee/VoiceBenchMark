#!/usr/bin/env bash
# 启动 元宝/豆包 测试专用 emulator (Pixel_6_API_34)
# 与 Honor 互斥：启动前自动 kill 现有 emulator
set -euo pipefail

AVD_NAME="Pixel_6_API_34"
GRPC_PORT=8554

export PATH="$HOME/Library/Android/sdk/platform-tools:$HOME/Library/Android/sdk/emulator:$PATH"
export ANDROID_HOME="$HOME/Library/Android/sdk"

echo "[1/4] 检查并 kill 当前 emulator..."
if adb devices 2>/dev/null | grep -q "emulator-"; then
    adb -s emulator-5554 emu kill 2>/dev/null || true
    sleep 3
fi
pkill -f "qemu-system-aarch64" 2>/dev/null || true
sleep 2

echo "[2/4] 验证 AVD 存在..."
if [ ! -d "$HOME/.android/avd/${AVD_NAME}.avd" ]; then
    echo "ERROR: AVD ${AVD_NAME} 不存在"
    exit 1
fi

echo "[3/4] 启动 ${AVD_NAME} (gRPC=${GRPC_PORT})..."
nohup emulator -avd "${AVD_NAME}" \
    -grpc "${GRPC_PORT}" \
    -gpu host \
    -no-snapshot-load \
    > "/tmp/emu_yuanbao_doubao_$(date +%Y%m%d_%H%M%S).log" 2>&1 &

echo "[4/4] 等待 boot_completed..."
for i in $(seq 1 60); do
    if [ "$(adb -s emulator-5554 shell getprop sys.boot_completed 2>/dev/null | tr -d '\r')" = "1" ]; then
        echo "✅ ${AVD_NAME} 启动成功 (${i}s)"
        adb shell df /data | tail -1
        adb shell cat /proc/meminfo | grep MemTotal
        exit 0
    fi
    sleep 2
done
echo "❌ 启动超时（120s）"
exit 1
