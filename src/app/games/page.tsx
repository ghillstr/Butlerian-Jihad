import Link from "next/link";
import { getAllGamesWithRatings } from "@/lib/games";
import { getSession } from "@/lib/auth";
import GameCard from "@/components/GameCard";

export default async function GamesPage() {
  const session = await getSession();
  const games = getAllGamesWithRatings();

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-ink">Game Library</h1>
        <Link href="/games/import" className="btn">
          Add a game
        </Link>
      </div>
      {games.length === 0 ? (
        <p className="text-dune">
          No games yet.{" "}
          <Link href="/games/import" className="underline">
            Add your first one.
          </Link>
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {games.map((g) => (
            <GameCard key={g.id} game={g} currentUser={session.displayName!} />
          ))}
        </div>
      )}
    </main>
  );
}
