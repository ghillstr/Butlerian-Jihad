import Link from "next/link";
import { notFound } from "next/navigation";
import { getGameWithRatings, parseJsonArray } from "@/lib/games";
import { getSession } from "@/lib/auth";
import RateControl from "@/components/RateControl";

export default async function GameDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const game = getGameWithRatings(Number(id));
  if (!game) notFound();

  const session = await getSession();
  const myRating = game.ratings.find((r) => r.person_name === session.displayName)?.rating ?? null;
  const categories = parseJsonArray(game.categories);
  const mechanisms = parseJsonArray(game.mechanisms);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <Link href="/games" className="text-sm text-dune hover:underline">
        ← Back to library
      </Link>

      <div className="mt-4 flex flex-col gap-6 sm:flex-row">
        {game.image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={game.image_url}
            alt={game.name}
            className="h-56 w-56 flex-shrink-0 rounded-lg object-cover"
          />
        )}
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-ink">
            {game.name}
            {game.year_published ? (
              <span className="ml-2 text-base font-normal text-dune">({game.year_published})</span>
            ) : null}
          </h1>
          {game.publisher && <p className="mt-1 text-sm text-dune">{game.publisher}</p>}

          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-dune">Players</dt>
              <dd>
                {game.min_players && game.max_players
                  ? `${game.min_players}–${game.max_players}`
                  : "Unknown"}
              </dd>
            </div>
            <div>
              <dt className="text-dune">Playtime</dt>
              <dd>{game.playtime_minutes ? `${game.playtime_minutes} min` : "Unknown"}</dd>
            </div>
            <div>
              <dt className="text-dune">Weight</dt>
              <dd>{game.weight ? `${game.weight.toFixed(1)} / 5` : "Unknown"}</dd>
            </div>
            <div>
              <dt className="text-dune">BGG rating</dt>
              <dd>{game.bgg_rating ? game.bgg_rating.toFixed(1) : "Unknown"}</dd>
            </div>
          </dl>

          {categories.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1">
              {categories.map((c) => (
                <span key={c} className="rounded bg-parchment px-2 py-0.5 text-xs text-dune">
                  {c}
                </span>
              ))}
            </div>
          )}
          {mechanisms.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {mechanisms.map((m) => (
                <span key={m} className="rounded border border-dune/30 px-2 py-0.5 text-xs text-dune">
                  {m}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <section className="card mt-8 p-6">
        <h2 className="mb-3 text-lg font-semibold text-ink">Your rating</h2>
        <RateControl gameId={game.id} currentRating={myRating} />
      </section>

      <section className="card mt-6 p-6">
        <h2 className="mb-3 text-lg font-semibold text-ink">
          Group ratings{" "}
          <span className="font-normal text-dune">
            (avg {game.avg_rating ? game.avg_rating.toFixed(1) : "—"}, {game.rating_count} rated)
          </span>
        </h2>
        {game.ratings.length === 0 ? (
          <p className="text-sm text-dune">Nobody has rated this yet.</p>
        ) : (
          <ul className="divide-y divide-dune/10">
            {game.ratings.map((r) => (
              <li key={r.person_name} className="flex items-center justify-between py-2 text-sm">
                <span>{r.person_name}</span>
                <span className="font-medium text-spice">{r.rating}/10</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
