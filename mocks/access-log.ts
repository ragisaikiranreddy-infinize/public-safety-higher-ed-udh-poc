/**
 * Platform access log — the audit-of-audit feed.
 *
 * Captures sensitive-resource interactions: views, exports, edits,
 * overrides, role switches, and barrier-induced mask/deny outcomes.
 *
 * In production this is driven by the application server; here we seed
 * a representative 60-entry rolling window.
 */

import type { PlatformAccessLogEntry, AccessLogActionKind, RoleId } from '@/lib/types';
import { isoSeconds, daysAgo, hoursAgo, minutesAgo } from '@/lib/time';
import { rng, randInt, pick } from '@/lib/seed';
import {
  THREAD_A_SUBJECT_PERSON_ID,
  THREAD_A_BIT_CASE_ID,
  THREAD_A_TITLE_IX_INTAKE_ID,
  THREAD_B_EOC_ACTIVATION_ID,
  THREAD_C_FOIA_REQUEST_ID,
  THREAD_C_TRIGGERING_INCIDENT_ID,
} from './threads';

const r = rng('access-log-v1');

const ROLES: RoleId[] = [
  'chief-of-police', 'dispatcher', 'eoc-director', 'dean-of-students',
  'title-ix-coordinator', 'bit-chair', 'clery-officer', 'ciso',
];

const RESOURCE_POOL: { kind: string; idPool: string[]; classifications: ('public' | 'internal' | 'cji' | 'pii' | 'ferpa-edu-record' | 'restricted-investigation' | 'title-ix-sensitive')[] }[] = [
  { kind: 'incident', idPool: [THREAD_C_TRIGGERING_INCIDENT_ID, 'INC-2026-04881', 'INC-2025-04019', 'INC-2025-07217'], classifications: ['cji', 'restricted-investigation'] },
  { kind: 'person', idPool: [THREAD_A_SUBJECT_PERSON_ID, 'PER-008471'], classifications: ['ferpa-edu-record', 'pii'] },
  { kind: 'bit-case', idPool: [THREAD_A_BIT_CASE_ID], classifications: ['ferpa-edu-record'] },
  { kind: 'tix-case', idPool: [THREAD_A_TITLE_IX_INTAKE_ID], classifications: ['title-ix-sensitive'] },
  { kind: 'eoc-activation', idPool: [THREAD_B_EOC_ACTIVATION_ID], classifications: ['internal'] },
  { kind: 'foia-request', idPool: [THREAD_C_FOIA_REQUEST_ID], classifications: ['public'] },
];

const ACTIONS: { kind: AccessLogActionKind; weight: number }[] = [
  { kind: 'view', weight: 10 },
  { kind: 'masked', weight: 4 },
  { kind: 'denied', weight: 2 },
  { kind: 'export', weight: 1 },
  { kind: 'override', weight: 1 },
  { kind: 'role-switch', weight: 2 },
  { kind: 'edit', weight: 1 },
  { kind: 'login', weight: 3 },
];

function pickAction(): AccessLogActionKind {
  const pool: AccessLogActionKind[] = [];
  ACTIONS.forEach(({ kind, weight }) => {
    for (let i = 0; i < weight; i++) pool.push(kind);
  });
  return pick(r, pool);
}

const entries: PlatformAccessLogEntry[] = [];

for (let i = 0; i < 60; i++) {
  const minutesBack = randInt(r, 1, 60 * 24 * 14);
  const resource = pick(r, RESOURCE_POOL);
  const action = pickAction();
  const cls = pick(r, resource.classifications);
  const minBackForLogin = action === 'login' ? randInt(r, 60, 60 * 24 * 14) : minutesBack;
  const t = minBackForLogin < 60
    ? minutesAgo(minBackForLogin)
    : minBackForLogin < 60 * 24
    ? hoursAgo(minBackForLogin / 60)
    : daysAgo(minBackForLogin / (60 * 24));
  entries.push({
    id: `ALG-${i.toString().padStart(5, '0')}`,
    at: isoSeconds(t),
    actorRole: pick(r, ROLES),
    actorPersonId: r() < 0.6 ? `PER-${randInt(r, 1008, 1168).toString().padStart(6, '0')}` : undefined,
    action,
    resourceKind: resource.kind,
    resourceId: pick(r, resource.idPool),
    classification: cls,
    barrierHitId: action === 'masked' || action === 'denied' ? `bh-${randInt(r, 1000, 9999)}` : undefined,
    reason: action === 'override' ? 'imminent-threat override per IB-BIT-TO-PD-COND' : undefined,
  });
}

export const PLATFORM_ACCESS_LOG: PlatformAccessLogEntry[] = entries.sort(
  (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime(),
);
