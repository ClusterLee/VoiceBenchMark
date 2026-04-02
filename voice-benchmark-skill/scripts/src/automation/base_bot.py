"""
Appium 自动化基类

封装与 Android 设备交互的通用操作
"""
import time
import subprocess
from abc import ABC, abstractmethod
from typing import Optional
from appium import webdriver
from appium.options.android import UiAutomator2Options
from appium.webdriver.common.appiumby import AppiumBy
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from loguru import logger

from ..config import AppConfig, DeviceConfig


class BaseBot(ABC):
    """APP 自动化基类"""

    def __init__(self, app_config: AppConfig, device_config: DeviceConfig):
        self.app_config = app_config
        self.device_config = device_config
        self.driver: Optional[webdriver.Remote] = None
        self._is_connected = False

    def connect(self):
        """连接到 Appium 服务器并启动 APP"""
        options = UiAutomator2Options()
        options.platform_name = self.device_config.platform
        options.device_name = self.device_config.device_name
        options.platform_version = self.device_config.platform_version
        options.automation_name = self.device_config.automation_name
        options.app_package = self.app_config.package
        options.app_activity = self.app_config.activity
        options.no_reset = True  # 保持登录态
        options.auto_grant_permissions = True
        options.new_command_timeout = 300
        # 🔑 关键：禁止 UiAutomator2 等待 UI idle
        # 默认行为是等 UI 完全空闲才返回 find_elements，
        # 但语音通话中 AI 边说边更新字幕，UI 永远不 idle，
        # 导致 find_elements 阻塞到 AI 说完才返回。
        options.set_capability("disableWindowAnimation", True)
        options.set_capability("waitForIdleTimeout", 0)
        options.set_capability("waitForSelectorTimeout", 0)

        appium_url = (
            f"http://{self.device_config.appium_host}:"
            f"{self.device_config.appium_port}"
        )

        logger.info(f"连接 Appium: {appium_url}, APP: {self.app_config.package}")

        self.driver = webdriver.Remote(
            command_executor=appium_url,
            options=options,
        )
        # 显式设置隐式等待为 0 —— 确保 find_elements 不会在找不到元素时阻塞
        self.driver.implicitly_wait(0)
        self._is_connected = True
        logger.info(f"已连接到 {self.app_config.name}")

        # 设置音频路由：通话音频切到扬声器外放
        self._setup_audio_routing()

        # 等待 APP 完全加载
        time.sleep(self.app_config.post_login_wait)

    def _setup_audio_routing(self):
        """设置模拟器音频路由

        语音通话类 APP 默认走 STREAM_VOICE_CALL → 听筒(earpiece)。
        Android 模拟器的听筒音频不会路由到宿主机音频输出，导致听不到声音。
        必须强制切到扬声器(speaker)模式。

        同时拉满音量确保音频可听。
        """
        device = self.device_config.device_name
        try:
            # 强制开启扬声器模式（通话音频从听筒切到外放）
            subprocess.run(
                ["adb", "-s", device, "shell", "content", "insert",
                 "--uri", "content://settings/system",
                 "--bind", "name:s:speakerphone_on",
                 "--bind", "value:s:1"],
                capture_output=True, timeout=5,
            )
            # 拉满音量（按 15 次 VOLUME_UP 确保各种音频流都最大）
            for _ in range(15):
                subprocess.run(
                    ["adb", "-s", device, "shell", "input", "keyevent",
                     "KEYCODE_VOLUME_UP"],
                    capture_output=True, timeout=3,
                )
            logger.info("音频路由已设置: 扬声器模式 + 音量最大")
        except Exception as e:
            logger.warning(f"音频路由设置失败(不影响测试): {e}")

    def disconnect(self):
        """断开连接"""
        if self.driver:
            try:
                self.driver.quit()
            except Exception as e:
                logger.warning(f"断开连接异常: {e}")
            finally:
                self._is_connected = False
                self.driver = None

    def find_element(self, by: str, value: str, timeout: float = 10):
        """查找元素"""
        wait = WebDriverWait(self.driver, timeout)
        return wait.until(EC.presence_of_element_located((by, value)))

    def click_element(self, by: str, value: str, timeout: float = 10):
        """点击元素"""
        element = self.find_element(by, value, timeout)
        element.click()
        return element

    def wait_for_element(self, by: str, value: str, timeout: float = 30) -> bool:
        """等待元素出现"""
        try:
            WebDriverWait(self.driver, timeout).until(
                EC.presence_of_element_located((by, value))
            )
            return True
        except TimeoutException:
            return False

    def wait_for_element_disappear(self, by: str, value: str, timeout: float = 30) -> bool:
        """等待元素消失"""
        try:
            WebDriverWait(self.driver, timeout).until(
                EC.invisibility_of_element_located((by, value))
            )
            return True
        except TimeoutException:
            return False

    def take_screenshot(self, path: str):
        """截图"""
        if self.driver:
            self.driver.save_screenshot(path)
            logger.debug(f"截图已保存: {path}")

    def reset_app(self):
        """强杀 APP 并冷启动，清除所有运行时上下文

        用于保证每轮 benchmark 都是全新对话，没有历史上下文给 AI 做热缓存。
        流程: force-stop → 等待进程退出 → 冷启动 → UI 就绪验证
        """
        pkg = self.app_config.package
        device = self.device_config.device_name
        logger.info(f"[{self.app_config.name}] 强杀 APP 并冷启动...")

        # 1. force-stop 杀掉 APP（清除进程和临时状态）
        try:
            subprocess.run(
                ["adb", "-s", device, "shell", "am", "force-stop", pkg],
                capture_output=True, timeout=10,
            )
            logger.debug(f"  force-stop {pkg} 完成")
        except Exception as e:
            logger.warning(f"  force-stop 失败: {e}")

        time.sleep(3)

        # 2. 冷启动 APP
        try:
            self.driver.activate_app(pkg)
            logger.debug(f"  activate_app {pkg} 完成")
        except Exception:
            # Appium activate 失败，用 ADB 启动
            try:
                subprocess.run(
                    ["adb", "-s", device, "shell", "am", "start", "-n",
                     f"{pkg}/{self.app_config.activity}"],
                    capture_output=True, timeout=10,
                )
            except Exception as e:
                logger.warning(f"  ADB 启动失败: {e}")

        # 3. 等待 APP 完全加载（基础等待 + UI 就绪验证）
        base_wait = self.app_config.post_login_wait + 3
        logger.debug(f"  基础等待 {base_wait}s...")
        time.sleep(base_wait)

        # 4. UI 就绪验证：尝试找到 APP 主界面元素（最多再等 10s）
        if self.driver:
            t_verify_start = time.time()
            for _ in range(20):
                try:
                    # 尝试获取 page_source，如果 UiAutomator2 就绪则秒回
                    source = self.driver.page_source
                    if source and len(source) > 100:
                        verify_time = time.time() - t_verify_start
                        logger.debug(f"  UI 就绪验证通过 ({verify_time:.1f}s)")
                        break
                except Exception:
                    pass
                time.sleep(0.5)

        logger.info(f"[{self.app_config.name}] APP 已冷启动完成")

    def capture_element_info(self, path: str):
        """导出 UI 元素树到文件"""
        if self.driver:
            source = self.driver.page_source
            with open(path, "w", encoding="utf-8") as f:
                f.write(source)
            logger.debug(f"UI 元素树已保存: {path}")

    @abstractmethod
    def navigate_to_voice_chat(self):
        """导航到语音通话界面"""
        pass

    @abstractmethod
    def start_voice_call(self) -> float:
        """
        开始语音通话

        Returns:
            通话开始的时间戳
        """
        pass

    @abstractmethod
    def end_voice_call(self):
        """结束语音通话"""
        pass

    @abstractmethod
    def is_ai_responding(self) -> bool:
        """检测 AI 是否正在回复"""
        pass

    @abstractmethod
    def is_ai_finished(self) -> bool:
        """检测 AI 是否回复完毕"""
        pass

    def run_single_test(self) -> dict:
        """
        执行单次语音测试

        Returns:
            包含时间戳的测试数据
        """
        result = {
            "target": self.app_config.name,
            "voice_call_start": 0,
            "audio_send_start": 0,
            "audio_send_end": 0,
            "ai_response_detected": 0,
            "ai_response_end": 0,
            "success": False,
            "error": "",
        }

        try:
            # 1. 进入语音通话
            self.navigate_to_voice_chat()
            time.sleep(2)

            # 2. 开始语音通话
            call_start = self.start_voice_call()
            result["voice_call_start"] = call_start
            time.sleep(1)

            # 3. 发送语音（由 runner 层处理音频注入）
            result["audio_send_start"] = time.time()

            # 音频播放由外部控制，这里只记录时间
            # runner 会调用 VirtualMicrophone 注入音频

            result["success"] = True

        except Exception as e:
            logger.error(f"测试执行失败: {e}")
            result["error"] = str(e)

        return result

    def __enter__(self):
        self.connect()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.disconnect()
