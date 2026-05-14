/**
 * Residence halls — a subset of buildings with residential capacity.
 *
 * Capacity totals are used by the Module 5B Residential Conduct + Building
 * Intelligence overlay later. Carter Hall is Thread A's "building of concern."
 */

import type { ResidenceHall } from '@/lib/types';

export const RESIDENCE_HALLS: ResidenceHall[] = [
  {
    id: 'RES-ADAMS-HALL',
    buildingId: 'BLD-ADAMS-HALL',
    capacity: 350,
    currentOccupancy: 342,
    residentTypes: ['upper-class'],
  },
  {
    id: 'RES-CARTER-HALL',
    buildingId: 'BLD-CARTER-HALL',
    capacity: 412,
    currentOccupancy: 408,
    residentTypes: ['first-year'],
  },
  {
    id: 'RES-MADDOX-HALL',
    buildingId: 'BLD-MADDOX-HALL',
    capacity: 388,
    currentOccupancy: 376,
    residentTypes: ['first-year'],
  },
  {
    id: 'RES-GRAD-TOWER',
    buildingId: 'BLD-GRAD-TOWER',
    capacity: 220,
    currentOccupancy: 218,
    residentTypes: ['graduate', 'family'],
  },
  {
    id: 'RES-WEST-WING-3',
    buildingId: 'BLD-WEST-WING-3',
    capacity: 180,
    currentOccupancy: 174,
    residentTypes: ['upper-class'],
  },
  {
    id: 'RES-WEST-WING-4',
    buildingId: 'BLD-WEST-WING-4',
    capacity: 180,
    currentOccupancy: 169,
    residentTypes: ['upper-class'],
  },
];
