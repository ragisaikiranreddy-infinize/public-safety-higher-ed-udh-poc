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
