import { NextResponse } from "next/server";
import { getGameDetails, getPublisherGameIds } from "@/lib/bgg";
import { upsertGame } from "@/lib/games";

export async function POST() {
  const publisherId = Number(process.env.GMT_BGG_PUBLISHER_ID || "52");

  let ids: number[];
  try {
    ids = await getPublisherGameIds(publisherId);
  } catch (err) {
    return NextResponse.json(
      {
        error:
          "Could not reach BGG's publisher lookup. You can still add GMT titles individually via search.",
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 502 }
    );
  }

  if (ids.length === 0) {
    return NextResponse.json(
      { error: "No games found for GMT Games' publisher id. Try adding titles via search instead." },
      { status: 404 }
    );
  }

  let details;
  try {
    details = await getGameDetails(ids);
  } catch (err) {
    return NextResponse.json(
      {
        error: "Could not reach BGG's game details endpoint. You can still add GMT titles individually via search.",
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 502 }
    );
  }

  for (const detail of details) {
    upsertGame(detail, "GMT Games");
  }

  return NextResponse.json({ imported: details.length, total: ids.length });
}
