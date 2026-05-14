/**
 * Data Quality console — 40 rules across the six dimensions
 *  (accuracy, completeness, consistency, timeliness, uniqueness, validity).
 *
 * Each row is a per-dataset, per-field rule with: severity, last outcome,
 * 7-day trend, affected-row count when failing, and a threshold description.
 *
 * The Quality Console at /quality renders these. Failing rules become
 * quarantine candidates (R2+); for R1 we just surface them.
 */

import type { QualityRule } from '@/lib/types';

/** Extended quality-rule row used by the Quality console — links to dataset. */
export interface DqRuleRow extends QualityRule {
  datasetId: string;
  field: string;
}

export const DQ_RULES: DqRuleRow[] = [
  // ----- cad.events_raw -----
  { id: 'dq-cad-1', datasetId: 'cad.events_raw', field: 'cad_event_uuid', description: 'CAD event UUID not null', dimension: 'completeness', severity: 'critical', passed: true, trend7d: [true, true, true, true, true, true, true] },
  { id: 'dq-cad-2', datasetId: 'cad.events_raw', field: 'event_at', description: 'Event timestamp within last 72h', dimension: 'timeliness', severity: 'critical', passed: true, trend7d: [true, true, true, true, true, true, true] },
  { id: 'dq-cad-3', datasetId: 'cad.events_raw', field: 'cfs_number', description: 'CFS number matches CFS-YYYY-##### pattern', dimension: 'validity', severity: 'warning', passed: true, trend7d: [true, true, true, true, true, true, true] },
  { id: 'dq-cad-4', datasetId: 'cad.events_raw', field: 'priority', description: 'Priority in {1, 2, 3, 4}', dimension: 'validity', severity: 'critical', passed: true, trend7d: [true, true, true, true, true, true, true] },
  { id: 'dq-cad-5', datasetId: 'cad.events_raw', field: 'reported_lat,reported_lng', description: 'Geocoded lat/lng within plausible campus bbox', dimension: 'accuracy', severity: 'warning', passed: true, trend7d: [true, true, true, true, true, true, true] },

  // ----- rms.case_raw -----
  { id: 'dq-rms-1', datasetId: 'rms.case_raw', field: 'case_uuid', description: 'RMS case UUID not null', dimension: 'completeness', severity: 'critical', passed: true, trend7d: [true, true, true, true, true, true, true] },
  { id: 'dq-rms-2', datasetId: 'rms.case_raw', field: 'opened_at', description: 'Opened-at not null and not in future', dimension: 'validity', severity: 'critical', passed: true, trend7d: [true, true, true, true, true, true, true] },
  { id: 'dq-rms-3', datasetId: 'rms.case_raw', field: 'status', description: 'Status in {open, pending, closed, unfounded, inactive}', dimension: 'validity', severity: 'critical', passed: true, trend7d: [true, true, true, true, true, true, true] },

  // ----- acs.door_events_raw -----
  { id: 'dq-acs-1', datasetId: 'acs.door_events_raw', field: 'door_event_id', description: 'Door event ID unique', dimension: 'uniqueness', severity: 'critical', passed: true, trend7d: [true, true, true, true, true, true, true] },
  { id: 'dq-acs-2', datasetId: 'acs.door_events_raw', field: 'event_at', description: 'Event timestamp not in future, within last 24h', dimension: 'timeliness', severity: 'critical', passed: true, trend7d: [true, true, true, true, true, true, true] },
  { id: 'dq-acs-3', datasetId: 'acs.door_events_raw', field: 'door_id', description: 'Door ID resolves to door registry', dimension: 'consistency', severity: 'warning', passed: true, trend7d: [true, true, true, true, true, true, true] },
  { id: 'dq-acs-4', datasetId: 'acs.door_events_raw', field: 'event_kind', description: 'Event kind in enum', dimension: 'validity', severity: 'critical', passed: true, trend7d: [true, true, true, true, true, true, true] },

  // ----- vms.camera_events_raw — Thread A degradation -----
  { id: 'dq-vms-1', datasetId: 'vms.camera_events_raw', field: 'vms_event_uuid', description: 'VMS event UUID not null', dimension: 'completeness', severity: 'critical', passed: true, trend7d: [true, true, true, true, true, true, true] },
  { id: 'dq-vms-2', datasetId: 'vms.camera_events_raw', field: 'camera_id', description: 'Camera ID resolves to camera registry', dimension: 'consistency', severity: 'warning', passed: false, trend7d: [true, true, false, true, true, true, false], affectedRows: 42, thresholdDescription: '< 1% unresolved' },
  { id: 'dq-vms-3', datasetId: 'vms.camera_events_raw', field: 'confidence', description: 'Confidence in [0, 1]', dimension: 'validity', severity: 'critical', passed: true, trend7d: [true, true, true, true, true, true, true] },
  { id: 'dq-vms-4', datasetId: 'vms.camera_events_raw', field: 'analytic_kind', description: 'Analytic kind in enum', dimension: 'validity', severity: 'critical', passed: true, trend7d: [true, true, true, true, true, true, true] },

  // ----- mnp.alert_dispatch_raw -----
  { id: 'dq-mnp-1', datasetId: 'mnp.alert_dispatch_raw', field: 'dispatch_uuid', description: 'Dispatch UUID unique', dimension: 'uniqueness', severity: 'critical', passed: true, trend7d: [true, true, true, true, true, true, true] },
  { id: 'dq-mnp-2', datasetId: 'mnp.alert_dispatch_raw', field: 'channel', description: 'Channel in enum', dimension: 'validity', severity: 'critical', passed: true, trend7d: [true, true, true, true, true, true, true] },
  { id: 'dq-mnp-3', datasetId: 'mnp.alert_dispatch_raw', field: 'delivery_status', description: 'Delivery status in enum', dimension: 'validity', severity: 'critical', passed: true, trend7d: [true, true, true, true, true, true, true] },

  // ----- sis.enrollment_roster_raw -----
  { id: 'dq-sis-1', datasetId: 'sis.enrollment_roster_raw', field: 'sis_id', description: 'SIS ID unique', dimension: 'uniqueness', severity: 'critical', passed: true, trend7d: [true, true, true, true, true, true, true] },
  { id: 'dq-sis-2', datasetId: 'sis.enrollment_roster_raw', field: 'directory_info_optout', description: 'Directory-info opt-out flag populated', dimension: 'completeness', severity: 'critical', passed: true, trend7d: [true, true, true, true, true, true, true] },
  { id: 'dq-sis-3', datasetId: 'sis.enrollment_roster_raw', field: 'enrollment_status', description: 'Enrollment status in enum', dimension: 'validity', severity: 'critical', passed: true, trend7d: [true, true, true, true, true, true, true] },
  { id: 'dq-sis-4', datasetId: 'sis.enrollment_roster_raw', field: 'housing_assignment', description: 'Housing assignment resolves to building registry', dimension: 'consistency', severity: 'warning', passed: true, trend7d: [true, true, true, true, true, true, true] },

  // ----- housing.assignment_raw -----
  { id: 'dq-hou-1', datasetId: 'housing.assignment_raw', field: 'assignment_uuid', description: 'Assignment UUID unique', dimension: 'uniqueness', severity: 'critical', passed: true, trend7d: [true, true, true, true, true, true, true] },
  { id: 'dq-hou-2', datasetId: 'housing.assignment_raw', field: 'designated_contact_phone_hash', description: 'Designated contact populated (Clery MSNP)', dimension: 'completeness', severity: 'warning', passed: true, trend7d: [true, true, true, true, true, true, true] },

  // ----- bit.case_raw — Thread A staleness -----
  { id: 'dq-bit-1', datasetId: 'bit.case_raw', field: 'bit_case_id', description: 'BIT case ID not null', dimension: 'completeness', severity: 'critical', passed: true, trend7d: [true, true, true, true, true, true, true] },
  { id: 'dq-bit-2', datasetId: 'bit.case_raw', field: 'last_reviewed_at', description: 'Last review within last 14d', dimension: 'timeliness', severity: 'warning', passed: false, trend7d: [true, true, true, false, false, false, false], affectedRows: 22, thresholdDescription: '22 cases past 14d review window' },
  { id: 'dq-bit-3', datasetId: 'bit.case_raw', field: 'risk_level', description: 'Risk level in enum', dimension: 'validity', severity: 'critical', passed: true, trend7d: [true, true, true, true, true, true, true] },

  // ----- tix.intake_raw (walled) -----
  { id: 'dq-tix-1', datasetId: 'tix.intake_raw', field: 'tix_case_id', description: 'Title IX case ID unique', dimension: 'uniqueness', severity: 'critical', passed: true, trend7d: [true, true, true, true, true, true, true] },
  { id: 'dq-tix-2', datasetId: 'tix.intake_raw', field: 'intake_at', description: 'Intake timestamp within retention window', dimension: 'timeliness', severity: 'critical', passed: true, trend7d: [true, true, true, true, true, true, true] },

  // ----- incidents.conformed — Thread C anchor -----
  { id: 'dq-inc-1', datasetId: 'incidents.conformed', field: 'incident_id', description: 'Incident ID unique', dimension: 'uniqueness', severity: 'critical', passed: true, trend7d: [true, true, true, true, true, true, true] },
  { id: 'dq-inc-2', datasetId: 'incidents.conformed', field: 'clery_geography_class', description: 'Clery geography class populated', dimension: 'completeness', severity: 'critical', passed: true, trend7d: [true, true, true, true, true, true, true] },
  { id: 'dq-inc-3', datasetId: 'incidents.conformed', field: 'nibrs_offense_codes', description: 'NIBRS codes populated for reportable', dimension: 'completeness', severity: 'warning', passed: false, trend7d: [true, true, true, false, false, false, false], affectedRows: 14, thresholdDescription: '14 reportable incidents missing NIBRS' },

  // ----- access.events_normalized -----
  { id: 'dq-an-1', datasetId: 'access.events_normalized', field: 'person_id', description: 'Person ID resolves where cardholder present', dimension: 'consistency', severity: 'warning', passed: false, trend7d: [true, true, true, true, false, true, false], affectedRows: 188, thresholdDescription: '< 1% unresolved cardholders' },
  { id: 'dq-an-2', datasetId: 'access.events_normalized', field: 'building_id', description: 'Building ID resolves to building registry', dimension: 'consistency', severity: 'critical', passed: true, trend7d: [true, true, true, true, true, true, true] },

  // ----- psm.persons_resolved -----
  { id: 'dq-psm-1', datasetId: 'psm.persons_resolved', field: 'merge_confidence', description: 'Merge confidence ≥ 80', dimension: 'accuracy', severity: 'critical', passed: true, trend7d: [true, true, true, true, true, true, true] },
  { id: 'dq-psm-2', datasetId: 'psm.persons_resolved', field: 'steward_review_queue', description: 'Steward review queue < 0.5% of records', dimension: 'accuracy', severity: 'warning', passed: false, trend7d: [true, true, true, true, false, false, false], affectedRows: 412, thresholdDescription: '0.71% queued; threshold 0.5%' },

  // ----- mart.incident_360 -----
  { id: 'dq-i360-1', datasetId: 'mart.incident_360', field: 'response_time_minutes', description: 'Response time ≥ 0', dimension: 'validity', severity: 'critical', passed: true, trend7d: [true, true, true, true, true, true, true] },
  { id: 'dq-i360-2', datasetId: 'mart.incident_360', field: 'clery_reportable', description: 'Clery reportable flag matches silver classification', dimension: 'consistency', severity: 'critical', passed: true, trend7d: [true, true, true, true, true, true, true] },

  // ----- mart.clery_asr_workspace — Thread C staleness -----
  { id: 'dq-asr-1', datasetId: 'mart.clery_asr_workspace', field: 'all', description: 'Build completed within freshness window', dimension: 'timeliness', severity: 'warning', passed: false, trend7d: [true, true, true, false, false, false, false], thresholdDescription: '28h since silver Clery classifier failed; ASR mart stale' },
  { id: 'dq-asr-2', datasetId: 'mart.clery_asr_workspace', field: 'contributing_incident_ids', description: 'All incident_ids resolve to silver', dimension: 'consistency', severity: 'critical', passed: true, trend7d: [true, true, true, true, true, true, true] },

  // ----- mart.bit_case_briefing_features — Thread A propagated delay -----
  { id: 'dq-bf-1', datasetId: 'mart.bit_case_briefing_features', field: 'all', description: 'Mart refreshed within nightly freshness window', dimension: 'timeliness', severity: 'critical', passed: false, trend7d: [true, true, true, false, false, false, false], thresholdDescription: 'Upstream block from bit.cases_normalized; 12h stale' },
  { id: 'dq-bf-2', datasetId: 'mart.bit_case_briefing_features', field: 'has_title_ix_barrier_hit', description: 'Barrier indicator is boolean only (no content leak)', dimension: 'consistency', severity: 'critical', passed: true, trend7d: [true, true, true, true, true, true, true] },
];
