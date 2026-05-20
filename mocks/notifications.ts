/**
 * Platform notifications — the bell-icon feed.
 *
 * Includes a "future-tick" tip — the live-ping in the bell appears at the
 * 25-second mark when the page is open. See `useNotificationLivePing` in
 * src/lib/notification-store.ts (R9 patch).
 */

import type { PlatformNotification } from '@/lib/types';
import { isoSeconds, daysAgo, hoursAgo, minutesAgo } from '@/lib/time';

/**
 * The notification that arrives 25 seconds after page-load — used by the
 * notifications-bell live-ping demo moment. Pre-built here, scheduled by
 * the bell component.
 */
export const LIVE_PING_NOTIFICATION: PlatformNotification = {
  id: 'NTF-LIVE-PING-001',
  kind: 'anonymous-tip',
  at: isoSeconds(new Date()),
  title: 'New anonymous tip — Carter Hall, after midnight',
  body: 'Tip received via LiveSafe. Device-id matches dev-9c4f7b21 (84% confidence). Auto-matched to PER-008470. Routed to BIT.',
  linkedRoute: '/bit/BIT-2026-0067',
  unread: true,
  classification: 'pii',
  threadTag: 'A',
};

export const NOTIFICATIONS: PlatformNotification[] = [
  {
    id: 'NTF-2026-0001',
    kind: 'bit-tier-change',
    at: isoSeconds(hoursAgo(4)),
    title: 'BIT-2026-0067 tier change',
    body: 'Risk tier moved from moderate to elevated; rising trend. NaBITA Precipitating dimension increased from 5 to 7.',
    linkedRoute: '/bit/BIT-2026-0067',
    unread: true,
    classification: 'ferpa-edu-record',
    threadTag: 'A',
  },
  {
    id: 'NTF-2026-0002',
    kind: 'eoc-activation',
    at: isoSeconds(minutesAgo(17)),
    title: 'EOC activation — Tornado Warning · central campus',
    body: 'Auto-activated at partial level from NWS Tornado Warning. Shelter campaign sent to 14,210 recipients.',
    linkedRoute: '/eoc/activations/EOC-2026-013',
    unread: true,
    classification: 'public',
    threadTag: 'B',
  },
  {
    id: 'NTF-2026-0003',
    kind: 'pipeline-failure',
    at: isoSeconds(hoursAgo(6)),
    title: 'Pipeline blocked upstream — Maxient conduct mart',
    body: 'gold-bit-briefing-features paused — upstream Maxient export lag 4h.',
    linkedRoute: '/pipelines/gold-bit-briefing-features',
    unread: false,
    classification: 'internal',
  },
  {
    id: 'NTF-2026-0004',
    kind: 'barrier-hit',
    at: isoSeconds(hoursAgo(8)),
    title: 'Title IX → PD barrier hit (3 today)',
    body: 'IB-TIX-TO-PD-HARD fired 3 times today — all from Chief of Police role navigating PER-008470.',
    linkedRoute: '/audit',
    unread: false,
    classification: 'internal',
  },
  {
    id: 'NTF-2026-0005',
    kind: 'foia-due',
    at: isoSeconds(daysAgo(1)),
    title: 'FOIA-2026-077 due in 12 days',
    body: 'Press request scoped to 2025 Sex Offenses · On-Campus Residential cell. Status: ai-redaction-draft (87% confidence).',
    linkedRoute: '/foia/requests/FOIA-2026-077',
    unread: false,
    classification: 'public',
    threadTag: 'C',
  },
  {
    id: 'NTF-2026-0006',
    kind: 'sanction-overdue',
    at: isoSeconds(daysAgo(2)),
    title: 'Sanction overdue — community service',
    body: 'Substance case COND-2026-00187 has an overdue community-service requirement; outreach scheduled.',
    linkedRoute: '/conduct/COND-2026-00187',
    unread: false,
    classification: 'ferpa-edu-record',
  },
];
