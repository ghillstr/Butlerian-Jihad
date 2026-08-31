import Anthropic from "@anthropic-ai/sdk";

declare global {
  // eslint-disable-next-line no-var
  var __anthropicClient: Anthropic | undefined;
}

/** Server-only Anthropic client. Never import this file from client components. */
export const anthropic = globalThis.__anthropicClient ?? new Anthropic();
if (process.env.NODE_ENV !== "production") {
  globalThis.__anthropicClient = anthropic;
}

export const CLAUDE_MODEL = "claude-opus-5";
