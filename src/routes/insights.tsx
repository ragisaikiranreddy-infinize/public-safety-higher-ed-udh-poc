/**
 * /insights — insight feed across all three threads.
 */
import { useMemo, useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { InsightCard } from '@/components/ai-surfaces/insight-card';
import { INSIGHTS } from '@/lib/mock-db';
import { cn } from '@/lib/utils';
import type { InsightKind } from '@/lib/types';

export default function InsightsPage() {
  const [filter, setFilter] = useState('');
  const [kindFilter, setKindFilter] = useState<'all' | InsightKind>('all');

  const filtered = useMemo(() => {
    let pool = INSIGHTS;
    if (kindFilter !== 'all') pool = pool.filter((i) => i.kind === kindFilter);
    const q = filter.trim().toLowerCase();
    if (!q) return pool;
    return pool.filter(
      (i) => i.id.toLowerCase().includes(q) || i.title.toLowerCase().includes(q),
    );
  }, [filter, kindFilter]);

  return (
    <>
      <PageHeader
        eyebrow="Intelligence · Insights"
        title="Insight feed"
        description={`${INSIGHTS.length} insights — root-cause analyses, predictions, and anomalies across the medallion catalog. Click an insight to expand the narrative + see recommended actions.`}
      />
      <div className="space-y-6 px-8 py-6">
        <div className="flex flex-wrap items-center gap-2">
          {(['all', 'rca', 'prediction', 'anomaly'] as const).map((k) => (
            <button
              key={k}
              onClick={() => setKindFilter(k)}
              className={cn(
                'rounded-md border px-3 py-1.5 text-xs font-semibold transition-colors',
                kindFilter === k
                  ? 'border-[var(--hub-500)] bg-[var(--hub-50)] text-[var(--hub-700)]'
                  : 'text-[var(--muted-foreground)] hover:bg-[var(--graphite-50)]',
              )}
            >
              {k}
            </button>
          ))}
        </div>

        <Input
          type="search"
          placeholder="Search insights…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />

        {filtered.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-xs text-[var(--muted-foreground)]">
              No insights match.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {filtered.map((i) => (
              <InsightCard key={i.id} insight={i} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
