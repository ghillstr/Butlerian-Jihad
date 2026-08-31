import { NextRequest, NextResponse } from "next/server";
import { getAllGamesWithRatings, upsertGame } from "@/lib/games";
import { getGameDetails } from "@/lib/bgg";

export async function GET() {
  return NextResponse.json({ games: getAllGamesWithRatings() });
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as { bggId?: number } | null;
  const bggId = body?.bggId;
  if (!bggId || !Number.isFinite(bggId)) {
    return NextResponse.json({ error: "bggId is required." }, { status: 400 });
  }

  const [detail] = await getGameDetails([bggId]);
  if (!detail) {
    return NextResponse.json({ error: "Game not found on BoardGameGeek." }, { status: 404 });
  }

  upsertGame(detail);
  return NextResponse.json({ game: detail });
}
