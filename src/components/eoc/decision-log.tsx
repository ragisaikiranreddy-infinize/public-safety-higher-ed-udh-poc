/**
 * <DecisionLog /> — formal decisions with rationale + alternatives.
 *
 * This is the FEMA / Stafford Act audit-trail surface. Each row is rendered
 * as a card with the decision headline, who made it, the rationale, and the
 * alternatives that were considered.
 */
import { ScrollText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { DecisionLogEntry } from '@/lib/types';
import { formatRelativeTime } from '@/lib/utils';

interface Props {
  entries: DecisionLogEntry[];
}

export function DecisionLog({ entries }: Props) {
  if (entries.length === 0) {
    return (
      <div className="rounded-md border bg-[var(--graphite-50)] p-4 text-center text-xs text-[var(--muted-foreground)]">
        No formal decisions logged for this activation yet.
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {entries.map((d) => (
        <li key={d.id} className="rounded-md border bg-[var(--card)] p-4 text-xs">
          <div className="flex items-start gap-3">
            <ScrollText className="mt-0.5 h-4 w-4 text-[var(--hub-700)]" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-[10px] text-[var(--muted-foreground)]">{d.id}</span>
                <Badge variant="muted" className="text-[9px]">{d.authorRole}</Badge>
                <span className="text-[10px] text-[var(--muted-foreground)]">
                  {formatRelativeTime(new Date(d.at))}
                </span>
              </div>
              <p className="mt-1 text-[13px] font-semibold leading-snug">{d.decision}</p>
              <p className="mt-1 leading-relaxed text-[var(--foreground)]">{d.rationale}</p>
              {d.alternativesConsidered && d.alternativesConsidered.length > 0 && (
                <div className="mt-2">
                  <div className="text-[9px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                    Alternatives considered
                  </div>
                  <ul className="mt-1 list-disc space-y-1 pl-5 text-[11px] leading-relaxed text-[var(--muted-foreground)]">
                    {d.alternativesConsidered.map((alt, i) => (
                      <li key={i}>{alt}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
