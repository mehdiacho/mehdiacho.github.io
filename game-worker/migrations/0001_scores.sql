CREATE TABLE IF NOT EXISTS runs (
  day TEXT NOT NULL,
  player TEXT NOT NULL,
  alias TEXT NOT NULL,
  cost INTEGER NOT NULL CHECK(cost >= 0),
  score INTEGER NOT NULL CHECK(score BETWEEN 0 AND 1000),
  recorded_at INTEGER NOT NULL,
  PRIMARY KEY (day, player)
);
CREATE INDEX IF NOT EXISTS runs_ranking ON runs(day, cost, recorded_at);
CREATE TABLE IF NOT EXISTS limits (
  bucket TEXT PRIMARY KEY,
  count INTEGER NOT NULL,
  expires INTEGER NOT NULL
);
