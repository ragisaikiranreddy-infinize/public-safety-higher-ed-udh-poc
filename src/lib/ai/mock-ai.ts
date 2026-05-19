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
 * Later phases extend:
 *   R6  — eocCopilot, draftAAR
 *   R7  — classifyCleryEvent, cleryCopilot
 *   R8  — conductCopilot, parentalNotifFerpaAid, hazingClassifier, amnestyAid
 *   R9  — askPlatform, cohortFromNL, buildDashboardFromNL
 */

import type { Classification, RoleId } from '../types';
import {
  THREAD_A_SUBJECT_PERSON_ID,
  THREAD_A_BIT_CASE_ID,
  THREAD_A_BUILDING_OF_CONCERN_ID,
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
