#!/bin/bash
# ============================================
# Voice Latency Benchmark - macOS 环境安装
# ============================================
set -e

echo "🔧 Voice Latency Benchmark - macOS 环境安装"
echo "============================================"
echo "⚠️  注意: Mac mini/Mac Studio 等无内置麦克风的机型必须安装 BlackHole 2ch"
echo "   否则 gRPC injectAudio 会导致模拟器崩溃 (Could not initialize record)"

# 颜色
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

check_installed() {
    if command -v "$1" &> /dev/null; then
        echo -e "${GREEN}✓${NC} $1 已安装: $(command -v $1)"
        return 0
    else
        echo -e "${RED}✗${NC} $1 未安装"
        return 1
    fi
}

# ---- 1. Homebrew ----
echo ""
echo "📦 1/8 检查 Homebrew..."
if ! check_installed brew; then
    echo "请先安装 Homebrew: https://brew.sh"
    exit 1
fi

# ---- 2. Java (OpenJDK 17) ----
echo ""
echo "☕ 2/8 检查 Java..."
if ! check_installed java; then
    echo "安装 OpenJDK 17..."
    brew install openjdk@17
    echo 'export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"' >> ~/.zshrc
    export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"
fi
java -version 2>&1 | head -1

# ---- 3. Android SDK (via cmdline-tools) ----
echo ""
echo "📱 3/8 检查 Android SDK..."
ANDROID_HOME="${HOME}/Library/Android/sdk"
if [ ! -d "$ANDROID_HOME" ]; then
    echo "安装 Android command-line tools..."
    mkdir -p "$ANDROID_HOME"

    # 下载 cmdline-tools
    CMDTOOLS_URL="https://dl.google.com/android/repository/commandlinetools-mac-11076708_latest.zip"
    TMPDIR=$(mktemp -d)
    curl -L -o "${TMPDIR}/cmdtools.zip" "$CMDTOOLS_URL"
    unzip -q "${TMPDIR}/cmdtools.zip" -d "${TMPDIR}"
    mkdir -p "${ANDROID_HOME}/cmdline-tools"
    mv "${TMPDIR}/cmdline-tools" "${ANDROID_HOME}/cmdline-tools/latest"
    rm -rf "${TMPDIR}"

    echo "export ANDROID_HOME=${ANDROID_HOME}" >> ~/.zshrc
    echo 'export PATH="${ANDROID_HOME}/cmdline-tools/latest/bin:${ANDROID_HOME}/platform-tools:${ANDROID_HOME}/emulator:${PATH}"' >> ~/.zshrc
fi

export ANDROID_HOME="${ANDROID_HOME}"
export PATH="${ANDROID_HOME}/cmdline-tools/latest/bin:${ANDROID_HOME}/platform-tools:${ANDROID_HOME}/emulator:${PATH}"

# 安装必要的 SDK 组件
echo "安装 Android SDK 组件..."
yes | sdkmanager --licenses 2>/dev/null || true
sdkmanager "platform-tools" "platforms;android-34" "system-images;android-34;google_apis;arm64-v8a" "emulator" 2>/dev/null

# 创建 AVD
if ! avdmanager list avd 2>/dev/null | grep -q "Pixel_6_API_34"; then
    echo "创建 Android 模拟器 (Pixel_6_API_34)..."
    echo "no" | avdmanager create avd -n "Pixel_6_API_34" \
        -k "system-images;android-34;google_apis;arm64-v8a" \
        --device "pixel_6" \
        --force
fi

check_installed adb

# ---- 4. BlackHole 2ch 虚拟音频驱动 ----
# ⚠️ 关键：Mac mini/Mac Studio 没有内置麦克风，
#    模拟器虚拟麦克风 ADC 初始化依赖宿主机音频输入设备。
#    没有 BlackHole → gRPC injectAudio() 会导致模拟器直接崩溃！
#    日志特征: "Could not initialize record - Unknown Audiodevice"
#              "Failed to create voice 'adc'"
echo ""
echo "🔊 4/8 检查 BlackHole 2ch 虚拟音频驱动..."
if ! brew list blackhole-2ch &>/dev/null; then
    echo -e "${YELLOW}⚠ Mac mini/Mac Studio 无内置麦克风，必须安装 BlackHole 2ch${NC}"
    echo "  否则 gRPC injectAudio 会导致模拟器崩溃 (adc 初始化失败)"
    echo "安装 BlackHole 2ch..."
    brew install blackhole-2ch
    echo "重启 Core Audio 服务..."
    sudo killall -9 coreaudiod 2>/dev/null || true
    sleep 3
    echo -e "${GREEN}✓${NC} BlackHole 2ch 已安装，Core Audio 已重启"
else
    echo -e "${GREEN}✓${NC} BlackHole 2ch 已安装"
fi

# ---- 5. FFmpeg ----
echo ""
echo "🎵 5/8 检查 FFmpeg..."
if ! check_installed ffmpeg; then
    echo "安装 FFmpeg..."
    brew install ffmpeg
fi

# ---- 6. Node.js (for Appium) ----
echo ""
echo "📗 6/8 检查 Node.js..."
if ! check_installed node; then
    echo "安装 Node.js..."
    brew install node@20
fi
echo "Node.js: $(node --version)"

# ---- 7. Appium ----
echo ""
echo "🤖 7/8 检查 Appium..."
if ! check_installed appium; then
    echo "安装 Appium 2.x..."
    npm install -g appium
    appium driver install uiautomator2
fi
echo "Appium: $(appium --version 2>/dev/null || echo 'installed')"

# ---- 8. Python 依赖 ----
echo ""
echo "🐍 8/8 安装 Python 依赖..."
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

if [ -f "${PROJECT_DIR}/requirements.txt" ]; then
    pip3 install -r "${PROJECT_DIR}/requirements.txt"
else
    echo -e "${YELLOW}⚠ requirements.txt 未找到，跳过${NC}"
fi

# ---- 完成 ----
echo ""
echo "============================================"
echo -e "${GREEN}🎉 环境安装完成！${NC}"
echo ""
echo "下一步："
echo "  1. 重新打开终端（加载环境变量）"
echo "  2. 启动模拟器:  emulator -avd Pixel_6_API_34 -grpc 8554 -no-snapshot-load"
echo "     ⚠️ 必须加 -no-snapshot-load，否则音频 HAL 可能 I/O error（听不到声音）"
echo "  3. 安装元宝和豆包 APP 到模拟器"
echo "  4. 运行测试:  python3 src/runner.py"
echo "============================================"
