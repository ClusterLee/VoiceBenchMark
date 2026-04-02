#!/bin/bash
# 同步本地 skill 到系统 skill 目录
# 用法: ./sync_to_system.sh [--dry-run]

set -euo pipefail

LOCAL_DIR="$(cd "$(dirname "$0")" && pwd)"
SYSTEM_DIR="$HOME/.workbuddy/skills/voice-benchmark/voice-benchmark"

echo "📁 本地目录: $LOCAL_DIR"
echo "📁 系统目录: $SYSTEM_DIR"
echo ""

if [ ! -d "$SYSTEM_DIR" ]; then
    echo "❌ 系统 skill 目录不存在: $SYSTEM_DIR"
    echo "   请先确认 voice-benchmark skill 已安装"
    exit 1
fi

# rsync 参数
RSYNC_ARGS=(
    -av
    --delete
    --exclude='.DS_Store'
    --exclude='__pycache__/'
    --exclude='*.pyc'
    --exclude='.gitignore'
    --exclude='sync_to_system.sh'
    --exclude='sync_from_system.sh'
)

# 结果目录不同步（系统目录有自己的结果）
RSYNC_ARGS+=(--exclude='scripts/results/')

if [ "${1:-}" = "--dry-run" ]; then
    RSYNC_ARGS+=(-n)
    echo "🔍 DRY RUN 模式 — 仅预览变更，不实际同步"
    echo ""
fi

# 同步 SKILL.md
echo "=== 同步 SKILL.md ==="
rsync "${RSYNC_ARGS[@]}" "$LOCAL_DIR/SKILL.md" "$SYSTEM_DIR/SKILL.md"

# 同步 references/
echo "=== 同步 references/ ==="
rsync "${RSYNC_ARGS[@]}" "$LOCAL_DIR/references/" "$SYSTEM_DIR/references/"

# 同步 scripts/ (核心代码)
echo "=== 同步 scripts/ ==="
rsync "${RSYNC_ARGS[@]}" "$LOCAL_DIR/scripts/" "$SYSTEM_DIR/scripts/"

echo ""
echo "✅ 同步完成！"
echo "   本地 → 系统: $LOCAL_DIR → $SYSTEM_DIR"
