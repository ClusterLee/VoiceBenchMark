#!/usr/bin/env bash
# 王者荣耀 → 灵宝 → 互动 → 唤醒(连续) → 准备就绪
#
# 用法:
#   ./navigate_lingbao.sh                # 完整路径，每步截图（默认）
#   ./navigate_lingbao.sh --no-shots     # 不截图（更快）
#   ./navigate_lingbao.sh --dry-run      # 只打印不执行
#   ./navigate_lingbao.sh --skip-rotate  # 跳过强制横屏（已确认横屏时用）
#   ./navigate_lingbao.sh --from <step>  # 从指定步骤开始（1~5），调试时用
#
# 屏幕基准: 模拟器物理 1080×2400 + 王者强制横屏 → 2400×1080 (ROTATION_90)
# 所有 input tap 坐标均为横屏坐标系 (x: 0~2400, y: 0~1080)
#
# ── 路径（用户截图校准 2026-06-23）───────────────────────
#   step1 lobby            → 灵宝小人 (右下角白精灵+爱心图标)
#                            坐标: (2220, 960)
#   step2 lingbao_home     → 左侧"互动" tab
#                            坐标: (75, 305)
#   step3 interaction_page → 顶部"唤醒/连续" 按钮
#                            坐标: (857, 58)
#   step4 popup_menu       → 选择"连续"模式
#                            坐标: (829, 287)
#   step5 ready            → 验证"和灵宝说句话吧"准备态
#
# ── 弹窗策略（用户要求）─────────────────────────────────
#   进入游戏后：不断寻找 × 关闭按钮，一路点击到主界面。
#   到灵宝后：如有弹窗，同样找X关闭。
#   支持的弹窗类型：
#     - 活动弹窗：福利周、皮肤礼盒、K甲赛季、登录礼、预约等
#     - 灵宝内弹窗：新手豪华登录礼、签到、领取等
#     - 特殊页面：新手大厅(左上返回)、商城(重启sgame)
#
set -euo pipefail

# ── 参数解析 ───────────────────────────────────────────────
SCREENSHOTS=1
DRY_RUN=0
SKIP_ROTATE=0
START_STEP=1
DEVICE_SERIAL="${DEVICE_SERIAL:-emulator-5554}"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --no-shots) SCREENSHOTS=0; shift ;;
    --dry-run)  DRY_RUN=1; shift ;;
    --skip-rotate) SKIP_ROTATE=1; shift ;;
    --from) START_STEP="$2"; shift 2 ;;
    -h|--help)
      sed -n '2,25p' "$0"; exit 0 ;;
    *) echo "[!] unknown arg: $1" >&2; exit 2 ;;
  esac
done

# ── 路径准备 ───────────────────────────────────────────────
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"
TS=$(date +%Y%m%d_%H%M%S)
SHOTS_DIR="${SCRIPT_DIR}/shots/${TS}"
LOG_FILE="${SCRIPT_DIR}/shots/${TS}.log"
mkdir -p "$SHOTS_DIR"

# ── 工具函数 ───────────────────────────────────────────────
export PATH="${HOME}/Library/Android/sdk/platform-tools:${PATH}"

ADB="adb -s ${DEVICE_SERIAL}"
TMP_OCR="/tmp/_nav_ocr_${TS}.txt"
TMP_IMG="/tmp/_nav_img_${TS}.png"

log() {
  local msg="[$(date +%H:%M:%S)] $*"
  echo "$msg" | tee -a "$LOG_FILE"
}

run() {
  log "+ $*"
  if [[ $DRY_RUN -eq 0 ]]; then
    eval "$@"
  fi
}

snap() {
  local name="$1"
  if [[ $SCREENSHOTS -eq 0 || $DRY_RUN -eq 1 ]]; then return 0; fi
  local out="${SHOTS_DIR}/${name}.png"
  $ADB shell screencap -p /sdcard/_nav.png 2>/dev/null || return 0
  $ADB pull /sdcard/_nav.png "$out" >/dev/null 2>&1 || true
  $ADB shell rm /sdcard/_nav.png 2>/dev/null || true
  log "  📸 $out"
}

tap() {
  local x="$1" y="$2" label="$3"
  log "  → tap $label ($x, $y)"
  if [[ $DRY_RUN -eq 0 ]]; then
    $ADB shell input tap "$x" "$y"
  fi
}

wait_for() {
  local secs="${1:-0}" reason="${2:-等待}"
  log "  ⏳ wait ${secs}s — ${reason}"
  if [[ $DRY_RUN -eq 0 ]]; then
    sleep "$secs"
  fi
}

# ── OCR 引擎 ───────────────────────────────────────────────
# macOS Vision OCR；输出格式: "x1,y1,x2,y2\t文字"（每行一个识别结果）
if [[ -x "$SCRIPT_DIR/ocr_bin" ]]; then
  OCR_CMD="$SCRIPT_DIR/ocr_bin"
else
  OCR_CMD="swift $SCRIPT_DIR/ocr.swift"
fi

# 截图 + OCR 全文，结果存入全局变量 _OCR_TEXT
ocr_full_text() {
  [[ $DRY_RUN -eq 1 ]] && { _OCR_TEXT=""; return 0; }
  $ADB exec-out screencap -p > "$TMP_IMG" 2>/dev/null || return 1
  _OCR_TEXT=$($OCR_CMD "$TMP_IMG" 2>/dev/null || true)
}

# 检测文字是否存在（基于最新 ocr_full_text 结果）
ocr_has() {
  local needle="$1"
  [[ -z "${_OCR_TEXT:-}" ]] && return 1
  echo "$_OCR_TEXT" | grep -qE "$needle"
}

# 截图 + 单次检测（用于 wait_for_text 循环）
ocr_check() {
  local needle="$1"
  [[ $DRY_RUN -eq 1 ]] && return 0
  local tmp="/tmp/_ocr_check.png"
  $ADB exec-out screencap -p > "$tmp" 2>/dev/null || return 1
  $OCR_CMD "$tmp" 2>/dev/null | grep -qE "$needle"
}

wait_for_text() {
  local needle="$1" max_secs="${2:-6}" reason="${3:-检测文字}"
  log "  🔍 wait_for_text \"$needle\" (max ${max_secs}s) — $reason"
  if [[ $DRY_RUN -eq 1 ]]; then
    return 0
  fi
  local i=0
  while [[ $i -lt $max_secs ]]; do
    if ocr_check "$needle"; then
      log "  ✓ matched \"$needle\" after ${i}s"
      return 0
    fi
    sleep 1
    i=$((i + 1))
  done
  log "  ⚠ timeout: \"$needle\" not found in ${max_secs}s"
  return 1
}

# ════════════════════════════════════════════════════════════
#  核心：通用找X关弹窗策略（用户要求的方案）
# ════════════════════════════════════════════════════════════
#
# 策略：
#   1. OCR 全文扫描，检测弹窗特征词
#   2. 如果有弹窗 → 尝试 OCR 精确匹配 "X"/"×"/"✕" 文字坐标
#   3. 无精确匹配 → 扫描右上角常见 X 坐标区域
#   4. 特殊页面处理（新手大厅返回、商城检测等）
#   5. 兜底：BACK 键
#
# 大厅特征词（出现这些说明在大厅，无弹窗遮挡）：
LOBBY_KEYWORDS="对战|排位|娱乐|战绩|综合.*英雄|备战|来农场|超旁斗|稷下学院"
#
# 弹窗特征词（出现这些说明有弹窗需要关闭）：
POPUP_KEYWORDS="福利周|返利|解锁|好得运|皮肤礼盒|碎片|去接好运|赛季|常规赛|观赛|前往观看|登录礼|预约|签到|领取|开局|冒险|精选福利|今日内不再弹出|我知道啦|下次吧|去添加|桌面组件|本命英雄|客服资讯|无法赠送|赠送礼物|礼物给好友|安全中心|冻结|账号"

# OCR 找到的 X 按钮坐标（由 find_x_by_ocr 设置）
FOUND_X_CX=""
FOUND_X_CY=""
#
# 新手大厅特殊关键词：
NEWBIE_HALL_KEYWORDS="新手大厅"
#
# 商城页面特征：
MALL_KEYWORDS="商城.*适度娱乐|推荐.*新品|夺宝|特惠"

# 右上角 X 关闭按钮候选坐标（横屏2400×1080，按优先级排序）
X_COORDS=(
  "1876 148"   # 浅蓝白X（版本更新公告弹窗，2026-06-24 新增）
  "2280 110"   # 最外层（大弹窗）
  "2260 120"
  "2240 130"
  "2270 95"    # K甲赛季弹窗的X位置（图3红框）
  "2225 115"   # 福利周弹窗的X位置（图1红框）
  "2103 128"   # 蓝色X（KPL赛事弹窗）
)

# 找X并点击：尝试通过OCR找到 X/× 文字并返回其中心坐标
find_x_by_ocr() {
  [[ $DRY_RUN -eq 1 ]] && return 1
  [[ -z "$_OCR_TEXT" ]] && return 1
  # 匹配独立成行的 X / × / ✕ / x （通常是关闭按钮的文字）
  local hit
  hit=$(echo "$_OCR_TEXT" | grep -iE '^[0-9]+,[0-9]+,[0-9]+,[0-9]+\s+[X×✕x]$' | head -1)
  if [[ -n "$hit" ]]; then
    # 计算bbox中心: (x1+x2)/2, (y1+y2)/2
    # 用 ${:-0} 防止 set -u 下空值报错；awk 直接算中心避免多次 cut
    FOUND_X_CX=$(echo "${hit:-0,0,0,0}" | awk -F, '{printf "%d", ($1+$3)/2}')
    FOUND_X_CY=$(echo "${hit:-0,0,0,0}" | awk -F, '{printf "%d", ($2+$4)/2}')
    return 0
  fi
  return 1
}

# 主弹窗清理函数：不断找X关闭，直到到达目标状态
# 用法: clear_to_target "<目标特征词>" <最大轮数> "<描述>"
clear_to_target() {
  local target_kw="$1" max_rounds="${2:-30}" desc="${3:-目标页面}"
  [[ $DRY_RUN -eq 1 ]] && return 0

  local round=0
  while [[ $round -lt $max_rounds ]]; do
    round=$((round + 1))
    ocr_full_text

    # 已到达目标
    if ocr_has "$target_kw"; then
      log "  ✓ [round ${round}] 到达${desc}"
      return 0
    fi

    # 特殊处理：新手大厅/活动页/客服页 → 左上角【返回按钮】连点候选
    # 2026-06-24 校准：返回按钮 y 因页面不同有 55~74 偏差，需连点3个候选
    if ocr_has "$NEWBIE_HALL_KEYWORDS"; then
      log "  🧹 [${round}] 检测到「新手大厅」→ 连点左上角【返回】←"
      for bc in "184 55" "184 65" "183 74"; do
        tap $bc "返回候选" 2>/dev/null || true
        wait_for 1
      done
      wait_for 2
      continue
    fi

    # 特殊处理：商城页面 → 重启sgame退回大厅
    if ocr_has "$MALL_KEYWORDS"; then
      log "  ⚠ [${round}] 检测到商城页面 → 尝试退回..."
      tap 420 1010 "商城首页tab" 2>/dev/null || true
      wait_for 3
      ocr_full_text
      if ocr_has "$MALL_KEYWORDS"; then
        log "  → 商城首页无效，重启 sgame..."
        run "$ADB shell am force-stop com.tencent.tmgp.sgame"
        wait_for 2
        run "$ADB shell am start -n com.tencent.tmgp.sgame/.SGameActivity"
        wait_for 15
        # 可能还需要点开始游戏
        if ocr_check "开始游戏"; then
          tap 1189 837 "开始游戏"
          wait_for 8
        fi
      fi
      continue
    fi

    # 检测是否有弹窗
    local popup_found
    popup_found=$(echo "$_OCR_TEXT" | grep -oE "$POPUP_KEYWORDS" | head -3 | tr '\n' ',' | sed 's/,$//')
    if [[ -z "$popup_found" ]]; then
      # 没有弹窗特征，也不是目标页 → 可能是加载中或未知页
      log "  ? [${round}] 无弹窗特征也未达目标，OCR摘要:"
      echo "$_OCR_TEXT" | head -8 | sed 's/^/      /'
      # 尝试点右上角 + BACK
      tap 2280 110 "右上角区域(兜底)"
      sleep 1
      run "$ADB shell input keyevent KEYCODE_BACK"
      wait_for 2 "BACK后等待"
      continue
    fi

    # 有弹窗！先尝试 OCR 精确找 X
    local found_x=0
    if find_x_by_ocr; then
      log "  🧹 [${round}] OCR找到X (${FOUND_X_CX},${FOUND_X_CY}) | 弹窗:${popup_found}"
      tap "$FOUND_X_CX" "$FOUND_X_CY" "OCR-X按钮"
      found_x=1
    else
      # OCR没找到X → 扫描候选坐标
      log "  🧹 [${round}] 弹窗(${popup_found}) → 扫描X候选坐标..."
      for coord in "${X_COORDS[@]}"; do
        local cx cy
        cx=$(echo $coord | awk '{print $1}')
        cy=$(echo $coord | awk '{print $2}')
        $ADB shell input tap "$cx" "$cy" 2>/dev/null || true
        sleep 0.2
      done
      found_x=1
    fi

    wait_for 2 "关闭弹窗后等待"

    # 检查弹窗是否还在（有些弹窗需要点"今日内不再弹出"+"我知道啦"等）
    ocr_full_text
    if ocr_has "$POPUP_KEYWORDS"; then
      # 尝试点底部确认按钮区域
      log "  → 弹窗仍在，尝试确认按钮..."
      tap 1200 1010 "底部确认按钮区"
      wait_for 2
      # 再试 BACK
      ocr_full_text
      if ocr_has "$POPUP_KEYWORDS"; then
        run "$ADB shell input keyevent KEYCODE_BACK"
        wait_for 2
      fi
    fi
  done

  log "  ⚠ 清理弹窗达到上限(${max_rounds}轮)，当前状态:"
  ocr_full_text
  echo "$_OCR_TEXT" | head -10 | sed 's/^/      /'
  return 1
}

# ── 灵宝内部弹窗快速清理（轻量版，用于导航步骤间）─────────
# 只在灵宝页面内使用；如果不在灵宝页面则跳过
quick_dismiss_popup() {
  [[ $DRY_RUN -eq 1 ]] && return 0
  ocr_full_text
  if ! ocr_has "$POPUP_KEYWORDS"; then
    return 0  # 干净
  fi
  log "  🧹 快速清弹窗..."
  # 先找X
  if find_x_by_ocr; then
    tap "$FOUND_X_CX" "$FOUND_X_CY" "灵宝内弹窗X"
    wait_for 1.5
  else
    for coord in "${X_COORDS[@]}"; do
      local cx cy
      cx=$(echo $coord | awk '{print $1}')
      cy=$(echo $coord | awk '{print $2}')
      $ADB shell input tap "$cx" "$cy" 2>/dev/null || true
      sleep 0.2
    done
    wait_for 1.5
  fi
  # 兜底BACK
  ocr_full_text
  if ocr_has "$POPUP_KEYWORDS"; then
    run "$ADB shell input keyevent KEYCODE_BACK"
    wait_for 1.5
  fi
}

# ── 启动期：自检 + 强制横屏 ─────────────────────────────────
preflight() {
  log "════ Preflight ════"

  # 1) 设备在线
  if ! $ADB get-state >/dev/null 2>&1; then
    log "[!] device $DEVICE_SERIAL offline"
    exit 10
  fi
  log "✓ device online: $DEVICE_SERIAL"

  # 2) 王者前台 / 拉起
  local fg
  fg=$($ADB shell dumpsys window 2>/dev/null | grep -E "mCurrentFocus" | head -1 || true)
  if [[ "$fg" != *"com.tencent.tmgp.sgame"* ]]; then
    log "[!] sgame not in foreground, launching..."
    run "$ADB shell am start -n com.tencent.tmgp.sgame/com.tencent.tmgp.sgame.SGameActivity"
    wait_for 6 "sgame launching"
  else
    log "✓ sgame in foreground"
  fi

  # 3) 强制横屏
  if [[ $SKIP_ROTATE -eq 0 ]]; then
    log "── force landscape ──"
    run "$ADB shell settings put system accelerometer_rotation 0"
    run "$ADB shell settings put system user_rotation 1"
    wait_for 2 "rotation settle"
    local rot
    rot=$($ADB shell dumpsys window 2>/dev/null | grep -oE "mRotation=ROTATION_[0-9]+" | head -1 || true)
    if [[ "$rot" != "mRotation=ROTATION_90" && "$rot" != "mRotation=ROTATION_270" ]]; then
      log "[!] rotation still $rot, retry once"
      run "$ADB shell content insert --uri content://settings/system --bind name:s:user_rotation --bind value:i:1"
      wait_for 2 "rotation retry settle"
      rot=$($ADB shell dumpsys window 2>/dev/null | grep -oE "mRotation=ROTATION_[0-9]+" | head -1 || true)
    fi
    log "✓ rotation: $rot"
  else
    log "(skipped rotation force per --skip-rotate)"
  fi

  local size
  size=$($ADB shell wm size 2>/dev/null | tail -1 | awk '{print $NF}')
  log "✓ wm size: $size"

  snap "step0_preflight"
}

# ════════════════════════════════════════════════════════════
#  全屏活动子页面处理
#   「开局送英雄」「去开局」「开黑车队优化」等是全屏子页（不是弹窗），
#   左上角返回按钮和 BACK 都可能无效或层级太深。
#
#   最可靠策略：force-stop sgame 重启 → 等开始游戏 → 点击进入大厅
#   （因为已经在大厅附近了，重启只需 ~15s 即可回到干净大厅）
# ════════════════════════════════════════════════════════════
FULLSCREEN_ACTIVITY_KEYWORDS="开局送英雄|去开局|开黑车队优化|车队大厅"

handle_fullscreen_activity() {
  [[ $DRY_RUN -eq 1 ]] && return 0
  ocr_full_text

  if ! ocr_has "$FULLSCREEN_ACTIVITY_KEYWORDS"; then
    return 0  # 无全屏活动页
  fi

  # 只在第一次检测到时重启（避免无限循环）
  if [[ "${_ACTIVITY_RESTARTED:-0}" -eq 1 ]]; then
    log "  ⚠ 活动页仍存在（已重启过），强力清除..."
    # 策略A: 点底部确认按钮区（"我知道啦"/"去开局"/"下次吧"等）
    tap 1200 1010 "底部确认按钮区"
    wait_for 2
    # 策略B: 点"去开局"穿透
    if ocr_has "去开局"; then
      tap 1906 857 "去开局(穿透)"
      wait_for 5
    fi
    # 策略C: 连续BACK（最多8次，覆盖深层页面栈）
    for bk in $(seq 1 8); do
      run "$ADB shell input keyevent KEYCODE_BACK"
      wait_for 2
      ocr_full_text
      if ! ocr_has "$FULLSCREEN_ACTIVITY_KEYWORDS"; then
        log "  ✓ 活动页退出 (BACK ×${bk})"
        return 0
      fi
      # 额外：再试一次底部确认+右上角X
      tap 1200 1010 "底部确认"
      sleep 1
      tap 2280 110 "右上角X区域"
      sleep 1
    done
    log "  ⚠ 活动页顽固，强制继续..."
    return 0
  fi

  _ACTIVITY_RESTARTED=1
  log "  ⚠ 检测到全屏活动子页，重启 sgame（仅1次）..."

  run "$ADB shell am force-stop com.tencent.tmgp.sgame"
  wait_for 3 "sgame停止"
  run "$ADB shell am start -n com.tencent.tmgp.sgame/.SGameActivity"
  wait_for 8 "sgame启动"

  # 等待「开始游戏」出现并点击（最多等 45s）
  for i in $(seq 1 22); do
    if ocr_check "开始游戏"; then
      log "  ✓ 检测到开始游戏，点击 (1191, 837)..."
      tap 1191 837 "开始游戏"
      wait_for 12 "进入大厅+等待活动页加载"
      return 0
    fi
    sleep 2
  done

  log "  ⚠ 重启后未找到开始游戏，继续执行..."
}

# ════════════════════════════════════════════════════════════
#  5 步导航路径（坐标已按用户2026-06-23截图校准）
# ════════════════════════════════════════════════════════════

step1_lobby_to_lingbao() {
  log "════ Step1: lobby → 点击右下角灵宝小人 ════"

  # ★ 处理全屏活动子页（如「开局送英雄」）
  handle_fullscreen_activity

  # ★ 二次验证：重启后活动页可能再次弹出，必须确认清除
  ocr_full_text
  if ocr_has "$FULLSCREEN_ACTIVITY_KEYWORDS"; then
    log "  ⚠ 二次检测：活动页仍在，强力清除..."
    tap 1200 1010 "底部确认按钮"
    wait_for 2
    if ocr_has "去开局"; then
      tap 1906 857 "去开局(穿透)"
      wait_for 5
    fi
    for bk in $(seq 1 8); do
      run "$ADB shell input keyevent KEYCODE_BACK"
      wait_for 2
      ocr_full_text
      if ! ocr_has "$FULLSCREEN_ACTIVITY_KEYWORDS"; then
        log "  ✓ 活动页已清除 (BACK ×${bk})"
        break
      fi
      tap 1200 1010 "底部确认"
      sleep 1
      tap 2280 110 "右上X区域"
      sleep 1
    done
  fi

  snap "step1_before"

  # ★ 核心坐标：右下角灵宝入口
  # 用户截图4标注：红框在右下角，包含粉色爱心+白色精灵图标
  # 坐标 (2270, 1005)：红框中心区域（2026-06-23 用户截图v2校准）
  tap 2270 1005 "灵宝小人(右下角白精灵+爱心)"
  wait_for 3 "灵宝主页打开"
  snap "step1_after_lingbao"
}

step2_lingbao_to_interaction() {
  log "════ Step2: 灵宝主页 → 左侧「互动」tab ════"
  quick_dismiss_popup
  snap "step2_before"

  # ★ 核心坐标：左侧"互动"tab
  # 用户截图5标注：红框在左侧竖栏，文字"互动"
  # 坐标 (75, 305)：左侧栏"互动"文字中心
  tap 75 305 "左侧「互动」tab"

  # 期望：互动页特征文字
  wait_for_text "按住说话|灵宝对话由AI生成|和灵宝说句话吧" 8 "互动页就绪" || \
    log "  ⚠ 互动页 OCR 未命中，继续推进（可能 OCR 文本框漂移）"
  snap "step2_after_interaction"
}

step3_interaction_to_wakeup() {
  log "════ Step3: 互动页 → 切换到连续模式 ════"
  quick_dismiss_popup
  snap "step3_before"

  # 幂等检查：如果已经是连续模式则跳过
  if ocr_check "和灵宝说句话吧"; then
    log "✓ 已经处于连续模式（底部=和灵宝说句话吧），跳过切换"
    SKIP_STEP4=1
    snap "step3_already_continuous"
    return 0
  fi

  # 点击顶部"唤醒/连续"按钮
  tap 858 58 "顶部唤醒/连续按钮"
  wait_for_text "灵宝唤醒|连续|关闭|唤醒" 5 "唤醒菜单弹出" || \
    { log "  ✗ 唤醒菜单未出现"; return 31; }
  snap "step3_after_popup"
}

step4_select_continuous() {
  log "════ Step4: 菜单 → 选择「连续」 ════"
  quick_dismiss_popup
  if [[ "${SKIP_STEP4:-0}" -eq 1 ]]; then
    log "  (skipped: already in continuous mode)"
    return 0
  fi
  snap "step4_before"

  # step3已确认非连续→菜单首项就是"连续"
  tap 850 165 "菜单首项（连续）"
  wait_for_text "和灵宝说句话吧" 5 "连续模式生效" || \
    { log "  ✗ 连续模式未激活"; return 32; }
  snap "step4_after_continuous"
}

step5_verify_ready() {
  log "════ Step5: verify 连续对话准备态 ════"
  quick_dismiss_popup
  snap "step5_ready"

  if ocr_check "和灵宝说句话吧"; then
    log "✅ 灵宝处于连续对话准备态，可开始 TTFT 测试"
    return 0
  else
    log "✗ 未检测到\"和灵宝说句话吧\"提示"
    return 33
  fi
}

# ── 状态机主流程（用户要求：两个关键状态，特别简单）────────
#
#  状态：
#    S_READY   = 连续准备态（"和灵宝说句话吧"）→ 完成
#    S_LINGBAO = 灵宝界面（灵宝主页/互动页）→ 切换连续模式
#    S_LOBBY   = 主界面（大厅）→ 点击灵宝小人
#    S_UNKNOWN = 不是以上任何页面 → 返回/退出脱离
#
#  循环：判断状态 → 执行操作 → 重复直到 S_READY 或超时
# ────────────────────────────────────────────────────────

# 返回按钮候选（左上角，逐个尝试）
BACK_COORDS=("184 55" "184 65" "199 74")
# 退出按钮候选（右上角，逐个尝试，含蓝色X）
EXIT_COORDS=("1876 148" "2108 160" "2103 128" "2280 110" "2260 120" "2240 130" "2270 95" "2225 115" "2336 44" "2105 148")

# 判断当前状态 → 返回 READY/LINGBAO/LOBBY/UNKNOWN
get_state() {
  ocr_full_text
  # S_READY: 连续准备态
  if ocr_has "和灵宝说句话吧"; then echo "READY"; return; fi
  # S_LINGBAO: 灵宝界面（灵宝主页/互动页特征词）
  if ocr_has "按住说话|灵宝对话由AI生成|灵宝设置|灵宝.*互动|唤醒.*灵宝|灵宝.*唤醒|情报.*互动.*定制"; then echo "LINGBAO"; return; fi
  # S_LOBBY: 主界面（大厅特征词，⚠️ 不含"对战"——"AI智能对战"会误匹配）
  if ocr_has "综合.*英雄.*定制|来农场|超旁斗|备战.*英雄"; then echo "LOBBY"; return; fi
  echo "UNKNOWN"
}

# 两招脱离：逐个尝试返回+退出，直到到达核心页面
escape_to_core() {
  local max_tries="${1:-3}"
  local try=0
  while [[ $try -lt $max_tries ]]; do
    try=$((try + 1))
    local st; st=$(get_state)
    [[ "$st" == "LOBBY" || "$st" == "LINGBAO" || "$st" == "READY" ]] && return 0

    log "  → [escape ${try}/${max_tries}] UNKNOWN → 招式1:返回 ←"
    for bc in "${BACK_COORDS[@]}"; do
      tap $bc "返回" 2>/dev/null || true
      wait_for 2
      st=$(get_state)
      [[ "$st" != "UNKNOWN" ]] && { log "  ✓ 返回($bc) → $st"; return 0; }
      # 返回后可能到了登录页 → 刷新OCR并检测"开始游戏"
      ocr_full_text
      if ocr_has "开始游戏|进入游戏"; then
        log "  → 返回($bc)后检测到「开始游戏」，点击进入..."
        tap 1200 830 "开始游戏" 2>/dev/null || true
        wait_for 10
        st=$(get_state)
        [[ "$st" != "UNKNOWN" ]] && { log "  ✓ 开始游戏 → $st"; return 0; }
      fi
    done

    log "  → [escape ${try}/${max_tries}] 招式2:退出 ×"
    for xc in "${EXIT_COORDS[@]}"; do
      tap $xc "退出" 2>/dev/null || true
      wait_for 2
      st=$(get_state)
      [[ "$st" != "UNKNOWN" ]] && { log "  ✓ 退出($xc) → $st"; return 0; }
    done
  done
  return 1
}

main() {
  log "═══════════════════════════════════════════════════════"
  log "Lingbao Navigator v4 状态机 (2026-06-24 重构)"
  log "  状态: READY/LINGBAO/LOBBY/UNKNOWN → 操作 → 循环"
  log "  Logs: $LOG_FILE"
  log "═══════════════════════════════════════════════════════"

  preflight

  local max_rounds=20 round=0
  while [[ $round -lt $max_rounds ]]; do
    round=$((round + 1))
    local state; state=$(get_state)
    log "  [round ${round}] 状态=${state}"

    case "$state" in
      READY)
        log "✅ 灵宝处于连续对话准备态，可开始 TTFT 测试"
        log "═══════════════════════════════════════════════════════"
        return 0
        ;;
      LINGBAO)
        # 已在灵宝界面 → 检查是否需要切换连续模式
        log "  → 灵宝界面：检查连续模式..."
        snap "round${round}_lingbao"
        if ocr_check "和灵宝说句话吧"; then
          log "  ✓ 已是连续模式"
          continue
        fi
        # 点击顶部唤醒按钮 → 选连续
        tap 858 58 "唤醒/连续按钮"
        wait_for 3
        if ocr_check "连续|唤醒"; then
          tap 850 165 "菜单首项(连续)"
          wait_for 3
        else
          log "  ⚠ 唤醒菜单未弹出，可能需要先切互动tab"
          tap 75 305 "互动tab"
          wait_for 2
          tap 858 58 "唤醒/连续按钮"
          wait_for 3
          ocr_check "连续|唤醒" && { tap 850 165 "连续"; wait_for 3; }
        fi
        ;;
      LOBBY)
        # 在主界面 → 点击灵宝小人进入灵宝界面
        log "  → 主界面：点击灵宝小人 (2270,1005)"
        snap "round${round}_lobby"
        tap 2270 1005 "灵宝小人"
        wait_for 3
        ;;
      UNKNOWN)
        # 不在核心页面 → 两招脱离
        log "  → UNKNOWN：两招脱离（返回← + 退出×）"
        snap "round${round}_unknown"
        escape_to_core 3 || {
          log "  ⚠ 两招脱离失败，尝试 BACK 兜底"
          run "$ADB shell input keyevent KEYCODE_BACK"
          wait_for 2
        }
        ;;
    esac
  done

  log "✗ ${max_rounds} 轮未到达连续准备态"
  return 31
}

main "$@"
