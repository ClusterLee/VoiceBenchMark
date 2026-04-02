#!/bin/bash
# 从系统 skill 目录同步到本地（反向同步）
# 用于系统 skill 有更新时拉取到本地
# 用法: ./sync_from_system.sh [--dry-run]

set -euo pipefail

LOCAL_DIR="$(cd "$(dirname "$0")" && pwd)"
SYSTEM_DIR="$HOME/.workbuddy/skills/voice-benchmark/voice-benchmark"

echo "📁 系统目录: $SYSTEM_DIR"
echo "📁 本地目录: $LOCAL_DIR"
echo ""

if [ ! -d "$SYSTEM_DIR" ]; then
    echo "❌ 系统 skill 目录不存在: $SYSTEM_DIR"
    exit 1
fi

RSYNC_ARGS=(
    -av
    --delete
    --exclude='.DS_Store'
    --exclude='__pycache__/'
    --exclude='*.pyc'
    --exclude='.gitignore'
    --exclude='sync_to_system.sh'
    --exclude='sync_from_system.sh'
    --exclude='scripts/results/'
)

if [ "${1:-}" = "--dry-run" ]; then
    RSYNC_ARGS+=(-n)
    echo "🔍 DRY RUN 模式 — 仅预览变更，不实际同步"
    echo ""
fi

echo "=== 同步 SKILL.md ==="
rsync "${RSYNC_ARGS[@]}" "$SYSTEM_DIR/SKILL.md" "$LOCAL_DIR/SKILL.md"

echo "=== 同步 references/ ==="
rsync "${RSYNC_ARGS[@]}" "$SYSTEM_DIR/references/" "$LOCAL_DIR/references/"

echo "=== 同步 scripts/ ==="
rsync "${RSYNC_ARGS[@]}" "$SYSTEM_DIR/scripts/" "$LOCAL_DIR/scripts/"

echo ""
echo "✅ 反向同步完成！"
echo "   系统 → 本地: $SYSTEM_DIR → $LOCAL_DIR"
