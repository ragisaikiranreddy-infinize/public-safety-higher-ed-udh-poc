/**
 * Sole import surface for `/mocks/*`.
 *
 * Routes and components MUST NOT import from `/mocks/*` directly. This file
 * is the swap-point — in production it becomes a thin REST/GraphQL client.
 *
 * Grep-enforced at release:
 *   rg "from ['\"]\\.\\./mocks" src        # must return empty
 *   rg "from ['\"]\\.\\./\\.\\./mocks" src # must return empty
 *
 * R0 surface: just re-exports the seed fixtures (regions, buildings,
 * residence halls, beats). R1+ adds dataset/source/pipeline + computed
 * helpers like activeIncidentCount(), buildingOccupancyEstimate(),
 * threadAEvidenceTimeline(), etc.
 */

// ----- raw re-exports (R0) -------------------------------------------------
export { REGIONS } from '../../../mocks/regions';
export { BUILDINGS, CAMPUS_ANCHOR } from '../../../mocks/buildings';
export { RESIDENCE_HALLS } from '../../../mocks/residence-halls';
export { BEATS } from '../../../mocks/beats';

// ----- computed helpers (R0) ----------------------------------------------

import { BUILDINGS } from '../../../mocks/buildings';
import { RESIDENCE_HALLS } from '../../../mocks/residence-halls';
import { BEATS } from '../../../mocks/beats';
import { REGIONS } from '../../../mocks/regions';
import type { Building, ResidenceHall, Beat, Region, RegionId } from '@/lib/types';

export function getBuilding(id: string): Building | undefined {
  return BUILDINGS.find((b) => b.id === id);
}

export function getResidenceHall(id: string): ResidenceHall | undefined {
  return RESIDENCE_HALLS.find((r) => r.id === id);
}

export function getBeat(id: string): Beat | undefined {
  return BEATS.find((b) => b.id === id);
}

export function getRegion(id: RegionId): Region | undefined {
  return REGIONS.find((r) => r.id === id);
}

export function buildingsByRegion(regionId: RegionId): Building[] {
  if (regionId === 'all') return BUILDINGS;
  return BUILDINGS.filter((b) => b.regionId === regionId);
}

export function residentialBuildingCount(): number {
  return BUILDINGS.filter((b) => b.kind === 'residential').length;
}

export function shelterDesignatedBuildings(): Building[] {
  return BUILDINGS.filter((b) => b.isShelterDesignated);
}

export function totalResidentialOccupancy(): number {
  return RESIDENCE_HALLS.reduce((sum, h) => sum + (h.currentOccupancy ?? 0), 0);
}

export function totalResidentialCapacity(): number {
  return RESIDENCE_HALLS.reduce((sum, h) => sum + h.capacity, 0);
}
