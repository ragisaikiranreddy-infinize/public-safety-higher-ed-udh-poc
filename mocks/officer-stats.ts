/**
 * Per-officer stats — open assignments, response-time average, training,
 * use-of-force, complaints, commendations, bias-audit score.
 *
 * Procedurally generated from the OFFICERS roster with stable values.
 */

import type { OfficerStats } from '@/lib/types';
import { OFFICERS } from './officers';
import { rng, randInt, randFloat } from '@/lib/seed';

const r = rng('officer-stats-v1');

export const OFFICER_STATS: OfficerStats[] = OFFICERS.map((o) => {
  // Senior officers carry higher case load + more training hours
  const isSenior = o.rank === 'sergeant' || o.rank === 'lieutenant' || o.rank === 'captain' || o.rank === 'chief';
  const ytd = isSenior ? randInt(r, 35, 70) : randInt(r, 60, 130);
  return {
    officerId: o.id,
    openIncidentCount: randInt(r, 0, 4),
    ytdIncidentCount: ytd,
    avgResponseTimeMin: Math.round(randFloat(r, 3.2, 8.4) * 10) / 10,
    useOfForceCount: r() < 0.2 ? randInt(r, 1, 3) : 0,
    commendationCount: randInt(r, 0, 4),
    complaintCount: r() < 0.12 ? randInt(r, 1, 2) : 0,
    trainingHoursYTD: o.isCitTrained ? randInt(r, 32, 80) : randInt(r, 8, 36),
    biasAuditScore: randInt(r, 72, 99),
  };
});
