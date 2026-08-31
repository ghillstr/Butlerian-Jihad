"use client";

import { useEffect, useState } from "react";
import AttendeePicker from "@/components/AttendeePicker";
import RecommendationList from "@/components/RecommendationList";
import { GameWithRatings } from "@/lib/schema";
import { RecommendationCandidate } from "@/lib/recommend";

export default function RecommendPage() {
  const [knownNames, setKnownNames] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<
    (RecommendationCandidate & { reason: string })[] | null
  >(null);

  useEffect(() => {
    fetch("/api/games")
      .then((r) => r.json())
      .then((data: { games: GameWithRatings[] }) => {
        const names = new Set<string>();
        for (const game of data.games) {
          for (const r of game.ratings) names.add(r.person_name);
        }
        setKnownNames(Array.from(names).sort());
      });
  }, []);

  async function handleSubmit() {
    setLoading(true);
    setError(null);
    setRecommendations(null);
    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attendees: selected }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not get recommendations.");
        return;
      }
      setRecommendations(data.recommendations);
      if (data.note) setError(data.note);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-2 text-2xl font-semibold text-ink">What should we play?</h1>
      <p className="mb-6 text-sm text-dune">Pick who&apos;s playing tonight to get suggestions.</p>

      <section className="card mb-6 p-6">
        <h2 className="mb-3 font-medium text-ink">Who&apos;s here?</h2>
        <AttendeePicker knownNames={knownNames} selected={selected} onChange={setSelected} />
        <button
          className="btn mt-4"
          onClick={handleSubmit}
          disabled={selected.length === 0 || loading}
        >
          {loading ? "Thinking..." : "Suggest games"}
        </button>
      </section>

      {error && <p className="mb-4 text-sm text-dune">{error}</p>}
      {recommendations && <RecommendationList recommendations={recommendations} />}
    </main>
  );
}
