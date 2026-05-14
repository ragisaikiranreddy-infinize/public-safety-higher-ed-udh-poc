/**
 * /sources — Source registry.
 *
 * Filterable table of 22 sources with health-composite, protocol, cadence,
 * sensitivity tier, owner, and connected dataset count. Click → /sources/:id.
 */
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ClassificationBadge } from '@/components/data-display/classification-badge';
import { FreshnessPill } from '@/components/data-display/freshness-pill';
import { DomainIcon } from '@/components/data-display/domain-icon';
import { SOURCES, sourcesUnhealthy, sourcesRequiringCredentialRotation } from '@/lib/mock-db';

export default function SourcesPage() {
  const [filter, setFilter] = useState('');

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return SOURCES;
    return SOURCES.filter(
      (s) =>
        s.id.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q) ||
        s.vendor.toLowerCase().includes(q) ||
        s.category.includes(q),
    );
  }, [filter]);

  const unhealthyCount = sourcesUnhealthy().length;
  const rotationDue = sourcesRequiringCredentialRotation().length;

  return (
    <>
      <PageHeader
        eyebrow="Data · Source Registry"
        title="Sources"
        description={`${SOURCES.length} connected source systems. Each emits one or more Bronze datasets; health composite is freshness × completeness × schema stability.`}
        actions={
          <div className="flex items-center gap-2">
            <Badge variant="danger">{unhealthyCount} unhealthy</Badge>
            <Badge variant="warning">{rotationDue} rotations due</Badge>
          </div>
        }
      />

      <div className="space-y-6 px-8 py-6">
        <Input
          type="search"
          placeholder="Search sources by ID, name, vendor, category…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="border-b bg-[var(--graphite-50)]">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Source</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Category</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Protocol</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Cadence</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Tier</th>
                    <th className="px-4 py-2 text-right font-medium text-[var(--muted-foreground)]">Health</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Last run</th>
                    <th className="px-4 py-2 text-right font-medium text-[var(--muted-foreground)]">Datasets</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s) => (
                    <tr key={s.id} className="border-b last:border-0 hover:bg-[var(--graphite-50)]">
                      <td className="px-4 py-2">
                        <Link to={`/sources/${encodeURIComponent(s.id)}`} className="flex items-center gap-2">
                          <DomainIcon domainId={s.domainId} className="text-[var(--graphite-500)]" />
                          <div>
                            <div className="font-mono text-[var(--foreground)]">{s.id}</div>
                            <div className="text-[10px] text-[var(--muted-foreground)]">{s.name}</div>
                          </div>
                        </Link>
                      </td>
                      <td className="px-4 py-2"><Badge variant="muted">{s.category}</Badge></td>
                      <td className="px-4 py-2"><Badge variant="outline">{s.protocol}</Badge></td>
                      <td className="px-4 py-2 text-[var(--muted-foreground)]">{s.cadence}</td>
                      <td className="px-4 py-2"><ClassificationBadge classification={s.sensitivityTier} /></td>
                      <td className="px-4 py-2 text-right">
                        <HealthBadge score={s.health.composite} />
                      </td>
                      <td className="px-4 py-2"><FreshnessPill lastUpdatedIso={s.health.lastSuccessfulRunAt} /></td>
                      <td className="px-4 py-2 text-right tabular-nums">{s.connectedDatasetIds.length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function HealthBadge({ score }: { score: number }) {
  if (score >= 95) return <Badge variant="success">{score}</Badge>;
  if (score >= 90) return <Badge variant="info">{score}</Badge>;
  if (score >= 80) return <Badge variant="warning">{score}</Badge>;
  return <Badge variant="danger">{score}</Badge>;
}
