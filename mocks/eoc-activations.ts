/**
 * EOC activations — the active Thread B activation + 6 historical.
 *
 * The Thread B activation is partial-level, opened 17 minutes ago, with a
 * full ICS 207 (most seats filled). The situation log shows the auto-
 * activation cascade. The decision log captures the IC's choice to send
 * the redirect campaign after the WW4 generator failure.
 */

import type {
  EOCActivation,
  EOCActivationLevel,
  EOCIncidentKind,
  ICSAssignment,
  ICSPosition,
  SitLogEntry,
  DecisionLogEntry,
} from '@/lib/types';
import { isoSeconds, minutesAgo, daysAgo, hoursAgo } from '@/lib/time';
import { rng, pick, randInt } from '@/lib/seed';
import {
  THREAD_B_EOC_ACTIVATION_ID,
  THREAD_B_WEATHER_ALERT_ID,
  THREAD_B_INITIAL_CAMPAIGN_ID,
  THREAD_B_REDIRECT_CAMPAIGN_ID,
  THREAD_B_SHELTER_BUILDING_IDS,
  THREAD_B_FAILED_GENERATOR_BUILDING_ID,
} from './threads';

const r = rng('eoc-activations-180d');

// =========================================================================
// Thread B — the live activation
// =========================================================================

const ics: ICSAssignment[] = [
  { position: 'incident-commander', personId: 'PER-001008', assignedAt: isoSeconds(minutesAgo(16)) },
  { position: 'public-information-officer', personId: 'PER-020003', assignedAt: isoSeconds(minutesAgo(15)) },
  { position: 'safety-officer', personId: 'PER-020012', assignedAt: isoSeconds(minutesAgo(15)) },
  { position: 'liaison-officer', personId: 'PER-020021', assignedAt: isoSeconds(minutesAgo(14)) },
  { position: 'operations-section-chief', personId: 'PER-020030', assignedAt: isoSeconds(minutesAgo(14)) },
  { position: 'planning-section-chief', personId: 'PER-020041', assignedAt: isoSeconds(minutesAgo(12)) },
  { position: 'logistics-section-chief', personId: 'PER-020055', assignedAt: isoSeconds(minutesAgo(11)) },
  { position: 'finance-section-chief', assignedAt: isoSeconds(minutesAgo(10)), isUnfilled: true },
];

const threadBActivation: EOCActivation = {
  id: THREAD_B_EOC_ACTIVATION_ID,
  name: 'Tornado Warning — central campus',
  level: 'partial',
  status: 'active',
  kind: 'tornado',
  triggeredByAlertId: THREAD_B_WEATHER_ALERT_ID,
  openedAt: isoSeconds(minutesAgo(17)),
  buildingIds: THREAD_B_SHELTER_BUILDING_IDS as unknown as string[],
  campaignIds: [THREAD_B_INITIAL_CAMPAIGN_ID, THREAD_B_REDIRECT_CAMPAIGN_ID],
  lockdownIds: ['LOCK-2026-001', 'LOCK-2026-002', 'LOCK-2026-003', 'LOCK-2026-004'],
  runbookExecutionIds: ['RBX-2026-0042'],
  ics,
  narrative:
    'NWS Tornado Warning intersects central campus polygon. Auto-activation engaged at ' +
    'partial level. Shelter-in-place campaign sent at T+30s; ACS lockdowns initiated on 4 ' +
    'shelter-designated buildings; West shuttle loops suspended. BMS pre-check surfaced a ' +
    'generator failure in West Wing 4 — redirect campaign issued to building occupants.',
  classification: 'internal',
  threadTag: 'B',
};

// =========================================================================
// Thread B — situation log
// =========================================================================

const threadBSitLog: SitLogEntry[] = [
  {
    id: 'SLG-B-01',
    activationId: THREAD_B_EOC_ACTIVATION_ID,
    at: isoSeconds(minutesAgo(18)),
    kind: 'alert-received',
    text: 'NWS Tornado Warning received. Campus polygon intersection detected. Auto-activation engaged.',
    references: [THREAD_B_WEATHER_ALERT_ID],
    classification: 'internal',
  },
  {
    id: 'SLG-B-02',
    activationId: THREAD_B_EOC_ACTIVATION_ID,
    at: isoSeconds(minutesAgo(17)),
    kind: 'activation-opened',
    text: 'EOC activation EOC-2026-013 opened at partial level. IC: PER-001008 (M. Chen).',
    references: [],
    classification: 'internal',
  },
  {
    id: 'SLG-B-03',
    activationId: THREAD_B_EOC_ACTIVATION_ID,
    at: isoSeconds(minutesAgo(17)),
    kind: 'campaign-sent',
    text: 'MNP-2026-088 dispatched campus-wide: SMS + push + email + voice + desktop + signs.',
    references: [THREAD_B_INITIAL_CAMPAIGN_ID],
    classification: 'public',
  },
  {
    id: 'SLG-B-04',
    activationId: THREAD_B_EOC_ACTIVATION_ID,
    at: isoSeconds(minutesAgo(16)),
    kind: 'lockdown-initiated',
    text: 'ACS lockdowns initiated on WW3 / WW4 / Main Library / Student Union.',
    references: ['LOCK-2026-001', 'LOCK-2026-002', 'LOCK-2026-003', 'LOCK-2026-004'],
    classification: 'internal',
  },
  {
    id: 'SLG-B-05',
    activationId: THREAD_B_EOC_ACTIVATION_ID,
    at: isoSeconds(minutesAgo(15)),
    kind: 'runbook-started',
    text: 'Runbook RBX-2026-0042 (Tornado — central campus shelter-in-place) started.',
    references: ['RBX-2026-0042'],
    classification: 'internal',
  },
  {
    id: 'SLG-B-06',
    activationId: THREAD_B_EOC_ACTIVATION_ID,
    at: isoSeconds(minutesAgo(13)),
    kind: 'unit-assigned',
    text: 'West shuttle loops (RTE-WEST-LOOP + RTE-NORTH-EXPRESS) suspended; vehicles staged at BLD-MAIN-LIBRARY.',
    references: ['RTE-WEST-LOOP', 'RTE-NORTH-EXPRESS'],
    classification: 'internal',
  },
  {
    id: 'SLG-B-07',
    activationId: THREAD_B_EOC_ACTIVATION_ID,
    at: isoSeconds(minutesAgo(5)),
    kind: 'iot-anomaly',
    text: 'BMS alarm: WW4-GEN-01 generator failure — transferred to UPS battery. ETA on UPS battery: 23 min.',
    references: ['BMS-2026-WW4-GEN-FAIL'],
    classification: 'internal',
  },
  {
    id: 'SLG-B-08',
    activationId: THREAD_B_EOC_ACTIVATION_ID,
    at: isoSeconds(minutesAgo(4)),
    kind: 'decision',
    text: 'Decision: redirect WW4 occupants to WW3 + Main Library via interior corridors only.',
    references: ['DEC-B-01'],
    classification: 'internal',
  },
  {
    id: 'SLG-B-09',
    activationId: THREAD_B_EOC_ACTIVATION_ID,
    at: isoSeconds(minutesAgo(3)),
    kind: 'campaign-sent',
    text: 'MNP-2026-088-B dispatched to WW4 occupants — 412 SMS · 412 push · 87 desktop alert.',
    references: [THREAD_B_REDIRECT_CAMPAIGN_ID],
    classification: 'public',
  },
  {
    id: 'SLG-B-10',
    activationId: THREAD_B_EOC_ACTIVATION_ID,
    at: isoSeconds(minutesAgo(2)),
    kind: 'general-observation',
    text: 'Facilities on-site at WW4 mechanical room. Initial assessment: fuel-pump pressure fault on GEN-WW4-01.',
    classification: 'internal',
  },
  {
    id: 'SLG-B-11',
    activationId: THREAD_B_EOC_ACTIVATION_ID,
    at: isoSeconds(minutesAgo(1)),
    kind: 'runbook-step-completed',
    text: 'Runbook step STP-04 completed; STP-05 (BMS / generator pre-check) in progress.',
    references: ['RBX-2026-0042'],
    classification: 'internal',
  },
];

// =========================================================================
// Thread B — decision log
// =========================================================================

const threadBDecisionLog: DecisionLogEntry[] = [
  {
    id: 'DEC-B-01',
    activationId: THREAD_B_EOC_ACTIVATION_ID,
    at: isoSeconds(minutesAgo(4)),
    decision: 'Redirect West Wing 4 occupants to West Wing 3 + Main Library',
    rationale:
      'WW4 generator failure transferred building to UPS battery with limited runtime; ' +
      'sustained sheltering not possible. WW3 and Main Library are adjacent shelter-designated ' +
      'buildings with normal power. Interior-corridor route avoids exterior exposure during ' +
      'active warning.',
    authorRole: 'eoc-director',
    authorPersonId: 'PER-001008',
    alternativesConsidered: [
      'Hold WW4 occupants in place and dispatch emergency power restoration (rejected — 23-min UPS runtime is insufficient for 42-min warning expiry).',
      'Move occupants to Student Union (rejected — longer route exposed to glass-heavy interior corridors).',
    ],
    classification: 'internal',
  },
];

// =========================================================================
// Historical activations — 6 closed activations across 180 days
// =========================================================================

const KIND_POOL: EOCIncidentKind[] = [
  'severe-weather', 'fire', 'utility-outage', 'severe-weather', 'medical-mass-casualty', 'drill',
];
const LEVEL_POOL: EOCActivationLevel[] = ['monitoring', 'partial', 'partial', 'monitoring', 'full', 'partial'];

const historical: EOCActivation[] = [];
for (let i = 0; i < 6; i++) {
  const kind = KIND_POOL[i];
  const level = LEVEL_POOL[i];
  const openedAgo = randInt(r, 18, 165);
  const dur = randInt(r, 1, 8);
  historical.push({
    id: `EOC-2026-${(1 + i).toString().padStart(3, '0')}`,
    name: pick(r, [
      'Severe Thunderstorm — central campus',
      'Lab fire — Science 1',
      'Power outage — South Quad',
      'Heat advisory — outdoor events',
      'Mass-casualty drill — Arena',
      'Drill — campus exercise',
    ]),
    level,
    status: 'closed',
    kind,
    openedAt: isoSeconds(daysAgo(openedAgo)),
    closedAt: isoSeconds(daysAgo(openedAgo - dur / 24)),
    buildingIds: [],
    campaignIds: [],
    lockdownIds: [],
    runbookExecutionIds: [],
    ics: [],
    narrative: 'Historical activation; closed after operational tempo returned to normal.',
    classification: 'internal',
  });
}

void hoursAgo;
void THREAD_B_FAILED_GENERATOR_BUILDING_ID;

export const EOC_ACTIVATIONS: EOCActivation[] = [threadBActivation, ...historical].sort(
  (a, b) => new Date(b.openedAt).getTime() - new Date(a.openedAt).getTime(),
);

export const SIT_LOG_ENTRIES: SitLogEntry[] = threadBSitLog;
export const DECISION_LOG_ENTRIES: DecisionLogEntry[] = threadBDecisionLog;

export const THREAD_B_ACTIVATION = threadBActivation;
export const THREAD_B_SIT_LOG = threadBSitLog;
export const THREAD_B_DECISION_LOG = threadBDecisionLog;

// Re-export ICS positions roster for completeness
export const ICS_POSITIONS: ICSPosition[] = [
  'incident-commander', 'public-information-officer', 'safety-officer', 'liaison-officer',
  'operations-section-chief', 'planning-section-chief', 'logistics-section-chief', 'finance-section-chief',
];
