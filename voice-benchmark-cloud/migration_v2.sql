-- Migration v2: 支持单轮实时上报
-- test_rounds 表新增字段，使单轮数据可独立查询

ALTER TABLE test_rounds ADD COLUMN node_id TEXT NOT NULL DEFAULT 'local';
ALTER TABLE test_rounds ADD COLUMN node_region TEXT NOT NULL DEFAULT 'local';
ALTER TABLE test_rounds ADD COLUMN tested_at TEXT NOT NULL DEFAULT '';

-- 回填已有数据：从 session 表拉取 node_id/node_region/tested_at
UPDATE test_rounds SET
  node_id = (SELECT s.node_id FROM test_sessions s WHERE s.session_id = test_rounds.session_id),
  node_region = (SELECT s.node_region FROM test_sessions s WHERE s.session_id = test_rounds.session_id),
  tested_at = (SELECT s.tested_at FROM test_sessions s WHERE s.session_id = test_rounds.session_id)
WHERE EXISTS (SELECT 1 FROM test_sessions s WHERE s.session_id = test_rounds.session_id);

-- 新索引：按时间+目标查询单轮数据
CREATE INDEX IF NOT EXISTS idx_rounds_target_time ON test_rounds(target, tested_at);
CREATE INDEX IF NOT EXISTS idx_rounds_node_time ON test_rounds(node_id, tested_at);
