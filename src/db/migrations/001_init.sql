PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS profile (
  id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  created_at TEXT NOT NULL,
  last_opened_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS courses (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  color_hex TEXT NOT NULL,
  icon TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS assignments (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  notes TEXT,
  due_at TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed')),
  completed_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_assignments_due_at ON assignments(due_at);
CREATE INDEX IF NOT EXISTS idx_assignments_status ON assignments(status);
CREATE INDEX IF NOT EXISTS idx_assignments_course ON assignments(course_id);

CREATE TABLE IF NOT EXISTS exams (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  exam_at TEXT NOT NULL,
  weight_percent REAL NOT NULL CHECK (weight_percent >= 0 AND weight_percent <= 100),
  notes TEXT,
  status TEXT NOT NULL CHECK (status IN ('upcoming', 'completed')),
  completed_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_exams_exam_at ON exams(exam_at);
CREATE INDEX IF NOT EXISTS idx_exams_status ON exams(status);
CREATE INDEX IF NOT EXISTS idx_exams_course ON exams(course_id);

CREATE TABLE IF NOT EXISTS app_settings (
  id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  backup_enabled INTEGER NOT NULL DEFAULT 0,
  haptics_enabled INTEGER NOT NULL DEFAULT 1,
  celebration_effects_enabled INTEGER NOT NULL DEFAULT 1,
  active_theme TEXT NOT NULL DEFAULT 'light',
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS notification_prefs (
  id TEXT PRIMARY KEY,
  notifications_enabled INTEGER NOT NULL DEFAULT 1,
  assignment_reminders_enabled INTEGER NOT NULL DEFAULT 1,
  exam_reminders_enabled INTEGER NOT NULL DEFAULT 1,
  streak_nudges_enabled INTEGER NOT NULL DEFAULT 1,
  reminder_style TEXT NOT NULL DEFAULT 'standard' CHECK (reminder_style IN ('standard', 'focused')),
  permission_granted INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS subscription_state (
  id TEXT PRIMARY KEY,
  is_premium INTEGER NOT NULL DEFAULT 0,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'monthly', 'yearly')),
  product_id TEXT,
  expires_at TEXT,
  last_verified_at TEXT,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS gamification_state (
  id TEXT PRIMARY KEY,
  points_total INTEGER NOT NULL DEFAULT 0,
  current_level INTEGER NOT NULL DEFAULT 1,
  streak_days INTEGER NOT NULL DEFAULT 0,
  last_completion_date TEXT,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS points_log (
  id TEXT PRIMARY KEY,
  source TEXT NOT NULL,
  source_id TEXT,
  points_delta INTEGER NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_points_log_created_at ON points_log(created_at);

CREATE TABLE IF NOT EXISTS badges (
  id TEXT PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  is_premium_badge INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS user_badges (
  id TEXT PRIMARY KEY,
  badge_id TEXT NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  unlocked_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge ON user_badges(badge_id);

CREATE TABLE IF NOT EXISTS calculator_usage (
  id TEXT PRIMARY KEY,
  month_key TEXT NOT NULL UNIQUE,
  count INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS calculator_history (
  id TEXT PRIMARY KEY,
  current_grade REAL NOT NULL,
  exam_weight REAL NOT NULL,
  target_grade REAL NOT NULL,
  required_score REAL NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_calculator_history_created_at ON calculator_history(created_at);

INSERT OR IGNORE INTO app_settings (
  id,
  display_name,
  backup_enabled,
  haptics_enabled,
  celebration_effects_enabled,
  active_theme,
  updated_at
) VALUES (
  'singleton',
  'Guest Student',
  0,
  1,
  1,
  'light',
  CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO notification_prefs (
  id,
  notifications_enabled,
  assignment_reminders_enabled,
  exam_reminders_enabled,
  streak_nudges_enabled,
  reminder_style,
  permission_granted,
  updated_at
) VALUES (
  'singleton',
  1,
  1,
  1,
  1,
  'standard',
  1,
  CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO subscription_state (
  id,
  is_premium,
  plan,
  product_id,
  expires_at,
  last_verified_at,
  updated_at
) VALUES (
  'singleton',
  0,
  'free',
  NULL,
  NULL,
  NULL,
  CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO gamification_state (
  id,
  points_total,
  current_level,
  streak_days,
  last_completion_date,
  updated_at
) VALUES (
  'singleton',
  0,
  1,
  0,
  NULL,
  CURRENT_TIMESTAMP
);
