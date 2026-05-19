/**
 * /foia/requests/:id — FOIA request detail + AI-assisted redaction preview.
 *
 * The Thread C anchor (FOIA-2026-077) shows the full AI redaction surface:
 *   - streaming-plan log
 *   - per-classification masking breakdown
 *   - per-field masking breakdown
 *   - sample redacted excerpt
 *   - attorney-review items with rationale
 */
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Sparkles, FileDown, AlertOctagon, ScrollText } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ClassificationBadge } from '@/components/data-display/classification-badge';
import { getFOIARequest } from '@/lib/mock-db';
import { redactFoia, type AIRedactionResult } from '@/lib/ai/mock-ai';
import { formatRelativeTime, cn } from '@/lib/utils';
import type { Classification } from '@/lib/types';
import NotFoundPage from './not-found';

export default function FOIADetailPage() {
  const { id = '' } = useParams<{ id: string }>();
  const req = getFOIARequest(id);
  const [aiResult, setAiResult] = useState<AIRedactionResult | null>(null);
  const [streamIndex, setStreamIndex] = useState(0);

  useEffect(() => {
    if (!aiResult) return;
    const total = aiResult.streamingPlan.length;
    if (streamIndex >= total) return;
    const step = aiResult.streamingPlan[streamIndex];
    const t = window.setTimeout(() => setStreamIndex((i) => i + 1), step.delayMs);
    return () => window.clearTimeout(t);
  }, [streamIndex, aiResult]);

  if (!req) return <NotFoundPage />;

  function handleRunRedaction() {
    if (!req) return;
    const r = redactFoia(req.id);
    setAiResult(r);
    setStreamIndex(0);
  }

  const overdue = new Date(req.dueAt).getTime() < Date.now()
    && req.status !== 'released' && req.status !== 'denied' && req.status !== 'closed';

  return (
    <>
      <PageHeader
        eyebrow="Compliance · FOIA"
        title={req.id}
        description={`${req.requesterName} · received ${formatRelativeTime(new Date(req.receivedAt))} · due ${formatRelativeTime(new Date(req.dueAt))}${overdue ? ' (overdue)' : ''}`}
      />

      <div className="space-y-6 px-8 py-6">
        <Card>
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="flex items-center gap-3">
              <ClassificationBadge classification={req.classification} />
              <Badge variant="muted">{req.status}</Badge>
              <Badge variant="outline" className="text-[10px]">{req.requesterAffiliation}</Badge>
              {req.threadTag && <Badge variant="accent">Thread {req.threadTag}</Badge>}
              {overdue && <Badge variant="danger">overdue</Badge>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Request</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <p className="rounded-md border bg-[var(--graphite-50)] p-3 leading-relaxed">{req.request}</p>
            {req.scope.incidentIds.length > 0 && (
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                  Scope — responsive incidents
                </div>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {req.scope.incidentIds.map((iid) => (
                    <Link key={iid} to={`/incidents/${encodeURIComponent(iid)}`} className="inline-flex items-center rounded-md border px-1.5 py-0.5 font-mono text-[10px] hover:bg-[var(--graphite-50)]">
                      {iid}
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {req.scope.crimeCategories && req.scope.crimeCategories.length > 0 && (
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                  Scope — crime categories
                </div>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {req.scope.crimeCategories.map((c) => (
                    <Badge key={c} variant="outline" className="text-[10px]">{c}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[var(--hub-700)]" />
              AI-assisted redaction
            </CardTitle>
            <Button onClick={handleRunRedaction} size="sm" variant="default">
              <FileDown className="h-3.5 w-3.5" />
              <span className="ml-1">Run redaction</span>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {!aiResult ? (
              <p className="rounded-md border bg-[var(--graphite-50)] p-4 text-xs text-[var(--muted-foreground)]">
                Click <strong>Run redaction</strong> to generate an AI-assisted redaction preview across the responsive records.
                The preview proposes field-level masks by classification, surfaces a sample excerpt, and flags low-confidence items
                for attorney review.
              </p>
            ) : (
              <>
                {/* Streaming plan */}
                <div className="rounded-md border border-dashed bg-[var(--graphite-50)] p-3 font-mono text-[10px] leading-relaxed text-[var(--muted-foreground)]">
                  {aiResult.streamingPlan.slice(0, streamIndex).map((s, i) => (
                    <div key={i}>{s.text}</div>
                  ))}
                  {streamIndex < aiResult.streamingPlan.length && (
                    <div className="animate-pulse">{aiResult.streamingPlan[streamIndex].text}…</div>
                  )}
                  {streamIndex >= aiResult.streamingPlan.length && (
                    <div className="text-[var(--signal-green)]">✓ redaction complete</div>
                  )}
                </div>

                <p className="text-[13px] leading-relaxed">{aiResult.headline}</p>

                <Separator />

                {/* Per-classification breakdown */}
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                    Masked by classification
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {Object.entries(aiResult.maskedByClassification).map(([cls, n]) => (
                      <div key={cls} className="flex items-center gap-1.5 rounded-md border bg-[var(--card)] px-2 py-1 text-xs">
                        <ClassificationBadge classification={cls as Classification} />
                        <span className="font-mono">{n}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Per-field breakdown */}
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                    Masked by field
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-1.5 md:grid-cols-3">
                    {Object.entries(aiResult.maskedByField).map(([field, n]) => (
                      <div key={field} className="flex items-center justify-between rounded-md border bg-[var(--card)] px-2 py-1 text-xs">
                        <span className="font-mono text-[10px]">{field}</span>
                        <span className="font-mono">{n}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Sample excerpt */}
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                    Sample redacted excerpt
                  </div>
                  <div className="mt-2 rounded-md border bg-[var(--graphite-50)] p-3 font-mono text-[11px] leading-relaxed">
                    {aiResult.sampleExcerpt}
                  </div>
                </div>

                {/* Attorney review */}
                {aiResult.attorneyReviewItems.length > 0 && (
                  <div className={cn(
                    'rounded-md border border-[var(--signal-amber)]/40 bg-[var(--signal-amber-soft)]/30 p-3',
                  )}>
                    <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--signal-amber)]">
                      <AlertOctagon className="h-3.5 w-3.5" />
                      Items flagged for attorney review ({aiResult.attorneyReviewItems.length})
                    </div>
                    <ul className="space-y-2">
                      {aiResult.attorneyReviewItems.map((it, i) => (
                        <li key={i} className="rounded-md border bg-[var(--card)] p-2.5 text-xs">
                          <div className="flex items-center gap-2">
                            <ScrollText className="h-3.5 w-3.5 text-[var(--signal-amber)]" />
                            <span className="font-medium">{it.item}</span>
                          </div>
                          <p className="mt-1 text-[11px] leading-relaxed text-[var(--muted-foreground)]">{it.reason}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <Separator />

                {/* Model attribution */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-[var(--muted-foreground)]">
                  <span>
                    <span className="font-semibold text-[var(--foreground)]">model</span>{' '}
                    {aiResult.model.name} <span className="font-mono">{aiResult.model.version}</span>
                  </span>
                  <span>
                    <span className="font-semibold text-[var(--foreground)]">tokens</span>{' '}
                    {aiResult.model.promptTokens.toLocaleString()} in · {aiResult.model.completionTokens.toLocaleString()} out
                  </span>
                  <span>
                    <span className="font-semibold text-[var(--foreground)]">confidence</span>{' '}
                    {aiResult.confidence}%
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
