#!/usr/bin/env python3
"""
测试 Android 模拟器 gRPC 音频注入

验证能否通过 emulator gRPC 接口将 WAV 文件注入到虚拟麦克风。

Usage:
    python3 scripts/test_audio_inject.py
"""
import sys
import os
import time
import wave
import struct

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import grpc
from src.proto import emulator_controller_pb2 as pb2
from src.proto import emulator_controller_pb2_grpc as pb2_grpc


def load_wav(path: str):
    """加载 WAV 文件，返回 (采样率, 通道数, 采样位宽, PCM bytes)"""
    with wave.open(path, "rb") as wf:
        sr = wf.getframerate()
        ch = wf.getnchannels()
        sw = wf.getsampwidth()
        frames = wf.readframes(wf.getnframes())
        n_frames = wf.getnframes()
        duration = n_frames / sr
        print(f"WAV: {sr}Hz, {ch}ch, {sw*8}bit, {n_frames} frames, {duration:.2f}s")
        return sr, ch, sw, frames, duration


def audio_packet_generator(wav_path: str, chunk_ms: int = 20):
    """
    生成 AudioPacket 流

    将 WAV 文件切分成 chunk_ms 毫秒的小块，逐块发送
    """
    sr, ch, sw, pcm_data, duration = load_wav(wav_path)

    # 设置音频格式（只在第一个包中有效）
    fmt = pb2.AudioFormat(
        samplingRate=sr,
        channels=pb2.AudioFormat.Mono if ch == 1 else pb2.AudioFormat.Stereo,
        format=pb2.AudioFormat.AUD_FMT_S16 if sw == 2 else pb2.AudioFormat.AUD_FMT_U8,
        mode=pb2.AudioFormat.MODE_REAL_TIME,
    )

    # 计算每个 chunk 的字节数
    bytes_per_sample = sw * ch
    samples_per_chunk = int(sr * chunk_ms / 1000)
    bytes_per_chunk = samples_per_chunk * bytes_per_sample

    print(f"发送参数: chunk={chunk_ms}ms, {samples_per_chunk} samples/chunk, "
          f"{bytes_per_chunk} bytes/chunk")

    # 切片发送
    offset = 0
    chunk_count = 0
    t0 = time.time()

    while offset < len(pcm_data):
        chunk = pcm_data[offset:offset + bytes_per_chunk]
        if len(chunk) < bytes_per_chunk:
            # 最后一块不足的部分补零
            chunk = chunk + b"\x00" * (bytes_per_chunk - len(chunk))

        timestamp_us = int((time.time()) * 1_000_000)

        packet = pb2.AudioPacket(
            format=fmt if chunk_count == 0 else pb2.AudioFormat(),
            timestamp=timestamp_us,
            audio=chunk,
        )

        yield packet
        chunk_count += 1
        offset += bytes_per_chunk

        # 实时控制发送速度
        expected_time = chunk_count * chunk_ms / 1000.0
        elapsed = time.time() - t0
        sleep_time = expected_time - elapsed
        if sleep_time > 0:
            time.sleep(sleep_time)

    elapsed = time.time() - t0
    print(f"发送完成: {chunk_count} chunks, 耗时 {elapsed:.2f}s (音频时长 {duration:.2f}s)")


def test_inject(grpc_port: int = 8554, wav_path: str = None):
    """测试音频注入"""
    if wav_path is None:
        wav_path = os.path.join(
            os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
            "assets/audio/hello.wav",
        )

    if not os.path.exists(wav_path):
        print(f"❌ 音频文件不存在: {wav_path}")
        return False

    print(f"🎤 测试音频注入到模拟器麦克风")
    print(f"   gRPC 端口: {grpc_port}")
    print(f"   音频文件: {wav_path}")

    # 连接 gRPC
    channel = grpc.insecure_channel(f"localhost:{grpc_port}")
    stub = pb2_grpc.EmulatorControllerStub(channel)

    try:
        # 先测试连接
        print("   连接 gRPC 成功")

        # 注入音频
        print(f"\n📡 开始注入音频...")
        t_start = time.time()

        response = stub.injectAudio(audio_packet_generator(wav_path))

        t_end = time.time()
        print(f"\n✅ 音频注入完成！耗时 {t_end - t_start:.2f}s")
        print(f"   返回: {response}")
        return True

    except grpc.RpcError as e:
        print(f"\n❌ gRPC 错误: {e.code()} - {e.details()}")
        return False
    except Exception as e:
        print(f"\n❌ 错误: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        channel.close()


def test_stream_audio(grpc_port: int = 8554, duration_s: float = 3.0):
    """测试从模拟器流式获取音频输出（验证连接）"""
    print(f"\n🔊 测试流式获取模拟器音频输出 ({duration_s}s)...")

    channel = grpc.insecure_channel(f"localhost:{grpc_port}")
    stub = pb2_grpc.EmulatorControllerStub(channel)

    fmt = pb2.AudioFormat(
        samplingRate=16000,
        channels=pb2.AudioFormat.Mono,
        format=pb2.AudioFormat.AUD_FMT_S16,
    )

    try:
        packet_count = 0
        total_bytes = 0
        t_start = time.time()

        for packet in stub.streamAudio(fmt):
            packet_count += 1
            total_bytes += len(packet.audio)

            if packet_count <= 3:
                print(f"  收到包 #{packet_count}: {len(packet.audio)} bytes, "
                      f"ts={packet.timestamp}")

            if time.time() - t_start > duration_s:
                break

        elapsed = time.time() - t_start
        print(f"✅ 收到 {packet_count} 个音频包, "
              f"总计 {total_bytes} bytes, "
              f"耗时 {elapsed:.2f}s")
        return True

    except grpc.RpcError as e:
        print(f"❌ gRPC 错误: {e.code()} - {e.details()}")
        return False
    finally:
        channel.close()


if __name__ == "__main__":
    port = 8554
    wav = None
    if len(sys.argv) > 1:
        wav = sys.argv[1]

    # 步骤1: 先测试音频流获取（验证 gRPC 连接）
    ok1 = test_stream_audio(port, duration_s=2.0)

    # 步骤2: 注入音频
    if ok1:
        print("\n" + "=" * 50)
        ok2 = test_inject(port, wav)
    else:
        print("\n⚠️ 音频流获取失败，跳过注入测试")
