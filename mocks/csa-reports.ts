/**
 * Campus Security Authority (CSA) disclosures.
 *
 * Per the Clery Handbook, CSAs are required to disclose crime information
 * known to them. We track three sources:
 *   - training-acknowledgment — annual training completion (boilerplate)
 *   - incident-disclosure — actual crime disclosure with ASR inclusion
 *   - annual-attestation — annual zero-disclosure attestation
 *
 * Persons with isCSAEnabled === true are CSAs in the master person record.
 */

import type { CSAReport, CSAReportSource } from '@/lib/types';
import { isoSeconds, daysAgo } from '@/lib/time';
import { rng, randInt, pick } from '@/lib/seed';
import { PERSONS } from './persons';

const r = rng('csa-reports-v1');

const csas = PERSONS.filter((p) => p.isCSAEnabled);

const SOURCE_POOL: CSAReportSource[] = [
  'training-acknowledgment',
  'training-acknowledgment',
  'training-acknowledgment',
  'annual-attestation',
  'annual-attestation',
  'incident-disclosure',
];

const SUMMARIES = {
  'training-acknowledgment': [
    'CSA annual training completed; signed acknowledgment of disclosure obligations on file.',
    'Completed Clery / VAWA combined training; quiz score 92%.',
    'Refresher training completed after onboarding to new role.',
  ],
  'annual-attestation': [
    'Annual zero-disclosure attestation submitted; no qualifying incidents observed.',
    'Annual attestation submitted with note: forwarded one welfare-check report to Title IX outside Clery scope.',
  ],
  'incident-disclosure': [
    'Disclosed a third-hand report of an off-campus party that included a fight; not Clery-reportable per geography review.',
    'Disclosed an athletics-trip incident potentially on the non-campus boundary; routed to Clery officer for classification.',
    'Disclosed a residence-hall noise complaint that escalated; coordinated with conduct + RA.',
  ],
};

// =========================================================================
// 50 procedural CSA reports + 1 anchor disclosure flagged for the Thread C cell
// =========================================================================

const threadCDisclosure: CSAReport = {
  id: 'CSA-2025-08812',
  reportedByPersonId: csas[0]?.id ?? 'PER-001008',
  reportedAt: isoSeconds(daysAgo(151)),
  source: 'incident-disclosure',
  summary:
    'Disclosed knowledge of the 2025 Carter Hall sexual-assault incident as reported to RA staff. Cleared for ASR inclusion via standards review.',
  asrInclusion: true,
  asrLineItemId: 'ASR-2025-RESHALL-SEXOFF',
  classification: 'internal',
};

const procedural: CSAReport[] = [];
for (let i = 0; i < 50; i++) {
  const source = pick(r, SOURCE_POOL);
  const csa = csas[i % csas.length] ?? csas[0];
  if (!csa) continue;
  const summaryPool = SUMMARIES[source];
  procedural.push({
    id: `CSA-2026-${i.toString().padStart(4, '0')}`,
    reportedByPersonId: csa.id,
    reportedAt: isoSeconds(daysAgo(randInt(r, 1, 360))),
    source,
    summary: pick(r, summaryPool),
    asrInclusion: source === 'incident-disclosure' && r() < 0.35,
    classification: 'internal',
  });
}

export const CSA_REPORTS: CSAReport[] = [threadCDisclosure, ...procedural].sort(
  (a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime(),
);

export const THREAD_C_CSA_DISCLOSURE = threadCDisclosure;
