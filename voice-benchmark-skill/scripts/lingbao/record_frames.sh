#!/usr/bin/env bash
# 后台连续抓帧到 frames/ 目录，按时间戳命名
# 用法: ./record_frames.sh start <duration_sec>
#       ./record_frames.sh stop
set -euo pipefail
ACTION="${1:-start}"
DUR="${2:-60}"

DIR=/Users/licong/Downloads/VoiceBench/voice-benchmark-skill/scripts/lingbao/frames
PIDFILE=/tmp/lingbao_record.pid
LOGFILE=/tmp/lingbao_record.log

export PATH="$HOME/Library/Android/sdk/platform-tools:$PATH"

if [[ "$ACTION" == "stop" ]]; then
  if [[ -f "$PIDFILE" ]]; then
    kill "$(cat $PIDFILE)" 2>/dev/null || true
    rm -f "$PIDFILE"
    echo "stopped. frames in $DIR"
    ls "$DIR" | wc -l | xargs echo "frame count:"
  else
    echo "no recording in progress"
  fi
  exit 0
fi

if [[ -f "$PIDFILE" ]] && kill -0 "$(cat $PIDFILE)" 2>/dev/null; then
  echo "already recording (pid $(cat $PIDFILE))"
  exit 1
fi

# 清空旧帧
rm -rf "$DIR"
mkdir -p "$DIR"

# 后台抓帧循环
(
  END=$(($(date +%s) + DUR))
  i=0
  while [ "$(date +%s)" -lt "$END" ]; do
    i=$((i+1))
    F=$(printf "%s/f%03d.png" "$DIR" "$i")
    adb shell screencap -p > "$F" 2>/dev/null || true
    # screencap 在某些 Android 版本输出会有 \r\n 转换问题，需修复
    perl -i -pe 's/\r\n/\n/g' "$F" 2>/dev/null || true
    sleep 0.8
  done
  echo "done $i frames" > "$LOGFILE"
) &
echo $! > "$PIDFILE"
echo "recording started (pid $(cat $PIDFILE)), duration ${DUR}s"
echo "操作 emulator 后执行: $0 stop"
