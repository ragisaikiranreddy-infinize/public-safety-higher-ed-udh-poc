/**
 * /bias — Bias Response Team workflow.
 */
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { BarrierIndicator } from '@/components/data-display/barrier-indicator';
import {
  BIAS_INCIDENTS, biasIncidentsHateCrimeThresholdMet,
} from '@/lib/mock-db';
import { useRole } from '@/lib/role-context';
import { evaluateBarrier } from '@/lib/information-barriers';
import { formatRelativeTime, cn } from '@/lib/utils';

export default function BiasPage() {
  const [filter, setFilter] = useState('');
  const { role } = useRole();
  const hateCrimeThreshold = biasIncidentsHateCrimeThresholdMet();

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return BIAS_INCIDENTS;
    return BIAS_INCIDENTS.filter(
      (b) =>
        b.id.toLowerCase().includes(q) ||
        b.summary.toLowerCase().includes(q) ||
        b.biasCategory.toLowerCase().includes(q),
    );
  }, [filter]);

  return (
    <>
      <PageHeader
        eyebrow="Conduct · Bias Response Team"
        title="Bias incidents"
        description={`${BIAS_INCIDENTS.length} bias-incident reports · ${hateCrimeThreshold.length} crossed the criminal hate-crime threshold. IB-BART-TO-PD-COND masks bias-incident content from PD by default; criminal-threshold cases get a conditional referral.`}
      />

      <div className="space-y-6 px-8 py-6">
        <Input
          type="search"
          placeholder="Search by id, bias category, summary…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="border-b bg-[var(--graphite-50)]">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Report</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Bias category</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Status</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Hate-crime threshold</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Summary</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Reported</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((b) => {
                    const barrier = evaluateBarrier({
                      actorRole: role,
                      fieldClassification: b.classification,
                      resourceKind: 'bias-incident',
                      resourceId: b.id,
                    });
                    // Conditional override: hate-crime threshold met allows PD to see
                    const blocked = !barrier.allowed && !b.hateCrimeThresholdMet;
                    return (
                      <tr key={b.id} className={cn(
                        'border-b last:border-0 hover:bg-[var(--graphite-50)]',
                        b.hateCrimeThresholdMet && 'bg-[var(--signal-red-soft)]/20',
                      )}>
                        <td className="px-4 py-2 font-mono text-[10px]">
                          {blocked ? (
                            <div className="flex items-center gap-1.5">
                              <BarrierIndicator barrierId={barrier.barrierHit?.id} size="sm" />
                              <span>{b.id}</span>
                            </div>
                          ) : (
                            b.id
                          )}
                        </td>
                        <td className="px-4 py-2"><Badge variant="outline" className="text-[10px]">{b.biasCategory}</Badge></td>
                        <td className="px-4 py-2"><Badge variant="muted" className="text-[10px]">{b.status}</Badge></td>
                        <td className="px-4 py-2">
                          {b.hateCrimeThresholdMet ? (
                            <Badge variant="danger" className="text-[10px]">threshold met</Badge>
                          ) : (
                            <span className="text-[10px] text-[var(--muted-foreground)]">—</span>
                          )}
                        </td>
                        <td className="px-4 py-2 max-w-[400px] text-[11px]">
                          {blocked ? (
                            <span className="text-[var(--barrier)]">[Content withheld — bias barrier]</span>
                          ) : (
                            b.summary
                          )}
                        </td>
                        <td className="px-4 py-2 text-[10px] text-[var(--muted-foreground)]">
                          <div className="flex items-center gap-2">
                            <span>{formatRelativeTime(new Date(b.reportedAt))}</span>
                            {b.linkedIncidentId && (
                              <Link to={`/incidents/${encodeURIComponent(b.linkedIncidentId)}`} className="font-mono text-[var(--hub-700)] hover:underline">
                                → PD
                              </Link>
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
