/**
 * AI-generated insights — Thread A canonical set plus filler.
 *
 * Three insight kinds per §19:
 *   rca         — Root-cause analysis (e.g. "why did this BIT case escalate?")
 *   prediction  — Future-state estimate with confidence (e.g. "30-day risk trend")
 *   anomaly     — Standalone alert (e.g. "47 after-hours swipes on a single door")
 *
 * Thread A ships three insights — one of each kind — all attributed to a
 * specific model + version so the dashboard renders prediction attribution.
 */

import type { Insight } from '@/lib/types';
import { isoSeconds, daysAgo, hoursAgo } from '@/lib/time';
import { rng, randInt, pick } from '@/lib/seed';
import { THREAD_A_BIT_CASE_ID, THREAD_A_SUBJECT_PERSON_ID } from './threads';

const r = rng('insights-v1');

// =========================================================================
// Thread A — three canonical insights
// =========================================================================

const threadAInsights: Insight[] = [
  {
    id: 'INS-THREAD-A-RCA',
    kind: 'rca',
    title:
      'Six-month pattern at Carter Hall — convergent signal across access, surveillance, tips and conduct',
    narrative:
      'Subject ' + THREAD_A_SUBJECT_PERSON_ID + ' has accumulated 47 after-hours card-swipes at a non-residence ' +
      'building, 11 corroborating camera-analytic loitering events, and six anonymous ' +
      'tips matched via shared reporting device — over a six-month period that no single ' +
      'team had visibility into. The conduct + welfare-check history (closed) and the ' +
      'walled Title IX intake (barrier-cited only) round out the picture.',
    severity: 'warning',
    affectedAssets: [THREAD_A_SUBJECT_PERSON_ID, THREAD_A_BIT_CASE_ID, 'BLD-CARTER-HALL'],
    evidenceDatasetIds: [
      'access.events_normalized',
      'vms.events_normalized',
      'tips.anonymous_raw',
      'bit.cases_normalized',
      'incidents.conformed',
    ],
    contributors: [
      {
        label: 'Access anomaly cluster (47 swipes, 22:00–02:00)',
        weightPct: 30,
        rationale: 'Carter Hall main entry, unusual-building flag set for cardholder',
        evidenceDatasetIds: ['access.events_normalized'],
        linkedRoute: '/access/buildings/BLD-CARTER-HALL',
      },
      {
        label: 'Camera loitering events (11, same window)',
        weightPct: 20,
        rationale: 'CAM-CARTER-N3 — confidence range 0.78–0.92',
        evidenceDatasetIds: ['vms.events_normalized'],
        linkedRoute: '/cameras/CAM-CARTER-N3',
      },
      {
        label: 'Anonymous tips (6, device-id matched)',
        weightPct: 18,
        rationale: 'Shared device-id dev-9c4f7b21 (probabilistic, 84% match)',
        evidenceDatasetIds: ['tips.anonymous_raw'],
      },
      {
        label: 'Prior conduct (2 cases, same building of concern)',
        weightPct: 22,
        rationale: 'Substance + residential subtypes — pattern marker',
        evidenceDatasetIds: ['bit.cases_normalized'],
      },
      {
        label: 'Walled Title IX intake (barrier-cited)',
        weightPct: 10,
        rationale: 'Content withheld per IB-TIX-TO-PD-HARD',
        evidenceDatasetIds: [],
      },
    ],
    createdAt: isoSeconds(hoursAgo(6)),
    classification: 'ferpa-edu-record',
    threadTag: 'A',
  },
  {
    id: 'INS-THREAD-A-RISK',
    kind: 'prediction',
    title: 'NaBITA risk projection — elevated, trending higher over the next 30 days',
    narrative:
      'The structured-professional-judgment rubric scores Subject + Target dimensions ' +
      'in the upper-moderate range, with Precipitating Events trending up. Without ' +
      'intervention the model projects continued escalation; with current support-plan ' +
      'actions the trajectory flattens within 14 days.',
    severity: 'warning',
    affectedAssets: [THREAD_A_BIT_CASE_ID, THREAD_A_SUBJECT_PERSON_ID],
    evidenceDatasetIds: ['mart.bit_case_briefing_features'],
    prediction: {
      modelName: 'BIT-RiskClassifier-NaBITA',
      modelVersion: 'v0.3.2',
      modelKind: 'classifier',
      confidence: 71,
      confidenceInterval: [64, 78],
      scoredAt: isoSeconds(hoursAgo(6)),
      features: [
        { name: 'access_anomalies_60d',     value: 47,  importancePct: 30, hint: 'After-hours swipes at non-residence building' },
        { name: 'camera_loitering_30d',     value: 11,  importancePct: 18, hint: 'Corroborating analytics' },
        { name: 'tip_volume_45d',           value: 6,   importancePct: 17 },
        { name: 'prior_conduct_subtypes',   value: 2,   importancePct: 14 },
        { name: 'lms_engagement_delta_pct', value: -38, importancePct: 11, hint: 'Engagement drop vs. 90-day baseline' },
        { name: 'welfare_checks_90d',       value: 1,   importancePct: 5  },
        { name: 'walled_intake_flag',       value: 1,   importancePct: 5, hint: 'Barrier-only signal (TIX-2026-0014)' },
      ],
      recommendedActions: [
        { description: 'Schedule BIT team review within 5 days', horizonHours: 120, ownerRole: 'bit-chair' },
        { description: 'Coordinate supportive measures with Title IX', horizonHours: 72, ownerRole: 'title-ix-coordinator' },
        { description: 'Continue welfare-check cadence on building of concern', horizonHours: 168, ownerRole: 'chief-of-police' },
      ],
    },
    createdAt: isoSeconds(hoursAgo(6)),
    classification: 'ferpa-edu-record',
    threadTag: 'A',
  },
  {
    id: 'INS-THREAD-A-ANOM',
    kind: 'anomaly',
    title: '47 after-hours card-swipes at DOR-CARTER-MAIN-S over 60 days',
    narrative:
      'A single OneCard token has triggered the unusual-building heuristic at the ' +
      'same door 47 times in 60 days, clustered between 22:00–02:00. The cardholder ' +
      'does not reside in this building. Median between-event gap: 36 hours.',
    severity: 'warning',
    affectedAssets: ['DOR-CARTER-MAIN-S', THREAD_A_SUBJECT_PERSON_ID, 'BLD-CARTER-HALL'],
    evidenceDatasetIds: ['access.events_normalized'],
    createdAt: isoSeconds(daysAgo(2)),
    classification: 'pii',
    threadTag: 'A',
  },
];

// =========================================================================
// Filler insights for the /insights list — non-Thread-A, low-detail
// =========================================================================

const filler: Insight[] = [];
for (let i = 0; i < 6; i++) {
  const kind: Insight['kind'] = pick(r, ['rca', 'prediction', 'anomaly']);
  filler.push({
    id: `INS-FILL-${i.toString().padStart(3, '0')}`,
    kind,
    title:
      kind === 'rca'
        ? 'Dispatch queue latency spike — root cause linked to NIBRS classifier rerun'
        : kind === 'prediction'
        ? '7-day blue-light heartbeat failure projection: 1 device at risk'
        : 'Unusual after-hours access cluster in west-quad service corridor',
    narrative: 'Auto-generated insight from the platform AI surface; details elided in this list view.',
    severity: pick(r, ['info', 'warning', 'critical']),
    affectedAssets: [],
    evidenceDatasetIds: [],
    createdAt: isoSeconds(daysAgo(randInt(r, 1, 14))),
    classification: 'internal',
  });
}

export const INSIGHTS: Insight[] = [...threadAInsights, ...filler];

export const THREAD_A_INSIGHTS = threadAInsights;
