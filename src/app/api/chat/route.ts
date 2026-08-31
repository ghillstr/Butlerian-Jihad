import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { anthropic, CLAUDE_MODEL } from "@/lib/anthropic";
import { buildLibraryContext, CHAT_SYSTEM_INSTRUCTIONS } from "@/lib/chatContext";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as
    | { messages?: Anthropic.MessageParam[] }
    | null;
  const messages = body?.messages ?? [];

  if (messages.length === 0) {
    return new Response("messages is required", { status: 400 });
  }

  const systemText = `${CHAT_SYSTEM_INSTRUCTIONS}\n\n${buildLibraryContext()}`;

  const stream = anthropic.messages.stream({
    model: CLAUDE_MODEL,
    max_tokens: 8000,
    system: [{ type: "text", text: systemText, cache_control: { type: "ephemeral" } }],
    messages,
    tools: [{ type: "web_search_20260209", name: "web_search" }],
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream<Uint8Array>({
    start(controller) {
      let settled = false;
      stream.on("text", (text) => {
        if (settled) return;
        controller.enqueue(encoder.encode(text));
      });
      stream.on("end", () => {
        if (settled) return;
        settled = true;
        controller.close();
      });
      stream.on("error", (err) => {
        if (settled) return;
        settled = true;
        const message =
          err instanceof Anthropic.APIError
            ? err.message
            : "Something went wrong talking to Claude.";
        controller.enqueue(encoder.encode(`\n\n[Error: ${message}]`));
        controller.close();
      });
    },
    cancel() {
      stream.abort();
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
