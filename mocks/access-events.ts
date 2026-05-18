/**
 * Access-control door events — ~6,000 procedurally generated over the
 * past 30 days, plus a hand-authored Thread A pattern.
 *
 * Thread A anchor: 47 after-hours card swipes from PER-008470 at
 * DOR-CARTER-MAIN-S (Carter Hall main entry — a building the subject
 * doesn't live in) clustered between 22:00–02:00 over the past 60 days.
 * Each carries:
 *   - isAfterHours = true
 *   - isUnusualBuilding = true (subject's residence is Adams Hall)
 * The Building Intelligence Overlay surfaces this cluster as the access-
 * anomaly heatmap on `/access/buildings/BLD-CARTER-HALL`.
 */

import type { ACSDoorEvent } from '@/lib/types';
import { DOORS } from './doors';
import { PERSONS } from './persons';
import { isoSeconds, daysAgo } from '@/lib/time';
import { rng, randInt, pick } from '@/lib/seed';
import { THREAD_A_SUBJECT_PERSON_ID } from './threads';

const r = rng('access-events-30d');

// Build a per-person preferred-buildings pool so most cardholders access
// their own residence/work building most of the time (and unusualBuilding
// flag stays meaningful).
const personHome = new Map<string, string | undefined>();
PERSONS.forEach((p) => {
  personHome.set(p.id, p.primaryResidenceBuildingId ?? p.primaryWorkBuildingId);
});

// Eligible cardholders — students + employees w/ a home/work building
const eligible = PERSONS.filter((p) => personHome.get(p.id)).slice(0, 130);

const KINDS: ACSDoorEvent['kind'][] = ['granted', 'granted', 'granted', 'granted', 'granted', 'rex', 'denied'];

const NUM_PROCEDURAL = 6000;
const WINDOW_DAYS = 30;

const events: ACSDoorEvent[] = [];

for (let i = 0; i < NUM_PROCEDURAL; i++) {
  const person = pick(r, eligible);
  const homeId = personHome.get(person.id);

  // Most events at home building; some at union/library/admin/science
  const atHome = r() < 0.62;
  let door: typeof DOORS[number] | undefined;
  if (atHome && homeId) {
    door = DOORS.find((d) => d.buildingId === homeId) ?? pick(r, DOORS);
  } else {
    // Public buildings only — Library, Union, Admin, Science
    const publicDoors = DOORS.filter((d) =>
      ['BLD-MAIN-LIBRARY', 'BLD-STUDENT-UNION', 'BLD-ADMIN-HALL', 'BLD-SCIENCE-1'].includes(d.buildingId),
    );
    door = pick(r, publicDoors);
  }

  // Pick timestamp within 30 days
  const dayOffset = randInt(r, 0, WINDOW_DAYS);
  const t = daysAgo(dayOffset);
  // Weighted hour — heavy 08-23, light overnight
  const h = r() < 0.85
    ? randInt(r, 7, 22)
    : randInt(r, 0, 5);
  const m = randInt(r, 0, 59);
  t.setHours(h, m, randInt(r, 0, 59), 0);

  const isAfterHours = h < 7 || h >= 22;
  const isUnusualBuilding = door.buildingId !== homeId && r() < 0.18;
  const isAntiPassback = r() < 0.003;

  const kind = pick(r, KINDS);

  events.push({
    id: `ACS-${i.toString().padStart(7, '0')}`,
    doorId: door.id,
    buildingId: door.buildingId,
    personId: person.id,
    cardholderToken: `OC-${randInt(r, 10000, 99999)}`,
    kind,
    at: isoSeconds(t),
    isAfterHours,
    isUnusualBuilding,
    isAntiPassback,
    classification: 'pii',
  });
}

// =========================================================================
// Thread A anchor — 47 after-hours card swipes
// =========================================================================

function carterEvent(daysAgoVal: number, h: number, m: number, kind: ACSDoorEvent['kind'] = 'granted'): ACSDoorEvent {
  const t = daysAgo(daysAgoVal);
  t.setHours(h, m, randInt(r, 0, 59), 0);
  return {
    id: `ACS-THREAD-A-${daysAgoVal}-${h}${m}`,
    doorId: 'DOR-CARTER-MAIN-S',
    buildingId: 'BLD-CARTER-HALL',
    personId: THREAD_A_SUBJECT_PERSON_ID,
    cardholderToken: 'OC-44192',
    kind,
    at: isoSeconds(t),
    isAfterHours: h >= 22 || h < 6,
    isUnusualBuilding: true, // subject lives in Adams, not Carter
    isAntiPassback: false,
    classification: 'pii',
  };
}

// Distribute 47 after-hours swipes across ~60 days, mostly 22:00–02:00
const threadASwipes: ACSDoorEvent[] = [];
const baseDays = [
  3, 5, 7, 9, 11, 13, 15, 17, 18, 21, 23, 25, 28, 30, 32, 34, 37, 39,
  41, 43, 45, 48, 50, 52, 54, 56, 58, 60,
];
for (let i = 0; i < 47; i++) {
  const dayBack = baseDays[i % baseDays.length] + Math.floor(i / baseDays.length);
  // Weight toward 22:00–02:00
  const hourPool = [22, 22, 23, 23, 23, 0, 0, 1, 1, 2];
  const h = hourPool[i % hourPool.length];
  const m = randInt(r, 0, 59);
  threadASwipes.push(carterEvent(dayBack, h, m));
}

// A few "denied" attempts in the cluster to add color
threadASwipes.push(carterEvent(2, 1, 14, 'denied'));
threadASwipes.push(carterEvent(11, 23, 47, 'denied'));

export const ACCESS_EVENTS: ACSDoorEvent[] = [...threadASwipes, ...events].sort(
  (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime(),
);

/** Pre-computed quick stats for the home page / building intel. */
export const THREAD_A_AFTER_HOURS_COUNT = threadASwipes.filter((e) => e.isAfterHours).length;
