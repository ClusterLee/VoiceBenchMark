-- Voice Benchmark D1 Schema
-- 测试会话表：每次跑完测试生成一条
CREATE TABLE IF NOT EXISTS test_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL UNIQUE,        -- UUID, 客户端生成
  node_id TEXT NOT NULL DEFAULT 'local',  -- 节点标识
  node_region TEXT NOT NULL DEFAULT 'local', -- 节点区域
  target TEXT NOT NULL,                   -- doubao | yuanbao
  tool_version TEXT DEFAULT '1.0.0',
  total_rounds INTEGER NOT NULL,
  valid_rounds INTEGER NOT NULL,
  invalid_rounds INTEGER NOT NULL DEFAULT 0,
  -- TTFT 统计 (ms)
  ttft_mean REAL,
  ttft_median REAL,
  ttft_p95 REAL,
  ttft_min REAL,
  ttft_max REAL,
  ttft_std REAL,
  -- E2E 统计 (ms)
  e2e_mean REAL,
  e2e_median REAL,
  e2e_p95 REAL,
  e2e_min REAL,
  e2e_max REAL,
  e2e_std REAL,
  -- 时间
  tested_at TEXT NOT NULL,                -- ISO 8601, 测试执行时间
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 每轮明细表
CREATE TABLE IF NOT EXISTS test_rounds (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,               -- 关联 test_sessions
  target TEXT NOT NULL,
  round_num INTEGER NOT NULL,
  ttft_ms REAL,
  e2e_latency_ms REAL,
  total_response_time_ms REAL,
  user_speech_start REAL,
  user_speech_end REAL,
  ai_speech_start REAL,
  ai_speech_end REAL,
  is_valid INTEGER NOT NULL DEFAULT 1,    -- 0/1
  error_msg TEXT DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (session_id) REFERENCES test_sessions(session_id)
);

-- 索引：按时间+目标查询
CREATE INDEX IF NOT EXISTS idx_sessions_target_time ON test_sessions(target, tested_at);
CREATE INDEX IF NOT EXISTS idx_sessions_node ON test_sessions(node_id, tested_at);
CREATE INDEX IF NOT EXISTS idx_rounds_session ON test_rounds(session_id);
