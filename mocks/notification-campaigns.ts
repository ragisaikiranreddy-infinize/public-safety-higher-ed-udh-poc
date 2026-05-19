/**
 * Mass-notification campaigns.
 *
 * Thread B anchors:
 *   - MNP-2026-088 — initial shelter-in-place (sent ~17 min ago)
 *   - MNP-2026-088-B — redirect campaign after WW4 generator failure (sent ~3 min ago)
 *
 * Procedural campaigns fill out the 90-day analytics roll-up. Each carries
 * per-channel delivery (attempted / delivered / failed + P50/P95 latency).
 */

import type { NotificationCampaign, NotifChannelDelivery } from '@/lib/types';
import { isoSeconds, daysAgo, minutesAgo, hoursAgo } from '@/lib/time';
import { rng, randInt, pick } from '@/lib/seed';
import {
  THREAD_B_EOC_ACTIVATION_ID,
  THREAD_B_INITIAL_CAMPAIGN_ID,
  THREAD_B_REDIRECT_CAMPAIGN_ID,
  THREAD_B_FAILED_GENERATOR_BUILDING_ID,
  THREAD_B_SHELTER_BUILDING_IDS,
} from './threads';

const r = rng('notif-campaigns-90d');

// =========================================================================
// Thread B — initial + redirect
// =========================================================================

const initialDelivery: NotifChannelDelivery[] = [
  { channel: 'sms', attempted: 14210, delivered: 14081, failed: 129, latencyP50Sec: 4, latencyP95Sec: 11 },
  { channel: 'push', attempted: 14210, delivered: 13654, failed: 556, latencyP50Sec: 2, latencyP95Sec: 7 },
  { channel: 'email', attempted: 14210, delivered: 11802, failed: 78, latencyP50Sec: 8, latencyP95Sec: 22 },
  { channel: 'voice', attempted: 4220, delivered: 3987, failed: 233, latencyP50Sec: 18, latencyP95Sec: 41 },
  { channel: 'desktop-alert', attempted: 3210, delivered: 3142, failed: 68, latencyP50Sec: 1, latencyP95Sec: 3 },
  { channel: 'digital-sign', attempted: 87, delivered: 84, failed: 3, latencyP50Sec: 1, latencyP95Sec: 4 },
];

const threadBInitial: NotificationCampaign = {
  id: THREAD_B_INITIAL_CAMPAIGN_ID,
  name: 'Tornado Warning — shelter-in-place (initial)',
  status: 'sent',
  message:
    'TORNADO WARNING — Take shelter NOW. Move to interior rooms on the lowest floor. ' +
    'Stay away from windows. UPD is sheltering on-scene. Do not leave buildings. ' +
    'Updates every 10 minutes via this channel.',
  audiences: ['campus-all'],
  buildingIds: [],
  channels: ['sms', 'push', 'email', 'voice', 'desktop-alert', 'digital-sign'],
  delivery: initialDelivery,
  createdAt: isoSeconds(minutesAgo(17.5)),
  sentAt: isoSeconds(minutesAgo(17)),
  triggeredByActivationId: THREAD_B_EOC_ACTIVATION_ID,
  authoredByRole: 'eoc-director',
  classification: 'public',
  threadTag: 'B',
};

const redirectDelivery: NotifChannelDelivery[] = [
  { channel: 'sms', attempted: 412, delivered: 408, failed: 4, latencyP50Sec: 3, latencyP95Sec: 8 },
  { channel: 'push', attempted: 412, delivered: 396, failed: 16, latencyP50Sec: 2, latencyP95Sec: 5 },
  { channel: 'desktop-alert', attempted: 87, delivered: 85, failed: 2, latencyP50Sec: 1, latencyP95Sec: 2 },
];

const threadBRedirect: NotificationCampaign = {
  id: THREAD_B_REDIRECT_CAMPAIGN_ID,
  name: 'West Wing 4 — redirect to West Wing 3 + Main Library',
  status: 'sent',
  message:
    'WEST WING 4 OCCUPANTS — relocate immediately to WEST WING 3 or MAIN LIBRARY for ' +
    'continued shelter. WW4 generator has failed; move through interior corridors only. ' +
    'Maintenance is on-site.',
  audiences: ['building-occupants'],
  buildingIds: [THREAD_B_FAILED_GENERATOR_BUILDING_ID],
  channels: ['sms', 'push', 'desktop-alert'],
  delivery: redirectDelivery,
  createdAt: isoSeconds(minutesAgo(3.2)),
  sentAt: isoSeconds(minutesAgo(3)),
  triggeredByActivationId: THREAD_B_EOC_ACTIVATION_ID,
  authoredByRole: 'eoc-director',
  classification: 'public',
  threadTag: 'B',
};

// =========================================================================
// Procedural — 12 historical campaigns over 90 days
// =========================================================================

const NAMES = [
  'Severe Thunderstorm Watch — informational',
  'Water main repair — Adams Hall',
  'Active-threat drill — campus exercise',
  'Power outage — South Quad',
  'Winter weather operations — modified schedule',
  'Drone activity notice — game day',
  'Lab fire — Science 1 evacuation (drill)',
  'Heat advisory — campus cooling centers',
  'Civil unrest near campus — situational awareness',
  'Wind advisory — outdoor event modifications',
  'Snow event — operations modified',
  'Suspicious package — Maddox courtyard',
];

const CHANNEL_POOL: NotificationCampaign['channels'][] = [
  ['sms', 'push'],
  ['sms', 'push', 'email'],
  ['sms', 'push', 'email', 'voice'],
  ['sms', 'push', 'desktop-alert'],
];

const procedural: NotificationCampaign[] = [];
for (let i = 0; i < 12; i++) {
  const channels = pick(r, CHANNEL_POOL);
  const isOlder = i >= 6;
  const daysBack = isOlder ? randInt(r, 14, 88) : randInt(r, 1, 13);
  const total = randInt(r, 320, 14000);
  const delivery: NotifChannelDelivery[] = channels.map((ch) => {
    const attempted = ch === 'voice' || ch === 'desktop-alert' ? Math.floor(total * 0.32) : total;
    const delivered = Math.floor(attempted * (0.94 + r() * 0.05));
    const failed = attempted - delivered;
    return {
      channel: ch,
      attempted,
      delivered,
      failed,
      latencyP50Sec: randInt(r, 2, 12),
      latencyP95Sec: randInt(r, 6, 38),
    };
  });
  procedural.push({
    id: `MNP-2026-${(50 + i).toString().padStart(3, '0')}`,
    name: NAMES[i],
    status: 'sent',
    message: 'Historical campaign — used for the delivery-analytics roll-up.',
    audiences: ['campus-all'],
    buildingIds: [],
    channels,
    delivery,
    createdAt: isoSeconds(daysAgo(daysBack)),
    sentAt: isoSeconds(daysAgo(daysBack)),
    authoredByRole: 'eoc-director',
    classification: 'public',
  });
}

void hoursAgo;
void THREAD_B_SHELTER_BUILDING_IDS;

export const NOTIFICATION_CAMPAIGNS: NotificationCampaign[] = [
  threadBRedirect, threadBInitial, ...procedural,
].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

export const THREAD_B_INITIAL_CAMPAIGN = threadBInitial;
export const THREAD_B_REDIRECT_CAMPAIGN = threadBRedirect;
