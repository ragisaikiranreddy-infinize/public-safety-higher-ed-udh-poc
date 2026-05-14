/**
 * /catalog/:id — Dataset Detail.
 *
 * Layout:
 *   Header card  — layer + classification + freshness + source link + tags
 *   Schema       — column list with classification per column
 *   Sample rows  — first 1–2 rows
 *   DQ          — six-dimension breakdown + recent rules
 *   Lineage     — xyflow one-hop subgraph
 *   Pipelines   — runs that produce this dataset
 */
import { useParams, Link } from 'react-router-dom';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { LayerBadge } from '@/components/data-display/layer-badge';
import { ClassificationBadge } from '@/components/data-display/classification-badge';
import { FreshnessPill } from '@/components/data-display/freshness-pill';
import { QualityMeter } from '@/components/data-display/quality-meter';
import { PipelineStatusPill } from '@/components/data-display/pipeline-status-pill';
import { DomainIcon } from '@/components/data-display/domain-icon';
import { LineageGraph } from '@/components/lineage/lineage-graph';
import {
  getDataset,
  getDomain,
  getSource,
  pipelinesByTargetDataset,
  dqRulesByDataset,
} from '@/lib/mock-db';
import { useRole } from '@/lib/role-context';
import { formatNumber } from '@/lib/utils';
import NotFoundPage from './not-found';

export default function DatasetDetailPage() {
  const { id = '' } = useParams<{ id: string }>();
  const dataset = getDataset(id);
  const { canSee } = useRole();

  if (!dataset) return <NotFoundPage />;

  const domain = getDomain(dataset.domainId);
  const source = dataset.sourceId ? getSource(dataset.sourceId) : undefined;
  const pipelines = pipelinesByTargetDataset(dataset.id);
  const rules = dqRulesByDataset(dataset.id);

  return (
    <>
      <PageHeader
        eyebrow={`Data · ${domain?.name ?? 'Catalog'}`}
        title={dataset.name}
        description={dataset.description}
        actions={
          <div className="flex items-center gap-2">
            <LayerBadge layer={dataset.layer} />
            <ClassificationBadge classification={dataset.classification} />
            <FreshnessPill lastUpdatedIso={dataset.lastUpdated} />
          </div>
        }
      />

      <div className="space-y-6 px-8 py-6">
        {/* Hero strip */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <KpiBox label="Dataset ID" value={dataset.id} mono />
          <KpiBox label="Rows" value={formatNumber(dataset.rowCount)} />
          <KpiBox label="Size" value={`${dataset.sizeGb.toFixed(1)} GB`} />
          <KpiBox label="Refresh" value={dataset.refreshCadence} />
        </div>

        {/* Schema */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Schema</CardTitle>
              <span className="text-xs text-[var(--muted-foreground)]">
                {dataset.schema.length} columns · classifications enforced per column
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="border-b bg-[var(--graphite-50)]">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Column</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Type</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Classification</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {dataset.schema.map((c) => (
                    <tr key={c.name} className="border-b last:border-0">
                      <td className="px-4 py-2 font-mono text-[var(--foreground)]">
                        {c.name}
                        {c.isPrimaryKey && (
                          <Badge variant="muted" className="ml-2 text-[9px]">PK</Badge>
                        )}
                      </td>
                      <td className="px-4 py-2 text-[var(--muted-foreground)]">{c.type}</td>
                      <td className="px-4 py-2">
                        <ClassificationBadge classification={c.classification} />
                      </td>
                      <td className="px-4 py-2 text-[var(--muted-foreground)]">{c.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Sample rows — masked by classification */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Sample rows ({dataset.sampleRows.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="border-b bg-[var(--graphite-50)]">
                  <tr>
                    {dataset.schema.map((c) => (
                      <th key={c.name} className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">
                        {c.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dataset.sampleRows.map((row, i) => (
                    <tr key={i} className="border-b last:border-0">
                      {dataset.schema.map((c) => {
                        const v = row[c.name];
                        const masked = !canSee(c.classification);
                        return (
                          <td key={c.name} className="px-4 py-2 font-mono text-[var(--foreground)]">
                            {masked ? (
                              <span className="text-[var(--barrier)]">[masked: {c.classification}]</span>
                            ) : v === null ? (
                              <span className="text-[var(--muted-foreground)]">null</span>
                            ) : (
                              String(v).slice(0, 60)
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="border-t bg-[var(--graphite-50)] px-4 py-2 text-[11px] text-[var(--muted-foreground)]">
              Cells masked according to your active role's classification access. Switch role in the header to see the masking change in place.
            </div>
          </CardContent>
        </Card>

        {/* DQ + Lineage two-column */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Data Quality</CardTitle>
            </CardHeader>
            <CardContent>
              <QualityMeter score={dataset.qualityScore} detail={dataset.qualityScoreDetail} />
              {rules.length > 0 && (
                <>
                  <Separator className="my-4" />
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                    Rules ({rules.length})
                  </div>
                  <ul className="mt-2 space-y-1.5">
                    {rules.map((r) => (
                      <li key={r.id} className="flex items-start gap-2 text-xs">
                        <span
                          className={`mt-1.5 inline-block h-2 w-2 shrink-0 rounded-full ${
                            r.passed ? 'bg-[var(--signal-green)]' : 'bg-[var(--signal-red)]'
                          }`}
                        />
                        <div className="flex-1">
                          <div className="text-[var(--foreground)]">{r.description}</div>
                          <div className="text-[10px] text-[var(--muted-foreground)]">
                            {r.dimension} · {r.severity}
                            {r.affectedRows ? ` · ${r.affectedRows} affected` : ''}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Lineage</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <LineageGraph datasetId={dataset.id} className="rounded-b-lg" />
            </CardContent>
          </Card>
        </div>

        {/* Pipelines + Source + Tags */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Pipelines producing this dataset</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {pipelines.length === 0 && (
                <div className="text-xs text-[var(--muted-foreground)]">
                  No pipelines materialize this dataset directly.
                </div>
              )}
              {pipelines.map((p) => (
                <Link
                  key={p.id}
                  to={`/pipelines/${encodeURIComponent(p.id)}`}
                  className="flex items-center justify-between rounded-md border bg-[var(--card)] p-2 transition-colors hover:bg-[var(--graphite-50)]"
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-mono text-xs">{p.id}</div>
                    <div className="truncate text-[10px] text-[var(--muted-foreground)]">{p.name}</div>
                  </div>
                  <PipelineStatusPill status={p.status} />
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Context</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              {domain && (
                <div className="flex items-center gap-2">
                  <DomainIcon domainId={domain.id} />
                  <div className="flex-1">
                    <div className="text-[var(--foreground)]">{domain.name}</div>
                    <div className="text-[10px] text-[var(--muted-foreground)]">Domain</div>
                  </div>
                </div>
              )}
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">Owner</div>
                <div className="text-[var(--foreground)]">{dataset.owner}</div>
              </div>
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">Steward</div>
                <div className="text-[var(--foreground)]">{dataset.steward}</div>
              </div>
              {source && (
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">Source system</div>
                  <Link
                    to={`/sources/${encodeURIComponent(source.id)}`}
                    className="text-[var(--hub-700)] hover:underline"
                  >
                    {source.name}
                  </Link>
                </div>
              )}
              <div>
                <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">Regulatory hooks</div>
                <div className="flex flex-wrap gap-1">
                  {dataset.regulatoryHooks.map((r) => (
                    <Badge key={r} variant="outline">{r}</Badge>
                  ))}
                  {dataset.regulatoryHooks.length === 0 && (
                    <span className="text-[10px] text-[var(--muted-foreground)]">none</span>
                  )}
                </div>
              </div>
              <div>
                <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">Tags</div>
                <div className="flex flex-wrap gap-1">
                  {dataset.tags.map((t) => (
                    <Badge key={t} variant="muted">{t}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

function KpiBox({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
          {label}
        </div>
        <div className={`mt-1 ${mono ? 'font-mono text-sm' : 'font-display text-lg font-semibold'} text-[var(--foreground)] break-all`}>
          {value}
        </div>
      </CardContent>
    </Card>
  );
}
