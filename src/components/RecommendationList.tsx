import { RecommendationCandidate } from "@/lib/recommend";

export default function RecommendationList({
  recommendations,
}: {
  recommendations: (RecommendationCandidate & { reason: string })[];
}) {
  if (recommendations.length === 0) {
    return <p className="text-sm text-dune">No recommendations yet.</p>;
  }

  return (
    <ul className="space-y-4">
      {recommendations.map((rec) => (
        <li key={rec.gameId} className="card p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-medium text-ink">{rec.name}</h3>
              <p className="mt-1 text-sm text-dune">{rec.reason}</p>
            </div>
            <span
              className={`whitespace-nowrap rounded-full px-2 py-0.5 text-xs ${
                rec.bucket === "wildcard"
                  ? "bg-parchment text-dune"
                  : "bg-spice/10 text-spice"
              }`}
            >
              {rec.bucket === "wildcard" ? "Wildcard" : "Crowd-pleaser"}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-dune">
            {rec.minPlayers && rec.maxPlayers && (
              <span>
                {rec.minPlayers}–{rec.maxPlayers} players
              </span>
            )}
            {rec.playtimeMinutes && <span>{rec.playtimeMinutes} min</span>}
            {rec.groupAvgRating && <span>Group avg {rec.groupAvgRating.toFixed(1)}/10</span>}
            {rec.bggRating && <span>BGG {rec.bggRating.toFixed(1)}</span>}
          </div>
        </li>
      ))}
    </ul>
  );
}
