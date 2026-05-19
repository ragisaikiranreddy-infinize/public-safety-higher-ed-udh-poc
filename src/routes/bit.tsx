/**
 * /bit — CARE/BIT case board.
 *
 * Top strip: tier counters (mild · moderate · elevated · critical). Below:
 * filterable case list with Thread A pinned at the top.
 */
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ClassificationBadge } from '@/components/data-display/classification-badge';
import { BarrierIndicator } from '@/components/data-display/barrier-indicator';
import {
  BIT_CASES,
  bitCasesByRiskTier,
  openBITCasesCount,
  getPerson,
} from '@/lib/mock-db';
import { useRole } from '@/lib/role-context';
import { evaluateBarrier } from '@/lib/information-barriers';
import { formatRelativeTime, cn } from '@/lib/utils';
import type { BITRiskTier } from '@/lib/types';

const TIER_BG: Record<BITRiskTier, string> = {
  mild: 'bg-[var(--signal-green-soft)] text-[oklch(0.38_0.12_155)]',
  moderate: 'bg-[var(--signal-blue-soft)] text-[oklch(0.38_0.12_235)]',
  elevated: 'bg-[var(--signal-amber-soft)] text-[oklch(0.42_0.13_70)]',
  critical: 'bg-[var(--signal-red-soft)] text-[var(--signal-red)]',
};

export default function BITListPage() {
  const [filter, setFilter] = useState('');
  const [tierFilter, setTierFilter] = useState<'all' | BITRiskTier>('all');
  const { role } = useRole();

  const byTier = useMemo(() => bitCasesByRiskTier(), []);

  const filtered = useMemo(() => {
    let pool = BIT_CASES;
    if (tierFilter !== 'all') pool = pool.filter((c) => c.riskTier === tierFilter);
    const q = filter.trim().toLowerCase();
    if (!q) return pool;
    return pool.filter(
      (c) =>
        c.id.toLowerCase().includes(q) ||
        c.subjectPersonId.toLowerCase().includes(q) ||
        c.narrative.toLowerCase().includes(q),
    );
  }, [filter, tierFilter]);

  return (
    <>
      <PageHeader
        eyebrow="Threat Intel · CARE / BIT"
        title="Behavioral Intervention Team cases"
        description={`${openBITCasesCount()} open cases across the four NaBITA tiers. The case board reads from gold.bit_case_briefing_features — every signal that contributed to the tier classification is one click away.`}
      />

      <div className="space-y-6 px-8 py-6">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {(['critical', 'elevated', 'moderate', 'mild'] as BITRiskTier[]).map((t) => (
            <button
              key={t}
              onClick={() => setTierFilter((cur) => (cur === t ? 'all' : t))}
              className={cn(
                'rounded-md border p-4 text-left transition-colors',
                tierFilter === t && 'ring-2 ring-[var(--hub-500)]',
              )}
            >
              <div className={cn('inline-block rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider', TIER_BG[t])}>
                {t}
              </div>
              <div className="mt-2 font-display text-3xl font-semibold tabular-nums">
                {byTier[t].length}
              </div>
              <div className="text-[10px] text-[var(--muted-foreground)]">
                cases at this tier
              </div>
            </button>
          ))}
        </div>

        <Input
          type="search"
          placeholder="Search by case id, subject, narrative…"
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
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Subject</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Tier · trend</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Status</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Signals</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Last review</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => {
                    const barrier = evaluateBarrier({
                      actorRole: role,
                      fieldClassification: c.classification,
                      resourceKind: 'bit-case',
                      resourceId: c.id,
                    });
                    const blocked = !barrier.allowed;
                    const subj = getPerson(c.subjectPersonId);
                    const counts = c.contributorCounts;
                    const totalSignals =
                      counts.tips + counts.accessAnomalies + counts.cameraAnalytics +
                      counts.incidents + counts.conduct + counts.other;

                    return (
                      <tr
                        key={c.id}
                        className={cn(
                          'border-b last:border-0 hover:bg-[var(--graphite-50)]',
                          c.threadTag === 'A' && 'bg-[var(--hub-50)]/30',
                        )}
                      >
                        <td className="px-4 py-2">
                          {blocked ? (
                            <div className="flex items-center gap-1.5">
                              <BarrierIndicator barrierId={barrier.barrierHit?.id} size="sm" />
                              <span className="font-mono text-[10px]">{c.id}</span>
                            </div>
                          ) : (
                            <Link
                              to={`/bit/${encodeURIComponent(c.id)}`}
                              className="font-mono text-[var(--hub-700)] hover:underline"
                            >
                              {c.id}
                            </Link>
                          )}
                          {c.threadTag && (
                            <Badge variant="accent" className="ml-2 text-[9px]">Thread {c.threadTag}</Badge>
                          )}
                        </td>
                        <td className="px-4 py-2">
                          <Link
                            to={`/persons/${encodeURIComponent(c.subjectPersonId)}`}
                            className="font-mono text-[10px] text-[var(--hub-700)] hover:underline"
                          >
                            {subj?.fullName ?? c.subjectPersonId}
                          </Link>
                        </td>
                        <td className="px-4 py-2">
                          <span className={cn('inline-block rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase', TIER_BG[c.riskTier])}>
                            {c.riskTier}
                          </span>
                          <span className="ml-1.5 text-[10px] text-[var(--muted-foreground)]">{c.riskTrend}</span>
                        </td>
                        <td className="px-4 py-2">
                          <Badge variant="muted" className="text-[10px]">{c.status}</Badge>
                          {c.imminentThreatFinding && (
                            <Badge variant="danger" className="ml-1 text-[9px]">imminent</Badge>
                          )}
                        </td>
                        <td className="px-4 py-2 font-mono text-[10px] text-[var(--muted-foreground)]">
                          {totalSignals} ({counts.tips}t · {counts.accessAnomalies}a · {counts.cameraAnalytics}c · {counts.incidents}i)
                        </td>
                        <td className="px-4 py-2 text-[10px] text-[var(--muted-foreground)]">
                          <div className="flex items-center gap-1.5">
                            <span>{formatRelativeTime(new Date(c.lastReviewedAt))}</span>
                            {!blocked && (
                              <ClassificationBadge classification={c.classification} />
                            )}
                          </div>
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
