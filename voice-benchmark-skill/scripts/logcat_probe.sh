#!/usr/bin/env bash
# logcat 探针：抓取 voice-benchmark 测试期间的所有"音频/TTS 起点"候选事件
# 用法：bash logcat_probe.sh <output_log_path> &
# 之后跑 voice-benchmark 测试，结束后停止本脚本，对比 logcat 时间戳与 OCR ai_start

set -euo pipefail

OUT="${1:-/tmp/lingbao_logcat_$(date +%Y%m%d_%H%M%S).log}"
export PATH="$HOME/Library/Android/sdk/platform-tools:$PATH"

echo "[logcat_probe] 输出到 $OUT"
echo "[logcat_probe] 清 logcat buffer"
adb logcat -c

echo "[logcat_probe] 开始捕获 (Ctrl+C 停止)"

# 关键 tag 集合（覆盖 Android 音频框架 + 王者 sgame + TTS 候选）
# AudioTrack / AudioFlinger: 音频流 start/stop
# MediaPlayer: 音频播放器
# OpenSLES: 王者引擎用 OpenSL ES 接口
# AAudio: Android Pro Audio
# AudioPolicy: 焦点/路由切换
# sgame / WeGame / GameVoice: 王者业务层
# TTS / VoiceCall: 通用 TTS 关键词

adb logcat -v time \
    AudioTrack:V \
    AudioFlinger:V \
    MediaPlayer:V \
    OpenSLES:V \
    AAudio:V \
    AudioPolicy:V \
    AudioSource:V \
    AudioRecord:V \
    sgame:V \
    libsgame:V \
    Lingbao:V \
    GameVoice:V \
    WeGame:V \
    TTS:V \
    Streaming:V \
    VoiceCall:V \
    AudioMixer:V \
    StagefrightPlayer:V \
    NuPlayer:V \
    *:S \
    > "$OUT" 2>&1
