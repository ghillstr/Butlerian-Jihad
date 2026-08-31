import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getGameWithRatings } from "@/lib/games";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const game = getGameWithRatings(Number(id));
  if (!game) {
    return NextResponse.json({ error: "Game not found." }, { status: 404 });
  }
  return NextResponse.json({ game });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  db.prepare("DELETE FROM games WHERE id = ?").run(Number(id));
  return NextResponse.json({ ok: true });
}
