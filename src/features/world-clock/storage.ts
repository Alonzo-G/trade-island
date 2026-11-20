import { readJson, writeJson } from "../../lib/storage";
import { normalizeZones } from "./zones";

export const WORLD_CLOCK_KEY = "trade-island-world-clock-zones";

export function loadZones() {
  return normalizeZones(readJson(WORLD_CLOCK_KEY));
}

export function saveZones(zones: ReturnType<typeof normalizeZones>) {
  writeJson(WORLD_CLOCK_KEY, zones);
}
