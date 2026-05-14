/**
 * Deterministic random number generator (mulberry32).
 *
 * Used by mock data generators so chart values are stable within a session
 * and stable across reloads on the same day, but refresh on a new day.
 *
 * Seed convention: use a string seed namespaced to the data being generated
 * (e.g. "incidents-90d", "access-events-BLD-CARTER-HALL-30d") so different
 * series don't share an RNG state.
 */

import { ANCHOR } from './time';

function hashString(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let t = seed;
  return () => {
    t = (t + 0x6D2B79F5) | 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/** Day-of-year derived from ANCHOR. Ensures values refresh each day. */
function anchorDayOfYear(): number {
  const start = new Date(ANCHOR.getFullYear(), 0, 0);
  return Math.floor((ANCHOR.getTime() - start.getTime()) / 86_400_000);
}

/** Build an RNG seeded by a string namespace + the anchor's day-of-year. */
export function rng(namespace: string): () => number {
  const seed = hashString(`${namespace}::${anchorDayOfYear()}`);
  return mulberry32(seed);
}

/** Draw an integer in [min, max] inclusive. */
export function randInt(r: () => number, min: number, max: number): number {
  return Math.floor(r() * (max - min + 1)) + min;
}

/** Draw a float in [min, max). */
export function randFloat(r: () => number, min: number, max: number): number {
  return r() * (max - min) + min;
}

/** Pick a random element. */
export function pick<T>(r: () => number, arr: readonly T[]): T {
  return arr[Math.floor(r() * arr.length)];
}

/** Pick K random elements without replacement. */
export function pickN<T>(r: () => number, arr: readonly T[], k: number): T[] {
  const copy = arr.slice();
  const out: T[] = [];
  const n = Math.min(k, copy.length);
  for (let i = 0; i < n; i++) {
    const idx = Math.floor(r() * copy.length);
    out.push(copy.splice(idx, 1)[0]);
  }
  return out;
}

/** Approximate normal-distributed value via Box-Muller. */
export function gaussian(r: () => number, mean = 0, stdev = 1): number {
  const u1 = Math.max(r(), 1e-12);
  const u2 = r();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + z * stdev;
}
