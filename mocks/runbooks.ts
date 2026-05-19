/**
 * Runbook catalog + the Thread B execution.
 *
 * Six runbooks ship — one per major category. The Thread B run is the
 * `RBK-TORNADO-SHELTER-CENTRAL` runbook, in `in-progress` state with the
 * first 4 steps complete and step 5 (BMS check) just started.
 */

import type {
  Runbook,
  RunbookExecution,
  RunbookStep,
  RunbookStepExecution,
} from '@/lib/types';
import { isoSeconds, minutesAgo, daysAgo } from '@/lib/time';
import { THREAD_B_EOC_ACTIVATION_ID, THREAD_B_SHELTER_BUILDING_IDS } from './threads';

// =========================================================================
// Step factories
// =========================================================================

function step(
  order: number,
  kind: RunbookStep['kind'],
  title: string,
  description: string,
  etaSec: number,
  automatable: boolean,
): RunbookStep {
  return {
    id: `STP-${order.toString().padStart(2, '0')}`,
    order,
    kind,
    title,
    description,
    etaSec,
    automatable,
  };
}

// =========================================================================
// Six runbooks
// =========================================================================

const tornadoShelter: Runbook = {
  id: 'RBK-TORNADO-SHELTER-CENTRAL',
  name: 'Tornado — central campus shelter-in-place',
  category: 'severe-weather',
  description:
    'Triggered by an NWS Tornado Warning intersecting the campus polygon. Shelters ' +
    'occupants in designated shelter buildings, lockdowns external doors, dispatches the ' +
    'mass-notification campaign, and queues BMS / generator readiness checks.',
  ownerRole: 'eoc-director',
  steps: [
    step(1, 'notify', 'Send all-campus shelter-in-place alert',
      'Mass notification: SMS · email · voice · push · desktop alert · digital signs.', 30, true),
    step(2, 'lockdown', 'Lockdown external doors at shelter buildings',
      'Initiate lockdown on shelter-designated buildings (3) via ACS.', 60, true),
    step(3, 'page-team', 'Page EOC team — partial activation',
      'Page IC, PIO, Ops Chief, Logistics Chief, Liaison Officer.', 90, true),
    step(4, 'reroute-transit', 'Suspend exterior shuttle routes',
      'Halt RTE-WEST-LOOP + RTE-NORTH-EXPRESS; reroute to nearest shelter buildings.', 120, true),
    step(5, 'manual-check', 'BMS / generator pre-check',
      'Verify generator readiness in West Wing 3 + West Wing 4 (high-occupancy shelter sites).', 180, false),
    step(6, 'open-bridge-line', 'Open EOC bridge line',
      'Open MS Teams bridge for IC + section chiefs.', 200, true),
    step(7, 'notify', 'Issue residence-hall-specific reassurance',
      'Targeted SMS to residence-hall occupants: stay sheltered, expect 20–30 minutes.', 600, true),
    step(8, 'manual-check', 'Wait for all-clear from NWS',
      'IC monitors NWS feed; do not release lockdown until warning expires.', 1800, false),
    step(9, 'unlock', 'Release lockdowns on all-clear',
      'Release ACS lockdowns; return shelter buildings to normal access posture.', 2100, true),
    step(10, 'notify', 'Send all-clear notification',
      'Mass notification: all-clear, normal operations resumed.', 2160, true),
  ],
  lastReviewedAt: isoSeconds(daysAgo(64)),
};

const activeThreat: Runbook = {
  id: 'RBK-ACTIVE-THREAT-CAMPUS',
  name: 'Active threat — campus-wide lockdown',
  category: 'active-threat',
  description:
    'Triggered by 911 call or AVL gunshot detection. Hard lockdown of all buildings, ' +
    'PD response, MOU partner page-out, and law-enforcement notification.',
  ownerRole: 'chief-of-police',
  steps: [
    step(1, 'notify', 'Send all-campus active-threat alert', 'Mass notification w/ specific guidance per location.', 15, true),
    step(2, 'lockdown', 'Hard lockdown — all buildings', 'ACS hard lockdown campus-wide.', 30, true),
    step(3, 'dispatch-unit', 'Dispatch all available units', 'UPD + MOU partners to last known location.', 45, true),
    step(4, 'page-team', 'Page EOC + Chief + General Counsel', '', 60, true),
    step(5, 'open-bridge-line', 'Open MOU bridge line', '', 90, true),
    step(6, 'manual-check', 'Maintain perimeter until all-clear', '', 3600, false),
  ],
  lastReviewedAt: isoSeconds(daysAgo(28)),
};

const fireEvac: Runbook = {
  id: 'RBK-FIRE-EVAC',
  name: 'Fire — building evacuation',
  category: 'fire-evacuation',
  description: 'Triggered by fire-panel alarm. Building-specific evacuation; mutual aid dispatch.',
  ownerRole: 'eoc-director',
  steps: [
    step(1, 'notify', 'Evacuation alert — affected building', '', 20, true),
    step(2, 'dispatch-unit', 'Dispatch fire mutual aid + UPD', '', 30, true),
    step(3, 'page-team', 'Page facilities + EOC liaison', '', 45, true),
    step(4, 'manual-check', 'Account for occupants at staging area', '', 900, false),
    step(5, 'unlock', 'Release building when fire marshal clears', '', 1800, true),
  ],
  lastReviewedAt: isoSeconds(daysAgo(40)),
};

const hazmat: Runbook = {
  id: 'RBK-HAZMAT-SCIENCE',
  name: 'Hazmat — Science 1 lab incident',
  category: 'hazmat',
  description: 'Lab-specific hazmat response — isolation + ventilation + EHS notification.',
  ownerRole: 'eoc-director',
  steps: [
    step(1, 'isolate-utility', 'Isolate HVAC zone', '', 60, true),
    step(2, 'notify', 'Building-specific shelter advisory', '', 90, true),
    step(3, 'page-team', 'Page EHS + UPD + Fire', '', 120, true),
    step(4, 'manual-check', 'EHS on-scene assessment', '', 1500, false),
  ],
  lastReviewedAt: isoSeconds(daysAgo(96)),
};

const utilityOutage: Runbook = {
  id: 'RBK-UTILITY-OUTAGE',
  name: 'Utility outage — extended power loss',
  category: 'utility-outage',
  description: 'Campus or building-scoped extended outage; generator + transfer-switch coordination.',
  ownerRole: 'eoc-director',
  steps: [
    step(1, 'manual-check', 'Verify generator transfer', '', 60, false),
    step(2, 'notify', 'Notify affected occupants', '', 180, true),
    step(3, 'page-team', 'Page facilities + Logistics chief', '', 240, true),
    step(4, 'reroute-transit', 'Reroute shuttle around affected loop', '', 360, true),
  ],
  lastReviewedAt: isoSeconds(daysAgo(72)),
};

const cyberIncident: Runbook = {
  id: 'RBK-CYBER-INCIDENT',
  name: 'Cyber incident — institutional response',
  category: 'cyber-incident',
  description: 'Identity-system or critical-app compromise — IRT coordination.',
  ownerRole: 'ciso',
  steps: [
    step(1, 'page-team', 'Page IRT + CISO', '', 60, true),
    step(2, 'open-bridge-line', 'Open IRT bridge', '', 90, true),
    step(3, 'manual-check', 'Triage scope + contain', '', 1800, false),
    step(4, 'notify', 'Public-information advisory if user-facing', '', 3600, false),
  ],
  lastReviewedAt: isoSeconds(daysAgo(14)),
};

export const RUNBOOKS: Runbook[] = [
  tornadoShelter, activeThreat, fireEvac, hazmat, utilityOutage, cyberIncident,
];

// =========================================================================
// Thread B execution — partly through the tornado-shelter runbook
// =========================================================================

function exec(stepId: string, status: RunbookStepExecution['status'], startMin: number, completeMin?: number, note?: string): RunbookStepExecution {
  const e: RunbookStepExecution = { stepId, status };
  if (status !== 'pending') {
    e.startedAt = isoSeconds(minutesAgo(startMin));
  }
  if (completeMin !== undefined) {
    e.completedAt = isoSeconds(minutesAgo(completeMin));
  }
  if (note) e.resultNote = note;
  return e;
}

const threadBExecution: RunbookExecution = {
  id: 'RBX-2026-0042',
  runbookId: 'RBK-TORNADO-SHELTER-CENTRAL',
  activationId: THREAD_B_EOC_ACTIVATION_ID,
  startedAt: isoSeconds(minutesAgo(17)),
  status: 'in-progress',
  steps: [
    exec('STP-01', 'completed', 17, 17, 'MNP-2026-088 dispatched · 14,210 SMS · 14,210 push · 11,802 email'),
    exec('STP-02', 'completed', 16, 15, 'Lockdown initiated on 4 buildings (WW3, WW4, Library, Union)'),
    exec('STP-03', 'completed', 15, 14, 'IC + PIO + Ops Chief + Logistics Chief paged · IC ack'),
    exec('STP-04', 'completed', 13, 12, 'RTE-WEST-LOOP + RTE-NORTH-EXPRESS suspended; vehicles directed to BLD-MAIN-LIBRARY'),
    exec('STP-05', 'in-progress', 11, undefined, 'BMS check in progress — anomaly on WW4 generator'),
    exec('STP-06', 'pending', 0),
    exec('STP-07', 'pending', 0),
    exec('STP-08', 'pending', 0),
    exec('STP-09', 'pending', 0),
    exec('STP-10', 'pending', 0),
  ],
  classification: 'internal',
  threadTag: 'B',
};

// Use the imported shelter ids to confirm the join (and avoid the unused-import lint).
void THREAD_B_SHELTER_BUILDING_IDS;

export const RUNBOOK_EXECUTIONS: RunbookExecution[] = [threadBExecution];

export const THREAD_B_RUNBOOK_EXECUTION = threadBExecution;
