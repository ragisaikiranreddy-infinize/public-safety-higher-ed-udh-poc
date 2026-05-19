/**
 * <ParentalNotifDecisionAid /> — FERPA §99.31 decision-aid panel.
 *
 * Renders the two prongs ((a)(15) + (a)(10)) with applicability + rationale
 * and a top-level recommendation banner.
 */
import { ShieldCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { AIFerpaDecisionAid } from '@/lib/ai/mock-ai';
import { cn } from '@/lib/utils';

interface Props {
  aid: AIFerpaDecisionAid;
}

export function ParentalNotifDecisionAid({ aid }: Props) {
  const recommendationVariant: 'success' | 'muted' | 'warning' =
    aid.recommendation === 'notify' ? 'success'
    : aid.recommendation === 'decline' ? 'muted'
    : 'warning';

  return (
    <Card>
      <CardContent className="space-y-4 p-5">
        <div className="flex items-start gap-3">
          <div className="rounded-md bg-[var(--hub-100)] p-1.5 text-[var(--hub-700)]">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
              FERPA §99.31 — parental-notification decision aid
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <Badge variant={recommendationVariant} className="text-[10px]">
                Recommend: {aid.recommendation}
              </Badge>
            </div>
          </div>
        </div>

        <p className="text-[12px] leading-relaxed">{aid.headline}</p>

        <ul className="space-y-2">
          {aid.prongs.map((p, i) => (
            <li
              key={i}
              className={cn(
                'rounded-md border bg-[var(--card)] p-3 text-xs',
                p.applicable ? 'border-[var(--signal-green)]/30' : 'border-[var(--graphite-300)]',
              )}
            >
              <div className="flex items-center gap-2">
                <Badge variant={p.applicable ? 'success' : 'muted'} className="text-[10px]">
                  {p.applicable ? 'applies' : 'does not apply'}
                </Badge>
                <span className="font-mono text-[10px]">{p.citation}</span>
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-[var(--muted-foreground)]">{p.rationale}</p>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
