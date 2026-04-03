#!/bin/bash
# Voice Latency Benchmark — 快捷运行脚本
#
# Usage:
#   ./run_benchmark.sh                    # 默认：豆包+元宝各 3 轮
#   ./run_benchmark.sh doubao 5           # 豆包 5 轮
#   ./run_benchmark.sh yuanbao 10         # 元宝 10 轮
#   ./run_benchmark.sh all 5              # 全部 APP 各 5 轮
set -e

# 自动定位项目根目录（脚本所在目录或上一级）
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
if [ -d "$SCRIPT_DIR/src" ]; then
    PROJECT_DIR="$SCRIPT_DIR"
elif [ -d "$SCRIPT_DIR/../src" ]; then
    PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
else
    echo "❌ 找不到 src/ 目录。请在项目根目录下运行此脚本。"
    exit 1
fi

cd "$PROJECT_DIR"

TARGET="${1:-all}"
ROUNDS="${2:-3}"

echo "🎙️ Voice Latency Benchmark"
echo "   Target: $TARGET"
echo "   Rounds: $ROUNDS"
echo "   Dir:    $PROJECT_DIR"
echo ""

# 检查前置条件
check_prereqs() {
    # 检查模拟器
    if ! adb devices 2>/dev/null | grep -q "emulator"; then
        echo "❌ 未检测到 Android 模拟器。请先启动："
        echo "   ~/Library/Android/sdk/emulator/emulator -avd Pixel_6_API_34 -grpc 8554 -no-snapshot-load"
        echo "   ⚠️  必须加 -no-snapshot-load，否则音频 HAL 可能 I/O error（听不到声音）"
        echo "   ⚠️  禁止加 -no-audio，否则虚拟麦克风和音频输出都会被禁用"
        exit 1
    fi
    
    # 检查音频 HAL 健康（pcm_writei I/O error = 需要冷启动模拟器）
    pcm_errors=$(adb shell "logcat -d | grep -c 'pcm_writei.*I/O error'" 2>/dev/null || echo "0")
    if [ "$pcm_errors" -gt "0" ] 2>/dev/null; then
        echo "⚠️  检测到音频 HAL I/O 错误 (${pcm_errors} 次)，宿主机可能听不到声音"
        echo "   建议: adb emu kill && sleep 5 && emulator -avd Pixel_6_API_34 -grpc 8554 -no-snapshot-load"
    fi
    
    # 检查 Appium
    if ! curl -s http://127.0.0.1:4723/status > /dev/null 2>&1; then
        echo "❌ Appium 未运行。请先启动："
        echo "   appium &"
        exit 1
    fi
    
    # 检查 gRPC 端口
    if ! nc -z localhost 8554 2>/dev/null; then
        echo "⚠️  gRPC 8554 端口未开放，音频注入可能失败"
        echo "   请确保模拟器启动时带 -grpc 8554 参数"
    fi
    
    echo "✅ 前置条件检查通过"
    echo ""
}

# 设置模拟器音频路由（通话音频切到扬声器外放）
setup_audio() {
    echo "🔊 配置音频路由..."
    # 语音通话类 APP 默认走 STREAM_VOICE_CALL → 听筒，模拟器听筒无声
    # 必须强制切到扬声器模式才能在宿主机听到声音
    adb shell content insert --uri content://settings/system \
        --bind name:s:speakerphone_on --bind value:s:1 2>/dev/null
    # 精确设置非通话音频流的音量到最大（VOICE_CALL 只能在通话中修改）
    # 使用 cmd media_session volume（正确的 ADB 音量命令）
    adb shell cmd media_session volume --stream 1 --set 7  2>/dev/null  # SYSTEM (max 7)
    adb shell cmd media_session volume --stream 2 --set 7  2>/dev/null  # RING (max 7)
    adb shell cmd media_session volume --stream 3 --set 15 2>/dev/null  # MUSIC (max 15)
    adb shell cmd media_session volume --stream 4 --set 7  2>/dev/null  # ALARM (max 7)
    adb shell cmd media_session volume --stream 5 --set 7  2>/dev/null  # NOTIFICATION (max 7)
    echo "✅ 音频路由已切到扬声器 + 所有音量最大"
    echo "   (VOICE_CALL 音量将在进入通话后自动设置)"
    echo ""
}

check_prereqs
setup_audio

if [ "$TARGET" = "all" ]; then
    echo "=== 测试豆包 ==="
    python3 -m src.runner -t doubao -n "$ROUNDS"
    echo ""
    echo "=== 测试元宝 ==="
    python3 -m src.runner -t yuanbao -n "$ROUNDS"
else
    python3 -m src.runner -t "$TARGET" -n "$ROUNDS"
fi

echo ""
echo "🏁 测试完成！报告在 results/ 目录下"
ls -la results/report_*.json 2>/dev/null | tail -2
