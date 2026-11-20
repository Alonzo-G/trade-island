import { readJson, writeJson } from "../../lib/storage";

export const QUOTER_SETTINGS_KEY = "trade-island-quoter";

export type QuoterSettings = {
  unitCost: number;
  marginPercent: number;
  unitsPerPackage: number;
  freightPerPackage: number;
  insurancePercent: number;
  currency: string;
};

export const DEFAULT_QUOTER_SETTINGS: QuoterSettings = {
  unitCost: 10,
  marginPercent: 30,
  unitsPerPackage: 100,
  freightPerPackage: 150,
  insurancePercent: 0,
  currency: "USD",
};

const LIMITS: Record<Exclude<keyof QuoterSettings, "currency">, [number, number]> = {
  unitCost: [0.01, 10_000_000],
  marginPercent: [1, 90],
  unitsPerPackage: [1, 1_000_000],
  freightPerPackage: [0, 10_000_000],
  insurancePercent: [0, 20],
};

function clampNumber(value: unknown, [min, max]: [number, number], fallback: number): number {
  const parsed = typeof value === "number" && Number.isFinite(value) ? value : Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

export function loadQuoterSettings(): QuoterSettings {
  try {
    const stored = readJson(QUOTER_SETTINGS_KEY) as Partial<QuoterSettings> | null;
    if (!stored || typeof stored !== "object") return { ...DEFAULT_QUOTER_SETTINGS };
    const currency = typeof stored.currency === "string" && /^[A-Za-z]{3}$/.test(stored.currency)
      ? stored.currency.toUpperCase() : DEFAULT_QUOTER_SETTINGS.currency;
    return {
      unitCost: clampNumber(stored.unitCost, LIMITS.unitCost, DEFAULT_QUOTER_SETTINGS.unitCost),
      marginPercent: clampNumber(stored.marginPercent, LIMITS.marginPercent, DEFAULT_QUOTER_SETTINGS.marginPercent),
      unitsPerPackage: clampNumber(stored.unitsPerPackage, LIMITS.unitsPerPackage, DEFAULT_QUOTER_SETTINGS.unitsPerPackage),
      freightPerPackage: clampNumber(stored.freightPerPackage, LIMITS.freightPerPackage, DEFAULT_QUOTER_SETTINGS.freightPerPackage),
      insurancePercent: clampNumber(stored.insurancePercent, LIMITS.insurancePercent, DEFAULT_QUOTER_SETTINGS.insurancePercent),
      currency,
    };
  } catch {
    return { ...DEFAULT_QUOTER_SETTINGS };
  }
}

export function saveQuoterSettings(settings: QuoterSettings) {
  writeJson(QUOTER_SETTINGS_KEY, settings);
}
