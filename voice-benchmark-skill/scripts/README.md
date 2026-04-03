# Voice Latency Benchmark

**AI 语音通话响应速度评测工具** — 评测元宝、豆包等 AI 产品的语音通话延迟。

## 核心功能

- 🎙️ 通过 Appium 自动化操作 Android APP 的语音通话功能
- 📊 VAD（Voice Activity Detection）精确测量端到端语音延迟
- 🌍 Docker 容器化，支持全球多节点部署
- 📈 自动生成 JSON/CSV/HTML 对比报告

## 快速开始

### 1. 安装环境

```bash
# macOS 一键安装
chmod +x scripts/setup_mac.sh
./scripts/setup_mac.sh
```

### 2. 准备设备

> ⚠️ **Mac mini/Mac Studio 用户必读**：这些机型没有内置麦克风，gRPC `injectAudio` 会导致模拟器直接崩溃。
> 必须先安装 BlackHole 2ch 虚拟音频驱动：`brew install blackhole-2ch && sudo killall -9 coreaudiod`
> `setup_mac.sh` 已包含此步骤。

```bash
# 启动 Android 模拟器（必须加 -no-snapshot-load 确保音频 HAL 正常初始化）
emulator -avd Pixel_6_API_34 -grpc 8554 -no-snapshot-load &

# 安装 APP
adb install yuanbao.apk
adb install doubao.apk

# 手动登录两个 APP（首次）
```

### 3. 准备音频

将真人说"你好"的音频文件放到 `assets/audio/hello.wav`

要求：
- 格式：WAV, 16kHz, 16bit, 单声道
- 时长：约 0.5-1.0 秒
- 内容：清晰的"你好"

### 4. 获取 UI 元素（首次）

```bash
# 启动 Appium
appium &

# 获取元宝的 UI 元素树
python3 src/runner.py --inspect yuanbao

# 获取豆包的 UI 元素树
python3 src/runner.py --inspect doubao

# 根据输出更新 configs/default.yaml 中的 XPath
```

### 5. 运行测试

```bash
# 启动 Appium
appium &

# 运行测试（默认 5 轮）
python3 src/runner.py

# 只测元宝，10 轮
python3 src/runner.py --targets yuanbao --rounds 10

# 使用自定义配置
python3 src/runner.py -c configs/cn-node.yaml
```

### 6. 查看报告

测试完成后，报告在 `results/` 目录下：
- `report_*.json` — 结构化数据
- `report_*.csv` — 表格数据
- `report_*.html` — 可视化报告

## Docker 部署

```bash
# 构建镜像
cd docker
docker-compose build

# 运行（需要先配置 ADB 设备连接）
ADB_DEVICE_HOST=<云手机IP> NODE_ID=beijing NODE_REGION=cn-north \
  docker-compose up
```

## 项目结构

```
voice-latency-benchmark/
├── src/
│   ├── automation/          # Appium APP 自动化
│   │   ├── base_bot.py
│   │   ├── yuanbao_bot.py
│   │   └── doubao_bot.py
│   ├── audio/               # 音频处理 + VAD
│   │   ├── analyzer.py
│   │   ├── recorder.py
│   │   └── virtual_mic.py
│   ├── report/              # 报告生成
│   │   └── generator.py
│   ├── runner.py            # 主入口
│   └── config.py            # 配置管理
├── configs/                 # YAML 配置
├── assets/audio/            # 测试音频
├── scripts/                 # 安装脚本
├── docker/                  # 容器化
├── results/                 # 输出目录
└── docs/                    # 技术文档
```

## 测量原理

```
Timeline:
  T0 ──────── T1 ──── T2 ──────── T3
  │           │       │           │
  开始播放    播放结束  AI首音检测  AI回复结束
  "你好"      "你好"   (VAD检测)

  E2E Latency = T2 - T1
  Total Time  = T3 - T0
```

通过 WebRTC VAD 或能量检测，精确识别录制音频中的语音段，
区分"用户发送段"和"AI 回复段"，计算延迟。

## 许可

Internal Use Only
