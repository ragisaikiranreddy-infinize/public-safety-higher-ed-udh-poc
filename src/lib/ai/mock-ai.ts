/**
 * Mock AI swap-point.
 *
 * Per CLAUDE.md sacrosanct swap-point #2: this is the sole AI surface.
 * Routes/components MUST NOT import an LLM SDK. In production, replace these
 * functions with calls to a hosted LLM gated by the same evaluateBarrier()
 * logic — the shape of the return values is fixed so the UI doesn't change.
 *
 * R5 surface — Thread A:
 *   - summarizeBITSubject(personId)     → 7-bullet AI briefing with citations
 *   - bitCopilot(caseId, prompt)        → conversational copilot (canned)
 *
 * R6 surface — Thread B (EOC):
 *   - eocCopilot(activationId, prompt)  → operational copilot (canned)
 *   - draftAAR(activationId)            → after-action report draft (canned)
 *
 * R7 surface — Thread C (Clery):
 *   - classifyCleryEvent(incidentId)    → Clery crime + geography classification
 *   - cleryCopilot(prompt)              → compliance copilot (canned)
 *   - redactFoia(requestId)             → AI-assisted redaction preview
 *
 * R8 surface — Module 5B Conduct + Governance:
 *   - conductCopilot(prompt)            → conduct copilot (canned)
 *   - amnestyAssist(caseId)             → Medical Amnesty determination aid
 *   - hazingClassifier(orgCaseId)       → Stop Campus Hazing classifier
 *   - ferpaDecisionAid(caseId)          → FERPA §99.31 decision aid
 *
 * R9 surface — Polish, AI surfaces:
 *   - askPlatform(prompt)               → NL→SQL grounded Q+A
 *   - cohortFromNL(prompt)              → chip-pipeline cohort builder
 *   - buildDashboardFromNL(prompt)      → AI dashboard builder
 *   - expandInsight(insightId)          → narrative expansion w/ contributors
 */

import type { Classification, RoleId } from '../types';
import {
  THREAD_A_SUBJECT_PERSON_ID,
  THREAD_A_BIT_CASE_ID,
  THREAD_A_BUILDING_OF_CONCERN_ID,
  THREAD_B_EOC_ACTIVATION_ID,
  THREAD_B_INITIAL_CAMPAIGN_ID,
  THREAD_B_REDIRECT_CAMPAIGN_ID,
  THREAD_B_FAILED_GENERATOR_BUILDING_ID,
  THREAD_C_TRIGGERING_INCIDENT_ID,
  THREAD_C_ASR_LINE_ID,
  THREAD_C_FOIA_REQUEST_ID,
} from '../../../mocks/threads';
import type { CleryCrimeCategory, CleryGeographyClass, DashboardWidget } from '../types';
import { evaluateBarrier } from '../information-barriers';

// =========================================================================
// Public types
// =========================================================================

export type AICitationKind =
  | 'dataset'
  | 'incident'
  | 'tip'
  | 'access-anomaly'
  | 'camera-analytic'
  | 'conduct-case'
  | 'title-ix-case'
  | 'barrier-hit';

export interface AICitation {
  kind: AICitationKind;
  /** Stable ID for the cited record/dataset. */
  refId: string;
  /** Short label rendered next to the bullet. */
  label: string;
  /** Route this citation deep-links to. */
  linkedRoute?: string;
  /** Classification of the cited record — used to render barrier vs. value. */
  classification: Classification;
}

export interface AIBriefingBullet {
  /** A one-sentence claim. */
  claim: string;
  /** Up to 3 citations. */
  citations: AICitation[];
  /** Optional richer detail rendered when expanded. */
  detail?: string;
  /** True if any citation hit an information barrier. */
  hasBarrier?: boolean;
}

export type AIRiskTier = 'mild' | 'moderate' | 'elevated' | 'critical';
export type AIRiskTrend = 'rising' | 'stable' | 'falling';

export interface AIBriefing {
  /** Whether the AI surfaced any content at all (false → role lacks any access). */
  available: boolean;
  /** Headline sentence — rendered above the bullets. */
  headline: string;
  /** 5..7 bullets — canonical Thread A briefing has exactly 7. */
  bullets: AIBriefingBullet[];
  /** Risk classification — null when no risk model applied. */
  risk: {
    tier: AIRiskTier;
    trend: AIRiskTrend;
    confidence: number;     // 0..100
    rationale: string;
  } | null;
  /** Model attribution (single source of truth — also rendered in the prediction panel). */
  model: {
    name: string;
    version: string;
    scoredAt: string;
    promptTokens: number;
    completionTokens: number;
  };
  /** Tokens for the streaming-text component. */
  streamingPlan: { text: string; delayMs: number }[];
  /** Barrier hits triggered while generating this briefing. */
  barriersInvoked: string[];
}

export interface AICopilotTurn {
  role: 'user' | 'assistant';
  text: string;
  citations?: AICitation[];
}

// =========================================================================
// summarizeBITSubject — the centerpiece of R5
// =========================================================================

/**
 * Build the 7-bullet briefing for a BIT subject.
 *
 * For PER-008470 (Thread A subject) we return the canonical hand-authored
 * briefing. For other subjects we return a generic "no signal" stub — the
 * full algorithmic version lands in R9.
 *
 * The function is barrier-aware: every cited record gets evaluateBarrier()
 * called before its label is rendered. Barrier hits surface as a [BARRIER]
 * citation that the UI renders with the BarrierIndicator.
 */
export function summarizeBITSubject(
  personId: string,
  actorRole: RoleId,
): AIBriefing {
  if (personId !== THREAD_A_SUBJECT_PERSON_ID) {
    return {
      available: true,
      headline: 'No multi-source pattern detected for this subject.',
      bullets: [
        {
          claim: 'No open BIT case is associated with this Person Master Record.',
          citations: [],
        },
      ],
      risk: null,
      model: {
        name: 'BIT-RiskClassifier-NaBITA',
        version: 'v0.3.2',
        scoredAt: new Date().toISOString().split('.')[0] + 'Z',
        promptTokens: 412,
        completionTokens: 38,
      },
      streamingPlan: [
        { text: 'No multi-source pattern detected for this subject.', delayMs: 30 },
      ],
      barriersInvoked: [],
    };
  }

  // ---------- Thread A canonical briefing ----------
  const barriersInvoked: string[] = [];

  // Evaluate the walled Title IX citation up-front so the bullet renders correctly.
  const tixCheck = evaluateBarrier({
    actorRole,
    fieldClassification: 'title-ix-sensitive',
    resourceKind: 'tix-case',
    resourceId: 'TIX-2026-0014',
  });
  if (!tixCheck.allowed && tixCheck.barrierHit) {
    barriersInvoked.push(tixCheck.barrierHit.id);
  }

  const bullets: AIBriefingBullet[] = [
    {
      claim:
        '47 after-hours card-swipes by this subject at DOR-CARTER-MAIN-S over the past 60 days, clustered 22:00–02:00.',
      citations: [
        {
          kind: 'access-anomaly',
          refId: 'ACS-CARTER-CLUSTER',
          label: 'Access cluster · Carter Hall',
          linkedRoute: `/access/buildings/${THREAD_A_BUILDING_OF_CONCERN_ID}`,
          classification: 'pii',
        },
        {
          kind: 'dataset',
          refId: 'access.events_normalized',
          label: 'access.events_normalized',
          linkedRoute: '/catalog/access.events_normalized',
          classification: 'pii',
        },
      ],
      detail:
        'Subject\'s primary residence is BLD-ADAMS-HALL. The unusual-building heuristic ' +
        'fires on every swipe in this cluster; the 60-day rate is ~7× the cardholder baseline.',
    },
    {
      claim:
        '11 corroborating camera-analytic loitering events on CAM-CARTER-N3 in the same 22:00–02:00 window.',
      citations: [
        {
          kind: 'camera-analytic',
          refId: 'CAM-CARTER-N3',
          label: 'CAM-CARTER-N3 · loitering',
          linkedRoute: '/cameras/CAM-CARTER-N3',
          classification: 'restricted-investigation',
        },
        {
          kind: 'dataset',
          refId: 'vms.events_normalized',
          label: 'vms.events_normalized',
          linkedRoute: '/catalog/vms.events_normalized',
          classification: 'restricted-investigation',
        },
      ],
      detail: 'Average dwell time 4m12s; analytic confidence 0.78–0.92.',
    },
    {
      claim:
        'Six anonymous tips received across 45 days reference the same subject + building, matched via shared device-id (dev-9c4f7b21, 84% probabilistic).',
      citations: [
        {
          kind: 'tip',
          refId: 'TIP-2026-0258',
          label: '6 tips · device-matched',
          linkedRoute: '/persons/PER-008470',
          classification: 'pii',
        },
        {
          kind: 'dataset',
          refId: 'tips.anonymous_raw',
          label: 'tips.anonymous_raw',
          linkedRoute: '/catalog/tips.anonymous_raw',
          classification: 'pii',
        },
      ],
      detail: 'Most recent tip 6 days ago — "He keeps coming back. Six tips now. Why is nothing being done?"',
    },
    {
      claim:
        'Two prior conduct cases on file — substance (sophomore year, Adams) and residential (Carter Hall, 6 months ago).',
      citations: [
        {
          kind: 'conduct-case',
          refId: 'COND-2024-00211',
          label: 'COND-2024-00211',
          linkedRoute: '/conduct/COND-2024-00211',
          classification: 'ferpa-edu-record',
        },
        {
          kind: 'conduct-case',
          refId: 'COND-2025-01882',
          label: 'COND-2025-01882',
          linkedRoute: '/conduct/COND-2025-01882',
          classification: 'ferpa-edu-record',
        },
      ],
      detail:
        'Closed-with-sanction prior cases are pattern markers. The Carter Hall case is at the same building of concern as the current access cluster.',
    },
    {
      claim:
        'D2L engagement score dropped 38% vs. 90-day baseline; six consecutive missed CS-course submissions.',
      citations: [
        {
          kind: 'dataset',
          refId: 'mart.bit_case_briefing_features',
          label: 'mart.bit_case_briefing_features',
          linkedRoute: '/catalog/mart.bit_case_briefing_features',
          classification: 'ferpa-edu-record',
        },
      ],
      detail: 'LMS engagement is a NaBITA "precipitating event" indicator. Trend rising in the rubric.',
    },
    {
      claim:
        'Welfare check 2 hours ago at Carter Hall main entry cleared no-action; subject not on scene at officer arrival.',
      citations: [
        {
          kind: 'incident',
          refId: 'INC-2026-04881',
          label: 'INC-2026-04881',
          linkedRoute: '/incidents/INC-2026-04881',
          classification: 'cji',
        },
      ],
      detail: 'Reporting party: Carter Hall RA. Building of concern still has anomalous swipe pattern.',
    },
    // The 7th bullet — barrier-aware Title IX citation.
    tixCheck.allowed
      ? {
          claim:
            'Informal Title IX intake on file (TIX-2026-0014) — supportive measures in place, no formal complaint filed.',
          citations: [
            {
              kind: 'title-ix-case',
              refId: 'TIX-2026-0014',
              label: 'TIX-2026-0014',
              linkedRoute: '/title-ix/TIX-2026-0014',
              classification: 'title-ix-sensitive',
            },
          ],
          detail:
            'Coordinate any BIT support-plan action with Title IX supportive measures to avoid duplication or conflict.',
        }
      : {
          claim:
            'A Title IX intake exists naming the subject. Content is withheld by an information barrier for this role.',
          citations: [
            {
              kind: 'barrier-hit',
              refId: tixCheck.barrierHit?.id ?? 'IB-TIX-TO-PD-HARD',
              label: tixCheck.barrierHit?.name ?? 'Title IX → PD (hard wall)',
              classification: 'title-ix-sensitive',
            },
          ],
          hasBarrier: true,
          detail:
            'Override path: ' +
            (tixCheck.barrierHit?.overridePath ?? 'Title IX coordinator + General Counsel co-sign'),
        },
  ];

  const headline =
    'Six-month convergent signal: access · surveillance · tips · prior conduct — pattern centered on BLD-CARTER-HALL after 22:00.';

  const streamingPlan: { text: string; delayMs: number }[] = [
    { text: 'Assembling multi-source briefing', delayMs: 280 },
    { text: '… reading access.events_normalized', delayMs: 220 },
    { text: '… reading vms.events_normalized', delayMs: 200 },
    { text: '… reading tips.anonymous_raw', delayMs: 200 },
    { text: '… reading bit.cases_normalized', delayMs: 220 },
    { text: '… reading mart.bit_case_briefing_features', delayMs: 200 },
    { text: '… reading incidents.conformed', delayMs: 180 },
    { text: '… evaluating information barriers (IB-TIX-TO-PD-HARD)', delayMs: 280 },
    { text: 'Scoring NaBITA dimensions (subject, target, environment, precipitating)', delayMs: 320 },
    { text: 'Done.', delayMs: 200 },
  ];

  return {
    available: true,
    headline,
    bullets,
    risk: {
      tier: 'elevated',
      trend: 'rising',
      confidence: 71,
      rationale:
        'Subject + Target dimensions sit in upper-moderate; Precipitating Events trending up over the past 30 days. ' +
        'Confidence interval [64, 78].',
    },
    model: {
      name: 'BIT-RiskClassifier-NaBITA',
      version: 'v0.3.2',
      scoredAt: new Date().toISOString().split('.')[0] + 'Z',
      promptTokens: 1812,
      completionTokens: 287,
    },
    streamingPlan,
    barriersInvoked,
  };
}

// =========================================================================
// bitCopilot — conversational follow-up (canned for Thread A)
// =========================================================================

export interface AIBitCopilotResult {
  available: boolean;
  reply: string;
  citations: AICitation[];
}

/**
 * Lightweight intent-router for Thread A copilot prompts. Three canned
 * intents the demo can hit:
 *   - "what should we do next" / "next steps"  → action recommendation
 *   - "show me the swipe timeline"             → access drill-down hint
 *   - "what's the risk trend"                  → risk-tier explanation
 * Otherwise: a generic deflection.
 */
export function bitCopilot(
  caseId: string,
  prompt: string,
  _actorRole: RoleId,
): AIBitCopilotResult {
  if (caseId !== THREAD_A_BIT_CASE_ID) {
    return {
      available: true,
      reply: 'The conversational copilot is wired to the canonical demo case (BIT-2026-0067) for this POC. Open that case to exercise the full Q&A flow.',
      citations: [],
    };
  }

  const q = prompt.toLowerCase().trim();

  if (q.includes('next step') || q.includes('do next') || q.includes('action')) {
    return {
      available: true,
      reply:
        'Three actions are queued in the support plan: BIT team review in 5 days, voluntary counseling referral (outreach in progress), and ' +
        'a coordination meeting with the Title IX Coordinator. The welfare-check action completed 2 hours ago. Recommend escalating the ' +
        'review meeting if the after-hours access cluster continues this week.',
      citations: [
        {
          kind: 'access-anomaly',
          refId: 'ACS-CARTER-CLUSTER',
          label: 'Access cluster · Carter Hall',
          linkedRoute: '/access/buildings/BLD-CARTER-HALL',
          classification: 'pii',
        },
      ],
    };
  }

  if (q.includes('timeline') || q.includes('swipe') || q.includes('access')) {
    return {
      available: true,
      reply:
        'The 47 after-hours card-swipes span ~60 days, with cadence increasing from one every 4–5 days to one every 36 hours in the last ' +
        'two weeks. Drill into BLD-CARTER-HALL to see the hourly heatmap.',
      citations: [
        {
          kind: 'access-anomaly',
          refId: 'ACS-CARTER-CLUSTER',
          label: 'Open Building Intelligence Overlay →',
          linkedRoute: '/access/buildings/BLD-CARTER-HALL',
          classification: 'pii',
        },
      ],
    };
  }

  if (q.includes('risk') || q.includes('trend') || q.includes('nabita')) {
    return {
      available: true,
      reply:
        'NaBITA scoring puts Subject = 6, Target = 5, Environment = 4, Precipitating = 7. The combined tier is "elevated" with rising trend. ' +
        'The Precipitating dimension is the fastest mover — LMS engagement dropped 38% in the past 30 days.',
      citations: [
        {
          kind: 'dataset',
          refId: 'mart.bit_case_briefing_features',
          label: 'mart.bit_case_briefing_features',
          linkedRoute: '/catalog/mart.bit_case_briefing_features',
          classification: 'ferpa-edu-record',
        },
      ],
    };
  }

  return {
    available: true,
    reply:
      'I can speak to the support plan, the 60-day access timeline, or the NaBITA risk scoring for this case. What would you like to know?',
    citations: [],
  };
}

// =========================================================================
// eocCopilot — Thread B operational copilot
// =========================================================================

export interface AIEocCopilotResult {
  available: boolean;
  reply: string;
  citations: AICitation[];
}

/**
 * Intent-router for EOC copilot prompts. Three canned intents tied to the
 * Thread B activation:
 *   - "status" / "sitrep"            → current state summary
 *   - "generator" / "ww4"            → operational-intelligence detail
 *   - "notification" / "campaign"    → campaign + delivery summary
 */
export function eocCopilot(
  activationId: string,
  prompt: string,
  _actorRole: RoleId,
): AIEocCopilotResult {
  if (activationId !== THREAD_B_EOC_ACTIVATION_ID) {
    return {
      available: true,
      reply:
        'The EOC copilot is wired to the active Thread B activation (EOC-2026-013) for this POC. Open that activation to exercise the full Q&A flow.',
      citations: [],
    };
  }

  const q = prompt.toLowerCase().trim();

  if (q.includes('status') || q.includes('sitrep') || q.includes('summary')) {
    return {
      available: true,
      reply:
        'Partial activation, 17 minutes in. Shelter campaign delivered to 14,210 recipients across 6 channels. ' +
        'Four buildings locked down. Runbook on step 5/10 (BMS pre-check). WW4 generator failed 5 minutes ago — ' +
        'redirect campaign already dispatched. ICS 207: 7/8 seats filled (Finance Chief unfilled).',
      citations: [
        {
          kind: 'dataset',
          refId: 'mart.notification_delivery_kpis',
          label: 'mart.notification_delivery_kpis',
          linkedRoute: '/catalog/mart.notification_delivery_kpis',
          classification: 'public',
        },
      ],
    };
  }

  if (q.includes('generator') || q.includes('ww4') || q.includes('west wing 4')) {
    return {
      available: true,
      reply:
        'WW4 generator (GEN-WW4-01) failed during transfer test with a fuel-pump pressure fault. Building is on UPS battery — ' +
        '~23 minutes of runtime remaining. Facilities is on-scene; sister UPS-on-battery alarm fired simultaneously. ' +
        'Redirect campaign MNP-2026-088-B sent to 412 occupants 3 minutes ago.',
      citations: [
        {
          kind: 'dataset',
          refId: 'facilities.alarms_normalized',
          label: 'facilities.alarms_normalized',
          linkedRoute: '/catalog/facilities.alarms_normalized',
          classification: 'internal',
        },
      ],
    };
  }

  if (q.includes('notification') || q.includes('campaign') || q.includes('alert')) {
    return {
      available: true,
      reply:
        'Two campaigns sent under this activation. MNP-2026-088 (initial shelter-in-place) reached 14,210 recipients with 99.1% SMS delivery and ' +
        '83% email open rate. MNP-2026-088-B (WW4 redirect) reached 412 occupants with 99.0% SMS delivery and 96% push delivery. P95 SMS latency: 11s.',
      citations: [
        {
          kind: 'dataset',
          refId: 'notifications.delivery_normalized',
          label: 'notifications.delivery_normalized',
          linkedRoute: '/catalog/notifications.delivery_normalized',
          classification: 'public',
        },
      ],
    };
  }

  return {
    available: true,
    reply:
      'I can speak to current status, the WW4 generator situation, or the mass-notification delivery rollup for this activation. What would you like to know?',
    citations: [],
  };
}

// =========================================================================
// draftAAR — After-Action Report draft
// =========================================================================

export interface AIAARSection {
  heading: string;
  bullets: string[];
}

export interface AIAAR {
  available: boolean;
  activationId: string;
  /** Executive headline rendered above the sections. */
  headline: string;
  sections: AIAARSection[];
  /** Lessons-learned items with attribution. */
  lessonsLearned: { observation: string; recommendation: string; ownerRole: RoleId }[];
  /** Model attribution. */
  model: { name: string; version: string; promptTokens: number; completionTokens: number };
}

export function draftAAR(activationId: string): AIAAR {
  if (activationId !== THREAD_B_EOC_ACTIVATION_ID) {
    return {
      available: true,
      activationId,
      headline: 'No prior After-Action Report draft exists for this activation.',
      sections: [],
      lessonsLearned: [],
      model: {
        name: 'EOC-AARDrafter',
        version: 'v0.2.1',
        promptTokens: 380,
        completionTokens: 26,
      },
    };
  }

  return {
    available: true,
    activationId,
    headline:
      'Partial activation for an NWS Tornado Warning. Shelter-in-place achieved campus-wide within 30 seconds; ' +
      'four buildings lockdown-secured within 60s. Unforecast WW4 generator failure was detected at T+12 and ' +
      'mitigated via a targeted redirect campaign at T+14.',
    sections: [
      {
        heading: 'Timeline',
        bullets: [
          'T+0   — NWS Tornado Warning received; campus polygon intersection auto-detected.',
          'T+30s — MNP-2026-088 dispatched (6 channels, 14,210 recipients).',
          'T+60s — ACS lockdown initiated on 4 shelter-designated buildings.',
          'T+90s — EOC team paged; 7/8 ICS 207 seats filled within 2 minutes.',
          'T+12m — BMS alarm: WW4-GEN-01 failed during transfer test.',
          'T+14m — Decision recorded: redirect WW4 occupants. MNP-2026-088-B dispatched.',
        ],
      },
      {
        heading: 'What worked',
        bullets: [
          'Auto-activation cascade from NWS feed eliminated the manual decision-to-action delay.',
          'Multi-channel delivery achieved P95 < 11s on SMS — well within the 60-second target.',
          'BMS-to-EOC correlation surfaced the WW4 generator failure within 90 seconds of occurrence.',
        ],
      },
      {
        heading: 'What did not work',
        bullets: [
          'Finance Section Chief seat remained unfilled at this activation level.',
          'WW4 generator pre-test cadence (last test 13 days ago) did not catch the fuel-pump pressure fault.',
          'Voice-channel delivery rate (94.5%) lagged SMS — recommend voice-tree review.',
        ],
      },
    ],
    lessonsLearned: [
      {
        observation: 'WW4 generator failure was not caught by the routine test cadence.',
        recommendation: 'Tighten generator-test interval from 14d to 7d; add fuel-pump pressure to the automated test rubric.',
        ownerRole: 'eoc-director',
      },
      {
        observation: 'Finance Section Chief was unfilled when partial activation opened.',
        recommendation: 'Add a secondary Finance Chief to the ICS 207 roster; alert if seat is unfilled within 5 minutes.',
        ownerRole: 'eoc-director',
      },
      {
        observation: 'Voice-channel P95 latency reached 41 seconds.',
        recommendation: 'Review TTS provider SLA and voice-tree depth. Consider parallel-call ramping.',
        ownerRole: 'ciso',
      },
    ],
    model: {
      name: 'EOC-AARDrafter',
      version: 'v0.2.1',
      promptTokens: 2104,
      completionTokens: 484,
    },
  };
}

// Pin Thread B campaign + building imports for unused-import lint.
void THREAD_B_INITIAL_CAMPAIGN_ID;
void THREAD_B_REDIRECT_CAMPAIGN_ID;
void THREAD_B_FAILED_GENERATOR_BUILDING_ID;

// =========================================================================
// classifyCleryEvent — Clery classification suggestion for an incident
// =========================================================================

export interface AICleryClassification {
  available: boolean;
  /** Whether the incident appears Clery-reportable. */
  reportable: boolean;
  /** Suggested crime category. */
  crime: CleryCrimeCategory | null;
  /** Suggested geography class. */
  geography: CleryGeographyClass | null;
  /** Confidence (0..100). */
  confidence: number;
  /** Rationale paragraph. */
  rationale: string;
  /** Items flagged for human review. */
  reviewFlags: string[];
  /** Lineage trace back to Bronze. */
  lineage: { dataset: string; rowRef: string }[];
  /** Optional ASR cell ID this classification would feed. */
  asrLineItemId?: string;
}

export function classifyCleryEvent(incidentId: string): AICleryClassification {
  if (incidentId === THREAD_C_TRIGGERING_INCIDENT_ID) {
    return {
      available: true,
      reportable: true,
      crime: 'sex-offense-rape',
      geography: 'on-campus-residential',
      confidence: 96,
      rationale:
        'Call type ASSAULT-SEXUAL with NIBRS code 13A maps to the Clery "Sex Offenses — Rape" ' +
        'category. Building BLD-CARTER-HALL is classified on-campus-residential in the certified ' +
        '2025 polygon set (CGP-MAIN-CAMPUS-2025). VAWA-eligible. Continuing-threat assessment ' +
        'concluded a Timely Warning was warranted (issued 38 min after receipt).',
      reviewFlags: [
        'Title IX cross-reference exists — confirm §99.32(c) reportable status with Title IX coordinator.',
      ],
      lineage: [
        { dataset: 'cad.events_raw', rowRef: 'cad_event_uuid:8f5e2a1c-...' },
        { dataset: 'rms.case_raw', rowRef: 'rms_case_number:25-08812' },
        { dataset: 'incidents.conformed', rowRef: 'INC-2025-08812' },
        { dataset: 'mart.clery_asr_workspace', rowRef: THREAD_C_ASR_LINE_ID },
      ],
      asrLineItemId: THREAD_C_ASR_LINE_ID,
    };
  }
  return {
    available: true,
    reportable: false,
    crime: null,
    geography: null,
    confidence: 22,
    rationale:
      'Insufficient signal to recommend a Clery classification. Manual review recommended; verify ' +
      'call-type taxonomy mapping and geography determination before posting to the workspace.',
    reviewFlags: ['Manual classification required.'],
    lineage: [{ dataset: 'cad.events_raw', rowRef: `incident:${incidentId}` }],
  };
}

// =========================================================================
// cleryCopilot — compliance copilot (canned for Thread C)
// =========================================================================

export interface AICleryCopilotResult {
  available: boolean;
  reply: string;
  citations: AICitation[];
}

/**
 * Three canned intents tied to Thread C:
 *   - "asr" / "table" / "completeness"   → ASR workbench summary
 *   - "geography" / "polygon"            → geography certification posture
 *   - "warning" / "timely"               → Timely Warning ledger summary
 */
export function cleryCopilot(prompt: string, _actorRole: RoleId): AICleryCopilotResult {
  const q = prompt.toLowerCase().trim();

  if (q.includes('asr') || q.includes('table') || q.includes('completeness') || q.includes('annual')) {
    return {
      available: true,
      reply:
        'The 2025 ASR workspace is 73% reviewed. The Thread C cell — Sex Offenses · On-Campus Residential — is ' +
        'reviewed and submitted with 3 incidents linked. Two cells in the matrix are still awaiting review: ' +
        'Burglary · On-Campus and Stalking · Public Property. Source-to-line lineage is live: every cell traces ' +
        'back to bronze.cad.events_raw + bronze.rms.case_raw.',
      citations: [
        {
          kind: 'dataset',
          refId: 'mart.clery_asr_workspace',
          label: 'mart.clery_asr_workspace',
          linkedRoute: '/catalog/mart.clery_asr_workspace',
          classification: 'public',
        },
      ],
    };
  }

  if (q.includes('geography') || q.includes('polygon') || q.includes('clery')) {
    return {
      available: true,
      reply:
        'The 2025 polygon set CGP-MAIN-CAMPUS-2025 is certified (30 days ago). Eight audit-history entries trace ' +
        'every classification change since the initial ingest. The most recent change excluded the Health Center ' +
        'counseling-center suite from on-campus per the 42 CFR Part 2 / Clery interaction memo.',
      citations: [
        {
          kind: 'dataset',
          refId: 'mart.clery_asr_workspace',
          label: 'mart.clery_asr_workspace',
          linkedRoute: '/clery/geography',
          classification: 'public',
        },
      ],
    };
  }

  if (q.includes('warning') || q.includes('timely')) {
    return {
      available: true,
      reply:
        'Eight Timely Warnings on the ledger this reporting year: 5 issued, 2 declined, 1 pending. The Thread C ' +
        'warning TWR-2025-0029 was issued 38 minutes after incident receipt — well within the 60-minute target. ' +
        'Continuing-threat assessment narratives are captured on every decision, including the declines.',
      citations: [
        {
          kind: 'incident',
          refId: 'TWR-2025-0029',
          label: 'TWR-2025-0029',
          classification: 'public',
        },
      ],
    };
  }

  return {
    available: true,
    reply:
      'I can speak to the ASR workspace + completeness, the geography polygon set + audit history, or the ' +
      'Timely Warning ledger. What would you like to know?',
    citations: [],
  };
}

// =========================================================================
// redactFoia — AI-assisted redaction preview for a FOIA request
// =========================================================================

export interface AIRedactionResult {
  available: boolean;
  requestId: string;
  /** Top-line headline shown above the preview. */
  headline: string;
  /** Source records included in scope. */
  recordCount: number;
  /** Total field-level masks proposed. */
  totalMasks: number;
  /** Per-classification mask counts. */
  maskedByClassification: Partial<Record<Classification, number>>;
  /** Per-field mask counts. */
  maskedByField: Record<string, number>;
  /** Redacted sample excerpt for the preview pane. */
  sampleExcerpt: string;
  /** Confidence 0..100. */
  confidence: number;
  /** Items flagged for attorney review with rationale. */
  attorneyReviewItems: { item: string; reason: string }[];
  /** Streaming-plan tokens for the demo. */
  streamingPlan: { text: string; delayMs: number }[];
  /** Model attribution. */
  model: { name: string; version: string; promptTokens: number; completionTokens: number };
}

export function redactFoia(requestId: string): AIRedactionResult {
  if (requestId !== THREAD_C_FOIA_REQUEST_ID) {
    return {
      available: true,
      requestId,
      headline: 'No AI redaction preview available for this request.',
      recordCount: 0,
      totalMasks: 0,
      maskedByClassification: {},
      maskedByField: {},
      sampleExcerpt: '',
      confidence: 0,
      attorneyReviewItems: [],
      streamingPlan: [{ text: 'No applicable records in scope.', delayMs: 30 }],
      model: { name: 'FOIA-Redactor', version: 'v0.4.0', promptTokens: 320, completionTokens: 22 },
    };
  }
  return {
    available: true,
    requestId,
    headline:
      'Three incidents in scope (the 2025 Sex Offenses · On-Campus Residential cell). 47 proposed field-level ' +
      'masks across PII, CJI, restricted-investigation, and title-ix-sensitive classifications. 3 items flagged ' +
      'for attorney review.',
    recordCount: 3,
    totalMasks: 47,
    maskedByClassification: {
      'pii': 18,
      'cji': 12,
      'restricted-investigation': 14,
      'title-ix-sensitive': 3,
    },
    maskedByField: {
      'caller_phone': 3,
      'narrative': 14,
      'reporter_name': 3,
      'reporter_address': 3,
      'subject_name': 6,
      'subject_dob': 3,
      'license_plate': 2,
      'officer_name': 9,
      'witness_name': 4,
    },
    sampleExcerpt:
      'INC-2025-08812 — [REDACTED: caller_phone] reporting an [PII MASKED] involving [TITLE IX WALLED] ' +
      'at [BLD-CARTER-HALL] residential common area. Reporting Officer: [OFFICER MASKED — name + badge]. ' +
      'Witness statement attached: [REDACTED — restricted-investigation hold pending case closure]. ' +
      'NIBRS Offense: 13A — Sex Offense. Clery Geography: On-Campus Residential. Classification: ' +
      'restricted-investigation.',
    confidence: 87,
    attorneyReviewItems: [
      {
        item: 'Witness statement excerpt at line 4',
        reason: 'AI confidence 64% — borderline whether to mask further or release with party consent.',
      },
      {
        item: 'Officer-name reference in narrative paragraph 2',
        reason: 'Confirm pseudonymization policy with General Counsel before release.',
      },
      {
        item: 'Title IX cross-reference in INC-2025-08812 narrative',
        reason: 'Verify §99.31 release rationale before disclosure.',
      },
    ],
    streamingPlan: [
      { text: 'Scoping responsive records', delayMs: 220 },
      { text: '… reading incidents.conformed (3 records)', delayMs: 220 },
      { text: '… reading rms.case_raw (3 case files)', delayMs: 220 },
      { text: '… evaluating classification at field level', delayMs: 280 },
      { text: '… applying CJIS / FERPA / Title IX redaction rules', delayMs: 280 },
      { text: '… scoring confidence + flagging attorney-review items', delayMs: 220 },
      { text: 'Done.', delayMs: 180 },
    ],
    model: {
      name: 'FOIA-Redactor',
      version: 'v0.4.0',
      promptTokens: 1860,
      completionTokens: 412,
    },
  };
}

void THREAD_C_TRIGGERING_INCIDENT_ID;
void THREAD_C_ASR_LINE_ID;
void THREAD_C_FOIA_REQUEST_ID;

// =========================================================================
// conductCopilot — Module 5B conversational copilot (R8)
// =========================================================================

export interface AIConductCopilotResult {
  available: boolean;
  reply: string;
  citations: AICitation[];
}

/**
 * Four canned intents:
 *   - "amnesty" / "medical"           → Medical Amnesty determination overview
 *   - "ferpa" / "parental"            → FERPA §99.31 decision flow
 *   - "hazing" / "campus hazing"      → Stop Campus Hazing Act guidance
 *   - "sanction" / "due"              → outstanding-sanction snapshot
 */
export function conductCopilot(prompt: string, _actorRole: RoleId): AIConductCopilotResult {
  const q = prompt.toLowerCase().trim();

  if (q.includes('amnesty') || q.includes('medical')) {
    return {
      available: true,
      reply:
        'Medical Amnesty applies when (a) the violation was alcohol or drug, (b) the subject or a peer ' +
        'sought emergency medical care, and (c) the subject cooperated with first responders. The ' +
        'institutional policy POL-MEDICAL-AMNESTY layers educational programming (AlcoholEdu / BASICS) ' +
        'in lieu of conduct sanction. Open the case detail to see the amnesty-applicability checklist.',
      citations: [
        { kind: 'dataset', refId: 'maxient.conduct_cases_normalized', label: 'bit.cases_normalized', linkedRoute: '/catalog/bit.cases_normalized', classification: 'ferpa-edu-record' },
      ],
    };
  }

  if (q.includes('ferpa') || q.includes('parental') || q.includes('99.31')) {
    return {
      available: true,
      reply:
        'FERPA §99.31(a)(15) permits parental notification when the violation involves alcohol/drug AND the ' +
        'subject is under 21. The §99.31(a)(10) health/safety emergency basis is broader but narrower in ' +
        'application — use only when an articulable health/safety threat exists. The platform decision aid ' +
        'walks both prongs and records the rationale to the parental-notification audit log.',
      citations: [
        { kind: 'dataset', refId: 'REG-FERPA-99-31', label: 'FERPA §99.31', linkedRoute: '/regulations', classification: 'public' },
      ],
    };
  }

  if (q.includes('hazing') || q.includes('campus hazing')) {
    return {
      available: true,
      reply:
        'Per the Stop Campus Hazing Act (2024), institutions must (1) include hazing statistics in the ASR, ' +
        '(2) maintain a published roster of organizations found responsible for hazing, and (3) deliver hazing ' +
        'prevention programming. The hazing classifier (`/conduct/organizational`) flags candidate cases for ' +
        'reportability review.',
      citations: [
        { kind: 'dataset', refId: 'REG-STOP-CAMPUS-HAZING', label: 'Stop Campus Hazing Act', linkedRoute: '/regulations', classification: 'public' },
      ],
    };
  }

  if (q.includes('sanction') || q.includes('due')) {
    return {
      available: true,
      reply:
        'Outstanding sanctions are visible on `/conduct` with an `overdue` highlight. Each sanction carries ' +
        'an educational-program assignment (where applicable) and a due date; the tracker pages issue ' +
        'reminders 7 / 3 / 0 days before due.',
      citations: [],
    };
  }

  return {
    available: true,
    reply:
      'I can speak to Medical Amnesty, FERPA §99.31 parental notification, the Stop Campus Hazing Act, ' +
      'or outstanding sanctions. What would you like to know?',
    citations: [],
  };
}

// =========================================================================
// amnestyAssist — Medical Amnesty determination aid
// =========================================================================

export interface AIAmnestyAssessment {
  available: boolean;
  /** Whether the criteria appear met. */
  recommendInvoke: boolean;
  /** Per-criterion outcome with a short rationale. */
  criteria: { name: string; met: boolean; rationale: string }[];
  /** Confidence (0..100). */
  confidence: number;
  /** Free-form headline. */
  headline: string;
}

export function amnestyAssist(caseId: string): AIAmnestyAssessment {
  // For R8 we return a canned positive determination for any substance case
  // whose ID starts with COND- (in production this would inspect the case).
  return {
    available: true,
    recommendInvoke: true,
    headline:
      'All three Medical Amnesty criteria appear met. Recommendation: invoke amnesty + assign AlcoholEdu / BASICS ' +
      'as educational programming.',
    criteria: [
      {
        name: 'Violation type is alcohol or drug',
        met: true,
        rationale: 'Conduct case ' + caseId + ' is filed under the substance subtype.',
      },
      {
        name: 'Emergency medical care was sought',
        met: true,
        rationale: 'Incident narrative confirms a 911 call placed by the subject or a peer.',
      },
      {
        name: 'Subject cooperated with first responders',
        met: true,
        rationale: 'Incident clearance note records cooperation; no force or refusal documented.',
      },
    ],
    confidence: 88,
  };
}

// =========================================================================
// hazingClassifier — Stop Campus Hazing Act reportability classifier
// =========================================================================

export interface AIHazingClassification {
  available: boolean;
  reportable: boolean;
  confidence: number;
  rationale: string;
  /** Sub-elements of the hazing definition with each element's outcome. */
  elements: { name: string; met: boolean; note: string }[];
}

export function hazingClassifier(orgCaseId: string): AIHazingClassification {
  return {
    available: true,
    reportable: true,
    confidence: 91,
    rationale:
      'Organizational case ' + orgCaseId + ' meets the Stop Campus Hazing Act definition. Recommended: include ' +
      'in published roster and the next ASR.',
    elements: [
      {
        name: 'Activity connected to organization initiation / membership',
        met: true,
        note: 'Case narrative references "recruitment week" activities.',
      },
      {
        name: 'Coerced / required participation by new members',
        met: true,
        note: 'Multiple individual-member statements describe coercion.',
      },
      {
        name: 'Risk of harm to participant — physical or psychological',
        met: true,
        note: 'Forced alcohol consumption documented as part of the activity.',
      },
    ],
  };
}

// =========================================================================
// ferpaDecisionAid — FERPA §99.31 parental notification decision aid
// =========================================================================

export interface AIFerpaDecisionAid {
  available: boolean;
  recommendation: 'notify' | 'decline' | 'pending-decision';
  /** Per-prong outcome (a)(15) + (a)(10). */
  prongs: {
    citation: '99.31(a)(15)-alcohol-drug-under-21' | '99.31(a)(10)-health-safety-emergency';
    applicable: boolean;
    rationale: string;
  }[];
  headline: string;
}

// =========================================================================
// askPlatform — NL→SQL grounded Q+A
// =========================================================================

export interface AIAskResult {
  available: boolean;
  /** Headline answer (1-2 sentences). */
  answer: string;
  /** Generated SQL (read-only, against the medallion catalog). */
  sql: string;
  /** Tabular result preview (column headers + a few rows). */
  resultPreview: {
    columns: string[];
    rows: (string | number)[][];
  };
  /** Citations to datasets / records that ground the answer. */
  citations: AICitation[];
  /** Confidence 0..100. */
  confidence: number;
  /** Streaming-plan tokens for the demo. */
  streamingPlan: { text: string; delayMs: number }[];
}

/**
 * Intent-router for /ask prompts. Three canned answers tied to the threads;
 * generic deflection for everything else.
 */
export function askPlatform(prompt: string): AIAskResult {
  const q = prompt.toLowerCase().trim();

  if (q.includes('after-hours') || q.includes('after hours') || (q.includes('swipe') && q.includes('carter'))) {
    return {
      available: true,
      answer:
        '47 after-hours card-swipes at DOR-CARTER-MAIN-S over the past 60 days, by a single cardholder (PER-008470) ' +
        'who does not reside in Carter Hall. Pattern peaks 22:00–02:00.',
      sql:
        `SELECT cardholder_id, COUNT(*) AS swipe_count, MIN(at) AS first_seen, MAX(at) AS last_seen
FROM access.events_normalized
WHERE building_id = 'BLD-CARTER-HALL'
  AND door_id = 'DOR-CARTER-MAIN-S'
  AND is_after_hours = TRUE
  AND is_unusual_building = TRUE
  AND at >= CURRENT_DATE - INTERVAL '60 days'
GROUP BY cardholder_id
ORDER BY swipe_count DESC
LIMIT 5;`,
      resultPreview: {
        columns: ['cardholder_id', 'swipe_count', 'first_seen', 'last_seen'],
        rows: [
          ['OC-44192 (→ PER-008470)', 47, '~58 days ago', '~2 days ago'],
          ['OC-19237', 3, '~12 days ago', '~5 days ago'],
          ['OC-08810', 1, '~22 days ago', '~22 days ago'],
        ],
      },
      citations: [
        { kind: 'dataset', refId: 'access.events_normalized', label: 'access.events_normalized', linkedRoute: '/catalog/access.events_normalized', classification: 'pii' },
        { kind: 'access-anomaly', refId: 'ACS-CARTER-CLUSTER', label: 'Open Building Intelligence Overlay', linkedRoute: '/access/buildings/BLD-CARTER-HALL', classification: 'pii' },
      ],
      confidence: 94,
      streamingPlan: [
        { text: 'Parsing NL prompt', delayMs: 200 },
        { text: '… resolving entities (Carter Hall · after-hours · swipes)', delayMs: 240 },
        { text: '… selecting dataset (access.events_normalized)', delayMs: 240 },
        { text: '… generating SQL', delayMs: 320 },
        { text: '… executing query', delayMs: 280 },
        { text: 'Done.', delayMs: 180 },
      ],
    };
  }

  if (q.includes('open incident') || q.includes('open incidents') || q.includes('right now')) {
    return {
      available: true,
      answer: 'There are open incidents across all classifications right now. Most are routine welfare-checks and noise complaints; the active EOC activation (EOC-2026-013) is the only critical-priority item.',
      sql:
        `SELECT status, priority, COUNT(*) AS n
FROM incidents.conformed
WHERE status IN ('open', 'on-scene', 'pending')
GROUP BY status, priority
ORDER BY priority;`,
      resultPreview: {
        columns: ['status', 'priority', 'n'],
        rows: [
          ['open', 1, 1],
          ['on-scene', 2, 3],
          ['open', 3, 12],
          ['pending', 4, 6],
        ],
      },
      citations: [
        { kind: 'dataset', refId: 'incidents.conformed', label: 'incidents.conformed', linkedRoute: '/catalog/incidents.conformed', classification: 'cji' },
      ],
      confidence: 88,
      streamingPlan: [
        { text: 'Parsing NL prompt', delayMs: 200 },
        { text: '… selecting dataset (incidents.conformed)', delayMs: 240 },
        { text: '… generating SQL', delayMs: 280 },
        { text: '… executing query', delayMs: 280 },
        { text: 'Done.', delayMs: 180 },
      ],
    };
  }

  if (q.includes('asr') || q.includes('clery completeness') || q.includes('annual security')) {
    return {
      available: true,
      answer:
        '2025 ASR is 73% complete (58 / 80 cells reviewed). The Thread C cell — Sex Offenses · On-Campus Residential — is reviewed with 3 source incidents linked.',
      sql:
        `SELECT
  COUNT(*) FILTER (WHERE status IN ('reviewed', 'submitted')) AS reviewed,
  COUNT(*) AS total
FROM mart.clery_asr_workspace
WHERE reporting_year = 2025;`,
      resultPreview: {
        columns: ['reviewed', 'total'],
        rows: [[58, 80]],
      },
      citations: [
        { kind: 'dataset', refId: 'mart.clery_asr_workspace', label: 'mart.clery_asr_workspace', linkedRoute: '/catalog/mart.clery_asr_workspace', classification: 'public' },
        { kind: 'dataset', refId: 'ASR-2025-RESHALL-SEXOFF', label: 'Open ASR workbench →', linkedRoute: '/clery/asr/2025', classification: 'public' },
      ],
      confidence: 91,
      streamingPlan: [
        { text: 'Parsing NL prompt', delayMs: 200 },
        { text: '… selecting dataset (mart.clery_asr_workspace)', delayMs: 240 },
        { text: '… generating SQL', delayMs: 280 },
        { text: '… executing query', delayMs: 240 },
        { text: 'Done.', delayMs: 180 },
      ],
    };
  }

  return {
    available: true,
    answer:
      'I can answer questions grounded in the medallion catalog. Try: "after-hours swipes at Carter Hall", "open incidents right now", or "2025 ASR completeness".',
    sql: '-- no query generated; ask a more specific question',
    resultPreview: { columns: [], rows: [] },
    citations: [],
    confidence: 0,
    streamingPlan: [{ text: 'Awaiting a more specific prompt…', delayMs: 200 }],
  };
}

// =========================================================================
// cohortFromNL — NL prompt → chip-pipeline cohort
// =========================================================================

export interface AICohortBuildResult {
  available: boolean;
  /** Suggested cohort name. */
  name: string;
  /** Predicate chips. */
  chips: { id: string; label: string; kind: 'filter' | 'aggregate' | 'window' | 'threshold' }[];
  /** Sample resolved member IDs. */
  sampleMemberIds: string[];
  /** Estimated count. */
  estimatedCount: number;
  /** Datasets the cohort would read from. */
  datasets: string[];
  /** Confidence 0..100. */
  confidence: number;
}

export function cohortFromNL(prompt: string): AICohortBuildResult {
  const q = prompt.toLowerCase().trim();

  if (q.includes('multi-signal') || q.includes('after-hours') || q.includes('carter')) {
    return {
      available: true,
      name: 'Multi-signal subjects at residence halls (90d)',
      chips: [
        { id: 'c1', label: 'Persons with after-hours residence-hall swipes', kind: 'filter' },
        { id: 'c2', label: '≥ 10 swipes in 60 days', kind: 'aggregate' },
        { id: 'c3', label: 'At a building they do not reside in', kind: 'filter' },
        { id: 'c4', label: '+ camera loitering events on same camera', kind: 'filter' },
        { id: 'c5', label: '+ ≥ 3 anonymous tips matched by device-id', kind: 'aggregate' },
      ],
      sampleMemberIds: ['PER-008470'],
      estimatedCount: 1,
      datasets: ['access.events_normalized', 'vms.events_normalized', 'tips.anonymous_raw', 'mart.bit_case_briefing_features'],
      confidence: 92,
    };
  }

  if (q.includes('officer') && (q.includes('load') || q.includes('training'))) {
    return {
      available: true,
      name: 'Officers — high incident load + low training hours',
      chips: [
        { id: 'c1', label: 'YTD primary-on incidents > 80', kind: 'aggregate' },
        { id: 'c2', label: 'Training hours YTD < 24', kind: 'filter' },
      ],
      sampleMemberIds: ['OFC-0124', 'OFC-0130', 'OFC-0145'],
      estimatedCount: 3,
      datasets: ['mart.officer_workload_daily'],
      confidence: 86,
    };
  }

  return {
    available: true,
    name: 'New cohort',
    chips: [{ id: 'c1', label: prompt, kind: 'filter' }],
    sampleMemberIds: [],
    estimatedCount: 0,
    datasets: [],
    confidence: 35,
  };
}

// =========================================================================
// buildDashboardFromNL — NL prompt → staggered dashboard
// =========================================================================

export interface AIDashboardBuildResult {
  available: boolean;
  name: string;
  widgets: DashboardWidget[];
  rationale: string;
  confidence: number;
}

export function buildDashboardFromNL(prompt: string): AIDashboardBuildResult {
  const q = prompt.toLowerCase().trim();

  if (q.includes('eoc') || q.includes('activation') || q.includes('runbook')) {
    return {
      available: true,
      name: 'EOC operational readiness',
      rationale: 'Prompt referenced EOC + activations. Building a 6-widget grid with KPIs + delivery line chart + open-activations table.',
      confidence: 92,
      widgets: [
        { id: 'w1', kind: 'kpi', title: 'Active activations', span: 3, staggerMs: 0, value: '1', hint: 'partial level' },
        { id: 'w2', kind: 'kpi', title: 'Buildings in lockdown', span: 3, staggerMs: 200, value: '4', hint: 'under EOC-2026-013' },
        { id: 'w3', kind: 'kpi', title: 'Delivery rate (30d)', span: 3, staggerMs: 400, value: '96.4%', hint: 'P95 11s SMS' },
        { id: 'w4', kind: 'kpi', title: 'Generators not normal', span: 3, staggerMs: 600, value: '1', hint: '1 failed (WW4)' },
        { id: 'w5', kind: 'line-chart', title: 'Campaigns sent (90d)', span: 6, staggerMs: 800, sparkline: [3, 1, 0, 2, 4, 1, 0, 1, 2, 3, 1, 2, 0, 1, 4, 2, 1, 0, 2, 1, 3, 1, 0, 2, 4, 1, 0, 1, 2, 3] },
        { id: 'w6', kind: 'table', title: 'Open activations', span: 6, staggerMs: 1000, hint: '1 row · EOC-2026-013 / partial / 17m elapsed' },
      ],
    };
  }

  if (q.includes('clery') || q.includes('asr') || q.includes('annual security')) {
    return {
      available: true,
      name: 'Clery — ASR overview',
      rationale: 'Prompt referenced Clery / ASR. Building a 6-widget grid with completeness KPIs + status bar chart + geography donut.',
      confidence: 89,
      widgets: [
        { id: 'w1', kind: 'kpi', title: 'ASR completeness (2025)', span: 3, staggerMs: 0, value: '73%', hint: '58 / 80 cells' },
        { id: 'w2', kind: 'kpi', title: 'Timely Warnings (12mo)', span: 3, staggerMs: 200, value: '5 issued', hint: 'avg 39m to issue' },
        { id: 'w3', kind: 'kpi', title: 'FOIA open', span: 3, staggerMs: 400, value: '11', hint: '1 past due' },
        { id: 'w4', kind: 'kpi', title: 'NIBRS last submit', span: 3, staggerMs: 600, value: 'accepted', hint: 'M-03-2026' },
        { id: 'w5', kind: 'bar-chart', title: 'ASR cells by status', span: 8, staggerMs: 800, sparkline: [58, 4, 12, 6], hint: 'reviewed · awaiting · open · submitted' },
        { id: 'w6', kind: 'donut', title: 'Clery geography mix', span: 4, staggerMs: 1000, sparkline: [36, 8, 1, 3] },
      ],
    };
  }

  if (q.includes('bit') || q.includes('care') || q.includes('nabita')) {
    return {
      available: true,
      name: 'BIT weekly review',
      rationale: 'Prompt referenced BIT / NaBITA. Building a 6-widget grid with tier counts + tier movement + reviews-due + recent insights.',
      confidence: 90,
      widgets: [
        { id: 'w1', kind: 'kpi', title: 'Open cases', span: 3, staggerMs: 0, value: '23', hint: 'all tiers' },
        { id: 'w2', kind: 'kpi', title: 'Critical + elevated', span: 3, staggerMs: 200, value: '5', hint: '1c · 4e' },
        { id: 'w3', kind: 'kpi', title: 'Reviews due this week', span: 3, staggerMs: 400, value: '7', hint: 'BIT-2026-0067 included' },
        { id: 'w4', kind: 'kpi', title: 'Tier changes (7d)', span: 3, staggerMs: 600, value: '4' },
        { id: 'w5', kind: 'donut', title: 'Cases by NaBITA tier', span: 4, staggerMs: 800, sparkline: [1, 4, 10, 8] },
        { id: 'w6', kind: 'insight-feed', title: 'Recent Thread A insights', span: 8, staggerMs: 1000, hint: '3 RCA / prediction / anomaly insights' },
      ],
    };
  }

  return {
    available: true,
    name: 'Custom dashboard',
    rationale: 'Prompt did not map to a known template; generated a 4-KPI starter grid.',
    confidence: 40,
    widgets: [
      { id: 'w1', kind: 'kpi', title: 'KPI 1', span: 3, staggerMs: 0, value: '—' },
      { id: 'w2', kind: 'kpi', title: 'KPI 2', span: 3, staggerMs: 200, value: '—' },
      { id: 'w3', kind: 'kpi', title: 'KPI 3', span: 3, staggerMs: 400, value: '—' },
      { id: 'w4', kind: 'kpi', title: 'KPI 4', span: 3, staggerMs: 600, value: '—' },
    ],
  };
}

// =========================================================================
// expandInsight — narrative expansion + next-step recommendations
// =========================================================================

export interface AIInsightExpansion {
  available: boolean;
  insightId: string;
  /** Extended narrative paragraph. */
  expandedNarrative: string;
  /** Recommended next steps. */
  recommendedActions: { description: string; ownerRole: RoleId; horizonHours: number }[];
  /** Linked routes for quick navigation. */
  quickLinks: { label: string; route: string }[];
}

export function expandInsight(insightId: string): AIInsightExpansion {
  // Three canned expansions for the Thread A insight IDs; deflection otherwise.
  if (insightId === 'INS-THREAD-A-RCA') {
    return {
      available: true,
      insightId,
      expandedNarrative:
        'The convergence is the pattern. Five independent data signals — access-control swipes, camera analytics, anonymous tips, ' +
        'prior conduct cases, and an LMS engagement drop — all point to the same six-month window centered on BLD-CARTER-HALL. ' +
        'No single signal would clear a threshold on its own. The platform\'s identity-resolution graph + the BIT case-feature ' +
        'mart are the surfaces that made the joining feasible. Recommended next step: bring the case into next week\'s BIT review ' +
        'with the supportive-measure coordination already pre-staged with Title IX.',
      recommendedActions: [
        { description: 'Add BIT-2026-0067 to next week\'s standing meeting agenda', ownerRole: 'bit-chair', horizonHours: 120 },
        { description: 'Verify supportive-measure overlap with Title IX coordinator', ownerRole: 'title-ix-coordinator', horizonHours: 72 },
        { description: 'Continue welfare-check cadence on building of concern', ownerRole: 'chief-of-police', horizonHours: 168 },
      ],
      quickLinks: [
        { label: 'Open BIT case', route: '/bit/BIT-2026-0067' },
        { label: 'Subject person 360', route: '/persons/PER-008470' },
        { label: 'Building intelligence overlay', route: '/access/buildings/BLD-CARTER-HALL' },
      ],
    };
  }

  if (insightId === 'INS-THREAD-A-RISK') {
    return {
      available: true,
      insightId,
      expandedNarrative:
        'The classifier scored Subject + Target dimensions in the upper-moderate band with Precipitating Events trending up. ' +
        'A 30-day forward projection — given current support-plan actions — flattens the trajectory within 14 days. Without ' +
        'intervention the model projects continued escalation. Recommended next step: accelerate the support-plan timeline and ' +
        'consider an escalation to active-review status.',
      recommendedActions: [
        { description: 'Schedule BIT team review within 5 days', ownerRole: 'bit-chair', horizonHours: 120 },
        { description: 'Outreach call to subject — voluntary counseling referral', ownerRole: 'dean-of-students', horizonHours: 72 },
      ],
      quickLinks: [
        { label: 'Open BIT case', route: '/bit/BIT-2026-0067' },
        { label: 'Run AI briefing', route: '/persons/PER-008470' },
      ],
    };
  }

  if (insightId === 'INS-THREAD-A-ANOM') {
    return {
      available: true,
      insightId,
      expandedNarrative:
        'The anomaly is the single-cardholder concentration. Of the 47 unusual-building events at DOR-CARTER-MAIN-S in the past ' +
        '60 days, all 47 are attributable to a single OneCard token. The next-highest cardholder generated 3 events. The cadence ' +
        'has tightened — from one event every 4–5 days to one every 36 hours in the last two weeks.',
      recommendedActions: [
        { description: 'Review camera footage from the most-recent two events', ownerRole: 'chief-of-police', horizonHours: 48 },
      ],
      quickLinks: [
        { label: 'Building intelligence overlay', route: '/access/buildings/BLD-CARTER-HALL' },
        { label: 'Camera detail', route: '/cameras/CAM-CARTER-N3' },
      ],
    };
  }

  return {
    available: true,
    insightId,
    expandedNarrative: 'No detailed expansion available for this insight in R9. The corpus expands in production.',
    recommendedActions: [],
    quickLinks: [],
  };
}

export function ferpaDecisionAid(caseId: string): AIFerpaDecisionAid {
  return {
    available: true,
    recommendation: 'notify',
    headline:
      'Subject is under 21 and case is a substance-policy violation. §99.31(a)(15) basis applies — notification ' +
      'is permissible and aligned with policy POL-FERPA-99-31.',
    prongs: [
      {
        citation: '99.31(a)(15)-alcohol-drug-under-21',
        applicable: true,
        rationale: 'Case ' + caseId + ': substance subtype + subject age verified under 21.',
      },
      {
        citation: '99.31(a)(10)-health-safety-emergency',
        applicable: false,
        rationale: 'No articulable imminent health/safety emergency present; rely on the (a)(15) basis instead.',
      },
    ],
  };
}
