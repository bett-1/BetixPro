import { useEffect, useMemo, useState } from "react";
import {
  Edit,
  Lock,
  Plus,
  RefreshCw,
  Unlock,
  Loader2,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/api/axiosConfig";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AdminButton,
  AdminCard,
  AdminSectionHeader,
  InlinePill,
  StatusBadge,
  TableShell,
  adminCompactActionsClassName,
  adminTableCellClassName,
  adminTableClassName,
  adminTableHeadCellClassName,
} from "../../components/ui";

interface ApiOddsGroup {
  eventId: string;
  bookmakers: Array<{
    bookmakerId: string;
    bookmakerName: string;
    markets: Array<{
      marketType: string;
      outcomes: Array<{
        side: string;
        rawOdds: number;
        displayOdds: number;
        isVisible: boolean;
      }>;
    }>;
  }>;
}

interface ConfiguredEvent {
  id: string;
  eventId: string;
  homeTeam: string;
  awayTeam: string;
  leagueName: string | null;
  sportKey: string | null;
  commenceTime: string;
  status: "UPCOMING" | "LIVE" | "FINISHED" | "CANCELLED";
  houseMargin: number;
  marketsEnabled: string[];
  _count: {
    displayedOdds: number;
    bets: number;
  };
}

interface ConfiguredEventsResponse {
  events: ConfiguredEvent[];
  total: number;
}

interface OddsStats {
  totalConfigured: number;
  withOdds: number;
  noOdds: number;
  autoSelected: number;
  bookmakers: number;
}

interface AvailableOddsEvent {
  eventId: string;
  homeTeam: string;
  awayTeam: string;
  leagueName: string | null;
  commenceTime: string;
  status: "UPCOMING" | "LIVE" | "FINISHED" | "CANCELLED";
  visibleOddsCount: number;
  bookmakersCount: number;
  bookmakerNames: string[];
}

interface AvailableOddsEventsResponse {
  events: AvailableOddsEvent[];
  total: number;
}

type OddsEventFilterKey = "configured" | "with_odds" | "no_odds" | "bookmakers";

type OddsTableRow = {
  bookmakerId: string;
  bookmakerName: string;
  event: string;
  market: string;
  selectionOne: string;
  oddsOne: string;
  selectionTwo: string;
  oddsTwo: string;
  selectionThree: string;
  oddsThree: string;
  margin: string;
  status: "active" | "suspended";
  outcomes: Array<{
    side: string;
    rawOdds: number;
    displayOdds: number;
    isVisible: boolean;
  }>;
};

type MovementDirection = "up" | "down";

function toBadgeStatus(status: ConfiguredEvent["status"]) {
  switch (status) {
    case "LIVE":
      return "live" as const;
    case "UPCOMING":
      return "upcoming" as const;
    case "FINISHED":
      return "completed" as const;
    case "CANCELLED":
      return "failed" as const;
  }
}

function findOutcome(outcomes: OddsTableRow["outcomes"], sideNames: string[]) {
  return outcomes.find((outcome) => sideNames.includes(outcome.side));
}

function getSportEmoji(sportKey: string | null) {
  if (!sportKey) return "🏟️";
  if (sportKey.includes("soccer")) return "⚽";
  if (sportKey.includes("basketball")) return "🏀";
  if (sportKey.includes("football")) return "🏈";
  if (sportKey.includes("tennis")) return "🎾";
  return "🏟️";
}

function getErrorMessage(error: unknown, fallback: string) {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as { response?: unknown }).response === "object"
  ) {
    const response = (error as { response?: { data?: { message?: string } } })
      .response;
    const message = response?.data?.message;
    if (message) {
      return message;
    }
  }

  return fallback;
}

function marginTone(margin: number) {
  if (margin < 3) {
    return { className: "text-green-400", label: "Low" };
  }

  if (margin <= 6) {
    return { className: "text-yellow-400", label: "Standard" };
  }

  return { className: "text-red-400", label: "High" };
}

export default function Odds() {
  const [events, setEvents] = useState<ConfiguredEvent[]>([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [activeFilter, setActiveFilter] =
    useState<OddsEventFilterKey>("configured");
  const [selectedEventIds, setSelectedEventIds] = useState<string[]>([]);
  const [eventSearch, setEventSearch] = useState("");
  const [oddsEventSearch, setOddsEventSearch] = useState("");
  const [availableOddsEvents, setAvailableOddsEvents] = useState<
    AvailableOddsEvent[]
  >([]);
  const [availableOddsLoading, setAvailableOddsLoading] = useState(false);
  const [bulkBookmarking, setBulkBookmarking] = useState(false);
  const [bookmarkingEventIds, setBookmarkingEventIds] = useState<
    Record<string, boolean>
  >({});
  const [oddsRows, setOddsRows] = useState<OddsTableRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [autoSelecting, setAutoSelecting] = useState(false);
  const [error, setError] = useState("");
  const [stats, setStats] = useState<OddsStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [selectedOdds, setSelectedOdds] = useState<OddsTableRow | null>(null);
  const [suspendReason, setSuspendReason] = useState("");
  const [editMargin, setEditMargin] = useState("");
  const [customOdds, setCustomOdds] = useState<Record<string, string>>({});
  const [previousOddsByKey, setPreviousOddsByKey] = useState<
    Record<string, number>
  >({});
  const [movementByKey, setMovementByKey] = useState<
    Record<string, MovementDirection>
  >({});

  const selectedEvent = useMemo(
    () => events.find((event) => event.eventId === selectedEventId) ?? null,
    [events, selectedEventId],
  );

  const availableOddsEventsById = useMemo(
    () =>
      availableOddsEvents.reduce<Record<string, AvailableOddsEvent>>(
        (accumulator, event) => {
          accumulator[event.eventId] = event;
          return accumulator;
        },
        {},
      ),
    [availableOddsEvents],
  );

  const searchedEvents = useMemo(() => {
    const q = eventSearch.trim().toLowerCase();
    if (!q) {
      return events;
    }

    return events.filter((event) => {
      return (
        event.homeTeam.toLowerCase().includes(q) ||
        event.awayTeam.toLowerCase().includes(q) ||
        (event.leagueName ?? "").toLowerCase().includes(q)
      );
    });
  }, [events, eventSearch]);

  const filteredEvents = useMemo(() => {
    if (activeFilter === "configured") {
      return searchedEvents;
    }

    if (activeFilter === "with_odds") {
      return searchedEvents.filter((event) => event._count.displayedOdds > 0);
    }

    if (activeFilter === "no_odds") {
      return searchedEvents.filter((event) => event._count.displayedOdds === 0);
    }

    return searchedEvents.filter(
      (event) =>
        (availableOddsEventsById[event.eventId]?.bookmakersCount ?? 0) > 0,
    );
  }, [activeFilter, availableOddsEventsById, searchedEvents]);

  const filteredOddsEvents = useMemo(() => {
    const q = oddsEventSearch.trim().toLowerCase();
    if (!q) {
      return availableOddsEvents;
    }

    return availableOddsEvents.filter((event) => {
      return (
        event.homeTeam.toLowerCase().includes(q) ||
        event.awayTeam.toLowerCase().includes(q) ||
        (event.leagueName ?? "").toLowerCase().includes(q)
      );
    });
  }, [availableOddsEvents, oddsEventSearch]);

  const allFilteredSelected =
    filteredEvents.length > 0 &&
    filteredEvents.every((event) => selectedEventIds.includes(event.eventId));

  const filteredEventsByBookmaker = useMemo(() => {
    return filteredEvents.reduce<Record<string, ConfiguredEvent[]>>(
      (accumulator, event) => {
        const bookmakerNames =
          availableOddsEventsById[event.eventId]?.bookmakerNames ?? [];

        if (!bookmakerNames.length) {
          return accumulator;
        }

        bookmakerNames.forEach((bookmakerName) => {
          accumulator[bookmakerName] = accumulator[bookmakerName] ?? [];
          accumulator[bookmakerName].push(event);
        });

        return accumulator;
      },
      {},
    );
  }, [availableOddsEventsById, filteredEvents]);

  const groupedFilteredEvents = useMemo(() => {
    return filteredEvents.reduce<Record<string, ConfiguredEvent[]>>(
      (accumulator, event) => {
        const league = event.leagueName ?? "Unknown league";
        accumulator[league] = accumulator[league] ?? [];
        accumulator[league].push(event);
        return accumulator;
      },
      {},
    );
  }, [filteredEvents]);

  const bestOddsByColumn = useMemo(() => {
    const visibleRows = oddsRows.filter((row) =>
      row.outcomes.some((outcome) => outcome.isVisible),
    );

    const maxFor = (selector: (row: OddsTableRow) => number | null) => {
      const values = visibleRows
        .map(selector)
        .filter((value): value is number => value !== null && value > 0);

      return values.length ? Math.max(...values) : null;
    };

    return {
      one: maxFor((row) => {
        const value = Number(row.oddsOne);
        return Number.isFinite(value) ? value : null;
      }),
      two: maxFor((row) => {
        const value = Number(row.oddsTwo);
        return Number.isFinite(value) ? value : null;
      }),
      three: maxFor((row) => {
        const value = Number(row.oddsThree);
        return Number.isFinite(value) ? value : null;
      }),
    };
  }, [oddsRows]);

  function movementKey(
    bookmakerId: string,
    marketType: string,
    side: string,
  ): string {
    return `${bookmakerId}::${marketType}::${side}`;
  }

  async function loadStats() {
    setStatsLoading(true);
    try {
      const response = await api.get<OddsStats>("/admin/odds/stats");
      setStats(response.data);
    } catch (requestError) {
      console.error(requestError);
      setError("Unable to load odds stats.");
    } finally {
      setStatsLoading(false);
    }
  }

  async function loadConfiguredEvents() {
    setEventsLoading(true);

    try {
      const response = await api.get<ConfiguredEventsResponse>(
        "/admin/events/configured",
      );

      setEvents(response.data.events);
    } catch (requestError) {
      console.error(requestError);
      const message = getErrorMessage(
        requestError,
        "Unable to load configured games.",
      );
      setError(message);
      toast.error(message);
    } finally {
      setEventsLoading(false);
    }
  }

  async function loadAvailableOddsEvents(options?: { background?: boolean }) {
    if (!options?.background) {
      setAvailableOddsLoading(true);
    }

    try {
      const response = await api.get<AvailableOddsEventsResponse>(
        "/admin/odds/available-events",
      );
      setAvailableOddsEvents(response.data.events);
    } catch (requestError) {
      console.error(requestError);
      const message = getErrorMessage(
        requestError,
        "Unable to load events with odds.",
      );
      setError(message);
      toast.error(message);
    } finally {
      if (!options?.background) {
        setAvailableOddsLoading(false);
      }
    }
  }

  function mapOddsToRows(
    data: ApiOddsGroup,
    currentEvent: ConfiguredEvent | null,
  ) {
    return data.bookmakers.map<OddsTableRow>((bookmaker) => {
      const h2hMarket = bookmaker.markets.find(
        (market) => market.marketType === "h2h",
      );
      const outcomes = h2hMarket?.outcomes ?? [];
      const homeOutcome = currentEvent
        ? findOutcome(outcomes, [currentEvent.homeTeam])
        : outcomes[0];
      const drawOutcome = findOutcome(outcomes, ["Draw"]);
      const awayOutcome = currentEvent
        ? findOutcome(outcomes, [currentEvent.awayTeam])
        : outcomes.find(
            (outcome) => outcome !== homeOutcome && outcome !== drawOutcome,
          );
      const marginValue = outcomes.reduce((sum, outcome) => {
        if (!outcome.displayOdds) return sum;
        return sum + 1 / outcome.displayOdds;
      }, 0);

      return {
        bookmakerId: bookmaker.bookmakerId,
        bookmakerName: bookmaker.bookmakerName,
        event: currentEvent
          ? `${currentEvent.homeTeam} vs ${currentEvent.awayTeam}`
          : data.eventId,
        market: "h2h",
        selectionOne: homeOutcome?.side ?? "-",
        oddsOne: homeOutcome ? String(homeOutcome.displayOdds) : "-",
        selectionTwo: drawOutcome?.side ?? "Draw",
        oddsTwo: drawOutcome ? String(drawOutcome.displayOdds) : "-",
        selectionThree: awayOutcome?.side ?? "-",
        oddsThree: awayOutcome ? String(awayOutcome.displayOdds) : "-",
        margin: `${Math.max((marginValue - 1) * 100, 0).toFixed(1)}%`,
        status: outcomes.some((outcome) => !outcome.isVisible)
          ? "suspended"
          : "active",
        outcomes,
      };
    });
  }

  async function loadOdds(
    eventId: string,
    options?: { trackMovement?: boolean },
  ) {
    setLoading(true);
    setError("");

    try {
      const response = await api.get<ApiOddsGroup>(`/admin/odds/${eventId}`);

      const nextOddsByKey = response.data.bookmakers.reduce<
        Record<string, number>
      >((accumulator, bookmaker) => {
        bookmaker.markets.forEach((market) => {
          market.outcomes.forEach((outcome) => {
            accumulator[
              movementKey(
                bookmaker.bookmakerId,
                market.marketType,
                outcome.side,
              )
            ] = outcome.displayOdds;
          });
        });
        return accumulator;
      }, {});

      if (options?.trackMovement) {
        const nextMovementByKey = Object.entries(nextOddsByKey).reduce<
          Record<string, MovementDirection>
        >((accumulator, [key, nextValue]) => {
          const previousValue = previousOddsByKey[key];
          if (typeof previousValue !== "number") {
            return accumulator;
          }

          if (nextValue > previousValue) {
            accumulator[key] = "up";
          } else if (nextValue < previousValue) {
            accumulator[key] = "down";
          }

          return accumulator;
        }, {});

        setMovementByKey(nextMovementByKey);
      } else {
        setMovementByKey({});
      }

      setPreviousOddsByKey(nextOddsByKey);
      setOddsRows(mapOddsToRows(response.data, selectedEvent));
    } catch (requestError) {
      console.error(requestError);
      const message = getErrorMessage(
        requestError,
        "Unable to load odds for this event.",
      );
      setError(message);
      toast.error(message);
      setOddsRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void Promise.all([
      loadConfiguredEvents(),
      loadStats(),
      loadAvailableOddsEvents(),
    ]);
  }, []);

  useEffect(() => {
    const refreshInterval = window.setInterval(() => {
      void Promise.all([
        loadStats(),
        loadConfiguredEvents(),
        loadAvailableOddsEvents({ background: true }),
      ]);
    }, 12000);

    return () => {
      window.clearInterval(refreshInterval);
    };
  }, []);

  useEffect(() => {
    if (!selectedEventId) {
      setOddsRows([]);
      setPreviousOddsByKey({});
      setMovementByKey({});
      return;
    }

    void loadOdds(selectedEventId);
  }, [selectedEventId, selectedEvent]);

  useEffect(() => {
    if (!selectedEventId) {
      return;
    }

    const interval = window.setInterval(() => {
      void loadOdds(selectedEventId, { trackMovement: true });
    }, 12000);

    return () => {
      window.clearInterval(interval);
    };
  }, [selectedEventId]);

  useEffect(() => {
    setSelectedEventIds((current) =>
      current.filter((eventId) =>
        filteredEvents.some((event) => event.eventId === eventId),
      ),
    );
  }, [filteredEvents]);

  async function handleSyncFeed() {
    setSyncing(true);
    try {
      const response = await api.post<{ synced?: number; message: string }>(
        "/admin/odds/sync",
      );

      if (selectedEventId) {
        await loadOdds(selectedEventId, { trackMovement: true });
      }

      await loadStats();
      toast.success(`✓ ${response.data.message}`);
    } catch (requestError) {
      console.error(requestError);
      const message = getErrorMessage(
        requestError,
        "Unable to sync odds feed.",
      );
      setError(message);
      toast.error(message);
    } finally {
      setSyncing(false);
    }
  }

  async function handleAutoSelectBest() {
    setAutoSelecting(true);

    try {
      if (!selectedEventId) {
        const response = await api.post<{ processed: number; message: string }>(
          "/admin/odds/bulk-auto-select",
        );

        toast.success(
          `✓ Best odds auto-selected for ${response.data.processed} events`,
        );
        await loadStats();
        if (events.length > 0 && !selectedEventId) {
          setSelectedEventId(events[0].eventId);
        }
        return;
      }

      await api.post<{ processed: number; message: string }>(
        "/admin/odds/bulk-auto-select",
        { eventIds: [selectedEventId] },
      );

      await Promise.all([loadOdds(selectedEventId), loadStats()]);
      toast.success("✓ Best odds auto-selected for selected event");
    } catch (requestError) {
      console.error(requestError);
      const message = getErrorMessage(
        requestError,
        "Unable to auto-select best odds.",
      );
      setError(message);
      toast.error(message);
    } finally {
      setAutoSelecting(false);
    }
  }

  function toggleEventSelection(eventId: string, checked: boolean) {
    setSelectedEventIds((current) => {
      if (checked) {
        return current.includes(eventId) ? current : [...current, eventId];
      }

      return current.filter((id) => id !== eventId);
    });
  }

  function toggleSelectAllFiltered(checked: boolean) {
    if (!checked) {
      const filteredIds = new Set(filteredEvents.map((event) => event.eventId));
      setSelectedEventIds((current) =>
        current.filter((eventId) => !filteredIds.has(eventId)),
      );
      return;
    }

    const nextIds = Array.from(
      new Set([
        ...selectedEventIds,
        ...filteredEvents.map((event) => event.eventId),
      ]),
    );
    setSelectedEventIds(nextIds);
  }

  async function handleBookmarkSingle(eventId: string) {
    setBookmarkingEventIds((current) => ({ ...current, [eventId]: true }));

    try {
      await api.post<{ processed: number; message: string }>(
        "/admin/odds/bulk-auto-select",
        { eventIds: [eventId] },
      );

      if (selectedEventId === eventId) {
        await loadOdds(eventId, { trackMovement: true });
      }

      await Promise.all([
        loadStats(),
        loadConfiguredEvents(),
        loadAvailableOddsEvents({ background: true }),
      ]);
      toast.success("✓ Best odds bookmarked for selected event");
    } catch (requestError) {
      console.error(requestError);
      const message = getErrorMessage(
        requestError,
        "Unable to bookmark best odds for this event.",
      );
      setError(message);
      toast.error(message);
    } finally {
      setBookmarkingEventIds((current) => {
        const next = { ...current };
        delete next[eventId];
        return next;
      });
    }
  }

  async function handleBookmarkSelected() {
    const eligibleIds = selectedEventIds.filter((eventId) => {
      const matched = events.find((event) => event.eventId === eventId);
      return Boolean(matched && matched._count.displayedOdds > 0);
    });

    if (!eligibleIds.length) {
      toast.error("Select events with odds before bookmarking.");
      return;
    }

    setBulkBookmarking(true);
    setError("");

    try {
      const response = await api.post<{ processed: number; message: string }>(
        "/admin/odds/bulk-auto-select",
        { eventIds: eligibleIds },
      );

      await Promise.all([
        loadStats(),
        loadConfiguredEvents(),
        loadAvailableOddsEvents({ background: true }),
        selectedEventId
          ? loadOdds(selectedEventId, { trackMovement: true })
          : Promise.resolve(),
      ]);

      toast.success(
        `✓ Best odds bookmarked for ${response.data.processed} events`,
      );
    } catch (requestError) {
      console.error(requestError);
      const message = getErrorMessage(
        requestError,
        "Bulk bookmark failed. No changes were saved.",
      );
      setError(message);
      toast.error(message);
    } finally {
      setBulkBookmarking(false);
    }
  }

  async function handleVisibility(row: OddsTableRow, nextIsVisible: boolean) {
    if (!selectedEventId) {
      return;
    }

    const previousRows = oddsRows;
    const nextRows: OddsTableRow[] = oddsRows.map((currentRow) =>
      currentRow.bookmakerId === row.bookmakerId
        ? {
            ...currentRow,
            status: nextIsVisible ? "active" : "suspended",
            outcomes: currentRow.outcomes.map((outcome) => ({
              ...outcome,
              isVisible: nextIsVisible,
            })),
          }
        : currentRow,
    );

    setOddsRows(nextRows);

    try {
      await Promise.all(
        row.outcomes.map((outcome) =>
          api.patch(`/admin/odds/${selectedEventId}/visibility`, {
            bookmakerId: row.bookmakerId,
            marketType: "h2h",
            side: outcome.side,
            isVisible: nextIsVisible,
          }),
        ),
      );

      await loadStats();
      toast.success(
        nextIsVisible ? "Bookmaker activated" : "Bookmaker suspended",
      );
    } catch (requestError) {
      console.error(requestError);
      setOddsRows(previousRows);
      const message = getErrorMessage(
        requestError,
        "Unable to update bookmaker visibility.",
      );
      setError(message);
      toast.error(message);
    }
  }

  async function handleOverride(row: OddsTableRow) {
    if (!selectedEventId) {
      return;
    }

    try {
      await Promise.all(
        row.outcomes.map((outcome) => {
          const value = customOdds[`${row.bookmakerId}-${outcome.side}`];
          return value
            ? api.post(`/admin/odds/${selectedEventId}/override`, {
                bookmakerId: row.bookmakerId,
                marketType: "h2h",
                side: outcome.side,
                customOdds: Number(value),
              })
            : Promise.resolve();
        }),
      );

      await Promise.all([loadOdds(selectedEventId), loadStats()]);
      toast.success("Odds updated successfully");
    } catch (requestError) {
      console.error(requestError);
      const message = getErrorMessage(requestError, "Unable to override odds.");
      setError(message);
      toast.error(message);
    }
  }

  const skeletonRows = useMemo(
    () =>
      Array.from({ length: 4 }, (_, rowIndex) => (
        <tr
          className="even:bg-[var(--color-bg-elevated)]"
          key={`odds-skeleton-${rowIndex}`}
        >
          {Array.from({ length: 11 }, (_, cellIndex) => (
            <td className={adminTableCellClassName} key={cellIndex}>
              <div className="h-4 w-full rounded bg-admin-surface animate-pulse" />
            </td>
          ))}
        </tr>
      )),
    [],
  );

  return (
    <div className="space-y-6">
      <AdminSectionHeader
        title="Odds Control"
        subtitle="Manage markets, odds, and margins"
        actions={
          <>
            <AdminButton
              variant="ghost"
              onClick={() => void handleSyncFeed()}
              disabled={syncing}
            >
              {syncing ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <RefreshCw size={13} />
              )}
              {syncing ? "Syncing..." : "Sync Feed"}
            </AdminButton>
            <AdminButton
              variant="ghost"
              onClick={() => void handleAutoSelectBest()}
              disabled={
                autoSelecting ||
                eventsLoading ||
                Boolean(selectedEventId && loading)
              }
            >
              {autoSelecting ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  {selectedEventId
                    ? "Processing..."
                    : `Processing ${stats?.totalConfigured ?? events.length} events...`}
                </>
              ) : selectedEventId ? (
                "Auto-select Best"
              ) : (
                "Auto-select All Configured"
              )}
            </AdminButton>
            <AdminButton>
              <Plus size={13} />
              New Market
            </AdminButton>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Configured Games",
            subtitle: "Active events",
            value: stats?.totalConfigured ?? 0,
            tone: "text-admin-blue",
            key: "configured" as OddsEventFilterKey,
          },
          {
            label: "With Odds",
            subtitle: "Ready for users",
            value: stats?.withOdds ?? 0,
            tone: "text-admin-accent",
            key: "with_odds" as OddsEventFilterKey,
          },
          {
            label: "No Odds",
            subtitle: "Needs attention",
            value: stats?.noOdds ?? 0,
            tone: "text-admin-red",
            key: "no_odds" as OddsEventFilterKey,
          },
          {
            label: "Bookmakers",
            subtitle: "Visible sources",
            value: stats?.bookmakers ?? 0,
            tone: "text-admin-gold",
            key: "bookmakers" as OddsEventFilterKey,
          },
        ].map((metric) => (
          <button
            className="text-left"
            key={metric.label}
            onClick={() => setActiveFilter(metric.key)}
            type="button"
          >
            <AdminCard
              className={`p-4 transition ${
                activeFilter === metric.key
                  ? "border-admin-accent ring-1 ring-admin-accent"
                  : ""
              }`}
              interactive
            >
              <p className="text-xs uppercase tracking-[0.08em] text-admin-text-muted">
                {metric.label}
              </p>
              <p className={`mt-2 text-2xl font-bold ${metric.tone}`}>
                {statsLoading ? "..." : metric.value}
              </p>
              <p className="mt-1 text-xs text-admin-text-muted">
                {metric.subtitle}
              </p>
            </AdminCard>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.08em] text-admin-text-muted">
            Select Odds
          </p>
          <Input
            placeholder="Search events with available odds..."
            value={oddsEventSearch}
            onChange={(event) => setOddsEventSearch(event.target.value)}
            className="border-admin-border bg-admin-surface text-admin-text-primary"
          />
          <select
            value={
              availableOddsEventsById[selectedEventId] ? selectedEventId : ""
            }
            onChange={(event) => setSelectedEventId(event.target.value)}
            className="h-9 w-full rounded-lg border border-admin-border bg-admin-surface px-3 text-sm text-admin-text-primary font-medium"
          >
            <option value="">
              {availableOddsLoading
                ? "Loading odds events..."
                : "Choose an event with odds"}
            </option>
            {filteredOddsEvents.map((event) => (
              <option key={event.eventId} value={event.eventId}>
                {`${event.homeTeam} vs ${event.awayTeam} (${event.visibleOddsCount} odds)`}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.08em] text-admin-text-muted">
            Configured Games
          </p>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-admin-text-muted"
              size={14}
            />
            <Input
              placeholder="Search configured games..."
              value={eventSearch}
              onChange={(event) => setEventSearch(event.target.value)}
              className="pl-9 border-admin-border bg-admin-surface text-admin-text-primary"
            />
          </div>

          <select
            value={selectedEventId}
            onChange={(event) => setSelectedEventId(event.target.value)}
            className="h-9 w-full rounded-lg border border-admin-border bg-admin-surface px-3 text-sm text-admin-text-primary font-medium"
          >
            <option value="">
              {eventsLoading
                ? "Loading configured games..."
                : "Select a configured game"}
            </option>
            {Object.entries(groupedFilteredEvents)
              .sort(([left], [right]) => left.localeCompare(right))
              .map(([league, leagueEvents]) => (
                <optgroup key={league} label={league}>
                  {leagueEvents.map((event) => (
                    <option key={event.eventId} value={event.eventId}>
                      {`${getSportEmoji(event.sportKey)} ${event.homeTeam} vs ${event.awayTeam} - ${event.leagueName ?? "League"} - ${new Date(event.commenceTime).toLocaleDateString()} (${event._count.displayedOdds} odds)`}
                    </option>
                  ))}
                </optgroup>
              ))}
          </select>
        </div>
      </div>

      {filteredEvents.length > 0 ? (
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <label className="inline-flex items-center gap-2 text-xs text-admin-text-muted">
              <input
                checked={allFilteredSelected}
                className="h-4 w-4 rounded border-admin-border bg-admin-surface"
                onChange={(event) =>
                  toggleSelectAllFiltered(event.target.checked)
                }
                type="checkbox"
              />
              Select all in current filter
            </label>
            <AdminButton
              size="sm"
              onClick={() => void handleBookmarkSelected()}
              disabled={bulkBookmarking || selectedEventIds.length === 0}
            >
              {bulkBookmarking ? (
                <>
                  <Loader2 className="animate-spin" size={13} />
                  Bookmarking...
                </>
              ) : (
                "Bookmark Best for Selected"
              )}
            </AdminButton>
          </div>

          {activeFilter === "bookmakers" ? (
            <AdminCard className="space-y-4">
              {Object.entries(filteredEventsByBookmaker)
                .sort(([left], [right]) => left.localeCompare(right))
                .map(([bookmakerName, bookmakerEvents]) => (
                  <div key={bookmakerName} className="space-y-2">
                    <p className="text-sm font-semibold text-admin-gold">
                      {bookmakerName}
                    </p>
                    {bookmakerEvents.map((event) => (
                      <div
                        className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-admin-border bg-admin-surface p-3"
                        key={`${bookmakerName}-${event.eventId}`}
                      >
                        <div className="flex min-w-0 items-center gap-2">
                          <input
                            checked={selectedEventIds.includes(event.eventId)}
                            className="h-4 w-4 rounded border-admin-border bg-admin-surface"
                            onChange={(checkboxEvent) =>
                              toggleEventSelection(
                                event.eventId,
                                checkboxEvent.target.checked,
                              )
                            }
                            type="checkbox"
                          />
                          <StatusBadge status={toBadgeStatus(event.status)} />
                          <p className="truncate text-sm font-semibold text-admin-text-primary">
                            {event.homeTeam} vs {event.awayTeam}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="rounded-lg bg-admin-accent-dim px-2 py-1 text-[11px] font-semibold text-admin-accent">
                            ✓ {event._count.displayedOdds} odds
                          </span>
                          <AdminButton
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedEventId(event.eventId)}
                          >
                            View Odds
                          </AdminButton>
                          <AdminButton
                            size="sm"
                            onClick={() =>
                              void handleBookmarkSingle(event.eventId)
                            }
                            disabled={Boolean(
                              bookmarkingEventIds[event.eventId],
                            )}
                          >
                            {bookmarkingEventIds[event.eventId] ? (
                              <Loader2 className="animate-spin" size={13} />
                            ) : (
                              "Bookmark Best"
                            )}
                          </AdminButton>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
            </AdminCard>
          ) : (
            <div className="space-y-3">
              {filteredEvents.map((event) => {
                const hasOdds = event._count.displayedOdds > 0;
                const availableOdds = availableOddsEventsById[event.eventId];

                return (
                  <AdminCard
                    className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"
                    key={event.eventId}
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <input
                        checked={selectedEventIds.includes(event.eventId)}
                        className="h-4 w-4 rounded border-admin-border bg-admin-surface"
                        onChange={(checkboxEvent) =>
                          toggleEventSelection(
                            event.eventId,
                            checkboxEvent.target.checked,
                          )
                        }
                        type="checkbox"
                      />
                      <div>
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          <StatusBadge status={toBadgeStatus(event.status)} />
                          {hasOdds ? (
                            <span className="rounded-lg bg-admin-accent-dim px-2 py-1 text-[11px] font-semibold text-admin-accent">
                              ✓ With Odds
                            </span>
                          ) : (
                            <span className="rounded-lg bg-admin-red-dim px-2 py-1 text-[11px] font-semibold text-admin-red">
                              ✗ No Odds
                            </span>
                          )}
                          <span className="text-[11px] text-admin-text-muted">
                            {event.leagueName ?? "Unknown league"}
                          </span>
                        </div>
                        <p className="text-base font-semibold text-admin-text-primary">
                          {event.homeTeam}{" "}
                          <span className="text-admin-text-muted">vs</span>{" "}
                          {event.awayTeam}
                        </p>
                        <p className="mt-1 text-xs text-admin-text-muted">
                          {new Date(event.commenceTime).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-lg bg-admin-blue-dim px-2 py-1 text-[11px] font-semibold text-admin-blue">
                        {event._count.displayedOdds} odds
                      </span>
                      <span className="rounded-lg bg-admin-gold-dim px-2 py-1 text-[11px] font-semibold text-admin-gold">
                        {availableOdds?.bookmakersCount ?? 0} bookmakers
                      </span>
                      <AdminButton
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedEventId(event.eventId)}
                      >
                        View Odds
                      </AdminButton>
                      {hasOdds ? (
                        <AdminButton
                          size="sm"
                          onClick={() =>
                            void handleBookmarkSingle(event.eventId)
                          }
                          disabled={Boolean(bookmarkingEventIds[event.eventId])}
                        >
                          {bookmarkingEventIds[event.eventId] ? (
                            <Loader2 className="animate-spin" size={13} />
                          ) : (
                            "Bookmark Best"
                          )}
                        </AdminButton>
                      ) : (
                        <span className="rounded-lg border border-admin-red bg-admin-red-dim px-2 py-1 text-[11px] font-semibold text-admin-red">
                          No Odds
                        </span>
                      )}
                    </div>
                  </AdminCard>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <AdminCard>
          <p className="text-sm text-admin-text-muted">
            No configured events match the current filter.
          </p>
        </AdminCard>
      )}

      {error ? (
        <AdminCard>
          <p className="text-sm text-admin-red">{error}</p>
        </AdminCard>
      ) : null}

      {selectedEvent ? (
        <AdminCard className="space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-admin-text-primary">
            <span className="text-xl" role="img" aria-label="sport">
              {getSportEmoji(selectedEvent.sportKey)}
            </span>
            <p className="text-sm font-semibold">
              {selectedEvent.leagueName ?? "Unknown league"}
            </p>
          </div>
          <p className="text-base font-semibold text-admin-text-primary">
            {selectedEvent.homeTeam}{" "}
            <span className="text-admin-text-muted">vs</span>{" "}
            {selectedEvent.awayTeam}
          </p>
          <div className="flex flex-wrap gap-3 text-xs text-admin-text-muted">
            <span>{new Date(selectedEvent.commenceTime).toLocaleString()}</span>
            <span>Status: {selectedEvent.status}</span>
            <span>Margin: {selectedEvent.houseMargin}%</span>
            <span>Markets: {selectedEvent.marketsEnabled.join(", ")}</span>
            <span>{oddsRows.length} bookmakers</span>
            <span>{selectedEvent._count.displayedOdds} odds entries</span>
            <span>{selectedEvent._count.bets} bets placed</span>
          </div>
        </AdminCard>
      ) : null}

      {!selectedEventId ? (
        <AdminCard>
          <p className="text-sm text-admin-text-muted">
            Select a configured event to view odds
          </p>
        </AdminCard>
      ) : (
        <AdminCard>
          <TableShell>
            <table className={adminTableClassName}>
              <thead>
                <tr>
                  {[
                    "Event",
                    "Market",
                    "Selection 1",
                    "Odds",
                    "Selection 2",
                    "Odds",
                    "Selection 3",
                    "Odds",
                    "Margin",
                    "Status",
                    "Actions",
                  ].map((heading) => (
                    <th className={adminTableHeadCellClassName} key={heading}>
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? skeletonRows : null}

                {!loading && oddsRows.length === 0 ? (
                  <tr>
                    <td className={adminTableCellClassName} colSpan={11}>
                      <p className="text-sm text-admin-text-muted">
                        No odds available for this event.
                      </p>
                    </td>
                  </tr>
                ) : null}

                {!loading
                  ? oddsRows.map((row) => {
                      const parsedMargin = Number.parseFloat(row.margin);
                      const tone = marginTone(parsedMargin);
                      const isBestOne =
                        bestOddsByColumn.one !== null &&
                        Number(row.oddsOne) === bestOddsByColumn.one;
                      const isBestTwo =
                        bestOddsByColumn.two !== null &&
                        Number(row.oddsTwo) === bestOddsByColumn.two;
                      const isBestThree =
                        bestOddsByColumn.three !== null &&
                        Number(row.oddsThree) === bestOddsByColumn.three;

                      return (
                        <tr
                          className="even:bg-[var(--color-bg-elevated)]"
                          key={`${row.bookmakerId}-${row.market}`}
                        >
                          <td
                            className={`${adminTableCellClassName} max-w-[160px] truncate font-semibold text-admin-text-primary`}
                          >
                            {row.event}
                          </td>
                          <td className={adminTableCellClassName}>
                            {row.bookmakerName}
                          </td>
                          <td
                            className={`${adminTableCellClassName} text-admin-text-primary`}
                          >
                            {row.selectionOne}
                          </td>
                          <td className={adminTableCellClassName}>
                            <span
                              className={`inline-flex items-center gap-1 ${
                                isBestOne ? "font-bold text-admin-gold" : ""
                              }`}
                            >
                              <InlinePill
                                label={`${isBestOne ? "★ " : ""}${row.oddsOne}`}
                                tone="accent"
                              />
                              {movementByKey[
                                movementKey(
                                  row.bookmakerId,
                                  row.market,
                                  row.selectionOne,
                                )
                              ] === "up" ? (
                                <span className="font-bold text-admin-accent">
                                  ▲
                                </span>
                              ) : movementByKey[
                                  movementKey(
                                    row.bookmakerId,
                                    row.market,
                                    row.selectionOne,
                                  )
                                ] === "down" ? (
                                <span className="font-bold text-admin-red">
                                  ▼
                                </span>
                              ) : null}
                            </span>
                          </td>
                          <td className={adminTableCellClassName}>
                            {row.selectionTwo || "-"}
                          </td>
                          <td className={adminTableCellClassName}>
                            {row.oddsTwo !== "-" ? (
                              <span
                                className={`inline-flex items-center gap-1 ${
                                  isBestTwo ? "font-bold text-admin-gold" : ""
                                }`}
                              >
                                <InlinePill
                                  label={`${isBestTwo ? "★ " : ""}${row.oddsTwo}`}
                                  tone="accent"
                                />
                                {movementByKey[
                                  movementKey(
                                    row.bookmakerId,
                                    row.market,
                                    row.selectionTwo,
                                  )
                                ] === "up" ? (
                                  <span className="font-bold text-admin-accent">
                                    ▲
                                  </span>
                                ) : movementByKey[
                                    movementKey(
                                      row.bookmakerId,
                                      row.market,
                                      row.selectionTwo,
                                    )
                                  ] === "down" ? (
                                  <span className="font-bold text-admin-red">
                                    ▼
                                  </span>
                                ) : null}
                              </span>
                            ) : (
                              "-"
                            )}
                          </td>
                          <td
                            className={`${adminTableCellClassName} text-admin-text-primary`}
                          >
                            {row.selectionThree}
                          </td>
                          <td className={adminTableCellClassName}>
                            <span
                              className={`inline-flex items-center gap-1 ${
                                isBestThree ? "font-bold text-admin-gold" : ""
                              }`}
                            >
                              <InlinePill
                                label={`${isBestThree ? "★ " : ""}${row.oddsThree}`}
                                tone="accent"
                              />
                              {movementByKey[
                                movementKey(
                                  row.bookmakerId,
                                  row.market,
                                  row.selectionThree,
                                )
                              ] === "up" ? (
                                <span className="font-bold text-admin-accent">
                                  ▲
                                </span>
                              ) : movementByKey[
                                  movementKey(
                                    row.bookmakerId,
                                    row.market,
                                    row.selectionThree,
                                  )
                                ] === "down" ? (
                                <span className="font-bold text-admin-red">
                                  ▼
                                </span>
                              ) : null}
                            </span>
                          </td>
                          <td
                            className={`${adminTableCellClassName} font-semibold ${tone.className}`}
                          >
                            {row.margin} ({tone.label})
                          </td>
                          <td className={adminTableCellClassName}>
                            <StatusBadge
                              status={
                                row.status === "active" ? "active" : "suspended"
                              }
                            />
                          </td>
                          <td className={adminTableCellClassName}>
                            <div className={adminCompactActionsClassName}>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <AdminButton
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                      setSelectedOdds(row);
                                      setEditMargin(row.margin);
                                      setCustomOdds(
                                        row.outcomes.reduce<
                                          Record<string, string>
                                        >((accumulator, outcome) => {
                                          accumulator[
                                            `${row.bookmakerId}-${outcome.side}`
                                          ] = String(outcome.displayOdds);
                                          return accumulator;
                                        }, {}),
                                      );
                                    }}
                                  >
                                    <Edit size={11} />
                                  </AdminButton>
                                </DialogTrigger>
                                <DialogContent className="border-admin-border bg-admin-card">
                                  <DialogHeader>
                                    <DialogTitle>Edit Market Odds</DialogTitle>
                                    <DialogDescription>
                                      Adjust odds and margin for this market
                                    </DialogDescription>
                                  </DialogHeader>
                                  {selectedOdds && (
                                    <ScrollArea className="h-[400px] w-full pr-4">
                                      <div className="space-y-4">
                                        <div>
                                          <label className="text-sm font-semibold text-admin-text-primary">
                                            Event
                                          </label>
                                          <p className="mt-1 text-sm text-admin-text-muted">
                                            {selectedOdds.event}
                                          </p>
                                        </div>
                                        <div>
                                          <label className="text-sm font-semibold text-admin-text-primary">
                                            Market
                                          </label>
                                          <p className="mt-1 text-sm text-admin-text-muted">
                                            {selectedOdds.bookmakerName} |{" "}
                                            {selectedOdds.market}
                                          </p>
                                        </div>
                                        {selectedOdds.outcomes.map(
                                          (outcome) => (
                                            <div key={outcome.side}>
                                              <label className="text-sm font-semibold text-admin-text-primary">
                                                {outcome.side}
                                              </label>
                                              <Input
                                                value={
                                                  customOdds[
                                                    `${selectedOdds.bookmakerId}-${outcome.side}`
                                                  ] ??
                                                  String(outcome.displayOdds)
                                                }
                                                onChange={(event) =>
                                                  setCustomOdds(
                                                    (currentOdds) => ({
                                                      ...currentOdds,
                                                      [`${selectedOdds.bookmakerId}-${outcome.side}`]:
                                                        event.target.value,
                                                    }),
                                                  )
                                                }
                                                placeholder="1.50"
                                                className="mt-2 border-admin-border bg-admin-surface text-admin-text-primary"
                                              />
                                            </div>
                                          ),
                                        )}
                                        <div>
                                          <label className="text-sm font-semibold text-admin-text-primary">
                                            Margin %
                                          </label>
                                          <Input
                                            value={editMargin}
                                            onChange={(event) =>
                                              setEditMargin(event.target.value)
                                            }
                                            placeholder="2.5"
                                            className="mt-2 border-admin-border bg-admin-surface text-admin-text-primary"
                                          />
                                        </div>
                                      </div>
                                    </ScrollArea>
                                  )}
                                  <div className="flex gap-2 pt-4">
                                    <Button
                                      variant="outline"
                                      className="flex-1"
                                    >
                                      Cancel
                                    </Button>
                                    <Button
                                      className="flex-1 bg-admin-accent text-black hover:bg-[#00d492]"
                                      onClick={() =>
                                        selectedOdds
                                          ? void handleOverride(selectedOdds)
                                          : undefined
                                      }
                                    >
                                      Save Changes
                                    </Button>
                                  </div>
                                </DialogContent>
                              </Dialog>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <AdminButton
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setSelectedOdds(row)}
                                  >
                                    {row.status === "active" ? (
                                      <Lock size={11} />
                                    ) : (
                                      <Unlock size={11} />
                                    )}
                                  </AdminButton>
                                </DialogTrigger>
                                <DialogContent className="border-admin-border bg-admin-card">
                                  <DialogHeader>
                                    <DialogTitle>
                                      {row.status === "active"
                                        ? "Suspend"
                                        : "Reactivate"}{" "}
                                      Market
                                    </DialogTitle>
                                    <DialogDescription>
                                      {row.status === "active"
                                        ? "Suspend this market from accepting bets"
                                        : "Reactivate this market for new bets"}
                                    </DialogDescription>
                                  </DialogHeader>
                                  {row.status === "active" ? (
                                    <div>
                                      <label className="text-sm font-semibold text-admin-text-primary">
                                        Reason for Suspension
                                      </label>
                                      <Input
                                        placeholder="E.g., Line movement, Technical issue"
                                        value={suspendReason}
                                        onChange={(event) =>
                                          setSuspendReason(event.target.value)
                                        }
                                        className="mt-2 border-admin-border bg-admin-surface text-admin-text-primary"
                                      />
                                    </div>
                                  ) : null}
                                  <div className="flex gap-2 pt-4">
                                    <Button
                                      variant="outline"
                                      className="flex-1"
                                    >
                                      Cancel
                                    </Button>
                                    <Button
                                      className={`flex-1 ${
                                        row.status === "active"
                                          ? "bg-admin-red hover:bg-red-600 text-white"
                                          : "bg-admin-accent text-black hover:bg-[#00d492]"
                                      }`}
                                      onClick={() =>
                                        void handleVisibility(
                                          row,
                                          row.status !== "active",
                                        )
                                      }
                                    >
                                      {row.status === "active"
                                        ? "Suspend"
                                        : "Reactivate"}
                                    </Button>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  : null}
              </tbody>
            </table>
          </TableShell>
        </AdminCard>
      )}
    </div>
  );
}
