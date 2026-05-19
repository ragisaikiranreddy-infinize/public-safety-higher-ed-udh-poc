/**
 * /regulations — regulatory citation registry.
 */
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { REGULATIONS } from '@/lib/mock-db';
import { formatRelativeTime } from '@/lib/utils';

export default function RegulationsPage() {
  const [filter, setFilter] = useState('');
  const [jurFilter, setJurFilter] = useState<'all' | 'federal' | 'state' | 'institutional'>('all');

  const filtered = useMemo(() => {
    let pool = REGULATIONS;
    if (jurFilter !== 'all') pool = pool.filter((r) => r.jurisdiction === jurFilter);
    const q = filter.trim().toLowerCase();
    if (!q) return pool;
    return pool.filter(
      (r) =>
        r.id.toLowerCase().includes(q) ||
        r.shortName.toLowerCase().includes(q) ||
        r.longName.toLowerCase().includes(q) ||
        r.scope.toLowerCase().includes(q),
    );
  }, [filter, jurFilter]);

  return (
    <>
      <PageHeader
        eyebrow="Trust · Regulations"
        title="Regulatory registry"
        description={`${REGULATIONS.length} regulations — federal, state, and institutional — that the platform's policies and information barriers map back to.`}
      />

      <div className="space-y-6 px-8 py-6">
        <div className="flex flex-wrap items-center gap-2">
          {(['all', 'federal', 'state', 'institutional'] as const).map((j) => (
            <button
              key={j}
              onClick={() => setJurFilter(j)}
              className={
                'rounded-md border px-3 py-1.5 text-xs font-semibold transition-colors ' +
                (jurFilter === j
                  ? 'border-[var(--hub-500)] bg-[var(--hub-50)] text-[var(--hub-700)]'
                  : 'text-[var(--muted-foreground)] hover:bg-[var(--graphite-50)]')
              }
            >
              {j}
            </button>
          ))}
        </div>

        <Input
          type="search"
          placeholder="Search by id, name, citation, or scope…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {filtered.map((r) => (
            <Card key={r.id}>
              <CardContent className="space-y-2 p-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-[var(--muted-foreground)]">{r.id}</span>
                  <Badge variant="outline" className="text-[10px]">{r.jurisdiction}</Badge>
                </div>
                <div className="font-display text-base font-semibold">{r.shortName}</div>
                <div className="text-[11px] text-[var(--muted-foreground)]">{r.longName}</div>
                <div className="text-[10px] font-mono text-[var(--muted-foreground)]">{r.citation}</div>
                <p className="text-[11px] leading-relaxed">{r.scope}</p>
                {r.policyIds.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1">
                    <span className="text-[9px] uppercase tracking-wider text-[var(--muted-foreground)]">policies</span>
                    {r.policyIds.map((pid) => (
                      <Link key={pid} to="/policies" className="font-mono text-[10px] text-[var(--hub-700)] hover:underline">
                        {pid}
                      </Link>
                    ))}
                  </div>
                )}
                <div className="text-[10px] text-[var(--muted-foreground)]">
                  last amended {formatRelativeTime(new Date(r.lastAmendedAt))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
