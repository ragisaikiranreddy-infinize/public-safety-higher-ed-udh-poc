/**
 * Access-controlled doors — ~30 across residence halls, libraries, labs,
 * and the PD HQ. Each carries a position, kind, and posted hours.
 *
 * Thread A anchor: DOR-CARTER-MAIN-S (Carter Hall main south entrance —
 * where the 47 after-hours card swipes from PER-008470 land).
 */

import type { Door, GeoPoint } from '@/lib/types';
import { BUILDINGS } from './buildings';

function offsetFrom(centroid: GeoPoint, dLat: number, dLng: number): GeoPoint {
  return { lat: centroid.lat + dLat, lng: centroid.lng + dLng };
}

const carter = BUILDINGS.find((b) => b.id === 'BLD-CARTER-HALL')!;
const adams = BUILDINGS.find((b) => b.id === 'BLD-ADAMS-HALL')!;
const maddox = BUILDINGS.find((b) => b.id === 'BLD-MADDOX-HALL')!;
const grad = BUILDINGS.find((b) => b.id === 'BLD-GRAD-TOWER')!;
const ww3 = BUILDINGS.find((b) => b.id === 'BLD-WEST-WING-3')!;
const ww4 = BUILDINGS.find((b) => b.id === 'BLD-WEST-WING-4')!;
const lib = BUILDINGS.find((b) => b.id === 'BLD-MAIN-LIBRARY')!;
const union = BUILDINGS.find((b) => b.id === 'BLD-STUDENT-UNION')!;
const pd = BUILDINGS.find((b) => b.id === 'BLD-PD-HQ')!;
const admin = BUILDINGS.find((b) => b.id === 'BLD-ADMIN-HALL')!;
const sci = BUILDINGS.find((b) => b.id === 'BLD-SCIENCE-1')!;
const health = BUILDINGS.find((b) => b.id === 'BLD-HEALTH-CTR')!;

export const DOORS: Door[] = [
  // Carter Hall — Thread A anchor
  {
    id: 'DOR-CARTER-MAIN-S',
    buildingId: 'BLD-CARTER-HALL',
    name: 'Carter Hall Main (South)',
    location: offsetFrom(carter.centroid, -0.0005, 0.0001),
    kind: 'main-entrance',
    isAdaActuator: true,
    postedHours: '24/7 with card',
    controlledByAcs: true,
    description: 'Primary residential entry. ADA actuator. Thread A access pattern centers here.',
  },
  { id: 'DOR-CARTER-EAST', buildingId: 'BLD-CARTER-HALL', name: 'Carter East Side', location: offsetFrom(carter.centroid, 0, 0.0006), kind: 'side', isAdaActuator: false, postedHours: '06:00–23:00', controlledByAcs: true },
  { id: 'DOR-CARTER-SERVICE', buildingId: 'BLD-CARTER-HALL', name: 'Carter Service', location: offsetFrom(carter.centroid, 0.0004, -0.0005), kind: 'service', isAdaActuator: false, controlledByAcs: true, description: 'Staff/facilities only' },

  // Adams Hall — Thread A subject's residence
  { id: 'DOR-ADAMS-MAIN', buildingId: 'BLD-ADAMS-HALL', name: 'Adams Main', location: offsetFrom(adams.centroid, -0.0004, 0), kind: 'main-entrance', isAdaActuator: true, postedHours: '24/7 with card', controlledByAcs: true },
  { id: 'DOR-ADAMS-WEST', buildingId: 'BLD-ADAMS-HALL', name: 'Adams West', location: offsetFrom(adams.centroid, 0, -0.0006), kind: 'side', isAdaActuator: false, controlledByAcs: true },

  // Maddox
  { id: 'DOR-MADDOX-MAIN', buildingId: 'BLD-MADDOX-HALL', name: 'Maddox Main', location: offsetFrom(maddox.centroid, -0.0004, 0), kind: 'main-entrance', isAdaActuator: true, postedHours: '24/7 with card', controlledByAcs: true },
  { id: 'DOR-MADDOX-EAST', buildingId: 'BLD-MADDOX-HALL', name: 'Maddox East', location: offsetFrom(maddox.centroid, 0, 0.0006), kind: 'side', isAdaActuator: false, controlledByAcs: true },

  // Grad Tower
  { id: 'DOR-GRADTOWER-LOBBY', buildingId: 'BLD-GRAD-TOWER', name: 'Grad Tower Lobby', location: offsetFrom(grad.centroid, -0.0004, 0), kind: 'main-entrance', isAdaActuator: true, postedHours: '24/7 with card', controlledByAcs: true },

  // West Wing 3 + 4
  { id: 'DOR-WW3-MAIN', buildingId: 'BLD-WEST-WING-3', name: 'WW3 Main', location: offsetFrom(ww3.centroid, -0.0004, 0), kind: 'main-entrance', isAdaActuator: true, controlledByAcs: true },
  { id: 'DOR-WW4-MAIN', buildingId: 'BLD-WEST-WING-4', name: 'WW4 Main', location: offsetFrom(ww4.centroid, -0.0004, 0), kind: 'main-entrance', isAdaActuator: true, controlledByAcs: true },
  { id: 'DOR-WW4-SHELTER', buildingId: 'BLD-WEST-WING-4', name: 'WW4 Shelter Entry', location: offsetFrom(ww4.centroid, 0, -0.0006), kind: 'restricted', isAdaActuator: true, controlledByAcs: true, description: 'Severe-weather shelter access. Designated unlock on EOC shelter runbook (Thread B).' },

  // Library
  { id: 'DOR-LIBRARY-MAIN', buildingId: 'BLD-MAIN-LIBRARY', name: 'Library Main', location: offsetFrom(lib.centroid, -0.0008, 0), kind: 'main-entrance', isAdaActuator: true, postedHours: 'Sun–Thu 24h · Fri–Sat 07:00–02:00', controlledByAcs: true },
  { id: 'DOR-LIBRARY-EAST', buildingId: 'BLD-MAIN-LIBRARY', name: 'Library East', location: offsetFrom(lib.centroid, 0, 0.001), kind: 'side', isAdaActuator: false, controlledByAcs: true },
  { id: 'DOR-LIBRARY-DOCK', buildingId: 'BLD-MAIN-LIBRARY', name: 'Library Dock', location: offsetFrom(lib.centroid, 0.0008, -0.0008), kind: 'service', isAdaActuator: false, controlledByAcs: true },

  // Student Union
  { id: 'DOR-UNION-MAIN', buildingId: 'BLD-STUDENT-UNION', name: 'Union Main', location: offsetFrom(union.centroid, -0.0007, 0), kind: 'main-entrance', isAdaActuator: true, postedHours: 'Mon–Fri 06:00–24:00 · Sat–Sun 08:00–24:00', controlledByAcs: false },
  { id: 'DOR-UNION-WEST', buildingId: 'BLD-STUDENT-UNION', name: 'Union West', location: offsetFrom(union.centroid, 0, -0.0009), kind: 'side', isAdaActuator: true, controlledByAcs: true },
  { id: 'DOR-UNION-NORTH', buildingId: 'BLD-STUDENT-UNION', name: 'Union North', location: offsetFrom(union.centroid, 0.0007, 0), kind: 'side', isAdaActuator: false, controlledByAcs: true },

  // PD HQ
  { id: 'DOR-PDHQ-MAIN', buildingId: 'BLD-PD-HQ', name: 'PD HQ Main', location: offsetFrom(pd.centroid, -0.0004, 0), kind: 'main-entrance', isAdaActuator: true, postedHours: '24/7', controlledByAcs: true },
  { id: 'DOR-PDHQ-EVIDENCE', buildingId: 'BLD-PD-HQ', name: 'PD HQ Evidence', location: offsetFrom(pd.centroid, 0, 0.0005), kind: 'restricted', isAdaActuator: false, controlledByAcs: true, description: 'Evidence custody. CJIS-monitored.' },
  { id: 'DOR-PDHQ-SALLYPORT', buildingId: 'BLD-PD-HQ', name: 'PD HQ Sally Port', location: offsetFrom(pd.centroid, 0.0004, -0.0005), kind: 'restricted', isAdaActuator: false, controlledByAcs: true },

  // Admin Hall
  { id: 'DOR-ADMIN-MAIN', buildingId: 'BLD-ADMIN-HALL', name: 'Admin Main', location: offsetFrom(admin.centroid, -0.0005, 0), kind: 'main-entrance', isAdaActuator: true, postedHours: 'Mon–Fri 07:00–18:00', controlledByAcs: false },
  { id: 'DOR-ADMIN-TITLEIX', buildingId: 'BLD-ADMIN-HALL', name: 'Admin · Title IX Office', location: offsetFrom(admin.centroid, 0, 0.0005), kind: 'interior', isAdaActuator: false, controlledByAcs: true, description: 'Title IX office interior door. CJIS-not-applicable.' },

  // Science 1
  { id: 'DOR-SCI-MAIN', buildingId: 'BLD-SCIENCE-1', name: 'Science 1 Main', location: offsetFrom(sci.centroid, -0.0006, 0), kind: 'main-entrance', isAdaActuator: true, postedHours: 'Mon–Fri 06:00–22:00', controlledByAcs: true },
  { id: 'DOR-SCI-LAB-CORE', buildingId: 'BLD-SCIENCE-1', name: 'Science 1 Lab Core', location: offsetFrom(sci.centroid, 0, 0.0007), kind: 'restricted', isAdaActuator: false, controlledByAcs: true, description: 'Restricted-access labs. Card + PIN required.' },

  // Health Center
  { id: 'DOR-HEALTH-MAIN', buildingId: 'BLD-HEALTH-CTR', name: 'Health Center Main', location: offsetFrom(health.centroid, -0.0004, 0), kind: 'main-entrance', isAdaActuator: true, postedHours: 'Mon–Fri 08:00–17:00', controlledByAcs: false },
  { id: 'DOR-HEALTH-COUNSELING', buildingId: 'BLD-HEALTH-CTR', name: 'Counseling Suite', location: offsetFrom(health.centroid, 0, 0.0005), kind: 'restricted', isAdaActuator: false, controlledByAcs: true, description: '42 CFR Part 2 walled clinical area. Access tightly scoped.' },

  // ADA actuators called out for accessibility audit (a couple more)
  { id: 'DOR-LIBRARY-MAIN-ADA', buildingId: 'BLD-MAIN-LIBRARY', name: 'Library Main · ADA Actuator', location: offsetFrom(lib.centroid, -0.00075, -0.0001), kind: 'ada', isAdaActuator: true, controlledByAcs: false },
  { id: 'DOR-UNION-MAIN-ADA', buildingId: 'BLD-STUDENT-UNION', name: 'Union Main · ADA Actuator', location: offsetFrom(union.centroid, -0.00065, -0.0001), kind: 'ada', isAdaActuator: true, controlledByAcs: false },
];
