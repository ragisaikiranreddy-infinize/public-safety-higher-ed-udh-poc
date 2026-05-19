/**
 * LiveSafe two-way chats — spawned from a subset of tips.
 *
 * Two hand-authored Thread A chats give the demo a "see how the reporter
 * felt" moment. The rest are procedural for list density.
 */

import type { LiveSafeChat } from '@/lib/types';
import { isoSeconds, daysAgo, minutesAgo } from '@/lib/time';
import { rng, randInt, pick } from '@/lib/seed';

const r = rng('livesafe-chats-v1');

// =========================================================================
// Thread A — two hand-authored conversations
// =========================================================================

const threadAChats: LiveSafeChat[] = [
  {
    id: 'LSC-THREAD-A-01',
    tipId: 'TIP-2026-0258',
    startedAt: isoSeconds(daysAgo(6)),
    participantRole: 'reporter',
    turns: [
      { role: 'reporter', at: isoSeconds(daysAgo(6)), text: 'He keeps coming back. Six tips now. Why is nothing being done?' },
      {
        role: 'operator',
        at: isoSeconds(daysAgo(6)),
        text:
          'Thank you for reporting again. Each tip is logged and the BIT team is actively reviewing the pattern. Are you safe right now?',
      },
      { role: 'reporter', at: isoSeconds(daysAgo(6)), text: 'Yes for now. I just want him to stop coming here.' },
      {
        role: 'operator',
        at: isoSeconds(daysAgo(6)),
        text:
          'Understood. Would you be willing to provide a description in person to the RA so we can correlate? You can stay anonymous.',
      },
      { role: 'reporter', at: isoSeconds(daysAgo(6)), text: 'Maybe. Let me think about it.' },
    ],
    classification: 'pii',
    threadTag: 'A',
  },
  {
    id: 'LSC-THREAD-A-02',
    tipId: 'TIP-2026-0231',
    startedAt: isoSeconds(daysAgo(13)),
    participantRole: 'reporter',
    turns: [
      { role: 'reporter', at: isoSeconds(daysAgo(13)), text: 'Calling about something I\'ve seen at Carter Hall.' },
      { role: 'operator', at: isoSeconds(daysAgo(13)), text: 'Go ahead — what have you seen?' },
      {
        role: 'reporter',
        at: isoSeconds(daysAgo(13)),
        text: 'A guy hanging out by the back door late at night. Not a resident. I\'ve seen him three or four times.',
      },
      { role: 'operator', at: isoSeconds(daysAgo(13)), text: 'Can you describe him?' },
      {
        role: 'reporter',
        at: isoSeconds(daysAgo(13)),
        text: 'Maybe 5\'10". Brown hair. Wears a dark hoodie. He sometimes uses a card to get in.',
      },
      {
        role: 'operator',
        at: isoSeconds(daysAgo(13)),
        text: 'Thank you. This is being logged and routed to BIT. They will follow up on the pattern.',
      },
    ],
    classification: 'pii',
    threadTag: 'A',
  },
];

// =========================================================================
// Procedural chats — 18 short conversations across the past 60 days
// =========================================================================

const REPORTER_LINES = [
  'Just wanted to report something I saw.',
  'There\'s loud music coming from the next room.',
  'I think someone is using drugs in the bathroom.',
  'Saw a sketchy guy near the bike rack.',
  'My friend isn\'t answering — should I be worried?',
  'Someone is yelling in the hall.',
];

const OPERATOR_LINES = [
  'Thanks — are you safe right now?',
  'Got it. Are you in a position to leave the area?',
  'Routing to UPD now. They\'ll follow up.',
  'Routing to BIT for review.',
  'Closing out — thank you for the report.',
];

const procedural: LiveSafeChat[] = [];
for (let i = 0; i < 18; i++) {
  const daysBack = randInt(r, 1, 60);
  const startBase = daysAgo(daysBack);
  const turns: LiveSafeChat['turns'] = [];
  const turnCount = randInt(r, 2, 5);
  for (let t = 0; t < turnCount; t++) {
    const role: 'reporter' | 'operator' = t % 2 === 0 ? 'reporter' : 'operator';
    turns.push({
      role,
      at: isoSeconds(minutesAgo(daysBack * 24 * 60 - t * randInt(r, 1, 6))),
      text: role === 'reporter' ? pick(r, REPORTER_LINES) : pick(r, OPERATOR_LINES),
    });
  }
  procedural.push({
    id: `LSC-${(i + 1).toString().padStart(4, '0')}`,
    startedAt: isoSeconds(startBase),
    participantRole: 'reporter',
    turns,
    classification: 'pii',
  });
}

export const LIVESAFE_CHATS: LiveSafeChat[] = [...threadAChats, ...procedural].sort(
  (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
);

export const THREAD_A_LIVESAFE_CHATS = threadAChats;
