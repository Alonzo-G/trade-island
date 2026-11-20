import { readJson, writeJson } from "../../lib/storage";
import type { FxRates } from "./api";

/** localStorage key (trade edition, its own prefix keeps the shared contract list clean). */
export const FX_CACHE_KEY = "trade-island-fx-cache";

export type FxCache = {
  rates: FxRates;
  savedAt: number;
};

export function loadFxCache(): FxCache {
  const fallback: FxCache = {
    rates: { fetchedAt: 0, nextUpdateAt: 0, base: "USD", rates: [] },
    savedAt: 0,
  };
  try {
    const stored = readJson(FX_CACHE_KEY) as FxCache | null;
    if (!stored || typeof stored !== "object") return fallback;
    const rates = stored.rates;
    if (!rates || typeof rates !== "object" || !Array.isArray(rates.rates)) return fallback;
    return {
      rates: {
        fetchedAt: typeof rates.fetchedAt === "number" ? rates.fetchedAt : 0,
        nextUpdateAt: typeof rates.nextUpdateAt === "number" ? rates.nextUpdateAt : 0,
        base: typeof rates.base === "string" ? rates.base : "USD",
        rates: rates.rates.flatMap((entry) => {
          if (!Array.isArray(entry) || typeof entry[0] !== "string" || typeof entry[1] !== "number") return [];
          return [[entry[0], entry[1]] as [string, number]];
        }),
      },
      savedAt: typeof stored.savedAt === "number" ? stored.savedAt : 0,
    };
  } catch {
    return fallback;
  }
}

export function saveFxCache(cache: FxCache) {
  writeJson(FX_CACHE_KEY, cache);
}
