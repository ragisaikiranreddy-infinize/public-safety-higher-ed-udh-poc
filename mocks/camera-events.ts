/**
 * VMS camera-analytics events — ~300 over the past 14 days, plus a hand-
 * authored Thread A loitering cluster on CAM-CARTER-N3.
 *
 * Thread A anchor: 11 loitering events at CAM-CARTER-N3 between 22:00–02:00.
 * Each is `analyticKind: 'loitering'` with confidence 0.78–0.92.
 */

import type { CameraEvent } from '@/lib/types';
import { CAMERAS } from './cameras';
import { isoSeconds, daysAgo } from '@/lib/time';
import { rng, randInt, randFloat, pick } from '@/lib/seed';

const r = rng('camera-events-14d');

const KIND_POOL: CameraEvent['analyticKind'][] = [
  'motion', 'motion', 'motion', 'motion',
  'person', 'person', 'person',
  'vehicle', 'vehicle',
  'line-crossing',
  'package-left',
];

const procedural: CameraEvent[] = [];
const cameras = CAMERAS.filter((c) => c.hasAnalytics && c.id !== 'CAM-CARTER-N3');

for (let i = 0; i < 290; i++) {
  const cam = pick(r, cameras);
  const dayBack = randInt(r, 0, 14);
  const t = daysAgo(dayBack);
  t.setHours(randInt(r, 0, 23), randInt(r, 0, 59), randInt(r, 0, 59), 0);

  procedural.push({
    id: `VEV-${i.toString().padStart(6, '0')}`,
    cameraId: cam.id,
    buildingId: cam.buildingId,
    analyticKind: pick(r, KIND_POOL),
    confidence: randFloat(r, 0.7, 0.98),
    at: isoSeconds(t),
    durationSec: randInt(r, 2, 60),
    classification: 'restricted-investigation',
  });
}

// =========================================================================
// Thread A — 11 curated loitering events at Carter Hall north corner
// =========================================================================

const threadALoitering: CameraEvent[] = [];
const loiteringTimes = [
  { day: 3, h: 23, m: 14, conf: 0.84 },
  { day: 5, h: 22, m: 48, conf: 0.79 },
  { day: 7, h: 23, m: 32, conf: 0.88 },
  { day: 11, h: 0, m: 17, conf: 0.91 },
  { day: 14, h: 23, m: 51, conf: 0.86 },
  { day: 18, h: 1, m: 4, conf: 0.83 },
  { day: 22, h: 22, m: 39, conf: 0.78 },
  { day: 25, h: 23, m: 22, conf: 0.92 },
  { day: 30, h: 0, m: 47, conf: 0.85 },
  { day: 34, h: 23, m: 8, conf: 0.81 },
  { day: 38, h: 1, m: 41, conf: 0.87 },
];

loiteringTimes.forEach((evt, i) => {
  const t = daysAgo(evt.day);
  t.setHours(evt.h, evt.m, randInt(r, 0, 59), 0);
  threadALoitering.push({
    id: `VEV-THREAD-A-${i.toString().padStart(2, '0')}`,
    cameraId: 'CAM-CARTER-N3',
    buildingId: 'BLD-CARTER-HALL',
    analyticKind: 'loitering',
    confidence: evt.conf,
    at: isoSeconds(t),
    durationSec: randInt(r, 90, 480),
    classification: 'restricted-investigation',
    threadTag: 'A',
  });
});

export const CAMERA_EVENTS: CameraEvent[] = [...threadALoitering, ...procedural].sort(
  (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime(),
);
