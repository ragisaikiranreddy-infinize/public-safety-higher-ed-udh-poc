/**
 * /insights/:id — full insight with contributors + prediction attribution +
 * AI-expanded narrative + recommended actions.
 */
import { Link, useParams } from 'react-router-dom';
import { GitBranch, TrendingUp, AlertOctagon, Sparkles } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SeverityDot } from '@/components/data-display/severity-dot';
import { ClassificationBadge } from '@/components/data-display/classification-badge';
import { getInsight } from '@/lib/mock-db';
import { expandInsight } from '@/lib/ai/mock-ai';
import { formatRelativeTime } from '@/lib/utils';
import type { InsightKind } from '@/lib/types';
import NotFoundPage from './not-found';

const KIND_ICON: Record<InsightKind, React.ElementType> = {
  rca: GitBranch,
  prediction: TrendingUp,
  anomaly: AlertOctagon,
};

export default function InsightDetailPage() {
  const { id = '' } = useParams<{ id: string }>();
  const insight = getInsight(id);
  if (!insight) return <NotFoundPage />;

  const expansion = expandInsight(insight.id);
  const Icon = KIND_ICON[insight.kind];

  return (
    <>
      <PageHeader
        eyebrow="Intelligence · Insight"
        title={insight.title}
        description={`${insight.id} · ${formatRelativeTime(new Date(insight.createdAt))}`}
      />
      <div className="space-y-6 px-8 py-6">
        <Card>
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="flex items-center gap-3">
              <Icon className="h-4 w-4 text-[var(--hub-700)]" />
              <SeverityDot severity={insight.severity} />
              <Badge variant="outline" className="text-[10px]">{insight.kind}</Badge>
              <ClassificationBadge classification={insight.classification} />
              {insight.threadTag && <Badge variant="accent">Thread {insight.threadTag}</Badge>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Narrative</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm leading-relaxed">{insight.narrative}</p>
            {expansion.available && expansion.expandedNarrative && (
              <div className="rounded-md border border-[var(--hub-300)] bg-[var(--hub-50)]/30 p-4">
                <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--hub-700)]">
                  <Sparkles className="h-3.5 w-3.5" />
                  AI-expanded
                </div>
                <p className="text-[12px] leading-relaxed">{expansion.expandedNarrative}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contributors (RCA only) */}
        {insight.contributors && insight.contributors.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>RCA contributors</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {insight.contributors.map((c, i) => (
                <div key={i} className="rounded-md border bg-[var(--card)] p-3 text-xs">
                  <div className="mb-1 flex items-center justify-between">
                    <div className="font-semibold">{c.label}</div>
                    <Badge variant="info" className="text-[10px]">{c.weightPct}%</Badge>
                  </div>
                  <p className="text-[11px] leading-relaxed text-[var(--muted-foreground)]">{c.rationale}</p>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--graphite-100)]">
                    <div className="h-full bg-[var(--hub-500)]" style={{ width: `${c.weightPct}%` }} />
                  </div>
                  {c.linkedRoute && (
                    <Link to={c.linkedRoute} className="mt-2 inline-flex text-[10px] text-[var(--hub-700)] hover:underline">
                      Drill in →
                    </Link>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Prediction attribution */}
        {insight.prediction && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Prediction attribution</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="text-[10px]">{insight.prediction.modelName} {insight.prediction.modelVersion}</Badge>
                <Badge variant="muted" className="text-[10px]">{insight.prediction.modelKind}</Badge>
                <span>{insight.prediction.confidence}% confidence</span>
                {insight.prediction.confidenceInterval && (
                  <span className="text-[var(--muted-foreground)]">
                    [{insight.prediction.confidenceInterval[0]}, {insight.prediction.confidenceInterval[1]}]
                  </span>
                )}
              </div>
              <div>
                <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">Features</div>
                <ul className="space-y-1.5">
                  {insight.prediction.features.map((f, i) => (
                    <li key={i} className="flex items-center justify-between rounded-md border bg-[var(--card)] p-2">
                      <div>
                        <span className="font-mono text-[10px]">{f.name}</span>
                        <span className="ml-2 text-[10px] text-[var(--muted-foreground)]">= {String(f.value)}</span>
                        {f.hint && <span className="ml-2 text-[10px] text-[var(--muted-foreground)]">— {f.hint}</span>}
                      </div>
                      <Badge variant="info" className="text-[10px]">{f.importancePct}%</Badge>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">Recommended actions</div>
                <ul className="space-y-1.5">
                  {insight.prediction.recommendedActions.map((a, i) => (
                    <li key={i} className="rounded-md border bg-[var(--card)] p-2 text-[11px]">
                      <span>{a.description}</span>
                      <div className="mt-0.5 text-[10px] text-[var(--muted-foreground)]">
                        within {a.horizonHours}h · owner <span className="font-mono">{a.ownerRole}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        {/* AI expansion: actions + quick links */}
        {expansion.available && (expansion.recommendedActions.length > 0 || expansion.quickLinks.length > 0) && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Sparkles className="h-4 w-4 text-[var(--hub-700)]" />
                Recommended next steps
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              {expansion.recommendedActions.length > 0 && (
                <ul className="space-y-1.5">
                  {expansion.recommendedActions.map((a, i) => (
                    <li key={i} className="rounded-md border bg-[var(--card)] p-3">
                      <span className="text-[12px]">{a.description}</span>
                      <div className="mt-1 text-[10px] text-[var(--muted-foreground)]">
                        within {a.horizonHours}h · owner <span className="font-mono">{a.ownerRole}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              {expansion.quickLinks.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {expansion.quickLinks.map((l, i) => (
                    <Link key={i} to={l.route} className="rounded-md bg-[var(--hub-600)] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[var(--hub-700)]">
                      {l.label} →
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Affected assets + evidence */}
        {(insight.affectedAssets.length > 0 || insight.evidenceDatasetIds.length > 0) && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Affected assets + evidence</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              {insight.affectedAssets.length > 0 && (
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">Assets</div>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {insight.affectedAssets.map((a) => (
                      <Badge key={a} variant="outline" className="font-mono text-[10px]">{a}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {insight.evidenceDatasetIds.length > 0 && (
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">Evidence datasets</div>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {insight.evidenceDatasetIds.map((d) => (
                      <Link key={d} to={`/catalog/${encodeURIComponent(d)}`} className="inline-flex items-center rounded-md border px-1.5 py-0.5 font-mono text-[10px] hover:bg-[var(--graphite-50)]">
                        {d}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}

