/**
 * Sole import surface for `/mocks/*`.
 *
 * Routes and components MUST NOT import from `/mocks/*` directly. This file
 * is the swap-point — in production it becomes a thin REST/GraphQL client.
 *
 * Grep-enforced at release:
 *   rg "from ['\"]\\.\\./mocks" src        # must return empty
 *   rg "from ['\"]\\.\\./\\.\\./mocks" src # must return empty
 *
 * R1 surface: geographies + medallion catalog (45 datasets) + 22 sources +
 * 28 pipeline runs + 18 metrics + 40 DQ rules + computed helpers.
 */

// ----- raw re-exports ------------------------------------------------------
export { REGIONS } from '../../../mocks/regions';
export { BUILDINGS, CAMPUS_ANCHOR } from '../../../mocks/buildings';
export { RESIDENCE_HALLS } from '../../../mocks/residence-halls';
export { BEATS } from '../../../mocks/beats';
export { DOMAINS } from '../../../mocks/domains';
export { SOURCES } from '../../../mocks/sources';
export { DATASETS, LAYER_COUNTS } from '../../../mocks/datasets';
export { PIPELINES, LAYER_STATUSES } from '../../../mocks/pipelines';
export { DQ_RULES } from '../../../mocks/dq-rules';
export type { DqRuleRow } from '../../../mocks/dq-rules';
export { METRICS } from '../../../mocks/metrics';
export * from '../../../mocks/threads';
export { PERSONS } from '../../../mocks/persons';
export { OFFICERS } from '../../../mocks/officers';
export { UNITS } from '../../../mocks/units';
export { VEHICLES } from '../../../mocks/vehicles';
export { NO_CONTACT_ORDERS, TRESPASS_ORDERS } from '../../../mocks/no-contact-orders';
export { INCIDENTS } from '../../../mocks/incidents';
export { CASES } from '../../../mocks/cases';
export { CAMERAS } from '../../../mocks/cameras';
export { DOORS } from '../../../mocks/doors';
export { BLUE_LIGHTS } from '../../../mocks/blue-lights';
export { ACCESS_EVENTS, THREAD_A_AFTER_HOURS_COUNT } from '../../../mocks/access-events';
export { CAMERA_EVENTS } from '../../../mocks/camera-events';
export { BIT_CASES, THREAD_A_BIT_CASE } from '../../../mocks/bit-cases';
export { BIT_EVIDENCE, THREAD_A_BIT_EVIDENCE } from '../../../mocks/bit-evidence';
export { BIT_PLAN_ACTIONS, THREAD_A_BIT_PLAN_ACTIONS } from '../../../mocks/bit-plans';
export { TIPS, THREAD_A_TIPS } from '../../../mocks/tips';
export { LIVESAFE_CHATS, THREAD_A_LIVESAFE_CHATS } from '../../../mocks/livesafe-chats';
export { TITLE_IX_CASES, THREAD_A_TITLE_IX_CASE } from '../../../mocks/title-ix-cases';
export { CONDUCT_CASES, THREAD_A_CONDUCT_CASES } from '../../../mocks/conduct-cases';
export { SANCTIONS, THREAD_A_SANCTIONS } from '../../../mocks/sanctions';
export { EDU_PROGRAMS } from '../../../mocks/edu-programs';
export { PARENTAL_NOTIFICATIONS, THREAD_A_PARENTAL_NOTIFICATIONS } from '../../../mocks/parental-notifications';
export { INSIGHTS, THREAD_A_INSIGHTS } from '../../../mocks/insights';
export { WEATHER_ALERTS, THREAD_B_WEATHER_ALERT } from '../../../mocks/weather-alerts';
export {
  EOC_ACTIVATIONS, SIT_LOG_ENTRIES, DECISION_LOG_ENTRIES, ICS_POSITIONS,
  THREAD_B_ACTIVATION, THREAD_B_SIT_LOG, THREAD_B_DECISION_LOG,
} from '../../../mocks/eoc-activations';
export { RUNBOOKS, RUNBOOK_EXECUTIONS, THREAD_B_RUNBOOK_EXECUTION } from '../../../mocks/runbooks';
export {
  NOTIFICATION_CAMPAIGNS, THREAD_B_INITIAL_CAMPAIGN, THREAD_B_REDIRECT_CAMPAIGN,
} from '../../../mocks/notification-campaigns';
export { FIRE_PANEL_EVENTS, THREAD_B_FIRE_PRE_ALARM } from '../../../mocks/fire-panel-events';
export { BMS_ALARMS, THREAD_B_GENERATOR_FAIL_ALARM } from '../../../mocks/bms-alarms';
export { GENERATOR_STATE, THREAD_B_GENERATOR_STATE } from '../../../mocks/generator-state';
export { ENV_SENSOR_READINGS } from '../../../mocks/env-sensors';
export { SHUTTLE_ROUTES } from '../../../mocks/transit-routes';
export { TRANSIT_GPS_PINGS } from '../../../mocks/transit-gps';
export {
  CLERY_POLYGON_SETS, THREAD_C_CLERY_POLYGON_SET,
} from '../../../mocks/clery-geography';
export { CLERY_ASR_WORKSPACE, THREAD_C_ASR_ROW } from '../../../mocks/clery-asr';
export { CSA_REPORTS, THREAD_C_CSA_DISCLOSURE } from '../../../mocks/csa-reports';
export { TIMELY_WARNINGS, THREAD_C_TIMELY_WARNING } from '../../../mocks/timely-warnings';
export { NIBRIS_SUBMISSIONS } from '../../../mocks/nibris-submissions';
export { FOIA_REQUESTS, THREAD_C_FOIA_REQUEST } from '../../../mocks/foia-requests';

// ----- imports for computed helpers ---------------------------------------
import { BUILDINGS } from '../../../mocks/buildings';
import { RESIDENCE_HALLS } from '../../../mocks/residence-halls';
import { BEATS } from '../../../mocks/beats';
import { REGIONS } from '../../../mocks/regions';
import { DOMAINS } from '../../../mocks/domains';
import { SOURCES } from '../../../mocks/sources';
import { DATASETS } from '../../../mocks/datasets';
import { PIPELINES } from '../../../mocks/pipelines';
import { DQ_RULES } from '../../../mocks/dq-rules';
import { METRICS } from '../../../mocks/metrics';
import { getRegisteredSources } from '../source-store';
import { PERSONS } from '../../../mocks/persons';
import { OFFICERS } from '../../../mocks/officers';
import { UNITS } from '../../../mocks/units';
import { VEHICLES } from '../../../mocks/vehicles';
import { NO_CONTACT_ORDERS, TRESPASS_ORDERS } from '../../../mocks/no-contact-orders';
import { INCIDENTS } from '../../../mocks/incidents';
import { CASES } from '../../../mocks/cases';
import { CAMERAS } from '../../../mocks/cameras';
import { DOORS } from '../../../mocks/doors';
import { BLUE_LIGHTS } from '../../../mocks/blue-lights';
import { ACCESS_EVENTS } from '../../../mocks/access-events';
import { CAMERA_EVENTS } from '../../../mocks/camera-events';
import { BIT_CASES } from '../../../mocks/bit-cases';
import { BIT_EVIDENCE } from '../../../mocks/bit-evidence';
import { BIT_PLAN_ACTIONS } from '../../../mocks/bit-plans';
import { TIPS } from '../../../mocks/tips';
import { LIVESAFE_CHATS } from '../../../mocks/livesafe-chats';
import { TITLE_IX_CASES } from '../../../mocks/title-ix-cases';
import { CONDUCT_CASES } from '../../../mocks/conduct-cases';
import { SANCTIONS } from '../../../mocks/sanctions';
import { EDU_PROGRAMS } from '../../../mocks/edu-programs';
import { PARENTAL_NOTIFICATIONS } from '../../../mocks/parental-notifications';
import { INSIGHTS } from '../../../mocks/insights';
import { WEATHER_ALERTS } from '../../../mocks/weather-alerts';
import { EOC_ACTIVATIONS, SIT_LOG_ENTRIES, DECISION_LOG_ENTRIES } from '../../../mocks/eoc-activations';
import { RUNBOOKS, RUNBOOK_EXECUTIONS } from '../../../mocks/runbooks';
import { NOTIFICATION_CAMPAIGNS } from '../../../mocks/notification-campaigns';
import { FIRE_PANEL_EVENTS } from '../../../mocks/fire-panel-events';
import { BMS_ALARMS } from '../../../mocks/bms-alarms';
import { GENERATOR_STATE } from '../../../mocks/generator-state';
import { ENV_SENSOR_READINGS } from '../../../mocks/env-sensors';
import { SHUTTLE_ROUTES } from '../../../mocks/transit-routes';
import { TRANSIT_GPS_PINGS } from '../../../mocks/transit-gps';
import { CLERY_POLYGON_SETS } from '../../../mocks/clery-geography';
import { CLERY_ASR_WORKSPACE } from '../../../mocks/clery-asr';
import { CSA_REPORTS } from '../../../mocks/csa-reports';
import { TIMELY_WARNINGS } from '../../../mocks/timely-warnings';
import { NIBRIS_SUBMISSIONS } from '../../../mocks/nibris-submissions';
import { FOIA_REQUESTS } from '../../../mocks/foia-requests';
import type {
  Building, ResidenceHall, Beat, Region, RegionId,
  Domain, DomainId,
  Source,
  Dataset, MedallionLayer, Classification,
  PipelineRun, PipelineStatus,
  LayerStatus,
  MetricDefinition,
  Person, Officer, Unit, Vehicle,
  Incident, IncidentStatus, CallTypeCode,
  Case,
  NoContactOrder, TrespassOrder,
  Camera, Door, BlueLight, ACSDoorEvent, CameraEvent,
  BuildingOccupancyEstimate,
  BITCase, BITEvidence, BITPlanAction, BITRiskTier,
  AnonymousTip, LiveSafeChat,
  TitleIXCase,
  ConductCase, ConductSubtype, Sanction, EduProgram, ParentalNotification,
  Insight, InsightKind,
  WeatherAlert,
  EOCActivation, EOCActivationStatus, SitLogEntry, DecisionLogEntry,
  Runbook, RunbookCategory, RunbookExecution,
  NotificationCampaign, NotifCampaignStatus,
  FirePanelEvent, BMSAlarm, GeneratorState, EnvSensorReading,
  ShuttleRoute, TransitGPSPing,
  CleryPolygonSet, ASRWorkspaceRow, CleryCrimeCategory, CleryGeographyClass,
  CSAReport, TimelyWarning, NIBRSSubmission, FOIARequest, FOIAStatus,
} from '@/lib/types';
import type { DqRuleRow } from '../../../mocks/dq-rules';

// ====== Geographies ========================================================

export function getBuilding(id: string): Building | undefined {
  return BUILDINGS.find((b) => b.id === id);
}

export function getResidenceHall(id: string): ResidenceHall | undefined {
  return RESIDENCE_HALLS.find((r) => r.id === id);
}

export function getBeat(id: string): Beat | undefined {
  return BEATS.find((b) => b.id === id);
}

export function getRegion(id: RegionId): Region | undefined {
  return REGIONS.find((r) => r.id === id);
}

export function buildingsByRegion(regionId: RegionId): Building[] {
  if (regionId === 'all') return BUILDINGS;
  return BUILDINGS.filter((b) => b.regionId === regionId);
}

export function residentialBuildingCount(): number {
  return BUILDINGS.filter((b) => b.kind === 'residential').length;
}

export function shelterDesignatedBuildings(): Building[] {
  return BUILDINGS.filter((b) => b.isShelterDesignated);
}

export function totalResidentialOccupancy(): number {
  return RESIDENCE_HALLS.reduce((sum, h) => sum + (h.currentOccupancy ?? 0), 0);
}

export function totalResidentialCapacity(): number {
  return RESIDENCE_HALLS.reduce((sum, h) => sum + h.capacity, 0);
}

// ====== Domains ============================================================

export function getDomain(id: DomainId): Domain | undefined {
  return DOMAINS.find((d) => d.id === id);
}

export function domainsHealthy(): number {
  return DOMAINS.filter((d) => d.healthScore >= 90).length;
}

// ====== Sources ============================================================

export function getSource(id: string): Source | undefined {
  // Check the static registry first, then wizard-registered sources.
  const fromStatic = SOURCES.find((s) => s.id === id);
  if (fromStatic) return fromStatic;
  return getRegisteredSources().find((s) => s.id === id);
}

export function sourcesByDomain(domainId: DomainId): Source[] {
  return SOURCES.filter((s) => s.domainId === domainId);
}

export function sourcesUnhealthy(threshold = 90): Source[] {
  return SOURCES.filter((s) => s.health.composite < threshold);
}

export function sourcesByCategory(): Record<string, number> {
  const out: Record<string, number> = {};
  for (const s of SOURCES) out[s.category] = (out[s.category] ?? 0) + 1;
  return out;
}

export function sourcesRequiringCredentialRotation(daysThreshold = 30): Source[] {
  return SOURCES.filter(
    (s) =>
      s.credentialDaysToRotation !== undefined &&
      s.credentialDaysToRotation <= daysThreshold,
  );
}

// ====== Datasets / catalog =================================================

export function getDataset(id: string): Dataset | undefined {
  return DATASETS.find((d) => d.id === id);
}

export function datasetsByLayer(layer: MedallionLayer): Dataset[] {
  return DATASETS.filter((d) => d.layer === layer);
}

export function datasetsByDomain(domainId: DomainId): Dataset[] {
  return DATASETS.filter((d) => d.domainId === domainId);
}

export function datasetsByClassification(c: Classification): Dataset[] {
  return DATASETS.filter((d) => d.classification === c);
}

export interface DomainCatalogSummary {
  domainId: DomainId;
  bronzeCount: number;
  silverCount: number;
  goldCount: number;
  total: number;
  worstFreshnessHours: number;
}

export function domainCatalogSummary(): DomainCatalogSummary[] {
  return DOMAINS.map((d) => {
    const subset = datasetsByDomain(d.id);
    return {
      domainId: d.id,
      bronzeCount: subset.filter((s) => s.layer === 'bronze').length,
      silverCount: subset.filter((s) => s.layer === 'silver').length,
      goldCount: subset.filter((s) => s.layer === 'gold').length,
      total: subset.length,
      worstFreshnessHours: d.freshnessHours,
    };
  });
}

export interface LineageSubgraphNode {
  id: string;
  layer: MedallionLayer;
  name: string;
  isFocus: boolean;
}

export interface LineageSubgraph {
  nodes: LineageSubgraphNode[];
  edges: { from: string; to: string }[];
}

/** One-hop upstream + downstream subgraph for the lineage graph component. */
export function lineageSubgraph(datasetId: string): LineageSubgraph {
  const focus = getDataset(datasetId);
  if (!focus) return { nodes: [], edges: [] };
  const upstreamIds = focus.upstream;
  const downstreamIds = focus.downstream;
  const ids = new Set<string>([datasetId, ...upstreamIds, ...downstreamIds]);
  const nodes: LineageSubgraphNode[] = [];
  ids.forEach((id) => {
    const ds = getDataset(id);
    if (ds) {
      nodes.push({
        id: ds.id,
        layer: ds.layer,
        name: ds.name,
        isFocus: ds.id === datasetId,
      });
    }
  });
  const edges: { from: string; to: string }[] = [];
  for (const upId of upstreamIds) edges.push({ from: upId, to: datasetId });
  for (const dnId of downstreamIds) edges.push({ from: datasetId, to: dnId });
  return { nodes, edges };
}

/** Quality composite over all Gold datasets. */
export function goldQualityComposite(): number {
  const gold = datasetsByLayer('gold');
  if (!gold.length) return 0;
  const sum = gold.reduce((s, d) => s + d.qualityScore, 0);
  return Math.round(sum / gold.length);
}

// ====== Pipelines ==========================================================

export function getPipeline(id: string): PipelineRun | undefined {
  return PIPELINES.find((p) => p.id === id);
}

export function pipelinesByStatus(status: PipelineStatus): PipelineRun[] {
  return PIPELINES.filter((p) => p.status === status);
}

export function pipelinesByLayer(layer: MedallionLayer): PipelineRun[] {
  return PIPELINES.filter((p) => p.toLayer === layer);
}

export function pipelinesByDomain(domainId: DomainId): PipelineRun[] {
  return PIPELINES.filter((p) => p.domainId === domainId);
}

export function pipelinesByTargetDataset(datasetId: string): PipelineRun[] {
  return PIPELINES.filter((p) => p.targetDatasetId === datasetId);
}

export function layerStatuses(): LayerStatus[] {
  const layers: MedallionLayer[] = ['bronze', 'silver', 'gold'];
  return layers.map((layer) => {
    const subset = pipelinesByLayer(layer);
    return {
      layer,
      healthy: subset.filter((p) => p.status === 'success').length,
      delayed: subset.filter((p) => p.status === 'delayed').length,
      failed: subset.filter((p) => p.status === 'failed').length,
      running: subset.filter((p) => p.status === 'running').length,
      scheduled: subset.filter((p) => p.status === 'scheduled').length,
      blocked: subset.filter((p) => p.status === 'blocked').length,
      rows24h: subset.reduce((s, p) => s + p.rowsOut, 0),
    };
  });
}

export function pipelineSuccessRate30dOverall(): number {
  if (!PIPELINES.length) return 0;
  const sum = PIPELINES.reduce((s, p) => s + p.slo.successRate30d, 0);
  return sum / PIPELINES.length;
}

// ====== DQ rules / Quality console =========================================

export function failingDqRules(): DqRuleRow[] {
  return DQ_RULES.filter((r) => !r.passed);
}

export function dqRulesByDataset(datasetId: string): DqRuleRow[] {
  return DQ_RULES.filter((r) => r.datasetId === datasetId);
}

export function dqRulesByDimension(): Record<string, number> {
  const out: Record<string, number> = {};
  for (const r of DQ_RULES) out[r.dimension] = (out[r.dimension] ?? 0) + 1;
  return out;
}

export function failingDqRulesByDimension(): Record<string, number> {
  const out: Record<string, number> = {};
  for (const r of DQ_RULES.filter((x) => !x.passed)) {
    out[r.dimension] = (out[r.dimension] ?? 0) + 1;
  }
  return out;
}

// ====== Metrics / semantic layer ===========================================

export function getMetric(id: string): MetricDefinition | undefined {
  return METRICS.find((m) => m.id === id);
}

export function certifiedMetrics(): MetricDefinition[] {
  return METRICS.filter((m) => m.certified);
}

// ====== Persons / officers / units / vehicles =============================

export function getPerson(id: string): Person | undefined {
  return PERSONS.find((p) => p.id === id);
}

export function getOfficer(id: string): Officer | undefined {
  return OFFICERS.find((o) => o.id === id);
}

export function getUnit(id: string): Unit | undefined {
  return UNITS.find((u) => u.id === id);
}

export function getVehicle(id: string): Vehicle | undefined {
  return VEHICLES.find((v) => v.id === id);
}

export function personsByAffiliation(kind: string): Person[] {
  return PERSONS.filter((p) => p.affiliations.includes(kind as never));
}

export function personsByResidenceBuilding(buildingId: string): Person[] {
  return PERSONS.filter((p) => p.primaryResidenceBuildingId === buildingId);
}

export function vehiclesByPerson(personId: string): Vehicle[] {
  return VEHICLES.filter((v) => v.registeredToPersonId === personId);
}

export function noContactOrdersByPerson(personId: string): NoContactOrder[] {
  return NO_CONTACT_ORDERS.filter(
    (o) => o.partyAPersonId === personId || o.partyBPersonId === personId,
  );
}

export function trespassOrdersByPerson(personId: string): TrespassOrder[] {
  return TRESPASS_ORDERS.filter((o) => o.subjectPersonId === personId);
}

export interface PersonIdentitySubgraphNode {
  id: string;
  kind: 'person' | 'identifier';
  label: string;
  source?: string;
  confidence?: number;
  matchMethod?: 'deterministic-exact' | 'deterministic-fuzzy' | 'probabilistic';
  classification?: Classification;
}

export interface PersonIdentitySubgraph {
  nodes: PersonIdentitySubgraphNode[];
  edges: { from: string; to: string }[];
}

/** Build the xyflow data shape for Person 360's identity-resolution graph. */
export function personIdentitySubgraph(personId: string): PersonIdentitySubgraph {
  const person = getPerson(personId);
  if (!person) return { nodes: [], edges: [] };
  const nodes: PersonIdentitySubgraphNode[] = [
    { id: person.id, kind: 'person', label: person.fullName || person.id },
  ];
  const edges: { from: string; to: string }[] = [];
  person.identifiers.forEach((idr, i) => {
    const nodeId = `${person.id}-id-${i}`;
    nodes.push({
      id: nodeId,
      kind: 'identifier',
      label: `${idr.kind}\n${idr.value}`,
      source: idr.source,
      confidence: idr.confidence,
      matchMethod: idr.matchMethod,
      classification: idr.classification,
    });
    edges.push({ from: nodeId, to: person.id });
  });
  return { nodes, edges };
}

// ====== Incidents / cases =================================================

export function getIncident(id: string): Incident | undefined {
  return INCIDENTS.find((i) => i.id === id);
}

export function getCase(id: string): Case | undefined {
  return CASES.find((c) => c.id === id);
}

export function incidentsByStatus(status: IncidentStatus): Incident[] {
  return INCIDENTS.filter((i) => i.status === status);
}

export function incidentsByBuilding(buildingId: string): Incident[] {
  return INCIDENTS.filter((i) => i.buildingId === buildingId);
}

export function incidentsByPerson(personId: string): Incident[] {
  return INCIDENTS.filter(
    (i) =>
      i.reportedByPersonId === personId ||
      i.involvedPersonIds.includes(personId),
  );
}

export function incidentsByOfficer(officerId: string): Incident[] {
  return INCIDENTS.filter((i) => i.primaryOfficerId === officerId);
}

export function incidentsByCallType(code: CallTypeCode): Incident[] {
  return INCIDENTS.filter((i) => i.callType === code);
}

export function openIncidentCount(): number {
  return INCIDENTS.filter((i) => i.status === 'open' || i.status === 'on-scene').length;
}

export function avgResponseTimeMinutesToday(): number | null {
  const cleared = INCIDENTS.filter(
    (i) => i.onSceneAt && i.receivedAt && i.status === 'cleared',
  );
  if (!cleared.length) return null;
  const todayCutoff = Date.now() - 24 * 60 * 60 * 1000;
  const recent = cleared.filter(
    (i) => new Date(i.receivedAt).getTime() >= todayCutoff,
  );
  if (!recent.length) {
    // Fall back to last 7 days
    const sevenAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const last7 = cleared.filter(
      (i) => new Date(i.receivedAt).getTime() >= sevenAgo,
    );
    if (!last7.length) return null;
    const sum = last7.reduce((s, i) => {
      const r = new Date(i.receivedAt).getTime();
      const o = new Date(i.onSceneAt!).getTime();
      return s + (o - r) / 60_000;
    }, 0);
    return sum / last7.length;
  }
  const sum = recent.reduce((s, i) => {
    const r = new Date(i.receivedAt).getTime();
    const o = new Date(i.onSceneAt!).getTime();
    return s + (o - r) / 60_000;
  }, 0);
  return sum / recent.length;
}

export function cleryReportableCount(): number {
  return INCIDENTS.filter((i) => i.cleryReportable).length;
}

export function incidentsByDayLastN(days: number): { date: string; count: number }[] {
  const out: { date: string; count: number }[] = [];
  for (let d = days - 1; d >= 0; d--) {
    const start = Date.now() - (d + 1) * 86_400_000;
    const end = Date.now() - d * 86_400_000;
    const count = INCIDENTS.filter((i) => {
      const t = new Date(i.receivedAt).getTime();
      return t >= start && t < end;
    }).length;
    out.push({ date: new Date(end).toISOString().slice(0, 10), count });
  }
  return out;
}

export function bitCaseCount(): number {
  return PERSONS.filter((p) => p.inOpenBITCase).length;
}

// ====== Cameras / doors / blue lights / access events (R4) ================

export function getCamera(id: string): Camera | undefined {
  return CAMERAS.find((c) => c.id === id);
}

export function getDoor(id: string): Door | undefined {
  return DOORS.find((d) => d.id === id);
}

export function getBlueLight(id: string): BlueLight | undefined {
  return BLUE_LIGHTS.find((b) => b.id === id);
}

export function camerasByBuilding(buildingId: string): Camera[] {
  return CAMERAS.filter((c) => c.buildingId === buildingId);
}

export function doorsByBuilding(buildingId: string): Door[] {
  return DOORS.filter((d) => d.buildingId === buildingId);
}

export function blueLightsByBuilding(buildingId?: string): BlueLight[] {
  if (!buildingId) return BLUE_LIGHTS;
  return BLUE_LIGHTS.filter((b) => b.buildingId === buildingId);
}

export function cameraEventsByCamera(cameraId: string): CameraEvent[] {
  return CAMERA_EVENTS.filter((e) => e.cameraId === cameraId);
}

export function accessEventsByBuilding(buildingId: string, limit = 200): ACSDoorEvent[] {
  return ACCESS_EVENTS.filter((e) => e.buildingId === buildingId).slice(0, limit);
}

export function accessEventsByPerson(personId: string, limit = 200): ACSDoorEvent[] {
  return ACCESS_EVENTS.filter((e) => e.personId === personId).slice(0, limit);
}

export function accessAnomaliesByBuilding(buildingId: string): ACSDoorEvent[] {
  return ACCESS_EVENTS.filter(
    (e) => e.buildingId === buildingId && (e.isAfterHours || e.isUnusualBuilding || e.isAntiPassback),
  );
}

/** 24-hour-rolling occupancy estimate per building from access events. */
export function buildingOccupancyEstimate(buildingId: string): BuildingOccupancyEstimate {
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
  const recent = ACCESS_EVENTS.filter(
    (e) =>
      e.buildingId === buildingId &&
      e.kind === 'granted' &&
      new Date(e.at).getTime() >= oneDayAgo,
  );
  // Decay model: unique cardholders / 2 (some still inside, some left)
  const uniquePeople = new Set(recent.map((e) => e.personId).filter(Boolean));
  const estimated = Math.round(uniquePeople.size * 0.55);
  const building = BUILDINGS.find((b) => b.id === buildingId);
  // Approx capacity from residence_halls if applicable, else 200 default
  const rh = RESIDENCE_HALLS.find((h) => h.buildingId === buildingId);
  const capacity = rh?.capacity ?? (building?.kind === 'athletics' ? 8000 : 600);
  return {
    buildingId,
    asOf: new Date().toISOString(),
    estimated,
    capacity,
    contributors: [
      { source: 'acs.door_events_raw', weight: 0.6 },
      { source: 'wifi.session_events_raw', weight: 0.4 },
    ],
  };
}

/** Hour-of-day swipe-volume histogram for a building (last 30d). */
export function buildingHourlySwipes(buildingId: string): { hour: number; count: number; anomalyCount: number }[] {
  const buckets: { count: number; anomalyCount: number }[] = Array.from({ length: 24 }, () => ({ count: 0, anomalyCount: 0 }));
  for (const e of ACCESS_EVENTS) {
    if (e.buildingId !== buildingId) continue;
    const h = new Date(e.at).getHours();
    buckets[h].count++;
    if (e.isAfterHours || e.isUnusualBuilding || e.isAntiPassback) buckets[h].anomalyCount++;
  }
  return buckets.map((b, hour) => ({ hour, ...b }));
}

export function camerasOnlineCount(): number {
  return CAMERAS.filter((c) => c.isOnline).length;
}

export function blueLightsOfflineCount(): number {
  return BLUE_LIGHTS.filter((b) => !b.isOnline).length;
}

// ====== BIT / Conduct / Title IX / Tips / Insights (R5) ====================

export function getBITCase(id: string): BITCase | undefined {
  return BIT_CASES.find((c) => c.id === id);
}

export function bitCasesByRiskTier(): Record<BITRiskTier, BITCase[]> {
  return {
    critical: BIT_CASES.filter((c) => c.riskTier === 'critical'),
    elevated: BIT_CASES.filter((c) => c.riskTier === 'elevated'),
    moderate: BIT_CASES.filter((c) => c.riskTier === 'moderate'),
    mild: BIT_CASES.filter((c) => c.riskTier === 'mild'),
  };
}

export function bitCasesByPerson(personId: string): BITCase[] {
  return BIT_CASES.filter((c) => c.subjectPersonId === personId);
}

export function openBITCasesCount(): number {
  return BIT_CASES.filter((c) => c.status !== 'closed').length;
}

export function bitEvidenceForCase(caseId: string): BITEvidence[] {
  return BIT_EVIDENCE
    .filter((e) => e.caseId === caseId)
    .sort((a, b) => new Date(b.observedAt).getTime() - new Date(a.observedAt).getTime());
}

export function bitPlanActionsForCase(caseId: string): BITPlanAction[] {
  return BIT_PLAN_ACTIONS
    .filter((a) => a.caseId === caseId)
    .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime());
}

export function getTip(id: string): AnonymousTip | undefined {
  return TIPS.find((t) => t.id === id);
}

export function tipsByPerson(personId: string): AnonymousTip[] {
  return TIPS.filter((t) => t.matchedPersonId === personId);
}

export function tipsRoutedToBIT(): AnonymousTip[] {
  return TIPS.filter((t) => t.routedTo === 'bit');
}

export function getLiveSafeChat(id: string): LiveSafeChat | undefined {
  return LIVESAFE_CHATS.find((c) => c.id === id);
}

export function livesafeChatsForTip(tipId: string): LiveSafeChat[] {
  return LIVESAFE_CHATS.filter((c) => c.tipId === tipId);
}

export function getTitleIXCase(id: string): TitleIXCase | undefined {
  return TITLE_IX_CASES.find((c) => c.id === id);
}

export function titleIxCasesByPerson(personId: string): TitleIXCase[] {
  return TITLE_IX_CASES.filter(
    (c) => c.complainantPersonId === personId || c.respondentPersonId === personId,
  );
}

export function getConductCase(id: string): ConductCase | undefined {
  return CONDUCT_CASES.find((c) => c.id === id);
}

export function conductCasesByPerson(personId: string): ConductCase[] {
  return CONDUCT_CASES.filter((c) => c.subjectPersonId === personId);
}

export function conductCasesBySubtype(subtype: ConductSubtype): ConductCase[] {
  return CONDUCT_CASES.filter((c) => c.subtype === subtype);
}

export function openConductCasesCount(): number {
  return CONDUCT_CASES.filter((c) => c.status !== 'closed' && c.status !== 'closed-amnesty').length;
}

export function sanctionsForCase(caseId: string): Sanction[] {
  return SANCTIONS
    .filter((s) => s.conductCaseId === caseId)
    .sort((a, b) => new Date(a.issuedAt).getTime() - new Date(b.issuedAt).getTime());
}

export function sanctionsDueCount(): number {
  return SANCTIONS.filter((s) => s.status === 'pending' || s.status === 'overdue').length;
}

export function getEduProgram(id: string): EduProgram | undefined {
  return EDU_PROGRAMS.find((p) => p.id === id);
}

export function parentalNotificationsByPerson(personId: string): ParentalNotification[] {
  return PARENTAL_NOTIFICATIONS.filter((p) => p.subjectPersonId === personId);
}

export function getInsight(id: string): Insight | undefined {
  return INSIGHTS.find((i) => i.id === id);
}

export function insightsByKind(kind: InsightKind): Insight[] {
  return INSIGHTS.filter((i) => i.kind === kind);
}

export function insightsForAsset(assetId: string): Insight[] {
  return INSIGHTS.filter((i) => i.affectedAssets.includes(assetId));
}

// ====== Weather + EOC + Runbooks + Notifications + Facilities + Transit (R6) ==

export function getWeatherAlert(id: string): WeatherAlert | undefined {
  return WEATHER_ALERTS.find((a) => a.id === id);
}

export function activeWeatherAlerts(): WeatherAlert[] {
  const now = Date.now();
  return WEATHER_ALERTS.filter((a) => new Date(a.expiresAt).getTime() > now);
}

export function getEOCActivation(id: string): EOCActivation | undefined {
  return EOC_ACTIVATIONS.find((a) => a.id === id);
}

export function activeEOCActivations(): EOCActivation[] {
  return EOC_ACTIVATIONS.filter((a) => a.status === 'active');
}

export function eocActivationsByStatus(s: EOCActivationStatus): EOCActivation[] {
  return EOC_ACTIVATIONS.filter((a) => a.status === s);
}

export function sitLogForActivation(activationId: string): SitLogEntry[] {
  return SIT_LOG_ENTRIES
    .filter((e) => e.activationId === activationId)
    .sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
}

export function decisionLogForActivation(activationId: string): DecisionLogEntry[] {
  return DECISION_LOG_ENTRIES
    .filter((e) => e.activationId === activationId)
    .sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
}

export function getRunbook(id: string): Runbook | undefined {
  return RUNBOOKS.find((r) => r.id === id);
}

export function runbooksByCategory(c: RunbookCategory): Runbook[] {
  return RUNBOOKS.filter((r) => r.category === c);
}

export function getRunbookExecution(id: string): RunbookExecution | undefined {
  return RUNBOOK_EXECUTIONS.find((x) => x.id === id);
}

export function runbookExecutionsForActivation(activationId: string): RunbookExecution[] {
  return RUNBOOK_EXECUTIONS.filter((x) => x.activationId === activationId);
}

export function getNotificationCampaign(id: string): NotificationCampaign | undefined {
  return NOTIFICATION_CAMPAIGNS.find((c) => c.id === id);
}

export function notificationCampaignsByStatus(s: NotifCampaignStatus): NotificationCampaign[] {
  return NOTIFICATION_CAMPAIGNS.filter((c) => c.status === s);
}

export function campaignsForActivation(activationId: string): NotificationCampaign[] {
  return NOTIFICATION_CAMPAIGNS.filter((c) => c.triggeredByActivationId === activationId);
}

/** 30-day delivery rollup across all campaigns. */
export function notificationDeliveryRollup30d(): {
  totalSent: number;
  totalDelivered: number;
  totalFailed: number;
  deliveryRate: number;
  p50LatencySec: number;
  p95LatencySec: number;
} {
  const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const recent = NOTIFICATION_CAMPAIGNS.filter(
    (c) => new Date(c.createdAt).getTime() >= cutoff,
  );
  let attempted = 0, delivered = 0, failed = 0;
  const latP50: number[] = [];
  const latP95: number[] = [];
  for (const c of recent) {
    for (const d of c.delivery) {
      attempted += d.attempted;
      delivered += d.delivered;
      failed += d.failed;
      latP50.push(d.latencyP50Sec);
      latP95.push(d.latencyP95Sec);
    }
  }
  const avg = (arr: number[]) => (arr.length === 0 ? 0 : arr.reduce((s, v) => s + v, 0) / arr.length);
  return {
    totalSent: attempted,
    totalDelivered: delivered,
    totalFailed: failed,
    deliveryRate: attempted > 0 ? delivered / attempted : 0,
    p50LatencySec: Math.round(avg(latP50)),
    p95LatencySec: Math.round(avg(latP95)),
  };
}

export function getFirePanelEvent(id: string): FirePanelEvent | undefined {
  return FIRE_PANEL_EVENTS.find((e) => e.id === id);
}

export function firePanelEventsForBuilding(buildingId: string): FirePanelEvent[] {
  return FIRE_PANEL_EVENTS.filter((e) => e.buildingId === buildingId);
}

export function getBMSAlarm(id: string): BMSAlarm | undefined {
  return BMS_ALARMS.find((a) => a.id === id);
}

export function bmsAlarmsByBuilding(buildingId: string): BMSAlarm[] {
  return BMS_ALARMS.filter((a) => a.buildingId === buildingId);
}

export function bmsAlarmsCritical(): BMSAlarm[] {
  return BMS_ALARMS.filter((a) => a.severity === 'critical' && !a.clearedAt);
}

export function getGeneratorState(id: string): GeneratorState | undefined {
  return GENERATOR_STATE.find((g) => g.id === id);
}

export function generatorsByMode(): Record<string, number> {
  const out: Record<string, number> = {};
  for (const g of GENERATOR_STATE) out[g.mode] = (out[g.mode] ?? 0) + 1;
  return out;
}

export function envReadingsAnomalous(): EnvSensorReading[] {
  return ENV_SENSOR_READINGS.filter((r) => r.isAnomalous);
}

export function getShuttleRoute(id: string): ShuttleRoute | undefined {
  return SHUTTLE_ROUTES.find((r) => r.id === id);
}

export function shuttleRoutesByStatus(): Record<string, number> {
  const out: Record<string, number> = {};
  for (const r of SHUTTLE_ROUTES) out[r.status] = (out[r.status] ?? 0) + 1;
  return out;
}

export function transitPingsForRoute(routeId: string): TransitGPSPing[] {
  return TRANSIT_GPS_PINGS.filter((p) => p.routeId === routeId);
}

// ====== Clery + CSA + Timely Warning + NIBRS + FOIA (R7) ==================

export function getCleryPolygonSet(id: string): CleryPolygonSet | undefined {
  return CLERY_POLYGON_SETS.find((s) => s.id === id);
}

export function cleryPolygonSetsForYear(year: number): CleryPolygonSet[] {
  return CLERY_POLYGON_SETS.filter((s) => s.reportingYear === year);
}

export function asrRowsForYear(year: number): ASRWorkspaceRow[] {
  return CLERY_ASR_WORKSPACE.filter((r) => r.reportingYear === year);
}

export function asrRowsAwaitingReview(year: number): ASRWorkspaceRow[] {
  return asrRowsForYear(year).filter(
    (r) => r.needsReview || r.status === 'awaiting-review' || r.status === 'open',
  );
}

export function getASRRow(id: string): ASRWorkspaceRow | undefined {
  return CLERY_ASR_WORKSPACE.find((r) => r.id === id);
}

/** Build the (year, crime, geography) → row lookup map used by the ASR grid. */
export function asrGridIndex(year: number): Map<string, ASRWorkspaceRow> {
  const map = new Map<string, ASRWorkspaceRow>();
  for (const row of asrRowsForYear(year)) {
    map.set(`${row.crime}::${row.geography}`, row);
  }
  return map;
}

/** Cross-year totals per crime for the 3-year ASR Table 1 view. */
export function asrCrimeTotals(year: number, crime: CleryCrimeCategory): {
  geography: CleryGeographyClass;
  count: number;
}[] {
  const rows = asrRowsForYear(year).filter((r) => r.crime === crime);
  return rows.map((r) => ({ geography: r.geography, count: r.count }));
}

/** Reporting-year completeness — fraction of cells in reviewed/submitted state. */
export function asrCompleteness(year: number): { reviewed: number; total: number; pct: number } {
  const rows = asrRowsForYear(year);
  const reviewed = rows.filter((r) => r.status === 'reviewed' || r.status === 'submitted').length;
  return { reviewed, total: rows.length, pct: rows.length === 0 ? 0 : reviewed / rows.length };
}

export function getCSAReport(id: string): CSAReport | undefined {
  return CSA_REPORTS.find((r) => r.id === id);
}

export function csaReportsAsrIncluded(): CSAReport[] {
  return CSA_REPORTS.filter((r) => r.asrInclusion);
}

export function getTimelyWarning(id: string): TimelyWarning | undefined {
  return TIMELY_WARNINGS.find((w) => w.id === id);
}

export function timelyWarningsForIncident(incidentId: string): TimelyWarning[] {
  return TIMELY_WARNINGS.filter((w) => w.triggeringIncidentId === incidentId);
}

export function timelyWarningCounts(): {
  issued: number;
  declined: number;
  pending: number;
  avgMinutesToIssue: number | null;
} {
  const issued = TIMELY_WARNINGS.filter((w) => w.decision === 'issued');
  const declined = TIMELY_WARNINGS.filter((w) => w.decision === 'declined');
  const pending = TIMELY_WARNINGS.filter((w) => w.decision === 'pending');
  const times = issued.map((w) => w.minutesToIssue).filter((m): m is number => typeof m === 'number');
  const avg = times.length === 0 ? null : Math.round(times.reduce((s, v) => s + v, 0) / times.length);
  return { issued: issued.length, declined: declined.length, pending: pending.length, avgMinutesToIssue: avg };
}

export function getNIBRSSubmission(id: string): NIBRSSubmission | undefined {
  return NIBRIS_SUBMISSIONS.find((s) => s.id === id);
}

export function nibrsSubmissionsRejected(): NIBRSSubmission[] {
  return NIBRIS_SUBMISSIONS.filter((s) => s.status === 'rejected');
}

export function getFOIARequest(id: string): FOIARequest | undefined {
  return FOIA_REQUESTS.find((r) => r.id === id);
}

export function foiaRequestsByStatus(s: FOIAStatus): FOIARequest[] {
  return FOIA_REQUESTS.filter((r) => r.status === s);
}

export function foiaRequestsOverdue(): FOIARequest[] {
  const now = Date.now();
  return FOIA_REQUESTS.filter(
    (r) =>
      r.status !== 'released' &&
      r.status !== 'denied' &&
      r.status !== 'closed' &&
      new Date(r.dueAt).getTime() < now,
  );
}

// ====== Cross-narrative integrity check ===================================

import { THREAD_ANCHOR_REGISTRY } from '../../../mocks/threads';

/**
 * Dev-mode integrity check. Walks every thread anchor ID exported from
 * mocks/threads.ts and verifies that the entity it points to actually
 * exists in its respective fixture. Logs a console.warn for anything
 * unresolved. Runs once at module-load.
 *
 * Per CLAUDE.md pitfall #12, this is the cheap safety net for
 * cross-narrative integrity in lieu of a test suite.
 */
function runIntegrityCheck() {
  if (typeof window === 'undefined') return;
  const missing: string[] = [];
  for (const id of THREAD_ANCHOR_REGISTRY.persons) {
    if (!getPerson(id)) missing.push(`person: ${id}`);
  }
  for (const id of THREAD_ANCHOR_REGISTRY.buildings) {
    if (!getBuilding(id)) missing.push(`building: ${id}`);
  }
  for (const id of THREAD_ANCHOR_REGISTRY.pipelines) {
    if (!getPipeline(id)) missing.push(`pipeline: ${id}`);
  }
  for (const id of THREAD_ANCHOR_REGISTRY.bitCases) {
    if (!getBITCase(id)) missing.push(`bit-case: ${id}`);
  }
  for (const id of THREAD_ANCHOR_REGISTRY.titleIxCases) {
    if (!getTitleIXCase(id)) missing.push(`title-ix-case: ${id}`);
  }
  for (const id of THREAD_ANCHOR_REGISTRY.conductCases) {
    if (!getConductCase(id)) missing.push(`conduct-case: ${id}`);
  }
  for (const id of THREAD_ANCHOR_REGISTRY.weatherAlerts) {
    if (!getWeatherAlert(id)) missing.push(`weather-alert: ${id}`);
  }
  for (const id of THREAD_ANCHOR_REGISTRY.eocActivations) {
    if (!getEOCActivation(id)) missing.push(`eoc-activation: ${id}`);
  }
  for (const id of THREAD_ANCHOR_REGISTRY.notificationCampaigns) {
    if (!getNotificationCampaign(id)) missing.push(`notification-campaign: ${id}`);
  }
  for (const id of THREAD_ANCHOR_REGISTRY.cleryPolygonSets) {
    if (!getCleryPolygonSet(id)) missing.push(`clery-polygon-set: ${id}`);
  }
  for (const id of THREAD_ANCHOR_REGISTRY.asrLines) {
    if (!getASRRow(id)) missing.push(`asr-row: ${id}`);
  }
  for (const id of THREAD_ANCHOR_REGISTRY.timelyWarnings) {
    if (!getTimelyWarning(id)) missing.push(`timely-warning: ${id}`);
  }
  for (const id of THREAD_ANCHOR_REGISTRY.foiaRequests) {
    if (!getFOIARequest(id)) missing.push(`foia-request: ${id}`);
  }
  for (const id of THREAD_ANCHOR_REGISTRY.incidents) {
    if (!getIncident(id)) missing.push(`incident: ${id}`);
  }
  if (missing.length) {
    // eslint-disable-next-line no-console
    console.warn(
      '[mock-db] cross-narrative integrity: %d anchor ID(s) unresolved:\n  - %s',
      missing.length,
      missing.join('\n  - '),
    );
  }
}
runIntegrityCheck();
