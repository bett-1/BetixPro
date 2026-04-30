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

  if (h2hRows.length < 3) {
    return false;
  }

  const homeTeam = normalize(event.homeTeam ?? event.teamHome);
  const awayTeam = normalize(event.awayTeam ?? event.teamAway);
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

  return hasHome && hasDraw && hasAway;
}

function hasCompleteMarketArrayOdds(
  markets: MarketLike[],
  homeTeam = "",
  awayTeam = "",
) {
  const market1x2 = markets.find((market) =>
    isH2hMarket(
      market.name ?? market.market ?? market.marketType ?? market.type ?? market.key,
    ),
  );

  if (!market1x2) {
    return false;
  }

  const outcomes =
    market1x2.outcomes ?? market1x2.values ?? market1x2.prices ?? [];

  if (outcomes.length < 3) {
    return false;
  }

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

  return validOutcomes.length >= 3 && hasHome && hasDraw && hasAway;
}

export function hasCompleteOdds(event: unknown): boolean {
  try {
    if (!event || typeof event !== "object") {
      return false;
    }

    const row = event as Record<string, unknown>;
    const homeTeam = normalize(row.homeTeam ?? row.teamHome ?? row.home_team);
    const awayTeam = normalize(row.awayTeam ?? row.teamAway ?? row.away_team);

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
        return hasCompleteMarketArrayOdds(markets, homeTeam, awayTeam);
      });
    }

    const odds = row.odds ?? row.markets;
    if (Array.isArray(odds)) {
      return hasCompleteMarketArrayOdds(odds as MarketLike[], homeTeam, awayTeam);
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
