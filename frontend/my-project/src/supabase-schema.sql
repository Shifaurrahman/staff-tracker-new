-- ============================================================
-- Staff Tracker — Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Staff members table
CREATE TABLE IF NOT EXISTS staff (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL UNIQUE,
  color_idx  INT  NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Messages table (replaces "updates" — supports multiple per day)
CREATE TABLE IF NOT EXISTS messages (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id   UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  text       TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Admin replies table
CREATE TABLE IF NOT EXISTS replies (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  text       TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_messages_staff_id   ON messages(staff_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_replies_message_id  ON replies(message_id);

-- ============================================================
-- Disable Row Level Security (simple password-based admin)
-- ============================================================
ALTER TABLE staff    DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE replies  DISABLE ROW LEVEL SECURITY;

-- ============================================================
-- View: messages with staff name + reply (for easy querying)
-- ============================================================
CREATE OR REPLACE VIEW messages_full AS
SELECT
  m.id,
  m.text,
  m.created_at,
  s.id         AS staff_id,
  s.name       AS staff_name,
  s.color_idx,
  r.id         AS reply_id,
  r.text       AS reply_text,
  r.created_at AS reply_at
FROM messages m
JOIN staff s ON s.id = m.staff_id
LEFT JOIN replies r ON r.message_id = m.id
ORDER BY m.created_at DESC;


ALTER TABLE staff ADD COLUMN IF NOT EXISTS passcode TEXT;

UPDATE staff
SET passcode = LPAD(FLOOR(RANDOM() * 90000 + 10000)::TEXT, 5, '0')
WHERE passcode IS NULL AND name != 'Team Lead';