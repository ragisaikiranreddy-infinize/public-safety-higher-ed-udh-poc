/**
 * Anonymous tips — ~60 procedural + 14 Thread-A-relevant.
 *
 * Thread A: 6 of the 14 hand-authored tips reference the subject or building,
 * each matched (with confidence) to PER-008470 via shared device-id
 * (dev-9c4f7b21) — this is the identity-resolution moment in the demo.
 *
 * Channels reflect the real spread per spec §4 Module 1:
 *   - LiveSafe app (most common)
 *   - Web form
 *   - Phone (anonymous)
 *   - Walk-in to BIT intake
 *
 * Tip body classification is `pii` because device-id + free-text content
 * can identify reporters; matched subject identification is `ferpa-edu-record`.
 */

import type { AnonymousTip } from '@/lib/types';
import { isoSeconds, daysAgo, hoursAgo, minutesAgo } from '@/lib/time';
import { rng, randInt, pick } from '@/lib/seed';
import { PERSONS } from './persons';
import { THREAD_A_SUBJECT_PERSON_ID, THREAD_A_BUILDING_OF_CONCERN_ID } from './threads';

const r = rng('tips-90d-v1');

// =========================================================================
// Thread A — 14 hand-authored tips (6 match the subject directly)
// =========================================================================

const threadATips: AnonymousTip[] = [
  {
    id: 'TIP-2026-0142',
    channel: 'livesafe-app',
    receivedAt: isoSeconds(daysAgo(45)),
    subjectFreeText: 'A student in Carter Hall who doesn\'t live there',
    matchedPersonId: THREAD_A_SUBJECT_PERSON_ID,
    topics: ['harassment'],
    anonymous: true,
    deviceId: 'dev-9c4f7b21',
    buildingId: THREAD_A_BUILDING_OF_CONCERN_ID,
    body:
      'There\'s a guy who keeps showing up at Carter Hall after 11pm. He doesn\'t live here. Other residents have noticed too.',
    disposition: 'routed-to-bit',
    routedTo: 'bit',
    routedAt: isoSeconds(daysAgo(44)),
    classification: 'pii',
    threadTag: 'A',
  },
  {
    id: 'TIP-2026-0163',
    channel: 'livesafe-app',
    receivedAt: isoSeconds(daysAgo(38)),
    subjectFreeText: 'Same guy as before — Carter Hall, north entry',
    matchedPersonId: THREAD_A_SUBJECT_PERSON_ID,
    topics: ['harassment'],
    anonymous: true,
    deviceId: 'dev-9c4f7b21',
    buildingId: THREAD_A_BUILDING_OF_CONCERN_ID,
    body:
      'He was here again last night. Maybe 11:30pm. He stood near the north entry for like 10 minutes.',
    disposition: 'routed-to-bit',
    routedTo: 'bit',
    routedAt: isoSeconds(daysAgo(38)),
    classification: 'pii',
    threadTag: 'A',
  },
  {
    id: 'TIP-2026-0178',
    channel: 'web',
    receivedAt: isoSeconds(daysAgo(31)),
    subjectFreeText: 'Loitering at Carter Hall',
    matchedPersonId: THREAD_A_SUBJECT_PERSON_ID,
    topics: ['harassment'],
    anonymous: true,
    deviceId: 'dev-9c4f7b21',
    buildingId: THREAD_A_BUILDING_OF_CONCERN_ID,
    body:
      'There is a person hanging around outside Carter Hall after midnight. Brown hair, maybe 5\'10". He has tried the door a few times.',
    disposition: 'routed-to-bit',
    routedTo: 'bit',
    routedAt: isoSeconds(daysAgo(30)),
    classification: 'pii',
    threadTag: 'A',
  },
  {
    id: 'TIP-2026-0214',
    channel: 'livesafe-app',
    receivedAt: isoSeconds(daysAgo(20)),
    subjectFreeText: 'Same Carter Hall situation',
    matchedPersonId: THREAD_A_SUBJECT_PERSON_ID,
    topics: ['harassment'],
    anonymous: true,
    deviceId: 'dev-9c4f7b21',
    buildingId: THREAD_A_BUILDING_OF_CONCERN_ID,
    body:
      'Reporting again. He was here last night around 1am. I saw him on the security camera feed in the lounge.',
    disposition: 'routed-to-bit',
    routedTo: 'bit',
    routedAt: isoSeconds(daysAgo(20)),
    classification: 'pii',
    threadTag: 'A',
  },
  {
    id: 'TIP-2026-0231',
    channel: 'phone',
    receivedAt: isoSeconds(daysAgo(13)),
    subjectFreeText: 'Anonymous call from a Carter Hall resident',
    matchedPersonId: THREAD_A_SUBJECT_PERSON_ID,
    topics: ['harassment', 'threat'],
    anonymous: true,
    buildingId: THREAD_A_BUILDING_OF_CONCERN_ID,
    body:
      'Caller stated she has seen a non-resident male near the building multiple times over the past month. Caller declined to provide name.',
    disposition: 'routed-to-bit',
    routedTo: 'bit',
    routedAt: isoSeconds(daysAgo(13)),
    classification: 'pii',
    threadTag: 'A',
  },
  {
    id: 'TIP-2026-0258',
    channel: 'livesafe-app',
    receivedAt: isoSeconds(daysAgo(6)),
    subjectFreeText: 'Carter Hall north entry — same person',
    matchedPersonId: THREAD_A_SUBJECT_PERSON_ID,
    topics: ['harassment'],
    anonymous: true,
    deviceId: 'dev-9c4f7b21',
    buildingId: THREAD_A_BUILDING_OF_CONCERN_ID,
    body:
      'He keeps coming back. Six tips now. Why is nothing being done? I feel unsafe leaving my room at night.',
    disposition: 'under-review',
    classification: 'pii',
    threadTag: 'A',
  },
  // ----- 8 other tips for the same general window (not subject-matching) -----
  {
    id: 'TIP-2026-0144',
    channel: 'livesafe-app',
    receivedAt: isoSeconds(daysAgo(42)),
    subjectFreeText: 'Possible substance use in Adams Hall',
    topics: ['substance'],
    anonymous: true,
    buildingId: 'BLD-ADAMS-HALL',
    body: 'Smell of marijuana on the 4th floor of Adams. Coming from one of the rooms.',
    disposition: 'routed-to-dean',
    routedTo: 'dean',
    routedAt: isoSeconds(daysAgo(42)),
    classification: 'pii',
  },
  {
    id: 'TIP-2026-0156',
    channel: 'web',
    receivedAt: isoSeconds(daysAgo(40)),
    subjectFreeText: 'Bike theft at Student Union',
    topics: ['theft'],
    anonymous: false,
    deviceId: 'dev-aa31bc',
    buildingId: 'BLD-STUDENT-UNION',
    body: 'My bike was stolen from the Union rack last night. Cable lock cut.',
    disposition: 'routed-to-pd',
    routedTo: 'pd',
    routedAt: isoSeconds(daysAgo(40)),
    classification: 'pii',
  },
  {
    id: 'TIP-2026-0181',
    channel: 'livesafe-app',
    receivedAt: isoSeconds(daysAgo(29)),
    subjectFreeText: 'Self-harm concern about roommate',
    topics: ['self-harm'],
    anonymous: true,
    body: 'Worried about my roommate. They\'ve been isolating and made some concerning comments.',
    disposition: 'routed-to-bit',
    routedTo: 'bit',
    routedAt: isoSeconds(daysAgo(29)),
    classification: 'pii',
  },
  {
    id: 'TIP-2026-0204',
    channel: 'phone',
    receivedAt: isoSeconds(daysAgo(22)),
    subjectFreeText: 'Late-night noise complaint',
    topics: ['other'],
    anonymous: true,
    buildingId: 'BLD-MADDOX-HALL',
    body: 'Loud music in Maddox 3rd floor after 2am. Multiple voices.',
    disposition: 'closed-no-action',
    classification: 'pii',
  },
  {
    id: 'TIP-2026-0223',
    channel: 'livesafe-app',
    receivedAt: isoSeconds(daysAgo(17)),
    subjectFreeText: 'Possible weapon seen in West Wing',
    topics: ['weapons'],
    anonymous: true,
    buildingId: 'BLD-WEST-WING-3',
    body: 'I think I saw a knife on the floor in the West Wing lounge. Wasn\'t there 10 minutes later.',
    disposition: 'routed-to-pd',
    routedTo: 'pd',
    routedAt: isoSeconds(daysAgo(17)),
    classification: 'pii',
  },
  {
    id: 'TIP-2026-0242',
    channel: 'walk-in',
    receivedAt: isoSeconds(daysAgo(9)),
    subjectFreeText: 'Verbal threat in dining hall',
    topics: ['threat'],
    anonymous: false,
    body: 'Two students had an argument in the dining hall. One said "I\'ll find you later."',
    disposition: 'routed-to-bit',
    routedTo: 'bit',
    routedAt: isoSeconds(daysAgo(9)),
    classification: 'pii',
  },
  {
    id: 'TIP-2026-0263',
    channel: 'livesafe-app',
    receivedAt: isoSeconds(daysAgo(4)),
    subjectFreeText: 'Possible substance use during exam week',
    topics: ['substance'],
    anonymous: true,
    body: 'Several students appear impaired in the library study rooms. Reporting in case it escalates.',
    disposition: 'under-review',
    classification: 'pii',
  },
  {
    id: 'TIP-2026-0271',
    channel: 'livesafe-app',
    receivedAt: isoSeconds(hoursAgo(18)),
    subjectFreeText: 'Suspicious vehicle near loading dock',
    topics: ['other'],
    anonymous: true,
    buildingId: 'BLD-SCIENCE-1',
    body: 'Older sedan idling for 20 min behind Science 1. License plate covered in mud.',
    disposition: 'routed-to-pd',
    routedTo: 'pd',
    routedAt: isoSeconds(hoursAgo(17)),
    classification: 'pii',
  },
];

// =========================================================================
// Procedural tips — fill out the past 90 days
// =========================================================================

const TOPIC_POOL: AnonymousTip['topics'][number][] = [
  'substance', 'substance', 'theft', 'harassment', 'other', 'other', 'self-harm', 'weapons',
];

const CHANNEL_POOL: AnonymousTip['channel'][] = [
  'livesafe-app', 'livesafe-app', 'livesafe-app', 'web', 'web', 'phone', 'walk-in', 'sms', 'email',
];

const DISPOSITION_POOL: AnonymousTip['disposition'][] = [
  'closed-no-action', 'routed-to-pd', 'routed-to-bit', 'routed-to-dean', 'under-review', 'open',
];

const eligibleSubjects = PERSONS.filter((p) => p.affiliations.includes('student')).slice(0, 60);

const buildings = [
  'BLD-ADAMS-HALL', 'BLD-MADDOX-HALL', 'BLD-CARTER-HALL', 'BLD-GRAD-TOWER',
  'BLD-WEST-WING-3', 'BLD-WEST-WING-4', 'BLD-MAIN-LIBRARY', 'BLD-STUDENT-UNION',
  'BLD-SCIENCE-1', 'BLD-ADMIN-HALL',
];

const procedural: AnonymousTip[] = [];
for (let i = 0; i < 60; i++) {
  const daysBack = randInt(r, 1, 90);
  const channel = pick(r, CHANNEL_POOL);
  const topic = pick(r, TOPIC_POOL);
  const disposition = pick(r, DISPOSITION_POOL);
  const idx = (1000 + i).toString();

  procedural.push({
    id: `TIP-2026-${idx}`,
    channel,
    receivedAt: daysBack < 1
      ? isoSeconds(minutesAgo(randInt(r, 5, 720)))
      : isoSeconds(daysAgo(daysBack)),
    subjectFreeText: pick(r, [
      'A student behaving suspiciously',
      'Late-night noise',
      'Possible substance use',
      'Unfamiliar person on the floor',
      'Concerning social-media post',
    ]),
    matchedPersonId: r() < 0.25 ? pick(r, eligibleSubjects).id : undefined,
    topics: [topic],
    anonymous: r() < 0.78,
    deviceId: r() < 0.4 ? `dev-${randInt(r, 1000, 9999).toString(16)}` : undefined,
    buildingId: r() < 0.7 ? pick(r, buildings) : undefined,
    body: pick(r, [
      'Wanted to flag this in case it matters.',
      'Reporting per the policy posted in the residence hall.',
      'May be nothing but figured I\'d say something.',
      'This happened earlier tonight.',
    ]),
    disposition,
    routedTo: disposition.startsWith('routed-to-')
      ? (disposition.replace('routed-to-', '') as 'bit' | 'tix' | 'pd' | 'dean')
      : undefined,
    routedAt: disposition.startsWith('routed-to-')
      ? isoSeconds(daysAgo(Math.max(0, daysBack - randInt(r, 0, 2))))
      : undefined,
    classification: 'pii',
  });
}

export const TIPS: AnonymousTip[] = [...threadATips, ...procedural].sort(
  (a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime(),
);

export const THREAD_A_TIPS = threadATips;
