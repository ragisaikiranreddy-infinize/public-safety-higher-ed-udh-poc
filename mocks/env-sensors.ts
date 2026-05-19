/**
 * Environmental sensor readings — last 24 hours, per building.
 *
 * One reading per sensor every 30 min for the past 4 hours, plus a couple
 * of older readings. The Thread B anchor — a temp-high reading at WW4 mech
 * room — is included.
 */

import type { EnvSensorReading, EnvSensorKind } from '@/lib/types';
import { isoSeconds, minutesAgo, hoursAgo } from '@/lib/time';
import { rng, randInt, randFloat, pick } from '@/lib/seed';
import { THREAD_B_FAILED_GENERATOR_BUILDING_ID } from './threads';

const r = rng('env-sensors-24h');

const BUILDINGS = [
  'BLD-ADAMS-HALL', 'BLD-CARTER-HALL', 'BLD-MADDOX-HALL',
  'BLD-WEST-WING-3', 'BLD-WEST-WING-4',
  'BLD-MAIN-LIBRARY', 'BLD-STUDENT-UNION',
  'BLD-PD-HQ', 'BLD-ADMIN-HALL', 'BLD-SCIENCE-1',
  'BLD-ARENA', 'BLD-GRAD-TOWER',
];

const KINDS: { kind: EnvSensorKind; unit: string; min: number; max: number; thrLow: number; thrHigh: number }[] = [
  { kind: 'temp', unit: '°F', min: 62, max: 78, thrLow: 55, thrHigh: 82 },
  { kind: 'humidity', unit: '%', min: 30, max: 60, thrLow: 20, thrHigh: 70 },
  { kind: 'co2', unit: 'ppm', min: 380, max: 900, thrLow: 0, thrHigh: 1100 },
];

// =========================================================================
// Thread B anchor — temp-high reading at WW4 mech room
// =========================================================================

const threadBMechHot: EnvSensorReading = {
  id: 'ESR-WW4-MR-TEMP',
  buildingId: THREAD_B_FAILED_GENERATOR_BUILDING_ID,
  sensorTag: 'WW4-MR-TEMP-01',
  kind: 'temp',
  at: isoSeconds(minutesAgo(4)),
  value: 92.4,
  unit: '°F',
  thresholdLow: 55,
  thresholdHigh: 82,
  isAnomalous: true,
};

// =========================================================================
// Procedural — ~140 readings (12 buildings × ~12 readings)
// =========================================================================

const readings: EnvSensorReading[] = [];
let seq = 0;
BUILDINGS.forEach((b) => {
  KINDS.forEach((spec) => {
    for (let i = 0; i < 4; i++) {
      const minBack = i * 30 + randInt(r, 0, 5);
      const value = randFloat(r, spec.min, spec.max);
      const isAnomalous = value < spec.thrLow || value > spec.thrHigh;
      seq++;
      readings.push({
        id: `ESR-${seq.toString().padStart(5, '0')}`,
        buildingId: b,
        sensorTag: `${b.replace('BLD-', '').slice(0, 6)}-${spec.kind.toUpperCase()}-${randInt(r, 1, 6).toString()}`,
        kind: spec.kind,
        at: isoSeconds(minutesAgo(minBack)),
        value: Math.round(value * 10) / 10,
        unit: spec.unit,
        thresholdLow: spec.thrLow,
        thresholdHigh: spec.thrHigh,
        isAnomalous,
      });
    }
  });
});

void hoursAgo;
void pick;

export const ENV_SENSOR_READINGS: EnvSensorReading[] = [threadBMechHot, ...readings].sort(
  (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime(),
);
