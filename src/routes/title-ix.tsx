/**
 * /title-ix — Title IX case list (walled by default).
 *
 * Most personas see "fact-of-record only" — the IB-TIX-TO-PD-HARD barrier
 * masks the case content. Title IX Coordinator sees full content.
 */
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { BarrierIndicator } from '@/components/data-display/barrier-indicator';
import { ClassificationBadge } from '@/components/data-display/classification-badge';
import { TITLE_IX_CASES } from '@/lib/mock-db';
import { useRole } from '@/lib/role-context';
import { evaluateBarrier } from '@/lib/information-barriers';
import { formatRelativeTime } from '@/lib/utils';

export default function TitleIXListPage() {
  const [filter, setFilter] = useState('');
  const { role } = useRole();

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return TITLE_IX_CASES;
    return TITLE_IX_CASES.filter((c) =>
      c.id.toLowerCase().includes(q) || c.phase.toLowerCase().includes(q),
    );
  }, [filter]);

  return (
    <>
      <PageHeader
        eyebrow="Title IX · Walled"
        title="Title IX cases"
        description={`${TITLE_IX_CASES.length} case(s) in the Title IX workflow. The IB-TIX-TO-PD-HARD barrier masks case content from non-Title-IX roles — switch to the Title IX Coordinator role to see headline + narrative.`}
      />
      <div className="space-y-6 px-8 py-6">
        <Input
          type="search"
          placeholder="Search by case id, phase…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="border-b bg-[var(--graphite-50)]">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Case</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Phase</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Headline</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Opened</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Tier</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => {
                    const barrier = evaluateBarrier({
                      actorRole: role,
                      fieldClassification: c.classification,
                      resourceKind: 'tix-case',
                      resourceId: c.id,
                    });
                    const blocked = !barrier.allowed;
                    return (
                      <tr key={c.id} className="border-b last:border-0 hover:bg-[var(--graphite-50)]">
                        <td className="px-4 py-2">
                          {blocked ? (
                            <div className="flex items-center gap-1.5">
                              <BarrierIndicator barrierId={barrier.barrierHit?.id} size="sm" />
                              <span className="font-mono text-[10px]">{c.id}</span>
                            </div>
                          ) : (
                            <Link to={`/title-ix/${encodeURIComponent(c.id)}`} className="font-mono text-[var(--hub-700)] hover:underline">
                              {c.id}
                            </Link>
                          )}
                          {c.threadTag && (
                            <Badge variant="accent" className="ml-2 text-[9px]">Thread {c.threadTag}</Badge>
                          )}
                        </td>
                        <td className="px-4 py-2">
                          <Badge variant="muted" className="text-[10px]">{c.phase}</Badge>
                        </td>
                        <td className="px-4 py-2">
                          {blocked ? (
                            <span className="text-[var(--barrier)]">[content withheld]</span>
                          ) : (
                            c.headline
                          )}
                        </td>
                        <td className="px-4 py-2 text-[10px] text-[var(--muted-foreground)]">
                          {formatRelativeTime(new Date(c.openedAt))}
                        </td>
                        <td className="px-4 py-2">
                          <ClassificationBadge classification={c.classification} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
