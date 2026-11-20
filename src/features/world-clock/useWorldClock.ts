import { useEffect, useMemo, useState } from "react";
import { loadZones, saveZones, WORLD_CLOCK_KEY } from "./storage";
import { zoneView, type ZoneView } from "./zones";

/** Minutes between row updates; a minute is precise enough for "are they awake". */
const TICK_MS = 30_000;

/**
 * The customer zones' current time, re-rendered on a slow minute tick. No polling while the
 * page is closed: `enabled` gates the tick.
 */
export function useWorldClock(enabled: boolean) {
  const [zones, setZones] = useState(loadZones);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    if (!enabled) return;
    const timer = window.setInterval(() => setNow(new Date()), TICK_MS);
    return () => window.clearInterval(timer);
  }, [enabled]);

  const views = useMemo<ZoneView[]>(
    () => zones.map((entry) => zoneView(entry.zone, entry.label, entry.country, now, entry.workStart, entry.workEnd)),
    [now, zones],
  );

  return { views, zones, setZones: (next: typeof zones) => { setZones(next); saveZones(next); } };
}

export { WORLD_CLOCK_KEY };
