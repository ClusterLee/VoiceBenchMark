# VoiceBenchMark — 项目文档 & 注意事项

> 最后更新: 2026-04-02 | 维护人: Money (AI 合伙人)
> GitHub: https://github.com/ClusterLee/VoiceBenchMark

---

## 一、项目概述

**AI 语音助手响应延迟自动化评测工具**。通过 Android 模拟器 + Appium + gRPC 音频注入，精确测量 AI 语音通话的首次响应时间（TTFT）。

| 维度 | 说明 |
|------|------|
| **目标 APP** | 豆包（字节跳动）、腾讯元宝 |
| **核心指标** | TTFT（首次响应时间）、E2E Latency（端到端延迟）|
| **测试方法** | Edge TTS 生成音频 → gRPC 注入虚拟麦克风 → APP 语音通话 → Appium 文本变化检测 → 延迟计算 |
| **优化成果** | TTFT: 12s → 1.1s，成功率: 60% → 100% |
| **当前测试数据** | 豆包 TTFT ~840ms, 元宝 TTFT ~1550ms（豆包快约 84%）|

---

## 二、项目结构

```
~/Downloads/VocieBenchMark/
├── .gitignore                           # Git 排除规则
├── REVIEW.md                            # 可迁移性审查报告
├── PROJECT_DOCS.md                      # ← 本文档
│
├── voice-benchmark-skill/               # 📱 测试端（Python）
│   ├── SKILL.md                         # Skill 主文档（298行，最核心）
│   ├── .gitignore                       # 排除测试结果文件
│   ├── sync_to_system.sh               # 本地 → 系统 skill 同步
│   ├── sync_from_system.sh             # 系统 → 本地 skill 同步
│   ├── references/
│   │   └── architecture.md             # 架构参考（分层/流程/类继承）
│   └── scripts/
│       ├── README.md                    # 快速开始指南
│       ├── run_benchmark.sh            # 一键运行脚本
│       ├── generate_audio.py           # Edge TTS 音频生成
│       ├── requirements.txt            # Python 依赖（17 个包）
│       ├── configs/default.yaml        # 默认配置
│       ├── src/                        # ← 核心源码
│       │   ├── runner.py               # 主入口 + CLI（39.6KB，最大文件）
│       │   ├── config.py               # 配置管理（dataclass + YAML）
│       │   ├── audio/
│       │   │   ├── virtual_mic.py      # gRPC 音频注入（核心）
│       │   │   ├── analyzer.py         # 音频分析 / LatencyResult 数据结构
│       │   │   └── recorder.py         # ADB 音频录制（备用方案）
│       │   ├── automation/
│       │   │   ├── base_bot.py         # Appium 自动化基类（ABC）
│       │   │   ├── doubao_bot.py       # 豆包 APP 自动化
│       │   │   └── yuanbao_bot.py      # 元宝 APP 自动化
│       │   ├── proto/                  # gRPC 生成代码（仅编译产物，无源 .proto）
│       │   └── report/
│       │       ├── generator.py        # JSON/CSV/HTML 报告生成
│       │       └── uploader.py         # 云端上报模块
│       ├── assets/audio/               # 测试音频（Edge TTS 48kHz）
│       ├── docker/                     # Docker 部署文件
│       ├── docs/ARCHITECTURE.md        # 详细技术架构文档
│       ├── project_scripts/            # 调试脚本（e2e_test, test_pipeline 等）
│       └── results/                    # 测试结果输出（不提交 Git）
│
└── voice-benchmark-cloud/               # ☁️ 云端 API（Cloudflare Worker）
    ├── wrangler.toml                    # Workers 配置
    ├── package.json                     # Node.js 依赖
    ├── schema.sql                       # D1 数据库初始 Schema
    ├── migration_v2.sql                 # 迁移：支持单轮实时上报
    ├── migration_v3.sql                 # 迁移：去掉外键约束
    ├── tsconfig.json
    └── src/
        └── index.ts                    # Worker 主入口（31.3KB，含 Dashboard HTML）
```

---

## 三、技术架构

### 3.1 测试端架构（voice-benchmark-skill）

```
┌──────────────── CLI / Runner 层 ──────────────────┐
│  runner.py (BenchmarkRunner)                       │
│  Click CLI: -t <target> -n <rounds> --inspect      │
├────────────────────────────────────────────────────┤
│              Automation 层                          │
│  BaseBot (ABC) → DoubaoBot / YuanbaoBot            │
│  Appium + UiAutomator2 控制 Android APP            │
├────────────────────────────────────────────────────┤
│              Audio 层                               │
│  EmulatorMicInjector (gRPC) → 虚拟麦克风注入       │
│  AudioAnalyzer: WebRTC VAD / 能量检测              │
├────────────────────────────────────────────────────┤
│              Report 层                              │
│  ReportGenerator: JSON/CSV/HTML                    │
│  CloudUploader: 每轮实时上报到 Cloudflare D1       │
├────────────────────────────────────────────────────┤
│              Config 层                              │
│  dataclass + YAML，零硬编码                        │
└────────────────────────────────────────────────────┘
         │ gRPC (8554)          │ Appium (4723)
         ▼                      ▼
┌────────────────────────────────────────────────────┐
│          Android 模拟器 (emulator-5554)            │
│  豆包 APP          元宝 APP                        │
│  虚拟麦克风 ← gRPC injectAudio()                  │
└────────────────────────────────────────────────────┘
```

### 3.2 云端架构（voice-benchmark-cloud）

```
测试脚本 (Python)
    │ POST /api/round（每轮实时上报）
    ▼
Cloudflare Workers (voice-benchmark-api)
    │
    ▼
D1 数据库 (SQLite)
    ├── test_sessions（会话级统计）
    └── test_rounds（轮次明细）
    │
    ▼
内嵌 Dashboard (GET /)
    ├── KPI 卡片（按产品分组）
    ├── 趋势图（支持多种聚合粒度）
    └── 轮次明细表
```

### 3.3 单轮测试流程

```
1. bot.navigate_to_voice_chat()     → 导航到语音通话界面
2. bot.start_voice_call()           → 开始通话
3. _wait_for_ai_greeting_done()     → 等 AI 主动问候结束（≤12s）
4. Appium 预热 ×3                    → 消除 UiAutomator2 JIT 开销
5. bot.snapshot_baseline_texts()    → 拍文本 baseline
6. injector.inject_wav()            → gRPC 注入音频（记录 T0）
7. 高频轮询（~200ms）               → 检测文本变化
   ├── ai_responding → 记录 TTFT = ai_start - audio_end
   └── ai_finished → break
8. TTFT 异常值检测                   → >8s 自动重试 1 次
9. bot.take_screenshot()            → 截图留证
10. bot.end_voice_call()            → 挂断
11. cloud_uploader.upload_round()   → 实时上报
12. bot.reset_app()                 → 多轮间冷启动恢复
```

---

## 四、环境配置

### 4.1 运行环境要求

| 组件 | 版本 | 说明 |
|------|------|------|
| Python | 3.10+ | 主运行环境 |
| Android Emulator | **36.6.2** (build 15098414) | QEMU 模拟器 |
| AVD | **Pixel_6_API_34** | Android **14** (API **34**), google_apis, **arm64-v8a** |
| 系统镜像 | sdk_gphone64_arm64 | build `UE1A.230829.036.A4`, 分辨率 1080×2400 |
| Appium | 3.2.2 | 端口 4723 |
| UiAutomator2 | 7.1.0 | Appium 驱动 |
| gRPC | 8554 | 模拟器音频注入端口 |
| Node.js | 18+ | 云端项目开发（Wrangler）|
| BlackHole 2ch | — | Mac mini 虚拟音频驱动（gRPC injectAudio 依赖）|

### 4.2 APP 信息

| APP | 包名 | 定位方式 |
|-----|------|---------|
| 豆包 | `com.larus.nova` | resource-id（完整）|
| 元宝 | `com.tencent.hunyuan.app.chat` | 坐标定位（Compose UI 无 id）|

### 4.3 关键命令

```bash
# 启动模拟器（⚠️ 不能加 -no-audio，必须加 -gpu host 和 -no-snapshot-load）
~/Library/Android/sdk/emulator/emulator -avd Pixel_6_API_34 -grpc 8554 -gpu host -no-snapshot-load

# 启动 Appium
appium &

# 运行测试
cd ~/Downloads/VocieBenchMark/voice-benchmark-skill/scripts
python3 -m src.runner -t doubao -n 3     # 豆包 3 轮
python3 -m src.runner -t yuanbao -n 3    # 元宝 3 轮
python3 -m src.runner -n 5               # 全部 APP 5 轮

# UI 元素调试
python3 -m src.runner --inspect doubao

# 同步到系统 skill
cd ~/Downloads/VocieBenchMark/voice-benchmark-skill
./sync_to_system.sh                       # 实际同步
./sync_to_system.sh --dry-run             # 仅预览

# 云端部署
cd ~/Downloads/VocieBenchMark/voice-benchmark-cloud
npm run deploy
```

---

## 五、云端服务

| 项目 | 值 |
|------|---|
| **Dashboard（主用）** | https://voice-bench.cyberworld.app |
| Workers 原始域名 | https://voice-benchmark-api.clusterlee.workers.dev（内网不可用）|
| D1 数据库 | `voice-benchmark`（ID: `1cb987f7-...`，APAC 区域）|
| 上报覆盖 | 环境变量 `VOICE_BENCHMARK_API_URL` |

### API 路由

| 方法 | 路径 | 说明 |
|------|------|------|
| `GET /` | Dashboard | 内嵌 HTML 页面 |
| `POST /api/round` | 单轮上报 | 每轮测试实时上报 |
| `POST /api/report` | 批量上报 | 会话级上报（已弃用）|
| `GET /api/sessions` | 会话列表 | 按 target 筛选 |
| `GET /api/rounds` | 轮次明细 | 支持时间范围 |
| `GET /api/stats` | 聚合统计 | 支持 `interval=1m/5m/15m/1h/1d` |

### Dashboard 功能

- KPI 卡片按产品分组（豆包/元宝各自的 TTFT、E2E、成功率）
- 趋势图支持多种聚合粒度（逐轮/1分钟/5分钟/15分钟/1小时/按天）
- 轮次明细表（含失败原因）
- 节点信息显示（`node_id (node_region)`）

---

## 六、开发工作流

```
┌──────────────────────────────────────────────────────┐
│  本地开发目录                                         │
│  ~/Downloads/VocieBenchMark/voice-benchmark-skill/    │
│                    │                                  │
│         sync_to_system.sh ↓↑ sync_from_system.sh     │
│                    │                                  │
│  系统 Skill 目录                                      │
│  ~/.workbuddy/skills/voice-benchmark/voice-benchmark/ │
│                    │                                  │
│              AI 助手自动调用                           │
└──────────────────────────────────────────────────────┘
```

1. 在本地目录开发调试
2. 测试通过 → `./sync_to_system.sh` 推送到系统
3. 系统有更新 → `./sync_from_system.sh` 拉回本地
4. `git push origin main` 推送到 GitHub

### 节点配置

- `node_id`: yaml 配置 `"auto"` 自动生成 `{os}-{hostname}`（如 `mac-clusterli-mc3`）
- `node_region`: 需手动配置（如 `cn-shenzhen`）

---

## 七、⚠️ 注意事项 & 已知坑（共 14 条）

### 🔴 致命级（必须遵守）

| # | 坑 | 后果 | 解决 |
|---|---|---|---|
| 1 | **模拟器禁止 `-no-audio`** | 虚拟麦克风被禁用，APP 完全收不到语音，永远卡在 "Listening..." | 启动参数只能用 `-avd Pixel_6_API_34 -grpc 8554 -gpu host -no-snapshot-load` |
| 2 | **gRPC 必须 `-grpc 8554`** | injectAudio 鉴权失败 | 必须带此参数禁用 JWT |
| 3 | **Mac 无麦克风致模拟器崩溃** 💥 | 调用 gRPC `injectAudio` 时模拟器直接 crash。日志：`Could not initialize record - Unknown Audiodevice` + `Failed to create voice 'adc'` | 安装 BlackHole 2ch 虚拟音频驱动：`brew install blackhole-2ch && sudo killall -9 coreaudiod`（Mac mini/Mac Studio 等无内置麦克风的机型必装）|
| 4 | **必须设 `waitForIdleTimeout=0`** | TTFT 虚高到 16-18s（实际只有 1-2s）| UiAutomator2 默认等 UI idle，语音通话中永远不 idle |
| 5 | **必须加 `-no-snapshot-load`** | 音频 HAL pcm_writei I/O error，宿主机完全听不到模拟器声音 | 模拟器从快照恢复时音频 HAL 可能未正确初始化。诊断：`adb shell "logcat -d \| grep pcm_writei"`。修复：`adb emu kill && sleep 5 && emulator -avd Pixel_6_API_34 -grpc 8554 -gpu host -no-snapshot-load` |
| 6 | **必须加 `-gpu host`** 💥 | lavapipe 软件渲染导致长时间运行后图形子系统 hang 崩溃（crash dump: `hanged`）| AVD 的 config.ini/hardware-qemu.ini 设 `hw.gpu.mode = host`，启动加 `-gpu host`。Apple Silicon 走 Metal 硬件加速，启动 ~10s（lavapipe 要数分钟）|
| 7 | **Cloudflare Bot Fight Mode** | Python urllib 被 403 拦截 | uploader 已设 `User-Agent: VoiceBenchmark/1.0` |

### 🟠 运维级（日常关注）

| # | 坑 | 后果 | 解决 |
|---|---|---|---|
| 5 | **模拟器长时间运行（48h+）音频管道失效** | gRPC 注入显示成功但 APP 无法识别语音 | 重启模拟器 |
| 6 | **gRPC keepalive "Too many pings"** | 长时间运行后被服务端拒绝连接 | 已调优: 60s ping 间隔 + 空闲时禁 ping |
| 7 | **gRPC 连接级错误后 channel 未清理** | 后续注入全部失败 | 已修复: inject_wav 失败后自动 disconnect() |
| 8 | **音频管道失效恢复太慢** | 连续失败才触发恢复 | 已修复: 第 1 次失败就立即重建 gRPC |
| 9 | **元宝 Session 崩溃** | 连续多轮后 Appium Session 断开 | `reset_app()` + 异常恢复机制 |
| 10 | **AI 主动问候干扰音频注入** | 豆包新对话 AI 先说话，此时注入的音频被 VAD 丢弃 | `_wait_for_ai_greeting_done()` 等待 ≤12s |

### 🟡 开发级（扩展时注意）

| # | 坑 | 说明 |
|---|---|---|
| 11 | **Proto 文件无源文件** | 仅有编译产物 `pb2.py`/`pb2_grpc.py`，升级 grpcio 版本无法重新生成 |
| 12 | **豆包字幕 Toggle 反转** | 字幕按钮是 toggle，必须先检测 `content-desc` 再决定是否点击 |
| 13 | **音频必须用 Edge TTS** | macOS `say` 生成的语音 APP 无法识别，必须 48kHz PCM WAV |
| 14 | **Workers.dev 域名内网不可用** | 公司内网 DNS 劫持，必须用自定义域名 `voice-bench.cyberworld.app` |

### 🔒 安全 & 权限

| # | 注意事项 |
|---|---------|
| 15 | GitHub PAT（`github_pat_11AVDF...5y`）只授权了 AlphaCompany 仓库，对 VoiceBenchMark **无写权限**。推送需使用单独的 token |
| 16 | Git 用户信息是仓库局部配置（`ClusterLee / clusterlee@gmail.com`），非全局 |
| 17 | macOS Keychain 可能缓存旧 credential 导致 push 403，需 `git credential-osxkeychain erase` 清除 |

---

## 八、关键技术决策记录

| 决策 | 方案 | 原因 |
|------|------|------|
| 检测方法 | 纯文本变化检测 | 比截图/OCR 快 10 倍，精度更高 |
| 音频注入 | gRPC injectAudio | 直接注入虚拟麦克风，无需真实音频设备 |
| 元宝定位 | 坐标定位 | Compose UI 无 resource-id/content-desc |
| 豆包定位 | resource-id | 有完整 id 体系 |
| 异常值处理 | >8s 自动重试 1 次 | 偶发卡顿不影响最终数据质量 |
| 数据上报 | 每轮实时上报 | 支持时间序列观测，失败轮也上报 |
| Dashboard | Workers 内嵌 HTML | 无需额外前端部署，一个 Worker 搞定 |
| 聚合粒度 | SQLite strftime 时间桶 | D1 原生支持，无需额外计算层 |

---

## 九、依赖清单

### Python（测试端）

| 类别 | 包 |
|------|---|
| 核心 | numpy, scipy, librosa, soundfile, webrtcvad |
| gRPC | grpcio>=1.78.0, protobuf>=6.31.1 |
| Appium | Appium-Python-Client>=3.0.0, selenium>=4.15.0 |
| 音频 | pydub>=0.25.1（pyaudio 可选） |
| 报告 | jinja2, matplotlib, pandas |
| 配置 | pyyaml, click |
| 工具 | rich, loguru |

### Node.js（云端）

| 包 | 版本 |
|---|---|
| wrangler | ^4.0.0 |
| @cloudflare/workers-types | ^4.20250326.0 |
| typescript | ^5.7.0 |

---

## 十、D1 数据库 Schema

### test_sessions（会话级）
```sql
session_id TEXT UNIQUE    -- UUID
node_id TEXT              -- 节点标识（auto → mac-clusterli-mc3）
node_region TEXT          -- 节点区域（cn-shenzhen）
target TEXT               -- doubao | yuanbao
ttft_mean/median/p95/min/max/std REAL
e2e_mean/median/p95/min/max/std REAL
tested_at TEXT            -- ISO 8601
```

### test_rounds（轮次级）
```sql
session_id TEXT           -- 关联会话（无外键约束，支持独立上报）
target TEXT
round_num INTEGER
ttft_ms REAL
e2e_latency_ms REAL
is_valid INTEGER          -- 0=失败, 1=成功
error_msg TEXT            -- 失败原因
node_id TEXT
node_region TEXT
tested_at TEXT            -- ISO 8601
```

### 迁移历史
- **v1** (schema.sql): 初始建表，test_rounds 有外键
- **v2** (migration_v2.sql): test_rounds 新增 node_id/node_region/tested_at，支持独立查询
- **v3** (migration_v3.sql): 去掉外键约束（重建表实现），支持无 session 的单轮上报

---

## 十一、文档索引

| 文档 | 路径 | 说明 |
|------|------|------|
| **本文档** | `PROJECT_DOCS.md` | 项目全局文档 & 注意事项 |
| Skill 主文档 | `voice-benchmark-skill/SKILL.md` | AI 助手调用指南（298行，最核心）|
| 可迁移性审查 | `REVIEW.md` | 代码质量评估 & 修复记录 |
| 快速开始 | `voice-benchmark-skill/scripts/README.md` | 安装 & 运行指南 |
| 架构参考 | `voice-benchmark-skill/references/architecture.md` | 分层架构 & 类继承 |
| 技术架构 | `voice-benchmark-skill/scripts/docs/ARCHITECTURE.md` | 系统架构 & 测量方法 |
| 默认配置 | `voice-benchmark-skill/scripts/configs/default.yaml` | 设备/音频/APP 参数 |
| 工作日志 | `.workbuddy/memory/2026-04-02.md` | 开发过程记录 |
| 长期记忆 | `.workbuddy/memory/MEMORY.md` | 跨会话上下文 |
