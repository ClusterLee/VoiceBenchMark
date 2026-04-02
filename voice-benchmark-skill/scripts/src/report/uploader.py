"""
云端上报模块 — 将测试结果发送到 Cloudflare Workers API

用法:
    # 单轮实时上报（推荐）
    from src.report.uploader import CloudUploader
    uploader = CloudUploader()
    uploader.upload_round(result, target, round_num, node_id, node_region)

    # 批量上报（兼容旧流程）
    uploader.upload(report_data)

环境变量:
    VOICE_BENCHMARK_API_URL  覆盖默认 API 地址
"""
import os
import json
import uuid
import urllib.request
import urllib.error
from datetime import datetime
from typing import Optional
from loguru import logger


# 默认 API 地址（可通过环境变量覆盖）
DEFAULT_API_URL = os.environ.get(
    "VOICE_BENCHMARK_API_URL",
    "https://voice-bench.cyberworld.app"
)

_HEADERS = {
    "Content-Type": "application/json",
    "User-Agent": "VoiceBenchmark/1.0",
}


class CloudUploader:
    """测试结果云端上报器"""

    def __init__(self, api_url: str = DEFAULT_API_URL, timeout: int = 15):
        self.api_url = api_url.rstrip("/")
        self.timeout = timeout
        # 每次 runner 实例化一个 uploader，共享同一个 session_id
        self.session_id = self._gen_session_id()

    @staticmethod
    def _gen_session_id() -> str:
        return str(uuid.uuid4())[:36]

    def _post(self, path: str, data: dict) -> Optional[dict]:
        """通用 POST 请求"""
        url = f"{self.api_url}{path}"
        payload = json.dumps(data, ensure_ascii=False).encode("utf-8")
        req = urllib.request.Request(
            url, data=payload, headers=_HEADERS, method="POST",
        )
        try:
            with urllib.request.urlopen(req, timeout=self.timeout) as resp:
                return json.loads(resp.read().decode("utf-8"))
        except urllib.error.URLError as e:
            logger.warning(f"☁️ 上报失败 (网络): {e}")
            return None
        except Exception as e:
            logger.warning(f"☁️ 上报失败: {e}")
            return None

    def upload_round(
        self,
        result,
        target: str,
        round_num: int,
        node_id: str = "local",
        node_region: str = "local",
    ) -> Optional[dict]:
        """单轮实时上报

        Args:
            result: LatencyResult 对象（来自 run_single_round）
            target: 测试目标名称 (doubao/yuanbao)
            round_num: 轮次编号
            node_id: 节点标识
            node_region: 节点区域

        Returns:
            API 响应 dict, 或失败时返回 None
        """
        now = datetime.now().strftime("%Y-%m-%dT%H:%M:%S")

        payload = {
            "session_id": self.session_id,
            "node_id": node_id,
            "node_region": node_region,
            "target": target,
            "round_num": round_num,
            "ttft_ms": round(result.ttfr * 1000, 1) if result.is_valid and result.ttfr else 0,
            "e2e_latency_ms": round(result.e2e_latency * 1000, 1) if result.is_valid and result.e2e_latency else 0,
            "total_response_time_ms": round(result.total_response_time * 1000, 1) if result.total_response_time else 0,
            "user_speech_start": result.user_speech_start or 0,
            "user_speech_end": result.user_speech_end or 0,
            "ai_speech_start": result.ai_speech_start or 0,
            "ai_speech_end": result.ai_speech_end or 0,
            "is_valid": result.is_valid,
            "error_msg": result.error_msg or "",
            "tested_at": now,
        }

        status = "✅" if result.is_valid else "❌"
        ttft_str = f"{payload['ttft_ms']:.0f}ms" if result.is_valid else "N/A"
        logger.info(
            f"☁️ [{target}] Round {round_num} {status} "
            f"TTFT={ttft_str} → 上报中..."
        )

        resp = self._post("/api/round", payload)
        if resp and resp.get("ok"):
            logger.info(f"☁️ [{target}] Round {round_num} 上报成功")
            return resp
        else:
            logger.warning(
                f"☁️ [{target}] Round {round_num} 上报失败: {resp}"
            )
            return resp

    def upload(self, report_data: dict) -> Optional[dict]:
        """批量上报完整测试报告（兼容旧流程）

        Args:
            report_data: ReportGenerator._build_report_data() 生成的完整报告字典

        Returns:
            API 响应 dict (含 session_id), 或失败时返回 None
        """
        url = f"{self.api_url}/api/report"
        logger.info(f"☁️ 批量上报测试结果到 {url} ...")

        resp = self._post("/api/report", report_data)
        if resp and resp.get("ok"):
            sessions = resp.get("sessions", [])
            for s in sessions:
                logger.info(
                    f"  ✅ {s['target']}: session_id={s['session_id']}"
                )
            logger.info(f"☁️ 批量上报成功! Dashboard: {self.api_url}")
            return resp
        else:
            logger.warning(f"☁️ 批量上报异常: {resp}")
            return resp
