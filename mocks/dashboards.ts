/**
 * Saved dashboards — pre-built + AI-generated.
 *
 * Each dashboard has a 12-column grid of widgets with stagger-reveal delays
 * so the AI-builder route can play a "watch it assemble" animation.
 */

import type { Dashboard, DashboardWidget } from '@/lib/types';
import { isoSeconds, daysAgo } from '@/lib/time';

function widget(
  id: string,
  kind: DashboardWidget['kind'],
  title: string,
  span: DashboardWidget['span'],
  staggerMs: number,
  extra: Partial<DashboardWidget> = {},
): DashboardWidget {
  return { id, kind, title, span, staggerMs, ...extra };
}

const cleryDash: Dashboard = {
  id: 'DSH-CLERY-OVERVIEW',
  name: 'Clery — Annual Security Report overview',
  description: 'ASR completeness, Timely Warning ledger posture, FOIA queue.',
  ownerRole: 'clery-officer',
  promptSource: 'Build a Clery overview: ASR completeness, Timely Warnings, FOIA queue, last NIBRS submission status',
  isPinned: true,
  createdAt: isoSeconds(daysAgo(35)),
  widgets: [
    widget('w1', 'kpi', 'ASR completeness (2025)', 3, 0, { value: '73%', hint: '58 / 80 cells reviewed', datasetId: 'mart.clery_asr_workspace' }),
    widget('w2', 'kpi', 'Timely Warnings issued (12mo)', 3, 180, { value: '5', hint: 'avg 39m to issue', datasetId: 'mart.timely_warning_decisions' }),
    widget('w3', 'kpi', 'FOIA open requests', 3, 360, { value: '11', hint: '1 past due', datasetId: 'foia.requests_normalized' }),
    widget('w4', 'kpi', 'NIBRS last submission', 3, 540, { value: 'accepted', hint: 'M-03-2026', datasetId: 'nibris.export_history_raw' }),
    widget('w5', 'bar-chart', 'ASR cells by status', 8, 720, { hint: 'reviewed · awaiting · open · submitted', sparkline: [58, 4, 12, 6] }),
    widget('w6', 'donut', 'Clery geography mix', 4, 900, { hint: '36 on-campus · 8 residential · 1 non-campus · 3 public', sparkline: [36, 8, 1, 3] }),
  ],
  classification: 'public',
};

const eocDash: Dashboard = {
  id: 'DSH-EOC-OPS',
  name: 'EOC — Operational readiness',
  description: 'Active activations, runbook progress, mass-notification posture, generator health.',
  ownerRole: 'eoc-director',
  promptSource: 'Build an EOC dashboard: activations, runbook progress, notification delivery, generators',
  isPinned: true,
  createdAt: isoSeconds(daysAgo(22)),
  widgets: [
    widget('w1', 'kpi', 'Active activations', 3, 0, { value: '1', hint: 'partial level', datasetId: 'mart.bit_case_briefing_features' }),
    widget('w2', 'kpi', 'Buildings in lockdown', 3, 180, { value: '4', hint: 'under EOC-2026-013' }),
    widget('w3', 'kpi', 'Notifications delivery (30d)', 3, 360, { value: '96.4%', hint: 'P95 11s SMS' }),
    widget('w4', 'kpi', 'Generators not normal', 3, 540, { value: '1', hint: '1 failed (WW4)' }),
    widget('w5', 'line-chart', 'Campaigns sent (90d)', 6, 720, { sparkline: [3, 1, 0, 2, 4, 1, 0, 1, 2, 3, 1, 2, 0, 1, 4, 2, 1, 0, 2, 1, 3, 1, 0, 2, 4, 1, 0, 1, 2, 3] }),
    widget('w6', 'table', 'Open activations table', 6, 900, { hint: '1 row · EOC-2026-013 / partial / 17m elapsed' }),
  ],
  classification: 'internal',
};

const bitDash: Dashboard = {
  id: 'DSH-BIT-WEEKLY',
  name: 'BIT — Weekly case review',
  description: 'NaBITA tier distribution, risk-tier changes, support-plan posture.',
  ownerRole: 'bit-chair',
  promptSource: 'Build a BIT weekly review: tier counts, tier movement, plan completion',
  isPinned: false,
  createdAt: isoSeconds(daysAgo(7)),
  widgets: [
    widget('w1', 'kpi', 'Open cases', 3, 0, { value: '23', hint: 'all tiers' }),
    widget('w2', 'kpi', 'Critical + elevated', 3, 180, { value: '5', hint: '1 critical · 4 elevated' }),
    widget('w3', 'kpi', 'Reviews due this week', 3, 360, { value: '7', hint: 'BIT-2026-0067 included' }),
    widget('w4', 'kpi', 'Tier changes (7d)', 3, 540, { value: '4', hint: 'rising + falling' }),
    widget('w5', 'donut', 'Cases by NaBITA tier', 4, 720, { sparkline: [1, 4, 10, 8] }),
    widget('w6', 'insight-feed', 'Recent Thread A insights', 8, 900, { hint: '3 RCA / prediction / anomaly insights' }),
  ],
  classification: 'ferpa-edu-record',
};

const ceoDash: Dashboard = {
  id: 'DSH-EXEC-CAMPUS',
  name: 'Executive — Campus safety summary',
  description: 'Aggregate-only KPIs for the President + Provost.',
  ownerRole: 'executive',
  isPinned: true,
  createdAt: isoSeconds(daysAgo(60)),
  widgets: [
    widget('w1', 'kpi', 'Incidents (rolling 12mo)', 3, 0, { value: '~600', hint: 'across all classifications' }),
    widget('w2', 'kpi', 'BIT cases — open', 3, 180, { value: '23', hint: '4 NaBITA tiers' }),
    widget('w3', 'kpi', 'Clery audit posture', 3, 360, { value: 'green', hint: '73% ASR completeness' }),
    widget('w4', 'kpi', 'Active EOC activations', 3, 540, { value: '1', hint: 'partial level' }),
    widget('w5', 'line-chart', 'Incidents per day (90d)', 8, 720, { sparkline: [4, 6, 5, 8, 7, 4, 5, 9, 8, 6, 7, 5, 4, 8, 9, 7, 6, 5, 4, 8, 7, 6, 5, 9, 8, 7, 6, 5, 8, 7] }),
    widget('w6', 'donut', 'By call-type family', 4, 900, { sparkline: [120, 80, 60, 90, 40] }),
  ],
  classification: 'public',
};

export const DASHBOARDS: Dashboard[] = [cleryDash, eocDash, bitDash, ceoDash];
