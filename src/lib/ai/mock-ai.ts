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
 * Later phases extend:
 *   R7  — classifyCleryEvent, cleryCopilot
 *   R8  — conductCopilot, parentalNotifFerpaAid, hazingClassifier, amnestyAid
 *   R9  — askPlatform, cohortFromNL, buildDashboardFromNL
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
} from '../../../mocks/threads';
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
      reply: 'Conversational copilot is enabled for a single demo case in R5 (BIT-2026-0067). The full corpus lands in R9.',
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
        'EOC copilot is enabled for the active Thread B activation in R6 (EOC-2026-013). The full corpus lands in R9.',
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
