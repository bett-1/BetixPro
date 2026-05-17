/**
 * Event deduplication for the homepage.
 *
 * Each event appears in EXACTLY ONE section. Priority order:
 * 1. Live → "live" section
 * 2. Manually featured (non-live) → "featured" section
 * 3. Auto-featured / boosted (non-live, non-manual) → "boosted" section
 * 4. Everything else → grouped by league
 */

export interface HomepageEvent {
  id: string;
  eventId: string;
  homeTeam: string;
  awayTeam: string;
  leagueName: string | null;
  sportKey: string | null;
  commenceTime: Date | string;
  status: string;
  homeScore: number | null;
  awayScore: number | null;
  isFeatured: boolean;
  featuredManual: boolean;
  featuredAuto: boolean;
  prominenceScore: number;
  [key: string]: unknown;
}

export interface SectionedEvents {
  live: HomepageEvent[];
  featured: HomepageEvent[];
  boosted: HomepageEvent[];
  byLeague: Record<string, HomepageEvent[]>;
}

export function sectionEventsWithoutRedundancy(
  allEvents: HomepageEvent[],
): SectionedEvents {
  const assigned = new Set<string>();

  const live: HomepageEvent[] = [];
  const featured: HomepageEvent[] = [];
  const boosted: HomepageEvent[] = [];
  const byLeague: Record<string, HomepageEvent[]> = {};

  // PASS 1 — Live events get highest priority
  for (const event of allEvents) {
    if (event.status === "LIVE" && !assigned.has(event.id)) {
      live.push(event);
      assigned.add(event.id);
    }
  }

  // PASS 2 — Manually featured (not already live)
  for (const event of allEvents) {
    if (event.featuredManual && !assigned.has(event.id)) {
      featured.push(event);
      assigned.add(event.id);
    }
  }

  // PASS 3 — Auto-featured / boosted odds (not already assigned)
  for (const event of allEvents) {
    if (
      (event.featuredAuto || event.isFeatured) &&
      !assigned.has(event.id)
    ) {
      boosted.push(event);
      assigned.add(event.id);
    }
  }

  // PASS 4 — Everything else grouped by league
  for (const event of allEvents) {
    if (!assigned.has(event.id)) {
      const league = event.leagueName ?? event.sportKey ?? "Other";
      if (!byLeague[league]) byLeague[league] = [];
      byLeague[league].push(event);
      assigned.add(event.id);
    }
  }

  return { live, featured, boosted, byLeague };
}
