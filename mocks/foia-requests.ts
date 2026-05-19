/**
 * FOIA / public-records requests with AI-assisted redaction previews.
 *
 * The Thread C anchor (FOIA-2026-077) is a press request for the 2025
 * Sex Offenses · On-Campus Residential cell — i.e. the press is asking
 * for the records behind the Thread C ASR line. The AI redaction preview
 * shows masking by classification + by field with attorney-review flags.
 */

import type {
  FOIARequest,
  FOIARedactionPreview,
  FOIARequesterAffiliation,
  FOIAStatus,
} from '@/lib/types';
import { isoSeconds, daysAgo, inDays } from '@/lib/time';
import { rng, randInt, pick } from '@/lib/seed';
import {
  THREAD_C_FOIA_REQUEST_ID,
  THREAD_C_RELATED_INCIDENT_IDS,
} from './threads';

const r = rng('foia-requests-v1');

// =========================================================================
// Thread C anchor — FOIA-2026-077 with AI-assisted redaction preview
// =========================================================================

const threadCPreview: FOIARedactionPreview = {
  recordCount: 3,
  totalMasks: 47,
  maskedByClassification: {
    'pii': 18,
    'cji': 12,
    'restricted-investigation': 14,
    'title-ix-sensitive': 3,
  },
  maskedByField: {
    'caller_phone': 3,
    'narrative': 14,
    'reporter_name': 3,
    'reporter_address': 3,
    'subject_name': 6,
    'subject_dob': 3,
    'license_plate': 2,
    'officer_name': 9,
    'witness_name': 4,
  },
  sampleExcerpt:
    'INC-2025-08812 — [REDACTED: caller_phone] reporting an [PII MASKED] involving [TITLE IX WALLED] ' +
    'at [BLD-CARTER-HALL] residential common area. Reporting Officer: [OFFICER MASKED — name + badge]. ' +
    'Witness statement attached: [REDACTED — restricted-investigation hold pending case closure]. ' +
    'NIBRS Offense: 13A — Sex Offense. Clery Geography: On-Campus Residential. Classification: ' +
    'restricted-investigation.',
  aiConfidence: 87,
  attorneyReviewItems: [
    'Witness statement excerpt at line 4 — confidence 64% (borderline whether to mask further).',
    'Officer-name reference in narrative paragraph 2 — confirm pseudonymization policy with General Counsel.',
    'Title IX cross-reference in INC-2025-08812 narrative — verify §99.31 release rationale before disclosure.',
  ],
};

const threadCRequest: FOIARequest = {
  id: THREAD_C_FOIA_REQUEST_ID,
  requesterName: 'Sarah Chen · The Daily Press',
  requesterAffiliation: 'press',
  receivedAt: isoSeconds(daysAgo(8)),
  dueAt: isoSeconds(inDays(12)),
  status: 'ai-redaction-draft',
  request:
    'Request: All incident reports, CAD events, and timely-warning materials related to ' +
    'reported sex offenses in residence halls during the 2025 reporting year. Specifically ' +
    'requesting the three incidents reflected in the ASR Sex Offenses · On-Campus Residential ' +
    'cell, with caller PII and victim identifying information redacted per FERPA + CJIS.',
  scope: {
    incidentIds: [...THREAD_C_RELATED_INCIDENT_IDS],
    crimeCategories: ['sex-offense-rape'],
    description: 'Three incidents matching the 2025 Sex Offenses · On-Campus Residential cell.',
  },
  redactionPreview: threadCPreview,
  classification: 'public',
  threadTag: 'C',
};

// =========================================================================
// Procedural requests — 10 across the past 120 days
// =========================================================================

const NAMES: { name: string; affiliation: FOIARequesterAffiliation }[] = [
  { name: 'M. Rodriguez · Tribune Investigative Desk', affiliation: 'press' },
  { name: 'D. Kim · ACLU Student Rights Project', affiliation: 'attorney' },
  { name: 'Anonymous Student', affiliation: 'student' },
  { name: 'Prof. R. Patel · Education Policy Research', affiliation: 'researcher' },
  { name: 'J. Williams · Public Records Request', affiliation: 'public' },
  { name: 'Office of the State Auditor', affiliation: 'government' },
  { name: 'A. Brown · Independent Journalist', affiliation: 'press' },
  { name: 'Attorney B. Greene · Counsel for victim', affiliation: 'attorney' },
  { name: 'Local Chapter NAACP', affiliation: 'public' },
  { name: 'Doctoral Researcher · Higher-Ed Safety', affiliation: 'researcher' },
];

const STATUS_POOL: FOIAStatus[] = [
  'received', 'in-review', 'ai-redaction-draft', 'attorney-review',
  'ready-for-release', 'released', 'denied', 'closed',
];

const REQUESTS = [
  'Records for all access-control events at BLD-CARTER-HALL over the past 30 days.',
  'Clery geography polygon set including audit history for 2024 + 2025.',
  'BIT case statistics for the past three academic years (counts only; no PII).',
  'Mass-notification campaigns sent during the Spring 2026 semester.',
  'Officer use-of-force reports for the 2024 calendar year.',
  'Hate-crime incident statistics + bias-category breakdown for 2023 + 2024.',
  'Stalking incident reports from the past two years (de-identified).',
  'Title IX informal-resolution counts by phase for 2025 (aggregate only).',
  'Annual Security Report drafts + revisions for the 2024 reporting year.',
  'Body-worn camera retention policy + incident-specific retention exceptions.',
];

const procedural: FOIARequest[] = NAMES.map((requester, i) => {
  const receivedDaysBack = randInt(r, 4, 115);
  const status = pick(r, STATUS_POOL);
  return {
    id: `FOIA-2026-${(50 + i).toString().padStart(3, '0')}`,
    requesterName: requester.name,
    requesterAffiliation: requester.affiliation,
    receivedAt: isoSeconds(daysAgo(receivedDaysBack)),
    dueAt: isoSeconds(daysAgo(Math.max(0, receivedDaysBack - 20))),
    status,
    request: REQUESTS[i],
    scope: { incidentIds: [] },
    redactionPreview:
      status === 'ai-redaction-draft' || status === 'attorney-review' || status === 'ready-for-release' || status === 'released'
        ? {
            recordCount: randInt(r, 1, 60),
            totalMasks: randInt(r, 4, 80),
            maskedByClassification: { 'pii': randInt(r, 1, 20), 'cji': randInt(r, 0, 10) },
            maskedByField: { 'narrative': randInt(r, 1, 14), 'caller_phone': randInt(r, 0, 8) },
            sampleExcerpt: 'Sample excerpt redacted by AI; full preview omitted in the demo filler.',
            aiConfidence: randInt(r, 60, 96),
            attorneyReviewItems: [],
          }
        : undefined,
    classification: 'public',
  };
});

export const FOIA_REQUESTS: FOIARequest[] = [threadCRequest, ...procedural].sort(
  (a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime(),
);

export const THREAD_C_FOIA_REQUEST = threadCRequest;
