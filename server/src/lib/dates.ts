// All "day" logic (streaks, once-per-day points, reminder times) happens in the
// user's own timezone, so a jog at 11pm in Mumbai counts for that day.

const formatterCache = new Map<string, Intl.DateTimeFormat>();

function formatterFor(timeZone: string) {
  let f = formatterCache.get(timeZone);
  if (!f) {
    f = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      hourCycle: "h23",
    });
    formatterCache.set(timeZone, f);
  }
  return f;
}

export function isValidTimeZone(timeZone: string): boolean {
  try {
    formatterFor(timeZone);
    return true;
  } catch {
    return false;
  }
}

function parts(timeZone: string, at: Date) {
  const out: Record<string, string> = {};
  for (const p of formatterFor(timeZone).formatToParts(at)) out[p.type] = p.value;
  return out;
}

/** Calendar date (YYYY-MM-DD) in `timeZone` at instant `at`. */
export function localDate(timeZone: string, at: Date = new Date()): string {
  const p = parts(timeZone, at);
  return `${p.year}-${p.month}-${p.day}`;
}

/** Hour of day (0-23) in `timeZone` at instant `at`. */
export function localHour(timeZone: string, at: Date = new Date()): number {
  return Number(parts(timeZone, at).hour);
}

export function addDays(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/**
 * Consecutive days with at least one log, ending today — or yesterday, so a
 * streak isn't shown as broken before the user has had a chance to log today.
 * `datesDesc` must be distinct YYYY-MM-DD strings, newest first.
 */
export function computeStreak(datesDesc: string[], today: string): number {
  if (datesDesc.length === 0) return 0;
  let expected = datesDesc[0] === today ? today : addDays(today, -1);
  let streak = 0;
  for (const d of datesDesc) {
    if (d !== expected) break;
    streak++;
    expected = addDays(expected, -1);
  }
  return streak;
}
