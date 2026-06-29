#!/usr/bin/env bash
# 用 macOS Vision OCR 自动校准灵宝路径坐标
# 流程：tap → 等 → 截屏 → OCR → 解析下一步坐标 → 更新脚本
set -euo pipefail

ADB="adb"
export PATH="$HOME/Library/Android/sdk/platform-tools:$PATH"
ROOT="$(cd "$(dirname "$0")" && pwd)"
SHOTS="$ROOT/calib"
mkdir -p "$SHOTS"

ocr() {
  swift "$ROOT/ocr.swift" "$1" 2>/dev/null
}

# 找文字中心：参数 1=ocr 输出, 2=要找的文字
center_of() {
  local out="$1" needle="$2"
  echo "$out" | awk -F'\t' -v n="$needle" '
    $2 ~ n {
      split($1, a, ",");
      cx = int((a[1] + a[3]) / 2);
      cy = int((a[2] + a[4]) / 2);
      print cx","cy;
      exit
    }'
}

snap() {
  local name="$1"
  local out="$SHOTS/$name.png"
  $ADB exec-out screencap -p > "$out"
  echo "$out"
}

echo "════ 0. 起点检查（应在大厅或灵宝主页）════"
img=$(snap 0_init)
out=$(ocr "$img")
echo "$out" | head -10
echo ""

# === Step 1: 找灵宝头像（大厅）===
# 灵宝头像无文字，但浮动提示"长按并拖拽灵宝"在 (1820,923)-(2037,978)
# 灵宝精灵就在提示文字附近右下，约 (2240, 920)（已验证）
LINGBAO_CENTER="2240,920"

# 判断现在是不是大厅
in_lobby=$(echo "$out" | grep -E "英雄|备战|战队|背包" | wc -l | tr -d ' ')
in_lingbao_home=$(echo "$out" | grep -E "灵宝设置" | wc -l | tr -d ' ')

if [ "$in_lobby" -ge 2 ]; then
  echo "✓ 在大厅，需要 tap 灵宝头像"
  echo "tap $LINGBAO_CENTER"
  $ADB shell input tap 2240 920
  sleep 2
  img=$(snap 1_after_lingbao_tap)
  out=$(ocr "$img")
elif [ "$in_lingbao_home" -ge 1 ]; then
  echo "✓ 已在灵宝主页或互动页，跳过 step1"
else
  echo "⚠ 未识别状态，按返回键试试回大厅"
  $ADB shell input keyevent KEYCODE_BACK; sleep 1
  $ADB shell input keyevent KEYCODE_BACK; sleep 1
  img=$(snap 0_recover)
  out=$(ocr "$img")
fi

# === Step 2: 找左侧"互动"===
INTERACT_XY=$(center_of "$out" "互动")
echo ""
echo "════ Step2: 互动按钮坐标 = $INTERACT_XY ════"
if [ -n "$INTERACT_XY" ]; then
  IFS=',' read -r ix iy <<< "$INTERACT_XY"
  echo "tap ($ix, $iy)"
  $ADB shell input tap "$ix" "$iy"
  sleep 1.5
  img=$(snap 2_after_interaction)
  out=$(ocr "$img")
fi

# === Step 3: 找顶部"唤醒"===
WAKEUP_XY=$(center_of "$out" "唤醒")
echo ""
echo "════ Step3: 唤醒按钮坐标 = $WAKEUP_XY ════"
if [ -n "$WAKEUP_XY" ]; then
  IFS=',' read -r wx wy <<< "$WAKEUP_XY"
  echo "tap ($wx, $wy)"
  $ADB shell input tap "$wx" "$wy"
  sleep 1.5
  img=$(snap 3_after_wakeup)
  out=$(ocr "$img")
  echo "--- 弹出菜单 OCR ---"
  echo "$out"
fi

# === Step 4: 找弹出菜单中的"连续"===
CONTINUOUS_XY=$(center_of "$out" "连续")
echo ""
echo "════ Step4: 连续按钮坐标 = $CONTINUOUS_XY ════"
if [ -n "$CONTINUOUS_XY" ]; then
  IFS=',' read -r cx cy <<< "$CONTINUOUS_XY"
  echo "tap ($cx, $cy)"
  $ADB shell input tap "$cx" "$cy"
  sleep 1.5
  img=$(snap 4_after_continuous)
  out=$(ocr "$img")
fi

# === Step 5: 验证准备态（"按住说话"）===
SAY_XY=$(center_of "$out" "按住说话")
echo ""
echo "════ Step5: 按住说话坐标 = $SAY_XY ════"

echo ""
echo "════════════════════════════════════════"
echo "校准结果汇总:"
echo "  step1 灵宝头像: $LINGBAO_CENTER"
echo "  step2 互动:     $INTERACT_XY"
echo "  step3 唤醒:     $WAKEUP_XY"
echo "  step4 连续:     $CONTINUOUS_XY"
echo "  step5 按住说话: $SAY_XY"
echo "════════════════════════════════════════"
echo ""
echo "截图存于: $SHOTS"
