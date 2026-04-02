"""
报告生成器

生成 JSON/CSV/HTML 格式的测试报告
"""
import json
import csv
import os
from datetime import datetime
from typing import List, Dict
from pathlib import Path
from loguru import logger

from ..audio.analyzer import LatencyResult, LatencyStats


class ReportGenerator:
    """测试报告生成器"""

    def __init__(self, output_dir: str = "results"):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)

    def generate(
        self,
        results: Dict[str, List[LatencyResult]],
        node_id: str = "local",
        node_region: str = "local",
        formats: List[str] = None,
        cloud_upload: bool = False,
    ) -> Dict[str, str]:
        """
        生成报告

        Args:
            results: {target_name: [LatencyResult, ...]}
            node_id: 节点 ID
            node_region: 节点区域
            formats: 输出格式列表
            cloud_upload: 是否上报到云端 (默认 True)

        Returns:
            {format: filepath}
        """
        if formats is None:
            formats = ["json", "csv", "html"]

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        report_data = self._build_report_data(results, node_id, node_region)
        output_files = {}

        if "json" in formats:
            path = self.output_dir / f"report_{timestamp}.json"
            self._write_json(report_data, str(path))
            output_files["json"] = str(path)

        if "csv" in formats:
            path = self.output_dir / f"report_{timestamp}.csv"
            self._write_csv(results, str(path))
            output_files["csv"] = str(path)

        if "html" in formats:
            path = self.output_dir / f"report_{timestamp}.html"
            self._write_html(report_data, str(path))
            output_files["html"] = str(path)

        logger.info(f"报告已生成: {output_files}")

        # 云端上报
        if cloud_upload:
            try:
                from .uploader import CloudUploader
                uploader = CloudUploader()
                uploader.upload(report_data)
            except Exception as e:
                logger.warning(f"云端上报失败 (不影响本地报告): {e}")

        return output_files

    def _build_report_data(
        self,
        results: Dict[str, List[LatencyResult]],
        node_id: str,
        node_region: str,
    ) -> dict:
        """构建报告数据结构"""
        report = {
            "metadata": {
                "generated_at": datetime.now().isoformat(),
                "node_id": node_id,
                "node_region": node_region,
                "tool_version": "1.0.0",
            },
            "targets": {},
        }

        for target, target_results in results.items():
            stats = LatencyStats(target_results)
            report["targets"][target] = {
                "summary": stats.summary(),
                "rounds": [r.to_dict() for r in target_results],
            }

        return report

    def _write_json(self, data: dict, path: str):
        """写入 JSON 报告"""
        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        logger.info(f"JSON 报告: {path}")

    def _write_csv(self, results: Dict[str, List[LatencyResult]], path: str):
        """写入 CSV 报告"""
        with open(path, "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow([
                "target", "round", "ttft_ms", "e2e_latency_ms",
                "total_response_time_ms", "is_valid", "error_msg",
            ])
            for target, target_results in results.items():
                for r in target_results:
                    d = r.to_dict()
                    writer.writerow([
                        d["target"], d["round"], d["ttft_ms"],
                        d["e2e_latency_ms"], d["total_response_time_ms"],
                        d["is_valid"], d["error_msg"],
                    ])
        logger.info(f"CSV 报告: {path}")

    def _write_html(self, data: dict, path: str):
        """写入 HTML 报告"""
        html = self._render_html(data)
        with open(path, "w", encoding="utf-8") as f:
            f.write(html)
        logger.info(f"HTML 报告: {path}")

    def _render_html(self, data: dict) -> str:
        """渲染 HTML 报告"""
        meta = data["metadata"]
        targets = data["targets"]

        # 构建对比表格
        comparison_rows = ""
        for target, info in targets.items():
            s = info["summary"]
            ttft = s["ttft_ms"]
            e2e = s["e2e_latency_ms"]
            comparison_rows += f"""
            <tr>
                <td><strong>{target}</strong></td>
                <td>{ttft['mean']:.0f}</td>
                <td>{ttft['median']:.0f}</td>
                <td>{ttft['p95']:.0f}</td>
                <td>{ttft['min']:.0f}</td>
                <td>{ttft['max']:.0f}</td>
                <td>{e2e['mean']:.0f}</td>
                <td>{s['valid_rounds']}/{s['total_rounds']}</td>
            </tr>"""

        # 构建每轮详情
        detail_rows = ""
        for target, info in targets.items():
            for r in info["rounds"]:
                status = "✅" if r["is_valid"] else "❌"
                detail_rows += f"""
                <tr>
                    <td>{target}</td>
                    <td>{r['round']}</td>
                    <td><strong>{r['ttft_ms']}</strong></td>
                    <td>{r['e2e_latency_ms']}</td>
                    <td>{r['total_response_time_ms']}</td>
                    <td>{status}</td>
                    <td>{r['error_msg']}</td>
                </tr>"""

        return f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>语音延迟评测报告</title>
    <style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{
            font-family: -apple-system, 'PingFang SC', sans-serif;
            background: #0a0a0f; color: #e0e0e0;
            padding: 24px; max-width: 1200px; margin: 0 auto;
        }}
        h1 {{ font-size: 28px; margin-bottom: 8px; color: #fff; }}
        h2 {{ font-size: 20px; margin: 32px 0 16px; color: #8ab4f8; }}
        .meta {{
            color: #888; font-size: 13px; margin-bottom: 32px;
            padding-bottom: 16px; border-bottom: 1px solid #222;
        }}
        table {{
            width: 100%; border-collapse: collapse;
            background: #111; border-radius: 8px; overflow: hidden;
        }}
        th {{
            background: #1a1a2e; padding: 12px 16px;
            text-align: left; font-size: 13px; color: #8ab4f8;
            font-weight: 600;
        }}
        td {{
            padding: 10px 16px; border-top: 1px solid #1a1a2e;
            font-size: 14px;
        }}
        tr:hover td {{ background: #151520; }}
        .winner {{ color: #4ade80; font-weight: 600; }}
        .summary-card {{
            display: inline-block; background: #111;
            border: 1px solid #222; border-radius: 8px;
            padding: 16px 24px; margin: 8px; min-width: 200px;
        }}
        .summary-card .label {{ font-size: 12px; color: #888; }}
        .summary-card .value {{ font-size: 28px; font-weight: 700; color: #fff; }}
        .summary-card .unit {{ font-size: 14px; color: #666; }}
    </style>
</head>
<body>
    <h1>🎙️ 语音通话延迟评测报告</h1>
    <div class="meta">
        生成时间: {meta['generated_at']}<br>
        测试节点: {meta['node_id']} ({meta['node_region']})<br>
        工具版本: {meta['tool_version']}
    </div>

    <h2>📊 延迟对比 (TTFT = 音频结束→AI首响, ms)</h2>
    <table>
        <tr>
            <th>产品</th><th>TTFT 平均</th><th>TTFT 中位</th>
            <th>TTFT P95</th><th>TTFT 最小</th><th>TTFT 最大</th>
            <th>E2E 平均</th><th>有效轮次</th>
        </tr>
        {comparison_rows}
    </table>

    <h2>📋 每轮详情</h2>
    <table>
        <tr>
            <th>产品</th><th>轮次</th><th>TTFT (ms)</th>
            <th>E2E (ms)</th><th>Total (ms)</th>
            <th>状态</th><th>备注</th>
        </tr>
        {detail_rows}
    </table>

    <div style="margin-top: 48px; color: #444; font-size: 12px;">
        Voice Latency Benchmark v1.0 | Powered by Appium + VAD
    </div>
</body>
</html>"""
