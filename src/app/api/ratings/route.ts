import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { RatingRow } from "@/lib/schema";

export async function GET(request: NextRequest) {
  const gameId = Number(request.nextUrl.searchParams.get("gameId"));
  if (!Number.isFinite(gameId)) {
    return NextResponse.json({ error: "gameId is required." }, { status: 400 });
  }
  const ratings = db
    .prepare("SELECT * FROM ratings WHERE game_id = ?")
    .all(gameId) as RatingRow[];
  return NextResponse.json({ ratings });
}

const upsertRatingStmt = db.prepare(`
  INSERT INTO ratings (game_id, person_name, rating, updated_at)
  VALUES (@gameId, @personName, @rating, datetime('now'))
  ON CONFLICT(game_id, person_name) DO UPDATE SET
    rating = excluded.rating,
    updated_at = excluded.updated_at
`);

export async function POST(request: NextRequest) {
  const session = await getSession();
  const personName = session.displayName;
  if (!personName) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { gameId?: number; rating?: number } | null;
  const gameId = body?.gameId;
  const rating = body?.rating;

  if (!gameId || !Number.isFinite(gameId)) {
    return NextResponse.json({ error: "gameId is required." }, { status: 400 });
  }
  if (!rating || !Number.isInteger(rating) || rating < 1 || rating > 10) {
    return NextResponse.json({ error: "rating must be an integer from 1 to 10." }, { status: 400 });
  }

  upsertRatingStmt.run({ gameId, personName, rating });
  return NextResponse.json({ ok: true });
}
