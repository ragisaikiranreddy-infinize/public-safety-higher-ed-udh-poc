/**
 * Incidents — ~600 procedurally generated over the past 540 days.
 *
 * Distribution shaped to feel realistic:
 *   - Weighted call-type pool (welfare/disorderly/alarm dominate; serious
 *     crime is rare)
 *   - Time-of-day weighted toward evening/weekend
 *   - Geographic distribution favoring residence halls + student union
 *   - Priority distribution: ~3% P1, ~12% P2, ~55% P3, ~30% P4
 *   - Clery geography assigned by building → polygon class
 *
 * Thread anchors:
 *   - INC-2025-08812  — Thread C trigger: sexual assault, BLD-CARTER-HALL,
 *     ~5 months ago, Clery-reportable, Timely Warning issued (TWR-2025-0029)
 *   - INC-2025-04019  — sibling VAWA incident, BLD-MADDOX-HALL (Thread C)
 *   - INC-2025-07217  — sibling VAWA incident, BLD-ADAMS-HALL (Thread C)
 *   - INC-2026-04881  — recent welfare check at Carter Hall (Thread A
 *     surrounds — happens at the same building of concern, but doesn't
 *     directly involve PER-008470)
 */

import type { Incident, CallTypeCode, IncidentStatus, Priority, NIBRSCode, CleryGeographyClass } from '@/lib/types';
import { rng, randInt, randFloat, pick, pickN } from '@/lib/seed';
import { isoSeconds, daysAgo, hoursAgo } from '@/lib/time';
import { BUILDINGS } from './buildings';
import { OFFICERS } from './officers';
import { UNITS } from './units';
import { PERSONS } from './persons';
import {
  THREAD_A_BUILDING_OF_CONCERN_ID,
  THREAD_A_SUBJECT_PERSON_ID,
  THREAD_C_TRIGGERING_INCIDENT_ID,
  THREAD_C_RELATED_INCIDENT_IDS,
  THREAD_C_TIMELY_WARNING_ID,
} from './threads';

// =========================================================================
// Call-type distribution
// =========================================================================

const CALL_TYPE_WEIGHTS: { code: CallTypeCode; weight: number }[] = [
  { code: 'WELFARE-CHECK', weight: 18 },
  { code: 'DISORDERLY', weight: 12 },
  { code: 'ALARM-FIRE', weight: 9 },
  { code: 'ALARM-INTRUSION', weight: 7 },
  { code: 'NOISE', weight: 9 },
  { code: 'SUSPICIOUS', weight: 8 },
  { code: 'LIQUOR-VIOL', weight: 7 },
  { code: 'TRESPASS', weight: 5 },
  { code: 'THEFT-BIKE', weight: 5 },
  { code: 'THEFT-PACKAGE', weight: 4 },
  { code: 'LARCENY', weight: 4 },
  { code: 'MENTAL-HEALTH', weight: 4 },
  { code: 'DRUG-VIOL', weight: 3 },
  { code: 'VANDALISM', weight: 3 },
  { code: 'HARASSMENT', weight: 2 },
  { code: 'MVA', weight: 2 },
  { code: 'ASSAULT', weight: 1 },
  { code: 'BURGLARY', weight: 1 },
  { code: 'DV', weight: 1 },
  { code: 'STALKING', weight: 1 },
  { code: 'ALARM-PANIC', weight: 1 },
  { code: 'WEAPONS', weight: 0.5 },
  { code: 'DUI', weight: 1 },
  { code: 'ASSAULT-SEXUAL', weight: 0.5 },
  { code: 'OTHER', weight: 2 },
];

const TOTAL_WEIGHT = CALL_TYPE_WEIGHTS.reduce((s, c) => s + c.weight, 0);

function pickWeightedCallType(r: () => number): CallTypeCode {
  let roll = r() * TOTAL_WEIGHT;
  for (const c of CALL_TYPE_WEIGHTS) {
    roll -= c.weight;
    if (roll <= 0) return c.code;
  }
  return 'OTHER';
}

// Call-type → typical priority
const PRIORITY_BY_TYPE: Partial<Record<CallTypeCode, Priority>> = {
  'ASSAULT': 1, 'ASSAULT-SEXUAL': 1, 'WEAPONS': 1, 'ALARM-PANIC': 1, 'DV': 1,
  'BURGLARY': 2, 'STALKING': 2, 'MENTAL-HEALTH': 2, 'DUI': 2, 'MVA': 2,
  'ALARM-FIRE': 2, 'ALARM-INTRUSION': 3, 'LIQUOR-VIOL': 3, 'DRUG-VIOL': 3,
  'DISORDERLY': 3, 'NOISE': 4, 'WELFARE-CHECK': 3, 'SUSPICIOUS': 3,
  'TRESPASS': 3, 'THEFT-BIKE': 4, 'THEFT-PACKAGE': 4, 'LARCENY': 3,
  'VANDALISM': 4, 'HARASSMENT': 3, 'OTHER': 4,
};

// Call-type → likely NIBRS code (sparse — only Clery-relevant)
const NIBRS_BY_TYPE: Partial<Record<CallTypeCode, NIBRSCode[]>> = {
  ASSAULT: ['13A'],
  'ASSAULT-SEXUAL': ['13A'],
  BURGLARY: ['23F', '23G', '23H'],
  LARCENY: ['23F'],
  MVA: ['90F'],
  WEAPONS: ['90A'],
  'DRUG-VIOL': ['35A', '35B'],
  'LIQUOR-VIOL': ['90C'],
  STALKING: ['90Z'],
  DV: ['13A'],
  VANDALISM: ['90F'],
  HARASSMENT: ['13B'],
};

// Buildings → Clery geography
const BUILDING_TO_CLERY: Record<string, CleryGeographyClass> = {
  'BLD-ADAMS-HALL': 'on-campus-residential',
  'BLD-CARTER-HALL': 'on-campus-residential',
  'BLD-MADDOX-HALL': 'on-campus-residential',
  'BLD-GRAD-TOWER': 'on-campus-residential',
  'BLD-WEST-WING-3': 'on-campus-residential',
  'BLD-WEST-WING-4': 'on-campus-residential',
  'BLD-MAIN-LIBRARY': 'on-campus',
  'BLD-STUDENT-UNION': 'on-campus',
  'BLD-PD-HQ': 'on-campus',
  'BLD-ADMIN-HALL': 'on-campus',
  'BLD-SCIENCE-1': 'on-campus',
  'BLD-ARENA': 'on-campus',
  'BLD-SOUTH-DECK': 'on-campus',
  'BLD-HEALTH-CTR': 'on-campus',
};

// Time-of-day weights (24 buckets, weekday vs weekend slightly different;
// kept simple — late evening is heavier).
const HOUR_WEIGHTS = [
  3, 3, 2, 1, 1, 1, 2, 3, 5, 6, 5, 5,
  6, 6, 6, 7, 8, 9, 11, 13, 14, 13, 9, 6,
];

function pickHour(r: () => number): number {
  const total = HOUR_WEIGHTS.reduce((s, w) => s + w, 0);
  let roll = r() * total;
  for (let i = 0; i < 24; i++) {
    roll -= HOUR_WEIGHTS[i];
    if (roll <= 0) return i;
  }
  return 22;
}

function buildIncidentLocation(buildingId: string | undefined, r: () => number) {
  if (!buildingId) return { lat: 41.5025 + randFloat(r, -0.005, 0.005), lng: -91.5680 + randFloat(r, -0.005, 0.005) };
  const b = BUILDINGS.find((bb) => bb.id === buildingId);
  if (!b) return { lat: 41.5025, lng: -91.5680 };
  return {
    lat: b.centroid.lat + randFloat(r, -0.0004, 0.0004),
    lng: b.centroid.lng + randFloat(r, -0.0005, 0.0005),
  };
}

// =========================================================================
// Procedural generation
// =========================================================================

const r = rng('incidents-600-540d');
const NUM_INCIDENTS = 600;
const WINDOW_DAYS = 540;

const officerIds = OFFICERS.map((o) => o.id);
const unitIds = UNITS.map((u) => u.id);
const personIds = PERSONS.map((p) => p.id);

function generateOne(seq: number): Incident {
  const callType = pickWeightedCallType(r);
  const priority = PRIORITY_BY_TYPE[callType] ?? 3;
  const dayOffset = randInt(r, 0, WINDOW_DAYS);
  const hour = pickHour(r);
  const minute = randInt(r, 0, 59);
  // received_at is "dayOffset days ago" at that hour:minute
  const received = daysAgo(dayOffset);
  received.setHours(hour, minute, 0, 0);

  // Pick a building — 65% have one, 35% are public-property/non-building
  const hasBuilding = r() < 0.65;
  const buildingId = hasBuilding ? pick(r, BUILDINGS.map((b) => b.id)) : undefined;
  const cleryGeo: CleryGeographyClass = buildingId
    ? BUILDING_TO_CLERY[buildingId] ?? 'on-campus'
    : r() < 0.6 ? 'public-property' : 'off-campus';

  // Lifecycle timestamps
  const dispatchOffsetMs = randInt(r, 20_000, 180_000);
  const enrouteOffsetMs = dispatchOffsetMs + randInt(r, 20_000, 120_000);
  const onSceneOffsetMs = enrouteOffsetMs + randInt(r, 60_000, 600_000);
  const clearedOffsetMs = onSceneOffsetMs + randInt(r, 180_000, 3_600_000);

  const status: IncidentStatus =
    dayOffset < 1 && r() < 0.3 ? 'open' :
    dayOffset < 1 && r() < 0.5 ? 'on-scene' :
    r() < 0.04 ? 'pending' :
    r() < 0.01 ? 'unfounded' :
    'cleared';

  const unitsAssigned = pickN(r, unitIds, randInt(r, 1, 3));
  const primaryOfficer = pick(r, officerIds);

  // Involved persons — bias slightly toward people with the right affiliation
  const involvedCount = randInt(r, 0, 3);
  const involvedPersons = pickN(r, personIds, involvedCount);

  // Clery-reportable for serious offenses on/near campus
  const reportableTypes: CallTypeCode[] = [
    'ASSAULT', 'ASSAULT-SEXUAL', 'BURGLARY', 'WEAPONS', 'STALKING',
    'DV', 'DRUG-VIOL', 'LIQUOR-VIOL',
  ];
  const cleryReportable =
    reportableTypes.includes(callType) &&
    (cleryGeo === 'on-campus' || cleryGeo === 'on-campus-residential' || cleryGeo === 'public-property');

  const yyyy = received.getFullYear();
  const id = `INC-${yyyy}-${(seq + 1).toString().padStart(5, '0')}`;

  return {
    id,
    cfsNumber: `CFS-${yyyy}-${(seq + 1).toString().padStart(5, '0')}`,
    rmsCaseNumber: cleryReportable && r() < 0.6 ? `${yyyy.toString().slice(2)}-${(seq + 1).toString().padStart(5, '0')}` : undefined,
    status,
    callType,
    priority,
    receivedAt: isoSeconds(received),
    dispatchedAt: status !== 'open' ? isoSeconds(new Date(received.getTime() + dispatchOffsetMs)) : undefined,
    enrouteAt: ['enroute', 'on-scene', 'cleared'].includes(status) ? isoSeconds(new Date(received.getTime() + enrouteOffsetMs)) : undefined,
    onSceneAt: ['on-scene', 'cleared'].includes(status) ? isoSeconds(new Date(received.getTime() + onSceneOffsetMs)) : undefined,
    clearedAt: status === 'cleared' || status === 'unfounded' ? isoSeconds(new Date(received.getTime() + clearedOffsetMs)) : undefined,
    location: buildIncidentLocation(buildingId, r),
    buildingId,
    cleryGeographyClass: cleryGeo,
    cleryReportable,
    reportedByPersonId: r() < 0.7 ? pick(r, personIds) : undefined,
    involvedPersonIds: involvedPersons,
    assignedUnitIds: unitsAssigned,
    primaryOfficerId: primaryOfficer,
    evidenceItemIds: [],
    relatedCameraIds: [],
    relatedDoorEventIds: [],
    relatedCampaignIds: [],
    nibrsOffenseCodes: NIBRS_BY_TYPE[callType] ?? [],
    timelyWarningIssued: cleryReportable && (callType === 'ASSAULT-SEXUAL' || callType === 'WEAPONS') && r() < 0.7,
    asrLineItemIds: [],
    classification: callType === 'ASSAULT-SEXUAL' ? 'restricted-investigation' : 'cji',
  };
}

const procedural: Incident[] = Array.from({ length: NUM_INCIDENTS - 10 }, (_, i) =>
  generateOne(i + 10),
);

// =========================================================================
// Thread-anchored hand-authored incidents (override slots 1-10)
// =========================================================================

const carterHallEvening = (daysAgoVal: number, hour: number, minute: number): Date => {
  const d = daysAgo(daysAgoVal);
  d.setHours(hour, minute, 0, 0);
  return d;
};

// Thread C — INC-2025-08812 (5 months ago, sexual assault, Carter Hall, Timely Warning issued)
const threadCTrigger: Incident = {
  id: THREAD_C_TRIGGERING_INCIDENT_ID,
  cfsNumber: 'CFS-2025-08812',
  rmsCaseNumber: '25-08812',
  status: 'cleared',
  callType: 'ASSAULT-SEXUAL',
  priority: 1,
  receivedAt: isoSeconds(carterHallEvening(152, 2, 17)),
  dispatchedAt: isoSeconds(carterHallEvening(152, 2, 18)),
  enrouteAt: isoSeconds(carterHallEvening(152, 2, 20)),
  onSceneAt: isoSeconds(carterHallEvening(152, 2, 24)),
  clearedAt: isoSeconds(carterHallEvening(152, 4, 38)),
  location: { lat: 41.5051, lng: -91.5708 },
  buildingId: 'BLD-CARTER-HALL',
  cleryGeographyClass: 'on-campus-residential',
  cleryReportable: true,
  reportedByPersonId: undefined,
  involvedPersonIds: ['PER-008471'],
  assignedUnitIds: ['UNIT-105A', 'UNIT-S1'],
  primaryOfficerId: 'OFC-0021',
  evidenceItemIds: ['EVI-2025-08812-001'],
  relatedCameraIds: ['CAM-CARTER-N3', 'CAM-CARTER-MAIN'],
  relatedDoorEventIds: [],
  relatedCampaignIds: [],
  nibrsOffenseCodes: ['13A'],
  timelyWarningIssued: true,
  timelyWarningDecisionId: THREAD_C_TIMELY_WARNING_ID,
  asrLineItemIds: ['ASR-2025-RESHALL-SEXOFF'],
  classification: 'restricted-investigation',
  threadTag: 'C',
};

// Two related sibling incidents that Thread C aggregates
const threadCSibling1: Incident = {
  id: THREAD_C_RELATED_INCIDENT_IDS[0], // INC-2025-04019
  cfsNumber: 'CFS-2025-04019',
  rmsCaseNumber: '25-04019',
  status: 'cleared',
  callType: 'ASSAULT-SEXUAL',
  priority: 1,
  receivedAt: isoSeconds(carterHallEvening(312, 1, 42)),
  dispatchedAt: isoSeconds(carterHallEvening(312, 1, 44)),
  enrouteAt: isoSeconds(carterHallEvening(312, 1, 46)),
  onSceneAt: isoSeconds(carterHallEvening(312, 1, 51)),
  clearedAt: isoSeconds(carterHallEvening(312, 3, 22)),
  location: { lat: 41.5057, lng: -91.5694 },
  buildingId: 'BLD-MADDOX-HALL',
  cleryGeographyClass: 'on-campus-residential',
  cleryReportable: true,
  involvedPersonIds: [],
  assignedUnitIds: ['UNIT-101A'],
  primaryOfficerId: 'OFC-0021',
  evidenceItemIds: [],
  relatedCameraIds: [],
  relatedDoorEventIds: [],
  relatedCampaignIds: [],
  nibrsOffenseCodes: ['13A'],
  timelyWarningIssued: true,
  asrLineItemIds: ['ASR-2025-RESHALL-SEXOFF'],
  classification: 'restricted-investigation',
  threadTag: 'C',
};

const threadCSibling2: Incident = {
  id: THREAD_C_RELATED_INCIDENT_IDS[1], // INC-2025-07217
  cfsNumber: 'CFS-2025-07217',
  rmsCaseNumber: '25-07217',
  status: 'cleared',
  callType: 'ASSAULT-SEXUAL',
  priority: 1,
  receivedAt: isoSeconds(carterHallEvening(208, 23, 14)),
  dispatchedAt: isoSeconds(carterHallEvening(208, 23, 16)),
  enrouteAt: isoSeconds(carterHallEvening(208, 23, 19)),
  onSceneAt: isoSeconds(carterHallEvening(208, 23, 24)),
  clearedAt: isoSeconds(carterHallEvening(209, 1, 11)),
  location: { lat: 41.5055, lng: -91.5720 },
  buildingId: 'BLD-ADAMS-HALL',
  cleryGeographyClass: 'on-campus-residential',
  cleryReportable: true,
  involvedPersonIds: [],
  assignedUnitIds: ['UNIT-101A', 'UNIT-S1'],
  primaryOfficerId: 'OFC-0124',
  evidenceItemIds: [],
  relatedCameraIds: [],
  relatedDoorEventIds: [],
  relatedCampaignIds: [],
  nibrsOffenseCodes: ['13A'],
  timelyWarningIssued: false, // declined — assessed as no continuing-threat
  asrLineItemIds: ['ASR-2025-RESHALL-SEXOFF'],
  classification: 'restricted-investigation',
  threadTag: 'C',
};

// Thread A surrounding — a recent welfare check at the building of concern
const threadAWelfare: Incident = {
  id: 'INC-2026-04881',
  cfsNumber: 'CFS-2026-04881',
  status: 'cleared',
  callType: 'WELFARE-CHECK',
  priority: 3,
  receivedAt: isoSeconds(hoursAgo(2.3)),
  dispatchedAt: isoSeconds(hoursAgo(2.28)),
  enrouteAt: isoSeconds(hoursAgo(2.25)),
  onSceneAt: isoSeconds(hoursAgo(2.21)),
  clearedAt: isoSeconds(hoursAgo(1.7)),
  location: { lat: 41.5051, lng: -91.5708 },
  buildingId: THREAD_A_BUILDING_OF_CONCERN_ID,
  cleryGeographyClass: 'on-campus-residential',
  cleryReportable: false,
  reportedByPersonId: 'PER-001008',
  involvedPersonIds: [],
  assignedUnitIds: ['UNIT-101A'],
  primaryOfficerId: 'OFC-0124',
  evidenceItemIds: [],
  relatedCameraIds: ['CAM-CARTER-N3'],
  relatedDoorEventIds: [],
  relatedCampaignIds: [],
  nibrsOffenseCodes: [],
  timelyWarningIssued: false,
  asrLineItemIds: [],
  classification: 'cji',
};

// A trespass incident involving Thread A subject (early signal in his history)
const threadAOldTrespass: Incident = {
  id: 'INC-2025-09114',
  cfsNumber: 'CFS-2025-09114',
  status: 'cleared',
  callType: 'TRESPASS',
  priority: 3,
  receivedAt: isoSeconds(carterHallEvening(95, 23, 41)),
  dispatchedAt: isoSeconds(carterHallEvening(95, 23, 43)),
  enrouteAt: isoSeconds(carterHallEvening(95, 23, 46)),
  onSceneAt: isoSeconds(carterHallEvening(95, 23, 51)),
  clearedAt: isoSeconds(carterHallEvening(96, 0, 28)),
  location: { lat: 41.5051, lng: -91.5708 },
  buildingId: THREAD_A_BUILDING_OF_CONCERN_ID,
  cleryGeographyClass: 'on-campus-residential',
  cleryReportable: false,
  reportedByPersonId: undefined,
  involvedPersonIds: [THREAD_A_SUBJECT_PERSON_ID],
  assignedUnitIds: ['UNIT-101A'],
  primaryOfficerId: 'OFC-0124',
  evidenceItemIds: [],
  relatedCameraIds: ['CAM-CARTER-N3'],
  relatedDoorEventIds: [],
  relatedCampaignIds: [],
  nibrsOffenseCodes: [],
  timelyWarningIssued: false,
  asrLineItemIds: [],
  classification: 'cji',
  threadTag: 'A',
};

const handAuthored: Incident[] = [
  threadCTrigger,
  threadCSibling1,
  threadCSibling2,
  threadAWelfare,
  threadAOldTrespass,
  // Plus a few open recent incidents for the dispatcher dashboard
  {
    id: 'INC-2026-04902',
    cfsNumber: 'CFS-2026-04902',
    status: 'on-scene',
    callType: 'NOISE',
    priority: 4,
    receivedAt: isoSeconds(hoursAgo(0.4)),
    dispatchedAt: isoSeconds(hoursAgo(0.38)),
    enrouteAt: isoSeconds(hoursAgo(0.35)),
    onSceneAt: isoSeconds(hoursAgo(0.28)),
    location: { lat: 41.5055, lng: -91.5694 },
    buildingId: 'BLD-MADDOX-HALL',
    cleryGeographyClass: 'on-campus-residential',
    cleryReportable: false,
    involvedPersonIds: [],
    assignedUnitIds: ['UNIT-102B'],
    primaryOfficerId: 'OFC-0127',
    evidenceItemIds: [],
    relatedCameraIds: [],
    relatedDoorEventIds: [],
    relatedCampaignIds: [],
    nibrsOffenseCodes: [],
    timelyWarningIssued: false,
    asrLineItemIds: [],
    classification: 'cji',
  },
  {
    id: 'INC-2026-04903',
    cfsNumber: 'CFS-2026-04903',
    status: 'open',
    callType: 'ALARM-FIRE',
    priority: 2,
    receivedAt: isoSeconds(hoursAgo(0.05)),
    location: { lat: 41.5036, lng: -91.5704 },
    buildingId: 'BLD-MAIN-LIBRARY',
    cleryGeographyClass: 'on-campus',
    cleryReportable: false,
    involvedPersonIds: [],
    assignedUnitIds: [],
    evidenceItemIds: [],
    relatedCameraIds: [],
    relatedDoorEventIds: [],
    relatedCampaignIds: [],
    nibrsOffenseCodes: [],
    timelyWarningIssued: false,
    asrLineItemIds: [],
    classification: 'cji',
  },
];

// =========================================================================
// Final array
// =========================================================================

export const INCIDENTS: Incident[] = [...handAuthored, ...procedural];
