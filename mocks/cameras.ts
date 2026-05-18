/**
 * Cameras — ~50 across the campus.
 *
 * Mix of fixed + PTZ + dome + LPR + thermal. Most are interior-building
 * cameras; a handful exterior on building corners + parking deck. Each
 * carries a position + azimuth + FOV cone width for the map overlay.
 *
 * Thread A anchor: CAM-CARTER-N3 (north corner of Carter Hall, the camera
 * that captured the 11 loitering events between 22:00–02:00).
 */

import type { Camera, GeoPoint } from '@/lib/types';
import { BUILDINGS } from './buildings';
import { rng, randInt, randFloat, pick } from '@/lib/seed';
import { isoSeconds, hoursAgo } from '@/lib/time';

const r = rng('cameras-50');

const VENDORS = ['Milestone', 'Verkada', 'Avigilon', 'Axis'];
const KINDS: Camera['kind'][] = ['fixed', 'fixed', 'fixed', 'ptz', 'dome', 'dome', 'lpr', 'thermal'];

function makeCam(id: string, name: string, b: typeof BUILDINGS[number], opts: {
  position?: GeoPoint; azimuth?: number; fov?: number; kind?: Camera['kind']; vendor?: string;
  hasAnalytics?: boolean; isOnline?: boolean;
}): Camera {
  return {
    id,
    name,
    buildingId: b.id,
    location: opts.position ?? {
      lat: b.centroid.lat + randFloat(r, -0.0003, 0.0003),
      lng: b.centroid.lng + randFloat(r, -0.0003, 0.0003),
    },
    azimuthDeg: opts.azimuth ?? randInt(r, 0, 359),
    fovDeg: opts.fov ?? randInt(r, 60, 110),
    kind: opts.kind ?? pick(r, KINDS),
    vendor: opts.vendor ?? pick(r, VENDORS),
    hasAnalytics: opts.hasAnalytics ?? r() < 0.7,
    isOnline: opts.isOnline ?? r() < 0.95,
    lastSeenAt: isoSeconds(hoursAgo(opts.isOnline === false ? randInt(r, 12, 72) : 0.01)),
    classification: 'restricted-investigation',
  };
}

const cams: Camera[] = [];

// Thread A anchor — Carter Hall north corner camera (the loitering camera)
const carter = BUILDINGS.find((b) => b.id === 'BLD-CARTER-HALL')!;
cams.push({
  id: 'CAM-CARTER-N3',
  name: 'Carter Hall North Corner',
  buildingId: 'BLD-CARTER-HALL',
  location: { lat: carter.centroid.lat + 0.00055, lng: carter.centroid.lng - 0.00065 },
  azimuthDeg: 225, // looking south-west toward the main entrance + adjacent walk
  fovDeg: 95,
  kind: 'ptz',
  vendor: 'Verkada',
  hasAnalytics: true,
  isOnline: true,
  lastSeenAt: isoSeconds(hoursAgo(0.005)),
  classification: 'restricted-investigation',
});

cams.push(makeCam('CAM-CARTER-MAIN', 'Carter Hall Main Entry', carter, {
  position: { lat: carter.centroid.lat - 0.0005, lng: carter.centroid.lng + 0.00015 },
  azimuth: 0, fov: 80, kind: 'fixed', vendor: 'Verkada', hasAnalytics: true,
}));
cams.push(makeCam('CAM-CARTER-LOT', 'Carter Hall Service Lot', carter, {
  azimuth: 90, fov: 75, kind: 'fixed', vendor: 'Verkada', hasAnalytics: true,
}));

// Other residence halls — 2 cameras each
['BLD-ADAMS-HALL', 'BLD-MADDOX-HALL', 'BLD-GRAD-TOWER', 'BLD-WEST-WING-3', 'BLD-WEST-WING-4'].forEach((bId, i) => {
  const b = BUILDINGS.find((bb) => bb.id === bId);
  if (!b) return;
  cams.push(makeCam(`CAM-${b.id.replace('BLD-', '')}-N`, `${b.name} North`, b, { azimuth: 0, kind: 'fixed' }));
  cams.push(makeCam(`CAM-${b.id.replace('BLD-', '')}-S`, `${b.name} South`, b, { azimuth: 180, kind: 'fixed' }));
  void i;
});

// Library — 4 cameras (interior atrium + entrances)
const lib = BUILDINGS.find((b) => b.id === 'BLD-MAIN-LIBRARY')!;
cams.push(makeCam('CAM-LIBRARY-MAIN', 'Library Main Entrance', lib, { azimuth: 0, kind: 'fixed' }));
cams.push(makeCam('CAM-LIBRARY-EAST', 'Library East Entrance', lib, { azimuth: 90, kind: 'fixed' }));
cams.push(makeCam('CAM-LIBRARY-ATRIUM-1', 'Library Atrium 1', lib, { kind: 'dome', fov: 360 }));
cams.push(makeCam('CAM-LIBRARY-ATRIUM-2', 'Library Atrium 2', lib, { kind: 'dome', fov: 360 }));

// Student Union — 5 cameras (corridors + dining + main lobby)
const union = BUILDINGS.find((b) => b.id === 'BLD-STUDENT-UNION')!;
cams.push(makeCam('CAM-UNION-LOBBY', 'Union Main Lobby', union, { kind: 'dome', fov: 360 }));
cams.push(makeCam('CAM-UNION-DINING', 'Union Dining Hall', union, { kind: 'dome', fov: 360 }));
cams.push(makeCam('CAM-UNION-WEST', 'Union West Entrance', union, { azimuth: 270 }));
cams.push(makeCam('CAM-UNION-NORTH', 'Union North Entrance', union, { azimuth: 0 }));
cams.push(makeCam('CAM-UNION-PLAZA', 'Union Plaza', union, { azimuth: 180, kind: 'ptz' }));

// PD HQ — 2 cameras
const pd = BUILDINGS.find((b) => b.id === 'BLD-PD-HQ')!;
cams.push(makeCam('CAM-PDHQ-MAIN', 'PD HQ Entrance', pd, { kind: 'fixed' }));
cams.push(makeCam('CAM-PDHQ-EVIDENCE', 'PD HQ Evidence Bay', pd, { kind: 'fixed', hasAnalytics: false }));

// Admin Hall — 2 cameras
const admin = BUILDINGS.find((b) => b.id === 'BLD-ADMIN-HALL')!;
cams.push(makeCam('CAM-ADMIN-MAIN', 'Admin Hall Main', admin, { kind: 'fixed' }));
cams.push(makeCam('CAM-ADMIN-PARKING', 'Admin Hall Parking', admin, { kind: 'fixed', azimuth: 270 }));

// Science Bldg — 2 cameras
const sci = BUILDINGS.find((b) => b.id === 'BLD-SCIENCE-1')!;
cams.push(makeCam('CAM-SCI-MAIN', 'Science 1 Main', sci, { kind: 'fixed' }));
cams.push(makeCam('CAM-SCI-LAB', 'Science 1 Lab Corridor', sci, { kind: 'dome', fov: 270, hasAnalytics: false }));

// Arena — 4 cameras (game-day operations)
const arena = BUILDINGS.find((b) => b.id === 'BLD-ARENA')!;
cams.push(makeCam('CAM-ARENA-GATE-A', 'Arena Gate A', arena, { kind: 'fixed' }));
cams.push(makeCam('CAM-ARENA-GATE-B', 'Arena Gate B', arena, { kind: 'fixed' }));
cams.push(makeCam('CAM-ARENA-CONCOURSE', 'Arena Concourse', arena, { kind: 'ptz', fov: 100 }));
cams.push(makeCam('CAM-ARENA-PLAZA', 'Arena Plaza', arena, { kind: 'dome', fov: 270 }));

// South Parking Deck — 6 cameras (LPR + general)
const deck = BUILDINGS.find((b) => b.id === 'BLD-SOUTH-DECK')!;
cams.push(makeCam('CAM-SDECK-N-IN', 'South Deck North Entry LPR', deck, { kind: 'lpr', azimuth: 0 }));
cams.push(makeCam('CAM-SDECK-N-OUT', 'South Deck North Exit LPR', deck, { kind: 'lpr', azimuth: 180 }));
cams.push(makeCam('CAM-SDECK-W', 'South Deck West LPR', deck, { kind: 'lpr', azimuth: 270 }));
cams.push(makeCam('CAM-SDECK-LVL2', 'South Deck Level 2', deck, { kind: 'fixed' }));
cams.push(makeCam('CAM-SDECK-LVL3', 'South Deck Level 3', deck, { kind: 'fixed' }));
cams.push(makeCam('CAM-SDECK-STAIR', 'South Deck Stairwell A', deck, { kind: 'fixed', hasAnalytics: false }));

// Health Center — 1 camera (privacy-restricted; no interior cams beyond the lobby)
const health = BUILDINGS.find((b) => b.id === 'BLD-HEALTH-CTR')!;
cams.push(makeCam('CAM-HEALTH-LOBBY', 'Health Center Lobby', health, { kind: 'fixed', hasAnalytics: false }));

// A couple thermal exterior — west wing back of house
const ww4 = BUILDINGS.find((b) => b.id === 'BLD-WEST-WING-4')!;
cams.push(makeCam('CAM-WW4-THERMAL', 'West Wing 4 Thermal', ww4, { kind: 'thermal', hasAnalytics: false }));

// Pad to ~50 with a few offline cameras to demonstrate the health story.
cams.push(makeCam('CAM-LIBRARY-DOCK', 'Library Loading Dock', lib, {
  kind: 'fixed', hasAnalytics: false, isOnline: false,
}));
cams.push(makeCam('CAM-SCI-ROOF', 'Science 1 Roof', sci, {
  kind: 'fixed', hasAnalytics: false, isOnline: false,
}));
cams.push(makeCam('CAM-ARENA-LOT-SE', 'Arena Lot SE Corner', arena, { kind: 'fixed' }));
cams.push(makeCam('CAM-ARENA-LOT-SW', 'Arena Lot SW Corner', arena, { kind: 'fixed' }));

export const CAMERAS: Camera[] = cams;
