---
name: voice-benchmark
description: |
  AI 语音助手响应延迟（TTFT）自动化评测工具。通过 Android 模拟器 + Appium + gRPC 音频注入，精确测量 AI 语音通话的首次响应时间。
  当前支持：豆包（字节跳动）、腾讯元宝。
  **自包含 skill**：包含全部源码、配置、音频素材，安装后可直接运行。

  Use when:
  - 用户要求测试/评测 AI 语音助手的响应速度、延迟、TTFT
  - 用户提到 "voice benchmark"、"语音延迟测试"、"豆包 vs 元宝"
  - 用户要求运行语音通话自动化测试
  - 用户要求生成语音延迟对比报告
  - 用户要求调试 Appium 自动化、gRPC 音频注入
  - 用户要求为新的 AI 语音 APP 添加测试支持
---

# Voice Latency Benchmark

AI 语音助手响应延迟自动化评测工具。**自包含 skill**，包含全部源码和依赖。

## ⚡ Skill 内置目录结构

本 skill 的 `scripts/` 目录包含完整可运行项目：

```
scripts/
├── run_benchmark.sh          # 一键运行脚本
├── generate_audio.py         # Edge TTS 音频生成
├── requirements.txt          # Python 依赖
├── README.md                 # 项目说明
├── configs/
│   └── default.yaml          # 默认配置（设备/音频/APP 参数）
├── src/                      # ← 核心源码
│   ├── runner.py             # 主入口 + CLI（Click）
│   ├── config.py             # 配置管理
│   ├── audio/                # 音频注入 & 分析
│   ├── automation/           # Appium 自动化（豆包/元宝）
│   ├── proto/                # gRPC 协议文件
│   └── report/               # 报告生成
├── assets/audio/             # 测试音频（Edge TTS 48kHz）
├── docker/                   # Docker 部署文件
├── docs/                     # 架构文档
└── project_scripts/          # 调试 & 测试脚本
```

## 🚀 首次安装 & 部署

### 1. 创建工作目录 & 复制源码

```bash
# SKILL_DIR 由 AI 助手自动识别（即本 skill 的 scripts/ 路径）
SKILL_DIR="<skill_scripts_path>"
WORK_DIR="$HOME/voice-latency-benchmark"

mkdir -p "$WORK_DIR"
cp -r "$SKILL_DIR"/src "$WORK_DIR/"
cp -r "$SKILL_DIR"/configs "$WORK_DIR/"
cp -r "$SKILL_DIR"/assets "$WORK_DIR/"
cp -r "$SKILL_DIR"/docker "$WORK_DIR/"
cp -r "$SKILL_DIR"/docs "$WORK_DIR/"
cp -r "$SKILL_DIR"/project_scripts "$WORK_DIR/scripts"
cp "$SKILL_DIR"/requirements.txt "$WORK_DIR/"
cp "$SKILL_DIR"/README.md "$WORK_DIR/"
cp "$SKILL_DIR"/run_benchmark.sh "$WORK_DIR/"
chmod +x "$WORK_DIR/run_benchmark.sh"
```

### 2. 安装 Python 依赖

```bash
cd "$WORK_DIR"
pip install -r requirements.txt
```

### 3. 下载 APK（需手动）

APK 文件过大（~538MB），不含在 skill 中。从以下渠道获取并放入 `$WORK_DIR/assets/apk/`：

| APP | 包名 | 获取方式 |
|-----|------|----------|
| 豆包 | com.larus.nova | 豌豆荚 / APKPure / 手机直导 |
| 元宝 | com.tencent.hunyuan.app.chat | 应用宝 / APKPure / 手机直导 |

### 4. 配置 Android 模拟器

```bash
# 创建 AVD（API 30, Pixel 6）
~/Library/Android/sdk/cmdline-tools/latest/bin/avdmanager create avd \
  -n voice_benchmark -k "system-images;android-30;google_apis;x86_64" \
  -d "pixel_6"

# macOS 环境配置（一键脚本）
bash "$WORK_DIR/scripts/setup_mac.sh"
```

### 5. 安装 APP 到模拟器

```bash
adb install assets/apk/doubao.apk
adb install assets/apk/yuanbao.apk
# 首次需手动登录
```

## 快速运行

```bash
cd "$WORK_DIR"  # 或 AI 助手直接 cd 到部署目录

# 测试单个 APP（3 轮）
python3 -m src.runner -t doubao -n 3
python3 -m src.runner -t yuanbao -n 3

# 测试所有 APP
python3 -m src.runner -n 5

# 调试：获取 UI 元素树
python3 -m src.runner --inspect doubao
```

## 前置条件

运行测试前确认：

1. **模拟器运行中**（带 gRPC 端口，**不能**加 `-no-audio`）：
   ```bash
   ~/Library/Android/sdk/emulator/emulator -avd voice_benchmark -no-snapshot-load -grpc 8554
   # ⚠️ 禁止加 -no-audio，否则虚拟麦克风被禁用，APP 收不到注入的语音
   ```
2. **Appium 运行中**：`appium &`（端口 4723）
3. **APP 已登录**：豆包和元宝需要手动登录一次

## 架构概览

```
Edge TTS 语音 → gRPC 注入模拟器虚拟麦克风 → APP 语音通话
                                                ↓
                              Appium UI 文本变化检测 → TTFT 计算 → 报告
```

**核心指标**：
- **TTFT**（Time To First Token）：用户语音播放结束 → AI 首次响应。核心体验指标
- **E2E Latency**：音频注入开始 → AI 首次响应（含音频播放时间）

详细架构见 `references/architecture.md`。

## 代码结构

| 文件 | 职责 |
|------|------|
| `src/runner.py` | 主入口 + CLI（Click）。BenchmarkRunner 编排测试流程 |
| `src/config.py` | 配置管理（dataclass + YAML）|
| `src/automation/base_bot.py` | Appium 自动化基类（ABC）|
| `src/automation/doubao_bot.py` | 豆包 APP 自动化（resource-id 定位）|
| `src/automation/yuanbao_bot.py` | 元宝 APP 自动化（坐标定位，Compose UI 无 id）|
| `src/audio/virtual_mic.py` | gRPC EmulatorMicInjector（音频注入核心）|
| `src/audio/analyzer.py` | LatencyResult / LatencyStats 数据结构 |
| `src/audio/recorder.py` | ADB / 系统音频录制（备用方案）|
| `src/report/generator.py` | JSON / CSV / HTML 报告生成 |
| `configs/default.yaml` | 默认配置（设备/音频/APP 参数）|

## 关键实现细节

### 检测策略

两个 APP 统一使用 **纯文本变化检测**（`detection_method = "text_change"`）：

| APP | 主信号 | 辅信号 | 元素定位方式 |
|-----|--------|--------|-------------|
| 豆包 | 字幕区文本变化 | 状态文案（结束检测）| resource-id（完整）|
| 元宝 | 对话文本变化 | 状态文案（结束检测）| 坐标定位（Compose UI 无 id）|

### 关键 Appium 设置（必须保留）

```python
options.set_capability("waitForIdleTimeout", 0)
options.set_capability("waitForSelectorTimeout", 0)
options.set_capability("disableWindowAnimation", True)
driver.implicitly_wait(0)
```

**原因**：UiAutomator2 默认等待 UI idle 再返回 find_elements。AI 语音通话中字幕不断更新，UI 永远不 idle → find_elements 阻塞到 AI 说完。设为 0 禁止此行为。

### 豆包特殊处理

- 字幕默认关闭，需调用 `enable_subtitle()` 开启
- 字幕按钮是 **toggle**：content-desc "显示字幕"=未启用，"关闭字幕"=已启用。不能盲点
- 每轮测试新建对话：`navigate_to_voice_chat()` 内调用 `start_new_conversation()`

### 元宝特殊处理

- Compose UI 无 resource-id，按钮用坐标定位（`YuanbaoCoords` 类）
- 系统文案需过滤（`YUANBAO_SYSTEM_TEXTS` 集合）
- 全双工模式下状态文案可能一直停在 "Listening..."，不能依赖状态文案判断 AI 开始回复

### 音频要求

- 必须用 **Edge TTS** 生成（macOS `say` 质量不够，APP 无法识别）
- 采样率 **48kHz**，PCM WAV 格式
- 当前使用 "您好"（简单问候，避免触发"思考音效"）
- 生成命令：`edge-tts --voice zh-CN-YunxiNeural --text "您好" --write-media hello.mp3 && ffmpeg -i hello.mp3 -ar 48000 -ac 1 hello_48k.wav`

## 常见操作

### 修改测试参数

编辑 `configs/default.yaml`：
- `benchmark.num_rounds`: 测试轮次
- `benchmark.round_interval`: 轮间等待（秒）
- `apps.*.response_timeout`: AI 回复超时

或使用 CLI 参数覆盖：`-n 10`（轮次）、`-t doubao`（目标）

### 添加新 APP

1. 在 `src/automation/` 创建 `new_app_bot.py`，继承 `BaseBot`
2. 实现 `navigate_to_voice_chat()`, `start_voice_call()`, `end_voice_call()`, `detect_ai_response_state()`, `snapshot_baseline_texts()`
3. 在 `runner.py` 的 `_get_bot()` 中注册
4. 在 `configs/default.yaml` 的 `apps` 中添加配置

### 生成测试音频

```bash
pip install edge-tts
edge-tts --voice zh-CN-YunxiNeural --text "你想说的话" --write-media output.mp3
ffmpeg -i output.mp3 -ar 48000 -ac 1 -acodec pcm_s16le output_48k.wav
```

### 调试 UI 元素

```bash
# 获取 UI 元素树（保存为 XML）
python3 -m src.runner --inspect doubao
python3 -m src.runner --inspect yuanbao

# 文本检测调试（带音频注入）
python3 scripts/test_text_detection.py doubao --inject
python3 scripts/test_text_detection.py yuanbao --inject
```

## 稳定性优化（APP 卡顿 / TTFT 异常值处理）

多轮测试中可能出现个别轮次 TTFT 异常偏高（如 >8s 甚至 >40s）。这通常不是网络问题，而是测试管线与 APP 状态不同步导致的。

### 根因分析

| 原因 | 严重度 | 表现 |
|------|--------|------|
| **APP 冷启动后音频管道未就绪** | 🔴 高 | `reset_app()` 后 APP UI 加载了但 WebSocket/WebRTC 通道未建立，注入的音频被丢弃 |
| **AI 主动问候干扰** | 🟡 中 | 新建对话进入通话后 AI 先说话，此时注入音频会被 APP 的 VAD 当噪音过滤 |
| **gRPC 注入时机与 APP 麦克风竞争** | 🟡 中 | 注入时 APP 还没打开麦克风，音频被模拟器缓冲或丢弃 |
| **UiAutomator2 冷启动 JIT 开销** | 🟠 低 | force-stop 后首次 `find_elements` 较慢（+几百 ms） |

### 已实现的优化措施

#### 1. AI 主动问候等待（`_wait_for_ai_greeting_done()`）
- **位置**：`runner.py`，音频注入前
- **逻辑**：监测状态文案，如果检测到 AI 在说话（"打断"/"对方"/"思考"），等待直到状态回到"正在听"/"你可以开始说话"
- **最大等待**：12 秒，超时则继续注入
- **效果**：避免音频与 AI 问候重叠被 VAD 丢弃

#### 2. Appium 多轮预热（3 次）
- **位置**：`runner.py`，音频注入前
- **逻辑**：从 1 次预热改为 3 次 `detect_ai_response_state()` 调用，消除 UiAutomator2 JIT/初始化开销
- **效果**：首次轮询延迟从 ~500ms 降到 ~200ms

#### 3. TTFT 异常值检测 + 自动重试（`_is_ttft_outlier()`）
- **位置**：`runner.py`，`run()` 主循环
- **阈值**：TTFT > 8000ms 判定为异常
- **逻辑**：异常轮次标记 `is_valid=False`，reset_app 后自动重试 1 次
- **效果**：即使偶发卡顿也能得到有效数据

#### 4. 冷启动 UI 就绪验证
- **位置**：`base_bot.py`，`reset_app()`
- **逻辑**：`force-stop + activate_app` 后，除了基础 sleep，额外用 `page_source` 轮询验证 UiAutomator2 真正就绪（最多 10s）
- **效果**：确保后续 Appium 操作不会因 UI framework 未初始化而失败

### 优化效果对比

| 指标 | 优化前 | 优化后 |
|------|--------|--------|
| 5 轮成功率 | 60%（3/5 正常） | **100%** |
| 平均 TTFT | 11999ms（含异常） | **1141ms** |
| TTFT 范围 | 877 ~ 48688ms | 811 ~ 1557ms |
| 标准差 | ~18522ms | ~281ms |

## 已知坑

1. **gRPC 认证**：模拟器必须用 `-grpc 8554` 启动禁用 JWT，否则 injectAudio 会鉴权失败
2. **禁止 `-no-audio`**：启动模拟器时**绝对不能**加 `-no-audio` 参数。该参数会同时禁用音频输入和输出，导致 gRPC 注入的音频虽然发送成功，但虚拟麦克风被禁用，APP 完全收不到语音，表现为永远卡在 "Listening..."
3. **通话音频路由（听不到 AI 回复声音）**：语音通话 APP 默认走 `STREAM_VOICE_CALL` → 听筒(earpiece)。模拟器的听筒音频不会路由到宿主机，导致在 Mac 上听不到声音。解决方案：`adb shell content insert --uri content://settings/system --bind name:s:speakerphone_on --bind value:s:1`（已集成到 `base_bot.py` 的 `_setup_audio_routing()` 自动执行）
4. **waitForIdle 阻塞**：不设 `waitForIdleTimeout=0` 会导致 TTFT 虚高（测到 16-18s 而非 1-2s）
5. **元宝 Session 崩溃**：连续多轮测试时元宝偶尔 Appium Session 断开。`reset_app()` + 异常恢复可缓解
6. **字幕 Toggle 反转**：豆包字幕按钮盲点可能关闭字幕。必须先检测 content-desc 再决定是否点击
7. **Edge TTS 必需**：macOS say 生成的语音 APP 识别不了，必须用 edge-tts
8. **APP 冷启动卡顿**：`reset_app()` 后 APP 表面加载了但语音通话通道未建立。必须有 UI 就绪验证 + AI 问候等待，不能纯 sleep
9. **AI 主动问候干扰注入**：豆包新建对话后常主动打招呼，此时注入音频会被 VAD 丢弃。必须等 AI 问候结束后再注入
10. **模拟器长时间运行音频管道失效**：模拟器连续运行 48+ 小时后，gRPC 音频注入虽然显示成功，但 APP 无法识别语音。需要重启模拟器恢复
