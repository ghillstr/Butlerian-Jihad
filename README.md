# One Step Closer to Butlerian Jihad

A small web app for a friend group to rate and rank the board games they own,
get AI-assisted suggestions on what to play next, and chat with a board-game
assistant.

## Features

- **Shared library** sourced from [BoardGameGeek](https://boardgamegeek.com/) —
  search and add any game by name, or one-click import GMT Games' entire
  BGG catalog.
- **1–10 ratings** per person per game, with group averages.
- **"What should we play tonight?"** — pick who's around and get an
  explained shortlist based on the group's own ratings (plus the occasional
  well-regarded wildcard nobody's rated yet).
- **Game night assistant chat** — ask general board game questions (rules,
  new releases, similar games) with live web search, or ask it to reason
  over your own library and ratings.
- **Single shared access code** for the whole group — no individual accounts,
  just pick a display name after entering the code.

## Stack

Next.js (App Router) + TypeScript, `better-sqlite3` for storage, the
Anthropic SDK (`claude-opus-5`) for recommendations and chat, iron-session
for the shared-login cookie.

This app is designed to run as a single long-lived Node process (`next start`)
with the SQLite file on a persistent disk — it is **not** built for
ephemeral/serverless hosting (e.g. bare Vercel functions without an attached
volume).

## Setup

1. Copy `.env.example` to `.env.local` and fill in:
   - `APP_ACCESS_CODE` — pick a secret your friend group will use to log in.
   - `SESSION_SECRET` — generate with `openssl rand -base64 32`.
   - `ANTHROPIC_API_KEY` — your Anthropic API key (server-side only).
   - `GMT_BGG_PUBLISHER_ID` — leave as `2050` unless BGG changes it.
   - `BGG_API_TOKEN` — BoardGameGeek requires a registered application and an
     Authorization Bearer token to use its XML API. Register an application at
     https://boardgamegeek.com/applications, then create a token under
     "Tokens" for it and paste it here.
   - `DATABASE_PATH` — defaults to `./data/app.db`.

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run in development:
   ```bash
   npm run dev
   ```
   Visit http://localhost:3000, enter the access code, and pick a display name.

4. For production:
   ```bash
   npm run build
   npm start
   ```
   Make sure `DATABASE_PATH` points at a persistent volume.

## Notes

- The GMT Games bulk import uses BGG's publisher-linked-items lookup, which
  is a private/internal BGG endpoint, not part of the licensed XML API, and
  not covered by your `BGG_API_TOKEN`. BGG's terms grant no license for use of
  such endpoints without separate authorization, so this feature carries real
  ToS risk and could stop working (or draw BGG's attention) at any time. If it
  ever breaks, GMT titles can still be added one at a time via the regular
  search-and-add flow on the Add Games page — consider that the safer default
  if you want to stay strictly within BGG's terms.
- Play history / session tracking is intentionally out of scope — recommendations
  are based purely on ratings and who's attending tonight.
- Per BGG's XML API terms, public-facing applications using their data must
  display a "Powered by BGG" attribution linking back to BoardGameGeek — this
  app includes a simple text attribution in the footer (`src/app/layout.tsx`).
  If you want to use BGG's official logo asset instead, grab it from the terms
  page and swap it in there.
