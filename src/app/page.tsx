import Link from "next/link";
import { getAllGamesWithRatings } from "@/lib/games";
import { getSession } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await getSession();
  const games = getAllGamesWithRatings();

  const topRated = [...games]
    .filter((g) => g.avg_rating !== null)
    .sort((a, b) => (b.avg_rating ?? 0) - (a.avg_rating ?? 0))
    .slice(0, 5);

  const unrated = games.filter((g) => g.rating_count === 0).length;

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-1 text-2xl font-semibold text-ink">
        Welcome back, {session.displayName}
      </h1>
      <p className="mb-8 text-sm text-dune">
        {games.length} game{games.length === 1 ? "" : "s"} in the library
        {unrated > 0 ? `, ${unrated} waiting for ratings` : ""}.
      </p>

      <div className="mb-8 flex flex-wrap gap-3">
        <Link href="/recommend" className="btn">
          What should we play tonight?
        </Link>
        <Link href="/games/import" className="btn-secondary">
          Add a game
        </Link>
        <Link href="/chat" className="btn-secondary">
          Ask the assistant
        </Link>
      </div>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-ink">Top rated</h2>
        {topRated.length === 0 ? (
          <p className="text-sm text-dune">
            No ratings yet. <Link href="/games" className="underline">Rate some games</Link> to see
            your group&apos;s favorites here.
          </p>
        ) : (
          <ul className="divide-y divide-dune/10">
            {topRated.map((g) => (
              <li key={g.id} className="flex items-center justify-between py-2 text-sm">
                <Link href={`/games/${g.id}`} className="hover:underline">
                  {g.name}
                </Link>
                <span className="font-medium text-spice">{g.avg_rating!.toFixed(1)}/10</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
