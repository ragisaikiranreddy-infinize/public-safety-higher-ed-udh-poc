/**
 * Investigative cases — small fixture. Each case is promoted from one or
 * more incidents and carries a primary detective + status.
 */

import type { Case } from '@/lib/types';
import { INCIDENTS } from './incidents';
import { THREAD_C_TRIGGERING_INCIDENT_ID } from './threads';

// Pull a few clery-reportable incidents and promote to cases.
const reportable = INCIDENTS.filter((i) => i.cleryReportable && i.rmsCaseNumber).slice(0, 80);

export const CASES: Case[] = reportable.map((inc, i) => ({
  id: `CASE-${inc.receivedAt.slice(0, 4)}-${(900 + i).toString().padStart(5, '0')}`,
  rmsCaseNumber: inc.rmsCaseNumber!,
  relatedIncidentIds: [inc.id],
  status:
    inc.id === THREAD_C_TRIGGERING_INCIDENT_ID ? 'closed' :
    i % 23 === 0 ? 'open' :
    i % 31 === 0 ? 'inactive' :
    i % 47 === 0 ? 'unfounded' :
    'closed',
  primaryDetectiveOfficerId: inc.primaryOfficerId,
  charges: inc.nibrsOffenseCodes.length > 0 ? ['Charge filed'] : [],
  classification: 'restricted-investigation',
}));

// Add the canonical Thread A subject's case — closed, no-action
CASES.unshift({
  id: 'CASE-2025-00917',
  rmsCaseNumber: '25-09114',
  relatedIncidentIds: ['INC-2025-09114'],
  status: 'closed',
  primaryDetectiveOfficerId: 'OFC-0124',
  charges: [],
  classification: 'restricted-investigation',
});
