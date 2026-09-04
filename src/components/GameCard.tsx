"use client";

import Link from "next/link";
import { GameWithRatings } from "@/lib/schema";
import RateControl from "./RateControl";

function parseJsonArray(value: string | null): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function GameCard({
  game,
  currentUser,
}: {
  game: GameWithRatings;
  currentUser: string;
}) {
  const myRating = game.ratings.find((r) => r.person_name === currentUser)?.rating ?? null;
  const categories = parseJsonArray(game.categories);

  return (
    <div className="card flex flex-col overflow-hidden">
      <Link href={`/games/${game.id}`} className="block">
        {game.thumbnail_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={game.thumbnail_url}
            alt={game.name}
            className="h-40 w-full object-cover"
          />
        ) : (
          <div className="flex h-40 w-full items-center justify-center bg-parchment text-dune">
            No image
          </div>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <Link href={`/games/${game.id}`} className="font-medium text-ink hover:underline">
          {game.name}
        </Link>
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-dune">
          {game.min_players && game.max_players && (
            <span>
              {game.min_players}–{game.max_players} players
            </span>
          )}
          {game.playtime_minutes && <span>{game.playtime_minutes} min</span>}
          {game.publisher && <span>{game.publisher}</span>}
        </div>
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {categories.slice(0, 3).map((c) => (
              <span key={c} className="rounded bg-parchment px-1.5 py-0.5 text-xs text-dune">
                {c}
              </span>
            ))}
          </div>
        )}
        <div className="mt-auto pt-2 text-sm">
          <div className="mb-1 flex items-center justify-between text-xs text-dune">
            <span>
              Group avg: {game.avg_rating ? `${game.avg_rating.toFixed(1)}/10` : "—"} (
              {game.rating_count})
            </span>
            <span>BGG: {game.bgg_rating ? game.bgg_rating.toFixed(1) : "—"}</span>
          </div>
          <RateControl gameId={game.id} currentRating={myRating} />
        </div>
      </div>
    </div>
  );
}
