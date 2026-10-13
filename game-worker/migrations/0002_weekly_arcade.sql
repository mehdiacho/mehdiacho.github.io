-- Weekly arcade: one best score per player per ISO week, and a permanent
-- hall of fame. The old daily `runs` table is left alone; nothing reads it.
CREATE TABLE IF NOT EXISTS scores (
  week TEXT NOT NULL,
  game TEXT NOT NULL,
  player TEXT NOT NULL,
  alias TEXT NOT NULL,
  score INTEGER NOT NULL CHECK(score BETWEEN 0 AND 1000000),
  recorded_at INTEGER NOT NULL,
  PRIMARY KEY (week, player)
);
CREATE INDEX IF NOT EXISTS scores_ranking ON scores(week, score DESC, recorded_at);
CREATE TABLE IF NOT EXISTS champions (
  week TEXT NOT NULL,
  game TEXT NOT NULL,
  alias TEXT NOT NULL,
  score INTEGER NOT NULL,
  recorded_at INTEGER NOT NULL,
  PRIMARY KEY (week, alias)
);
