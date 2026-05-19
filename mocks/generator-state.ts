/**
 * Generator state — one row per backup generator.
 *
 * Six buildings carry shelter-rated generators. Thread B anchor: WW4 is
 * currently in `failed` state (the demo's operational-intelligence moment).
 */

import type { GeneratorState } from '@/lib/types';
import { isoSeconds, daysAgo, minutesAgo, hoursAgo } from '@/lib/time';
import { rng, randInt } from '@/lib/seed';
import { THREAD_B_FAILED_GENERATOR_BUILDING_ID } from './threads';

const r = rng('generator-state-v1');

const NORMAL_BUILDINGS = [
  'BLD-WEST-WING-3', 'BLD-MAIN-LIBRARY', 'BLD-STUDENT-UNION',
  'BLD-PD-HQ', 'BLD-HEALTH-CTR',
];

const threadBFailed: GeneratorState = {
  id: 'GEN-WW4-01',
  buildingId: THREAD_B_FAILED_GENERATOR_BUILDING_ID,
  mode: 'failed',
  fuelLevelPct: 78,
  runtimeHours: 0,
  lastTestAt: isoSeconds(daysAgo(13)),
  modeChangedAt: isoSeconds(minutesAgo(5)),
  lastFaultDetail: 'Fuel-pump pressure fault during transfer test.',
  classification: 'internal',
};

const normalGenerators: GeneratorState[] = NORMAL_BUILDINGS.map((b, i) => ({
  id: `GEN-${b.replace('BLD-', '')}-${(i + 1).toString().padStart(2, '0')}`,
  buildingId: b,
  mode: 'normal',
  fuelLevelPct: randInt(r, 82, 99),
  runtimeHours: 0,
  lastTestAt: isoSeconds(daysAgo(randInt(r, 4, 28))),
  modeChangedAt: isoSeconds(daysAgo(randInt(r, 60, 220))),
  classification: 'internal',
}));

void hoursAgo;

export const GENERATOR_STATE: GeneratorState[] = [threadBFailed, ...normalGenerators];

export const THREAD_B_GENERATOR_STATE = threadBFailed;
