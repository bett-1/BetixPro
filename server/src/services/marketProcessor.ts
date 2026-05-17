export type MarketTab = "main" | "goals" | "halftime" | "other";

export const MARKET_CONFIG: Record<
  string,
  {
    name: string;
    tab: MarketTab;
    order: number;
    sport?: string[];
  }
> = {
  h2h: {
    name: "1X2 / Match Winner",
    tab: "main",
    order: 1,
  },
  spreads: {
    name: "Handicap",
    tab: "main",
    order: 2,
  },
  totals: {
    name: "Over/Under",
    tab: "goals",
    order: 1,
  },
  btts: {
    name: "Both Teams to Score",
    tab: "goals",
    order: 2,
  },
  h2h_lay: {
    name: "Lay Betting",
    tab: "main",
    order: 3,
  },
  outrights: {
    name: "Outright Winner",
    tab: "other",
    order: 1,
  },
};

export interface ProcessedMarket {
  key: string;
  name: string;
  tab: MarketTab;
  order: number;
  outcomes: ProcessedOutcome[];
  bookmaker: string;
  bookmakerTitle: string;
  lastUpdated: string;
}

export interface ProcessedOutcome {
  name: string;
  price: number;
  point?: number;
  description?: string;
}

type RawBookmaker = {
  key?: string;
  title?: string;
  last_update?: string;
  markets?: RawMarket[];
};

type RawMarket = {
  key?: string;
  outcomes?: RawOutcome[];
};

type RawOutcome = {
  name?: string;
  price?: number;
  point?: number;
};

const PRIORITY_BOOKMAKERS = [
  "bet365",
  "unibet",
  "williamhill",
  "pinnacle",
  "betfair",
  "paddypower",
  "marathonbet",
  "betway",
  "sport888",
  "betsson",
];

function isValidBookmaker(value: unknown): value is RawBookmaker {
  return Boolean(value && typeof value === "object");
}

function formatOutcomeDescription(marketKey: string, outcome: RawOutcome): string {
  const name = typeof outcome.name === "string" ? outcome.name : "";

  switch (marketKey) {
    case "totals":
      return typeof outcome.point === "number" ? `${name} ${outcome.point}` : name;
    case "spreads":
      return typeof outcome.point === "number"
        ? `${name} ${outcome.point > 0 ? "+" : ""}${outcome.point}`
        : name;
    default:
      return name;
  }
}

function formatMarketName(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function processMarketsFromBookmakers(bookmakers: unknown): ProcessedMarket[] {
  if (!Array.isArray(bookmakers) || bookmakers.length === 0) {
    return [];
  }

  const safeBookmakers = bookmakers.filter(isValidBookmaker);
  const marketMap = new Map<string, ProcessedMarket>();
  const orderedBookmakers = [
    ...PRIORITY_BOOKMAKERS.map((key) => safeBookmakers.find((bookmaker) => bookmaker.key === key)).filter(
      (bookmaker): bookmaker is RawBookmaker => Boolean(bookmaker),
    ),
    ...safeBookmakers.filter((bookmaker) => !bookmaker.key || !PRIORITY_BOOKMAKERS.includes(bookmaker.key)),
  ];

  for (const bookmaker of orderedBookmakers) {
    for (const market of bookmaker.markets ?? []) {
      const marketKey = typeof market.key === "string" ? market.key.trim() : "";
      if (!marketKey || marketMap.has(marketKey)) continue;

      const config = MARKET_CONFIG[marketKey];
      const outcomes = (market.outcomes ?? [])
        .filter((outcome) => typeof outcome.name === "string" && typeof outcome.price === "number" && outcome.price > 1)
        .map((outcome) => ({
          name: outcome.name as string,
          price: Number((outcome.price as number).toFixed(2)),
          point: typeof outcome.point === "number" ? outcome.point : undefined,
          description: formatOutcomeDescription(marketKey, outcome),
        }));

      if (outcomes.length === 0) continue;

      marketMap.set(marketKey, {
        key: marketKey,
        name: config?.name ?? formatMarketName(marketKey),
        tab: config?.tab ?? "other",
        order: config?.order ?? 99,
        outcomes,
        bookmaker: bookmaker.key ?? "unknown",
        bookmakerTitle: bookmaker.title ?? bookmaker.key ?? "Bookmaker",
        lastUpdated: bookmaker.last_update ?? new Date().toISOString(),
      });
    }
  }

  return Array.from(marketMap.values()).sort((left, right) => {
    if (left.tab !== right.tab) {
      const tabOrder: Record<MarketTab, number> = { main: 1, goals: 2, halftime: 3, other: 4 };
      return tabOrder[left.tab] - tabOrder[right.tab];
    }

    return left.order - right.order || left.name.localeCompare(right.name);
  });
}

export function groupMarketsByTab(markets: ProcessedMarket[]): Record<MarketTab, ProcessedMarket[]> {
  return {
    main: markets.filter((market) => market.tab === "main").sort((a, b) => a.order - b.order),
    goals: markets.filter((market) => market.tab === "goals").sort((a, b) => a.order - b.order),
    halftime: markets.filter((market) => market.tab === "halftime").sort((a, b) => a.order - b.order),
    other: markets.filter((market) => market.tab === "other").sort((a, b) => a.order - b.order),
  };
}
