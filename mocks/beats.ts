/**
 * Patrol beats — geographic divisions used by dispatch + workforce analytics.
 * Each beat carries a polygon and an averageDailyCalls signal so Coverage
 * Gap visualizations have a baseline.
 */

import type { Beat, GeoPoint, GeoPolygon } from '@/lib/types';
import { CAMPUS_ANCHOR } from './buildings';

function box(centroid: GeoPoint, latDeg: number, lngDeg: number): GeoPolygon {
  const dLat = latDeg / 2;
  const dLng = lngDeg / 2;
  return [
    { lat: centroid.lat - dLat, lng: centroid.lng - dLng },
    { lat: centroid.lat - dLat, lng: centroid.lng + dLng },
    { lat: centroid.lat + dLat, lng: centroid.lng + dLng },
    { lat: centroid.lat + dLat, lng: centroid.lng - dLng },
    { lat: centroid.lat - dLat, lng: centroid.lng - dLng },
  ];
}

const offset = (dLat: number, dLng: number): GeoPoint => ({
  lat: CAMPUS_ANCHOR.lat + dLat,
  lng: CAMPUS_ANCHOR.lng + dLng,
});

export const BEATS: Beat[] = [
  {
    id: 'BEAT-NORTH-RESIDENTIAL',
    name: 'North Residential',
    regionId: 'north-campus',
    polygon: box(offset(0.0028, -0.0028), 0.0070, 0.0080),
    averageDailyCalls: 28,
  },
  {
    id: 'BEAT-CENTRAL',
    name: 'Central Academic',
    regionId: 'central-campus',
    polygon: box(offset(-0.0008, 0.0004), 0.0080, 0.0100),
    averageDailyCalls: 42,
  },
  {
    id: 'BEAT-SOUTH-ATHLETICS',
    name: 'South Athletics',
    regionId: 'south-campus',
    polygon: box(offset(-0.0048, -0.0010), 0.0060, 0.0090),
    averageDailyCalls: 18,
  },
  {
    id: 'BEAT-SOUTH-RESIDENTIAL',
    name: 'South Residential',
    regionId: 'south-campus',
    polygon: box(offset(-0.0055, 0.0025), 0.0050, 0.0070),
    averageDailyCalls: 15,
  },
  {
    id: 'BEAT-PERIPHERAL',
    name: 'Peripheral / Public-Property',
    regionId: 'all',
    polygon: box(offset(-0.0010, -0.0080), 0.0200, 0.0200),
    averageDailyCalls: 7,
  },
];
