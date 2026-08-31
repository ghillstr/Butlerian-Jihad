"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface SearchResult {
  id: number;
  name: string;
  yearPublished: number | null;
}

export default function ImportPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [addingId, setAddingId] = useState<number | null>(null);
  const [gmtImporting, setGmtImporting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearching(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/games/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error ?? "Search failed.");
        return;
      }
      setResults(data.results);
    } finally {
      setSearching(false);
    }
  }

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
      router.refresh();
    } finally {
      setAddingId(null);
    }
  }

  async function handleGmtImport() {
    setGmtImporting(true);
    setMessage("Importing GMT Games' catalog from BoardGameGeek — this can take a minute or two...");
    try {
      const res = await fetch("/api/games/import-gmt", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error ?? "GMT import failed.");
        return;
      }
      setMessage(`Imported ${data.imported} of ${data.total} GMT Games titles.`);
      router.refresh();
    } finally {
      setGmtImporting(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <Link href="/games" className="text-sm text-dune hover:underline">
        ← Back to library
      </Link>
      <h1 className="mt-4 mb-6 text-2xl font-semibold text-ink">Add Games</h1>

      <section className="card mb-6 p-6">
        <h2 className="mb-3 font-medium text-ink">Search BoardGameGeek</h2>
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            className="input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. Twilight Struggle"
          />
          <button type="submit" className="btn" disabled={searching}>
            {searching ? "Searching..." : "Search"}
          </button>
        </form>

        {results.length > 0 && (
          <ul className="mt-4 divide-y divide-dune/10">
            {results.map((r) => (
              <li key={r.id} className="flex items-center justify-between py-2 text-sm">
                <span>
                  {r.name} {r.yearPublished ? `(${r.yearPublished})` : ""}
                </span>
                <button
                  className="btn-secondary"
                  disabled={addingId === r.id}
                  onClick={() => handleAdd(r.id)}
                >
                  {addingId === r.id ? "Adding..." : "Add"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card p-6">
        <h2 className="mb-2 font-medium text-ink">Import GMT Games catalog</h2>
        <p className="mb-3 text-sm text-dune">
          One-click import of GMT Games&apos; full BoardGameGeek lineup into your library.
        </p>
        <button className="btn" onClick={handleGmtImport} disabled={gmtImporting}>
          {gmtImporting ? "Importing..." : "Import GMT Games catalog"}
        </button>
      </section>

      {message && <p className="mt-4 text-sm text-ink">{message}</p>}
    </main>
  );
}
