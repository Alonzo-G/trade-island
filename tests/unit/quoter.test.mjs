import assert from "node:assert/strict";
import test from "node:test";
import { quote } from "../../src/features/quoter/quoter.ts";

const BASE = { unitCost: 12, marginPercent: 30, unitsPerPackage: 100, freightPerPackage: 180, currency: "USD", rate: 1 / 6.69198 };

test("cost, margin and freight become an FOB/CIF quote", () => {
  const result = quote(BASE);
  assert.equal(result.fob, 2.56);
  assert.equal(result.cif, 2.83);
  assert.equal(result.packageValue, 283.07);
  assert.ok(result.cif > result.fob);
});

test("insurance lifts CIF above FOB and scales the package value", () => {
  const insured = quote({ ...BASE, insurancePercent: 2 });
  const plain = quote(BASE);
  assert.ok(insured.cif > plain.cif);
  assert.ok(insured.packageValue > plain.packageValue);
  assert.equal(insured.fob, plain.fob); // insurance does not touch FOB
});

test("out-of-range inputs never produce a quote", () => {
  for (const bad of [
    { ...BASE, unitCost: 0 },
    { ...BASE, unitCost: NaN },
    { ...BASE, marginPercent: 0 },
    { ...BASE, marginPercent: 95 },
    { ...BASE, unitsPerPackage: -1 },
    { ...BASE, freightPerPackage: -5 },
    { ...BASE, insurancePercent: 50 },
    { ...BASE, rate: 0 },
    { ...BASE, rate: Infinity },
    { ...BASE, currency: "USDX" },
    { ...BASE, digits: 9 },
  ]) assert.equal(quote(bad), null, JSON.stringify(bad));
});

test("digits 0 quotes whole units (JPY style)", () => {
  const result = quote({ unitCost: 100, marginPercent: 25, unitsPerPackage: 1, freightPerPackage: 0, currency: "JPY", rate: 1 / 0.047, digits: 0 });
  assert.equal(result.fob, 2837);
  assert.equal(result.cif, 2837);
});
