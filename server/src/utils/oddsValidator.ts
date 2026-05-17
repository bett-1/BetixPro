type OddValue = number | string | null | undefined;

type DisplayedOddLike = {
  marketType?: string | null;
  market?: string | null;
  type?: string | null;
  key?: string | null;
  side?: string | null;
  displayOdds?: OddValue;
  decimalOdds?: OddValue;
  price?: OddValue;
  odd?: OddValue;
  value?: OddValue;
  isVisible?: boolean | null;
};

type MarketLike = {
  name?: string | null;
  market?: string | null;
  marketType?: string | null;
  type?: string | null;
  key?: string | null;
  outcomes?: Array<Record<string, unknown>>;
  values?: Array<Record<string, unknown>>;
  prices?: Array<Record<string, unknown>>;
};

type BookmakerLike = {
  key?: string | null;
  title?: string | null;
  markets?: MarketLike[];
};

function normalize(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function isPositiveOdd(value: unknown): value is number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0;
}

export function isValidOddsData(oddsData: unknown): boolean {
  if (!oddsData || typeof oddsData !== "object") {
    return false;
  }

  const odds = oddsData as Record<string, unknown>;
  return (
    isPositiveOdd(odds.home ?? odds["1"] ?? odds.homeOdd) &&
    isPositiveOdd(odds.draw ?? odds.x ?? odds.X ?? odds.drawOdd) &&
    isPositiveOdd(odds.away ?? odds["2"] ?? odds.awayOdd)
  );
}

function getOddValue(row: Record<string, unknown>) {
  return row.displayOdds ?? row.decimalOdds ?? row.price ?? row.odd ?? row.value;
}

function isH2hMarket(value: unknown) {
  const normalized = normalize(value);
  return (
    normalized === "h2h" ||
    normalized === "1x2" ||
    normalized === "1×2" ||
    normalized === "winner"
  );
}

function sportRequiresDrawOutcome(value: unknown) {
  return normalize(value).startsWith("soccer");
}

function isHomeSide(side: unknown, homeTeam: string) {
  const value = normalize(side);
  return (homeTeam.length > 0 && value === homeTeam) || value === "home" || value === "1";
}

function isDrawSide(side: unknown) {
  const value = normalize(side);
  return value === "draw" || value === "tie" || value === "x";
}

function isAwaySide(side: unknown, awayTeam: string) {
  const value = normalize(side);
  return (awayTeam.length > 0 && value === awayTeam) || value === "away" || value === "2";
}

function hasCompleteDisplayedH2hOdds(event: Record<string, unknown>) {
  const rows = (
    Array.isArray(event.displayedOdds)
      ? event.displayedOdds
      : Array.isArray(event.odds)
        ? event.odds
        : []
  ) as DisplayedOddLike[];

  if (rows.length === 0) {
    return false;
  }

  const h2hRows = rows.filter((row) => {
    const market = row.marketType ?? row.market ?? row.type ?? row.key;
    return isH2hMarket(market) && row.isVisible !== false;
  });

  const homeTeam = normalize(event.homeTeam ?? event.teamHome);
  const awayTeam = normalize(event.awayTeam ?? event.teamAway);
  const requiresDraw = sportRequiresDrawOutcome(event.sportKey ?? event.sport_key);
  if (h2hRows.length < (requiresDraw ? 3 : 2)) {
    return false;
  }
  const hasHome = h2hRows.some(
    (row) =>
      isPositiveOdd(row.displayOdds ?? row.decimalOdds) &&
      isHomeSide(row.side, homeTeam),
  );
  const hasDraw = h2hRows.some(
    (row) =>
      isPositiveOdd(row.displayOdds ?? row.decimalOdds) &&
      isDrawSide(row.side),
  );
  const hasAway = h2hRows.some(
    (row) =>
      isPositiveOdd(row.displayOdds ?? row.decimalOdds) &&
      isAwaySide(row.side, awayTeam),
  );

  return hasHome && hasAway && (!requiresDraw || hasDraw);
}

function hasCompleteMarketArrayOdds(
  markets: MarketLike[],
  homeTeam = "",
  awayTeam = "",
  requiresDraw = false,
) {
  const market1x2 = markets.find((market) =>
    isH2hMarket(
      market.name ?? market.market ?? market.marketType ?? market.type ?? market.key,
    ),
  );

  if (!market1x2) {
    return hasAnyValidMarketOdds(markets);
  }

  const outcomes = market1x2.outcomes ?? market1x2.values ?? market1x2.prices ?? [];
  const minimumOutcomes = requiresDraw ? 3 : 2;
  if (outcomes.length < minimumOutcomes) return false;

  const validOutcomes = outcomes.filter((outcome) =>
    isPositiveOdd(getOddValue(outcome)),
  );
  const hasHome = homeTeam
    ? validOutcomes.some((outcome) =>
        isHomeSide(outcome.name ?? outcome.side ?? outcome.label, homeTeam),
      )
    : validOutcomes.some(
        (outcome) =>
          !isDrawSide(outcome.name ?? outcome.side ?? outcome.label) &&
          !isAwaySide(outcome.name ?? outcome.side ?? outcome.label, awayTeam),
      );
  const hasDraw = validOutcomes.some((outcome) =>
    isDrawSide(outcome.name ?? outcome.side ?? outcome.label),
  );
  const hasAway = awayTeam
    ? validOutcomes.some((outcome) =>
        isAwaySide(outcome.name ?? outcome.side ?? outcome.label, awayTeam),
      )
    : validOutcomes.some(
        (outcome) =>
          !isDrawSide(outcome.name ?? outcome.side ?? outcome.label) &&
          !isHomeSide(outcome.name ?? outcome.side ?? outcome.label, homeTeam),
      );

  return validOutcomes.length >= minimumOutcomes && hasHome && hasAway && (!requiresDraw || hasDraw);
}

function hasAnyValidMarketOdds(markets: MarketLike[]) {
  return markets.some((market) => {
    const outcomes = market.outcomes ?? market.values ?? market.prices ?? [];
    return outcomes.some((outcome) => isPositiveOdd(getOddValue(outcome)) && Number(getOddValue(outcome)) > 1);
  });
}

export function hasAnyPricedOdds(event: unknown): boolean {
  if (!event || typeof event !== "object") return false;
  const row = event as Record<string, unknown>;

  if (!Array.isArray(row.bookmakers) || row.bookmakers.length === 0) {
    return false;
  }

  return row.bookmakers.some((bookmaker) => {
    if (!bookmaker || typeof bookmaker !== "object") return false;
    return hasAnyValidMarketOdds(((bookmaker as BookmakerLike).markets ?? []) as MarketLike[]);
  });
}

export function isValidOdds(event: unknown): boolean {
  if (!event || typeof event !== "object") {
    console.log("[OddsSync] Invalid: event is not an object");
    return false;
  }

  const row = event as { bookmakers?: BookmakerLike[] } & Record<string, unknown>;

  if (!row.bookmakers || !Array.isArray(row.bookmakers)) {
    console.log("[OddsSync] Invalid: no bookmakers array");
    return false;
  }

  if (row.bookmakers.length === 0) {
    console.log("[OddsSync] Invalid: empty bookmakers array");
    return false;
  }

  const bookmakerWithMarkets = row.bookmakers.find(
    (bookmaker) => Array.isArray(bookmaker.markets) && bookmaker.markets.length > 0,
  );

  if (!bookmakerWithMarkets) {
    console.log("[OddsSync] Invalid: no bookmaker has markets", {
      bookmakerKeys: row.bookmakers.map((bookmaker) => bookmaker.key),
    });
    return false;
  }

  const marketWithOutcomes = bookmakerWithMarkets.markets?.find(
    (market) => Array.isArray(market.outcomes) && market.outcomes.length > 0,
  );

  if (!marketWithOutcomes) {
    console.log("[OddsSync] Invalid: no market has outcomes", {
      marketKeys: bookmakerWithMarkets.markets?.map((market) => market.key) ?? [],
    });
    return false;
  }

  const outcomeWithPrice = marketWithOutcomes.outcomes?.find(
    (outcome) => outcome.price !== undefined && outcome.price !== null,
  );

  if (!outcomeWithPrice) {
    console.log("[OddsSync] Invalid: no outcome has a price", {
      outcomes: marketWithOutcomes.outcomes,
    });
    return false;
  }

  return true;
}

export function hasCompleteOdds(event: unknown): boolean {
  try {
    if (!event || typeof event !== "object") {
      return false;
    }

    const row = event as Record<string, unknown>;
    const homeTeam = normalize(row.homeTeam ?? row.teamHome ?? row.home_team);
    const awayTeam = normalize(row.awayTeam ?? row.teamAway ?? row.away_team);
    const requiresDraw = sportRequiresDrawOutcome(row.sportKey ?? row.sport_key);

    if (!row.odds && !row.markets && !row.bookmakers && !row.displayedOdds) {
      return false;
    }

    if (Array.isArray(row.displayedOdds)) {
      return hasCompleteDisplayedH2hOdds(row);
    }

    if (Array.isArray(row.bookmakers)) {
      return row.bookmakers.some((bookmaker) => {
        if (!bookmaker || typeof bookmaker !== "object") return false;
        const markets = (bookmaker as { markets?: MarketLike[] }).markets ?? [];
        return hasCompleteMarketArrayOdds(markets, homeTeam, awayTeam, requiresDraw);
      });
    }

    const odds = row.odds ?? row.markets;
    if (Array.isArray(odds)) {
      return hasCompleteMarketArrayOdds(odds as MarketLike[], homeTeam, awayTeam, requiresDraw);
    }

    if (odds && typeof odds === "object") {
      return isValidOddsData(odds);
    }

    return false;
  } catch (error) {
    console.error("[OddsValidator] Error validating odds:", error);
    return false;
  }
}

export function hasValidCustomEventOdds(event: unknown): boolean {
  try {
    if (!event || typeof event !== "object") {
      return false;
    }

    const markets = (
      event as {
        markets?: Array<{
          status?: string;
          selections?: Array<{ odds?: unknown }>;
        }>;
      }
    ).markets;
    if (!Array.isArray(markets) || markets.length === 0) {
      return false;
    }

    return markets.some((market) => {
      if (market.status && market.status !== "OPEN") {
        return false;
      }

      const selections = market.selections ?? [];
      return (
        selections.length >= 2 &&
        selections.every((selection) => isPositiveOdd(selection.odds))
      );
    });
  } catch (error) {
    console.error("[OddsValidator] Error validating custom event odds:", error);
    return false;
  }
}

export function createCompleteOddsWhere(): {
  AND: Array<{
    displayedOdds: {
      some: {
        isVisible: true;
        marketType: string;
        displayOdds: { gt: number };
      };
    };
  }>;
} {
  return {
    AND: [
      {
        displayedOdds: {
          some: {
            isVisible: true,
            marketType: "h2h",
            displayOdds: { gt: 0 },
          },
        },
      },
    ],
  };
}
