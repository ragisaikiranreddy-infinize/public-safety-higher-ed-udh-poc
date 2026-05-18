/**
 * Patrol units — 20 units across patrol / supervisor / detective / K9 / CSO.
 */

import type { Unit } from '@/lib/types';
import { CAMPUS_ANCHOR } from './buildings';

export const UNITS: Unit[] = [
  // Patrol — 12 units
  { id: 'UNIT-101A', callSign: '101-A', kind: 'patrol', status: 'on-scene', assignedOfficerIds: ['OFC-0124'], position: { lat: CAMPUS_ANCHOR.lat + 0.0026, lng: CAMPUS_ANCHOR.lng - 0.0028 } },
  { id: 'UNIT-101B', callSign: '101-B', kind: 'patrol', status: 'available', assignedOfficerIds: ['OFC-0125'] },
  { id: 'UNIT-102A', callSign: '102-A', kind: 'patrol', status: 'available', assignedOfficerIds: ['OFC-0126'] },
  { id: 'UNIT-102B', callSign: '102-B', kind: 'patrol', status: 'enroute', assignedOfficerIds: ['OFC-0127'] },
  { id: 'UNIT-103A', callSign: '103-A', kind: 'patrol', status: 'available', assignedOfficerIds: ['OFC-0128'] },
  { id: 'UNIT-103B', callSign: '103-B', kind: 'patrol', status: 'oos', assignedOfficerIds: ['OFC-0129'] },
  { id: 'UNIT-104A', callSign: '104-A', kind: 'patrol', status: 'available', assignedOfficerIds: ['OFC-0130'] },
  { id: 'UNIT-104B', callSign: '104-B', kind: 'patrol', status: 'available', assignedOfficerIds: ['OFC-0131'] },
  { id: 'UNIT-105A', callSign: '105-A', kind: 'patrol', status: 'on-scene', assignedOfficerIds: ['OFC-0021', 'OFC-0132'] },
  { id: 'UNIT-105B', callSign: '105-B', kind: 'patrol', status: 'transport', assignedOfficerIds: ['OFC-0133'] },
  { id: 'UNIT-106A', callSign: '106-A', kind: 'patrol', status: 'available', assignedOfficerIds: ['OFC-0134'] },
  { id: 'UNIT-106B', callSign: '106-B', kind: 'patrol', status: 'available', assignedOfficerIds: ['OFC-0135'] },
  // Supervisor
  { id: 'UNIT-S1', callSign: 'S-1', kind: 'supervisor', status: 'available', assignedOfficerIds: ['OFC-0103'] },
  { id: 'UNIT-S2', callSign: 'S-2', kind: 'supervisor', status: 'available', assignedOfficerIds: ['OFC-0104'] },
  // Detective
  { id: 'UNIT-D1', callSign: 'D-1', kind: 'detective', status: 'available', assignedOfficerIds: ['OFC-0107'] },
  { id: 'UNIT-D2', callSign: 'D-2', kind: 'detective', status: 'available', assignedOfficerIds: ['OFC-0108'] },
  // K9
  { id: 'UNIT-K9', callSign: 'K-9', kind: 'k9', status: 'oos', assignedOfficerIds: ['OFC-0136'] },
  // Bike patrol — Game Day
  { id: 'UNIT-B1', callSign: 'B-1', kind: 'bike', status: 'available', assignedOfficerIds: ['OFC-0137'] },
  // CSO civilians
  { id: 'UNIT-CSO1', callSign: 'CSO-1', kind: 'cso', status: 'available', assignedOfficerIds: ['OFC-0140'] },
  { id: 'UNIT-CSO2', callSign: 'CSO-2', kind: 'cso', status: 'available', assignedOfficerIds: ['OFC-0141'] },
];
