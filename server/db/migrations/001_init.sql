-- CookBook initial schema
-- Applied automatically on server start; tracked in schema_migrations.

CREATE TABLE users (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  handle              TEXT    NOT NULL UNIQUE,
  display_name        TEXT    NOT NULL,
  verification_status TEXT    NOT NULL DEFAULT 'Pending'
                              CHECK (verification_status IN ('Verified', 'Unverified', 'Pending')),
  has_ban             INTEGER NOT NULL DEFAULT 0 CHECK (has_ban IN (0, 1)),
  created_at          TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE recipes (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  name         TEXT    NOT NULL,
  category     TEXT    NOT NULL,
  author       TEXT    NOT NULL,
  ingredients  TEXT    NOT NULL DEFAULT '[]',
  instructions TEXT    NOT NULL DEFAULT '',
  rating       REAL    NOT NULL DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  ranking      INTEGER NOT NULL DEFAULT 0 CHECK (ranking >= 0 AND ranking <= 100),
  image_url    TEXT,
  created_at   TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_recipes_ranking ON recipes (ranking DESC, name ASC);

CREATE TABLE comments (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  recipe_id  INTEGER NOT NULL REFERENCES recipes (id) ON DELETE CASCADE,
  user_id    INTEGER REFERENCES users (id) ON DELETE SET NULL,
  author     TEXT    NOT NULL,
  text       TEXT    NOT NULL CHECK (length(trim(text)) > 0),
  created_at TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_comments_recipe ON comments (recipe_id, created_at DESC);

CREATE TABLE job_listings (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  posted_by        INTEGER REFERENCES users (id) ON DELETE SET NULL,
  title            TEXT    NOT NULL,
  description      TEXT    NOT NULL,
  location         TEXT    NOT NULL,
  min_compensation INTEGER CHECK (min_compensation >= 0),
  max_compensation INTEGER,
  employment_type  TEXT    NOT NULL
                           CHECK (employment_type IN ('Full-time', 'Part-time', 'Contract')),
  skills           TEXT    NOT NULL DEFAULT '[]',
  status           TEXT    NOT NULL DEFAULT 'draft'
                           CHECK (status IN ('draft', 'published')),
  created_at       TEXT    NOT NULL DEFAULT (datetime('now')),

  CHECK (max_compensation IS NULL OR min_compensation IS NULL
         OR max_compensation >= min_compensation)
);

CREATE INDEX idx_jobs_created ON job_listings (created_at DESC);
