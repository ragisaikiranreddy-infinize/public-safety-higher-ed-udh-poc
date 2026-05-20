/**
 * Copilot directory — every conversational AI surface on the platform.
 */

import type { CopilotEntry } from '@/lib/types';
import { isoSeconds, hoursAgo, daysAgo } from '@/lib/time';

export const COPILOTS: CopilotEntry[] = [
  {
    id: 'CPLT-BIT',
    name: 'BIT Copilot',
    scope: 'BIT',
    description: 'Conversational follow-up on a BIT case briefing — next steps, swipe timeline, NaBITA risk.',
    route: '/bit/BIT-2026-0067',
    ownerRoles: ['bit-chair', 'dean-of-students'],
    lastUsedAt: isoSeconds(hoursAgo(2)),
  },
  {
    id: 'CPLT-EOC',
    name: 'EOC Copilot',
    scope: 'EOC',
    description: 'Operational follow-up on an active EOC activation — sitrep, generator detail, campaign delivery.',
    route: '/eoc/activations/EOC-2026-013',
    ownerRoles: ['eoc-director', 'chief-of-police'],
    lastUsedAt: isoSeconds(hoursAgo(0.4)),
  },
  {
    id: 'CPLT-CLERY',
    name: 'Clery Copilot',
    scope: 'Clery',
    description: 'Compliance follow-up — ASR completeness, geography certification, Timely Warning ledger.',
    route: '/clery',
    ownerRoles: ['clery-officer'],
    lastUsedAt: isoSeconds(daysAgo(3)),
  },
  {
    id: 'CPLT-CONDUCT',
    name: 'Conduct Copilot',
    scope: 'Conduct',
    description: 'Module 5B follow-up — Medical Amnesty, FERPA §99.31, Stop Campus Hazing, sanctions.',
    route: '/conduct',
    ownerRoles: ['dean-of-students'],
    lastUsedAt: isoSeconds(daysAgo(1)),
  },
  {
    id: 'CPLT-ASK',
    name: 'Ask the Hub',
    scope: 'Platform',
    description: 'Platform-wide natural-language Q+A — grounded in the medallion catalog with citations.',
    route: '/ask',
    ownerRoles: ['chief-of-police', 'eoc-director', 'dean-of-students', 'clery-officer', 'bit-chair', 'ciso'],
    lastUsedAt: isoSeconds(hoursAgo(6)),
  },
];
