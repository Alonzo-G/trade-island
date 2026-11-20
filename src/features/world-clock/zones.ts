/**
 * World clock logic (trade edition): customer time zones and whether "now" is inside the
 * receiver's working window, so the island can say "send it now" or "they are asleep".
 * Pure: unit-tested, no React, storage or IPC.
 */

export type ZoneView = {
  zone: string;
  /** City label shown on the row ("New York"); free text from settings. */
  label: string;
  /** Country code shown in the tag ("US"); free text. */
  country: string;
  /** The zone's current date, YYYY-MM-DD, in that zone. */
  date: string;
  /** "HH:MM" in that zone, 24-hour. */
  time: string;
  /** 0–23 in that zone. */
  hour: number;
  /** Good to message now (their 9–19, weekdays by default rules). */
  open: boolean;
  /** Weekend in that zone (Sat or Sun): nobody is at work anyway. */
  weekend: boolean;
};

/** "Asia/Shanghai" → parts of its local time, without any library, via Intl. */
function zoneParts(zone: string, at: Date): { date: string; time: string; hour: number; weekday: number } {
  let formatted: string;
  try {
    formatted = new Intl.DateTimeFormat("en-CA", {
      timeZone: zone, year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", hour12: false, weekday: "short",
    }).format(at);
  } catch {
    return { date: "1970-01-01", time: "00:00", hour: 0, weekday: 7 };
  }
  // en-CA with weekday: "Fri, 2026-11-20, 20:00" — weekday, ISO date, 24-hour time.
  const segments = formatted.split(", ");
  const weekdayText = segments[0] ?? "";
  const date = segments[1] ?? "1970-01-01";
  const timeText = segments[2] ?? "00:00";
  const [hourText, minute] = timeText.split(":");
  const hour = Number(hourText) % 24;
  const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const weekday = weekdays.indexOf(weekdayText.slice(0, 3));
  return { date, time: `${String(hour).padStart(2, "0")}:${minute}`, hour, weekday: weekday < 0 ? 7 : weekday + 1 };
}

/**
 * A zone's view at `at`. `workStart`/`workEnd` are the receiver's working hours (their local
 * time); a zone is "open" between them on a weekday, defaults 9–19.
 */
export function zoneView(zone: string, label: string, country: string, at: Date, workStart = 9, workEnd = 19): ZoneView {
  const { date, time, hour, weekday } = zoneParts(zone, at);
  const weekend = weekday >= 6;
  const open = !weekend && hour >= workStart && hour < workEnd;
  return { zone, label, country, date, time, hour, open, weekend };
}

/** `zones` with valid IANA names kept; an unknown zone is dropped, not guessed. */
export function normalizeZones(value: unknown): { zone: string; label: string; country: string; workStart: number; workEnd: number }[] {
  if (!Array.isArray(value)) return DEFAULT_ZONES.map((z) => ({ ...z }));
  const kept = value.flatMap((item) => {
    const record = (item ?? {}) as Record<string, unknown>;
    const zone = typeof record.zone === "string" && isValidZone(record.zone) ? record.zone : null;
    if (!zone) return [];
    const clampHour = (input: unknown, fallback: number) => {
      const hour = typeof input === "number" && Number.isFinite(input) ? Math.round(input) : fallback;
      return Math.min(24, Math.max(0, hour));
    };
    return [{
      zone,
      label: typeof record.label === "string" && record.label.trim() ? record.label.trim().slice(0, 30) : zone.split("/").pop() ?? zone,
      country: typeof record.country === "string" ? record.country.trim().slice(0, 6) : "",
      workStart: clampHour(record.workStart, 9),
      workEnd: clampHour(record.workEnd, 19),
    }];
  });
  return kept.slice(0, 12);
}

export function isValidZone(zone: string): boolean {
  try {
    new Intl.DateTimeFormat("en-CA", { timeZone: zone }).format(new Date());
    return true;
  } catch {
    return false;
  }
}

/** First-launch customer zones (trade defaults; editable in settings later). */
export const DEFAULT_ZONES: readonly { zone: string; label: string; country: string; workStart: number; workEnd: number }[] = [
  { zone: "America/New_York", label: "New York", country: "US", workStart: 9, workEnd: 19 },
  { zone: "Europe/London", label: "London", country: "UK", workStart: 9, workEnd: 19 },
  { zone: "Europe/Berlin", label: "Berlin", country: "DE", workStart: 9, workEnd: 19 },
  { zone: "Asia/Dubai", label: "Dubai", country: "AE", workStart: 9, workEnd: 19 },
];
