/**
 * Saved cohorts — NL-built predicate stacks resolved to entity IDs.
 *
 * The Thread A anchor cohort ("Multi-signal subjects at residence halls,
 * 90d") is hand-authored — it surfaces PER-008470 and similar pattern
 * subjects. The remaining cohorts are common operational queries.
 */

import type { Cohort, CohortChip } from '@/lib/types';
import { isoSeconds, daysAgo, hoursAgo } from '@/lib/time';
import { THREAD_A_SUBJECT_PERSON_ID } from './threads';

function chip(id: string, label: string, kind: CohortChip['kind'], extra: Partial<CohortChip> = {}): CohortChip {
  return { id, label, kind, ...extra };
}

const threadACohort: Cohort = {
  id: 'CHT-2026-0042',
  name: 'Multi-signal subjects at residence halls (90d)',
  entityKind: 'person',
  chips: [
    chip('c1', 'Persons with after-hours residence-hall swipes', 'filter', { field: 'access.events.isAfterHours', op: '=', value: true }),
    chip('c2', '≥ 10 swipes in 60 days', 'aggregate', { field: 'access.events.count', op: '>=', value: 10 }),
    chip('c3', 'At a building they do not reside in', 'filter', { field: 'access.events.isUnusualBuilding', op: '=', value: true }),
    chip('c4', '+ camera loitering events on same camera', 'filter', { field: 'vms.events.analyticKind', op: '=', value: 'loitering' }),
    chip('c5', '+ ≥ 3 anonymous tips matched by device-id', 'aggregate', { field: 'tips.matched_device.count', op: '>=', value: 3 }),
  ],
  memberIds: [THREAD_A_SUBJECT_PERSON_ID],
  ownerRole: 'bit-chair',
  createdAt: isoSeconds(daysAgo(2)),
  lastRefreshedAt: isoSeconds(hoursAgo(1)),
  evidenceDatasetIds: [
    'access.events_normalized',
    'vms.events_normalized',
    'tips.anonymous_raw',
    'mart.bit_case_briefing_features',
  ],
  classification: 'ferpa-edu-record',
  threadTag: 'A',
};

const otherCohorts: Cohort[] = [
  {
    id: 'CHT-2026-0001',
    name: 'Buildings with > 3 critical BMS alarms (7d)',
    entityKind: 'building',
    chips: [
      chip('c1', 'BMS alarms in past 7 days', 'window', { field: 'bms.at', op: 'within', value: '7d' }),
      chip('c2', 'severity = critical', 'filter', { field: 'bms.severity', op: '=', value: 'critical' }),
      chip('c3', 'count > 3 per building', 'threshold', { field: 'count_by_building', op: '>', value: 3 }),
    ],
    memberIds: ['BLD-WEST-WING-4'],
    ownerRole: 'eoc-director',
    createdAt: isoSeconds(daysAgo(8)),
    lastRefreshedAt: isoSeconds(hoursAgo(3)),
    evidenceDatasetIds: ['facilities.alarms_normalized'],
    classification: 'internal',
  },
  {
    id: 'CHT-2026-0007',
    name: 'Officers — high incident load + low training hours',
    entityKind: 'officer',
    chips: [
      chip('c1', 'YTD primary-on incidents > 80', 'aggregate', { field: 'officer.ytdIncidents', op: '>', value: 80 }),
      chip('c2', 'Training hours YTD < 24', 'filter', { field: 'officer.trainingHoursYTD', op: '<', value: 24 }),
    ],
    memberIds: ['OFC-0124', 'OFC-0130', 'OFC-0145'],
    ownerRole: 'chief-of-police',
    createdAt: isoSeconds(daysAgo(14)),
    lastRefreshedAt: isoSeconds(hoursAgo(8)),
    evidenceDatasetIds: ['mart.officer_workload_daily'],
    classification: 'pii',
  },
  {
    id: 'CHT-2026-0013',
    name: 'Conduct cases pending sanction > 14 days',
    entityKind: 'incident',
    chips: [
      chip('c1', 'subtype IN (substance, residential)', 'filter', { field: 'conduct.subtype', op: 'in', value: ['substance', 'residential'] }),
      chip('c2', 'status = sanction-pending', 'filter', { field: 'conduct.status', op: '=', value: 'sanction-pending' }),
      chip('c3', 'openedAt > 14d ago', 'window', { field: 'conduct.openedAt', op: 'within', value: '> 14d' }),
    ],
    memberIds: ['COND-2026-00102', 'COND-2026-00107', 'COND-2026-00203'],
    ownerRole: 'dean-of-students',
    createdAt: isoSeconds(daysAgo(20)),
    lastRefreshedAt: isoSeconds(hoursAgo(12)),
    evidenceDatasetIds: ['bit.cases_normalized'],
    classification: 'ferpa-edu-record',
  },
];

export const COHORTS: Cohort[] = [threadACohort, ...otherCohorts];

export const THREAD_A_COHORT = threadACohort;
