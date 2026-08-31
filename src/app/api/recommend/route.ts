import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { anthropic, CLAUDE_MODEL } from "@/lib/anthropic";
import { buildCandidateShortlist } from "@/lib/recommend";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as { attendees?: string[] } | null;
  const attendees = (body?.attendees ?? []).map((a) => a.trim()).filter(Boolean);

  if (attendees.length === 0) {
    return NextResponse.json({ error: "At least one attendee is required." }, { status: 400 });
  }

  const candidates = buildCandidateShortlist(attendees);
  if (candidates.length === 0) {
    return NextResponse.json({
      recommendations: [],
      note: "No games in the library fit this group size yet. Add more games or ratings.",
    });
  }

  const prompt = `Tonight's attendees: ${attendees.join(", ")}.

Candidate games (deterministically pre-filtered from the group's library; "crowd-pleaser" candidates
have been rated by at least one attendee, "wildcard" candidates are highly-rated on BoardGameGeek but
nobody present has rated them yet):

${JSON.stringify(candidates, null, 2)}

Pick the best 3-5 games for tonight from ONLY this candidate list - never invent a game that isn't here.
Favor games multiple attendees rated highly, but feel free to include a wildcard if it fits the group size well.
Respond with ONLY a JSON array (no prose, no markdown fences) of objects shaped exactly like:
[{"gameId": number, "reason": "one or two sentence explanation"}]`;

  let response: Anthropic.Message;
  try {
    response = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 2000,
      output_config: { effort: "medium" },
      messages: [{ role: "user", content: prompt }],
    });
  } catch (err) {
    if (err instanceof Anthropic.AuthenticationError) {
      return NextResponse.json(
        { error: "The server's Anthropic API key is invalid or missing." },
        { status: 500 }
      );
    }
    if (err instanceof Anthropic.RateLimitError) {
      return NextResponse.json(
        { error: "Rate limited by Anthropic - try again in a moment." },
        { status: 429 }
      );
    }
    if (err instanceof Anthropic.APIError) {
      return NextResponse.json({ error: `Anthropic API error: ${err.message}` }, { status: 502 });
    }
    throw err;
  }

  const textBlock = response.content.find((b) => b.type === "text");
  let picks: { gameId: number; reason: string }[] = [];
  try {
    const raw = textBlock?.type === "text" ? textBlock.text : "[]";
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    picks = JSON.parse(jsonMatch ? jsonMatch[0] : raw);
  } catch {
    return NextResponse.json(
      { error: "Could not parse a recommendation from the model. Try again." },
      { status: 502 }
    );
  }

  const byId = new Map(candidates.map((c) => [c.gameId, c]));
  const recommendations = picks
    .map((p) => {
      const candidate = byId.get(p.gameId);
      return candidate ? { ...candidate, reason: p.reason } : null;
    })
    .filter((r): r is NonNullable<typeof r> => r !== null);

  return NextResponse.json({ recommendations });
}
