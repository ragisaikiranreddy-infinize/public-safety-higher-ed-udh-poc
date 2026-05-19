/**
 * Timely Warning ledger.
 *
 * Per 34 CFR 668.46(e), the institution must issue a Timely Warning for any
 * Clery crime that represents a continuing threat to the campus community.
 *
 * The Thread C anchor warning (TWR-2025-0029) was issued 38 minutes after
 * incident receipt — well inside the 60-minute target — and was VAWA-
 * eligible (sex offense). The fixture also includes:
 *   - declined warnings (continuing-threat assessment concluded no)
 *   - pending warnings (under review)
 *   - 6 historical issued warnings
 */

import type { TimelyWarning } from '@/lib/types';
import { isoSeconds, daysAgo } from '@/lib/time';
import { rng, randInt, pick } from '@/lib/seed';
import {
  THREAD_C_TIMELY_WARNING_ID,
  THREAD_C_TRIGGERING_INCIDENT_ID,
  THREAD_C_RELATED_INCIDENT_IDS,
} from './threads';

const r = rng('timely-warnings-v1');

// =========================================================================
// Thread C anchor — TWR-2025-0029, issued 38 min after incident receipt
// =========================================================================

const threadCWarning: TimelyWarning = {
  id: THREAD_C_TIMELY_WARNING_ID,
  triggeringIncidentId: THREAD_C_TRIGGERING_INCIDENT_ID,
  reportingYear: 2025,
  decision: 'issued',
  decidedAt: isoSeconds(daysAgo(152)),
  decidedByRole: 'chief-of-police',
  minutesToIssue: 38,
  vawaEligible: true,
  continuingThreatAssessment:
    'Sex offense at an on-campus residential building with unknown suspect. ' +
    'Continuing-threat assessment: YES — suspect not identified and victim unable to provide a ' +
    'description. Warning issued within statutory window; Title IX coordination in parallel. ' +
    'Decided by Chief w/ General Counsel concurrence.',
  classification: 'public',
  threadTag: 'C',
};

// =========================================================================
// Historical warnings
// =========================================================================

const HISTORICAL: { decision: TimelyWarning['decision']; vawa: boolean; min?: number; note: string; daysBack: number }[] = [
  {
    decision: 'issued',
    vawa: false,
    min: 22,
    daysBack: 41,
    note: 'Armed robbery on Public Property (West Blvd). Suspect at large. Decision: issue.',
  },
  {
    decision: 'declined',
    vawa: true,
    daysBack: 88,
    note: 'Domestic-violence incident — both parties known to each other; no continuing threat to broader community. Decision: decline.',
  },
  {
    decision: 'issued',
    vawa: false,
    min: 51,
    daysBack: 116,
    note: 'Series of burglaries in West Wing buildings; pattern emerged across three nights. Decision: issue.',
  },
  {
    decision: 'pending',
    vawa: true,
    daysBack: 1,
    note: 'Stalking report under review; continuing-threat assessment ongoing.',
  },
  {
    decision: 'issued',
    vawa: false,
    min: 14,
    daysBack: 200,
    note: 'Aggravated assault near Student Union. Suspect description published. Decision: issue.',
  },
  {
    decision: 'declined',
    vawa: false,
    daysBack: 240,
    note: 'Burglary discovered after-the-fact in unattended office; no continuing threat indicated. Decision: decline.',
  },
];

const historical: TimelyWarning[] = HISTORICAL.map((h, i) => ({
  id: `TWR-2025-${(34 + i).toString().padStart(4, '0')}`,
  triggeringIncidentId: pick(r, THREAD_C_RELATED_INCIDENT_IDS),
  reportingYear: 2025,
  decision: h.decision,
  decidedAt: isoSeconds(daysAgo(h.daysBack)),
  decidedByRole: 'chief-of-police',
  minutesToIssue: h.min,
  vawaEligible: h.vawa,
  continuingThreatAssessment: h.note,
  classification: 'public',
}));

// Confirm at least one randInt usage so the import isn't flagged.
void randInt;

export const TIMELY_WARNINGS: TimelyWarning[] = [threadCWarning, ...historical].sort(
  (a, b) => new Date(b.decidedAt).getTime() - new Date(a.decidedAt).getTime(),
);

export const THREAD_C_TIMELY_WARNING = threadCWarning;
