/**
 * /officers — roster + workload + bias-audit overview.
 */
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { OFFICERS, getOfficerStats, workforceTotals } from '@/lib/mock-db';
import { cn } from '@/lib/utils';

export default function OfficersPage() {
  const [filter, setFilter] = useState('');
  const totals = useMemo(() => workforceTotals(), []);

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return OFFICERS;
    return OFFICERS.filter(
      (o) => o.id.toLowerCase().includes(q) || o.fullName.toLowerCase().includes(q) || o.rank.toLowerCase().includes(q),
    );
  }, [filter]);

  return (
    <>
      <PageHeader
        eyebrow="Officers · Roster"
        title="Officer roster"
        description={`${totals.officers} sworn officers · ${totals.citTrained} CIT-trained · avg bias-audit score ${totals.avgBiasAuditScore}.`}
      />

      <div className="space-y-6 px-8 py-6">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Kpi label="Officers" value={`${totals.officers}`} hint="sworn" />
          <Kpi label="CIT-trained" value={`${totals.citTrained}`} hint="crisis-intervention" />
          <Kpi label="Avg bias-audit" value={`${totals.avgBiasAuditScore}`} hint="0–100, higher = better" />
          <Kpi label="Commendations" value={`${totals.totalCommendations}`} hint="YTD" />
        </div>

        <Input
          type="search"
          placeholder="Search by id, name, rank…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="border-b bg-[var(--graphite-50)]">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Officer</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Rank</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">YTD incidents</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Avg resp (min)</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">CIT</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Training (YTD)</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Bias audit</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((o) => {
                    const s = getOfficerStats(o.id);
                    return (
                      <tr key={o.id} className="border-b last:border-0 hover:bg-[var(--graphite-50)]">
                        <td className="px-4 py-2">
                          <Link to={`/officers/${encodeURIComponent(o.id)}`} className="flex items-center gap-2 text-[var(--hub-700)] hover:underline">
                            <Briefcase className="h-3.5 w-3.5" />
                            <div>
                              <div className="font-mono text-[10px]">{o.id}</div>
                              <div className="text-[11px]">{o.fullName}</div>
                            </div>
                          </Link>
                        </td>
                        <td className="px-4 py-2"><Badge variant="muted" className="text-[10px]">{o.rank}</Badge></td>
                        <td className="px-4 py-2 font-mono text-[10px]">{s?.ytdIncidentCount ?? '—'}</td>
                        <td className="px-4 py-2 font-mono text-[10px]">{s?.avgResponseTimeMin ?? '—'}</td>
                        <td className="px-4 py-2 text-[10px]">{o.isCitTrained ? <Badge variant="success" className="text-[9px]">CIT</Badge> : '—'}</td>
                        <td className="px-4 py-2 font-mono text-[10px]">{s?.trainingHoursYTD ?? 0}h</td>
                        <td className="px-4 py-2">
                          <span className={cn(
                            'inline-block rounded-md px-1.5 py-0.5 text-[10px] font-semibold',
                            s && s.biasAuditScore >= 90 ? 'bg-[var(--signal-green-soft)] text-[oklch(0.38_0.12_155)]'
                            : s && s.biasAuditScore >= 80 ? 'bg-[var(--signal-blue-soft)] text-[oklch(0.38_0.12_235)]'
                            : 'bg-[var(--signal-amber-soft)] text-[oklch(0.42_0.13_70)]',
                          )}>
                            {s?.biasAuditScore ?? '—'}
                          </span>
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

function Kpi({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)]">{label}</div>
        <div className="mt-1 font-display text-3xl font-semibold tabular-nums">{value}</div>
        <div className="mt-1 text-[10px] text-[var(--muted-foreground)]">{hint}</div>
      </CardContent>
    </Card>
  );
}
