-- Run once against the Neon database before rate limiting can work:
--   psql "$DATABASE_URL" -f scripts/init-neon-schema.sql
-- or paste into the Neon console's SQL editor.

CREATE TABLE IF NOT EXISTS rate_limit_hits (
  id BIGSERIAL PRIMARY KEY,
  bucket TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rate_limit_hits_bucket_created
  ON rate_limit_hits (bucket, created_at);

-- BM25 RAG corpus chunks (resume_search / mphil_research). Replaces the old
-- src/data/*-corpus.json files.
CREATE TABLE IF NOT EXISTS corpus_chunks (
  id BIGSERIAL PRIMARY KEY,
  corpus TEXT NOT NULL,
  text TEXT NOT NULL,
  chunk_index INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_corpus_chunks_corpus ON corpus_chunks (corpus);

-- Confirmed bookings, persisted alongside the real Google Calendar event
-- created for each one.
CREATE TABLE IF NOT EXISTS bookings (
  id BIGSERIAL PRIMARY KEY,
  visitor_name TEXT NOT NULL,
  visitor_email TEXT NOT NULL,
  visitor_phone TEXT,
  start_iso TIMESTAMPTZ NOT NULL,
  duration_minutes INT NOT NULL,
  location TEXT,
  note TEXT,
  calendar_event_id TEXT,
  calendar_html_link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bookings_email ON bookings (visitor_email);
CREATE INDEX IF NOT EXISTS idx_bookings_phone ON bookings (visitor_phone);
