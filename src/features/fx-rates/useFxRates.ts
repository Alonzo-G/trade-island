import { useCallback, useEffect, useState } from "react";
import { getFxRates } from "./api";
import { loadFxCache, saveFxCache, type FxCache } from "./storage";

/** Currencies the trade ring follows; the order is the display order. */
export const TRACKED_CURRENCIES = ["CNY", "EUR", "GBP", "JPY"] as const;

/**
 * The latest rates, served from the snapshot cache first and refreshed through the native
 * command when the cache's day has rolled over (the endpoint updates daily). While the
 * panel is closed the hook does not poll.
 */
export function useFxRates(enabled: boolean) {
  const [snapshot, setSnapshot] = useState<FxCache>(loadFxCache);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fresh = await getFxRates([...TRACKED_CURRENCIES]);
      const next: FxCache = { rates: fresh, savedAt: Date.now() };
      setSnapshot(next);
      saveFxCache(next);
    } catch (failure) {
      setError(String(failure));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    if (snapshot.rates.rates.length > 0 && Date.now() < snapshot.rates.nextUpdateAt) return;
    void refresh();
  }, [enabled, refresh, snapshot.rates.nextUpdateAt, snapshot.rates.rates.length]);

  return { snapshot: snapshot.rates, cachedAt: snapshot.savedAt, loading, error, refresh };
}
