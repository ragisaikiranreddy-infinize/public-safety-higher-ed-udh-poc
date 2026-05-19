/**
 * CIT (Crisis Intervention Team) dispatch-flag annotations.
 *
 * Per spec §13.2 (IB-CIT-TO-BIT-SOFT), CIT dispatches involve a 42 CFR Part 2
 * wall — BIT sees fact-of-dispatch only, no clinical content. This fixture
 * seeds ~20 CIT-flagged dispatches with outcome tracking.
 */

import type { CITDispatchFlag, CITFlagKind } from '@/lib/types';
import { isoSeconds, daysAgo, hoursAgo } from '@/lib/time';
import { rng, randInt, pick } from '@/lib/seed';

const r = rng('cit-flags-v1');

const KINDS: CITFlagKind[] = ['wellness-check', 'mental-health-crisis', 'suicidal-ideation', 'overdose', 'self-harm'];
const OUTCOMES = ['transport-to-treatment', 'voluntary-services', 'no-action', 'arrest', 'pending'] as const;

// Pull from existing welfare-check + similar incident IDs procedurally
const INCIDENT_PREFIXES = ['INC-2026-', 'INC-2025-'];

export const CIT_DISPATCH_FLAGS: CITDispatchFlag[] = Array.from({ length: 20 }, (_, i) => {
  const kind = pick(r, KINDS);
  const daysBack = randInt(r, 0, 90);
  const incidentPrefix = pick(r, INCIDENT_PREFIXES);
  return {
    id: `CIT-FLG-2026-${(i + 1).toString().padStart(4, '0')}`,
    incidentId: `${incidentPrefix}${randInt(r, 4000, 9000)}`,
    flaggedAt: daysBack === 0 ? isoSeconds(hoursAgo(randInt(r, 1, 22))) : isoSeconds(daysAgo(daysBack)),
    kind,
    citOfficerId: r() < 0.7 ? `OFC-${randInt(r, 110, 168).toString().padStart(4, '0')}` : undefined,
    outcome: kind === 'overdose' ? 'transport-to-treatment' : pick(r, OUTCOMES),
    cfr42HitOccurred: r() < 0.4,
    classification: 'counseling-42cfr2',
  };
});
