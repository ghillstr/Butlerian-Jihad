"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import RatingStars from "./RatingStars";

export default function RateControl({
  gameId,
  currentRating,
}: {
  gameId: number;
  currentRating: number | null;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  async function rate(rating: number) {
    setSaving(true);
    try {
      await fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId, rating }),
      });
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return <RatingStars value={currentRating} onRate={rate} disabled={saving} />;
}
