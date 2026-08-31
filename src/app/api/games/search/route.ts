import { NextRequest, NextResponse } from "next/server";
import { searchGames } from "@/lib/bgg";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q") ?? "";
  try {
    const results = await searchGames(query);
    return NextResponse.json({ results: results.slice(0, 25) });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "BGG search failed." },
      { status: 502 }
    );
  }
}
