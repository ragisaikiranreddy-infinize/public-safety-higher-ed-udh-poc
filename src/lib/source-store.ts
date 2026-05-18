/**
 * In-memory store for sources registered via the Add Source wizard
 * (/sources/new). Wiped on reload — intentional per docs §3.4.
 *
 * Per CLAUDE.md pitfall #1: cache the snapshot in module scope and rebuild
 * it only on mutation. `useSyncExternalStore` requires reference stability.
 */

import { useSyncExternalStore } from 'react';
import type { Source } from './types';

let _sources: Source[] = [];
let _snapshot: readonly Source[] = _sources;

const subscribers = new Set<() => void>();

function notify() {
  _snapshot = _sources.slice(); // new reference per mutation
  subscribers.forEach((fn) => fn());
}

function subscribe(fn: () => void): () => void {
  subscribers.add(fn);
  return () => subscribers.delete(fn);
}

function getSnapshot(): readonly Source[] {
  return _snapshot;
}

/** Register a newly-onboarded source. Prepends to the in-memory list. */
export function registerSource(source: Source): void {
  _sources = [source, ..._sources];
  notify();
}

/** React hook — re-renders subscribers when the in-memory source list changes. */
export function useRegisteredSources(): readonly Source[] {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/** Imperative reader — non-React contexts (mock-db helpers, etc.). */
export function getRegisteredSources(): readonly Source[] {
  return _snapshot;
}
