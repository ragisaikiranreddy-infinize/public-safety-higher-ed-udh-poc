/**
 * BMS (Building Management System) alarms.
 *
 * Thread B anchor: WW4 generator-fail BMS alarm that surfaced ~5 minutes
 * into the activation. This is the "the platform surfaces operational
 * intelligence in 90 seconds" demo moment.
 */

import type { BMSAlarm, BMSAlarmKind, BMSAlarmSeverity } from '@/lib/types';
import { isoSeconds, daysAgo, hoursAgo, minutesAgo } from '@/lib/time';
import { rng, randInt, pick } from '@/lib/seed';
import { THREAD_B_FAILED_GENERATOR_BUILDING_ID } from './threads';

const r = rng('bms-alarms-30d');

const BUILDINGS = [
  'BLD-ADAMS-HALL', 'BLD-CARTER-HALL', 'BLD-MADDOX-HALL',
  'BLD-WEST-WING-3', 'BLD-WEST-WING-4',
  'BLD-MAIN-LIBRARY', 'BLD-STUDENT-UNION',
  'BLD-PD-HQ', 'BLD-ADMIN-HALL', 'BLD-SCIENCE-1',
  'BLD-ARENA', 'BLD-GRAD-TOWER',
];

const KIND_POOL: BMSAlarmKind[] = [
  'temp-high', 'temp-low', 'humidity-high', 'door-prop',
  'hvac-fault', 'hvac-fault', 'ups-on-battery', 'water-leak',
];

const SEV_POOL: BMSAlarmSeverity[] = ['minor', 'minor', 'major', 'info', 'critical'];

// =========================================================================
// Thread B — the critical alarm
// =========================================================================

const threadBGenFail: BMSAlarm = {
  id: 'BMS-2026-WW4-GEN-FAIL',
  buildingId: THREAD_B_FAILED_GENERATOR_BUILDING_ID,
  systemTag: 'WW4-GEN-01',
  kind: 'generator-fail',
  severity: 'critical',
  at: isoSeconds(minutesAgo(5)),
  acknowledgedAt: isoSeconds(minutesAgo(4.7)),
  detail:
    'Generator failure during transfer test. Cause: fuel-pump pressure fault. Building ' +
    'on UPS battery; estimated runtime 23 min. Facilities dispatched.',
  classification: 'internal',
  threadTag: 'B',
};

// And a sister UPS-on-battery alarm
const threadBUps: BMSAlarm = {
  id: 'BMS-2026-WW4-UPS',
  buildingId: THREAD_B_FAILED_GENERATOR_BUILDING_ID,
  systemTag: 'WW4-UPS-01',
  kind: 'ups-on-battery',
  severity: 'major',
  at: isoSeconds(minutesAgo(5)),
  acknowledgedAt: isoSeconds(minutesAgo(4.6)),
  detail: 'UPS transferred to battery following generator failure.',
  classification: 'internal',
  threadTag: 'B',
};

// =========================================================================
// Procedural — 40 alarms over 30 days
// =========================================================================

const procedural: BMSAlarm[] = [];
for (let i = 0; i < 40; i++) {
  const kind = pick(r, KIND_POOL);
  const severity = pick(r, SEV_POOL);
  const daysBack = randInt(r, 0, 30);
  const t = daysAgo(daysBack);
  t.setHours(randInt(r, 0, 23), randInt(r, 0, 59), 0, 0);

  const ack = severity === 'info' || r() < 0.65;
  const cleared = ack && r() < 0.75;
  procedural.push({
    id: `BMS-${i.toString().padStart(5, '0')}`,
    buildingId: pick(r, BUILDINGS),
    systemTag: pick(r, ['AHU-1', 'AHU-3', 'CHW-1', 'BLR-2', 'GEN-01', 'UPS-A', 'WTR-LEAK-3']),
    kind,
    severity,
    at: isoSeconds(t),
    acknowledgedAt: ack ? isoSeconds(new Date(t.getTime() + 4 * 60 * 1000)) : undefined,
    clearedAt: cleared ? isoSeconds(new Date(t.getTime() + 30 * 60 * 1000)) : undefined,
    detail: 'Routine BMS alarm — included for the operations roll-up.',
    classification: 'internal',
  });
}

void hoursAgo;

export const BMS_ALARMS: BMSAlarm[] = [threadBGenFail, threadBUps, ...procedural].sort(
  (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime(),
);

export const THREAD_B_GENERATOR_FAIL_ALARM = threadBGenFail;
