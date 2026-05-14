/**
 * /catalog — Medallion dataset browser.
 *
 * Three-column Bronze/Silver/Gold view with filterable dataset list per
 * column, plus per-domain summary cards above.
 */
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { LayerBadge } from '@/components/data-display/layer-badge';
import { ClassificationBadge } from '@/components/data-display/classification-badge';
import { FreshnessPill } from '@/components/data-display/freshness-pill';
import { DomainIcon } from '@/components/data-display/domain-icon';
import {
  DATASETS,
  LAYER_COUNTS,
  DOMAINS,
  domainCatalogSummary,
  goldQualityComposite,
} from '@/lib/mock-db';
import type { Dataset, MedallionLayer } from '@/lib/types';

export default function CatalogPage() {
  const [filter, setFilter] = useState('');

  const summaries = useMemo(() => domainCatalogSummary(), []);
  const qScore = useMemo(() => goldQualityComposite(), []);

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return DATASETS;
    return DATASETS.filter(
      (d) =>
        d.id.toLowerCase().includes(q) ||
        d.name.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q) ||
        d.tags.some((t) => t.includes(q)),
    );
  }, [filter]);

  const byLayer: Record<MedallionLayer, Dataset[]> = {
    bronze: filtered.filter((d) => d.layer === 'bronze'),
    silver: filtered.filter((d) => d.layer === 'silver'),
    gold: filtered.filter((d) => d.layer === 'gold'),
  };

  return (
    <>
      <PageHeader
        eyebrow="Data · Medallion Catalog"
        title="Catalog"
        description={`${LAYER_COUNTS.total} datasets across Bronze (${LAYER_COUNTS.bronze}), Silver (${LAYER_COUNTS.silver}), and Gold (${LAYER_COUNTS.gold}). Click any dataset to see schema, sample rows, lineage, and six-dimension DQ.`}
        actions={
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                Gold DQ composite
              </div>
              <div className="font-display text-2xl font-semibold text-[var(--foreground)]">
                {qScore}
                <span className="ml-1 text-sm font-normal text-[var(--muted-foreground)]">/ 100</span>
              </div>
            </div>
          </div>
        }
      />

      <div className="space-y-6 px-8 py-6">
        {/* Search */}
        <Input
          type="search"
          placeholder="Search datasets by ID, name, description, or tag…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />

        {/* Per-domain summary */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Domains</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
              {summaries.map((s) => {
                const d = DOMAINS.find((dd) => dd.id === s.domainId)!;
                return (
                  <div
                    key={s.domainId}
                    className="rounded-md border border-[var(--border)] bg-[var(--graphite-50)] p-3"
                  >
                    <div className="mb-1 flex items-center gap-2">
                      <DomainIcon domainId={s.domainId} className="text-[var(--graphite-700)]" />
                      <span className="text-xs font-semibold text-[var(--foreground)]">{d.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-[var(--muted-foreground)]">
                      <span>{s.bronzeCount}B</span>
                      <span>·</span>
                      <span>{s.silverCount}S</span>
                      <span>·</span>
                      <span>{s.goldCount}G</span>
                      <span>·</span>
                      <span className="font-medium">{s.total} total</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Three-column Bronze/Silver/Gold layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {(['bronze', 'silver', 'gold'] as MedallionLayer[]).map((layer) => (
            <div key={layer}>
              <div className="mb-2 flex items-center gap-2">
                <LayerBadge layer={layer} />
                <span className="text-xs text-[var(--muted-foreground)]">
                  {byLayer[layer].length} datasets
                </span>
              </div>
              <div className="space-y-2">
                {byLayer[layer].map((d) => (
                  <DatasetCard key={d.id} dataset={d} />
                ))}
                {byLayer[layer].length === 0 && (
                  <div className="rounded-md border border-dashed border-[var(--border)] p-4 text-center text-xs text-[var(--muted-foreground)]">
                    No datasets match this filter.
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function DatasetCard({ dataset }: { dataset: Dataset }) {
  return (
    <Link
      to={`/catalog/${encodeURIComponent(dataset.id)}`}
      className="block rounded-md border bg-[var(--card)] p-3 transition-colors hover:bg-[var(--graphite-50)]"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="truncate font-mono text-xs font-medium text-[var(--graphite-900)]">
            {dataset.id}
          </div>
          <div className="mt-1 truncate text-[11px] text-[var(--muted-foreground)]">
            {dataset.name}
          </div>
        </div>
        <ClassificationBadge classification={dataset.classification} />
      </div>
      <div className="mt-2 flex items-center gap-2 text-[10px]">
        <FreshnessPill lastUpdatedIso={dataset.lastUpdated} />
        <Badge variant="muted">{dataset.refreshCadence}</Badge>
        <span className="ml-auto tabular-nums text-[var(--muted-foreground)]">
          DQ {dataset.qualityScore}
        </span>
      </div>
    </Link>
  );
}
