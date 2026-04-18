import type { BetSelectionDetail } from "@/features/user/components/hooks/useBetDetail";

const statusDotClass: Record<BetSelectionDetail["status"], string> = {
  won: "bg-[#22c55e]",
  lost: "bg-[#ef4444]",
  pending: "bg-[#f59e0b]",
  live: "bg-[#22c55e] animate-pulse",
  cancelled: "bg-[#64748b]",
};

type MatchSelectionCardProps = {
  selection: BetSelectionDetail;
};

export function MatchSelectionCard({ selection }: MatchSelectionCardProps) {
  return (
    <article className="rounded-xl border border-[#2b3a4f] bg-[#1a2332] p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-sm font-semibold text-white">
          {selection.home_team} vs {selection.away_team}
        </p>
        <span className="rounded-full border border-[#3e566f] bg-[#111827] px-2 py-0.5 text-xs text-[#f5c518]">
          {selection.odds.toFixed(2)}
        </span>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[#9fb1c8]">
        <span className="inline-flex items-center gap-1">
          <span
            className={`h-2 w-2 rounded-full ${statusDotClass[selection.status]}`}
          />
          {selection.status}
        </span>
        <span>Type: {selection.market_type}</span>
        <span>Pick: {selection.pick}</span>
      </div>

      <div className="mt-2 text-xs text-[#9fb1c8]">
        <p>FT Results: {selection.ft_result ?? "-"}</p>
        <p>Outcome: {selection.pick}</p>
        {selection.live_score ? (
          <p className="mt-1 inline-flex items-center gap-1 text-[#22c55e]">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#22c55e]" />
            Live score: {selection.live_score}
          </p>
        ) : null}
      </div>
    </article>
  );
}
