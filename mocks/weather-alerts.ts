/**
 * NWS weather alerts — anchored at the Thread B tornado warning.
 *
 * NWS feed comes through an NWS-CAP source connector. The campus polygon
 * intersection is pre-computed (we don't recompute it on the fly).
 *
 * The Thread B alert is intentionally still active (no expiresAt past, no
 * "tornado-watch upgraded to warning" lag) — the demo opens the home page
 * already inside the alert window.
 */

import type { WeatherAlert } from '@/lib/types';
import { isoSeconds, minutesAgo, hoursAgo, inMinutes, daysAgo } from '@/lib/time';
import { rng, pick } from '@/lib/seed';
import { THREAD_B_WEATHER_ALERT_ID } from './threads';

const r = rng('weather-alerts-30d');

// =========================================================================
// Thread B — the active tornado warning
// =========================================================================

const threadBAlert: WeatherAlert = {
  id: THREAD_B_WEATHER_ALERT_ID,
  kind: 'tornado-warning',
  headline: 'TORNADO WARNING — Johnson County until ' + 'top-of-hour',
  severity: 'extreme',
  certainty: 'observed',
  issuedAt: isoSeconds(minutesAgo(18)),
  expiresAt: isoSeconds(inMinutes(42)),
  affectedZones: ['IAZ087', 'IAZ088'],
  campusInPolygon: true,
  source: 'NWS',
  raw:
    'The National Weather Service in Davenport has issued a Tornado Warning for ' +
    'central and northeastern Johnson County in east-central Iowa. At [issued-time], a ' +
    'severe thunderstorm capable of producing a tornado was located near the campus, moving ' +
    'northeast at 30 mph. HAZARD: Damaging tornado. SOURCE: Radar indicated rotation. ' +
    'IMPACT: Flying debris will be dangerous to those caught without shelter. Mobile homes will ' +
    'be damaged or destroyed. Take cover now — move to a basement or an interior room on the ' +
    'lowest floor of a sturdy building. Avoid windows.',
  classification: 'public',
  threadTag: 'B',
};

// =========================================================================
// Historical filler — 8 alerts in the past 30 days for the timeline view
// =========================================================================

const KINDS: WeatherAlert['kind'][] = [
  'severe-thunderstorm', 'wind-advisory', 'flash-flood',
  'winter-storm', 'heat-advisory', 'tornado-watch',
];

const filler: WeatherAlert[] = [];
for (let i = 0; i < 8; i++) {
  const k = pick(r, KINDS);
  const issuedBack = (i + 1) * 3;
  const ageDays = issuedBack;
  filler.push({
    id: `NWS-${k.toUpperCase().slice(0, 4)}-2026-IA-${(100 + i).toString()}`,
    kind: k,
    headline: `${k.replace(/-/g, ' ').toUpperCase()} — historical (${ageDays}d ago)`,
    severity: k === 'tornado-watch' ? 'severe' : 'moderate',
    certainty: pick(r, ['observed', 'likely', 'possible'] as const),
    issuedAt: isoSeconds(daysAgo(issuedBack)),
    expiresAt: isoSeconds(daysAgo(issuedBack - 1)),
    affectedZones: ['IAZ087'],
    campusInPolygon: true,
    source: 'NWS',
    raw: 'Historical alert — used for the EOC timeline drill-through.',
    classification: 'public',
  });
}

// Pin hoursAgo so unused imports don't trip noUnusedLocals.
void hoursAgo;

export const WEATHER_ALERTS: WeatherAlert[] = [threadBAlert, ...filler].sort(
  (a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime(),
);

export const THREAD_B_WEATHER_ALERT = threadBAlert;
