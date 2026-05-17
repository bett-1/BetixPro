import { useEffect, useRef, useState } from "react";
import { CalendarClock } from "lucide-react";
import type { MyBetListItem } from "@/features/user/components/hooks/useMyBets";
import { CancellationTimer } from "./CancellationTimer";
import { api } from "@/api/axiosConfig";

const badgeClassByStatus: Record<MyBetListItem["status"], string> = {
  bonus: "bg-[#F5C518] text-[#111827]",
  won: "bg-[#22c55e] text-white",
  lost: "bg-[#ef4444] text-white",
  open: "bg-[#3b82f6] text-white",
  cancelled: "bg-[#64748b] text-white",
};

type BetCardProps = {
  bet: MyBetListItem;
  onClick: () => void;
};

function formatMoney(value: number) {
  return `KES ${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(date: string) {
  const parsed = new Date(date);
  return parsed.toLocaleString(undefined, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function BetCard({ bet, onClick }: BetCardProps) {
  const previousStatus = useRef<MyBetListItem["status"]>(bet.status);
  const [flashStatus, setFlashStatus] = useState(false);
  const [liveStats, setLiveStats] = useState<LiveStats | null>(null);
  const [liveLoading, setLiveLoading] = useState(false);
  const liveIntervalRef = useRef<number | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    if (previousStatus.current !== bet.status) {
      setFlashStatus(true);
      const timer = window.setTimeout(() => setFlashStatus(false), 900);
      previousStatus.current = bet.status;
      return () => window.clearTimeout(timer);
    }

    return undefined;
  }, [bet.status]);

  useEffect(() => {
    mountedRef.current = true;

    async function fetchLive() {
      if (!bet.is_live) {
        setLiveStats(null);
        return;
      }

      try {
        setLiveLoading(true);

        const { data: detail } = await api.get(`/my-bets/${bet.id}`);
        const eventId = detail?.selections?.[0]?.event_id;
        if (!eventId) {
          setLiveStats(null);
          return;
        }

        const { data: liveRes } = await api.get(`/live/${eventId}`);
        const match = liveRes?.match;
        if (!match) {
          setLiveStats(null);
          return;
        }

        const stats: LiveStats = {
          minute: match.minute ?? 0,
          period: match.period,
          home_score: match.home_team?.score ?? null,
          away_score: match.away_team?.score ?? null,
          corners_home: match.stats?.corners_home,
          corners_away: match.stats?.corners_away,
          yellows_home: match.stats?.yellows_home,
          yellows_away: match.stats?.yellows_away,
        };

        if (mountedRef.current) {
          setLiveStats(stats);
        }
      } catch (err) {
        // ignore
      } finally {
        if (mountedRef.current) setLiveLoading(false);
      }
    }

    // initial fetch
    void fetchLive();

    // poll while live
    if (bet.is_live) {
      liveIntervalRef.current = window.setInterval(() => {
        void fetchLive();
      }, 10_000);
    }

    return () => {
      mountedRef.current = false;
      if (liveIntervalRef.current !== null) {
        window.clearInterval(liveIntervalRef.current);
        liveIntervalRef.current = null;
      }
    };
  }, [bet.id, bet.is_live]);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative w-full overflow-hidden rounded-2xl border bg-gradient-to-br from-[#111d2e] via-[#0f1a2d] to-[#0d1624] p-4 text-left transition-all duration-300 active:scale-[0.98] ${
        bet.status === "won"
          ? "border-emerald-500/25 shadow-[0_0_24px_rgba(16,185,129,0.06)]"
          : bet.status === "lost"
            ? "border-red-500/20 opacity-90"
            : bet.is_live
              ? "border-emerald-500/25 shadow-[0_0_24px_rgba(16,185,129,0.06)]"
              : "border-[#1e3350]/50 hover:border-amber-400/20"
      }`}
    >
      <div
        className={`absolute inset-x-0 top-0 h-[2px] ${
          bet.status === "won"
            ? "bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent"
            : bet.status === "lost"
              ? "bg-gradient-to-r from-transparent via-red-500/40 to-transparent"
              : bet.is_live
                ? "bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent"
                : "bg-gradient-to-r from-transparent via-amber-400/30 to-transparent"
        }`}
      />

      <div className="flex flex-col gap-3.5">
        {/* TOP ROW: MATCH NAME & PAYOUT */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-[15px] sm:text-base font-bold text-white transition-colors group-hover:text-amber-400 truncate leading-tight">
              {bet.match_name || "Multiple Events"}
            </p>
            <div className="mt-2.5 flex items-center gap-2">
              <span
                className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${badgeClassByStatus[bet.status]} ${
                  flashStatus ? "animate-[statusPulse_0.9s_ease-out]" : ""
                }`}
              >
                {bet.status}
              </span>
              {bet.status === "lost" && (
                <span className="text-[10px] font-bold text-[#ef4444] uppercase tracking-wider">
                  Settled
                </span>
              )}
            </div>
          </div>

          <div className="text-right shrink-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#6b86a8] mb-1.5 opacity-80">
              {bet.status === "won"
                ? "Total Payout"
                : bet.status === "lost"
                  ? "Lost"
                  : "Possible Payout"}
            </p>
            <p className="text-lg font-black text-white leading-none">
              {formatMoney(bet.possible_payout)}
            </p>
          </div>
        </div>

        {/* BOTTOM ROW: DATE & LIVE & SELECTIONS */}
        <div className="mt-1 flex items-center justify-between border-t border-[#1e3350]/30 pt-3">
          <div className="flex items-center gap-3 text-[10px] font-medium text-[#c6d6ea]">
            <span className="flex items-center gap-1.5 opacity-80">
              <CalendarClock size={11} className="text-[#6b86a8]" />
              {formatDate(bet.match_time)}
            </span>
            <span className="h-3 w-[1px] bg-[#1e3350]/50" />
            <span className="font-semibold text-[#8ea0b6]">
              {bet.selections_count}{" "}
              {bet.selections_count === 1 ? "Selection" : "Selections"}
            </span>
          </div>

          {bet.is_live && (
            <span className="inline-flex items-center gap-1.5 text-[#22c55e] text-[10px] font-bold uppercase tracking-widest">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#22c55e]" />
              Live
            </span>
          )}
        </div>
      </div>

      {bet.is_cancellable ? (
        <div className="mt-3 border-t border-[#1e3350]/20 pt-3">
          <CancellationTimer cancellableUntil={bet.cancellable_until} />
        </div>
      ) : null}
      {liveStats ? (
        <div className="mt-3 border-t border-[#1e3350]/20 pt-3 text-[12px] text-[#c6d6ea]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-white font-bold text-lg">
                {liveStats.home_score ?? "-"} : {liveStats.away_score ?? "-"}
              </div>
              <div className="text-sm text-[#8ea0b6]">
                {liveStats.period ?? `${liveStats.minute}'`}
              </div>
            </div>
            <div className="flex items-center gap-4 text-[11px] text-[#9db0c8]">
              <div>
                Corners {liveStats.corners_home ?? 0}-
                {liveStats.corners_away ?? 0}
              </div>
              <div>
                Yellows {liveStats.yellows_home ?? 0}-
                {liveStats.yellows_away ?? 0}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </button>
  );
}

type LiveStats = {
  minute: number;
  period?: string;
  home_score: number | null;
  away_score: number | null;
  corners_home?: number;
  corners_away?: number;
  yellows_home?: number;
  yellows_away?: number;
};

// Show live stats for live bets by fetching bet detail and live match
// This component is lightweight and performs short polling while live.
export function BetCardWithLive({ bet, onClick }: BetCardProps) {
  // This wrapper keeps backward compatibility but is not used by default.
  return <BetCard bet={bet} onClick={onClick} />;
}
