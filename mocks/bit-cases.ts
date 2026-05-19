/**
 * BIT (Behavioral Intervention Team) cases.
 *
 * Composition:
 *   - 1 hand-authored Thread A case (BIT-2026-0067) — the demo focus
 *   - ~22 procedurally generated cases across the four NaBITA tiers
 *
 * The Thread A case is the centerpiece of the R5 demo moment:
 *   - Subject PER-008470 (Tyler Anderson)
 *   - Tier "elevated", trending rising
 *   - Linked to: COND-2024-00211 (alcohol), COND-2025-01882 (guest policy),
 *     INC-2025-09114 (trespass), INC-2026-04881 (welfare check),
 *     TIX-2026-0014 (walled Title IX intake)
 *   - 47 access anomalies + 11 camera analytics + 6 tips contribute
 */

import type { BITCase, BITCaseStatus, BITRiskTier, BITRiskTrend } from '@/lib/types';
import { isoSeconds, daysAgo, hoursAgo, inDays } from '@/lib/time';
import { rng, randInt, pick } from '@/lib/seed';
import { PERSONS } from './persons';
import {
  THREAD_A_BIT_CASE_ID,
  THREAD_A_SUBJECT_PERSON_ID,
  THREAD_A_GUEST_POLICY_CONDUCT_CASE_ID,
  THREAD_A_PRIOR_ALCOHOL_CONDUCT_CASE_ID,
  THREAD_A_TITLE_IX_INTAKE_ID,
} from './threads';

const r = rng('bit-cases-active');

const TIER_POOL: { tier: BITRiskTier; weight: number }[] = [
  { tier: 'mild', weight: 8 },
  { tier: 'moderate', weight: 10 },
  { tier: 'elevated', weight: 4 },
  { tier: 'critical', weight: 1 },
];

const STATUS_BY_TIER: Record<BITRiskTier, BITCaseStatus[]> = {
  mild: ['intake', 'screening', 'monitoring'],
  moderate: ['screening', 'monitoring', 'active-review'],
  elevated: ['active-review', 'monitoring'],
  critical: ['imminent-threat', 'active-review'],
};

const TREND_POOL: BITRiskTrend[] = ['rising', 'stable', 'falling'];

function flatten<T>(items: { item: T; weight: number }[]): T[] {
  const out: T[] = [];
  items.forEach(({ item, weight }) => {
    for (let i = 0; i < weight; i++) out.push(item);
  });
  return out;
}

// =========================================================================
// Thread A — BIT-2026-0067 (the demo focus)
// =========================================================================

const threadACase: BITCase = {
  id: THREAD_A_BIT_CASE_ID,
  subjectPersonId: THREAD_A_SUBJECT_PERSON_ID,
  status: 'active-review',
  riskTier: 'elevated',
  riskTrend: 'rising',
  nabita: {
    subject: 6,
    target: 5,
    environment: 4,
    precipitating: 7,
  },
  openedAt: isoSeconds(daysAgo(38)),
  lastReviewedAt: isoSeconds(daysAgo(2)),
  nextReviewDueAt: isoSeconds(inDays(5)),
  caseLead: 'PER-001008', // Margaret Chen
  teamMemberIds: ['PER-001008'],
  linkedIncidentIds: ['INC-2025-09114', 'INC-2026-04881'],
  linkedConductCaseIds: [
    THREAD_A_PRIOR_ALCOHOL_CONDUCT_CASE_ID,
    THREAD_A_GUEST_POLICY_CONDUCT_CASE_ID,
  ],
  linkedTitleIxCaseId: THREAD_A_TITLE_IX_INTAKE_ID,
  linkedNoContactOrderIds: [],
  contributorCounts: {
    tips: 6,
    accessAnomalies: 47,
    cameraAnalytics: 11,
    incidents: 2,
    conduct: 2,
    other: 1, // LMS engagement drop
  },
  imminentThreatFinding: false,
  narrative:
    'Junior student showing six-month pattern of after-hours card-swipes at a residence hall they do not live in (47 swipes 22:00–02:00 at Carter Hall main entry), 11 corroborating camera-analytic loitering events, and six anonymous tips referencing the same person and location. Open prior conduct (substance + residential), walled Title IX intake on file.',
  classification: 'ferpa-edu-record',
  threadTag: 'A',
};

// =========================================================================
// Procedural BIT cases (~22)
// =========================================================================

const tierPool = flatten(TIER_POOL.map(({ tier, weight }) => ({ item: tier, weight })));

// Eligible subjects — students flagged inOpenBITCase OR a random sample.
const eligibleSubjects = PERSONS.filter(
  (p) =>
    p.affiliations.includes('student') &&
    p.id !== THREAD_A_SUBJECT_PERSON_ID,
).slice(0, 30);

const procedural: BITCase[] = [];
for (let i = 0; i < 22; i++) {
  const subject = eligibleSubjects[i % eligibleSubjects.length];
  const tier = pick(r, tierPool);
  const status = pick(r, STATUS_BY_TIER[tier]);
  const trend = pick(r, TREND_POOL);
  const ageDays = randInt(r, 4, 180);
  const reviewedAgo = randInt(r, 1, 18);
  const nextDue = randInt(r, 1, 21);
  const idx = (i + 1).toString().padStart(4, '0');

  procedural.push({
    id: `BIT-2026-${idx}`,
    subjectPersonId: subject.id,
    status,
    riskTier: tier,
    riskTrend: trend,
    nabita: {
      subject: randInt(r, 1, 9),
      target: randInt(r, 1, 8),
      environment: randInt(r, 1, 7),
      precipitating: randInt(r, 1, 8),
    },
    openedAt: isoSeconds(daysAgo(ageDays)),
    lastReviewedAt: isoSeconds(daysAgo(reviewedAgo)),
    nextReviewDueAt: isoSeconds(inDays(nextDue)),
    caseLead: 'PER-001008',
    teamMemberIds: ['PER-001008'],
    linkedIncidentIds: [],
    linkedConductCaseIds: [],
    linkedNoContactOrderIds: [],
    contributorCounts: {
      tips: randInt(r, 0, 3),
      accessAnomalies: randInt(r, 0, 6),
      cameraAnalytics: randInt(r, 0, 2),
      incidents: randInt(r, 0, 2),
      conduct: randInt(r, 0, 1),
      other: randInt(r, 0, 2),
    },
    imminentThreatFinding: tier === 'critical' && r() < 0.4,
    narrative:
      tier === 'critical'
        ? 'Multi-signal pattern under active review; team has convened twice this week.'
        : tier === 'elevated'
        ? 'Sustained signal across two or more dimensions; trending requires monitoring.'
        : tier === 'moderate'
        ? 'Single-dimension signal under structured monitoring; planned check-in.'
        : 'Low-acuity intake from welfare check / faculty report; routine monitoring.',
    classification: 'ferpa-edu-record',
  });
}

// Pin hoursAgo to keep ANCHOR pinned (consume the import to avoid TS warnings).
void hoursAgo;

export const BIT_CASES: BITCase[] = [threadACase, ...procedural].sort(
  (a, b) => {
    const order: Record<BITRiskTier, number> = { critical: 0, elevated: 1, moderate: 2, mild: 3 };
    if (order[a.riskTier] !== order[b.riskTier]) return order[a.riskTier] - order[b.riskTier];
    return new Date(b.openedAt).getTime() - new Date(a.openedAt).getTime();
  },
);

export const THREAD_A_BIT_CASE = threadACase;
