#!/usr/bin/env bash
# prepare_lingbao_ready.sh — 灵宝高精度测试统一准备流程
#
# 串起完整链路（P0-P3 自动化）：
#   start_honor_emulator.sh        → emulator 启动 + gRPC 就绪
#   处理 USB DebuggingActivity      → P0：USB 调试授权弹窗抢焦点
#   等王者加载 / 点击开始游戏       → P2：不假设 boot 后就在大厅
#   清活动弹窗                      → P1：登录礼/新赛季等活动弹窗遮挡
#   navigate_lingbao.sh 到连续态    → P3：进入灵宝连续准备态
#
# 用法：
#   ./prepare_lingbao_ready.sh                      # 默认快照 lingbao_logged_in
#   ./prepare_lingbao_ready.sh lingbao_logged_in    # 指定快照
#   ./prepare_lingbao_ready.sh --no-restart         # emulator 已在线，跳过启动直接准备
#
# 成功退出 rc=0：灵宝已处于连续准备态（底部「和灵宝说句话吧」）
# 失败退出 rc!=0：截图留证到 results/prep_fail_*.png
set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
export PATH="$HOME/Library/Android/sdk/platform-tools:$HOME/Library/Android/sdk/emulator:$PATH"
export ANDROID_HOME="$HOME/Library/Android/sdk"

ADB="adb -s emulator-5554"
OCR_CMD="$SCRIPT_DIR/lingbao/ocr_bin"
if [ ! -x "$OCR_CMD" ]; then
  OCR_CMD="swift $SCRIPT_DIR/lingbao/ocr.swift"
fi

# ── 参数 ──
RESTART=1
SNAPSHOT="lingbao_logged_in"
for arg in "$@"; do
  case "$arg" in
    --no-restart) RESTART=0 ;;
    --restart) RESTART=1 ;;
    lingbao_*|*) SNAPSHOT="$arg" ;;
  esac
done

log() { echo "[$(date +%H:%M:%S)] $*"; }

# ── 工具函数 ──
get_focus() {
  $ADB shell dumpsys window 2>/dev/null | grep "mCurrentFocus" | head -1 || true
}

ocr_screen() {
  local tmp="/tmp/_prep_ocr.png"
  $ADB exec-out screencap -p > "$tmp" 2>/dev/null || return 1
  $OCR_CMD "$tmp" 2>/dev/null
}

ocr_has() {
  ocr_screen | grep -qE "$1"
}

# 快速检测屏幕平均亮度（不做OCR，约0.5秒）——用于判断 sgame 是否还在加载（全黑）
screen_brightness() {
  local tmp="/tmp/_prep_brightness.png"
  $ADB exec-out screencap -p > "$tmp" 2>/dev/null || return 1
  /Users/licong/.workbuddy/binaries/python/envs/default/bin/python3 -c "
from PIL import Image
import numpy as np
img = np.array(Image.open('$tmp'))
gray = np.mean(img[:,:,:3], axis=2)
print(int(gray.mean()))
" 2>/dev/null
}

# 从 uiautomator dump 中提取指定 resource-id 的 bounds 中心坐标
# 用法: dump_button_center "android:id/button1" -> "x y" 或空
dump_button_center() {
  local rid="$1"
  local xml
  xml="$($ADB shell uiautomator dump /sdcard/_u.xml 2>/dev/null && $ADB shell cat /sdcard/_u.xml 2>/dev/null)" || return 1
  local bounds
  bounds="$(echo "$xml" | grep -o "resource-id=\"$rid\"[^>]*bounds=\"\[[0-9,]*\]\[[0-9,]*\]\"" | grep -o 'bounds="\[[0-9,]*\]\[[0-9,]*\]"' | head -1)"
  [ -z "$bounds" ] && return 1
  # 解析 [x1,y1][x2,y2] -> 中心
  local nums
  nums="$(echo "$bounds" | grep -oE '[0-9]+')"
  local x1 y1 x2 y2
  x1="$(echo "$nums" | sed -n 1p)"
  y1="$(echo "$nums" | sed -n 2p)"
  x2="$(echo "$nums" | sed -n 3p)"
  y2="$(echo "$nums" | sed -n 4p)"
  echo "$(( (x1+x2)/2 )) $(( (y1+y2)/2 ))"
}

ensure_landscape() {
  $ADB shell settings put system accelerometer_rotation 0 >/dev/null 2>&1 || true
  $ADB shell settings put system user_rotation 1 >/dev/null 2>&1 || true
  sleep 1
}

# ════════════════════════════════════════════════════════════
# Step 0: 启动 emulator（或跳过）
# ════════════════════════════════════════════════════════════
log "═══ Step 0: emulator 启动 ═══"
if [ "$RESTART" -eq 1 ]; then
  if bash "$SCRIPT_DIR/start_honor_emulator.sh" "$SNAPSHOT"; then
    log "✓ emulator 启动成功"
  else
    log "✗ emulator 启动失败"
    exit 1
  fi
else
  # 检查 emulator 是否在线
  if ! $ADB get-state >/dev/null 2>&1; then
    log "emulator 不在线，自动启动..."
    bash "$SCRIPT_DIR/start_honor_emulator.sh" "$SNAPSHOT" || { log "✗ 启动失败"; exit 1; }
  else
    log "✓ emulator 已在线（--no-restart）"
  fi
fi

sleep 3  # 等 UI 稳定

# ════════════════════════════════════════════════════════════
# Step 1: 处理 USB DebuggingActivity（P0）
# ════════════════════════════════════════════════════════════
log "═══ Step 1: USB 调试授权弹窗检测 ═══"
focus="$(get_focus)"
if echo "$focus" | grep -q "UsbDebuggingActivity"; then
  log "检测到 USB 调试授权弹窗，处理中..."
  # 优先用 uiautomator dump 精确定位 Allow 按钮
  center="$(dump_button_center "android:id/button1" 2>/dev/null || true)"
  if [ -n "$center" ]; then
    log "  uiautomator 定位 Allow 按钮: $center"
    # 先勾 Always allow
    always_center="$(dump_button_center "android:id/alwaysUse" 2>/dev/null || true)"
    [ -n "$always_center" ] && $ADB shell input tap $always_center && sleep 0.3
    $ADB shell input tap $center
  else
    log "  uiautomator dump 失败，回退固定坐标（横屏）"
    # 横屏坐标：勾选 Always allow + Allow
    $ADB shell input tap 650 567
    sleep 0.5
    $ADB shell input tap 1844 725
  fi
  sleep 2
  focus="$(get_focus)"
  if echo "$focus" | grep -q "UsbDebuggingActivity"; then
    log "⚠ USB 弹窗仍在（focus=$focus）"
  else
    log "✓ USB 弹窗已处理"
  fi
else
  log "✓ 无 USB 调试弹窗"
fi

# ════════════════════════════════════════════════════════════
# Step 2: 拉起 sgame + 等加载完成 / 点开始游戏（P2）
# ════════════════════════════════════════════════════════════
log "═══ Step 2: sgame 加载 / 开始游戏 ═══"
ensure_landscape

# 如果焦点不是 sgame，拉起它
focus="$(get_focus)"
if ! echo "$focus" | grep -q "com.tencent.tmgp.sgame"; then
  log "sgame 不在前台，拉起..."
  $ADB shell am start -n com.tencent.tmgp.sgame/.SGameActivity >/dev/null 2>&1 || true
  sleep 5
fi

# 最多等 ~5min 找「开始游戏」或大厅特征
# 优化：亮度检测——sgame 加载期间全黑（<15），跳过OCR只做亮度检测（0.5s vs OCR 3秒）
# 优化：弹窗关键词提前跳出——版本更新公告等弹窗出现后立即去 Step 3 关闭
# 优化：sgame 退桌面时自动重新拉起（P0 修复 2026-06-24）
lobby_ready=0
POPUP_EARLY_HINT="新手大厅|开局得英雄|精选福利|登录有礼|每日对局|嘉年华|充值送礼|新手豪华登录礼|预约新赛季|客服|服务记录|快捷工具|版本更新|S44|不拘资格|更新公告|正式服|赛季"
_not_in_focus=0
_dark_count=0
for i in $(seq 1 60); do
  # ── sgame 焦点恢复机制 ──
  focus="$(get_focus)"
  if ! echo "$focus" | grep -q "com.tencent.tmgp.sgame"; then
    _not_in_focus=$((_not_in_focus + 1))
    if [ $_not_in_focus -ge 8 ]; then
      log "  ⚠ sgame 已连续 ${_not_in_focus} 次不在前台，重新拉起..."
      $ADB shell am start -n com.tencent.tmgp.sgame/.SGameActivity >/dev/null 2>&1 || true
      sleep 5; _not_in_focus=0
    fi
  else
    _not_in_focus=0
  fi

  # ── 亮度检测：sgame 加载期间全黑，跳过OCR省时间 ──
  bright=$(screen_brightness)
  if [ -n "$bright" ] && [ "$bright" -lt 15 ] 2>/dev/null; then
    _dark_count=$((_dark_count + 1))
    if [ $((i % 8)) -eq 0 ]; then
      log "  等待加载... (${i}/60) 亮度=${bright} [全黑]"
    fi
    sleep 4
    continue
  fi
  _dark_count=0

  if ocr_has "和灵宝说句话吧"; then
    log "✓ 已在灵宝连续准备态（提前命中）"
    log "═══ prepare_lingbao_ready 完成 ═══"
    exit 0
  fi
  if ocr_has "开始游戏|进入游戏"; then
    log "  检测到「开始游戏」按钮，点击..."
    $ADB shell input tap 1200 830
    sleep 8
    continue
  fi
  if ocr_has "对战|娱乐|商城|战绩|灵宝"; then
    log "✓ 王者大厅已就绪"
    lobby_ready=1
    break
  fi
  # 提前跳出：检测到弹窗特征词 → 不再空等，直接去 Step 3 清弹窗
  if [ $i -ge 4 ] && ocr_has "$POPUP_EARLY_HINT"; then
    log "  ✅ 检测到弹窗/公告遮挡（${i}/60），提前进入清弹窗步骤关闭它"
    break
  fi
  if [ $((i % 10)) -eq 0 ]; then
    log "  等待大厅... (${i}/60) focus=$(echo "$focus" | head -c 80)"
  fi
  sleep 2
done

if [ "$lobby_ready" -ne 1 ]; then
  log "⚠ 未确认大厅就绪，继续尝试清弹窗"
fi

# ════════════════════════════════════════════════════════════
# Step 3: 清活动弹窗（P1）
#
# 判据策略（否定逻辑为主）：
#   ✓ 已在灵宝连续态 → 跳过，直接成功
#   ✓ 检测到大厅特征词 → 无遮挡，退出清弹窗
#   ✗ 以上两者都没有 → 判定有弹窗遮挡，尝试关闭
#
# 弹窗类型与关闭策略（按优先级）：
#   A) 「新手大厅」全屏子页 → 左上角返回区 (100, 55)，不是弹窗而是子页面
#   B) 半屏/全屏活动弹窗 → 右上角 × 坐标候选
#   C) 顽固弹窗（× 无效、BACK 无效）→ 尝试继续 navigate，可能被覆盖
# ════════════════════════════════════════════════════════════
log "═══ Step 3: 清理活动弹窗 ═══"

# 弹窗特征词（高置信度，与 navigate_lingbao.sh 对齐）
POPUP_KEYWORDS="新手大厅|开局得英雄|开局送英雄|精选福利|登录有礼|每日对局|嘉年华|充值送礼|新手英雄自选礼包|去开局|问卷|福利周|返利|解锁|好得运|皮肤礼盒|碎片|赛季|常规赛|观赛|前往观看|预约|签到|领取|冒险|今日内不再弹出|我知道啦|下次吧|桌面组件|本命英雄|开黑车队优化|车队大厅"
POPUP_EXTRA="新手豪华登录礼|世界赛|立即查看|前往|去看看|跟.*冒险|得王者.*好礼"

# 全屏活动子页（需要特殊穿透处理，不是普通弹窗）
FULLSCREEN_ACTIVITY_KW="开局送英雄|去开局|开黑车队优化|车队大厅"

# 子页面特征词（排位/队伍招募等——这些不是主大厅）
SUBPAGE_KEYWORDS="多人排位|开始匹配|找椅子|排位 2v2|排位赛|组队|开黑车"

# ════════════════════════════════════════════════════════════
# 核心页面判断函数（用户要求：只有两个正确页面）
#
#   页面 A — 主界面（王者大厅）：
#     底部导航栏可见（英雄/定制/背包等）+ 无全屏弹窗遮挡
#     特征词：对战、娱乐、战绩（底部 tab）+ 灵宝小人区域
#
#   页面 B — 灵宝界面：
#     灵宝互动页已打开，能看到对话相关文字
#     特征词："和灵宝说句话吧"、"按住说话"、"灵宝对话由AI生成"
#
#   ⚠️ 如果不在以上两个页面 → 必须用两招脱离：
#     招式 1: 左上角返回按钮 (184, 55)
#     招式 2: 右上角退出/关闭按钮 (X_COORDS)
# ════════════════════════════════════════════════════════════

# 大厅特征词（⚠️ 绝不能包含"开始游戏"！登录前欢迎页有该按钮会导致误判
#              ⚠️ 绝不能包含"备战"！新手登录礼弹窗底部导航栏有该文字导致误判
#              ⚠️ 只保留大厅独有的特征，避免弹窗/子页面误匹配）
LOBBY_KEYWORDS="对战|娱乐|战绩|和灵宝说句话吧|综合.*英雄.*定制|来农场|超旁斗"

# 灵宝界面特征词（互动页 / 连续准备态）
LINGBAO_KEYWORDS="和灵宝说句话吧|按住说话|灵宝对话由AI生成"

# 判断当前是否在核心页面之一（主界面 或 灵宝界面）
is_core_page() {
  # 灵宝界面优先检测（最精确的终态）
  if ocr_has "$LINGBAO_KEYWORDS"; then
    return 0  # ✓ 在灵宝界面
  fi
  # 主界面：必须看到大厅特征词 + 不在子页面
  if ocr_has "$LOBBY_KEYWORDS" && ! ocr_has "$SUBPAGE_KEYWORDS"; then
    return 0  # ✓ 在主界面
  fi
  return 1  # ✗ 不在核心页面（被弹窗/活动页/子页面覆盖）
}

# 右上角 X 关闭按钮候选坐标（横屏2400×1080，与 navigate_lingbao.sh 对齐）
X_COORDS=(
  "2280 110"
  "2260 120"
  "2240 130"
  "2270 95"
  "2225 115"
  "2336 44"
  "2105 148"
)

# ═══ 返回按钮 & 退出按钮（用户核心规则：就这两个按钮，很简单）═══════════
#
# 【返回按钮】左上角 ← 白色左指箭头
#   视觉特征：白色（亮度>160，饱和度<60），左指箭头形状，宽约60px
#   位置：距左边缘~180px，距上边缘~55-75px（不同页面 y 略有差异）
#   坐标候选（连点，覆盖所有页面）：
BACK_COORDS=(
  "184 55"    # 活动页（开局送英雄）— y=39~72 质心
  "184 65"    # 通用中值
  "199 74"    # 客服页 — PIL校准(2026-06-24)，原(183,74)偏左16px未命中
)

# 【退出按钮】右上角 × 关闭叉号（白色或蓝色）
#   视觉特征：X 形状，颜色可能是白色、浅蓝或蓝色（KPL赛事等弹窗用蓝色X）
#   ⚠️ 2026-06-24 校准：
#     蓝色X核心在 (2103,128)，极亮蓝(B>200,R<80)
#     版本更新公告弹窗X在 (1876,148)，浅蓝白RGB(193,217,243)
#   位置：右上角，x≈1876-2336, y≈44-160
X_COORDS=(
  "1876 148"    # 浅蓝白X（版本更新公告弹窗，2026-06-24 新增）
  "2108 160"    # 浅蓝X（新手豪华登录礼弹窗，2026-06-24 新增）
  "2103 128"    # 蓝色X（KPL赛事弹窗，极亮蓝核心）
  "2280 110"    # 白色X（大弹窗）
  "2260 120"
  "2240 130"
  "2270 95"
  "2225 115"
  "2336 44"
  "2105 148"
)

cleaned=0
_ACTIVITY_RESTART_COUNT=0  # 防止活动页 force-stop 死循环
for i in $(seq 1 25); do
  # ══ 核心页面检查（用户要求：只有两个正确页面）══
  if is_core_page; then
    if ocr_has "$LINGBAO_KEYWORDS"; then
      log "✓ 已在灵宝连续准备态"
    else
      log "✓ 弹窗已清，处于主界面（大厅）"
    fi
    cleaned=1
    break
  fi

  # ✗ 不在核心页面 → 用两招脱离（用户规则）
  log "  [${i}/25] ⚠ 不在核心页面（主界面/灵宝界面），用两招脱离..."

  # ═══ 两招脱离（用户核心规则：返回按钮 + 退出按钮）════
  #   ⚠️ 关键：逐个尝试，每个点完等2秒检测，成功就停（不要连点！）
  #   招式 1: 左上角【返回按钮】← — 逐个尝试3个y候选
  #   招式 2: 右上角【退出按钮】× — 逐个尝试7个X候选
  # ═══════════════════════════════════

  # 招式 1：左上角返回按钮（逐个尝试，成功就停）
  log "  → 招式1: 左上角【返回】← 逐个尝试${#BACK_COORDS[@]}个候选..."
  for bc in "${BACK_COORDS[@]}"; do
    $ADB shell input tap $bc 2>/dev/null || true
    sleep 3
    if is_core_page; then
      log "  ✓ 返回按钮($bc) 成功，已在核心页面"
      cleaned=1
      break
    fi
    # 返回后可能到了登录页（开始游戏）→ 点击进入大厅
    sleep 1
    if ocr_has "开始游戏|进入游戏"; then
      log "  → 返回($bc)后检测到「开始游戏」，点击进入大厅..."
      $ADB shell input tap 1200 830 2>/dev/null || true
      sleep 10
      if is_core_page; then
        log "  ✓ 进入大厅成功"
        cleaned=1
        break
      fi
    fi
  done

  if [ "$cleaned" -eq 1 ]; then
    continue
  fi

  # 招式 2：右上角退出按钮（逐个尝试，成功就停）
  log "  → 招式1未生效，招式2: 右上角【退出】× 逐个尝试${#X_COORDS[@]}个候选..."
  for xc in "${X_COORDS[@]}"; do
    $ADB shell input tap $xc 2>/dev/null || true
    sleep 2
    if is_core_page; then
      log "  ✓ 退出按钮 X($xc) 成功"
      cleaned=1
      break
    fi
  done

  if [ "$cleaned" -eq 1 ]; then
    continue
  fi

  # 两招都失败 → 尝试 BACK 键兜底
  if [ "$cleaned" -eq 0 ]; then
    log "  → 两招均无效，尝试 BACK 兜底..."
    for bk in $(seq 1 4); do
      $ADB shell input keyevent BACK 2>/dev/null || true
      sleep 2
      if is_core_page; then
        log "  ✓ BACK ×${bk} 成功"
        cleaned=1
        break 2
      fi
      # 回到了登录前页 → 点击进入
      if ocr_has "开始游戏|进入游戏"; then
        log "  → 检测到「开始游戏」，点击进入..."
        $ADB shell input tap 1200 830 2>/dev/null || true
        sleep 10
      fi
    done
  fi

  # 两招+BACK 都失败 → 直接交给 navigate 状态机处理（不 force-stop 循环）
  if [ "$cleaned" -eq 0 ]; then
    log "  → 两招+BACK均无效，直接交给 navigate 状态机处理"
    log "  💡 navigate 状态机有自己的 UNKNOWN → 两招脱离逻辑"
    break
  fi
done

if [ "$cleaned" -ne 1 ]; then
  log "⚠ 弹窗清理未确认（已尝试${i}轮），截图留证后继续交给 navigate"
  $ADB exec-out screencap -p > "$SCRIPT_DIR/results/prep_popup_stuck_$(date +%Y%m%d_%H%M%S).png" 2>/dev/null || true
fi

# ════════════════════════════════════════════════════════════
# Step 3.5: 大厅验证 — 确保没跳到商城/设置等非大厅页面
# ════════════════════════════════════════════════════════════
log "═══ Step 3.5: 大厅位置验证 ═══"
MALL_KEYWORDS="商城.*适度娱乐|推荐.*新品.*促销|返场.*新手|首页.*商品.*夺宝"
if ocr_has "$MALL_KEYWORDS"; then
  log "⚠ 检测到商城页面，尝试退回大厅..."
  $ADB shell input tap 420 1010 2>/dev/null || true  # 商城内首页 tab
  sleep 2
  if ocr_has "$MALL_KEYWORDS"; then
    log "  商城首页无效，重启 sgame..."
    $ADB shell am force-stop com.tencent.tmgp.sgame >/dev/null 2>&1 || true
    sleep 2
    $ADB shell am start -n com.tencent.tmgp.sgame/.SGameActivity >/dev/null 2>&1 || true
    sleep 15
    if ocr_has "开始游戏"; then
      $ADB shell input tap 1189 837 2>/dev/null || true
      sleep 8
    fi
  fi
fi
# 检测子页面（排位/队伍等）→ BACK 回主大厅
if ocr_has "$SUBPAGE_KEYWORDS"; then
  log "⚠ 检测到子页面($SUBPAGE_KEYWORDS)，按 BACK 返回主大厅..."
  for bk in $(seq 1 5); do
    $ADB shell input keyevent BACK 2>/dev/null || true
    sleep 1.5
    if ! ocr_has "$SUBPAGE_KEYWORDS"; then
      log "  ✓ 已退出子页面 (BACK ×${bk})"
      break
    fi
  done
  sleep 2
fi
# 最终确认在大厅（纯大厅特征：对战/排位/娱乐 等）
if ! ocr_has "$LOBBY_KEYWORDS" && ! ocr_has "和灵宝说句话吧"; then
  log "⚠ 最终未确认在大厅状态，截图留证"
  $ADB exec-out screencap -p > "$SCRIPT_DIR/results/prep_not_lobby_$(date +%Y%m%d_%H%M%S).png" 2>/dev/null || true
fi

# ════════════════════════════════════════════════════════════
# Step 4: navigate_lingbao.sh 到连续态（P3）
# ════════════════════════════════════════════════════════════
log "═══ Step 4: navigate_lingbao.sh ═══"
if bash "$SCRIPT_DIR/lingbao/navigate_lingbao.sh" --skip-rotate; then
  log "✓ 灵宝连续准备态就绪"
  log "═══ prepare_lingbao_ready 完成 ═══"
  exit 0
else
  rc=$?
  log "✗ navigate_lingbao.sh 失败 rc=$rc"
  $ADB exec-out screencap -p > "$SCRIPT_DIR/results/prep_nav_fail_$(date +%Y%m%d_%H%M%S).png" 2>/dev/null || true
  exit $rc
fi
