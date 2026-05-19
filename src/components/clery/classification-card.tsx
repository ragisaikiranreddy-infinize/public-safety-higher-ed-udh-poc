/**
 * <ClassificationCard /> — Clery-classification suggestion card.
 *
 * Renders the AI-suggested crime + geography + confidence + rationale,
 * with a lineage trace back to bronze. Used on the ASR cell drill-down
 * and as a callout on the incident detail page.
 */
import { Link } from 'react-router-dom';
import { Sparkles, AlertOctagon, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { AICleryClassification } from '@/lib/ai/mock-ai';

interface Props {
  classification: AICleryClassification;
}

export function ClassificationCard({ classification: c }: Props) {
  return (
    <Card>
      <CardContent className="space-y-4 p-5">
        <div className="flex items-start gap-3">
          <div className="rounded-md bg-[var(--hub-100)] p-1.5 text-[var(--hub-700)]">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
              Clery classification · AI suggestion
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              {c.reportable ? (
                <Badge variant="success" className="text-[10px]">
                  <CheckCircle2 className="mr-0.5 h-3 w-3" /> reportable
                </Badge>
              ) : (
                <Badge variant="muted" className="text-[10px]">not reportable</Badge>
              )}
              {c.crime && (
                <Badge variant="outline" className="text-[10px]">{c.crime}</Badge>
              )}
              {c.geography && (
                <Badge variant="outline" className="text-[10px]">{c.geography}</Badge>
              )}
              <span className="text-[10px] text-[var(--muted-foreground)]">
                confidence {c.confidence}%
              </span>
            </div>
          </div>
        </div>

        <p className="text-[12px] leading-relaxed text-[var(--foreground)]">{c.rationale}</p>

        {c.reviewFlags.length > 0 && (
          <div className="rounded-md border border-[var(--signal-amber)]/40 bg-[var(--signal-amber-soft)]/30 p-3 text-xs">
            <div className="mb-1 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--signal-amber)]">
              <AlertOctagon className="h-3.5 w-3.5" />
              Review flags
            </div>
            <ul className="list-disc space-y-1 pl-5 text-[11px] leading-relaxed">
              {c.reviewFlags.map((f, i) => <li key={i}>{f}</li>)}
            </ul>
          </div>
        )}

        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
            Source-to-line lineage
          </div>
          <ol className="mt-1.5 space-y-1.5">
            {c.lineage.map((step, i) => (
              <li key={i} className="flex items-center gap-2 text-xs">
                <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[var(--graphite-100)] text-[9px] font-mono">
                  {i + 1}
                </span>
                <Link
                  to={`/catalog/${encodeURIComponent(step.dataset)}`}
                  className="font-mono text-[var(--hub-700)] hover:underline"
                >
                  {step.dataset}
                </Link>
                <span className="text-[10px] text-[var(--muted-foreground)]">·</span>
                <span className="font-mono text-[10px] text-[var(--muted-foreground)]">{step.rowRef}</span>
              </li>
            ))}
          </ol>
        </div>

        {c.asrLineItemId && (
          <div className="text-[11px]">
            <span className="text-[var(--muted-foreground)]">Feeds ASR cell: </span>
            <Link
              to={`/clery/asr/${THREAD_C_REPORTING_YEAR}`}
              className="font-mono text-[var(--hub-700)] hover:underline"
            >
              {c.asrLineItemId}
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

const THREAD_C_REPORTING_YEAR = 2025;
