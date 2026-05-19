/**
 * <CaseBoard /> — kanban-style status board for conduct cases.
 *
 * Columns: reported / investigation / sanction-pending or active /
 * closed-or-amnesty. Click a card to deep-link to the case detail.
 */
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { ConductCase, ConductStatus } from '@/lib/types';
import { formatRelativeTime, cn } from '@/lib/utils';

const COLUMNS: { label: string; statuses: ConductStatus[]; tone: 'info' | 'warning' | 'muted' | 'success' }[] = [
  { label: 'Reported / Investigation', statuses: ['reported', 'investigation', 'pre-hearing'], tone: 'info' },
  { label: 'Pending sanction', statuses: ['hearing', 'sanction-pending'], tone: 'warning' },
  { label: 'Sanction active', statuses: ['sanction-active'], tone: 'warning' },
  { label: 'Closed', statuses: ['closed', 'closed-amnesty'], tone: 'success' },
];

interface Props {
  cases: ConductCase[];
}

export function CaseBoard({ cases }: Props) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
      {COLUMNS.map((col) => {
        const subset = cases.filter((c) => col.statuses.includes(c.status));
        return (
          <div key={col.label} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                {col.label}
              </div>
              <Badge variant={col.tone} className="text-[9px]">{subset.length}</Badge>
            </div>
            <div className="space-y-2">
              {subset.slice(0, 20).map((c) => (
                <Link key={c.id} to={`/conduct/${encodeURIComponent(c.id)}`}>
                  <Card className={cn(
                    'transition-colors hover:bg-[var(--graphite-50)]',
                    c.threadTag === 'A' && 'ring-2 ring-[var(--hub-500)]',
                  )}>
                    <CardContent className="space-y-1 p-3">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] text-[var(--hub-700)]">{c.id}</span>
                        <Badge variant="outline" className="text-[9px]">{c.subtype}</Badge>
                      </div>
                      <div className="line-clamp-2 text-[11px] leading-snug">{c.summary}</div>
                      <div className="flex items-center justify-between text-[10px] text-[var(--muted-foreground)]">
                        <span>{c.buildingId ?? '—'}</span>
                        <span>{formatRelativeTime(new Date(c.openedAt))}</span>
                      </div>
                      {(c.medicalAmnestyInvoked || c.parentalNotificationConsidered) && (
                        <div className="flex flex-wrap gap-1">
                          {c.medicalAmnestyInvoked && <Badge variant="success" className="text-[8px]">amnesty</Badge>}
                          {c.parentalNotificationConsidered && <Badge variant="muted" className="text-[8px]">FERPA §99.31</Badge>}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
              {subset.length > 20 && (
                <div className="text-center text-[10px] text-[var(--muted-foreground)]">+ {subset.length - 20} more</div>
              )}
              {subset.length === 0 && (
                <div className="rounded-md border border-dashed bg-[var(--graphite-50)] p-4 text-center text-[10px] text-[var(--muted-foreground)]">
                  None
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
