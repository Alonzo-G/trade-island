/**
 * Quoter math (trade edition): cost + margin + freight → an FOB / CIF quote. Pure and
 * unit-tested, no React, storage or IPC. Money is rounded half-up to `digits`; inputs are
 * finite-checked so a stray NaN can never reach a quote.
 */

export type QuoterInput = {
  /** Unit cost in the working currency (usually CNY). */
  unitCost: number;
  /** Margin as a percent of the selling price, 1–90. */
  marginPercent: number;
  /** Units per package; freight is divided by this to land per-unit. */
  unitsPerPackage: number;
  /** Freight per package (sea/express) in the same currency. */
  freightPerPackage: number;
  /** Optional insurance as a percent of the CIF total. */
  insurancePercent?: number;
  /** Target currency code ("USD", "EUR"…). */
  currency: string;
  /** How many `currency` one unit of the working currency buys (from the fx snapshot). */
  rate: number;
  /** Decimal digits of the quote (2 by default; JPY uses 0). */
  digits?: number;
};

export type QuoterResult = {
  /** FOB per unit, in `currency`, rounded to `digits`. */
  fob: number;
  /** CIF per unit (FOB + freight share + insurance); equals FOB without insurance. */
  cif: number;
  /** The per-unit freight share in `currency`. */
  freightPerUnit: number;
  /** Total quoted value for a package (CIF × units), rounded to `digits`. */
  packageValue: number;
};

const MIN_MARGIN_PERCENT = 1;
const MAX_MARGIN_PERCENT = 90;
const MAX_DIGITS = 6;

function finite(value: number): boolean {
  return Number.isFinite(value);
}

function roundHalfUp(value: number, digits: number): number {
  const scale = 10 ** digits;
  return Math.sign(value) * Math.round(Math.abs(value) * scale + Number.EPSILON) / scale;
}

/**
 * The quote for `input`, or null when any field is out of range: a quote is never guessed
 * from bad numbers, the panel shows the input error instead.
 */
export function quote(input: QuoterInput): QuoterResult | null {
  const { unitCost, marginPercent, unitsPerPackage, freightPerPackage, insurancePercent = 0, currency, rate } = input;
  const digits = input.digits ?? 2;
  if (!finite(unitCost) || unitCost <= 0 || unitCost > 10_000_000) return null;
  if (!finite(marginPercent) || marginPercent < MIN_MARGIN_PERCENT || marginPercent > MAX_MARGIN_PERCENT) return null;
  if (!finite(unitsPerPackage) || unitsPerPackage <= 0 || unitsPerPackage > 1_000_000) return null;
  if (!finite(freightPerPackage) || freightPerPackage < 0 || freightPerPackage > 10_000_000) return null;
  if (!finite(insurancePercent) || insurancePercent < 0 || insurancePercent > 20) return null;
  if (!finite(rate) || rate <= 0 || rate > 10_000) return null;
  if (!/^[A-Za-z]{3}$/.test(currency)) return null;
  if (!Number.isInteger(digits) || digits < 0 || digits > MAX_DIGITS) return null;

  // Margin is on the selling price: unit price = cost / (1 - margin%). Everything stays in
  // the working currency until the end, so the shares and the price stay consistent.
  const priceLocal = unitCost / (1 - marginPercent / 100);
  const freightPerUnit = freightPerPackage / unitsPerPackage;
  const cifLocal = (priceLocal + freightPerUnit) * (1 + insurancePercent / 100);
  return {
    fob: roundHalfUp(priceLocal * rate, digits),
    cif: roundHalfUp(cifLocal * rate, digits),
    freightPerUnit: roundHalfUp(freightPerUnit * rate, digits + 2),
    packageValue: roundHalfUp(cifLocal * rate * unitsPerPackage, digits),
  };
}
