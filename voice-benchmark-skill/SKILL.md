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
├── run_loop.sh               # ⭐ 外壳循环模式（推荐，进程级隔离恢复）
├── run_benchmark.sh          # 一键运行脚本（单进程模式）
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
# 创建 AVD（Android 14, API 34, Pixel 6, arm64）
~/Library/Android/sdk/cmdline-tools/latest/bin/avdmanager create avd \
  -n Pixel_6_API_34 -k "system-images;android-34;google_apis;arm64-v8a" \
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

# 测试所有 APP（5 轮）
python3 -m src.runner -n 5

# 调试：获取 UI 元素树
python3 -m src.runner --inspect doubao
```

### ⚡ 默认测试行为约定

当用户说 **"开始测试 N 次"** 或 **"开始 N 轮测试"** 或 **"开始测试"**（无其他参数），**必须使用 `run_loop.sh` 外壳循环模式**：

```bash
cd scripts/
nohup ./run_loop.sh <N> 5 2 > results/loop_<N>x2_$(date +%Y%m%d_%H%M%S).log 2>&1 &
```

- **N 默认 1000**（用户只说"开始测试"时）
- 每批次 5 轮，每轮元宝×2 + 豆包×2，总测试数 = N × 4
- 批次之间自动清理进程 + 重启 coreaudiod + 冷却 30s

例如：
- "开始测试" → `./run_loop.sh 1000 5 2`（共 4000 次）
- "开始测试 1000 次" → `./run_loop.sh 1000 5 2`（共 4000 次）
- "开始测试 100 次" → `./run_loop.sh 100 5 2`（共 400 次）

**⚠️ 禁止直接用 `python3 -m src.runner -n 1000`**：单进程模式无法做到进程级隔离恢复，QEMU 崩溃后 gRPC/adb 状态混乱会导致后续测试全部失败。必须用 `run_loop.sh` 外壳循环。

## 前置条件

运行测试前确认：

1. **模拟器运行中**（带 gRPC 端口，**不能**加 `-no-audio`）：
   ```bash
   ~/Library/Android/sdk/emulator/emulator -avd Pixel_6_API_34 -grpc 8554 -gpu host -no-snapshot-load
   # ⚠️ 必须加 -gpu host：使用宿主机 GPU 硬件加速（Apple Silicon Metal / NVIDIA 等），
   #    避免 lavapipe 纯 CPU 软件 Vulkan 渲染导致长时间运行后图形子系统 hang 崩溃
   # ⚠️ 必须加 -no-snapshot-load，否则音频 HAL 可能从快照恢复时 I/O error（宿主机听不到声音）
   # ⚠️ 禁止加 -no-audio，否则虚拟麦克风被禁用，APP 收不到注入的语音
   # ⚠️ 固化版本: Android 14 (API 34), Emulator 36.6.2, arm64-v8a, 1080x2400
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

### 可靠性配置参数（`BenchmarkRunner` 类常量）

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `AUDIO_PIPE_QUICK_FAIL_SECS` | 15s | 注入音频后 N 秒无任何响应 → 快速判定音频管道失效 |
| `AUDIO_PIPE_RECONNECT_EVERY` | 20 | 每 N 轮预防性重建 gRPC channel（防止长连接老化） |
| `AUDIO_PIPE_MAX_CONSEC_FAIL` | 2 | 连续 N 轮音频管道失败 → 触发全局重置 |
| `SESSION_MAX_RECONNECT` | 3 | Appium session 崩溃时轻量重建的最大尝试次数 |
| `COOLDOWN_AFTER_CRASH_SECS` | 30s | 模拟器崩溃后启动新实例前的冷却等待（让 coreaudiod 完全恢复） |
| `FULL_RESET_MAX_ATTEMPTS` | 3 | 全局完整环境重置的最大尝试次数 |

## 代码结构

| 文件 | 职责 |
|------|------|
| `run_loop.sh` | ⭐ 外壳循环模式入口。进程级隔离恢复：小批次运行→崩溃→清理→coreaudiod→冷却→新进程 |
| `src/runner.py` | 主入口 + CLI（Click）。BenchmarkRunner 编排测试流程。含崩溃恢复（v3: 失败 exit）、全局重置、coreaudiod 重启、adb 两阶段验证 |
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

#### 5. GPU 硬件加速（`-gpu host`）
- **位置**：`runner.py`，`_launch_new_emulator()` 启动参数
- **问题**：模拟器默认可能使用 `lavapipe`（纯 CPU 软件 Vulkan 渲染），在长时间运行图形密集场景时 CPU 过载，导致图形子系统 **hang（卡死）** → watchdog 检测后杀进程 → 崩溃
- **修复**：启动参数增加 `-gpu host`，AVD 配置文件 `hw.gpu.mode = host`
- **效果**：
  - Apple M4 Pro 启动时间：数分钟(lavapipe) → **9.7 秒**(host Metal)
  - 渲染从 CPU 模拟切换到 Metal 硬件加速，长时间运行稳定
  - crash dump 中的 `hanged` 标记不再出现
- **⚠️ 注意**：切勿改回 `lavapipe` 或 `auto`。AVD 的 `config.ini` 和 `hardware-qemu.ini` 中 `hw.gpu.mode` 必须保持 `host`

#### 6. 模拟器崩溃自动恢复（清理 5 步骤）
- **位置**：`runner.py`，`_kill_stale_emulator_processes()`
- **问题**：模拟器崩溃后常留下多种残留，阻止新实例正常启动
- **清理流程**：
  1. 杀残留 `qemu-system` 进程（SIGKILL）
  2. 杀残留 `crashpad_handler` 进程
  3. 关闭 macOS 崩溃报告对话框（osascript + pkill CrashReporterSupport）
  4. 删除 AVD 锁文件（`~/.android/avd/*.avd/*.lock`）
  5. 清理残留 crash 数据（`/tmp/android-$USER/emu-crash-*`）— 防止 crashpad 数据导致新进程崩溃
  6. 重启 adb server（清除旧设备连接缓存）
- **效果**：崩溃后自动清理 + 冷启动恢复，无需人工干预

#### 7. coreaudiod 重启 — 音频子系统恢复（`_restart_coreaudiod()`）
- **位置**：`runner.py`，`_restart_coreaudiod()`，在 `_kill_stale_emulator_processes()` 中首先调用
- **问题**：模拟器 `audio_forwarder_enable` 空指针崩溃（`EXC_BAD_ACCESS at 0x58`），根因是宿主机 BlackHole 虚拟音频设备状态损坏。崩溃后重启模拟器会在 16~20 秒内再次崩溃
- **修复**：崩溃恢复时自动 `sudo killall coreaudiod`，launchd 会自动重启 coreaudiod，等 5 秒让音频设备重新初始化
- **权限**：需要 sudo NOPASSWD 配置：
  ```bash
  echo "$USER ALL=(root) NOPASSWD: /usr/bin/killall coreaudiod" | sudo tee /etc/sudoers.d/coreaudiod-restart && sudo chmod 0440 /etc/sudoers.d/coreaudiod-restart
  ```
  如无 sudo 权限，自动降级尝试 `launchctl kickstart -k system/com.apple.audio.coreaudiod`
- **效果**：解决"崩溃后新模拟器也秒崩"的问题

#### 8. 全局完整环境重置 — v3 进程退出策略（`_full_environment_reset()`）
- **位置**：`runner.py`，`_full_environment_reset()`
- **v3 核心设计**：**不在进程内反复挣扎恢复**。任何步骤失败 → `sys.exit(1)` → 外壳循环 `run_loop.sh` 接管（杀进程→coreaudiod→冷却→全新 Python 进程）
- **触发条件**：
  - Appium session 轻量恢复失败
  - 音频管道连续失败 ≥ `AUDIO_PIPE_MAX_CONSEC_FAIL` 次
  - Bot driver 为 None 且主动连接失败
- **执行流程（7 步，任一失败直接 exit）**：
  1. 断开所有 Bot
  2. 杀掉模拟器 + 清理残留（含 coreaudiod 重启）
  3. 冷却等待 30 秒（`COOLDOWN_AFTER_CRASH_SECS`）
  4. preflight 重新拉起模拟器 + Appium
  4.5. `_wait_for_adb_device()` 两阶段验证 adb 设备就绪
  5. 重建 gRPC 连接
  5.5. gRPC 重连后再次验证 adb（gRPC 长重连可能导致 adb 状态漂移）
  6. 重连所有 Bot（只试一次，失败就 exit）
- **设计依据**：之前 21h/214批/49次崩溃全自动恢复的实证——进程级隔离是最可靠的恢复策略
- **效果**：配合 `run_loop.sh`，模拟器崩溃后自动全链路重置，无人值守长时间运行

#### 9. "永不放弃"策略
- **位置**：`runner.py`，`_run_target_round()`
- **问题**：v1 版 runner 在 session 恢复 3 次失败后标记 `skip_targets`，导致后续所有轮次空跑（如 100 轮只有效跑了 8 轮）
- **修复**：
  - 移除 `skip_targets` / `raise` 放弃逻辑
  - 轻量恢复失败 → 全局完整重置 → 重试
  - 全局重置也失败 → 记录 `FULL_RESET_FAILED` 但继续下一轮
  - `MAX_RETRIES_EXHAUSTED` → 记录空结果但继续下一轮
- **效果**：永远不放弃任何 target，最大化有效数据产出

#### 10. 外壳循环模式 `run_loop.sh`（⭐ 生产推荐）
- **位置**：`scripts/run_loop.sh`
- **问题**：单进程 `-n 1000` 运行时，QEMU 崩溃后 gRPC/adb 状态在进程内无法可靠恢复。v2 尝试在进程内做 `_full_environment_reset()` 反复重试，但 gRPC 长重连会导致 adb 状态漂移（device offline），Appium 创建 session 失败
- **解决方案**：复刻之前跑 21h/214批/49次崩溃全自动恢复的 bash 外壳策略：
  ```bash
  ./run_loop.sh 1000 5 2    # 总共 1000 轮，每批 5 轮，每轮每 target 2 次
  ```
- **工作原理**：
  1. 按批次运行 Python runner（小批次，默认 5 轮/批）
  2. 每批次结束/崩溃后：`kill_all()`（杀 qemu/appium/adb + 关闭崩溃弹窗 + 清理锁文件）
  3. `restart_coreaudiod()`（重启音频守护进程）
  4. 冷却 30 秒
  5. 启动全新 Python 进程（进程级隔离，零僵死状态）
- **runner.py 配合**：`_full_environment_reset()` 任何步骤失败 → `sys.exit(1)` → 外壳接管
- **效果**：进程级隔离 = 最可靠的恢复策略。Python 内存泄漏、僵死线程、未捕获异常均被新进程自然解决

#### 11. adb 设备两阶段就绪验证（`_wait_for_adb_device()`）
- **位置**：`runner.py`，`_wait_for_adb_device()`
- **问题**：模拟器 `sys.boot_completed=1` ≠ adb 设备完全就绪。`adb shell` 可能返回 `device offline`，导致 Appium 创建 session 失败
- **修复**：两阶段验证 + 稳定等待：
  1. **阶段 1**：`adb devices` 列出 `emulator-5554\tdevice`（不是 `offline`）
  2. **阶段 2**：`adb shell echo ready` 实际返回成功（无 offline 错误）
  3. **稳定等待**：额外 8 秒，等待 settings provider 等系统服务完全初始化
- **调用位置**：`_full_environment_reset()` 步骤 4.5 和 5.5、`preflight_check()` 模拟器启动后
- **效果**：消除崩溃恢复后 "Could not find a connected Android device" 问题

### 优化效果对比

| 指标 | 优化前 | v1 稳定性 | v2 崩溃恢复 | v3 外壳循环（⭐当前） |
|------|--------|-----------|-------------|---------------------|
| 5 轮成功率 | 60% | **100%** | **100%** | **100%** |
| 平均 TTFT | 11999ms | **1141ms** | **~1500ms** | **~1500ms** |
| TTFT 范围 | 877~48688ms | 811~1557ms | 904~2420ms | 904~2420ms |
| 崩溃恢复 | ❌ 无 | ⚠️ session 重建 | ✅ 全链路（进程内） | ✅ **进程级隔离**（最可靠） |
| 连续运行 | 10 轮崩溃 | ~30 分钟 | **理论无限**（进程内恢复不稳定） | **实证 21h+**（214批/49次崩溃恢复） |
| 数据有效率 | <30% | ~95% | >95%（恢复不稳定时降低） | **>95%**（进程级隔离保证） |
| 运行方式 | 手动 | `python -n N` | `python -n N` | `run_loop.sh N 5 2` |

## 已知坑

1. **gRPC 认证**：模拟器必须用 `-grpc 8554` 启动禁用 JWT，否则 injectAudio 会鉴权失败
2. **禁止 `-no-audio`**：启动模拟器时**绝对不能**加 `-no-audio` 参数。该参数会同时禁用音频输入和输出，导致 gRPC 注入的音频虽然发送成功，但虚拟麦克风被禁用，APP 完全收不到语音，表现为永远卡在 "Listening..."
3. **⚠️ Mac 无麦克风致模拟器崩溃（最隐蔽的坑）**：Mac mini / Mac Studio 等**没有内置麦克风**的机型上，调用 gRPC `injectAudio()` 会导致**模拟器直接 crash**。根因是模拟器虚拟麦克风 ADC 初始化时需要宿主机有音频输入设备，否则失败。日志特征：`Could not initialize record - Unknown Audiodevice` + `Failed to create voice 'adc'`。**解决方案**：安装 [BlackHole 2ch](https://github.com/ExistentialAudio/BlackHole) 虚拟音频驱动，让 macOS 系统有一个虚拟音频输入设备：
   ```bash
   brew install blackhole-2ch
   # 安装后必须重启 Core Audio 服务
   sudo killall -9 coreaudiod
   # coreaudiod 会自动重启，等 2-3 秒即可
   # 验证：系统偏好设置 → 声音 → 输入，应能看到 "BlackHole 2ch"
   ```
   **注意**：不需要在「音频 MIDI 设置」中做任何聚合设备配置，只要 BlackHole 2ch 驱动安装即可。`setup_mac.sh` 已包含此步骤的自动安装。
4. **⚠️ GPU 必须用 host 模式（lavapipe 会崩溃）**：模拟器默认或配置为 `lavapipe`（纯 CPU 软件 Vulkan 渲染）时，在长时间运行图形密集的语音通话 APP 场景下，CPU 严重过载 → 图形子系统 hang 卡死 → 模拟器 crash。crash dump 特征：`hanged, 0x1, 0x1`。**解决方案**：
   - 启动命令加 `-gpu host`（使用宿主机 GPU 硬件加速，Apple Silicon 走 Metal）
   - AVD 配置文件 `~/.android/avd/Pixel_6_API_34.avd/config.ini` 和 `hardware-qemu.ini` 中设置 `hw.gpu.mode = host`
   - **切勿**改回 `lavapipe` 或 `auto`
   - 效果：启动时间从数分钟降到 ~10 秒，长时间运行稳定不崩溃
   - 验证启动日志：应看到 `Selecting Vulkan device: Apple M4 Pro` + `Graphics API Version OpenGL ES 3.0 (4.1 Metal)`
5. **⚠️ 模拟器崩溃后残留清理（5 项必须全做）**：模拟器 crash 后启动新实例前，必须清理：
   - `qemu-system` 僵尸进程（`pkill -9 -f qemu-system`）
   - `crashpad_handler` 残留进程（`pkill -f crashpad_handler`）
   - AVD 锁文件（`rm -f ~/.android/avd/*.avd/*.lock`）— 否则报 `Running multiple emulators with the same AVD` FATAL
   - Crash 数据目录（`rm -rf /tmp/android-$USER/emu-crash-*`）— 否则 crashpad 残留数据可能导致新进程崩溃
   - 重启 adb server（`adb kill-server && adb start-server`）— 清除旧设备缓存
   - 代码已集成到 `runner.py` 的 `_kill_stale_emulator_processes()` 自动执行
6. **通话音频路由（听不到 AI 回复声音）**：语音通话 APP 默认走 `STREAM_VOICE_CALL` → 听筒(earpiece)。模拟器的听筒音频不会路由到宿主机，导致在 Mac 上听不到声音。解决方案：`adb shell content insert --uri content://settings/system --bind name:s:speakerphone_on --bind value:s:1`（已集成到 `base_bot.py` 的 `_setup_audio_routing()` 自动执行）
7. **waitForIdle 阻塞**：不设 `waitForIdleTimeout=0` 会导致 TTFT 虚高（测到 16-18s 而非 1-2s）
8. **元宝 Session 崩溃**：连续多轮测试时元宝偶尔 Appium Session 断开。`reset_app()` + 异常恢复可缓解
9. **字幕 Toggle 反转**：豆包字幕按钮盲点可能关闭字幕。必须先检测 content-desc 再决定是否点击
10. **Edge TTS 必需**：macOS say 生成的语音 APP 识别不了，必须用 edge-tts
11. **APP 冷启动卡顿**：`reset_app()` 后 APP 表面加载了但语音通话通道未建立。必须有 UI 就绪验证 + AI 问候等待，不能纯 sleep
12. **AI 主动问候干扰注入**：豆包新建对话后常主动打招呼，此时注入音频会被 VAD 丢弃。必须等 AI 问候结束后再注入
13. **模拟器长时间运行音频管道失效**：模拟器连续运行 48+ 小时后，gRPC 音频注入虽然显示成功，但 APP 无法识别语音。需要重启模拟器恢复
14. **⚠️ 音频 HAL pcm_writei I/O error（宿主机听不到声音）**：模拟器从快照恢复或启动时宿主机音频设备状态异常，会导致音频 HAL `android.hardware.audio@7.1-impl.ranchu` 持续报 `pcm_writei failed with 'I/O error'`，表现为 gRPC `streamAudio` 返回 0 字节、宿主机完全听不到模拟器声音。**解决方案**：必须用 `-no-snapshot-load` 冷启动模拟器确保音频 HAL 干净初始化：
   ```bash
   # 1. 关闭当前模拟器
   adb emu kill
   # 2. 等待完全关闭
   sleep 5
   # 3. 冷启动（关键：-gpu host -no-snapshot-load）
   ~/Library/Android/sdk/emulator/emulator -avd Pixel_6_API_34 -grpc 8554 -gpu host -no-snapshot-load
   ```
   **诊断方法**：`adb shell "logcat -d | grep pcm_writei"` 如果有 I/O error 就说明需要冷启动
15. **⚠️ audio_forwarder 空指针崩溃（模拟器运行 ~30 分钟后）**：模拟器 `audio_forwarder_enable()` 在处理 gRPC `injectAudio` 时解引用 NULL 指针（`EXC_BAD_ACCESS at address 0x58`），崩溃堆栈：`injectAudio → QemuAudioInputEngine::start → audio_forwarder_enable → 💥`。这是 Android Emulator 内部 bug，与 BlackHole 虚拟音频驱动长时间运行后状态损坏有关。**崩溃后重启模拟器也会在 16~20 秒内再次崩溃**（因为 coreaudiod 中的音频设备状态已损坏）。**解决方案**：runner.py 的 `_full_environment_reset()` 自动处理——重启 coreaudiod → 30s 冷却 → 全新启动模拟器
16. **⚠️ 崩溃恢复需要 sudo NOPASSWD**：`_restart_coreaudiod()` 需要 `sudo killall coreaudiod`。首次部署时必须配置：
   ```bash
   echo "$USER ALL=(root) NOPASSWD: /usr/bin/killall coreaudiod" | sudo tee /etc/sudoers.d/coreaudiod-restart && sudo chmod 0440 /etc/sudoers.d/coreaudiod-restart
   ```
   如未配置，降级尝试 `launchctl kickstart` 但可能权限不足
17. **⚠️ 禁止单进程长时间运行，必须用外壳循环**：`python3 -m src.runner -n 1000` 单进程运行时，QEMU 崩溃后进程内 `_full_environment_reset()` 尝试恢复，但 gRPC 长重连会导致 adb 状态漂移（device offline），后续所有 Appium session 创建失败。**唯一可靠方案是 `run_loop.sh` 外壳循环**——进程级隔离天然解决所有僵死状态问题。实证：21h/214批/49次崩溃全自动恢复。runner.py 内的 `_full_environment_reset()` 作为第一道防线，失败时 `sys.exit(1)` 交给外壳接管
18. **⚠️ adb boot_completed ≠ 设备就绪**：模拟器 `sys.boot_completed=1` 后 `adb shell` 仍可能返回 `device offline`。必须用 `_wait_for_adb_device()` 做两阶段验证（`adb devices` 列出 device + `adb shell echo ready` 成功）+ 8s 稳定等待
19. **⚠️ 模拟器磁盘空间不足**：长时间运行后模拟器 `/data` 分区可能满（95%+），导致 Appium UiAutomator2 APK 安装失败（`not enough space`）。外壳循环每批次重启模拟器时用 `-no-snapshot-load` 冷启动可缓解。极端情况需手动 `adb shell pm clear` 清理缓存
