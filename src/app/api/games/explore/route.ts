import { NextResponse } from "next/server";
import { getHotGames, getGameDetails } from "@/lib/bgg";

export async function GET() {
  let hot;
  try {
    hot = await getHotGames();
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not load BGG's hot games list." },
      { status: 502 }
    );
  }

  let details;
  try {
    details = await getGameDetails(hot.map((h) => h.id));
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not load game details from BGG." },
      { status: 502 }
    );
  }
  const detailById = new Map(details.map((d) => [d.id, d]));

  const results = hot
    .map((h) => {
      const d = detailById.get(h.id);
      return {
        id: h.id,
        rank: h.rank,
        name: h.name,
        yearPublished: h.yearPublished,
        thumbnailUrl: d?.thumbnailUrl ?? h.thumbnailUrl,
        bggRating: d?.bggRating ?? null,
        publisher: d?.publishers[0] ?? null,
      };
    })
    .sort((a, b) => a.rank - b.rank);

  return NextResponse.json({ results });
}
