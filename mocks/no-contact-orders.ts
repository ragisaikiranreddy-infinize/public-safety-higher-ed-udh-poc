/**
 * Active no-contact orders + trespass orders.
 *
 * Small fixture — most are issued by Title IX or Student Conduct; a handful
 * by the court (criminal complaints) or by PD directly (trespass).
 */

import type { NoContactOrder, TrespassOrder } from '@/lib/types';
import { isoSeconds, daysAgo, inDays } from '@/lib/time';

export const NO_CONTACT_ORDERS: NoContactOrder[] = [
  {
    id: 'NCO-2026-0001',
    partyAPersonId: 'PER-008471',
    partyBPersonId: 'PER-008470',
    issuedAt: isoSeconds(daysAgo(21)),
    expiresAt: isoSeconds(inDays(160)),
    scope: 'one-way',
    issuingOffice: 'title-ix',
    classification: 'title-ix-sensitive',
  },
  {
    id: 'NCO-2026-0002',
    partyAPersonId: 'PER-020045',
    partyBPersonId: 'PER-020067',
    issuedAt: isoSeconds(daysAgo(48)),
    expiresAt: isoSeconds(inDays(60)),
    scope: 'mutual',
    issuingOffice: 'student-conduct',
    classification: 'ferpa-edu-record',
  },
  {
    id: 'NCO-2026-0003',
    partyAPersonId: 'PER-020112',
    partyBPersonId: 'PER-020088',
    issuedAt: isoSeconds(daysAgo(124)),
    expiresAt: isoSeconds(inDays(240)),
    scope: 'one-way',
    issuingOffice: 'court',
    classification: 'restricted-investigation',
  },
];

export const TRESPASS_ORDERS: TrespassOrder[] = [
  {
    id: 'TRO-2026-0001',
    subjectPersonId: 'PER-020138',
    issuedAt: isoSeconds(daysAgo(94)),
    expiresAt: isoSeconds(inDays(180)),
    scope: 'campus-wide',
    issuedByPersonId: 'OFC-0107',
    rationale: 'Repeated trespass after written warning; subject is not affiliated.',
    classification: 'restricted-investigation',
  },
  {
    id: 'TRO-2026-0002',
    subjectPersonId: 'PER-020139',
    issuedAt: isoSeconds(daysAgo(60)),
    expiresAt: isoSeconds(inDays(120)),
    scope: 'building-specific',
    buildingIds: ['BLD-MAIN-LIBRARY'],
    issuedByPersonId: 'OFC-0021',
    rationale: 'Disruptive behavior in Main Library; barred from that facility only.',
    classification: 'internal',
  },
];
