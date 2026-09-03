import { XMLParser } from "fast-xml-parser";

const BGG_BASE = "https://boardgamegeek.com/xmlapi2";
const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });

export interface BggSearchResult {
  id: number;
  name: string;
  yearPublished: number | null;
}

export interface BggHotGame {
  id: number;
  rank: number;
  name: string;
  yearPublished: number | null;
  thumbnailUrl: string | null;
}

export interface BggGameDetail {
  id: number;
  name: string;
  yearPublished: number | null;
  thumbnailUrl: string | null;
  imageUrl: string | null;
  minPlayers: number | null;
  maxPlayers: number | null;
  playtimeMinutes: number | null;
  weight: number | null;
  bggRating: number | null;
  categories: string[];
  mechanisms: string[];
  publishers: string[];
}

/** fast-xml-parser only produces an array when an element repeats; normalize to always-array. */
function asArray<T>(value: T | T[] | undefined): T[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

/**
 * BGG now requires a registered application + Authorization: Bearer token for
 * XML API access (see https://boardgamegeek.com/xmlapi/using-the-xml-api).
 * Register an application at https://boardgamegeek.com/applications and create
 * a token under "Tokens" for it.
 */
function bggAuthHeader(): string {
  // Trim defensively - a trailing newline/space from copy-pasting the token into
  // an env file is a common cause of BGG rejecting an otherwise-valid token.
  const token = process.env.BGG_API_TOKEN?.trim();
  if (!token) {
    throw new Error(
      "BGG_API_TOKEN is not set. BoardGameGeek requires a registered application token for " +
        "XML API access - register at https://boardgamegeek.com/applications and set " +
        "BGG_API_TOKEN in your environment."
    );
  }
  return `Bearer ${token}`;
}

async function fetchBgg(pathAndQuery: string): Promise<Record<string, unknown>> {
  const res = await fetch(`${BGG_BASE}${pathAndQuery}`, {
    headers: {
      "User-Agent": "one-step-closer-to-butlerian-jihad/0.1",
      Authorization: bggAuthHeader(),
    },
  });
  if (!res.ok) {
    const body = (await res.text().catch(() => "")).slice(0, 300).trim();
    const hint =
      res.status === 401 || res.status === 403
        ? " - check that BGG_API_TOKEN is correct (no extra whitespace) and that your " +
          "BGG application at https://boardgamegeek.com/applications has been approved"
        : "";
    throw new Error(
      `BGG request failed (${res.status}): ${pathAndQuery}${hint}${body ? ` | response: ${body}` : ""}`
    );
  }
  const xml = await res.text();
  return parser.parse(xml);
}

export async function searchGames(query: string): Promise<BggSearchResult[]> {
  if (!query.trim()) return [];
  const doc = await fetchBgg(`/search?query=${encodeURIComponent(query)}&type=boardgame`);
  const items = asArray<any>((doc.items as any)?.item);
  return items
    .map((item) => {
      const nameNode = Array.isArray(item.name) ? item.name[0] : item.name;
      return {
        id: Number(item["@_id"]),
        name: nameNode?.["@_value"] ?? "Unknown",
        yearPublished: item.yearpublished ? Number(item.yearpublished["@_value"]) : null,
      };
    })
    .filter((r) => Number.isFinite(r.id));
}

/** BGG's currently-trending boardgames, ranked; always ~50 items. */
export async function getHotGames(): Promise<BggHotGame[]> {
  const doc = await fetchBgg(`/hot?type=boardgame`);
  const items = asArray<any>((doc.items as any)?.item);
  return items
    .map((item) => ({
      id: Number(item["@_id"]),
      rank: Number(item["@_rank"]),
      name: item.name?.["@_value"] ?? "Unknown",
      yearPublished: item.yearpublished ? Number(item.yearpublished["@_value"]) : null,
      thumbnailUrl: item.thumbnail?.["@_value"] ?? null,
    }))
    .filter((r) => Number.isFinite(r.id));
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function parseGameItem(item: any): BggGameDetail {
  const names = asArray<any>(item.name);
  const primaryName = names.find((n) => n["@_type"] === "primary") ?? names[0];
  const links = asArray<any>(item.link);
  const categories = links
    .filter((l) => l["@_type"] === "boardgamecategory")
    .map((l) => l["@_value"] as string);
  const mechanisms = links
    .filter((l) => l["@_type"] === "boardgamemechanic")
    .map((l) => l["@_value"] as string);
  const publishers = links
    .filter((l) => l["@_type"] === "boardgamepublisher")
    .map((l) => l["@_value"] as string);

  const ratings = item.statistics?.ratings;

  return {
    id: Number(item["@_id"]),
    name: primaryName?.["@_value"] ?? "Unknown",
    yearPublished: item.yearpublished ? Number(item.yearpublished["@_value"]) : null,
    thumbnailUrl: item.thumbnail ?? null,
    imageUrl: item.image ?? null,
    minPlayers: item.minplayers ? Number(item.minplayers["@_value"]) : null,
    maxPlayers: item.maxplayers ? Number(item.maxplayers["@_value"]) : null,
    playtimeMinutes: item.playingtime ? Number(item.playingtime["@_value"]) : null,
    weight:
      ratings?.averageweight && Number(ratings.averageweight["@_value"]) > 0
        ? Number(ratings.averageweight["@_value"])
        : null,
    bggRating:
      ratings?.average && Number(ratings.average["@_value"]) > 0
        ? Number(ratings.average["@_value"])
        : null,
    categories,
    mechanisms,
    publishers,
  };
}

/** Fetch full details for a batch of BGG game ids (chunked to keep query strings reasonable). */
export async function getGameDetails(ids: number[]): Promise<BggGameDetail[]> {
  const results: BggGameDetail[] = [];
  for (const batch of chunk(ids, 20)) {
    const doc = await fetchBgg(`/thing?id=${batch.join(",")}&stats=1`);
    const items = asArray<any>((doc.items as any)?.item);
    results.push(...items.map(parseGameItem));
    // Be polite to BGG's API between batches.
    if (batch !== chunk(ids, 20).at(-1)) {
      await new Promise((r) => setTimeout(r, 400));
    }
  }
  return results;
}

/**
 * Resolve the full list of boardgame ids linked to a BGG publisher via the
 * (undocumented but stable) geekitem linked-items endpoint BGG's own publisher
 * pages use. This is a best-effort convenience import; the manual search-and-add
 * flow always remains available as a fallback if this endpoint ever changes shape.
 *
 * IMPORTANT: unlike /xmlapi2, api.geekdo.com is one of BGG's private, internal
 * endpoints. Per BGG's XML API terms (boardgamegeek.com/xmlapi/using-the-xml-api,
 * "Using other parts of our API"): "Unless otherwise noted or authorized, we are
 * granting no license for use of those endpoints." This function is NOT covered
 * by an XML API application token and is used here without separate BGG
 * authorization - it carries real ToS risk (BGG could block it or take issue
 * with its use) and should not be treated as an officially supported integration.
 */
export async function getPublisherGameIds(publisherId: number): Promise<number[]> {
  const ids = new Set<number>();
  let page = 1;
  // Safety cap: publisher lineups are large but finite; bail out rather than loop forever
  // if the endpoint's pagination signal is ever misread.
  const MAX_PAGES = 20;

  while (page <= MAX_PAGES) {
    const url =
      `https://api.geekdo.com/api/geekitem/linkeditems?objectid=${publisherId}` +
      `&objecttype=publisher&subtype=boardgamepublisher&linkdata_index=boardgame&pageid=${page}`;
    const res = await fetch(url, {
      headers: { "User-Agent": "one-step-closer-to-butlerian-jihad/0.1" },
    });
    if (!res.ok) {
      throw new Error(`BGG publisher lookup failed (${res.status}): ${url}`);
    }
    const data = (await res.json()) as {
      items?: { objectid?: string | number }[];
      pagecount?: number;
    };
    const items = data.items ?? [];
    if (items.length === 0) break;
    for (const item of items) {
      const id = Number(item.objectid);
      if (Number.isFinite(id)) ids.add(id);
    }
    if (data.pagecount && page >= data.pagecount) break;
    page += 1;
    await new Promise((r) => setTimeout(r, 300));
  }

  return Array.from(ids);
}
