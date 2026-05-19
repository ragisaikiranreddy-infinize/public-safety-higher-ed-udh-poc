/**
 * NIBRS export submissions.
 *
 * Per the FBI's transition (UCR → NIBRS, complete 2021), agencies submit
 * NIBRS records on a monthly or quarterly cadence. The fixture models the
 * past 8 reporting periods, with one rejected submission to give the demo
 * a fix-and-resubmit moment.
 */

import type { NIBRSSubmission, NIBRSStatus } from '@/lib/types';
import { isoSeconds, daysAgo } from '@/lib/time';
import { rng, randInt, pick } from '@/lib/seed';

const r = rng('nibris-submissions-v1');

// 8 monthly periods — 04-2025 through 11-2025 + one in-progress for 2026
const PERIODS = [
  { period: '04-2025', daysBack: 365, status: 'accepted' as NIBRSStatus, error: 0 },
  { period: '05-2025', daysBack: 335, status: 'accepted' as NIBRSStatus, error: 0 },
  { period: '06-2025', daysBack: 305, status: 'rejected' as NIBRSStatus, error: 4, note: 'Validation rule R-118 failed on 4 records: incompatible offense+location combination. Resubmission required.' },
  { period: '06-2025-R', daysBack: 290, status: 'resubmitted' as NIBRSStatus, error: 0 },
  { period: '07-2025', daysBack: 275, status: 'accepted' as NIBRSStatus, error: 0 },
  { period: '08-2025', daysBack: 245, status: 'accepted' as NIBRSStatus, error: 0 },
  { period: '09-2025', daysBack: 215, status: 'accepted' as NIBRSStatus, error: 0 },
  { period: '10-2025', daysBack: 185, status: 'accepted' as NIBRSStatus, error: 0 },
  { period: '11-2025', daysBack: 155, status: 'accepted' as NIBRSStatus, error: 0 },
  { period: '12-2025', daysBack: 125, status: 'accepted' as NIBRSStatus, error: 0 },
  { period: '01-2026', daysBack: 95, status: 'accepted' as NIBRSStatus, error: 0 },
  { period: '02-2026', daysBack: 60, status: 'accepted' as NIBRSStatus, error: 0 },
  { period: '03-2026', daysBack: 30, status: 'submitted' as NIBRSStatus, error: 0 },
  { period: '04-2026', daysBack: 1, status: 'in-progress' as NIBRSStatus, error: 0 },
];

export const NIBRIS_SUBMISSIONS: NIBRSSubmission[] = PERIODS.map((p) => {
  const recordCount = randInt(r, 18, 64);
  return {
    id: `NIBRS-${p.period}`,
    reportingPeriod: p.period,
    status: p.status,
    submittedAt:
      p.status === 'in-progress'
        ? undefined
        : isoSeconds(daysAgo(p.daysBack)),
    acceptedAt:
      p.status === 'accepted' || p.status === 'resubmitted'
        ? isoSeconds(daysAgo(Math.max(0, p.daysBack - randInt(r, 2, 7))))
        : undefined,
    rejectedAt:
      p.status === 'rejected'
        ? isoSeconds(daysAgo(Math.max(0, p.daysBack - randInt(r, 2, 5))))
        : undefined,
    recordCount,
    errorCount: p.error,
    rejectionNote: p.status === 'rejected' ? (p as { note?: string }).note : undefined,
    classification: 'cji',
  };
});

void pick;
