/**
 * Clery geography — the 2025 polygon set + audit history.
 *
 * Per 34 CFR 668.46(a), institutions must publish on-campus / on-campus-
 * residential / non-campus / public-property geography. The polygon set is
 * built from the buildings registry plus three public-property strips along
 * the major streets bordering the campus.
 *
 * The Thread C anchor is `CGP-MAIN-CAMPUS-2025` — the certified 2025 set
 * used by the Annual Security Report workspace.
 */

import type {
  CleryPolygon,
  CleryPolygonSet,
  CleryPolygonAuditEntry,
} from '@/lib/types';
import { BUILDINGS, CAMPUS_ANCHOR } from './buildings';
import { isoSeconds, daysAgo } from '@/lib/time';
import { THREAD_C_CLERY_POLYGON_SET_ID, THREAD_C_ASR_YEAR } from './threads';

// =========================================================================
// Build the polygon list from the buildings fixture
// =========================================================================

const buildingPolygons: CleryPolygon[] = BUILDINGS.map((b) => ({
  id: `CGP-BLD-${b.id.replace('BLD-', '')}`,
  name: b.name,
  cleryClass:
    b.kind === 'residential'
      ? 'on-campus-residential'
      : 'on-campus',
  geometry: b.polygon,
  effectiveFrom: isoSeconds(daysAgo(280)),
  buildingId: b.id,
}));

// Public-property strips along the perimeter streets (3 simplified strips)
function strip(centerLatOffset: number, centerLngOffset: number, latHalf: number, lngHalf: number) {
  const cLat = CAMPUS_ANCHOR.lat + centerLatOffset;
  const cLng = CAMPUS_ANCHOR.lng + centerLngOffset;
  return [
    { lat: cLat - latHalf, lng: cLng - lngHalf },
    { lat: cLat - latHalf, lng: cLng + lngHalf },
    { lat: cLat + latHalf, lng: cLng + lngHalf },
    { lat: cLat + latHalf, lng: cLng - lngHalf },
    { lat: cLat - latHalf, lng: cLng - lngHalf }, // close
  ];
}

const publicProperty: CleryPolygon[] = [
  {
    id: 'CGP-PP-NORTH-ST',
    name: 'North St public sidewalk + street',
    cleryClass: 'public-property',
    geometry: strip(0.0048, 0, 0.0003, 0.0070),
    effectiveFrom: isoSeconds(daysAgo(280)),
  },
  {
    id: 'CGP-PP-SOUTH-AVE',
    name: 'South Ave public sidewalk + street',
    cleryClass: 'public-property',
    geometry: strip(-0.0048, 0, 0.0003, 0.0070),
    effectiveFrom: isoSeconds(daysAgo(280)),
  },
  {
    id: 'CGP-PP-WEST-BLVD',
    name: 'West Blvd public sidewalk + street',
    cleryClass: 'public-property',
    geometry: strip(0, -0.0058, 0.0090, 0.0003),
    effectiveFrom: isoSeconds(daysAgo(280)),
  },
];

// Non-campus polygon — the off-site lecture hall used by the medical school
const nonCampus: CleryPolygon = {
  id: 'CGP-NC-DOWNTOWN-LECTURE',
  name: 'Downtown lecture hall (non-campus)',
  cleryClass: 'non-campus',
  geometry: strip(0.0150, 0.0180, 0.0005, 0.0005),
  effectiveFrom: isoSeconds(daysAgo(280)),
};

// =========================================================================
// Audit history — 8 entries spread across the polygon set lifetime
// =========================================================================

const audit: CleryPolygonAuditEntry[] = [
  {
    id: 'CGA-001',
    at: isoSeconds(daysAgo(280)),
    authorPersonId: 'PER-001008',
    changeKind: 'added',
    polygonId: 'CGP-BLD-ADAMS-HALL',
    notes: 'Initial set ingest from facilities CAD master.',
  },
  {
    id: 'CGA-002',
    at: isoSeconds(daysAgo(212)),
    authorPersonId: 'PER-001008',
    changeKind: 'reclassified',
    polygonId: 'CGP-BLD-CARTER-HALL',
    notes: 'Reclassified Carter Hall from on-campus to on-campus-residential after housing assignment change confirmed.',
  },
  {
    id: 'CGA-003',
    at: isoSeconds(daysAgo(186)),
    authorPersonId: 'PER-001008',
    changeKind: 'modified',
    polygonId: 'CGP-PP-NORTH-ST',
    notes: 'Adjusted North St public-property boundary to align with city sidewalk easement update.',
  },
  {
    id: 'CGA-004',
    at: isoSeconds(daysAgo(154)),
    authorPersonId: 'PER-001008',
    changeKind: 'added',
    polygonId: 'CGP-NC-DOWNTOWN-LECTURE',
    notes: 'Added downtown lecture hall to non-campus per medical school usage agreement.',
  },
  {
    id: 'CGA-005',
    at: isoSeconds(daysAgo(140)),
    authorPersonId: 'PER-001008',
    changeKind: 'reclassified',
    polygonId: 'CGP-BLD-WEST-WING-3',
    notes: 'Reclassified West Wing 3 to on-campus-residential after dormitory conversion.',
  },
  {
    id: 'CGA-006',
    at: isoSeconds(daysAgo(112)),
    authorPersonId: 'PER-001008',
    changeKind: 'reclassified',
    polygonId: 'CGP-BLD-WEST-WING-4',
    notes: 'Reclassified West Wing 4 to on-campus-residential after dormitory conversion.',
  },
  {
    id: 'CGA-007',
    at: isoSeconds(daysAgo(78)),
    authorPersonId: 'PER-001008',
    changeKind: 'modified',
    polygonId: 'CGP-PP-WEST-BLVD',
    notes: 'Expanded West Blvd public-property strip to include new bus pull-out lane.',
  },
  {
    id: 'CGA-008',
    at: isoSeconds(daysAgo(35)),
    authorPersonId: 'PER-001008',
    changeKind: 'modified',
    polygonId: 'CGP-BLD-HEALTH-CTR',
    notes: 'Excluded counseling-center suite from Clery on-campus polygon per 42 CFR Part 2 / Clery interaction memo.',
  },
];

// =========================================================================
// The certified polygon set
// =========================================================================

export const THREAD_C_CLERY_POLYGON_SET: CleryPolygonSet = {
  id: THREAD_C_CLERY_POLYGON_SET_ID,
  name: `Main Campus — Clery polygon set (${THREAD_C_ASR_YEAR})`,
  reportingYear: THREAD_C_ASR_YEAR,
  polygons: [...buildingPolygons, ...publicProperty, nonCampus],
  audit,
  certifiedAt: isoSeconds(daysAgo(30)),
  certifiedByPersonId: 'PER-001008',
  classification: 'public',
};

export const CLERY_POLYGON_SETS: CleryPolygonSet[] = [THREAD_C_CLERY_POLYGON_SET];
