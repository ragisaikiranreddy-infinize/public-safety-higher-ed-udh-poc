/**
 * /metrics — Governed semantic-layer metrics catalog.
 *
 * Lists ~18 metrics with: ID, certification status, primary dataset,
 * default drill dimensions, unit, NL aliases. Used at R5+ as the
 * resolution target for AskHub NL→SQL.
 */
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { METRICS, certifiedMetrics } from '@/lib/mock-db';

export default function MetricsPage() {
  const [filter, setFilter] = useState('');

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return METRICS;
    return METRICS.filter(
      (m) =>
        m.id.toLowerCase().includes(q) ||
        m.label.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        m.nlAliases.some((a) => a.includes(q)),
    );
  }, [filter]);

  const certified = certifiedMetrics().length;

  return (
    <>
      <PageHeader
        eyebrow="Data · Semantic Layer"
        title="Metrics"
        description={`${METRICS.length} governed metrics. ${certified} certified. NL aliases here are what the Ask the Hub copilot (R5+) resolves NL queries against — no raw-table queries.`}
      />

      <div className="space-y-6 px-8 py-6">
        <Input
          type="search"
          placeholder="Search metrics by ID, label, NL alias…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {filtered.map((m) => (
            <Card key={m.id}>
              <CardContent className="p-5">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div>
                    <div className="font-mono text-[10px] text-[var(--muted-foreground)]">{m.id}</div>
                    <div className="font-display text-base font-semibold text-[var(--foreground)]">{m.label}</div>
                  </div>
                  {m.certified ? (
                    <Badge variant="success">certified</Badge>
                  ) : (
                    <Badge variant="warning">uncertified</Badge>
                  )}
                </div>
                <p className="mb-3 text-xs text-[var(--muted-foreground)]">{m.description}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <Field label="Primary dataset">
                    <Link
                      to={`/catalog/${encodeURIComponent(m.primaryDataset)}`}
                      className="font-mono text-[var(--hub-700)] hover:underline"
                    >
                      {m.primaryDataset}
                    </Link>
                  </Field>
                  <Field label="Unit">
                    <span className="text-[var(--foreground)]">{m.unit}</span>
                  </Field>
                  <Field label="Owner">
                    <span className="text-[var(--foreground)]">{m.owner}</span>
                  </Field>
                  {m.benchmarkValue !== undefined && (
                    <Field label="Benchmark">
                      <span className="font-mono text-[var(--foreground)]">{m.benchmarkValue}</span>
                    </Field>
                  )}
                </div>
                <div className="mt-3 flex flex-wrap gap-1">
                  {m.defaultDimensions.map((dim) => (
                    <Badge key={dim} variant="muted" className="text-[10px]">
                      {dim}
                    </Badge>
                  ))}
                </div>
                <div className="mt-3 text-[10px] text-[var(--muted-foreground)]">
                  <span className="font-semibold">NL aliases:</span> {m.nlAliases.join(' · ')}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">{label}</div>
      <div className="mt-0.5">{children}</div>
    </div>
  );
}
