/**
 * Blue-light emergency phones — 15 distributed across campus.
 *
 * Each carries a heartbeat (60s in production). Two units are currently
 * degraded (per the sources fixture health note) — useful for the SOC
 * status dashboard demo.
 */

import type { BlueLight, GeoPoint } from '@/lib/types';
import { CAMPUS_ANCHOR } from './buildings';
import { isoSeconds, hoursAgo, minutesAgo } from '@/lib/time';

const offset = (dLat: number, dLng: number): GeoPoint => ({
  lat: CAMPUS_ANCHOR.lat + dLat,
  lng: CAMPUS_ANCHOR.lng + dLng,
});

export const BLUE_LIGHTS: BlueLight[] = [
  { id: 'BLU-QUAD-1', name: 'North Quad — Walk to Adams', location: offset(0.0040, -0.0020), buildingId: undefined, isOnline: true, lastHeartbeatAt: isoSeconds(minutesAgo(0.4)), isActiveCall: false },
  { id: 'BLU-QUAD-2', name: 'North Quad — Carter Walk', location: offset(0.0024, -0.0022), buildingId: 'BLD-CARTER-HALL', isOnline: true, lastHeartbeatAt: isoSeconds(minutesAgo(0.5)), isActiveCall: false },
  { id: 'BLU-QUAD-3', name: 'North Quad — Maddox Walk', location: offset(0.0028, -0.0008), buildingId: 'BLD-MADDOX-HALL', isOnline: true, lastHeartbeatAt: isoSeconds(minutesAgo(0.6)), isActiveCall: false },
  { id: 'BLU-QUAD-4', name: 'Library Plaza', location: offset(0.0006, -0.0014), buildingId: 'BLD-MAIN-LIBRARY', isOnline: true, lastHeartbeatAt: isoSeconds(minutesAgo(0.3)), isActiveCall: false },
  { id: 'BLU-QUAD-5', name: 'Library Loading Dock Walk', location: offset(0.0014, -0.0034), buildingId: 'BLD-MAIN-LIBRARY', isOnline: false, lastHeartbeatAt: isoSeconds(hoursAgo(13)), isActiveCall: false },
  { id: 'BLU-QUAD-6', name: 'Union Plaza', location: offset(-0.0004, -0.0008), buildingId: 'BLD-STUDENT-UNION', isOnline: true, lastHeartbeatAt: isoSeconds(minutesAgo(0.4)), isActiveCall: false },
  { id: 'BLU-QUAD-7', name: 'Central Walk — Admin', location: offset(-0.0005, 0.0012), buildingId: undefined, isOnline: true, lastHeartbeatAt: isoSeconds(minutesAgo(0.5)), isActiveCall: false },
  { id: 'BLU-SCI-1', name: 'Science 1 Entrance', location: offset(-0.0024, 0.0008), buildingId: 'BLD-SCIENCE-1', isOnline: true, lastHeartbeatAt: isoSeconds(minutesAgo(0.7)), isActiveCall: false },
  { id: 'BLU-PD-LOT', name: 'PD HQ Parking', location: offset(-0.0010, 0.0008), buildingId: 'BLD-PD-HQ', isOnline: true, lastHeartbeatAt: isoSeconds(minutesAgo(0.4)), isActiveCall: false },
  { id: 'BLU-ARENA-LOT', name: 'Arena Lot SW', location: offset(-0.0054, -0.0028), buildingId: 'BLD-ARENA', isOnline: true, lastHeartbeatAt: isoSeconds(minutesAgo(0.6)), isActiveCall: false },
  { id: 'BLU-ARENA-PLAZA', name: 'Arena Plaza', location: offset(-0.0050, -0.0010), buildingId: 'BLD-ARENA', isOnline: true, lastHeartbeatAt: isoSeconds(minutesAgo(0.5)), isActiveCall: false },
  { id: 'BLU-SDECK-N', name: 'South Deck North Entry', location: offset(-0.0038, -0.0010), buildingId: 'BLD-SOUTH-DECK', isOnline: true, lastHeartbeatAt: isoSeconds(minutesAgo(0.4)), isActiveCall: false },
  { id: 'BLU-SDECK-W', name: 'South Deck West Stair', location: offset(-0.0044, -0.0014), buildingId: 'BLD-SOUTH-DECK', isOnline: true, lastHeartbeatAt: isoSeconds(minutesAgo(0.5)), isActiveCall: false },
  { id: 'BLU-WW-WALK', name: 'West Wing Walk', location: offset(-0.0052, 0.0020), buildingId: undefined, isOnline: false, lastHeartbeatAt: isoSeconds(hoursAgo(8)), isActiveCall: false },
  { id: 'BLU-GRAD-LOT', name: 'Grad Tower Lot', location: offset(-0.0040, 0.0018), buildingId: 'BLD-GRAD-TOWER', isOnline: true, lastHeartbeatAt: isoSeconds(minutesAgo(0.6)), isActiveCall: false },
];
