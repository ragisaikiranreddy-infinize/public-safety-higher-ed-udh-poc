/**
 * Bias / hate-related incidents — BART (Bias Response Team) workflow.
 *
 * Some clear the criminal hate-crime threshold and are referred to PD; most
 * stay in the BART-only workflow (per IB-BART-TO-PD-COND barrier).
 */

import type { BiasIncident, BiasIncidentStatus } from '@/lib/types';
import { isoSeconds, daysAgo } from '@/lib/time';
import { rng, randInt, pick } from '@/lib/seed';
import { PERSONS } from './persons';

const r = rng('bias-incidents-v1');

const BIAS_CATS = ['race', 'religion', 'sexual-orientation', 'gender', 'gender-identity', 'disability', 'ethnicity', 'national-origin'] as const;
const BUILDINGS = ['BLD-ADAMS-HALL', 'BLD-CARTER-HALL', 'BLD-MADDOX-HALL', 'BLD-STUDENT-UNION', 'BLD-MAIN-LIBRARY', 'BLD-ARENA'];

const SUMMARIES = [
  'Graffiti with bias-motivated content discovered on a residence-hall door.',
  'Verbal slur reported during a dining-hall altercation.',
  'Bias-motivated harassment via anonymous social-media account targeting a student leader.',
  'Anti-religious flyer found posted in a public corridor.',
  'Repeated misgendering reported by a student against a peer; documented per BART process.',
  'Pattern of exclusionary language reported by a study-group member.',
  'Disability-bias remark made by an instructor in a classroom; faculty review concurrent.',
  'National-origin slur during a sporting event; venue staff intervened.',
];

const STATUS_POOL: BiasIncidentStatus[] = ['reviewed', 'reviewed', 'closed', 'no-action', 'referred-pd', 'reported'];

const students = PERSONS.filter((p) => p.affiliations.includes('student'));

export const BIAS_INCIDENTS: BiasIncident[] = Array.from({ length: 18 }, (_, i) => {
  const thresholdMet = r() < 0.18;
  const status = thresholdMet ? 'referred-pd' : pick(r, STATUS_POOL);
  return {
    id: `BIA-2026-${(i + 1).toString().padStart(4, '0')}`,
    reportedAt: isoSeconds(daysAgo(randInt(r, 2, 360))),
    subjectPersonId: r() < 0.55 ? students[i % students.length].id : undefined,
    biasCategory: pick(r, BIAS_CATS),
    hateCrimeThresholdMet: thresholdMet,
    status,
    buildingId: pick(r, BUILDINGS),
    summary: pick(r, SUMMARIES),
    linkedIncidentId: thresholdMet ? `INC-2026-${randInt(r, 4000, 9000)}` : undefined,
    classification: 'ferpa-edu-record',
  };
});
