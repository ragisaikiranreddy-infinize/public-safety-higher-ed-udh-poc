/**
 * Sanctions — outcomes of Student Conduct cases.
 *
 * Each closed conduct case has 1..4 sanctions; pending cases have 0. Thread A
 * cases have hand-authored sanctions; procedural cases get a small mix.
 */

import type { Sanction, SanctionKind, SanctionStatus } from '@/lib/types';
import { isoSeconds, daysAgo, inDays } from '@/lib/time';
import { rng, randInt, pick } from '@/lib/seed';
import { CONDUCT_CASES } from './conduct-cases';
import {
  THREAD_A_PRIOR_ALCOHOL_CONDUCT_CASE_ID,
  THREAD_A_GUEST_POLICY_CONDUCT_CASE_ID,
} from './threads';

const r = rng('sanctions-v1');

// =========================================================================
// Thread A — 5 hand-authored sanctions across the two prior cases
// =========================================================================

const threadASanctions: Sanction[] = [
  {
    id: 'SNC-2024-00211-A',
    conductCaseId: THREAD_A_PRIOR_ALCOHOL_CONDUCT_CASE_ID,
    kind: 'edu-program',
    status: 'completed',
    issuedAt: isoSeconds(daysAgo(418)),
    dueAt: isoSeconds(daysAgo(390)),
    completedAt: isoSeconds(daysAgo(392)),
    eduProgramId: 'EDU-PROG-ALCEDU',
    description: 'AlcoholEdu completion required within 30 days.',
    classification: 'ferpa-edu-record',
  },
  {
    id: 'SNC-2024-00211-B',
    conductCaseId: THREAD_A_PRIOR_ALCOHOL_CONDUCT_CASE_ID,
    kind: 'warning',
    status: 'completed',
    issuedAt: isoSeconds(daysAgo(418)),
    completedAt: isoSeconds(daysAgo(418)),
    description: 'Written warning placed in conduct file.',
    classification: 'ferpa-edu-record',
  },
  {
    id: 'SNC-2024-00211-C',
    conductCaseId: THREAD_A_PRIOR_ALCOHOL_CONDUCT_CASE_ID,
    kind: 'probation',
    status: 'completed',
    issuedAt: isoSeconds(daysAgo(418)),
    dueAt: isoSeconds(daysAgo(298)),
    completedAt: isoSeconds(daysAgo(298)),
    description: 'Conduct probation — 120 days. No further violations during term.',
    classification: 'ferpa-edu-record',
  },
  {
    id: 'SNC-2025-01882-A',
    conductCaseId: THREAD_A_GUEST_POLICY_CONDUCT_CASE_ID,
    kind: 'edu-program',
    status: 'completed',
    issuedAt: isoSeconds(daysAgo(175)),
    dueAt: isoSeconds(daysAgo(145)),
    completedAt: isoSeconds(daysAgo(148)),
    eduProgramId: 'EDU-PROG-RESLIFE-RESET',
    description: 'Residential Life Community Reset workshop.',
    classification: 'ferpa-edu-record',
  },
  {
    id: 'SNC-2025-01882-B',
    conductCaseId: THREAD_A_GUEST_POLICY_CONDUCT_CASE_ID,
    kind: 'probation',
    status: 'active',
    issuedAt: isoSeconds(daysAgo(175)),
    dueAt: isoSeconds(inDays(15)),
    description: 'Housing probation — 90 days. Currently 15 days remaining.',
    classification: 'ferpa-edu-record',
  },
];

// =========================================================================
// Procedural — 1..3 per closed/sanction-active conduct case
// =========================================================================

const KIND_POOL: SanctionKind[] = [
  'warning', 'edu-program', 'probation', 'community-service',
  'warning', 'edu-program', 'housing-suspension',
];

const STATUS_POOL: SanctionStatus[] = [
  'completed', 'completed', 'active', 'pending', 'overdue',
];

const procedural: Sanction[] = [];
let seq = 0;
CONDUCT_CASES
  .filter((c) => c.sanctionCount > 0 && c.id !== THREAD_A_PRIOR_ALCOHOL_CONDUCT_CASE_ID && c.id !== THREAD_A_GUEST_POLICY_CONDUCT_CASE_ID)
  .forEach((c) => {
    const n = Math.min(c.sanctionCount, randInt(r, 1, 4));
    for (let i = 0; i < n; i++) {
      const kind = pick(r, KIND_POOL);
      const status = pick(r, STATUS_POOL);
      const issuedBack = randInt(r, 7, 180);
      const dueDelta = randInt(r, 14, 90);
      seq++;
      procedural.push({
        id: `SNC-${seq.toString().padStart(5, '0')}`,
        conductCaseId: c.id,
        kind,
        status,
        issuedAt: isoSeconds(daysAgo(issuedBack)),
        dueAt: status === 'pending' || status === 'active' || status === 'overdue'
          ? isoSeconds(inDays(status === 'overdue' ? -randInt(r, 1, 14) : dueDelta))
          : undefined,
        completedAt: status === 'completed'
          ? isoSeconds(daysAgo(Math.max(0, issuedBack - randInt(r, 7, 30))))
          : undefined,
        eduProgramId: kind === 'edu-program' ? pick(r, ['EDU-PROG-ALCEDU', 'EDU-PROG-BASICS', 'EDU-PROG-MARIJUANA-101', 'EDU-PROG-RESLIFE-RESET']) : undefined,
        description:
          kind === 'edu-program' ? 'Educational program completion.'
          : kind === 'probation' ? 'Conduct probation.'
          : kind === 'community-service' ? 'Community service hours assigned.'
          : kind === 'housing-suspension' ? 'Housing suspension.'
          : kind === 'restitution' ? 'Restitution for damage.'
          : 'Written warning.',
        classification: 'ferpa-edu-record',
      });
    }
  });

export const SANCTIONS: Sanction[] = [...threadASanctions, ...procedural];

export const THREAD_A_SANCTIONS = threadASanctions;
