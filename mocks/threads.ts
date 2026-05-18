/**
 * Cross-narrative thread anchor IDs.
 *
 * Three demo threads weave through the POC. Every fixture, route, AI canned
 * answer, and insight that participates in a thread imports its anchor ID
 * from THIS FILE — never hardcoded string literals. Per CLAUDE.md sacrosanct
 * swap-point #4, this is the single source of truth for the thread.
 *
 * Thread A — "The Pattern That Was Already There" (BIT case briefing)
 *   Subject PER-008470 — 6 months of multi-source signal that no single
 *   human ever saw together until the UDH unified the view.
 *
 * Thread B — "The Storm" (EOC tornado activation)
 *   NWS Tornado Warning → auto-EOC → mass notification → ACS lockdown →
 *   BMS generator-failure anomaly surfaces in 90 seconds.
 *
 * Thread C — "The Clery Audit" (ASR workbench)
 *   On-campus-residential VAWA-eligible offense → Clery polygon
 *   classification → Timely Warning ledger → source-to-line lineage.
 *
 * Cross-thread weave (intentional intersections — see spec §14 close):
 *   - Thread A subject's card-swipe pattern at BLD-CARTER-HALL shares the
 *     Building Detail screen with Thread B's occupancy estimate
 *   - Thread C's residence-hall ASR cell links to incidents from the
 *     same residence hall the Thread A subject lives in
 *   - All three threads land entries in /persons/* and /governance
 */

// =========================================================================
// Thread A — "The Pattern That Was Already There" (BIT / behavioral threat)
// =========================================================================

/** The Master Person Record at the center of Thread A. Junior student. */
export const THREAD_A_SUBJECT_PERSON_ID = 'PER-008470';

/** Subject's residence (not the building of concern). */
export const THREAD_A_SUBJECT_RESIDENCE_BUILDING_ID = 'BLD-ADAMS-HALL';

/** The building where the pattern of concern emerged (subject doesn't live here). */
export const THREAD_A_BUILDING_OF_CONCERN_ID = 'BLD-CARTER-HALL';

/** Subject's prior closed conduct case — sophomore-year alcohol-policy violation. */
export const THREAD_A_PRIOR_ALCOHOL_CONDUCT_CASE_ID = 'COND-2024-00211';

/** Subject's second conduct case — guest-policy violation in BLD-CARTER-HALL six months ago. */
export const THREAD_A_GUEST_POLICY_CONDUCT_CASE_ID = 'COND-2025-01882';

/** Title IX informal intake — WALLED. Visible only to Title IX role. */
export const THREAD_A_TITLE_IX_INTAKE_ID = 'TIX-2026-0014';

/** Active BIT case for the subject. */
export const THREAD_A_BIT_CASE_ID = 'BIT-2026-0067';

/** Camera surfacing the loitering pattern (11 events, 22:00–02:00 window). */
export const THREAD_A_LOITERING_CAMERA_ID = 'CAM-CARTER-N3';

// =========================================================================
// Thread B — "The Storm" (EOC tornado activation)
// =========================================================================

/** NWS tornado warning that triggered the EOC. */
export const THREAD_B_WEATHER_ALERT_ID = 'NWS-TOR-2026-IA-001';

/** EOC activation record opened by the rules engine. */
export const THREAD_B_EOC_ACTIVATION_ID = 'EOC-2026-013';

/** Mass-notification campaign issued at activation. */
export const THREAD_B_INITIAL_CAMPAIGN_ID = 'MNP-2026-088';

/** Follow-up campaign re-directing students from West Wing 4. */
export const THREAD_B_REDIRECT_CAMPAIGN_ID = 'MNP-2026-088-B';

/** Buildings put into shelter-lockdown state. */
export const THREAD_B_SHELTER_BUILDING_IDS = [
  'BLD-WEST-WING-3',
  'BLD-WEST-WING-4',
  'BLD-MAIN-LIBRARY',
  'BLD-STUDENT-UNION',
];

/** The building whose generator failed — the operational-intelligence demo moment. */
export const THREAD_B_FAILED_GENERATOR_BUILDING_ID = 'BLD-WEST-WING-4';

/** Shuttle routes rerouted by EOC instruction. */
export const THREAD_B_REROUTED_SHUTTLE_ROUTE_IDS = ['RTE-WEST-LOOP', 'RTE-NORTH-EXPRESS'];

// =========================================================================
// Thread C — "The Clery Audit" (Annual Security Report workbench)
// =========================================================================

/** The triggering incident — sexual assault, on-campus-residential, 5 months ago. */
export const THREAD_C_TRIGGERING_INCIDENT_ID = 'INC-2025-08812';

/** Reporting year for the ASR drill-through. */
export const THREAD_C_ASR_YEAR = 2025;

/** Clery geography polygon set used for classification. */
export const THREAD_C_CLERY_POLYGON_SET_ID = 'CGP-MAIN-CAMPUS-2025';

/** Timely Warning issued 38 minutes after incident receipt. */
export const THREAD_C_TIMELY_WARNING_ID = 'TWR-2025-0029';

/** ASR Table-3 cell being drilled — Sex Offenses · On-Campus Residential. */
export const THREAD_C_ASR_LINE_ID = 'ASR-2025-RESHALL-SEXOFF';

/** Sibling VAWA-eligible incidents in the same residence hall last 12 months. */
export const THREAD_C_RELATED_INCIDENT_IDS = [
  'INC-2025-04019',
  'INC-2025-07217',
  'INC-2025-08812',
];

/** FOIA extract bundle prepared for the DOE reviewer. */
export const THREAD_C_FOIA_REQUEST_ID = 'FOIA-2026-077';

// =========================================================================
// Pipeline anchors — the three demo paths (success / failed / blocked)
// =========================================================================

/** Clean-run demo path. */
export const PIPELINE_SUCCESS_PATH_ID = 'bronze-cad-events';

/** Failed-quality-gate demo path. Thread C — Clery polygon ambiguity. */
export const PIPELINE_FAILED_GATE_PATH_ID = 'silver-clery-classifier';

/** Blocked-upstream demo path. Thread A — Maxient export lag. */
export const PIPELINE_BLOCKED_PATH_ID = 'gold-bit-briefing-features';

// =========================================================================
// Anchor registry (for cross-narrative integrity check)
// =========================================================================

/**
 * Every anchor ID grouped by entity kind. The dev-mode integrity check in
 * src/lib/mock-db/index.ts walks this map and warns on any anchor whose
 * resolver returns undefined.
 */
export const THREAD_ANCHOR_REGISTRY = {
  persons: [THREAD_A_SUBJECT_PERSON_ID],
  buildings: [
    THREAD_A_SUBJECT_RESIDENCE_BUILDING_ID,
    THREAD_A_BUILDING_OF_CONCERN_ID,
    THREAD_B_FAILED_GENERATOR_BUILDING_ID,
    ...THREAD_B_SHELTER_BUILDING_IDS,
  ],
  pipelines: [
    PIPELINE_SUCCESS_PATH_ID,
    PIPELINE_FAILED_GATE_PATH_ID,
    PIPELINE_BLOCKED_PATH_ID,
  ],
  // R3+ will add incidents, bit-cases, title-ix-cases, conduct-cases,
  // notification-campaigns, eoc-activations, asr-lines, etc.
} as const;
