"""配置管理"""
import os
import platform
import socket
import yaml
from dataclasses import dataclass, field
from typing import Optional
from pathlib import Path


def _auto_node_id() -> str:
    """自动生成节点 ID: {os_short}-{hostname}
    
    示例: mac-MacBookPro, linux-bench-server-01, win-DESKTOP-ABC
    """
    os_map = {
        "Darwin": "mac",
        "Linux": "linux",
        "Windows": "win",
    }
    os_short = os_map.get(platform.system(), platform.system().lower())
    hostname = socket.gethostname()
    # 去掉 .local 后缀（macOS 常见）
    if hostname.endswith(".local"):
        hostname = hostname[:-6]
    # 替换不友好字符
    hostname = hostname.replace(" ", "-").lower()
    return f"{os_short}-{hostname}"


@dataclass
class AppConfig:
    """单个 APP 的配置"""
    name: str
    package: str
    activity: str
    # 语音通话按钮的定位方式
    voice_button_id: Optional[str] = None
    voice_button_xpath: Optional[str] = None
    # 发送按钮
    send_button_id: Optional[str] = None
    send_button_xpath: Optional[str] = None
    # 等待 AI 回复的最大超时（秒）
    response_timeout: float = 30.0
    # 登录后的等待时间（秒）
    post_login_wait: float = 5.0


@dataclass
class AudioConfig:
    """音频配置"""
    # 输入音频
    input_file: str = "assets/audio/hello.wav"
    sample_rate: int = 16000
    # VAD 配置
    vad_aggressiveness: int = 2  # 0-3, 越高越严格
    vad_frame_duration_ms: int = 30  # 10, 20, 或 30
    # 静音阈值（用于检测回复开始）
    silence_threshold_db: float = -40.0
    # 录制配置
    record_duration: float = 45.0  # 最长录制时间
    record_sample_rate: int = 44100


@dataclass
class BenchmarkConfig:
    """测试配置"""
    # 测试轮次
    num_rounds: int = 5
    # 每轮之间的间隔（秒）
    round_interval: float = 10.0
    # 是否录制屏幕
    record_screen: bool = True
    # 结果输出目录
    output_dir: str = "results"
    # 报告格式
    report_formats: list = field(default_factory=lambda: ["json", "csv", "html"])


@dataclass
class DeviceConfig:
    """设备配置"""
    # Appium 服务器
    appium_host: str = "127.0.0.1"
    appium_port: int = 4723
    # 设备
    platform: str = "Android"
    device_name: str = "emulator-5554"
    platform_version: str = "14"
    avd_name: str = "Pixel_6_API_34"
    # ADB
    adb_host: Optional[str] = None  # 远程 ADB 时使用
    adb_port: int = 5037
    # 自动化引擎
    automation_name: str = "UiAutomator2"


@dataclass
class Config:
    """总配置"""
    device: DeviceConfig = field(default_factory=DeviceConfig)
    audio: AudioConfig = field(default_factory=AudioConfig)
    benchmark: BenchmarkConfig = field(default_factory=BenchmarkConfig)
    apps: dict = field(default_factory=dict)
    # 部署节点信息
    node_id: str = "local"
    node_region: str = "local"

    @classmethod
    def from_yaml(cls, path: str) -> "Config":
        """从 YAML 文件加载配置"""
        with open(path, "r") as f:
            data = yaml.safe_load(f)

        config = cls()

        if "device" in data:
            config.device = DeviceConfig(**data["device"])
        if "audio" in data:
            config.audio = AudioConfig(**data["audio"])
        if "benchmark" in data:
            config.benchmark = BenchmarkConfig(**data["benchmark"])
        if "apps" in data:
            for name, app_data in data["apps"].items():
                config.apps[name] = AppConfig(name=name, **app_data)
        if "node_id" in data:
            config.node_id = data["node_id"]
        if "node_region" in data:
            config.node_region = data["node_region"]

        # 自动填充 node_id
        config._resolve_auto_node_id()
        return config

    @classmethod
    def default(cls) -> "Config":
        """默认配置"""
        config = cls()
        config.device.platform_version = "14"
        config.apps = {
            "yuanbao": AppConfig(
                name="yuanbao",
                package="com.tencent.hunyuan.app.chat",
                activity=".biz.login.v2.HYLoginMainActivity",
                voice_button_xpath='//android.view.View[@bounds="[794,89][920,215]"]',
                response_timeout=30.0,
            ),
            "doubao": AppConfig(
                name="doubao",
                package="com.larus.nova",
                activity="com.larus.home.impl.alias.AliasActivity1",
                voice_button_id="com.larus.nova:id/real_time_call",
                voice_button_xpath='//android.widget.ImageView[@content-desc="打电话"]',
                response_timeout=30.0,
            ),
        }
        config._resolve_auto_node_id()
        return config

    def _resolve_auto_node_id(self):
        """当 node_id 为 'local' 或 'auto' 时，自动生成节点标识"""
        if self.node_id in ("local", "auto", ""):
            self.node_id = _auto_node_id()


def get_project_root() -> Path:
    """获取项目根目录"""
    return Path(__file__).parent.parent


def load_config(config_path: Optional[str] = None) -> Config:
    """加载配置"""
    if config_path and os.path.exists(config_path):
        return Config.from_yaml(config_path)

    default_path = get_project_root() / "configs" / "default.yaml"
    if default_path.exists():
        return Config.from_yaml(str(default_path))

    return Config.default()
