#!/usr/bin/env bash
# 截屏 + 叠加坐标网格 + preview
# 用法: ./cap_now.sh <名字>      例: ./cap_now.sh lingbao_home
set -euo pipefail
NAME="${1:-now}"
TS=$(date +%H%M%S)

DIR=/Users/licong/Downloads/VoiceBench/voice-benchmark-skill/scripts/lingbao/grid
mkdir -p "$DIR"
RAW="$DIR/${NAME}_${TS}_raw.png"
GRID="$DIR/${NAME}_${TS}_grid.png"

export PATH="$HOME/Library/Android/sdk/platform-tools:$PATH"
adb shell screencap -p /sdcard/_g.png
adb pull /sdcard/_g.png "$RAW" >/dev/null 2>&1
adb shell rm /sdcard/_g.png 2>/dev/null || true

PY=/Users/licong/.workbuddy/binaries/python/envs/default/bin/python
"$PY" /Users/licong/Downloads/VoiceBench/voice-benchmark-skill/scripts/lingbao/cap_grid.py "$RAW" "$GRID" 100

echo ""
echo "RAW:  $RAW"
echo "GRID: $GRID"
ls -la "$GRID"
