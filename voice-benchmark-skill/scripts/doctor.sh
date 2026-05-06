#!/bin/bash
# ============================================
# VoiceBench 环境体检
# ============================================
# 用法:  bash doctor.sh
# 退出:  0=全绿 / 1=有红
#
# 10 项检查：
#   1. 架构 + 磁盘
#   2. 工具链版本（java/node/python/appium）
#   3. ANDROID_HOME / JAVA_HOME / PATH
#   4. AVD 存在 + config.ini 关键项
#   5. BlackHole 2ch 虚拟音频
#   6. 模拟器进程 / boot_completed
#   7. APK 已安装 + versionCode
#   8. Appium 4723 可连
#   9. gRPC 8554 listening
#  10. 音频注入冒烟（10s 静音音频，看 dumpsys audio 有无输入）

set -u  # 不要 set -e；某项失败要继续往下查
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
PASS=0; FAIL=0; WARN=0
ok()   { echo -e "${GREEN}✓${NC} $*"; PASS=$((PASS+1)); }
bad()  { echo -e "${RED}✗${NC} $*"; FAIL=$((FAIL+1)); }
warn() { echo -e "${YELLOW}⚠${NC} $*"; WARN=$((WARN+1)); }
section() { echo ""; echo "── $* ──"; }

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ANDROID_HOME="${ANDROID_HOME:-$HOME/Library/Android/sdk}"
AVD_NAME="Pixel_6_API_34"
AVD_DIR="$HOME/.android/avd/${AVD_NAME}.avd"

# macOS 默认没 timeout 命令，用 perl 模拟
run_with_timeout() {
    local secs=$1; shift
    perl -e 'alarm shift; exec @ARGV' "$secs" "$@" 2>/dev/null
}

# 自动补 PATH（用户可能用 managed runtime 或自定义路径）
export PATH="$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:/opt/homebrew/bin"
# 用户级 managed node（如有）
[ -d "$HOME/.workbuddy/binaries/node/versions/22.12.0/bin" ] && \
    export PATH="$HOME/.workbuddy/binaries/node/versions/22.12.0/bin:$PATH"
[ -d "$HOME/.workbuddy/binaries/node/workspace/node_modules/.bin" ] && \
    export PATH="$HOME/.workbuddy/binaries/node/workspace/node_modules/.bin:$PATH"

# 1. 架构 + 磁盘
section "1. 系统"
arch=$(uname -m)
[ "$arch" = "arm64" ] && ok "架构: arm64" || bad "架构 $arch (需要 arm64)"
free_gb=$(df -g "$HOME" | awk 'NR==2 {print $4}')
[ "$free_gb" -ge 25 ] && ok "磁盘: ${free_gb}GB 可用" || warn "磁盘仅 ${free_gb}GB（建议 >= 25GB）"
sw_vers -productVersion | head -1 | awk -F. '{exit !($1>=13)}' && ok "macOS $(sw_vers -productVersion)" || warn "macOS 版本可能过低（建议 13+）"

# 2. 工具链
section "2. 工具链版本"
check_v() {
    local name=$1 cmd=$2 min=$3 strict=${4:-strict}
    local actual
    if ! command -v "${cmd%% *}" &>/dev/null; then
        if [ "$strict" = "soft" ]; then warn "$name 未安装 (可选)"; else bad "$name 未安装"; fi
        return
    fi
    actual=$(eval "$cmd" 2>&1 | grep -oE '[0-9]+\.[0-9]+(\.[0-9]+)?' | head -1)
    if [ -z "$actual" ]; then warn "$name 版本无法解析"; return; fi
    if printf '%s\n%s\n' "$min" "$actual" | sort -V -C 2>/dev/null; then
        ok "$name $actual (>= $min)"
    else
        if [ "$strict" = "soft" ]; then warn "$name $actual < $min"; else bad "$name $actual < $min"; fi
    fi
}
# java 走 soft：Appium 自带 JRE 也能跑，没装系统级 JDK 不致命
check_v java       'java -version'                  17.0  soft
check_v node       'node --version'                 20.0
check_v python3    'python3 --version'              3.9
check_v appium     'appium --version'               2.5
# adb 第一行是协议版本(1.0.41)，第二行才是 build 版本（如 35.0.2）
check_v adb        'adb --version | sed -n 2p'      30.0
check_v ffmpeg     'ffmpeg -version'                4.0

# 3. 环境变量 + PATH
section "3. 环境变量"
[ -d "$ANDROID_HOME" ] && ok "ANDROID_HOME=$ANDROID_HOME" || bad "ANDROID_HOME 不存在: $ANDROID_HOME"
[ -d "$ANDROID_HOME/platform-tools" ] && ok "platform-tools 存在" || bad "platform-tools 缺失"
[ -d "$ANDROID_HOME/emulator" ] && ok "emulator 存在" || bad "emulator 目录缺失"
[ -n "${JAVA_HOME:-}" ] && ok "JAVA_HOME=$JAVA_HOME" || warn "JAVA_HOME 未设（Appium 通常能自己找）"

# 4. AVD
section "4. AVD"
if [ ! -d "$AVD_DIR" ]; then
    bad "AVD 目录不存在: $AVD_DIR"
else
    ok "AVD: $AVD_NAME"
    cfg="$AVD_DIR/config.ini"
    if [ -f "$cfg" ]; then
        for kv in "hw.gpu.mode=host" "hw.audioInput=yes"; do
            k=${kv%=*}; v=${kv#*=}
            # config.ini 可能写成 "key = value"（带空格），用 awk 去掉所有空白
            actual=$(awk -F= -v key="$k" '$1 ~ key {gsub(/[[:space:]]/,"",$2); print $2; exit}' "$cfg")
            [ "$actual" = "$v" ] && ok "config.ini $kv" || bad "config.ini $k=$actual (需 $v)"
        done
    fi
fi

# 5. BlackHole（Mac mini 必装）
section "5. 虚拟音频"
if system_profiler SPAudioDataType 2>/dev/null | grep -q BlackHole; then
    ok "BlackHole 2ch 已装"
else
    if system_profiler SPHardwareDataType 2>/dev/null | grep -qi "Mac mini\|Mac Studio"; then
        bad "Mac mini/Studio 未装 BlackHole 2ch（gRPC injectAudio 必崩）"
    else
        warn "未装 BlackHole（带内置麦克风的 Mac 可忽略）"
    fi
fi

# 6. 模拟器
section "6. 模拟器"
if pgrep -f "qemu-system.*${AVD_NAME}" &>/dev/null; then
    ok "qemu 进程在跑"
    if adb get-state 2>/dev/null | grep -q device; then
        ok "adb device online"
        boot=$(adb shell getprop sys.boot_completed 2>/dev/null | tr -d '\r')
        [ "$boot" = "1" ] && ok "boot_completed=1" || warn "boot_completed=$boot（还在启动）"
    else
        bad "adb 找不到 device"
    fi
else
    warn "模拟器未启动（运行测试前需启动）"
fi

# 7. APK
section "7. APP 安装"
check_pkg() {
    local pkg=$1
    local out
    out=$(run_with_timeout 5 adb shell pm list packages | grep "package:$pkg")
    if [ -n "$out" ]; then
        local code=$(run_with_timeout 5 adb shell dumpsys package "$pkg" | grep -oE "versionCode=[0-9]+" | head -1 | cut -d= -f2)
        ok "$pkg installed (code=$code)"
    else
        bad "$pkg 未安装"
    fi
}
if run_with_timeout 3 adb get-state | grep -q device; then
    check_pkg com.larus.nova
    check_pkg com.tencent.hunyuan.app.chat
else
    warn "adb 无在线设备或被占用，跳过 APP 检查"
fi

# 8. Appium
section "8. Appium"
appium_status=$(curl -s --max-time 2 http://127.0.0.1:4723/status 2>/dev/null)
if echo "$appium_status" | grep -q '"ready":true'; then
    ok "Appium :4723 ready"
    # /status 不返 driver list，改用 /sessions 或主动列 drivers
    if appium driver list --installed 2>&1 | grep -q uiautomator2; then
        ok "uiautomator2 driver 已装"
    else
        warn "appium 命令找不到或 uiautomator2 driver 未装"
    fi
else
    warn "Appium :4723 未启动（运行测试前需启动）"
fi

# 9. gRPC
section "9. gRPC"
if lsof -iTCP:8554 -sTCP:LISTEN &>/dev/null; then
    ok "gRPC :8554 listening"
else
    warn ":8554 未监听（emulator 启动时需带 -grpc 8554）"
fi

# 10. 音频路径冒烟
section "10. 音频路径"
if [ -f "$SCRIPT_DIR/assets/audio/math_question_edge_48k.wav" ]; then
    ok "测试音频文件存在"
else
    bad "测试音频缺失: assets/audio/math_question_edge_48k.wav"
fi

# 总结
echo ""
echo "════════════════════════════════════════════"
echo -e "  ${GREEN}PASS=$PASS${NC}  ${YELLOW}WARN=$WARN${NC}  ${RED}FAIL=$FAIL${NC}"
echo "════════════════════════════════════════════"
if [ "$FAIL" -gt 0 ]; then
    echo -e "${RED}体检未通过，先修复 ✗ 项再启动测试${NC}"
    exit 1
fi
if [ "$WARN" -gt 0 ]; then
    echo -e "${YELLOW}有 $WARN 项警告（多为 emulator/appium 未启动，正常）${NC}"
fi
echo -e "${GREEN}✅ 基础体检通过${NC}"
