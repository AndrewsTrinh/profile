CREATE TABLE IF NOT EXISTS chat_logs (
  session_id TEXT PRIMARY KEY,
  summary TEXT,
  message_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
