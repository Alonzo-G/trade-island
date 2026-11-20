import assert from "node:assert/strict";
import test from "node:test";
import { zoneView, normalizeZones, isValidZone, DEFAULT_ZONES } from "../../src/features/world-clock/zones.ts";

// 2026-11-20 is a Friday; 12:00 UTC is 20:00 in Shanghai and 07:00 in New York.
const fridayNoonUtc = new Date("2026-11-20T12:00:00Z");

test("each zone shows its own date, time and open state", () => {
  const ny = zoneView("America/New_York", "New York", "US", fridayNoonUtc);
  assert.equal(ny.time, "07:00");
  assert.equal(ny.date, "2026-11-20");
  assert.equal(ny.open, false); // before 9
  assert.equal(ny.weekend, false);

  const sh = zoneView("Asia/Shanghai", "Shanghai", "CN", fridayNoonUtc);
  assert.equal(sh.time, "20:00");
  assert.equal(sh.open, false); // after 19

  const london = zoneView("Europe/London", "London", "UK", fridayNoonUtc);
  assert.equal(london.time, "12:00");
  assert.equal(london.open, true); // midday Friday
});

test("a zone's weekend follows its own calendar", () => {
  // 2026-11-21 04:00 UTC is Saturday noon in Shanghai.
  const saturday = zoneView("Asia/Shanghai", "SH", "CN", new Date("2026-11-21T04:00:00Z"));
  assert.equal(saturday.weekend, true);
  assert.equal(saturday.open, false);
});

test("unknown zones are dropped; saved zones survive normalize", () => {
  const kept = normalizeZones([
    { zone: "Mars/Olympus" },
    { zone: "Europe/Paris", label: "Paris", country: "FR", workStart: 8, workEnd: 18 },
    { zone: "Europe/Berlin" },
  ]);
  assert.equal(kept.length, 2);
  assert.equal(kept[0].zone, "Europe/Paris");
  assert.equal(kept[0].workStart, 8);
  assert.equal(kept[1].label, "Berlin");
  assert.deepEqual(normalizeZones(null), DEFAULT_ZONES.map((z) => ({ ...z })));
});

test("hour bounds are clamped; zone validity is checked", () => {
  const [kept] = normalizeZones([{ zone: "Asia/Shanghai", workStart: 99, workEnd: -3 }]);
  assert.equal(kept.workStart, 24);
  assert.equal(kept.workEnd, 0);
  assert.equal(isValidZone("Asia/Shanghai"), true);
  assert.equal(isValidZone("Not/AZone"), false);
});
