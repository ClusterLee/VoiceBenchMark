#!/usr/bin/env python3
"""生成测试音频 — 使用 Edge TTS 生成高质量中文语音

Usage:
    python3 generate_audio.py "您好"
    python3 generate_audio.py "一加一等于几" --voice zh-CN-XiaoxiaoNeural
    python3 generate_audio.py "你好，请问有什么可以帮你" -o custom_hello.wav
"""
import argparse
import subprocess
import sys
import os
import tempfile

PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))
DEFAULT_OUTPUT_DIR = os.path.join(PROJECT_DIR, "assets", "audio")


def generate(text: str, output_name: str = None, voice: str = "zh-CN-YunxiNeural"):
    """用 Edge TTS 生成 48kHz WAV 音频"""
    if output_name is None:
        safe = text[:10].replace(" ", "_").replace(",", "").replace("，", "")
        output_name = f"{safe}_edge_48k.wav"

    output_path = os.path.join(DEFAULT_OUTPUT_DIR, output_name)
    os.makedirs(DEFAULT_OUTPUT_DIR, exist_ok=True)

    with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as tmp:
        mp3_path = tmp.name

    try:
        # Step 1: Edge TTS -> MP3
        print(f"🗣️ Generating TTS: \"{text}\" (voice={voice})")
        subprocess.run(
            ["edge-tts", "--voice", voice, "--text", text, "--write-media", mp3_path],
            check=True, capture_output=True, text=True,
        )

        # Step 2: MP3 -> 48kHz WAV
        print(f"🔄 Converting to 48kHz WAV...")
        subprocess.run(
            ["ffmpeg", "-y", "-i", mp3_path, "-ar", "48000", "-ac", "1",
             "-acodec", "pcm_s16le", output_path],
            check=True, capture_output=True, text=True,
        )

        # Get duration
        result = subprocess.run(
            ["ffprobe", "-v", "error", "-show_entries", "format=duration",
             "-of", "csv=p=0", output_path],
            capture_output=True, text=True,
        )
        duration = float(result.stdout.strip()) if result.stdout.strip() else 0

        print(f"✅ Generated: {output_path}")
        print(f"   Duration: {duration:.2f}s, 48kHz, mono, 16-bit PCM")
        return output_path

    finally:
        if os.path.exists(mp3_path):
            os.unlink(mp3_path)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate test audio with Edge TTS")
    parser.add_argument("text", help="Text to speak")
    parser.add_argument("-o", "--output", default=None, help="Output filename")
    parser.add_argument("--voice", default="zh-CN-YunxiNeural", help="TTS voice")
    args = parser.parse_args()

    generate(args.text, args.output, args.voice)
