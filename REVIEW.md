# Voice Benchmark Skill — 可迁移性审查报告

> 审查日期: 2026-04-02 | 审查人: Money

## 一、总体评价

| 维度 | 评分 | 说明 |
|------|:----:|------|
| 代码质量 | ⭐⭐⭐⭐ | 结构清晰、模块化良好、文档丰富 |
| 可迁移性 | ⭐⭐⭐☆ | 基本可迁移，有 2 个必须修复的问题 |
| 依赖完整性 | ⭐⭐⭐☆ | 缺 2 个核心依赖声明 |
| 平台兼容 | ⭐⭐⭐☆ | macOS 优先，有少量平台强绑定 |

## 二、关键问题（必须修复）

### ✅ ~~P0: requirements.txt 缺失核心依赖~~ [已修复 2026-04-02]

已补充 `grpcio>=1.78.0` 和 `protobuf>=6.31.1` 到 requirements.txt。
同时将 `pyaudio` 标记为可选依赖。

### ✅ ~~P1: generate_audio.py 硬编码绝对路径~~ [已修复 2026-04-02]

已改为 `os.path.dirname(os.path.abspath(__file__))` 相对路径。

## 三、潜在风险（建议修复）

### 🟡 Proto 文件仅有编译产物，无源文件

| 文件 | 大小 | 说明 |
|------|------|------|
| `emulator_controller_pb2.py` | 32.79 KB | protobuf 生成代码 |
| `emulator_controller_pb2_grpc.py` | 108.22 KB | gRPC stub 生成代码 |

- 无原始 `.proto` 文件
- 无重新编译的 Makefile/脚本
- 版本绑定: Protobuf 6.31.1 + grpcio 1.78.0
- **风险**: 如果需要升级 protobuf/grpcio 版本，无法重新生成

### 🟡 sys.path 操作

两处 `sys.path.insert(0, ...)`:
- `runner.py` L23: `sys.path.insert(0, str(Path(__file__).parent.parent))`
- `virtual_mic.py` L21: `sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))`

使用 `-m` 模块运行时可正常工作，但如果以其他方式导入可能产生路径冲突。

### 🟡 pyaudio 依赖编译困难

`pyaudio>=0.2.13` 需要系统级 `portaudio` 库（`brew install portaudio`）。
但 pyaudio 仅用于备用录音方案，核心测试不依赖。

**建议**: 将 pyaudio 标记为可选依赖或移到 `requirements-optional.txt`。

### ✅ ~~无 .gitignore~~ [已修复 2026-04-02]

已添加 `.gitignore`，排除 `results/` 下的 CSV/JSON/HTML/PNG 等测试结果文件。

## 四、架构亮点（值得保留）

1. **配置系统** — dataclass + YAML，零硬编码，所有路径相对化
2. **可靠性工程** — 快速失败 / 管道恢复 / 异常值检测+重试 / Session 自动重建
3. **抽象基类** — `BaseBot` ABC 方便扩展新 APP
4. **Docker 支持** — 容器化部署就绪
5. **10 个已知坑** — 宝贵的运维知识

## 五、目录结构映射

```
skill 系统目录 (源)                        本地项目目录 (目标)
─────────────────────────                  ─────────────────────
~/.workbuddy/skills/                       ~/Downloads/VocieBenchMark/
  voice-benchmark/voice-benchmark/           voice-benchmark-skill/
    ├── SKILL.md                               ├── SKILL.md
    ├── references/                            ├── references/
    │   └── architecture.md                    │   └── architecture.md
    └── scripts/                               └── scripts/
        ├── src/                                   ├── src/
        ├── configs/                               ├── configs/
        ├── assets/                                ├── assets/
        ├── docker/                                ├── docker/
        ├── docs/                                  ├── docs/
        ├── project_scripts/                       ├── project_scripts/
        ├── results/                               ├── results/
        ├── requirements.txt                       ├── requirements.txt
        ├── generate_audio.py                      ├── generate_audio.py
        ├── run_benchmark.sh                       ├── run_benchmark.sh
        └── README.md                              └── README.md
```

## 六、同步策略

已内置双向同步脚本：

```bash
# 本地 → 系统 (开发完成后推送)
cd ~/Downloads/VocieBenchMark/voice-benchmark-skill
./sync_to_system.sh            # 实际同步
./sync_to_system.sh --dry-run  # 仅预览变更

# 系统 → 本地 (系统 skill 更新后拉取)
./sync_from_system.sh
./sync_from_system.sh --dry-run
```

自动排除: `.DS_Store`, `__pycache__/`, `results/`, 同步脚本本身。

```
本地开发流程:
  1. 在本地目录 (VocieBenchMark/voice-benchmark-skill/) 开发调试
  2. 测试通过 → ./sync_to_system.sh 同步到系统
  3. 系统有更新 → ./sync_from_system.sh 拉回本地
```
