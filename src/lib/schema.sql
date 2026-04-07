-- ==============================================
-- SpellBound Database Schema
-- ==============================================
-- This schema supports a gamified learning app
-- for children. It tracks spelling lists, maths
-- progress, achievements, and app settings.
--
-- All tables use IF NOT EXISTS for safe re-runs.
-- The schema is executed on every app start via
-- initSchema() in db.ts.
-- ==============================================

-- User profiles. Currently single-profile, but
-- designed for future multi-child support.
-- Default profile "Learner" is seeded on first run
-- by seedDefaults() in db.ts.
CREATE TABLE IF NOT EXISTS profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL DEFAULT 'Learner',
  avatar TEXT DEFAULT 'sprout',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Weekly spelling word lists. Each list belongs to
-- a profile and can be active (currently in use),
-- archived (completed/old), or neither.
-- Only one list should be active per profile at a time.
-- Non-archived lists appear in the admin panel;
-- the active list is used by spelling games.
CREATE TABLE IF NOT EXISTS spelling_lists (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  profile_id INTEGER REFERENCES profiles(id),
  name TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_active INTEGER DEFAULT 0,   -- 0 = inactive, 1 = active
  archived INTEGER DEFAULT 0     -- 0 = visible, 1 = archived
);

-- Individual spelling words within a list.
-- Each word has an optional hint (e.g. "a type of fruit").
-- Words are deleted when their parent list is deleted
-- (ON DELETE CASCADE).
CREATE TABLE IF NOT EXISTS spelling_words (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  list_id INTEGER REFERENCES spelling_lists(id) ON DELETE CASCADE,
  word TEXT NOT NULL,
  hint TEXT,                     -- optional clue shown during games
  UNIQUE(list_id, word)          -- prevent duplicate words within a list
);

-- Learning activity log. Every correct answer, hint
-- usage, or skip is recorded here. This is the source
-- of truth for all progress statistics and achievement
-- calculations.
--
-- activity_type: identifies the game (e.g. "spelling_builder",
--   "maths_bubbles"). See docs/api.md for the full list.
-- activity_ref: what was practised (e.g. "apple", "7x8")
-- result: one of "correct", "helped", or "skipped"
CREATE TABLE IF NOT EXISTS progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  profile_id INTEGER REFERENCES profiles(id),
  activity_type TEXT NOT NULL,
  activity_ref TEXT,
  result TEXT NOT NULL,          -- 'correct' | 'helped' | 'skipped'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Unlocked achievement badges. Each achievement can
-- only be unlocked once per profile (enforced by the
-- UNIQUE constraint). Achievement definitions live in
-- src/lib/achievements.ts — this table just records
-- which ones have been earned and when.
CREATE TABLE IF NOT EXISTS achievements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  profile_id INTEGER REFERENCES profiles(id),
  achievement_key TEXT NOT NULL,
  unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(profile_id, achievement_key)
);

-- Key-value app settings. Used for admin password,
-- feature flags, and any other configuration.
-- The admin_password value is stored as a bcrypt hash.
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_progress_profile ON progress(profile_id);
CREATE INDEX IF NOT EXISTS idx_progress_type ON progress(activity_type);
CREATE INDEX IF NOT EXISTS idx_progress_created ON progress(created_at);
CREATE INDEX IF NOT EXISTS idx_spelling_lists_profile_active ON spelling_lists(profile_id, is_active);
CREATE INDEX IF NOT EXISTS idx_spelling_words_list ON spelling_words(list_id);
CREATE INDEX IF NOT EXISTS idx_achievements_profile ON achievements(profile_id);

-- Student feedback messages. Public submission,
-- admin-only viewing. Simple text feedback with timestamp.
CREATE TABLE IF NOT EXISTS feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  message TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
