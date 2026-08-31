export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS games (
  id                INTEGER PRIMARY KEY,
  name              TEXT NOT NULL,
  year_published    INTEGER,
  thumbnail_url     TEXT,
  image_url         TEXT,
  min_players       INTEGER,
  max_players       INTEGER,
  playtime_minutes  INTEGER,
  weight            REAL,
  bgg_rating        REAL,
  categories        TEXT,
  mechanisms        TEXT,
  publisher         TEXT,
  added_at          TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS ratings (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  game_id      INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  person_name  TEXT NOT NULL,
  rating       INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 10),
  created_at   TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at   TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (game_id, person_name)
);

CREATE INDEX IF NOT EXISTS idx_ratings_game ON ratings(game_id);
CREATE INDEX IF NOT EXISTS idx_ratings_person ON ratings(person_name);
`;

export interface GameRow {
  id: number;
  name: string;
  year_published: number | null;
  thumbnail_url: string | null;
  image_url: string | null;
  min_players: number | null;
  max_players: number | null;
  playtime_minutes: number | null;
  weight: number | null;
  bgg_rating: number | null;
  categories: string | null;
  mechanisms: string | null;
  publisher: string | null;
  added_at: string;
}

export interface RatingRow {
  id: number;
  game_id: number;
  person_name: string;
  rating: number;
  created_at: string;
  updated_at: string;
}

export interface GameWithRatings extends GameRow {
  ratings: { person_name: string; rating: number }[];
  avg_rating: number | null;
  rating_count: number;
}
