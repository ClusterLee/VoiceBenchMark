#!/bin/bash
# ============================================
# Voice Latency Benchmark - macOS 环境安装
# ============================================
set -e

echo "🔧 Voice Latency Benchmark - macOS 环境安装"
echo "============================================"

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
echo "📦 1/7 检查 Homebrew..."
if ! check_installed brew; then
    echo "请先安装 Homebrew: https://brew.sh"
    exit 1
fi

# ---- 2. Java (OpenJDK 17) ----
echo ""
echo "☕ 2/7 检查 Java..."
if ! check_installed java; then
    echo "安装 OpenJDK 17..."
    brew install openjdk@17
    echo 'export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"' >> ~/.zshrc
    export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"
fi
java -version 2>&1 | head -1

# ---- 3. Android SDK (via cmdline-tools) ----
echo ""
echo "📱 3/7 检查 Android SDK..."
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
if ! avdmanager list avd 2>/dev/null | grep -q "voice_benchmark"; then
    echo "创建 Android 模拟器 (voice_benchmark)..."
    echo "no" | avdmanager create avd -n "voice_benchmark" \
        -k "system-images;android-34;google_apis;arm64-v8a" \
        --device "pixel_6" \
        --force
fi

check_installed adb

# ---- 4. FFmpeg ----
echo ""
echo "🎵 4/7 检查 FFmpeg..."
if ! check_installed ffmpeg; then
    echo "安装 FFmpeg..."
    brew install ffmpeg
fi

# ---- 5. Node.js (for Appium) ----
echo ""
echo "📗 5/7 检查 Node.js..."
if ! check_installed node; then
    echo "安装 Node.js..."
    brew install node@20
fi
echo "Node.js: $(node --version)"

# ---- 6. Appium ----
echo ""
echo "🤖 6/7 检查 Appium..."
if ! check_installed appium; then
    echo "安装 Appium 2.x..."
    npm install -g appium
    appium driver install uiautomator2
fi
echo "Appium: $(appium --version 2>/dev/null || echo 'installed')"

# ---- 7. Python 依赖 ----
echo ""
echo "🐍 7/7 安装 Python 依赖..."
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
echo "  2. 启动模拟器:  emulator -avd voice_benchmark"
echo "  3. 安装元宝和豆包 APP 到模拟器"
echo "  4. 运行测试:  python3 src/runner.py"
echo "============================================"
