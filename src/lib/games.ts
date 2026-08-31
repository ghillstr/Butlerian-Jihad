import { db } from "./db";
import { GameRow, GameWithRatings, RatingRow } from "./schema";
import { BggGameDetail } from "./bgg";

function attachRatings(game: GameRow, ratings: RatingRow[]): GameWithRatings {
  const gameRatings = ratings.filter((r) => r.game_id === game.id);
  const avg =
    gameRatings.length > 0
      ? gameRatings.reduce((sum, r) => sum + r.rating, 0) / gameRatings.length
      : null;
  return {
    ...game,
    ratings: gameRatings.map((r) => ({ person_name: r.person_name, rating: r.rating })),
    avg_rating: avg,
    rating_count: gameRatings.length,
  };
}

export function getAllGamesWithRatings(): GameWithRatings[] {
  const games = db.prepare("SELECT * FROM games ORDER BY name COLLATE NOCASE").all() as GameRow[];
  const ratings = db.prepare("SELECT * FROM ratings").all() as RatingRow[];
  return games.map((g) => attachRatings(g, ratings));
}

export function getGameWithRatings(id: number): GameWithRatings | null {
  const game = db.prepare("SELECT * FROM games WHERE id = ?").get(id) as GameRow | undefined;
  if (!game) return null;
  const ratings = db.prepare("SELECT * FROM ratings WHERE game_id = ?").all(id) as RatingRow[];
  return attachRatings(game, ratings);
}

const upsertGameStmt = db.prepare(`
  INSERT INTO games (
    id, name, year_published, thumbnail_url, image_url, min_players, max_players,
    playtime_minutes, weight, bgg_rating, categories, mechanisms, publisher
  ) VALUES (@id, @name, @yearPublished, @thumbnailUrl, @imageUrl, @minPlayers, @maxPlayers,
    @playtimeMinutes, @weight, @bggRating, @categories, @mechanisms, @publisher)
  ON CONFLICT(id) DO UPDATE SET
    name = excluded.name,
    year_published = excluded.year_published,
    thumbnail_url = excluded.thumbnail_url,
    image_url = excluded.image_url,
    min_players = excluded.min_players,
    max_players = excluded.max_players,
    playtime_minutes = excluded.playtime_minutes,
    weight = excluded.weight,
    bgg_rating = excluded.bgg_rating,
    categories = excluded.categories,
    mechanisms = excluded.mechanisms,
    publisher = excluded.publisher
`);

export function upsertGame(detail: BggGameDetail, publisherOverride?: string): void {
  upsertGameStmt.run({
    id: detail.id,
    name: detail.name,
    yearPublished: detail.yearPublished,
    thumbnailUrl: detail.thumbnailUrl,
    imageUrl: detail.imageUrl,
    minPlayers: detail.minPlayers,
    maxPlayers: detail.maxPlayers,
    playtimeMinutes: detail.playtimeMinutes,
    weight: detail.weight,
    bggRating: detail.bggRating,
    categories: JSON.stringify(detail.categories),
    mechanisms: JSON.stringify(detail.mechanisms),
    publisher: publisherOverride ?? detail.publishers[0] ?? null,
  });
}

export function parseJsonArray(value: string | null): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
