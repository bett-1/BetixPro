export function isValidOdd(value: unknown): value is number {
  if (
    value === null ||
    value === undefined ||
    value === "—" ||
    value === "-" ||
    value === "--" ||
    value === ""
  ) {
    return false;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0;
}

export function hasCompleteEventOdds(event: {
  markets?: {
    h2h?: { home?: unknown; draw?: unknown; away?: unknown } | null;
  };
}) {
  return (
    isValidOdd(event.markets?.h2h?.home) &&
    isValidOdd(event.markets?.h2h?.draw) &&
    isValidOdd(event.markets?.h2h?.away)
  );
}

export function hasCompleteCustomEventOdds(event: {
  markets?: Array<{
    status?: string;
    selections?: Array<{ odds?: unknown }>;
  }>;
}) {
  return (
    event.markets?.some((market) => {
      if (market.status && market.status !== "OPEN") {
        return false;
      }

      const selections = market.selections ?? [];
      return (
        selections.length >= 2 &&
        selections.every((selection) => isValidOdd(selection.odds))
      );
    }) ?? false
  );
}

export function hasCompleteLiveMatchOdds(match: {
  markets?: Array<{
    selections?: Array<{
      name?: string;
      label?: string;
      odds?: unknown;
      status?: string;
    }>;
  }>;
}) {
  const selections = match.markets?.[0]?.selections ?? [];
  const find = (label: string) =>
    selections.find(
      (selection) =>
        selection.name?.toLowerCase() === label.toLowerCase() ||
        selection.label?.toLowerCase() === label.toLowerCase(),
    );

  return (
    isValidOdd(find("1")?.odds ?? find("Home")?.odds) &&
    isValidOdd(find("X")?.odds ?? find("Draw")?.odds) &&
    isValidOdd(find("2")?.odds ?? find("Away")?.odds)
  );
}
