/**
 * Notification store — provides the live-ping demo moment.
 *
 * 25 seconds after page-load, the Thread A anonymous-tip notification fires.
 * Uses useSyncExternalStore with the cached _snapshot pattern (per
 * CLAUDE.md pitfall #1) so React doesn't infinite-loop.
 */

import { useSyncExternalStore } from 'react';
import type { PlatformNotification } from './types';
import { NOTIFICATIONS, LIVE_PING_NOTIFICATION } from './mock-db';
import { isoSeconds } from './time';

let _list: PlatformNotification[] = NOTIFICATIONS.slice();
let _snapshot: readonly PlatformNotification[] = _list;
const subscribers = new Set<() => void>();
let _livePingScheduled = false;
let _livePingTimer: number | undefined;

function notify() {
  _snapshot = _list.slice();
  subscribers.forEach((fn) => fn());
}

function subscribe(fn: () => void): () => void {
  subscribers.add(fn);
  // Lazy-schedule the live ping on first subscription.
  if (!_livePingScheduled) {
    _livePingScheduled = true;
    if (typeof window !== 'undefined') {
      _livePingTimer = window.setTimeout(() => {
        const ping: PlatformNotification = {
          ...LIVE_PING_NOTIFICATION,
          at: isoSeconds(new Date()),
        };
        _list = [ping, ..._list];
        notify();
      }, 25_000);
    }
  }
  return () => {
    subscribers.delete(fn);
    // Last subscriber gone — cancel pending ping.
    if (subscribers.size === 0 && _livePingTimer) {
      clearTimeout(_livePingTimer);
      _livePingTimer = undefined;
      _livePingScheduled = false;
    }
  };
}

function getSnapshot(): readonly PlatformNotification[] {
  return _snapshot;
}

export function useNotifications(): readonly PlatformNotification[] {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function markAllRead(): void {
  _list = _list.map((n) => ({ ...n, unread: false }));
  notify();
}
