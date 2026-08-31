import { getAllGamesWithRatings } from "./games";
import { GameWithRatings } from "./schema";

export interface RecommendationCandidate {
  gameId: number;
  name: string;
  minPlayers: number | null;
  maxPlayers: number | null;
  playtimeMinutes: number | null;
  weight: number | null;
  bggRating: number | null;
  groupAvgRating: number | null;
  attendeeRatings: { person: string; rating: number }[];
  bucket: "crowd-pleaser" | "wildcard";
}

const CROWD_PLEASER_COUNT = 8;
const WILDCARD_COUNT = 3;
const WILDCARD_BGG_THRESHOLD = 7.5;

function fitsGroupSize(game: GameWithRatings, attendeeCount: number): boolean {
  if (game.min_players && attendeeCount < game.min_players) return false;
  if (game.max_players && attendeeCount > game.max_players) return false;
  return true;
}

/**
 * Deterministic candidate shortlist: games the present attendees already rate
 * highly, plus a few well-regarded-on-BGG wildcards nobody present has rated yet.
 * No play-history/session tracking is used here by design (out of scope for v1).
 */
export function buildCandidateShortlist(attendees: string[]): RecommendationCandidate[] {
  const games = getAllGamesWithRatings();
  const attendeeSet = new Set(attendees.map((a) => a.trim()).filter(Boolean));

  const crowdPleasers: RecommendationCandidate[] = [];
  const wildcards: RecommendationCandidate[] = [];

  for (const game of games) {
    if (!fitsGroupSize(game, attendeeSet.size || 1)) continue;

    const attendeeRatings = game.ratings
      .filter((r) => attendeeSet.has(r.person_name))
      .map((r) => ({ person: r.person_name, rating: r.rating }));

    const base = {
      gameId: game.id,
      name: game.name,
      minPlayers: game.min_players,
      maxPlayers: game.max_players,
      playtimeMinutes: game.playtime_minutes,
      weight: game.weight,
      bggRating: game.bgg_rating,
      attendeeRatings,
    };

    if (attendeeRatings.length > 0) {
      const groupAvgRating =
        attendeeRatings.reduce((s, r) => s + r.rating, 0) / attendeeRatings.length;
      crowdPleasers.push({ ...base, groupAvgRating, bucket: "crowd-pleaser" });
    } else if (game.bgg_rating && game.bgg_rating >= WILDCARD_BGG_THRESHOLD) {
      wildcards.push({ ...base, groupAvgRating: null, bucket: "wildcard" });
    }
  }

  crowdPleasers.sort((a, b) => (b.groupAvgRating ?? 0) - (a.groupAvgRating ?? 0));
  wildcards.sort((a, b) => (b.bggRating ?? 0) - (a.bggRating ?? 0));

  return [
    ...crowdPleasers.slice(0, CROWD_PLEASER_COUNT),
    ...wildcards.slice(0, WILDCARD_COUNT),
  ];
}
