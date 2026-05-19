/**
 * Fire-panel events — historical + a current pre-alarm at WW4.
 *
 * The WW4 pre-alarm is a side-signal of the same generator fault (the
 * mechanical-room thermal sensor is reading high). It's not the demo
 * critical-path but it shows that multi-system correlation works.
 */

import type { FirePanelEvent, FirePanelEventKind } from '@/lib/types';
import { isoSeconds, daysAgo, minutesAgo, hoursAgo } from '@/lib/time';
import { rng, randInt, pick } from '@/lib/seed';

const r = rng('fire-panel-events-60d');

const PANEL_BUILDINGS = [
  'BLD-ADAMS-HALL', 'BLD-CARTER-HALL', 'BLD-MADDOX-HALL',
  'BLD-WEST-WING-3', 'BLD-WEST-WING-4',
  'BLD-MAIN-LIBRARY', 'BLD-STUDENT-UNION',
  'BLD-PD-HQ', 'BLD-ADMIN-HALL', 'BLD-SCIENCE-1',
  'BLD-ARENA', 'BLD-GRAD-TOWER', 'BLD-HEALTH-CTR',
];

const KIND_POOL: FirePanelEventKind[] = [
  'normal', 'normal', 'normal', 'normal',
  'trouble', 'trouble', 'supervisory', 'test', 'pre-alarm',
];

// =========================================================================
// Thread B side-signal — WW4 pre-alarm
// =========================================================================

const threadBPreAlarm: FirePanelEvent = {
  id: 'FPE-WW4-PREALARM',
  buildingId: 'BLD-WEST-WING-4',
  panelId: 'PANEL-WW4-MAIN',
  deviceLabel: 'Mech-room thermal sensor 4-MR-01',
  kind: 'pre-alarm',
  at: isoSeconds(minutesAgo(4.5)),
  classification: 'internal',
};

// =========================================================================
// Procedural — 60 events over 60 days
// =========================================================================

const procedural: FirePanelEvent[] = [];
for (let i = 0; i < 60; i++) {
  const buildingId = pick(r, PANEL_BUILDINGS);
  const kind = pick(r, KIND_POOL);
  const daysBack = randInt(r, 0, 60);
  const t = daysAgo(daysBack);
  t.setHours(randInt(r, 0, 23), randInt(r, 0, 59), randInt(r, 0, 59), 0);

  procedural.push({
    id: `FPE-${i.toString().padStart(5, '0')}`,
    buildingId,
    panelId: `PANEL-${buildingId.replace('BLD-', '').slice(0, 6)}`,
    deviceLabel: pick(r, [
      'Pull-station 1A', 'Pull-station 2B', 'Smoke detector 3-C-04',
      'Heat detector 5-D-12', 'Sprinkler waterflow', 'Duct smoke',
    ]),
    kind,
    at: isoSeconds(t),
    acknowledgedAt: kind === 'normal' ? undefined : isoSeconds(new Date(t.getTime() + 90 * 1000)),
    classification: 'internal',
  });
}

void hoursAgo;

export const FIRE_PANEL_EVENTS: FirePanelEvent[] = [threadBPreAlarm, ...procedural].sort(
  (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime(),
);

export const THREAD_B_FIRE_PRE_ALARM = threadBPreAlarm;
