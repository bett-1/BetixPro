import EventCard from "../components/EventCard";
import type { BetSelection } from "../hooks/useBetSlip";
import type { ApiEvent } from "../hooks/useEvents";

type SportEventsProps = {
  events: ApiEvent[];
  onOddsSelect: (selection: BetSelection) => void;
  selectedOdds: Set<string>;
  cardsPerRow?: 2 | 3;
};

function getLeagueIcon(value: string) {
  const league = value.toLowerCase();

  if (league.includes("nba") || league.includes("basketball")) {
    return "🏀";
  }

  if (league.includes("nfl") || league.includes("american")) {
    return "🏈";
  }

  if (league.includes("tennis")) {
    return "🎾";
  }

  return "⚽";
}

function formatKickoffTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function SportEvents({
  events,
  onOddsSelect,
  selectedOdds,
  cardsPerRow = 2,
}: SportEventsProps) {
  const eventGridClassName =
    cardsPerRow === 3 ? "md:grid-cols-2 xl:grid-cols-3" : "lg:grid-cols-2";

  const groupedEvents = events.reduce<Record<string, ApiEvent[]>>(
    (groups, event) => {
      const key = event.leagueName ?? "Featured Matches";
      const currentLeagueEvents = groups[key] ?? [];
      groups[key] = [...currentLeagueEvents, event].sort(
        (a, b) =>
          new Date(a.commenceTime).getTime() -
          new Date(b.commenceTime).getTime(),
      );
      return groups;
    },
    {},
  );

  return (
    <div className="space-y-5">
      {Object.entries(groupedEvents).map(([leagueName, leagueEvents]) => (
        <section
          key={leagueName}
          className="overflow-hidden rounded-2xl border border-[#22384b] bg-[linear-gradient(180deg,#0f1d2d_0%,#0b1522_100%)] shadow-[0_18px_40px_rgba(0,0,0,0.22)]"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#24384c] bg-[linear-gradient(90deg,#132338_0%,#101b2b_100%)] px-4 py-3">
            <div className="flex min-w-0 items-center gap-2">
              <span
                className="flex h-8 w-8 items-center justify-center rounded-full border border-[#2f4963] bg-[#162638] text-sm"
                aria-hidden="true"
              >
                {getLeagueIcon(leagueName)}
              </span>
              <div className="min-w-0">
                <h3 className="truncate text-[11px] font-semibold uppercase tracking-[0.18em] text-[#d7e3ed]">
                  {leagueName}
                </h3>
                <p className="mt-1 text-[11px] text-[#7f93a8]">
                  {leagueEvents.length} match
                  {leagueEvents.length === 1 ? "" : "es"} available
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {leagueEvents[0] ? (
                <p className="shrink-0 rounded-full border border-[#2c445c] bg-[#132235] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-[#8a9bb0]">
                  Kickoff {formatKickoffTime(leagueEvents[0].commenceTime)}
                </p>
              ) : null}
            </div>
          </div>

          <div className={`grid gap-4 p-4 ${eventGridClassName}`}>
            {leagueEvents.map((event) => (
              <EventCard
                key={event.eventId}
                event={event}
                onOddsSelect={onOddsSelect}
                selectedOdds={selectedOdds}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
