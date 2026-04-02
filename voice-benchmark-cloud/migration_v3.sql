-- Migration v3: 去掉 test_rounds 的外键约束，支持独立单轮上报
-- SQLite 不支持 ALTER TABLE DROP CONSTRAINT，需要重建表

-- 1. 创建新表（无外键约束）
CREATE TABLE IF NOT EXISTS test_rounds_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  target TEXT NOT NULL,
  round_num INTEGER NOT NULL,
  ttft_ms REAL,
  e2e_latency_ms REAL,
  total_response_time_ms REAL,
  user_speech_start REAL,
  user_speech_end REAL,
  ai_speech_start REAL,
  ai_speech_end REAL,
  is_valid INTEGER NOT NULL DEFAULT 1,
  error_msg TEXT DEFAULT '',
  node_id TEXT NOT NULL DEFAULT 'local',
  node_region TEXT NOT NULL DEFAULT 'local',
  tested_at TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 2. 迁移数据
INSERT INTO test_rounds_new
  SELECT * FROM test_rounds;

-- 3. 替换表
DROP TABLE test_rounds;
ALTER TABLE test_rounds_new RENAME TO test_rounds;

-- 4. 重建索引
CREATE INDEX IF NOT EXISTS idx_rounds_session ON test_rounds(session_id);
CREATE INDEX IF NOT EXISTS idx_rounds_target_time ON test_rounds(target, tested_at);
CREATE INDEX IF NOT EXISTS idx_rounds_node_time ON test_rounds(node_id, tested_at);
