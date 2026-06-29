#!/usr/bin/env bash
# 在指定状态名下抓一张 grid 截图，方便你手动操作 emulator 时分阶段抓
# 用法: ./snap.sh <stage_name>
#   ./snap.sh 1_lobby
#   ./snap.sh 2_lingbao_home
#   ./snap.sh 3_interaction_page
#   ./snap.sh 4_wakeup_popup
#   ./snap.sh 5_ready
set -euo pipefail
NAME="${1:?需要状态名}"

DIR=/Users/licong/Downloads/VoiceBench/voice-benchmark-skill/scripts/lingbao/grid
mkdir -p "$DIR"
RAW="$DIR/${NAME}_raw.png"
GRID="$DIR/${NAME}_grid.png"

export PATH="$HOME/Library/Android/sdk/platform-tools:$PATH"
adb exec-out screencap -p > "$RAW"

PY=/Users/licong/.workbuddy/binaries/python/envs/default/bin/python
"$PY" /Users/licong/Downloads/VoiceBench/voice-benchmark-skill/scripts/lingbao/cap_grid.py "$RAW" "$GRID" 100 >/dev/null

SIZE=$(stat -f%z "$GRID")
echo "✓ ${NAME}: $GRID ($((SIZE/1024))KB)"
