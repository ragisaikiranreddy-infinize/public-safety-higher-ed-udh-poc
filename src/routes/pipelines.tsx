/**
 * /pipelines — Pipeline list with layer-status strip.
 */
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { LayerBadge } from '@/components/data-display/layer-badge';
import { PipelineStatusPill } from '@/components/data-display/pipeline-status-pill';
import { FreshnessPill } from '@/components/data-display/freshness-pill';
import { PIPELINES, layerStatuses } from '@/lib/mock-db';
import { formatNumber } from '@/lib/utils';
import type { MedallionLayer } from '@/lib/types';

export default function PipelinesPage() {
  const [filter, setFilter] = useState('');
  const statuses = useMemo(() => layerStatuses(), []);

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return PIPELINES;
    return PIPELINES.filter(
      (p) => p.id.toLowerCase().includes(q) || p.name.toLowerCase().includes(q),
    );
  }, [filter]);

  return (
    <>
      <PageHeader
        eyebrow="Data · Pipelines"
        title="Pipelines"
        description={`${PIPELINES.length} pipeline runs across Bronze ingestion, Silver conformers, and Gold marts. Three demo paths are seeded: success, failed quality gate, blocked upstream.`}
      />

      <div className="space-y-6 px-8 py-6">
        {/* Layer-status strip */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {statuses.map((s) => (
            <LayerStatusCard key={s.layer} {...s} />
          ))}
        </div>

        <Input
          type="search"
          placeholder="Search pipelines by ID or name…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="border-b bg-[var(--graphite-50)]">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Pipeline</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Layer</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Engine</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Status</th>
                    <th className="px-4 py-2 text-right font-medium text-[var(--muted-foreground)]">Rows out</th>
                    <th className="px-4 py-2 text-right font-medium text-[var(--muted-foreground)]">SLO success</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Started</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr key={p.id} className="border-b last:border-0 hover:bg-[var(--graphite-50)]">
                      <td className="px-4 py-2">
                        <Link to={`/pipelines/${encodeURIComponent(p.id)}`}>
                          <div className="font-mono text-[var(--foreground)]">{p.id}</div>
                          <div className="text-[10px] text-[var(--muted-foreground)]">{p.name}</div>
                        </Link>
                      </td>
                      <td className="px-4 py-2"><LayerBadge layer={p.toLayer} /></td>
                      <td className="px-4 py-2"><Badge variant="muted">{p.engine}</Badge></td>
                      <td className="px-4 py-2"><PipelineStatusPill status={p.status} /></td>
                      <td className="px-4 py-2 text-right tabular-nums">{formatNumber(p.rowsOut)}</td>
                      <td className="px-4 py-2 text-right tabular-nums">{(p.slo.successRate30d * 100).toFixed(1)}%</td>
                      <td className="px-4 py-2"><FreshnessPill lastUpdatedIso={p.startedAt} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function LayerStatusCard({
  layer,
  healthy,
  delayed,
  failed,
  running,
  blocked,
  rows24h,
}: {
  layer: MedallionLayer;
  healthy: number;
  delayed: number;
  failed: number;
  running: number;
  scheduled: number;
  blocked: number;
  rows24h: number;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="mb-3 flex items-center gap-2">
          <LayerBadge layer={layer} />
          <span className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)]">layer roll-up</span>
        </div>
        <div className="grid grid-cols-4 gap-2 text-center">
          <Stat n={healthy} label="healthy" variant="success" />
          <Stat n={running} label="running" variant="info" />
          <Stat n={delayed} label="delayed" variant="warning" />
          <Stat n={failed + blocked} label="failed" variant="danger" />
        </div>
        <div className="mt-3 text-[10px] text-[var(--muted-foreground)]">
          {formatNumber(rows24h)} rows materialized in last run
        </div>
      </CardContent>
    </Card>
  );
}

function Stat({ n, label, variant }: { n: number; label: string; variant: Parameters<typeof Badge>[0]['variant'] }) {
  return (
    <div>
      <div className="font-display text-xl font-semibold tabular-nums text-[var(--foreground)]">{n}</div>
      <Badge variant={variant} className="text-[9px]">{label}</Badge>
    </div>
  );
}
