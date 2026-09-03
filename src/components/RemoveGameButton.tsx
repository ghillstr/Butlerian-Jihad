"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RemoveGameButton({ gameId, gameName }: { gameId: number; gameName: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [removing, setRemoving] = useState(false);

  async function remove() {
    setRemoving(true);
    try {
      await fetch(`/api/games/${gameId}`, { method: "DELETE" });
      router.push("/games");
      router.refresh();
    } finally {
      setRemoving(false);
    }
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <span className="text-dune">Remove {gameName} from the library?</span>
        <button
          type="button"
          onClick={remove}
          disabled={removing}
          className="rounded bg-red-700 px-2 py-1 text-xs font-medium text-white hover:bg-red-800 disabled:opacity-50"
        >
          {removing ? "Removing…" : "Confirm"}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          disabled={removing}
          className="text-xs text-dune hover:underline"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="text-sm text-red-700 hover:underline"
    >
      Remove from library
    </button>
  );
}
