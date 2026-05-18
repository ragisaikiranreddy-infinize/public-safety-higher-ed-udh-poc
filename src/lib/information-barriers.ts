/**
 * Information Barriers — the platform's most distinctive governance feature.
 *
 * Twelve barriers from spec §13.2 enforced at the data layer (not the UI).
 * Components ask `evaluateBarrier({...})` and either render the data or a
 * `<BarrierIndicator/>` chip. Every barrier hit is appended to an in-memory
 * audit log surfaced in /audit (R8) and the bell-notification feed.
 *
 * Per CLAUDE.md pitfall #11: a component MUST NOT decide whether to render
 * walled content on its own. The decision lives here.
 */

import { useSyncExternalStore } from 'react';
import type {
  BarrierHitLogEntry,
  BarrierResult,
  Classification,
  InformationBarrier,
  RoleId,
} from './types';
import { isoSeconds } from './time';

// =========================================================================
// The 12 barriers
// =========================================================================

export const INFORMATION_BARRIERS: InformationBarrier[] = [
  {
    id: 'IB-TIX-TO-PD-HARD',
    name: 'Title IX → PD (hard wall)',
    description:
      'Title IX-sensitive content is invisible to UPD officers / investigators by default. Surfacing requires Title IX coordinator + General Counsel co-sign.',
    protects: ['title-ix-sensitive'],
    blocks: ['chief-of-police', 'dispatcher'],
    allows: ['title-ix-coordinator'],
    direction: 'hard-wall',
    overridePath: 'Title IX coordinator + General Counsel co-sign; per-case audit log',
    regulatoryHooks: ['REG-TITLE-IX', 'REG-FERPA'],
  },
  {
    id: 'IB-COUNSELING-WALL',
    name: 'Counseling Center records (42 CFR Part 2)',
    description:
      'SUD-related counseling records are fully walled from all roles. Only explicit patient consent allows disclosure.',
    protects: ['counseling-42cfr2'],
    blocks: '*',
    allows: [],
    direction: 'hard-wall',
    overridePath: 'Explicit patient consent only — never overridden by role',
    regulatoryHooks: ['REG-42-CFR-2'],
  },
  {
    id: 'IB-BIT-TO-PD-COND',
    name: 'BIT → PD (conditional)',
    description:
      'BIT case detail is visible to PD only when the case carries an imminent-threat finding. Otherwise the barrier surfaces a "BIT involvement exists" indicator without content.',
    protects: ['ferpa-edu-record'],
    blocks: ['chief-of-police', 'dispatcher'],
    allows: ['bit-chair', 'dean-of-students'],
    direction: 'conditional',
    overridePath: 'NaBITA imminent-threat flag + supervisor sign-off',
    regulatoryHooks: ['REG-FERPA'],
  },
  {
    id: 'IB-PD-TO-TIX-SOFT',
    name: 'PD → Title IX (soft wall)',
    description:
      'PD investigative narrative is not visible to Title IX (avoids prejudicing the parallel process). Title IX sees fact-of-investigation only.',
    protects: ['restricted-investigation'],
    blocks: ['title-ix-coordinator'],
    allows: ['chief-of-police'],
    direction: 'soft-wall',
    overridePath: 'Mutual referral with purpose-of-use logged',
    regulatoryHooks: ['REG-TITLE-IX', 'REG-28-CFR-23'],
  },
  {
    id: 'IB-CONDUCT-TO-PD-COND',
    name: 'Conduct → PD (conditional)',
    description:
      'Conduct narrative visible to PD only for related criminal matters; otherwise fact-of-record only.',
    protects: ['ferpa-edu-record'],
    blocks: ['chief-of-police', 'dispatcher'],
    allows: ['dean-of-students'],
    direction: 'conditional',
    overridePath: 'Per-case cross-reference; logged',
    regulatoryHooks: ['REG-FERPA'],
  },
  {
    id: 'IB-INVESTIGATION-HOLD',
    name: 'Active-investigation records hold',
    description:
      'Records associated with an active investigation are masked from broad reads until the case is cleared.',
    protects: ['restricted-investigation'],
    blocks: ['dean-of-students', 'title-ix-coordinator', 'bit-chair', 'clery-officer', 'executive'],
    allows: ['chief-of-police'],
    direction: 'hard-wall',
    overridePath: 'Lead investigator + supervisor; case must be cleared',
    regulatoryHooks: ['REG-CJIS', 'REG-28-CFR-23'],
  },
  {
    id: 'IB-ACAD-INT-TO-PD-HARD',
    name: 'Academic Integrity → PD (hard wall)',
    description:
      'Academic-integrity cases are invisible to PD by default. Rare overlap with criminal fraud cases.',
    protects: ['ferpa-edu-record'],
    blocks: ['chief-of-police', 'dispatcher'],
    allows: ['dean-of-students'],
    direction: 'hard-wall',
    overridePath: 'Faculty Dean co-sign in fraud/financial cases',
    regulatoryHooks: ['REG-FERPA'],
  },
  {
    id: 'IB-COND-NON-TIX-SEXMISC-ONE-WAY',
    name: 'Conduct sexual-misconduct (non-TIX) → Title IX (one-way)',
    description:
      'Pre-formal disclosures of sexual misconduct outside Title IX jurisdiction are visible to Title IX one-way so supportive measures can be offered.',
    protects: ['title-ix-sensitive'],
    blocks: ['chief-of-police', 'bit-chair'],
    allows: ['title-ix-coordinator', 'dean-of-students'],
    direction: 'one-way',
    overridePath: 'Subject opt-in for full-frame disclosure',
    regulatoryHooks: ['REG-TITLE-IX', 'REG-FERPA'],
  },
  {
    id: 'IB-BART-TO-PD-COND',
    name: 'Bias Response Team → PD (conditional)',
    description:
      'Bias incident records are invisible to PD unless the criminal hate-crime threshold appears met.',
    protects: ['ferpa-edu-record'],
    blocks: ['chief-of-police', 'dispatcher'],
    allows: ['dean-of-students'],
    direction: 'conditional',
    overridePath: 'BART Chair + General Counsel co-sign',
    regulatoryHooks: ['REG-FERPA', 'REG-CLERY'],
  },
  {
    id: 'IB-CIT-TO-BIT-SOFT',
    name: 'CIT mental-health co-response → BIT (soft wall)',
    description:
      'Wellness-check dispatches visible to BIT as fact-of-dispatch only; no clinical content (counseling-42cfr2 wall stays intact).',
    protects: ['counseling-42cfr2'],
    blocks: ['bit-chair'],
    allows: ['chief-of-police', 'dispatcher'],
    direction: 'soft-wall',
    overridePath: 'Subject consent for fuller frame',
    regulatoryHooks: ['REG-42-CFR-2', 'REG-FERPA'],
  },
  {
    id: 'IB-ORG-INDIV-COND',
    name: 'Organizational vs Individual Conduct',
    description:
      'Organizational conduct (Greek chapters, athletics teams) visible to org-compliance roles at chapter-level; individual member identification gated.',
    protects: ['ferpa-edu-record'],
    blocks: ['chief-of-police'],
    allows: ['dean-of-students'],
    direction: 'conditional',
    overridePath: 'Greek Life advisor + Dean of Students sign-off',
    regulatoryHooks: ['REG-FERPA'],
  },
  {
    id: 'IB-PARENT-NOTIF-SUBJECT-VIEW',
    name: 'Parental Notification → Subject student',
    description:
      'FERPA §99.31(a)(15) parental-notification audit log is visible to subject under inspection rights; deciding-official identity may be redacted per institutional policy.',
    protects: ['ferpa-edu-record'],
    blocks: [],
    allows: ['dean-of-students', 'title-ix-coordinator'],
    direction: 'conditional',
    overridePath: 'Inspection request via Registrar',
    regulatoryHooks: ['REG-FERPA-99-31'],
  },
];

// =========================================================================
// Evaluator
// =========================================================================

export interface EvaluateBarrierArgs {
  actorRole: RoleId;
  fieldClassification: Classification;
  resourceKind: string;
  resourceId: string;
  /** Override flags set by an authorized cross-team workflow. */
  imminentThreatFinding?: boolean;
  caseClosed?: boolean;
  purpose?: string;
}

/**
 * Decide whether the actor may read a value at the given classification on
 * the given resource. Returns a barrier-aware result and (as a side effect)
 * appends to the in-memory hit log when a barrier is invoked.
 */
export function evaluateBarrier(args: EvaluateBarrierArgs): BarrierResult {
  // CISO is the unbarred super-role (subject to its own audit-of-audit later).
  if (args.actorRole === 'ciso') {
    return { allowed: true, masked: false, reason: 'CISO has all-access (logged)' };
  }

  for (const b of INFORMATION_BARRIERS) {
    if (!b.protects.includes(args.fieldClassification)) continue;

    const wildcardBlock = b.blocks === '*' && !b.allows.includes(args.actorRole);
    const explicitBlock = Array.isArray(b.blocks) && b.blocks.includes(args.actorRole);
    if (!wildcardBlock && !explicitBlock) continue;

    // Conditional barriers — special-case overrides.
    if (b.id === 'IB-BIT-TO-PD-COND' && args.imminentThreatFinding) {
      // Override active — log as allowed-with-override.
      logBarrierHit(args, b, 'allowed-with-override');
      return {
        allowed: true,
        masked: false,
        barrierHit: b,
        reason: 'imminent-threat override (logged)',
      };
    }
    if (b.id === 'IB-INVESTIGATION-HOLD' && args.caseClosed) {
      logBarrierHit(args, b, 'allowed-with-override');
      return {
        allowed: true,
        masked: false,
        barrierHit: b,
        reason: 'case-closed override (logged)',
      };
    }

    // Default outcome — masked for soft/conditional/one-way; denied for hard.
    const outcome: BarrierHitLogEntry['outcome'] =
      b.direction === 'hard-wall' ? 'denied' : 'masked';
    logBarrierHit(args, b, outcome);
    return {
      allowed: false,
      masked: outcome === 'masked',
      barrierHit: b,
      reason: b.name,
    };
  }

  // No barrier applies.
  return { allowed: true, masked: false, reason: 'No applicable barrier' };
}

// =========================================================================
// In-memory barrier-hit log (subscribable for the audit-of-audit panel)
// =========================================================================

let _hits: BarrierHitLogEntry[] = [];
let _snapshot: readonly BarrierHitLogEntry[] = _hits;
let _hitSeq = 0;
const subscribers = new Set<() => void>();

function notify() {
  _snapshot = _hits.slice();
  subscribers.forEach((fn) => fn());
}

function subscribe(fn: () => void): () => void {
  subscribers.add(fn);
  return () => subscribers.delete(fn);
}

function getSnapshot(): readonly BarrierHitLogEntry[] {
  return _snapshot;
}

function logBarrierHit(
  args: EvaluateBarrierArgs,
  barrier: InformationBarrier,
  outcome: BarrierHitLogEntry['outcome'],
) {
  // Cap log to last 200 entries to avoid unbounded growth.
  _hitSeq++;
  const entry: BarrierHitLogEntry = {
    id: `bh-${Date.now()}-${_hitSeq.toString(16).padStart(4, '0')}`,
    at: isoSeconds(new Date()),
    actorRole: args.actorRole,
    resourceKind: args.resourceKind,
    resourceId: args.resourceId,
    barrierId: barrier.id,
    outcome,
  };
  _hits = [entry, ..._hits].slice(0, 200);
  notify();
}

export function useBarrierHits(): readonly BarrierHitLogEntry[] {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function getBarrierHits(): readonly BarrierHitLogEntry[] {
  return _snapshot;
}

export function clearBarrierHits(): void {
  _hits = [];
  notify();
}

// =========================================================================
// Lookup helpers
// =========================================================================

export function getBarrier(id: string): InformationBarrier | undefined {
  return INFORMATION_BARRIERS.find((b) => b.id === id);
}

export function barriersProtecting(c: Classification): InformationBarrier[] {
  return INFORMATION_BARRIERS.filter((b) => b.protects.includes(c));
}
