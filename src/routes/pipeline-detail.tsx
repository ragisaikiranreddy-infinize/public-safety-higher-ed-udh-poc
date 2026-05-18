/**
 * /pipelines/:id — Pipeline detail with 5-tab structure (per the reference
 * POC pattern). R1 ships static tabs; R2 wires the live-run state machine.
 */
import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayerBadge } from '@/components/data-display/layer-badge';
import { PipelineStatusPill } from '@/components/data-display/pipeline-status-pill';
import { FreshnessPill } from '@/components/data-display/freshness-pill';
import { SeverityDot } from '@/components/data-display/severity-dot';
import { LineageGraph } from '@/components/lineage/lineage-graph';
import { getPipeline, getDataset } from '@/lib/mock-db';
import { formatNumber, formatMinutes } from '@/lib/utils';
import { Play } from 'lucide-react';
import NotFoundPage from './not-found';

export default function PipelineDetailPage() {
  const { id = '' } = useParams<{ id: string }>();
  const pipeline = getPipeline(id);
  const [tab, setTab] = useState('overview');

  if (!pipeline) return <NotFoundPage />;
  const target = getDataset(pipeline.targetDatasetId);

  return (
    <>
      <PageHeader
        eyebrow={`Pipelines · ${pipeline.fromLayer ?? 'source'} → ${pipeline.toLayer}`}
        title={pipeline.name}
        description={pipeline.description}
        actions={
          <div className="flex items-center gap-2">
            <LayerBadge layer={pipeline.toLayer} />
            <PipelineStatusPill status={pipeline.status} />
            <FreshnessPill lastUpdatedIso={pipeline.startedAt} />
            <Link to={`/pipelines/${encodeURIComponent(pipeline.id)}/run`}>
              <Button variant="accent" size="sm">
                <Play className="h-3.5 w-3.5" />
                Run now
              </Button>
            </Link>
          </div>
        }
      />

      <div className="space-y-6 px-8 py-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <KpiBox label="Rows out (last run)" value={formatNumber(pipeline.rowsOut)} />
          <KpiBox label="Rows rejected" value={formatNumber(pipeline.rowsRejected)} />
          <KpiBox label="Duration (last)" value={pipeline.durationMs ? `${(pipeline.durationMs / 1000).toFixed(0)}s` : '—'} />
          <KpiBox label="SLO success (30d)" value={`${(pipeline.slo.successRate30d * 100).toFixed(1)}%`} />
        </div>

        {pipeline.blockedByDatasetId && (
          <Card className="border-[var(--signal-red)]">
            <CardContent className="flex items-center gap-3 p-4">
              <SeverityDot severity="critical" />
              <div className="flex-1 text-sm">
                <span className="font-semibold text-[var(--foreground)]">Blocked upstream:</span>{' '}
                Pipeline is waiting on{' '}
                <Link
                  to={`/catalog/${encodeURIComponent(pipeline.blockedByDatasetId)}`}
                  className="font-mono text-[var(--hub-700)] hover:underline"
                >
                  {pipeline.blockedByDatasetId}
                </Link>{' '}
                to refresh.
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="steps">Transform steps</TabsTrigger>
            <TabsTrigger value="quality">Quality gate</TabsTrigger>
            <TabsTrigger value="history">Recent runs</TabsTrigger>
            <TabsTrigger value="lineage">Lineage</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Overview</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-4 text-xs md:grid-cols-3">
                <Field label="Engine" value={pipeline.engine} />
                <Field label="From → To" value={`${pipeline.fromLayer ?? 'source'} → ${pipeline.toLayer}`} />
                <Field label="Domain" value={pipeline.domainId} />
                <Field label="Target dataset" value={target?.id ?? pipeline.targetDatasetId} mono link={`/catalog/${encodeURIComponent(pipeline.targetDatasetId)}`} />
                <Field label="Source datasets" value={pipeline.sourceDatasetIds.length ? pipeline.sourceDatasetIds.join(', ') : '— (Bronze ingestion)'} mono />
                <Field label="MTTD / MTTR" value={`${formatMinutes(pipeline.slo.mttdMinutes)} / ${formatMinutes(pipeline.slo.mttrMinutes)}`} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="steps">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Transform steps ({pipeline.transformSteps.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {pipeline.transformSteps.map((s, idx) => (
                  <div key={s.id} className="flex items-start gap-3 rounded-md border bg-[var(--card)] p-3">
                    <div className="font-mono text-xs text-[var(--muted-foreground)]">#{idx + 1}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[var(--foreground)] text-sm">{s.kind}</span>
                        {s.rowsIn !== undefined && (
                          <span className="text-[10px] text-[var(--muted-foreground)]">
                            in: {formatNumber(s.rowsIn)} · out: {formatNumber(s.rowsOut ?? 0)}
                          </span>
                        )}
                        {s.durationMs !== undefined && (
                          <span className="text-[10px] text-[var(--muted-foreground)]">
                            {(s.durationMs / 1000).toFixed(1)}s
                          </span>
                        )}
                      </div>
                      <div className="mt-1 text-xs text-[var(--muted-foreground)]">{s.description}</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quality">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle>Quality gate</CardTitle>
                  <Badge
                    variant={
                      pipeline.qualityGate.status === 'pass' ? 'success' :
                      pipeline.qualityGate.status === 'fail' ? 'danger' :
                      pipeline.qualityGate.status === 'warn' ? 'warning' : 'muted'
                    }
                  >
                    {pipeline.qualityGate.status.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-3 flex items-center gap-3 text-xs">
                  <span className="text-[var(--signal-green)]">{pipeline.qualityGate.passedCount} passed</span>
                  <span className="text-[var(--signal-amber)]">{pipeline.qualityGate.warnCount} warn</span>
                  <span className="text-[var(--signal-red)]">{pipeline.qualityGate.failedCount} failed</span>
                </div>
                {pipeline.qualityGate.rules.length === 0 ? (
                  <div className="text-xs text-[var(--muted-foreground)]">Quality gate pending.</div>
                ) : (
                  <ul className="space-y-2">
                    {pipeline.qualityGate.rules.map((r) => (
                      <li key={r.id} className="flex items-start gap-3 rounded-md border p-3">
                        <SeverityDot severity={r.severity} />
                        <div className="flex-1">
                          <div className="text-sm">{r.description}</div>
                          <div className="mt-1 text-[10px] text-[var(--muted-foreground)]">
                            {r.dimension} · {r.severity}
                            {r.affectedRows ? ` · ${r.affectedRows} affected` : ''}
                            {r.thresholdDescription ? ` · ${r.thresholdDescription}` : ''}
                          </div>
                        </div>
                        <Badge variant={r.passed ? 'success' : 'danger'}>
                          {r.passed ? 'pass' : 'fail'}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Recent runs ({pipeline.historicalRuns.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5">
                {pipeline.historicalRuns.slice().reverse().map((h, i) => (
                  <div key={i} className="flex items-center justify-between rounded-md border p-2 text-xs">
                    <div className="flex items-center gap-3">
                      <Badge variant={h.status === 'success' ? 'success' : 'danger'}>{h.status}</Badge>
                      <FreshnessPill lastUpdatedIso={h.startedAt} />
                    </div>
                    <span className="tabular-nums text-[var(--muted-foreground)]">
                      {(h.durationMs / 1000).toFixed(0)}s
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="lineage">
            <Card>
              <CardContent className="p-0">
                <LineageGraph datasetId={pipeline.targetDatasetId} className="rounded-lg" />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}

function KpiBox({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
          {label}
        </div>
        <div className="mt-1 font-display text-2xl font-semibold text-[var(--foreground)]">{value}</div>
      </CardContent>
    </Card>
  );
}

function Field({ label, value, mono, link }: { label: string; value: string; mono?: boolean; link?: string }) {
  const body = mono ? <span className="font-mono">{value}</span> : <span>{value}</span>;
  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">{label}</div>
      <div className="mt-1 text-[var(--foreground)]">
        {link ? <Link to={link} className="text-[var(--hub-700)] hover:underline">{body}</Link> : body}
      </div>
    </div>
  );
}
