/**
 * /workforce-analytics — workload + bias-audit aggregates across the roster.
 */
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { OFFICER_STATS, OFFICERS, workforceTotals } from '@/lib/mock-db';
import { cn } from '@/lib/utils';

export default function WorkforceAnalyticsPage() {
  const totals = useMemo(() => workforceTotals(), []);

  const highLoad = useMemo(
    () =>
      OFFICER_STATS
        .filter((s) => s.ytdIncidentCount > 80 && s.trainingHoursYTD < 24)
        .map((s) => ({ stat: s, officer: OFFICERS.find((o) => o.id === s.officerId)! }))
        .filter((x) => x.officer)
        .sort((a, b) => b.stat.ytdIncidentCount - a.stat.ytdIncidentCount),
    [],
  );

  const lowBias = useMemo(
    () =>
      OFFICER_STATS
        .filter((s) => s.biasAuditScore < 80)
        .map((s) => ({ stat: s, officer: OFFICERS.find((o) => o.id === s.officerId)! }))
        .filter((x) => x.officer)
        .sort((a, b) => a.stat.biasAuditScore - b.stat.biasAuditScore),
    [],
  );

  const ranksDistribution = useMemo(() => {
    const m: Record<string, number> = {};
    for (const o of OFFICERS) m[o.rank] = (m[o.rank] ?? 0) + 1;
    return m;
  }, []);

  return (
    <>
      <PageHeader
        eyebrow="Officers · Workforce analytics"
        title="Workforce analytics + bias audit"
        description="Roster-wide aggregates: ranks, training, complaints, use-of-force, bias-audit posture. Watchpoints surface officers with high incident load + low training hours."
      />
      <div className="space-y-6 px-8 py-6">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Kpi label="Officers" value={`${totals.officers}`} hint="sworn" />
          <Kpi label="CIT-trained" value={`${totals.citTrained}`} hint={`${Math.round((totals.citTrained / totals.officers) * 100)}%`} />
          <Kpi label="Avg bias-audit" value={`${totals.avgBiasAuditScore}`} hint="0–100" />
          <Kpi label="Use of force" value={`${totals.totalUseOfForce}`} hint="YTD across all officers" tone={totals.totalUseOfForce > 0 ? 'warn' : 'good'} />
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Ranks distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Object.entries(ranksDistribution).map(([rank, n]) => (
                <Badge key={rank} variant="muted" className="text-[10px]">{rank} · {n}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {highLoad.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">High incident load + low training hours ({highLoad.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ul className="divide-y">
                {highLoad.map((x) => (
                  <li key={x.stat.officerId} className="flex items-center justify-between gap-4 px-5 py-3 text-xs">
                    <div className="flex items-center gap-3">
                      <Link to={`/officers/${encodeURIComponent(x.officer.id)}`} className="font-mono text-[10px] text-[var(--hub-700)] hover:underline">{x.officer.id}</Link>
                      <span className="text-[11px]">{x.officer.fullName}</span>
                      <Badge variant="muted" className="text-[10px]">{x.officer.rank}</Badge>
                    </div>
                    <div className="text-[10px] text-[var(--muted-foreground)]">
                      {x.stat.ytdIncidentCount} incidents · <span className="text-[var(--signal-amber)]">{x.stat.trainingHoursYTD}h training</span>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {lowBias.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Bias-audit posture &lt; 80 ({lowBias.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ul className="divide-y">
                {lowBias.map((x) => (
                  <li key={x.stat.officerId} className="flex items-center justify-between gap-4 px-5 py-3 text-xs">
                    <div className="flex items-center gap-3">
                      <Link to={`/officers/${encodeURIComponent(x.officer.id)}`} className="font-mono text-[10px] text-[var(--hub-700)] hover:underline">{x.officer.id}</Link>
                      <span className="text-[11px]">{x.officer.fullName}</span>
                    </div>
                    <div className={cn(
                      'inline-block rounded-md px-1.5 py-0.5 text-[10px] font-semibold',
                      x.stat.biasAuditScore >= 78 ? 'bg-[var(--signal-amber-soft)] text-[oklch(0.42_0.13_70)]' : 'bg-[var(--signal-red-soft)] text-[var(--signal-red)]',
                    )}>
                      {x.stat.biasAuditScore}
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}

function Kpi({ label, value, hint, tone }: { label: string; value: string; hint: string; tone?: 'good' | 'warn' }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)]">{label}</div>
        <div className={cn(
          'mt-1 font-display text-3xl font-semibold tabular-nums',
          tone === 'warn' && 'text-[var(--signal-amber)]',
        )}>
          {value}
        </div>
        <div className="mt-1 text-[10px] text-[var(--muted-foreground)]">{hint}</div>
      </CardContent>
    </Card>
  );
}
