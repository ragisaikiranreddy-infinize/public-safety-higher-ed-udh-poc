/**
 * <AmnestyPanel /> — Medical Amnesty determination panel.
 *
 * Renders the 3 criteria with met/unmet chips + a recommendation banner.
 */
import { CheckCircle2, XCircle, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { AIAmnestyAssessment } from '@/lib/ai/mock-ai';
import { cn } from '@/lib/utils';

interface Props {
  assessment: AIAmnestyAssessment;
}

export function AmnestyPanel({ assessment }: Props) {
  return (
    <Card>
      <CardContent className="space-y-4 p-5">
        <div className="flex items-start gap-3">
          <div className="rounded-md bg-[var(--hub-100)] p-1.5 text-[var(--hub-700)]">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
              Medical Amnesty — AI determination aid
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <Badge variant={assessment.recommendInvoke ? 'success' : 'muted'} className="text-[10px]">
                {assessment.recommendInvoke ? 'Recommend: invoke amnesty' : 'Recommend: standard process'}
              </Badge>
              <span className="text-[10px] text-[var(--muted-foreground)]">confidence {assessment.confidence}%</span>
            </div>
          </div>
        </div>

        <p className="text-[12px] leading-relaxed">{assessment.headline}</p>

        <ul className="space-y-2">
          {assessment.criteria.map((c, i) => {
            const Icon = c.met ? CheckCircle2 : XCircle;
            return (
              <li
                key={i}
                className={cn(
                  'flex gap-3 rounded-md border bg-[var(--card)] p-3 text-xs',
                  c.met ? 'border-[var(--signal-green)]/30' : 'border-[var(--signal-amber)]/30',
                )}
              >
                <Icon className={cn('mt-0.5 h-4 w-4 flex-shrink-0', c.met ? 'text-[var(--signal-green)]' : 'text-[var(--signal-amber)]')} />
                <div className="min-w-0 flex-1">
                  <div className="font-semibold">{c.name}</div>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-[var(--muted-foreground)]">{c.rationale}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
