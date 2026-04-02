# Voice Latency Benchmark — 技术架构

## 项目目标

评测**腾讯元宝**和**豆包**的语音通话响应速度，通过自动化手段发送"你好"语音，
精确测量从发送结束到 AI 开始回复的等待时长（End-to-End Voice Latency）。

## 核心指标

| 指标 | 定义 |
|------|------|
| **E2E Latency** | 从用户语音发送完毕 → AI 语音回复首音到达的时间差 |
| **TTFR (Time To First Response)** | 从点击发送 → 检测到 AI 语音活动的时间 |
| **Total Response Time** | 从发送 → AI 完整回复结束的时间 |

## 系统架构

```
┌──────────────────────────────────────────────────────┐
│                   调度层 (Python)                      │
│  ┌─────────┐  ┌──────────┐  ┌──────────────────┐     │
│  │ Runner   │  │ Reporter │  │ Config Manager   │     │
│  │ (编排)    │  │ (报告)   │  │ (多节点配置)      │     │
│  └────┬─────┘  └────┬─────┘  └────────┬─────────┘     │
│       │              │                 │               │
│  ┌────▼──────────────▼─────────────────▼─────────┐    │
│  │              Core Engine                       │    │
│  │  ┌──────────────┐  ┌─────────────────────┐    │    │
│  │  │ AudioAnalyzer│  │  LatencyCalculator   │    │    │
│  │  │ (VAD/波形)    │  │  (时间戳精确计算)     │    │    │
│  │  └──────────────┘  └─────────────────────┘    │    │
│  └───────────────────────────────────────────────┘    │
│                          │                             │
│  ┌───────────────────────▼───────────────────────┐    │
│  │           Automation Layer                     │    │
│  │  ┌────────────┐  ┌────────────┐               │    │
│  │  │ YuanbaoBot │  │ DoubaoBot  │               │    │
│  │  │ (元宝自动化) │  │ (豆包自动化) │               │    │
│  │  └──────┬─────┘  └──────┬─────┘               │    │
│  └─────────┼───────────────┼─────────────────────┘    │
│            │               │                           │
└────────────┼───────────────┼───────────────────────────┘
             │ Appium/ADB    │ Appium/ADB
┌────────────▼───────────────▼─────────────────────────┐
│            Android Device / Emulator                  │
│  ┌─────────────┐  ┌──────────────┐                    │
│  │  元宝 APP    │  │  豆包 APP     │                    │
│  └─────────────┘  └──────────────┘                    │
│  ┌──────────────────────────────────┐                 │
│  │  Virtual Audio (虚拟音频设备)      │                 │
│  │  - Input:  播放 "你好" WAV        │                 │
│  │  - Output: 录制 AI 回复音频       │                 │
│  └──────────────────────────────────┘                 │
└───────────────────────────────────────────────────────┘
```

## 延迟测量方法

### 方法 1：音频波形分析法（主方案）

```
Timeline:
  T0 ──────── T1 ──── T2 ──────── T3
  │           │       │           │
  开始播放    播放结束  AI首音检测  AI回复结束
  "你好"      "你好"   (VAD检测)

  E2E Latency = T2 - T1
  Total Time  = T3 - T0
```

1. **T0**: 触发语音发送（Appium 操作 + 时间戳记录）
2. **T1**: "你好"音频播放完毕（已知音频长度，T1 = T0 + audio_duration）
3. **T2**: 通过 VAD（Voice Activity Detection）检测到 AI 回复的第一个有效音频帧
4. **T3**: VAD 检测到 AI 回复结束

### 方法 2：屏幕状态检测法（辅助验证）

- 通过 Appium 截图检测 UI 状态变化（如"正在思考..."消失、波形动画出现）
- 精度较低（100-200ms），仅作为辅助

### 音频采集方案

**Android 模拟器方案：**
- 使用 `screenrecord` 录制屏幕+音频
- 使用 ADB 的 `adb shell screenrecord --output-format=h264` 录制
- 通过虚拟音频设备（PulseAudio on Linux / macOS AudioHAL）路由音频

**真机方案：**
- 外部录音设备同时录制手机扬声器输出
- 或使用 ADB 内录（需 root / Android 10+ 的 AudioPlaybackCapture API）

## 测试流程

```python
for target in ["yuanbao", "doubao"]:
    for round in range(num_rounds):
        1. 启动 APP，进入语音通话界面
        2. 开始系统音频录制
        3. 记录 T0 时间戳
        4. 通过虚拟麦克风播放 "你好" 音频
        5. 等待 AI 回复（最长 30s 超时）
        6. 停止录制
        7. 分析录制音频：
           - VAD 检测发送音频段 → 确认 T1
           - VAD 检测回复音频段 → 确认 T2, T3
        8. 计算延迟指标
        9. 记录结果到 CSV/JSON
```

## 全球部署架构（第二阶段）

```
                    ┌─────────────┐
                    │  中控服务器   │
                    │  (调度+报告)  │
                    └──────┬──────┘
                           │ API
          ┌────────────────┼────────────────┐
          ▼                ▼                ▼
   ┌──────────┐    ┌──────────┐    ┌──────────┐
   │ 北京节点  │    │ 新加坡节点│    │ 美西节点  │
   │ Docker   │    │ Docker   │    │ Docker   │
   │ + 云手机  │    │ + 云手机  │    │ + 云手机  │
   └──────────┘    └──────────┘    └──────────┘
```

每个节点：Docker 容器（调度层）+ 云手机服务（执行层），通过 ADB over TCP 连接。

## 技术栈

| 组件 | 技术选型 |
|------|---------|
| 语言 | Python 3.10+ |
| APP 自动化 | Appium 2.x + UiAutomator2 |
| 音频分析 | librosa / webrtcvad / numpy |
| 音频录制 | FFmpeg / ADB screenrecord |
| 报告生成 | Jinja2 + matplotlib |
| 容器化 | Docker + docker-compose |
| CI/CD | GitHub Actions |

## 文件结构

```
voice-latency-benchmark/
├── src/
│   ├── automation/          # Appium 自动化
│   │   ├── base_bot.py      # 基类
│   │   ├── yuanbao_bot.py   # 元宝自动化
│   │   └── doubao_bot.py    # 豆包自动化
│   ├── audio/               # 音频处理
│   │   ├── analyzer.py      # VAD + 波形分析
│   │   ├── recorder.py      # 系统音频录制
│   │   └── virtual_mic.py   # 虚拟麦克风
│   ├── report/              # 报告生成
│   │   └── generator.py
│   ├── runner.py            # 主运行脚本
│   └── config.py            # 配置管理
├── configs/
│   └── default.yaml         # 默认配置
├── assets/
│   └── audio/
│       └── hello.wav        # "你好" 音频文件
├── scripts/
│   ├── setup_mac.sh         # macOS 环境安装
│   └── setup_linux.sh       # Linux 环境安装
├── docker/
│   ├── Dockerfile
│   └── docker-compose.yml
├── results/                 # 测试结果输出
├── requirements.txt
└── README.md
```
