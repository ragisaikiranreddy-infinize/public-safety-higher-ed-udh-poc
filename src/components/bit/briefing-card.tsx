/**
 * <BriefingCard /> — the AI-Briefing surface for Person 360 + the BIT case page.
 *
 * Responsibilities:
 *   1. Stream the "Assembling…" plan tokens for a few hundred ms each so the
 *      demo *feels* like the AI is doing work (no real LLM). Done after R5
 *      v0; R9 will introduce real shimmer.
 *   2. Render the 7 cited bullets in order, each row with up to 3 citation chips.
 *   3. Render the risk-tier pill + four-dimension NaBITA stack.
 *   4. Surface barrier-hit citations distinctly via <BarrierIndicator/>.
 *   5. Show prediction-attribution footer (model + version + token counts).
 *
 * The component is purely presentational — it never decides what data to show.
 * The caller passes an AIBriefing struct, which was produced by mock-ai.ts
 * with barrier-aware logic.
 */
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Quote } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { BarrierIndicator } from '@/components/data-display/barrier-indicator';
import { ClassificationBadge } from '@/components/data-display/classification-badge';
import { RiskGauge } from './risk-gauge';
import type { AIBriefing, AICitation } from '@/lib/ai/mock-ai';
import type { BITRiskTier, BITRiskTrend } from '@/lib/types';

interface Props {
  briefing: AIBriefing;
  nabita: { subject: number; target: number; environment: number; precipitating: number };
}

export function BriefingCard({ briefing, nabita }: Props) {
  // ----- streaming plan tokens (decorative; 200..320ms per token) -----
  const [streamIndex, setStreamIndex] = useState(0);
  const totalSteps = briefing.streamingPlan.length;
  useEffect(() => {
    if (streamIndex >= totalSteps) return;
    const step = briefing.streamingPlan[streamIndex];
    const t = window.setTimeout(() => setStreamIndex((i) => i + 1), step.delayMs);
    return () => window.clearTimeout(t);
  }, [streamIndex, totalSteps, briefing.streamingPlan]);

  const streamingDone = streamIndex >= totalSteps;

  // ----- risk tier mapping for the gauge -----
  const tier = useMemo<BITRiskTier | null>(() => {
    if (!briefing.risk) return null;
    return briefing.risk.tier as BITRiskTier;
  }, [briefing.risk]);
  const trend = (briefing.risk?.trend as BITRiskTrend | undefined) ?? 'stable';

  if (!briefing.available) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-xs text-[var(--muted-foreground)]">
          AI briefing is not available for this subject in the current role.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="space-y-5 p-5">
        {/* Header — sparkle + headline */}
        <div className="flex items-start gap-3">
          <div className="rounded-md bg-[var(--hub-100)] p-1.5 text-[var(--hub-700)]">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
              AI Briefing · multi-source summary
            </div>
            <p className="mt-0.5 text-sm font-medium text-[var(--foreground)]">{briefing.headline}</p>
          </div>
        </div>

        {/* Streaming plan log */}
        <div className="rounded-md border border-dashed bg-[var(--graphite-50)] p-3 font-mono text-[10px] leading-relaxed text-[var(--muted-foreground)]">
          {briefing.streamingPlan.slice(0, streamIndex).map((step, i) => (
            <div key={i}>{step.text}</div>
          ))}
          {!streamingDone && streamIndex < totalSteps && (
            <div className="animate-pulse">{briefing.streamingPlan[streamIndex].text}…</div>
          )}
          {streamingDone && (
            <div className="text-[var(--signal-green)]">✓ streaming complete</div>
          )}
        </div>

        <Separator />

        {/* Risk gauge */}
        {tier && briefing.risk && (
          <div className="rounded-md border bg-[var(--card)] p-3">
            <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
              NaBITA-aligned risk
            </div>
            <RiskGauge
              tier={tier}
              trend={trend}
              nabita={nabita}
              confidence={briefing.risk.confidence}
              rationale={briefing.risk.rationale}
            />
          </div>
        )}

        <Separator />

        {/* The 7 bullets */}
        <ol className="space-y-3.5">
          {briefing.bullets.map((b, i) => (
            <li key={i} className="flex gap-3">
              <span className="mt-0.5 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[var(--hub-100)] text-[10px] font-semibold text-[var(--hub-700)]">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] leading-relaxed text-[var(--foreground)]">
                  {b.hasBarrier && <Quote className="mr-1 inline h-3 w-3 text-[var(--barrier)]" />}
                  {b.claim}
                </p>
                {b.detail && (
                  <p className="mt-1 text-[11px] leading-relaxed text-[var(--muted-foreground)]">
                    {b.detail}
                  </p>
                )}
                {b.citations.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    <span className="text-[9px] uppercase tracking-wider text-[var(--muted-foreground)]">
                      cites
                    </span>
                    {b.citations.map((c, ci) => (
                      <CitationChip key={ci} citation={c} />
                    ))}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ol>

        <Separator />

        {/* Prediction-attribution footer */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-[var(--muted-foreground)]">
          <span>
            <span className="font-semibold text-[var(--foreground)]">model</span>{' '}
            {briefing.model.name}
            <span className="ml-1 font-mono">{briefing.model.version}</span>
          </span>
          <span>
            <span className="font-semibold text-[var(--foreground)]">tokens</span>{' '}
            {briefing.model.promptTokens.toLocaleString()} in · {briefing.model.completionTokens.toLocaleString()} out
          </span>
          {briefing.barriersInvoked.length > 0 && (
            <span>
              <span className="font-semibold text-[var(--barrier)]">barriers</span>{' '}
              {briefing.barriersInvoked.join(', ')}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function CitationChip({ citation }: { citation: AICitation }) {
  if (citation.kind === 'barrier-hit') {
    return <BarrierIndicator barrierId={citation.refId} size="sm" />;
  }

  const inner = (
    <>
      <ClassificationBadge classification={citation.classification} />
      <span className="ml-1 font-mono text-[10px]">{citation.label}</span>
    </>
  );

  if (citation.linkedRoute) {
    return (
      <Link
        to={citation.linkedRoute}
        className="inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] hover:bg-[var(--graphite-50)]"
      >
        {inner}
      </Link>
    );
  }

  return (
    <Badge variant="outline" className="text-[10px]">
      {inner}
    </Badge>
  );
}
