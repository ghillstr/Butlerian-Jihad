"use client";

import { useEffect, useState } from "react";

interface HotGame {
  id: number;
  rank: number;
  name: string;
  yearPublished: number | null;
  thumbnailUrl: string | null;
  bggRating: number | null;
  publisher: string | null;
}

export default function ExplorePage() {
  const [games, setGames] = useState<HotGame[] | null>(null);
  const [libraryIds, setLibraryIds] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [addingId, setAddingId] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/games")
      .then((res) => res.json())
      .then((data) => setLibraryIds(new Set((data.games ?? []).map((g: { id: number }) => g.id))))
      .catch(() => {});

    fetch("/api/games/explore")
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Could not load trending games.");
          return;
        }
        setGames(data.results);
      })
      .catch(() => setError("Could not load trending games."));
  }, []);

  async function handleAdd(bggId: number) {
    setAddingId(bggId);
    setMessage(null);
    try {
      const res = await fetch("/api/games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bggId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error ?? "Could not add game.");
        return;
      }
      setMessage(`Added "${data.game.name}" to the library.`);
      setLibraryIds((prev) => new Set(prev).add(bggId));
    } finally {
      setAddingId(null);
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-1 text-2xl font-semibold text-ink">Explore</h1>
      <p className="mb-6 text-sm text-dune">
        What&apos;s trending on BoardGameGeek right now — browse and add anything that catches
        your eye.
      </p>

      {message && <p className="mb-4 text-sm text-ink">{message}</p>}

      {error && <p className="text-sm text-red-700">{error}</p>}

      {!games && !error && <p className="text-sm text-dune">Loading trending games…</p>}

      {games && games.length === 0 && (
        <p className="text-sm text-dune">No trending games found right now.</p>
      )}

      {games && games.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {games.map((g) => {
            const inLibrary = libraryIds.has(g.id);
            return (
              <div key={g.id} className="card flex flex-col overflow-hidden text-sm">
                {g.thumbnailUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={g.thumbnailUrl}
                    alt={g.name}
                    className="h-32 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-32 w-full items-center justify-center bg-parchment text-dune">
                    No image
                  </div>
                )}
                <div className="flex flex-1 flex-col gap-2 p-3">
                  <p className="truncate font-medium text-ink">
                    #{g.rank} {g.name}
                  </p>
                  <div className="flex items-center justify-between text-xs text-dune">
                    <span>{g.yearPublished ?? ""}</span>
                    <span className="font-medium text-spice">
                      {g.bggRating ? `${g.bggRating.toFixed(1)}/10 BGG` : "—"}
                    </span>
                  </div>
                  <button
                    className="btn-secondary mt-auto"
                    disabled={inLibrary || addingId === g.id}
                    onClick={() => handleAdd(g.id)}
                  >
                    {inLibrary ? "In library" : addingId === g.id ? "Adding..." : "Add"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
