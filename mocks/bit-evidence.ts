/**
 * BIT evidence — every signal attached to a BIT case.
 *
 * For the Thread A case (BIT-2026-0067) we hand-author the canonical
 * 9 evidence rows that the AI briefing cites by number:
 *   1. Prior alcohol-policy conduct (sophomore year)
 *   2. Guest-policy violation at Carter Hall (6 months ago)
 *   3. After-hours card-swipe pattern (47 swipes)
 *   4. Camera-analytic loitering cluster (11 events)
 *   5. Anonymous tips × 6 (matched via device-id)
 *   6. Recent welfare check (2 hours ago)
 *   7. LMS engagement drop (D2L analytics)
 *   8. Trespass incident from a year ago
 *   9. Walled Title IX informal intake (barrier-only)
 *
 * Procedural evidence (~60 rows) attaches to the other BIT cases for list density.
 */

import type { BITEvidence } from '@/lib/types';
import { isoSeconds, daysAgo, hoursAgo, minutesAgo } from '@/lib/time';
import { rng, randInt, pick } from '@/lib/seed';
import { BIT_CASES } from './bit-cases';
import { THREAD_A_BIT_CASE_ID } from './threads';

const r = rng('bit-evidence-v1');

// =========================================================================
// Thread A — the 9 canonical evidence rows
// =========================================================================

const threadAEvidence: BITEvidence[] = [
  {
    id: 'BEV-THREAD-A-01',
    caseId: THREAD_A_BIT_CASE_ID,
    kind: 'conduct-case',
    sourceRefId: 'COND-2024-00211',
    evidenceDatasetId: 'bit.cases_normalized',
    observedAt: isoSeconds(daysAgo(420)),
    summary:
      'Sophomore-year alcohol-policy violation in Adams Hall — closed with educational program completion. Pattern marker for current case.',
    weight: 18,
    classification: 'ferpa-edu-record',
  },
  {
    id: 'BEV-THREAD-A-02',
    caseId: THREAD_A_BIT_CASE_ID,
    kind: 'conduct-case',
    sourceRefId: 'COND-2025-01882',
    evidenceDatasetId: 'bit.cases_normalized',
    observedAt: isoSeconds(daysAgo(178)),
    summary:
      'Guest-policy violation at BLD-CARTER-HALL — subject does not live in this building. First signal at the building of concern.',
    weight: 22,
    classification: 'ferpa-edu-record',
  },
  {
    id: 'BEV-THREAD-A-03',
    caseId: THREAD_A_BIT_CASE_ID,
    kind: 'access-anomaly',
    sourceRefId: 'ACS-CARTER-CLUSTER',
    evidenceDatasetId: 'access.events_normalized',
    observedAt: isoSeconds(daysAgo(3)),
    summary:
      '47 after-hours card swipes at DOR-CARTER-MAIN-S over the past 60 days, clustered 22:00–02:00. Subject does not reside in Carter Hall.',
    weight: 30,
    classification: 'pii',
  },
  {
    id: 'BEV-THREAD-A-04',
    caseId: THREAD_A_BIT_CASE_ID,
    kind: 'camera-analytic',
    sourceRefId: 'VEV-CARTER-N3-CLUSTER',
    evidenceDatasetId: 'vms.events_normalized',
    observedAt: isoSeconds(daysAgo(3)),
    summary:
      '11 corroborating loitering events on CAM-CARTER-N3 in the same 22:00–02:00 window. Average dwell 4m12s; confidence 0.78–0.92.',
    weight: 20,
    classification: 'restricted-investigation',
  },
  {
    id: 'BEV-THREAD-A-05',
    caseId: THREAD_A_BIT_CASE_ID,
    kind: 'tip',
    sourceRefId: 'TIP-THREAD-A-BUNDLE',
    evidenceDatasetId: 'tips.anonymous_raw',
    observedAt: isoSeconds(daysAgo(11)),
    summary:
      'Six anonymous tips over 45 days reference the same person + building. Tips matched via shared device-id (dev-9c4f7b21) with 84% confidence.',
    weight: 18,
    classification: 'pii',
  },
  {
    id: 'BEV-THREAD-A-06',
    caseId: THREAD_A_BIT_CASE_ID,
    kind: 'incident',
    sourceRefId: 'INC-2026-04881',
    evidenceDatasetId: 'incidents.conformed',
    observedAt: isoSeconds(hoursAgo(2.3)),
    summary:
      'Welfare check at Carter Hall main entry 2 hours ago — cleared no-action. Reporting party: Carter Hall RA. Subject not on scene.',
    weight: 10,
    classification: 'cji',
  },
  {
    id: 'BEV-THREAD-A-07',
    caseId: THREAD_A_BIT_CASE_ID,
    kind: 'lms-engagement',
    sourceRefId: 'D2L-ENGAGE-DROP',
    evidenceDatasetId: 'mart.bit_case_briefing_features',
    observedAt: isoSeconds(daysAgo(7)),
    summary:
      'D2L engagement score dropped 38% vs. 90-day baseline. Six consecutive missed submissions across two CS courses.',
    weight: 8,
    classification: 'ferpa-edu-record',
  },
  {
    id: 'BEV-THREAD-A-08',
    caseId: THREAD_A_BIT_CASE_ID,
    kind: 'incident',
    sourceRefId: 'INC-2025-09114',
    evidenceDatasetId: 'incidents.conformed',
    observedAt: isoSeconds(daysAgo(96)),
    summary:
      'Prior trespass incident at Carter Hall 3 months ago — closed with verbal warning. Subject involved as named party.',
    weight: 12,
    classification: 'cji',
  },
  {
    id: 'BEV-THREAD-A-09',
    caseId: THREAD_A_BIT_CASE_ID,
    kind: 'observation',
    sourceRefId: 'TIX-2026-0014',
    // No dataset citation — Title IX is walled and surfaces as a barrier hit.
    observedAt: isoSeconds(daysAgo(28)),
    summary:
      '[BARRIER] An informal Title IX intake exists naming the subject. Content withheld; coordinate with Title IX Coordinator.',
    weight: 25,
    classification: 'title-ix-sensitive',
  },
];

// =========================================================================
// Procedural evidence — small distribution across the other 22 BIT cases
// =========================================================================

const KIND_POOL: BITEvidence['kind'][] = [
  'tip', 'access-anomaly', 'incident', 'lms-engagement',
  'tip', 'roommate-report', 'observation',
];

const procedural: BITEvidence[] = [];
let seq = 0;
BIT_CASES
  .filter((c) => c.id !== THREAD_A_BIT_CASE_ID)
  .forEach((c) => {
    const n = Math.max(1, Math.min(5, c.contributorCounts.tips + c.contributorCounts.incidents));
    for (let i = 0; i < n; i++) {
      const kind = pick(r, KIND_POOL);
      const daysBack = randInt(r, 1, 120);
      seq++;
      procedural.push({
        id: `BEV-${seq.toString().padStart(5, '0')}`,
        caseId: c.id,
        kind,
        observedAt: kind === 'observation'
          ? isoSeconds(minutesAgo(randInt(r, 5, 60)))
          : isoSeconds(daysAgo(daysBack)),
        summary:
          kind === 'tip' ? 'Anonymous tip received — routed for BIT review.'
          : kind === 'access-anomaly' ? 'Unusual-building swipe pattern flagged by Silver conformer.'
          : kind === 'incident' ? 'Welfare-check incident — no further action recommended.'
          : kind === 'lms-engagement' ? 'LMS engagement dropped below 60-day baseline threshold.'
          : kind === 'roommate-report' ? 'Roommate report logged via ResLife portal.'
          : 'Case manager observation logged at last team meeting.',
        weight: randInt(r, 3, 14),
        classification: kind === 'incident' ? 'cji' : 'ferpa-edu-record',
      });
    }
  });

export const BIT_EVIDENCE: BITEvidence[] = [...threadAEvidence, ...procedural];

export const THREAD_A_BIT_EVIDENCE = threadAEvidence;
