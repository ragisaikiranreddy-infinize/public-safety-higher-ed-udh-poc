/**
 * <SanctionTracker /> — outstanding sanction list with overdue highlight.
 *
 * Used inside /conduct as a callout strip. Surfaces overdue + pending
 * with due-date sort.
 */
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { Sanction } from '@/lib/types';
import { formatRelativeTime, cn } from '@/lib/utils';

interface Props {
  sanctions: Sanction[];
  /** Optional dataset mapping caseId → conductCase.summary for context. */
  caseSummaries?: Map<string, string>;
}

export function SanctionTracker({ sanctions, caseSummaries }: Props) {
  const pending = sanctions.filter((s) => s.status === 'pending' || s.status === 'overdue' || s.status === 'active');
  const sorted = pending.slice().sort((a, b) => {
    const aOverdue = a.status === 'overdue' ? 0 : 1;
    const bOverdue = b.status === 'overdue' ? 0 : 1;
    if (aOverdue !== bOverdue) return aOverdue - bOverdue;
    const aDue = a.dueAt ? new Date(a.dueAt).getTime() : Infinity;
    const bDue = b.dueAt ? new Date(b.dueAt).getTime() : Infinity;
    return aDue - bDue;
  });

  if (sorted.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-xs text-[var(--muted-foreground)]">
          No outstanding sanctions.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <ul className="divide-y">
          {sorted.slice(0, 30).map((s) => {
            const overdue = s.status === 'overdue';
            const summary = caseSummaries?.get(s.conductCaseId);
            return (
              <li
                key={s.id}
                className={cn(
                  'flex items-center justify-between gap-4 px-5 py-3 text-xs',
                  overdue && 'bg-[var(--signal-red-soft)]/20',
                )}
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <Badge variant="outline" className="text-[10px]">{s.kind}</Badge>
                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/conduct/${encodeURIComponent(s.conductCaseId)}`}
                      className="font-mono text-[10px] text-[var(--hub-700)] hover:underline"
                    >
                      {s.conductCaseId}
                    </Link>
                    <div className="text-[11px]">{s.description}</div>
                    {summary && <div className="line-clamp-1 text-[10px] text-[var(--muted-foreground)]">{summary}</div>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[var(--muted-foreground)]">
                    {s.dueAt ? `due ${formatRelativeTime(new Date(s.dueAt))}` : '—'}
                  </span>
                  <Badge variant={
                    s.status === 'overdue' ? 'danger'
                    : s.status === 'active' ? 'info'
                    : 'muted'
                  } className="text-[10px]">
                    {s.status}
                  </Badge>
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
