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
