import { getAllGamesWithRatings } from "./games";
import { parseJsonArray } from "./games";

export const CHAT_SYSTEM_INSTRUCTIONS = `You are the game-night assistant for a small group of friends using
"One Step Closer to Butlerian Jihad", their board game ranking app. You can:
- Answer general board game questions (rules, complexity, similar games, new releases) using web search when helpful.
- Recommend games from the group's own library below, reasoning over each person's individual ratings.

When recommending from the library, only reference games that actually appear in the library context and
be explicit about whose ratings you're basing a suggestion on. If nobody in the library context has rated
something relevant, say so plainly rather than inventing a rating. Keep answers conversational and concise.`;

/**
 * Serialize the whole games+ratings library into a compact text block for
 * injection into the chat system prompt. At friend-group scale (dozens to
 * low hundreds of games) this fits comfortably in context - no vector store needed.
 */
export function buildLibraryContext(): string {
  const games = getAllGamesWithRatings();
  if (games.length === 0) {
    return "The group's library is currently empty - no games have been added yet.";
  }

  const lines = games.map((g) => {
    const players =
      g.min_players && g.max_players
        ? `${g.min_players}-${g.max_players} players`
        : "player count unknown";
    const time = g.playtime_minutes ? `${g.playtime_minutes} min` : "playtime unknown";
    const weight = g.weight ? `weight ${g.weight.toFixed(1)}/5` : "weight unknown";
    const bgg = g.bgg_rating ? `BGG avg ${g.bgg_rating.toFixed(1)}` : "no BGG rating";
    const categories = parseJsonArray(g.categories).join(", ") || "uncategorized";
    const groupRatings =
      g.ratings.length > 0
        ? g.ratings.map((r) => `${r.person_name}: ${r.rating}/10`).join(", ")
        : "no group ratings yet";
    const groupAvg = g.avg_rating ? ` (group avg ${g.avg_rating.toFixed(1)}/10)` : "";

    return `- ${g.name}${g.publisher ? ` [${g.publisher}]` : ""} | ${players} | ${time} | ${weight} | ${bgg} | ${categories}\n  Group ratings: ${groupRatings}${groupAvg}`;
  });

  return `The group's current game library (${games.length} games):\n\n${lines.join("\n")}`;
}
