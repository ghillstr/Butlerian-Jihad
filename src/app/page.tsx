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

      <section className="mb-10">
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

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink">Browse the library</h2>
          {games.length > 0 && (
            <Link href="/games" className="text-sm text-dune hover:underline">
              View all →
            </Link>
          )}
        </div>
        {games.length === 0 ? (
          <p className="text-sm text-dune">
            No games yet. <Link href="/games/import" className="underline">Add some</Link> to start
            browsing.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {games.slice(0, 12).map((g) => (
              <Link
                key={g.id}
                href={`/games/${g.id}`}
                className="card block overflow-hidden text-sm"
              >
                {g.thumbnail_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={g.thumbnail_url}
                    alt={g.name}
                    className="h-32 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-32 w-full items-center justify-center bg-parchment text-dune">
                    No image
                  </div>
                )}
                <div className="p-3">
                  <p className="mb-1 truncate font-medium text-ink">{g.name}</p>
                  <div className="flex items-center justify-between text-xs text-dune">
                    <span>{g.publisher ?? ""}</span>
                    <span className="font-medium text-spice">
                      {g.bgg_rating ? `${g.bgg_rating.toFixed(1)}/10 BGG` : "—"}
                    </span>
                  </div>
                  <div className="mt-0.5 flex items-center justify-between text-xs text-dune">
                    <span>Group</span>
                    <span className="font-medium text-spice">
                      {g.avg_rating ? `${g.avg_rating.toFixed(1)}/10` : "—"} ({g.rating_count})
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
