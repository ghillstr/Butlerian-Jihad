import { NextRequest, NextResponse } from "next/server";
import { getSession, safeCompare } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as
    | { code?: string; displayName?: string }
    | null;

  const code = body?.code?.trim() ?? "";
  const displayName = body?.displayName?.trim() ?? "";

  const accessCode = process.env.APP_ACCESS_CODE;
  if (!accessCode) {
    return NextResponse.json(
      { error: "Server is missing APP_ACCESS_CODE configuration." },
      { status: 500 }
    );
  }

  if (!displayName) {
    return NextResponse.json({ error: "Display name is required." }, { status: 400 });
  }

  if (!safeCompare(code, accessCode)) {
    return NextResponse.json({ error: "Incorrect access code." }, { status: 401 });
  }

  const session = await getSession();
  session.displayName = displayName;
  await session.save();

  return NextResponse.json({ displayName });
}
