#!/bin/bash
# ============================================
# APK 安装与版本校验
# ============================================
# 用法:  bash install_apks.sh [doubao|yuanbao|all]
# 校验:  sha256 (若 manifest 提供) → adb install/install-multiple → adb dumpsys 校验 versionCode
set -e

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
MANIFEST="${SCRIPT_DIR}/configs/apk_manifest.yaml"
APK_DIR="${APK_DIR:-${SCRIPT_DIR}/assets/apk}"

target="${1:-all}"

if ! command -v python3 &>/dev/null; then
    echo -e "${RED}✗${NC} 需要 python3 解析 yaml"; exit 1
fi
if ! command -v adb &>/dev/null; then
    echo -e "${RED}✗${NC} adb 未安装，请先跑 setup_mac.sh"; exit 1
fi
if ! adb get-state &>/dev/null; then
    echo -e "${RED}✗${NC} adb 找不到设备，请先启动模拟器"; exit 1
fi

# 用 python3 把 manifest 解析成 shell 可读格式
parse_manifest() {
    python3 - "$MANIFEST" "$1" <<'PY'
import sys, yaml, json
manifest_path, app = sys.argv[1], sys.argv[2]
with open(manifest_path) as f:
    m = yaml.safe_load(f)
cfg = m['apps'].get(app)
if not cfg:
    sys.exit(f"app {app} 不在 manifest")
print(json.dumps(cfg))
PY
}

verify_sha256() {
    local file=$1 want=$2
    [ -z "$want" ] && return 0  # manifest 没填就跳过
    local actual=$(shasum -a 256 "$file" | awk '{print $1}')
    if [ "$actual" != "$want" ]; then
        echo -e "${RED}✗${NC} sha256 不匹配 $file"
        echo "  expected: $want"
        echo "  actual:   $actual"
        return 1
    fi
    echo -e "${GREEN}✓${NC} sha256 校验通过: $(basename "$file")"
}

verify_installed_version() {
    local pkg=$1 want_code=$2
    local actual_code=$(adb shell dumpsys package "$pkg" 2>/dev/null | grep -oE "versionCode=[0-9]+" | head -1 | cut -d= -f2)
    if [ -z "$actual_code" ]; then
        echo -e "${RED}✗${NC} 安装后未检测到 $pkg"; return 1
    fi
    if [ -n "$want_code" ] && [ "$want_code" != "0" ] && [ "$actual_code" != "$want_code" ]; then
        echo -e "${YELLOW}⚠${NC} versionCode 不匹配: 实际 $actual_code, 期望 $want_code"
        return 1
    fi
    echo -e "${GREEN}✓${NC} $pkg 已安装, versionCode=$actual_code"
}

install_one() {
    local app=$1 cfg pkg version_code install_type files
    cfg=$(parse_manifest "$app") || return 1
    pkg=$(echo "$cfg" | python3 -c 'import sys,json;print(json.load(sys.stdin)["package"])')
    version_code=$(echo "$cfg" | python3 -c 'import sys,json;print(json.load(sys.stdin).get("version_code",""))')
    install_type=$(echo "$cfg" | python3 -c 'import sys,json;print(json.load(sys.stdin).get("install_type","single"))')
    files=$(echo "$cfg" | python3 -c 'import sys,json;print(" ".join(json.load(sys.stdin).get("apk_files",[])))')

    echo ""
    echo "=== 安装 $app ($pkg) ==="

    # 文件 + sha256
    local apk_paths=()
    for f in $files; do
        local p="${APK_DIR}/${f}"
        if [ ! -f "$p" ]; then
            echo -e "${RED}✗${NC} 缺少 $p"
            echo "  下载提示:"
            echo "$cfg" | python3 -c 'import sys,json;[print("    -",h) for h in json.load(sys.stdin).get("download_hints",[])]'
            return 1
        fi
        local want_sha=$(echo "$cfg" | python3 -c "import sys,json;print(json.load(sys.stdin).get('sha256',{}).get('$f',''))")
        verify_sha256 "$p" "$want_sha" || return 1
        apk_paths+=("$p")
    done

    # 安装
    if [ "$install_type" = "split" ]; then
        echo "adb install-multiple ${apk_paths[*]}"
        adb install-multiple -r "${apk_paths[@]}" || { echo -e "${RED}✗${NC} install-multiple 失败"; return 1; }
    else
        echo "adb install ${apk_paths[0]}"
        adb install -r "${apk_paths[0]}" || { echo -e "${RED}✗${NC} install 失败"; return 1; }
    fi

    verify_installed_version "$pkg" "$version_code"
}

if [ "$target" = "all" ]; then
    install_one doubao
    install_one yuanbao
else
    install_one "$target"
fi

echo ""
echo -e "${GREEN}🎉 APK 安装完成${NC}"
echo "下一步: 手动登录豆包和元宝（首次必须）"
