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
import type {
  Building, ResidenceHall, Beat, Region, RegionId,
  Domain, DomainId,
  Source,
  Dataset, MedallionLayer, Classification,
  PipelineRun, PipelineStatus,
  LayerStatus,
  MetricDefinition,
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
  return SOURCES.find((s) => s.id === id);
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
