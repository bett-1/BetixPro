import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  Clock,
  Loader2,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { api } from "@/api/axiosConfig";
import BetSlip from "../components/BetSlip";
import useBetSlip, { type BetSelection } from "../components/hooks/useBetSlip";

type MarketTab = "main" | "goals" | "halftime" | "other";

type ProcessedOutcome = {
  name: string;
  price: number;
  point?: number;
  description?: string;
};

type ProcessedMarket = {
  key: string;
  name: string;
  tab: MarketTab;
  order: number;
  outcomes: ProcessedOutcome[];
  bookmaker: string;
  bookmakerTitle?: string;
  lastUpdated: string;
};

type EventMarketsResponse = {
  id: string;
  eventId: string;
  homeTeam: string;
  awayTeam: string;
  leagueName: string | null;
  sportKey: string | null;
  commenceTime: string;
  status: "UPCOMING" | "LIVE" | "FINISHED" | "CANCELLED" | "SUSPENDED";
  homeScore: number | null;
  awayScore: number | null;
  markets: ProcessedMarket[];
  grouped: Record<MarketTab, ProcessedMarket[]>;
  totalMarkets: number;
};

const TABS: Array<{ key: "all" | MarketTab; label: string }> = [
  { key: "all", label: "All" },
  { key: "main", label: "Main" },
  { key: "goals", label: "Goals" },
  { key: "halftime", label: "Half Time" },
  { key: "other", label: "Other Markets" },
];

function formatSport(value?: string | null) {
  if (!value) return "Sports";
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatKickoff(value?: string) {
  if (!value) return "";
  return new Intl.DateTimeFormat("en-KE", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function getOutcomeKey(market: ProcessedMarket, outcome: ProcessedOutcome) {
  return `${market.key}:${outcome.name}:${outcome.point ?? ""}:${outcome.price.toFixed(2)}`;
}

function MarketSection({
  market,
  isSelected,
  onSelect,
}: {
  market: ProcessedMarket;
  isSelected: (market: ProcessedMarket, outcome: ProcessedOutcome) => boolean;
  onSelect: (market: ProcessedMarket, outcome: ProcessedOutcome) => void;
}) {
  const columns =
    market.outcomes.length === 3
      ? "grid-cols-3"
      : market.outcomes.length <= 2
        ? "grid-cols-2"
        : "grid-cols-2 sm:grid-cols-3 xl:grid-cols-4";

  return (
    <section className="overflow-hidden rounded-lg border border-[#203955] bg-[#0f1a2d] shadow-[0_10px_24px_rgba(0,0,0,0.22)]">
      <div className="flex items-center justify-between gap-3 border-b border-[#203955] bg-[#13233a] px-3 py-2.5 sm:px-4">
        <div className="min-w-0">
          <h2 className="truncate text-sm font-extrabold text-white sm:text-[15px]">
            {market.name}
          </h2>
          <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6f89aa]">
            {market.bookmakerTitle ?? market.bookmaker}
          </p>
        </div>
        <span className="shrink-0 rounded border border-[#2d4869] bg-[#0c1828] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-[#8aa4c5]">
          {market.outcomes.length} odds
        </span>
      </div>

      <div className={`grid ${columns} gap-1.5 p-2 sm:gap-2 sm:p-3`}>
        {market.outcomes.map((outcome) => {
          const selected = isSelected(market, outcome);
          return (
            <button
              key={getOutcomeKey(market, outcome)}
              type="button"
              onClick={() => onSelect(market, outcome)}
              className={`flex min-h-[58px] min-w-0 flex-col items-center justify-center rounded-md border px-2 py-2 text-center transition active:scale-[0.98] ${
                selected
                  ? "border-[#ffd500] bg-[#ffd500] text-[#08111f] shadow-[0_0_0_1px_rgba(255,213,0,0.28),0_8px_18px_rgba(245,197,24,0.22)]"
                  : "border-[#24415f] bg-[#17283d] text-white hover:border-[#ffd500]/70 hover:bg-[#1c314c]"
              }`}
            >
              <span
                className={`line-clamp-2 text-[10px] font-semibold leading-tight ${
                  selected ? "text-[#172033]" : "text-[#9eb3ce]"
                }`}
              >
                {outcome.description || outcome.name}
              </span>
              <span
                className={`mt-1 text-base font-black tabular-nums ${
                  selected ? "text-[#08111f]" : "text-[#ffd500]"
                }`}
              >
                {outcome.price.toFixed(2)}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default function EventMarketsPage() {
  const { eventId } = useParams({ strict: false }) as { eventId: string };
  const [event, setEvent] = useState<EventMarketsResponse | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | MarketTab>("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const betSlip = useBetSlip();

  const selectedOdds = useMemo(
    () =>
      new Set(
        betSlip.selections.map(
          (selection) =>
            `${selection.eventId}:${selection.marketType}:${selection.side}:${selection.odds.toFixed(2)}`,
        ),
      ),
    [betSlip.selections],
  );

  const fetchMarkets = async (isRefresh = false) => {
    if (!eventId) return;
    setError(null);
    if (isRefresh) setRefreshing(true);
    try {
      const { data } = await api.get<EventMarketsResponse>(
        `/user/events/${eventId}/markets`,
      );
      setEvent(data);
    } catch {
      setError("Unable to load markets for this event.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void fetchMarkets();
    const interval = window.setInterval(() => {
      void fetchMarkets(true);
    }, 30_000);

    return () => window.clearInterval(interval);
  }, [eventId]);

  const displayedMarkets = useMemo(() => {
    if (!event) return [];
    if (activeTab === "all") return event.markets;
    return event.grouped?.[activeTab] ?? [];
  }, [activeTab, event]);

  const isSelected = (market: ProcessedMarket, outcome: ProcessedOutcome) => {
    if (!event) return false;
    return selectedOdds.has(
      `${event.eventId}:${market.key}:${outcome.name}:${outcome.price.toFixed(2)}`,
    );
  };

  const handleSelect = (market: ProcessedMarket, outcome: ProcessedOutcome) => {
    if (!event) return;
    const selection: BetSelection = {
      eventId: event.eventId,
      eventName: `${event.homeTeam} vs ${event.awayTeam}`,
      leagueName: event.leagueName ?? "Featured Match",
      marketType: market.key,
      side: outcome.name,
      odds: outcome.price,
      commenceTime: event.commenceTime,
      isLive: event.status === "LIVE",
    };
    betSlip.addSelection(selection);
  };

  const hasSelections = betSlip.selections.length > 0;
  const isLive = event?.status === "LIVE";

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#08111f] text-white">
        <div className="flex items-center gap-3 rounded-lg border border-[#203955] bg-[#0f1a2d] px-4 py-3 text-sm text-[#9eb3ce]">
          <Loader2 className="h-4 w-4 animate-spin text-[#ffd500]" />
          Loading markets
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#08111f] text-white">
      <div
        className={`mx-auto w-full max-w-[1500px] px-2 pb-24 sm:px-4 md:pb-6 ${
          hasSelections ? "lg:pr-[332px]" : ""
        }`}
      >
        <header className="sticky top-0 z-[120] -mx-2 border-b border-[#203955] bg-[#091423]/95 backdrop-blur sm:-mx-4">
          <div className="px-3 py-2 sm:px-4">
            <div className="flex items-center justify-between gap-3">
              <Link
                to="/user"
                className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[#24415f] bg-[#101f33] px-2.5 text-xs font-bold text-[#9eb3ce] transition hover:border-[#ffd500]/60 hover:text-[#ffd500]"
              >
                <ArrowLeft size={14} />
                Back
              </Link>
              <button
                type="button"
                onClick={() => void fetchMarkets(true)}
                disabled={refreshing}
                className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[#24415f] bg-[#101f33] px-2.5 text-xs font-bold text-[#9eb3ce] transition hover:border-[#ffd500]/60 hover:text-[#ffd500] disabled:opacity-60"
              >
                <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
                Refresh
              </button>
            </div>

            <div className="mt-3 text-center">
              <div className="mb-1 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#7f98b8]">
                <span>{formatSport(event?.sportKey)}</span>
                <span className="text-[#3f5c7b]">/</span>
                <span>{event?.leagueName ?? "Match"}</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-xs text-[#9eb3ce]">
                <Clock size={12} />
                <span>{formatKickoff(event?.commenceTime)}</span>
                {isLive ? (
                  <span className="rounded bg-red-500 px-1.5 py-0.5 text-[10px] font-black uppercase text-white">
                    Live
                  </span>
                ) : null}
              </div>

              <div className="mt-2 flex items-center justify-center gap-2 sm:gap-3">
                <h1 className="min-w-0 flex-1 truncate text-right text-base font-black leading-tight sm:text-xl">
                  {event?.homeTeam}
                </h1>
                <span className="shrink-0 rounded-md border border-[#344f6f] bg-[#14243a] px-2 py-1 text-xs font-black text-[#ffd500]">
                  {event?.homeScore !== null && event?.awayScore !== null
                    ? `${event?.homeScore} - ${event?.awayScore}`
                    : "VS"}
                </span>
                <h1 className="min-w-0 flex-1 truncate text-left text-base font-black leading-tight sm:text-xl">
                  {event?.awayTeam}
                </h1>
              </div>

              <div className="mt-2 flex items-center justify-center gap-2 text-[11px] text-[#6f89aa]">
                <ShieldCheck size={13} className="text-[#ffd500]" />
                <span>{event?.totalMarkets ?? 0} auto-configured markets</span>
              </div>
            </div>
          </div>

          <nav className="flex gap-1 overflow-x-auto border-t border-[#203955] px-2 py-1.5 sm:px-4">
            {TABS.map((tab) => {
              const count =
                tab.key === "all"
                  ? event?.markets.length ?? 0
                  : event?.grouped?.[tab.key]?.length ?? 0;
              if (tab.key !== "all" && count === 0) return null;

              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`h-8 shrink-0 rounded-md px-3 text-xs font-black uppercase tracking-[0.08em] transition ${
                    activeTab === tab.key
                      ? "bg-[#ffd500] text-[#08111f]"
                      : "bg-[#102035] text-[#8aa4c5] hover:text-white"
                  }`}
                >
                  {tab.label} <span className="opacity-70">{count}</span>
                </button>
              );
            })}
          </nav>
        </header>

        {error ? (
          <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        <main className="grid gap-2 py-3 sm:gap-3 lg:grid-cols-2 2xl:grid-cols-3">
          {displayedMarkets.length === 0 ? (
            <div className="col-span-full grid min-h-[260px] place-items-center rounded-lg border border-dashed border-[#24415f] bg-[#0f1a2d] text-center">
              <div>
                <TrendingUp className="mx-auto h-7 w-7 text-[#496684]" />
                <p className="mt-3 text-sm font-bold text-white">
                  No markets available for this tab
                </p>
                <p className="mt-1 text-xs text-[#7f98b8]">
                  Markets appear automatically as soon as the odds feed provides them.
                </p>
              </div>
            </div>
          ) : (
            displayedMarkets.map((market) => (
              <MarketSection
                key={market.key}
                market={market}
                isSelected={isSelected}
                onSelect={handleSelect}
              />
            ))
          )}
        </main>
      </div>

      {hasSelections ? <BetSlip {...betSlip} /> : null}
    </div>
  );
}
