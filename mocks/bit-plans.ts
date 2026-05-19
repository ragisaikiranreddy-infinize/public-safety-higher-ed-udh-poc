/**
 * BIT support-plan actions.
 *
 * Each BIT case carries 0..6 plan actions. Thread A has 5 hand-authored
 * actions; procedural cases get 1..3 routine actions.
 */

import type { BITPlanAction } from '@/lib/types';
import { isoSeconds, daysAgo, inDays } from '@/lib/time';
import { rng, randInt, pick } from '@/lib/seed';
import { BIT_CASES } from './bit-cases';
import { THREAD_A_BIT_CASE_ID } from './threads';

const r = rng('bit-plans-v1');

// =========================================================================
// Thread A — hand-authored plan actions
// =========================================================================

const threadAActions: BITPlanAction[] = [
  {
    id: 'BPA-THREAD-A-01',
    caseId: THREAD_A_BIT_CASE_ID,
    kind: 'follow-up-meeting',
    ownerRole: 'bit-chair',
    ownerPersonId: 'PER-001008',
    dueAt: isoSeconds(inDays(5)),
    status: 'pending',
    notes: 'Weekly BIT team review — present updated risk gauge + access trend.',
    classification: 'ferpa-edu-record',
  },
  {
    id: 'BPA-THREAD-A-02',
    caseId: THREAD_A_BIT_CASE_ID,
    kind: 'welfare-check',
    ownerRole: 'chief-of-police',
    dueAt: isoSeconds(daysAgo(2)),
    status: 'completed',
    notes: 'Welfare check at Carter Hall completed; INC-2026-04881 closed no-action.',
    classification: 'ferpa-edu-record',
  },
  {
    id: 'BPA-THREAD-A-03',
    caseId: THREAD_A_BIT_CASE_ID,
    kind: 'counseling-referral',
    ownerRole: 'dean-of-students',
    dueAt: isoSeconds(inDays(2)),
    status: 'in-progress',
    notes: 'Voluntary referral offered; outreach call placed by Dean of Students office.',
    classification: 'ferpa-edu-record',
  },
  {
    id: 'BPA-THREAD-A-04',
    caseId: THREAD_A_BIT_CASE_ID,
    kind: 'academic-accommodation',
    ownerRole: 'dean-of-students',
    dueAt: isoSeconds(inDays(7)),
    status: 'pending',
    notes: 'Coordinate with Registrar to extend CS coursework deadlines (LMS engagement drop).',
    classification: 'ferpa-edu-record',
  },
  {
    id: 'BPA-THREAD-A-05',
    caseId: THREAD_A_BIT_CASE_ID,
    kind: 'safety-plan-coordination',
    ownerRole: 'title-ix-coordinator',
    dueAt: isoSeconds(inDays(3)),
    status: 'pending',
    notes:
      '[BARRIER] Coordinate supportive-measure overlap with Title IX intake (TIX-2026-0014). Detail walled.',
    classification: 'title-ix-sensitive',
  },
];

// =========================================================================
// Procedural plan actions (1..3 per non-Thread-A case)
// =========================================================================

const ACTION_POOL: BITPlanAction['kind'][] = [
  'welfare-check', 'follow-up-meeting', 'counseling-referral',
  'follow-up-meeting', 'safety-plan-coordination',
];

const STATUS_POOL: BITPlanAction['status'][] = [
  'pending', 'in-progress', 'pending', 'completed', 'overdue',
];

const procedural: BITPlanAction[] = [];
let seq = 0;
BIT_CASES
  .filter((c) => c.id !== THREAD_A_BIT_CASE_ID)
  .forEach((c) => {
    const n = randInt(r, 1, 3);
    for (let i = 0; i < n; i++) {
      const kind = pick(r, ACTION_POOL);
      const status = pick(r, STATUS_POOL);
      const due = status === 'completed' ? -randInt(r, 1, 14) : randInt(r, 1, 21);
      seq++;
      procedural.push({
        id: `BPA-${seq.toString().padStart(5, '0')}`,
        caseId: c.id,
        kind,
        ownerRole: pick(r, ['bit-chair', 'dean-of-students'] as const),
        dueAt: due >= 0 ? isoSeconds(inDays(due)) : isoSeconds(daysAgo(-due)),
        status,
        notes:
          kind === 'welfare-check' ? 'Welfare check requested from UPD; standard procedure.'
          : kind === 'follow-up-meeting' ? 'Routine weekly BIT team review.'
          : kind === 'counseling-referral' ? 'Voluntary counseling referral offered.'
          : 'Safety-plan coordination logged.',
        classification: 'ferpa-edu-record',
      });
    }
  });

export const BIT_PLAN_ACTIONS: BITPlanAction[] = [...threadAActions, ...procedural];

export const THREAD_A_BIT_PLAN_ACTIONS = threadAActions;
