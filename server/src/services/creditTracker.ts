import { prisma } from "../lib/prisma";
import { getCreditBalance, getPollingMode, setCreditBalance, setPollingMode, type PollingMode } from "./oddsCache";

type CreditState = {
  used: number | null;
  remaining: number | null;
  lastRequestCost: number | null;
  updatedAt: Date | null;
  pollingMode: PollingMode;
};

const LOW_CREDIT_THRESHOLD = 2_000;
const EMERGENCY_CREDIT_THRESHOLD = 500;

const state: CreditState = {
  used: null,
  remaining: null,
  lastRequestCost: null,
  updatedAt: null,
  pollingMode: "normal",
};

function parseHeaderInt(headers: Headers, name: string) {
  const raw = headers.get(name);
  if (!raw) return null;
  const value = Number.parseInt(raw, 10);
  return Number.isFinite(value) ? value : null;
}

export function modeForRemainingCredits(remaining: number | null): PollingMode {
  if (remaining !== null && remaining < EMERGENCY_CREDIT_THRESHOLD) return "emergency";
  if (remaining !== null && remaining < LOW_CREDIT_THRESHOLD) return "reduced";
  return "normal";
}

export async function recordOddsApiCredits(headers: Headers) {
  const remaining = parseHeaderInt(headers, "x-requests-remaining");
  const used = parseHeaderInt(headers, "x-requests-used");
  const lastRequestCost = parseHeaderInt(headers, "x-requests-last") ?? 1;

  state.remaining = remaining ?? state.remaining;
  state.used = used ?? state.used;
  state.lastRequestCost = lastRequestCost;
  state.updatedAt = new Date();
  state.pollingMode = modeForRemainingCredits(state.remaining);

  if (state.pollingMode === "reduced") {
    console.warn(`[OddsCredits] Remaining credits below 2000 (${state.remaining}); reduced polling enabled.`);
  }

  if (state.pollingMode === "emergency") {
    console.error(`[OddsCredits] Critical credit balance (${state.remaining}); Odds API polling stopped.`);
  }

  await Promise.allSettled([
    state.used !== null && state.remaining !== null
      ? setCreditBalance(state.used, state.remaining)
      : Promise.resolve(),
    setPollingMode(state.pollingMode),
    state.used !== null && state.remaining !== null
      ? prisma.apiCreditLog.create({
          data: {
            used: state.used,
            remaining: state.remaining,
            lastRequestCost,
          },
        })
      : Promise.resolve(),
  ]);

  return getCreditState();
}

export async function hydrateCreditStateFromRedis() {
  try {
    const [balance, mode] = await Promise.all([getCreditBalance(), getPollingMode()]);
    if (balance) {
      state.used = balance.used;
      state.remaining = balance.remaining;
      state.updatedAt = new Date(balance.updatedAt);
    }
    state.pollingMode = modeForRemainingCredits(state.remaining);
    if (mode !== state.pollingMode) {
      await setPollingMode(state.pollingMode).catch(() => undefined);
    }
  } catch (error) {
    console.error("[OddsCredits] Could not hydrate credit state from Redis:", error);
  }

  return getCreditState();
}

export function getCreditState() {
  return { ...state };
}

export function getRemainingCredits(): number {
  return state.remaining ?? Number.POSITIVE_INFINITY;
}

export function getCurrentPollingMode(): PollingMode {
  state.pollingMode = modeForRemainingCredits(state.remaining);
  return state.pollingMode;
}
