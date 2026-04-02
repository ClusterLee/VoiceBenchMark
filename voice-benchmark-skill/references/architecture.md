# Voice Latency Benchmark — Architecture Reference

## System Architecture

```
┌─────────────────────────────────────────────────────┐
│                   CLI / Runner 层                     │
│  runner.py (BenchmarkRunner)                         │
│  - Click CLI: -t <target> -n <rounds> --inspect      │
│  - 编排: 循环 → 问候等待 → 预热 → 注入 → 轮询 → 异常值重试 → 统计 → 报告 │
├─────────────────────────────────────────────────────┤
│                   Automation 层                       │
│  BaseBot (ABC) → DoubaoBot / YuanbaoBot              │
│  - Appium + UiAutomator2 控制 Android APP            │
│  - detect_ai_response_state(): 文本变化 + 状态文案    │
│  - snapshot_baseline_texts(): 注入前文本快照           │
├─────────────────────────────────────────────────────┤
│                   Audio 层                            │
│  EmulatorMicInjector (gRPC)                          │
│  - injectAudio(): 按 20ms chunk 实时注入 PCM 到虚拟麦 │
│  VirtualMicrophone (ADB 后备)                        │
│  AudioAnalyzer: WebRTC VAD / 能量检测                │
├─────────────────────────────────────────────────────┤
│                   Report 层                           │
│  ReportGenerator: JSON / CSV / HTML                  │
│  LatencyStats: mean, median, P95, P99, std           │
├─────────────────────────────────────────────────────┤
│                   Config 层                           │
│  Config > DeviceConfig / AudioConfig /               │
│           BenchmarkConfig / AppConfig                │
│  YAML 加载 (configs/default.yaml)                    │
└─────────────────────────────────────────────────────┘
```

## Single Round Test Flow

```
1. bot.navigate_to_voice_chat()          # 导航到语音通话界面
   └── (豆包) start_new_conversation()    # 先新建对话，避免历史上下文
2. bot.start_voice_call()                # 开始通话
3. _wait_for_ai_greeting_done()          # ⭐ 等待 AI 主动问候结束（≤12s）
   └── 监测状态文案: "打断"/"对方" → 等 → "正在听" → 安全
4. Appium 预热 ×3                         # ⭐ 3 轮预热消除 UiAutomator2 JIT 开销
   └── bot.detect_ai_response_state() × 3
5. bot.snapshot_baseline_texts()         # 拍摄文本 baseline
6. injector.inject_wav(audio_path)       # gRPC 注入音频
   ├── t_inject = 注入开始时间戳
   └── t_audio_end = t_inject + 音频时长 (1.63s)
7. 高频轮询（50ms 间隔，实际 ~200ms 受 Appium 调用开销限制）:
   ├── bot.detect_ai_response_state()
   ├── 检测到 ai_responding → 记录 ai_start
   │   ├── TTFT = ai_start - t_audio_end
   │   └── E2E  = ai_start - t_inject
   └── 检测到 ai_finished → 记录 ai_end → break
8. ⭐ TTFT 异常值检测 (>8000ms → 自动重试 1 次)
9. bot.take_screenshot()                 # 截图留证
10. bot.end_voice_call()                 # 挂断
11. bot.reset_app()                      # 多轮间: force-stop + 冷启动
    └── ⭐ UI 就绪验证 (page_source 轮询, ≤10s)
```

## Bot Class Hierarchy

```python
BaseBot (ABC)                           # base_bot.py
├── connect() / disconnect()
├── find_element() / click_element()
├── take_screenshot() / capture_element_info()
├── reset_app()                         # force-stop + cold start + UI 就绪验证
├── navigate_to_voice_chat()  [abstract]
├── start_voice_call()        [abstract]
├── end_voice_call()          [abstract]
├── is_ai_responding()        [abstract]
└── is_ai_finished()          [abstract]

DoubaoBot(BaseBot)                      # doubao_bot.py
├── IDs 常量类（所有 resource-id）
├── enable_subtitle()                   # toggle, 需检测 content-desc
├── start_new_conversation()            # back_icon → 侧边栏 → 创建新对话
├── detect_ai_response_state()          # 字幕文本变化 + 状态文案
├── snapshot_baseline_texts()
├── _get_subtitle_texts_fast()          # subtitle_layout → content 子元素查找
└── _get_call_status_fast()             # 无 WebDriverWait 版本

YuanbaoBot(BaseBot)                     # yuanbao_bot.py
├── YuanbaoCoords 坐标常量类
├── YUANBAO_SYSTEM_TEXTS 系统文案过滤集
├── detect_ai_response_state()          # 对话文本变化 + 状态文案
├── snapshot_baseline_texts()
└── _get_conversation_texts()           # 过滤系统文案后的对话文本
```

## gRPC Audio Injection

EmulatorMicInjector 通过 Android 模拟器 gRPC `injectAudio()` API 注入音频。

**流程**：
1. 加载 WAV（48kHz, 16bit, mono）
2. 切分为 20ms chunk（每 chunk = 960 samples × 2 bytes = 1920 bytes）
3. 构造 AudioPacket stream（首包带 AudioFormat）
4. 按实时节奏发送（sleep 对齐真实播放时间）
5. 返回注入开始时间戳

**关键参数**：
- `grpc_host`: localhost
- `grpc_port`: 8554（模拟器需 `-grpc 8554` 启动）
- `chunk_ms`: 20（实时节奏控制精度）

## Config Hierarchy

```yaml
# configs/default.yaml
node_id: "local"
node_region: "local"

device:
  platform: "Android"
  device_name: "emulator-5554"
  platform_version: "11"
  automation_name: "UiAutomator2"
  appium_host: "127.0.0.1"
  appium_port: 4723

audio:
  input_file: "assets/audio/hello_nihao_edge_48k.wav"
  sample_rate: 16000
  vad_aggressiveness: 2

benchmark:
  num_rounds: 3
  round_interval: 1.0
  output_dir: "results"
  report_formats: [json, csv, html]

apps:
  doubao:
    package: "com.larus.nova"
    activity: "com.larus.home.impl.alias.AliasActivity1"
    response_timeout: 30.0
  yuanbao:
    package: "com.tencent.hunyuan.app.chat"
    activity: ".biz.login.v2.HYLoginMainActivity"
    response_timeout: 30.0
```

## Dependencies

| Category | Packages |
|----------|----------|
| Core | numpy, scipy, librosa, soundfile, webrtcvad |
| Appium | Appium-Python-Client, selenium |
| Audio | pydub, pyaudio |
| Report | jinja2, matplotlib, pandas |
| Config/CLI | pyyaml, click |
| Logging | loguru, rich |
| gRPC | grpcio (via generated proto stubs) |

## Test Scripts

| Script | Purpose |
|--------|---------|
| `scripts/e2e_test.py` | Appium 联调（连接、导航、通话、挂断）|
| `scripts/test_audio_inject.py` | gRPC 音频注入验证 |
| `scripts/test_pipeline.py` | 完整管线端到端测试 |
| `scripts/test_text_detection.py` | 文本检测调试（支持 --inject）|
| `scripts/setup_mac.sh` | macOS 一键环境安装 |
