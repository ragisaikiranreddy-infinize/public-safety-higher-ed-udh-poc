/**
 * Parental Notification audit entries.
 *
 * Each entry records a FERPA §99.31(a)(15) decision by the Dean of Students
 * office (with optional health-safety §99.31(a)(10) basis for non-alcohol/drug
 * cases). The conduct case is the typical trigger; BIT case can also be one.
 *
 * For R5 we hand-author a Thread A entry and seed ~10 procedural entries
 * for substance-conduct cases where parentalNotificationConsidered = true.
 */

import type { ParentalNotification, ParentalNotifTrigger } from '@/lib/types';
import { isoSeconds, daysAgo } from '@/lib/time';
import { rng, randInt, pick } from '@/lib/seed';
import { CONDUCT_CASES } from './conduct-cases';
import { THREAD_A_PRIOR_ALCOHOL_CONDUCT_CASE_ID, THREAD_A_SUBJECT_PERSON_ID } from './threads';

const r = rng('parental-notif-v1');

// =========================================================================
// Thread A — single hand-authored entry (sophomore alcohol case)
// =========================================================================

const threadAEntry: ParentalNotification = {
  id: 'PNT-2024-00211',
  subjectPersonId: THREAD_A_SUBJECT_PERSON_ID,
  conductCaseId: THREAD_A_PRIOR_ALCOHOL_CONDUCT_CASE_ID,
  trigger: 'alcohol-violation',
  ferpaBasis: '99.31(a)(15)-alcohol-drug-under-21',
  decidedAt: isoSeconds(daysAgo(417)),
  decidedByPersonId: 'PER-001008',
  decision: 'notified',
  rationale:
    'Subject under 21 at time of alcohol-policy violation. FERPA §99.31(a)(15) ' +
    'permits disclosure to parent regardless of dependency status. Decision logged ' +
    'per Office of the Dean of Students standard procedure.',
  classification: 'ferpa-edu-record',
};

// =========================================================================
// Procedural
// =========================================================================

const TRIGGERS: ParentalNotifTrigger[] = [
  'alcohol-violation', 'drug-violation', 'safety-concern',
];
const DECISIONS: ParentalNotification['decision'][] = ['notified', 'declined', 'pending-decision'];

const procedural: ParentalNotification[] = [];
let seq = 0;
CONDUCT_CASES
  .filter((c) => c.subtype === 'substance' && c.parentalNotificationConsidered && c.id !== THREAD_A_PRIOR_ALCOHOL_CONDUCT_CASE_ID)
  .slice(0, 10)
  .forEach((c) => {
    const trigger = pick(r, TRIGGERS);
    const decision = pick(r, DECISIONS);
    seq++;
    procedural.push({
      id: `PNT-2026-${seq.toString().padStart(5, '0')}`,
      subjectPersonId: c.subjectPersonId,
      conductCaseId: c.id,
      trigger,
      ferpaBasis: trigger === 'safety-concern'
        ? '99.31(a)(10)-health-safety-emergency'
        : '99.31(a)(15)-alcohol-drug-under-21',
      decidedAt: isoSeconds(daysAgo(randInt(r, 1, 200))),
      decidedByPersonId: 'PER-001008',
      decision,
      rationale:
        decision === 'notified'
          ? 'Under-21 violation; statutory permission established. Logged decision per policy.'
          : decision === 'declined'
          ? 'Subject age 21+ at time of violation OR no §99.31 basis present. Decision logged.'
          : 'Pending decision — awaiting Dean review at next standards meeting.',
      classification: 'ferpa-edu-record',
    });
  });

export const PARENTAL_NOTIFICATIONS: ParentalNotification[] = [threadAEntry, ...procedural];

export const THREAD_A_PARENTAL_NOTIFICATIONS = [threadAEntry];
