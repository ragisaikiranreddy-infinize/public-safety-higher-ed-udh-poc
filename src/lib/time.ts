/**
 * Time anchor for the Public Safety / Higher Ed UDH POC.
 *
 * Every timestamp in /mocks derives from ANCHOR — frozen at the moment this
 * module loads. Narratives use only relative phrases ("yesterday", "past 3
 * hours", "this semester") so the data reads fresh on any demo date.
 *
 * Hard rules (per docs/implementation-plan.md §15):
 *   1. No hardcoded ISO strings in /mocks. Use these helpers.
 *   2. Narrative copy uses relative phrases only — no weekdays, no months.
 *   3. SQL in mock-AI uses CURRENT_DATE - INTERVAL 'N days', never literal dates.
 *   4. Procedural time-series is seeded via src/lib/seed.ts.
 *   5. ANCHOR pinned to dispatcher-local 14:00 — mid-shift, all surfaces feel
 *      live whether a demo is at 9am or 9pm of a real day.
 */

export const ANCHOR: Date = (() => {
  const now = new Date();
  // Pin time-of-day to 14:00 campus-local (mid-day shift) so phrases like
  // "this hour" / "this afternoon" read consistently regardless of when the
  // demo runs.
  now.setHours(14, 0, 0, 0);
  return now;
})();

const MS_SEC  = 1_000;
const MS_MIN  = 60 * MS_SEC;
const MS_HOUR = 60 * MS_MIN;
const MS_DAY  = 24 * MS_HOUR;

const offset = (ms: number): Date => new Date(ANCHOR.getTime() + ms);

export const secondsAgo = (n: number): Date => offset(-n * MS_SEC);
export const minutesAgo = (n: number): Date => offset(-n * MS_MIN);
export const hoursAgo   = (n: number): Date => offset(-n * MS_HOUR);
export const daysAgo    = (n: number): Date => offset(-n * MS_DAY);

export const inSeconds = (n: number): Date => offset(n * MS_SEC);
export const inMinutes = (n: number): Date => offset(n * MS_MIN);
export const inHours   = (n: number): Date => offset(n * MS_HOUR);
export const inDays    = (n: number): Date => offset(n * MS_DAY);

/** "Current campus hour" — the as-of time used in narratives. */
export function currentCampusHour(): Date {
  const t = new Date(ANCHOR);
  t.setHours(14, 0, 0, 0);
  return t;
}

/** Array of N dates ending at ANCHOR's day, suitable for chart x-axes. */
export function lastNDays(n: number): Date[] {
  const out: Date[] = [];
  for (let i = n - 1; i >= 0; i--) out.push(daysAgo(i));
  return out;
}

/** Array of N hours ending at ANCHOR — for telemetry / event charts. */
export function lastNHours(n: number): Date[] {
  const out: Date[] = [];
  for (let i = n - 1; i >= 0; i--) out.push(hoursAgo(i));
  return out;
}

/** Array of N minutes ending at ANCHOR — for live tickers, GPS streams. */
export function lastNMinutes(n: number): Date[] {
  const out: Date[] = [];
  for (let i = n - 1; i >= 0; i--) out.push(minutesAgo(i));
  return out;
}

/** ISO string at the second resolution — for dataset.lastUpdated, audit log, etc. */
export function isoSeconds(d: Date): string {
  return d.toISOString().split('.')[0] + 'Z';
}

/** Short label for chart axes, e.g. "Apr 24". */
export function dayLabel(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/** Short label, e.g. "14:00". */
export function hourLabel(d: Date): string {
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
}

/** Current academic semester label. Derived from ANCHOR month. */
export function currentSemester(): 'Fall' | 'Spring' | 'Summer' {
  const m = ANCHOR.getMonth(); // 0-11
  if (m >= 7 && m <= 11) return 'Fall';       // Aug–Dec
  if (m >= 0 && m <= 4) return 'Spring';      // Jan–May
  return 'Summer';                            // Jun–Jul
}

/** Current shift label — used for officer-roster + dispatch narratives. */
export function currentShift(): 'A' | 'B' | 'C' {
  const h = ANCHOR.getHours();
  if (h >= 6 && h < 14) return 'A';   // 06:00–14:00
  if (h >= 14 && h < 22) return 'B';  // 14:00–22:00
  return 'C';                         // 22:00–06:00
}
