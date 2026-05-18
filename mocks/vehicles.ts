/**
 * Vehicles — ~80 procedural Master Vehicle Records.
 *
 * Each Vehicle is associated to a Person via `registeredToPersonId`, with
 * permits + LPR detections fed by Bronze. Thread A subject's vehicle is
 * pinned at VEH-2104 with the plate `***-A7K2`.
 */

import type { Vehicle } from '@/lib/types';
import { rng, randInt, pick } from '@/lib/seed';
import { THREAD_A_SUBJECT_PERSON_ID } from './threads';

const MAKES = [
  'Toyota', 'Honda', 'Ford', 'Chevrolet', 'Nissan', 'Hyundai', 'Subaru',
  'Volkswagen', 'Mazda', 'Kia', 'BMW', 'Audi', 'Tesla', 'Jeep', 'Ram',
];

const MODEL_BY_MAKE: Record<string, string[]> = {
  Toyota: ['Corolla', 'Camry', 'RAV4', 'Prius', '4Runner'],
  Honda: ['Civic', 'Accord', 'CR-V', 'Pilot'],
  Ford: ['F-150', 'Escape', 'Explorer', 'Mustang'],
  Chevrolet: ['Silverado', 'Equinox', 'Malibu', 'Tahoe'],
  Nissan: ['Altima', 'Sentra', 'Rogue'],
  Hyundai: ['Elantra', 'Sonata', 'Tucson'],
  Subaru: ['Outback', 'Forester', 'Impreza'],
  Volkswagen: ['Jetta', 'Tiguan', 'Atlas'],
  Mazda: ['CX-5', '3'],
  Kia: ['Soul', 'Sportage', 'Sorento'],
  BMW: ['3 Series', '5 Series', 'X3'],
  Audi: ['A4', 'Q5'],
  Tesla: ['Model 3', 'Model Y'],
  Jeep: ['Wrangler', 'Grand Cherokee'],
  Ram: ['1500'],
};

const COLORS = ['Silver', 'Black', 'White', 'Gray', 'Blue', 'Red', 'Green', 'Beige'];
const STATES = ['IA', 'IL', 'MN', 'WI', 'MO', 'IN', 'OH'];

const r = rng('vehicles-80');

function makePlate(seed: number): string {
  const a = (seed * 7) % 26;
  const b = (seed * 11) % 26;
  const c = (seed * 13) % 26;
  const n = (seed * 17) % 1000;
  return `***-${String.fromCharCode(65 + a)}${String.fromCharCode(65 + b)}${String.fromCharCode(65 + c)}${n.toString().padStart(3, '0').slice(0, 1)}`.slice(0, 8);
}

const procedural: Vehicle[] = Array.from({ length: 78 }, (_, i) => {
  const make = pick(r, MAKES);
  const model = pick(r, MODEL_BY_MAKE[make] ?? ['Sedan']);
  const id = `VEH-${(2000 + i).toString().padStart(4, '0')}`;
  // Some vehicles registered to known persons; rest unknown
  const personIdx = i < 50 ? `PER-${(20000 + randInt(r, 0, 130)).toString().padStart(6, '0')}` : undefined;
  return {
    id,
    plate: makePlate(i + 1),
    plateClassification: 'cji' as const,
    state: pick(r, STATES),
    make,
    model,
    year: randInt(r, 2008, 2026),
    color: pick(r, COLORS),
    registeredToPersonId: personIdx,
    isHotlisted: r() < 0.04,
    hotlistReason: r() < 0.04 ? pick(r, ['BOLO', 'stolen', 'investigation-of-interest']) : undefined,
  };
});

// Thread A anchor — Tyler Anderson's vehicle
const threadAVehicle: Vehicle = {
  id: 'VEH-2104',
  plate: '***-A7K2',
  plateClassification: 'cji',
  state: 'IA',
  make: 'Subaru',
  model: 'Outback',
  year: 2019,
  color: 'Silver',
  registeredToPersonId: THREAD_A_SUBJECT_PERSON_ID,
  isHotlisted: false,
};

// One hotlisted vehicle for investigator-copilot demos later
const hotlistedVehicle: Vehicle = {
  id: 'VEH-2099',
  plate: '***-X4Q9',
  plateClassification: 'cji',
  state: 'IL',
  make: 'Ford',
  model: 'F-150',
  year: 2016,
  color: 'Black',
  isHotlisted: true,
  hotlistReason: 'BOLO',
};

export const VEHICLES: Vehicle[] = [threadAVehicle, hotlistedVehicle, ...procedural];
