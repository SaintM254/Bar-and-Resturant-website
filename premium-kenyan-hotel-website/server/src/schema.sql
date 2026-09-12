-- Acacia House backend schema (Postgres / Neon).
-- Applied automatically on boot when DATABASE_URL is set (see pgStore.js).
-- Dates are stored as 'YYYY-MM-DD' text so they compare and sort correctly
-- with zero timezone surprises.

CREATE TABLE IF NOT EXISTS reservations (
  id            TEXT PRIMARY KEY,
  ref           TEXT UNIQUE NOT NULL,
  name          TEXT NOT NULL,
  phone         TEXT NOT NULL,
  date          TEXT NOT NULL, -- 'YYYY-MM-DD', enforced by app validation
  "time"        TEXT NOT NULL,
  guests_label  TEXT NOT NULL,
  guests_count  INTEGER NOT NULL CHECK (guests_count > 0),
  request       TEXT NOT NULL DEFAULT '',
  status        TEXT NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending','confirmed','seated','cancelled','no-show')),
  source        TEXT NOT NULL DEFAULT 'website',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_reservations_date_time ON reservations (date, "time");
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations (status);

CREATE TABLE IF NOT EXISTS menu_items (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  "desc"      TEXT NOT NULL,
  price_kes   INTEGER NOT NULL CHECK (price_kes >= 0),
  pexels_id   INTEGER,
  image_url   TEXT,
  category    TEXT NOT NULL CHECK (category IN ('featured','grill','sides','mornings')),
  available   BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS drinks (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  "desc"      TEXT NOT NULL,
  price_kes   INTEGER NOT NULL CHECK (price_kes >= 0),
  available   BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS gallery_images (
  id        TEXT PRIMARY KEY,
  caption   TEXT NOT NULL,
  category  TEXT NOT NULL,
  path      TEXT NOT NULL,
  position  INTEGER NOT NULL DEFAULT 0,
  visible   BOOLEAN NOT NULL DEFAULT TRUE
);
CREATE INDEX IF NOT EXISTS idx_gallery_visible ON gallery_images (visible, position);
