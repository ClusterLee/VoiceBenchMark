/**
 * Voice Benchmark API — Cloudflare Workers + D1
 *
 * Routes:
 *   POST /api/report   — 批量上报（整个测试会话）
 *   POST /api/round    — 单轮实时上报
 *   GET  /api/sessions — 查询会话列表
 *   GET  /api/rounds   — 查询轮次明细（支持按时间范围）
 *   GET  /api/stats    — 聚合统计（趋势数据）
 *   GET  /              — Dashboard HTML
 */

export interface Env {
  DB: D1Database;
}

// ─── Types ───

interface ReportPayload {
  metadata: {
    generated_at: string;
    node_id: string;
    node_region: string;
    tool_version: string;
  };
  targets: Record<string, {
    summary: {
      total_rounds: number;
      valid_rounds: number;
      invalid_rounds: number;
      ttft_ms: StatBlock;
      e2e_latency_ms: StatBlock;
      [key: string]: any;
    };
    rounds: RoundData[];
  }>;
}

interface RoundPayload {
  node_id: string;
  node_region: string;
  target: string;
  round_num: number;
  ttft_ms: number;
  e2e_latency_ms: number;
  total_response_time_ms: number;
  user_speech_start: number;
  user_speech_end: number;
  ai_speech_start: number;
  ai_speech_end: number;
  is_valid: boolean;
  error_msg: string;
  tested_at: string;
  session_id?: string;  // 可选，客户端生成的会话 ID
}

interface StatBlock {
  mean: number;
  median: number;
  p95: number;
  p99?: number;
  min: number;
  max: number;
  std: number;
}

interface RoundData {
  target: string;
  round: number;
  ttft_ms: number;
  e2e_latency_ms: number;
  total_response_time_ms: number;
  user_speech_start: number;
  user_speech_end: number;
  ai_speech_start: number;
  ai_speech_end: number;
  is_valid: boolean;
  error_msg: string;
}

// ─── Helpers ───

function jsonResp(data: any, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

function corsHeaders(): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function generateSessionId(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  const parts = [8, 4, 4, 4, 12];
  return parts.map(len => {
    let s = "";
    for (let i = 0; i < len; i++) {
      s += chars[Math.floor(Math.random() * chars.length)];
    }
    return s;
  }).join("-");
}

// ─── Route Handlers ───

/** POST /api/round — 单轮实时上报 */
async function handleRoundUpload(request: Request, db: D1Database): Promise<Response> {
  let payload: RoundPayload;
  try {
    payload = await request.json() as RoundPayload;
  } catch {
    return jsonResp({ error: "Invalid JSON" }, 400);
  }

  if (!payload.target || payload.round_num === undefined) {
    return jsonResp({ error: "Missing target or round_num" }, 400);
  }

  const sessionId = payload.session_id || generateSessionId();
  const testedAt = payload.tested_at || new Date().toISOString();

  await db.prepare(`
    INSERT INTO test_rounds (
      session_id, target, round_num,
      ttft_ms, e2e_latency_ms, total_response_time_ms,
      user_speech_start, user_speech_end,
      ai_speech_start, ai_speech_end,
      is_valid, error_msg,
      node_id, node_region, tested_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    sessionId,
    payload.target,
    payload.round_num,
    payload.ttft_ms || 0,
    payload.e2e_latency_ms || 0,
    payload.total_response_time_ms || 0,
    payload.user_speech_start || 0,
    payload.user_speech_end || 0,
    payload.ai_speech_start || 0,
    payload.ai_speech_end || 0,
    payload.is_valid ? 1 : 0,
    payload.error_msg || "",
    payload.node_id || "local",
    payload.node_region || "local",
    testedAt
  ).run();

  return jsonResp({
    ok: true,
    round_id: sessionId,
    target: payload.target,
    round_num: payload.round_num,
    is_valid: payload.is_valid,
  });
}

/** POST /api/report — 批量上报（兼容旧格式） */
async function handleReport(request: Request, db: D1Database): Promise<Response> {
  let payload: ReportPayload;
  try {
    payload = await request.json() as ReportPayload;
  } catch {
    return jsonResp({ error: "Invalid JSON" }, 400);
  }

  const { metadata, targets } = payload;
  if (!metadata || !targets) {
    return jsonResp({ error: "Missing metadata or targets" }, 400);
  }

  const results: { session_id: string; target: string }[] = [];

  for (const [target, data] of Object.entries(targets)) {
    const sessionId = generateSessionId();
    const summary = data.summary;
    const ttft = summary.ttft_ms;
    const e2e = summary.e2e_latency_ms;

    // Insert session
    await db.prepare(`
      INSERT INTO test_sessions (
        session_id, node_id, node_region, target, tool_version,
        total_rounds, valid_rounds, invalid_rounds,
        ttft_mean, ttft_median, ttft_p95, ttft_min, ttft_max, ttft_std,
        e2e_mean, e2e_median, e2e_p95, e2e_min, e2e_max, e2e_std,
        tested_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      sessionId,
      metadata.node_id,
      metadata.node_region,
      target,
      metadata.tool_version,
      summary.total_rounds,
      summary.valid_rounds,
      summary.invalid_rounds,
      ttft.mean, ttft.median, ttft.p95, ttft.min, ttft.max, ttft.std,
      e2e.mean, e2e.median, e2e.p95, e2e.min, e2e.max, e2e.std,
      metadata.generated_at
    ).run();

    // Insert rounds (batch)
    const stmts = data.rounds.map(r =>
      db.prepare(`
        INSERT INTO test_rounds (
          session_id, target, round_num,
          ttft_ms, e2e_latency_ms, total_response_time_ms,
          user_speech_start, user_speech_end,
          ai_speech_start, ai_speech_end,
          is_valid, error_msg,
          node_id, node_region, tested_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        sessionId, r.target, r.round,
        r.ttft_ms, r.e2e_latency_ms, r.total_response_time_ms,
        r.user_speech_start, r.user_speech_end,
        r.ai_speech_start, r.ai_speech_end,
        r.is_valid ? 1 : 0, r.error_msg,
        metadata.node_id, metadata.node_region, metadata.generated_at
      )
    );

    if (stmts.length > 0) {
      await db.batch(stmts);
    }

    results.push({ session_id: sessionId, target });
  }

  return jsonResp({ ok: true, sessions: results });
}

async function handleSessions(url: URL, db: D1Database): Promise<Response> {
  const target = url.searchParams.get("target");
  const nodeId = url.searchParams.get("node_id");
  const days = parseInt(url.searchParams.get("days") || "30");
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "100"), 500);

  let sql = `
    SELECT * FROM test_sessions
    WHERE tested_at >= datetime('now', '-${days} days')
  `;
  const params: any[] = [];

  if (target) {
    sql += " AND target = ?";
    params.push(target);
  }
  if (nodeId) {
    sql += " AND node_id = ?";
    params.push(nodeId);
  }

  sql += " ORDER BY tested_at DESC LIMIT ?";
  params.push(limit);

  const result = await db.prepare(sql).bind(...params).all();
  return jsonResp({ sessions: result.results, total: result.results?.length || 0 });
}

async function handleRounds(url: URL, db: D1Database): Promise<Response> {
  const sessionId = url.searchParams.get("session_id");
  const target = url.searchParams.get("target");
  const nodeId = url.searchParams.get("node_id");
  const days = parseInt(url.searchParams.get("days") || "7");
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "500"), 2000);

  if (sessionId) {
    // 按 session 查询（兼容旧用法）
    const result = await db.prepare(
      "SELECT * FROM test_rounds WHERE session_id = ? ORDER BY round_num"
    ).bind(sessionId).all();
    return jsonResp({ rounds: result.results });
  }

  // 按时间范围查询所有轮次（新用法）
  let sql = `
    SELECT * FROM test_rounds
    WHERE tested_at >= datetime('now', '-${days} days')
  `;
  const params: any[] = [];

  if (target) {
    sql += " AND target = ?";
    params.push(target);
  }
  if (nodeId) {
    sql += " AND node_id = ?";
    params.push(nodeId);
  }

  sql += " ORDER BY tested_at DESC, round_num DESC LIMIT ?";
  params.push(limit);

  const result = await db.prepare(sql).bind(...params).all();
  return jsonResp({ rounds: result.results, total: result.results?.length || 0 });
}

async function handleStats(url: URL, db: D1Database): Promise<Response> {
  const target = url.searchParams.get("target");
  const nodeId = url.searchParams.get("node_id");
  const days = parseInt(url.searchParams.get("days") || "30");
  const groupBy = url.searchParams.get("group_by") || "day"; // day | round
  const interval = url.searchParams.get("interval"); // 1m | 5m | 15m | 1h | 1d

  if (groupBy === "round") {
    // 按轮次返回时间序列（每个点 = 一轮测试）
    let sql = `
      SELECT
        id, session_id, target, node_id, round_num,
        ttft_ms, e2e_latency_ms, total_response_time_ms,
        is_valid, error_msg, tested_at, created_at
      FROM test_rounds
      WHERE tested_at >= datetime('now', '-${days} days')
        AND tested_at != ''
        AND length(tested_at) >= 19
    `;
    const params: any[] = [];
    if (target) {
      sql += " AND target = ?";
      params.push(target);
    }
    if (nodeId) {
      sql += " AND node_id = ?";
      params.push(nodeId);
    }
    sql += " ORDER BY tested_at ASC, id ASC LIMIT 1000";

    const result = await db.prepare(sql).bind(...params).all();
    return jsonResp({ stats: result.results });
  }

  // 构造时间桶表达式
  let timeBucket: string;
  let timeAlias: string = "time_bucket";
  if (interval === "1m") {
    timeBucket = "strftime('%Y-%m-%dT%H:%M', tested_at)";
  } else if (interval === "5m") {
    timeBucket = "strftime('%Y-%m-%dT%H:', tested_at) || printf('%02d', (CAST(strftime('%M', tested_at) AS INTEGER) / 5) * 5)";
  } else if (interval === "15m") {
    timeBucket = "strftime('%Y-%m-%dT%H:', tested_at) || printf('%02d', (CAST(strftime('%M', tested_at) AS INTEGER) / 15) * 15)";
  } else if (interval === "1h") {
    timeBucket = "strftime('%Y-%m-%dT%H:00', tested_at)";
  } else {
    // 默认按天 (1d)
    timeBucket = "date(tested_at)";
    timeAlias = "date";
  }

  let sql = `
    SELECT
      ${timeBucket} as ${timeAlias},
      target,
      COUNT(*) as total_rounds,
      SUM(CASE WHEN is_valid = 1 THEN 1 ELSE 0 END) as valid_rounds,
      SUM(CASE WHEN is_valid = 0 THEN 1 ELSE 0 END) as invalid_rounds,
      ROUND(AVG(CASE WHEN is_valid = 1 THEN ttft_ms END), 1) as avg_ttft,
      ROUND(MIN(CASE WHEN is_valid = 1 THEN ttft_ms END), 1) as min_ttft,
      ROUND(MAX(CASE WHEN is_valid = 1 THEN ttft_ms END), 1) as max_ttft,
      ROUND(AVG(CASE WHEN is_valid = 1 THEN e2e_latency_ms END), 1) as avg_e2e,
      ROUND(MIN(CASE WHEN is_valid = 1 THEN e2e_latency_ms END), 1) as min_e2e,
      ROUND(MAX(CASE WHEN is_valid = 1 THEN e2e_latency_ms END), 1) as max_e2e
    FROM test_rounds
    WHERE tested_at >= datetime('now', '-${days} days')
      AND tested_at != ''
      AND length(tested_at) >= 19
  `;
  const params: any[] = [];
  if (target) {
    sql += " AND target = ?";
    params.push(target);
  }
  if (nodeId) {
    sql += " AND node_id = ?";
    params.push(nodeId);
  }
  sql += ` GROUP BY ${timeBucket}, target ORDER BY ${timeBucket} ASC`;

  const result = await db.prepare(sql).bind(...params).all();
  return jsonResp({ stats: result.results, interval: interval || "1d" });
}

// ─── Dashboard HTML ───

function renderDashboard(): Response {
  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Voice Benchmark Dashboard</title>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/chartjs-adapter-date-fns@3.0.0/dist/chartjs-adapter-date-fns.bundle.min.js"></script>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  font-family: -apple-system, 'PingFang SC', 'Segoe UI', sans-serif;
  background: #0a0a0f; color: #e0e0e0;
  min-height: 100vh;
}
.header {
  padding: 20px 24px 12px;
  border-bottom: 1px solid #1a1a2e;
  display: flex; align-items: center; gap: 16px; flex-wrap: wrap;
}
.header h1 { font-size: 22px; color: #fff; white-space: nowrap; }
.filters {
  display: flex; gap: 8px; align-items: center; margin-left: auto;
}
.filters select, .filters button {
  background: #1a1a2e; color: #e0e0e0; border: 1px solid #2a2a3e;
  padding: 6px 12px; border-radius: 6px; font-size: 13px; cursor: pointer;
}
.filters button { background: #3b82f6; border-color: #3b82f6; color: #fff; }
.filters button:hover { background: #2563eb; }

/* KPI Cards — 按产品分组 */
.kpi-section { padding: 12px 24px 0; }
.kpi-group {
  margin-bottom: 10px;
}
.kpi-group-header {
  display: flex; align-items: center; gap: 8px; margin-bottom: 6px;
}
.kpi-group-header .product-tag {
  display: inline-block; padding: 2px 10px; border-radius: 4px;
  font-size: 12px; font-weight: 700; letter-spacing: 0.5px;
}
.product-tag-doubao { background: #1e3a5f; color: #60a5fa; }
.product-tag-yuanbao { background: #1e3f2e; color: #4ade80; }
.kpi-group-header .product-tag-default { background: #2a2a3e; color: #aaa; }
.kpi-row {
  display: grid; grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}
.kpi {
  background: #111118; border: 1px solid #1a1a2e; border-radius: 8px;
  padding: 12px 14px;
}
.kpi .label { font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; }
.kpi .value { font-size: 24px; font-weight: 700; color: #fff; margin-top: 1px; }
.kpi .sub { font-size: 11px; color: #888; margin-top: 1px; }
.kpi .unit { font-size: 13px; color: #555; font-weight: 400; }
.kpi.good .value { color: #4ade80; }
.kpi.warn .value { color: #fbbf24; }
.kpi.bad .value { color: #f87171; }

/* Charts */
.charts {
  display: grid; grid-template-columns: 1fr 1fr; gap: 16px;
  padding: 0 24px 16px;
}
.chart-card {
  background: #111118; border: 1px solid #1a1a2e; border-radius: 8px;
  padding: 16px;
}
.chart-card h3 { font-size: 14px; color: #8ab4f8; margin-bottom: 12px; }
.chart-card canvas { width: 100% !important; height: 280px !important; }

/* Table */
.table-section { padding: 0 24px 24px; }
.table-section h3 { font-size: 14px; color: #8ab4f8; margin-bottom: 8px; }
table {
  width: 100%; border-collapse: collapse; background: #111118;
  border-radius: 8px; overflow: hidden; font-size: 13px;
}
th {
  background: #1a1a2e; padding: 10px 12px; text-align: left;
  color: #8ab4f8; font-weight: 600; font-size: 12px;
}
td { padding: 8px 12px; border-top: 1px solid #1a1a2e; }
tr:hover td { background: #151520; }
.tag {
  display: inline-block; padding: 2px 8px; border-radius: 4px;
  font-size: 11px; font-weight: 600;
}
.tag-doubao { background: #1e3a5f; color: #60a5fa; }
.tag-yuanbao { background: #1e3f2e; color: #4ade80; }
.valid { color: #4ade80; }
.invalid { color: #f87171; }
.empty-state {
  text-align: center; padding: 60px 24px; color: #555;
}
.empty-state h2 { font-size: 18px; color: #888; margin-bottom: 8px; }

@media (max-width: 768px) {
  .charts { grid-template-columns: 1fr; }
  .kpi-row { grid-template-columns: repeat(2, 1fr); }
}
</style>
</head>
<body>

<div class="header">
  <h1>🎙️ Voice Benchmark</h1>
  <div class="filters">
    <select id="targetFilter">
      <option value="">全部产品</option>
      <option value="doubao">豆包</option>
      <option value="yuanbao">元宝</option>
    </select>
    <select id="daysFilter">
      <option value="1">今天</option>
      <option value="7" selected>近 7 天</option>
      <option value="30">近 30 天</option>
      <option value="90">近 90 天</option>
    </select>
    <select id="intervalFilter">
      <option value="round">逐轮原始</option>
      <option value="1m">1 分钟</option>
      <option value="5m">5 分钟</option>
      <option value="15m">15 分钟</option>
      <option value="1h" selected>1 小时</option>
      <option value="1d">按天</option>
    </select>
    <button onclick="refreshData()">刷新</button>
  </div>
</div>

<div id="kpiSection" class="kpi-section"></div>

<div class="charts">
  <div class="chart-card">
    <h3>TTFT 逐轮趋势 (ms) — 每个点 = 一轮测试</h3>
    <canvas id="ttftChart"></canvas>
  </div>
  <div class="chart-card">
    <h3>E2E 逐轮趋势 (ms) — 每个点 = 一轮测试</h3>
    <canvas id="e2eChart"></canvas>
  </div>
</div>

<div class="table-section">
  <h3>最近测试轮次</h3>
  <table>
    <thead>
      <tr>
        <th>时间</th><th>产品</th><th>节点</th><th>轮次</th>
        <th>TTFT</th><th>E2E</th><th>状态</th><th>错误</th>
      </tr>
    </thead>
    <tbody id="roundsBody"></tbody>
  </table>
</div>

<div id="emptyState" class="empty-state" style="display:none;">
  <h2>暂无数据</h2>
  <p>运行测试后数据将自动上报到这里</p>
  <p style="margin-top:12px;font-size:12px;color:#444;">
    POST /api/round 单轮上报 · POST /api/report 批量上报
  </p>
</div>

<script>
const API_BASE = '';
let ttftChart, e2eChart;

const TARGET_COLORS = {
  doubao: { bg: 'rgba(96,165,250,0.1)', border: '#60a5fa', point: '#3b82f6', pointFail: '#f87171' },
  yuanbao: { bg: 'rgba(74,222,128,0.1)', border: '#4ade80', point: '#22c55e', pointFail: '#f87171' },
};

function timeChartOpts(yLabel) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'nearest', intersect: false },
    plugins: {
      legend: { labels: { color: '#888', font: { size: 11 } } },
      tooltip: {
        backgroundColor: '#1a1a2e', titleColor: '#fff', bodyColor: '#ccc',
        callbacks: {
          label: ctx => {
            const r = ctx.raw;
            if (r && r.meta) {
              const v = r.meta.is_valid ? '✅' : '❌';
              return ctx.dataset.label + ': ' + Math.round(ctx.parsed.y) + 'ms ' + v +
                (r.meta.error_msg ? ' (' + r.meta.error_msg + ')' : '');
            }
            return ctx.dataset.label + ': ' + Math.round(ctx.parsed.y) + 'ms';
          }
        }
      }
    },
    scales: {
      x: {
        type: 'time',
        time: { unit: 'hour', displayFormats: { hour: 'MM/dd HH:mm', day: 'MM/dd' } },
        ticks: { color: '#555', font: { size: 10 }, maxTicksLimit: 12 },
        grid: { color: '#1a1a2e' }
      },
      y: {
        ticks: { color: '#555', font: { size: 10 }, callback: v => v + 'ms' },
        grid: { color: '#1a1a2e' },
        beginAtZero: false,
        title: { display: true, text: yLabel, color: '#555', font: { size: 11 } }
      }
    }
  };
}

function initCharts() {
  const ctx1 = document.getElementById('ttftChart').getContext('2d');
  ttftChart = new Chart(ctx1, { type: 'line', data: { datasets: [] }, options: timeChartOpts('TTFT (ms)') });

  const ctx2 = document.getElementById('e2eChart').getContext('2d');
  e2eChart = new Chart(ctx2, { type: 'line', data: { datasets: [] }, options: timeChartOpts('E2E (ms)') });
}

async function fetchJSON(path) {
  const resp = await fetch(API_BASE + path);
  return resp.json();
}

async function refreshData() {
  const target = document.getElementById('targetFilter').value;
  const days = document.getElementById('daysFilter').value;
  const interval = document.getElementById('intervalFilter').value;

  const params = new URLSearchParams({ days });
  if (target) params.set('target', target);

  const isRound = interval === 'round';

  try {
    // 根据聚合粒度选择 API 请求方式
    const chartParams = new URLSearchParams(params);
    if (isRound) {
      chartParams.set('group_by', 'round');
    } else {
      chartParams.set('interval', interval);
    }

    const [chartStats, roundStats, roundsData] = await Promise.all([
      fetchJSON('/api/stats?' + chartParams),
      fetchJSON('/api/stats?' + params + '&group_by=round'),
      fetchJSON('/api/rounds?' + params + '&limit=200'),
    ]);

    const chartData = chartStats.stats || [];
    const rounds = roundStats.stats || [];
    const recentRounds = roundsData.rounds || [];

    if (rounds.length === 0 && recentRounds.length === 0) {
      document.getElementById('emptyState').style.display = 'block';
      document.querySelector('.kpi-section').style.display = 'none';
      document.querySelector('.charts').style.display = 'none';
      document.querySelector('.table-section').style.display = 'none';
      return;
    }

    document.getElementById('emptyState').style.display = 'none';
    document.querySelector('.kpi-section').style.display = '';
    document.querySelector('.charts').style.display = '';
    document.querySelector('.table-section').style.display = '';

    renderKPIs(rounds, null);
    renderCharts(chartData, isRound, interval);
    renderTable(recentRounds);
  } catch (e) {
    console.error('Failed to fetch data:', e);
  }
}

function renderKPIs(rounds, daily) {
  // 按产品分组
  const byTarget = {};
  rounds.forEach(r => {
    if (!byTarget[r.target]) byTarget[r.target] = [];
    byTarget[r.target].push(r);
  });

  const PRODUCT_NAMES = { doubao: '豆包', yuanbao: '元宝' };

  // 为每个产品生成一组 KPI
  const html = Object.entries(byTarget).map(([target, data]) => {
    const validRounds = data.filter(r => r.is_valid === 1);
    const totalCount = data.length;
    const validCount = validRounds.length;
    const failCount = totalCount - validCount;
    const successRate = totalCount > 0 ? ((validCount / totalCount) * 100).toFixed(1) : '0';

    const avgTTFT = validRounds.length > 0
      ? validRounds.reduce((a, r) => a + r.ttft_ms, 0) / validRounds.length : 0;
    const avgE2E = validRounds.length > 0
      ? validRounds.reduce((a, r) => a + r.e2e_latency_ms, 0) / validRounds.length : 0;

    const ttftClass = avgTTFT < 1000 ? 'good' : avgTTFT < 2000 ? 'warn' : 'bad';
    const e2eClass = avgE2E < 2500 ? 'good' : avgE2E < 3500 ? 'warn' : 'bad';
    const rateClass = parseFloat(successRate) >= 95 ? 'good' : parseFloat(successRate) >= 80 ? 'warn' : 'bad';
    const tagClass = 'product-tag-' + target;

    const name = PRODUCT_NAMES[target] || target;

    return \`
      <div class="kpi-group">
        <div class="kpi-group-header">
          <span class="product-tag \${tagClass}">\${name}</span>
        </div>
        <div class="kpi-row">
          <div class="kpi \${ttftClass}">
            <div class="label">平均 TTFT</div>
            <div class="value">\${Math.round(avgTTFT)}<span class="unit">ms</span></div>
            <div class="sub">音频结束→AI首响</div>
          </div>
          <div class="kpi \${e2eClass}">
            <div class="label">平均 E2E</div>
            <div class="value">\${Math.round(avgE2E)}<span class="unit">ms</span></div>
            <div class="sub">注入开始→AI首响</div>
          </div>
          <div class="kpi \${rateClass}">
            <div class="label">成功率</div>
            <div class="value">\${successRate}<span class="unit">%</span></div>
            <div class="sub">\${validCount} 成功 / \${failCount} 失败</div>
          </div>
          <div class="kpi">
            <div class="label">测试轮次</div>
            <div class="value">\${totalCount}</div>
            <div class="sub">近 \${document.getElementById('daysFilter').value} 天</div>
          </div>
        </div>
      </div>\`;
  }).join('');

  // 提取活跃节点列表
  const nodeSet = {};
  rounds.forEach(r => {
    const key = r.node_id || 'unknown';
    if (!nodeSet[key]) {
      nodeSet[key] = r.node_region && r.node_region !== 'local' ? r.node_region : '';
    }
  });
  const nodeLabels = Object.entries(nodeSet).map(([id, region]) =>
    region ? id + ' (' + region + ')' : id
  ).join(', ');
  const nodeHtml = nodeLabels ? '<div style="color:#94a3b8;font-size:0.8em;margin-bottom:8px;">节点: ' + nodeLabels + '</div>' : '';

  document.getElementById('kpiSection').innerHTML = nodeHtml + html;
}

function renderCharts(data, isRound, interval) {
  const INTERVAL_LABELS = { '1m': '1分钟', '5m': '5分钟', '15m': '15分钟', '1h': '1小时', '1d': '按天' };
  const subtitleRound = '每个点 = 一轮测试';
  const subtitleAgg = '聚合粒度: ' + (INTERVAL_LABELS[interval] || interval);

  // 更新图表标题
  document.querySelector('#ttftChart').closest('.chart-card').querySelector('h3').textContent =
    'TTFT 趋势 (ms) — ' + (isRound ? subtitleRound : subtitleAgg);
  document.querySelector('#e2eChart').closest('.chart-card').querySelector('h3').textContent =
    'E2E 趋势 (ms) — ' + (isRound ? subtitleRound : subtitleAgg);

  // Group by target
  const byTarget = {};
  data.forEach(r => {
    if (!byTarget[r.target]) byTarget[r.target] = [];
    byTarget[r.target].push(r);
  });

  if (isRound) {
    // 逐轮模式 — 每个点是原始值
    ttftChart.data.datasets = Object.entries(byTarget).map(([target, rows]) => {
      const colors = TARGET_COLORS[target] || TARGET_COLORS.doubao;
      return {
        label: target,
        data: rows.map(r => ({
          x: new Date(r.tested_at),
          y: r.is_valid === 1 ? r.ttft_ms : r.ttft_ms || 0,
        })),
        borderColor: colors.border,
        backgroundColor: colors.bg,
        pointBackgroundColor: rows.map(r => r.is_valid === 1 ? colors.point : colors.pointFail),
        pointRadius: rows.map(r => r.is_valid === 1 ? 3 : 5),
        pointStyle: rows.map(r => r.is_valid === 1 ? 'circle' : 'crossRot'),
        tension: 0.2, fill: false, spanGaps: true,
      };
    });
    e2eChart.data.datasets = Object.entries(byTarget).map(([target, rows]) => {
      const colors = TARGET_COLORS[target] || TARGET_COLORS.doubao;
      return {
        label: target,
        data: rows.map(r => ({
          x: new Date(r.tested_at),
          y: r.is_valid === 1 ? r.e2e_latency_ms : r.e2e_latency_ms || 0,
        })),
        borderColor: colors.border,
        backgroundColor: colors.bg,
        pointBackgroundColor: rows.map(r => r.is_valid === 1 ? colors.point : colors.pointFail),
        pointRadius: rows.map(r => r.is_valid === 1 ? 3 : 5),
        pointStyle: rows.map(r => r.is_valid === 1 ? 'circle' : 'crossRot'),
        tension: 0.2, fill: false, spanGaps: true,
      };
    });
  } else {
    // 聚合模式 — 展示 avg 线 + min/max 范围带
    const datasets_ttft = [];
    const datasets_e2e = [];
    Object.entries(byTarget).forEach(([target, rows]) => {
      const colors = TARGET_COLORS[target] || TARGET_COLORS.doubao;
      const timeKey = rows[0].time_bucket ? 'time_bucket' : 'date';
      const points = rows.map(r => new Date(r[timeKey] + (r[timeKey].length <= 10 ? 'T00:00:00' : ':00')));

      // avg 主线
      datasets_ttft.push({
        label: target + ' avg',
        data: rows.map((r, i) => ({ x: points[i], y: r.avg_ttft })),
        borderColor: colors.border, backgroundColor: 'transparent',
        pointBackgroundColor: colors.point, pointRadius: 3,
        tension: 0.3, fill: false, borderWidth: 2,
      });
      // min/max 范围带
      datasets_ttft.push({
        label: target + ' max',
        data: rows.map((r, i) => ({ x: points[i], y: r.max_ttft })),
        borderColor: 'transparent', backgroundColor: colors.bg,
        pointRadius: 0, tension: 0.3, fill: '+1', borderWidth: 0,
      });
      datasets_ttft.push({
        label: target + ' min',
        data: rows.map((r, i) => ({ x: points[i], y: r.min_ttft })),
        borderColor: 'transparent', backgroundColor: colors.bg,
        pointRadius: 0, tension: 0.3, fill: false, borderWidth: 0,
      });

      datasets_e2e.push({
        label: target + ' avg',
        data: rows.map((r, i) => ({ x: points[i], y: r.avg_e2e })),
        borderColor: colors.border, backgroundColor: 'transparent',
        pointBackgroundColor: colors.point, pointRadius: 3,
        tension: 0.3, fill: false, borderWidth: 2,
      });
      datasets_e2e.push({
        label: target + ' max',
        data: rows.map((r, i) => ({ x: points[i], y: r.max_e2e })),
        borderColor: 'transparent', backgroundColor: colors.bg,
        pointRadius: 0, tension: 0.3, fill: '+1', borderWidth: 0,
      });
      datasets_e2e.push({
        label: target + ' min',
        data: rows.map((r, i) => ({ x: points[i], y: r.min_e2e })),
        borderColor: 'transparent', backgroundColor: colors.bg,
        pointRadius: 0, tension: 0.3, fill: false, borderWidth: 0,
      });
    });

    ttftChart.data.datasets = datasets_ttft;
    e2eChart.data.datasets = datasets_e2e;
  }

  ttftChart.update();
  e2eChart.update();
}

function renderTable(rounds) {
  const tbody = document.getElementById('roundsBody');
  tbody.innerHTML = rounds.map(r => {
    const tagClass = 'tag-' + r.target;
    const time = r.tested_at ? new Date(r.tested_at).toLocaleString('zh-CN', {
      month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit'
    }) : '-';
    const statusClass = r.is_valid === 1 ? 'valid' : 'invalid';
    const statusText = r.is_valid === 1 ? '✅' : '❌';
    return \`<tr>
      <td>\${time}</td>
      <td><span class="tag \${tagClass}">\${r.target}</span></td>
      <td>\${r.node_id || '-'}\${r.node_region && r.node_region !== 'local' ? ' <span style="color:#888;font-size:0.85em;">(' + r.node_region + ')</span>' : ''}</td>
      <td>#\${r.round_num}</td>
      <td><strong>\${r.is_valid === 1 ? Math.round(r.ttft_ms) : '-'}</strong></td>
      <td>\${r.is_valid === 1 ? Math.round(r.e2e_latency_ms) : '-'}</td>
      <td class="\${statusClass}">\${statusText}</td>
      <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;color:#666;">\${r.error_msg || ''}</td>
    </tr>\`;
  }).join('');
}

// 天数 → 推荐聚合粒度联动
document.getElementById('daysFilter').addEventListener('change', function() {
  const d = parseInt(this.value);
  const intSel = document.getElementById('intervalFilter');
  if (d <= 1) intSel.value = '5m';
  else if (d <= 7) intSel.value = '1h';
  else intSel.value = '1d';
  refreshData();
});
document.getElementById('targetFilter').addEventListener('change', refreshData);
document.getElementById('intervalFilter').addEventListener('change', refreshData);

// Init
initCharts();
refreshData();
</script>
</body>
</html>`;

  return new Response(html, {
    headers: { "Content-Type": "text/html;charset=UTF-8" },
  });
}

// ─── Main Router ───

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }

    try {
      // API routes
      if (url.pathname === "/api/round" && request.method === "POST") {
        return await handleRoundUpload(request, env.DB);
      }
      if (url.pathname === "/api/report" && request.method === "POST") {
        return await handleReport(request, env.DB);
      }
      if (url.pathname === "/api/sessions" && request.method === "GET") {
        return await handleSessions(url, env.DB);
      }
      if (url.pathname === "/api/rounds" && request.method === "GET") {
        return await handleRounds(url, env.DB);
      }
      if (url.pathname === "/api/stats" && request.method === "GET") {
        return await handleStats(url, env.DB);
      }

      // Dashboard
      if (url.pathname === "/" || url.pathname === "/index.html") {
        return renderDashboard();
      }

      return jsonResp({ error: "Not found" }, 404);
    } catch (e: any) {
      console.error("Worker error:", e);
      return jsonResp({ error: e.message || "Internal error" }, 500);
    }
  },
};
