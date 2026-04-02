# ============================================
# Voice Latency Benchmark - Docker 调度层
# ============================================
# 这个镜像是"调度层"，负责：
# 1. 通过 ADB over TCP 连接远程 Android 设备/云手机
# 2. 运行 Appium 自动化测试
# 3. 分析音频、生成报告
# 4. 上报结果到中控
# ============================================

FROM python:3.11-slim

LABEL maintainer="voice-benchmark"
LABEL description="Voice Latency Benchmark - Orchestration Layer"

# 安装系统依赖
RUN apt-get update && apt-get install -y --no-install-recommends \
    # ADB
    android-tools-adb \
    # 音频处理
    ffmpeg \
    # Node.js (for Appium)
    nodejs \
    npm \
    # 其他
    curl \
    wget \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# 安装 Appium
RUN npm install -g appium \
    && appium driver install uiautomator2

# 工作目录
WORKDIR /app

# 复制项目文件
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# 创建结果目录
RUN mkdir -p /app/results

# 环境变量
ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s \
    CMD python3 -c "import sys; sys.exit(0)"

# 默认入口
ENTRYPOINT ["python3", "src/runner.py"]
CMD ["--config", "configs/default.yaml"]
