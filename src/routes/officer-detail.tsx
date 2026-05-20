/**
 * /officers/:id — Officer 360.
 *
 * Header card + stats grid + recent incidents this officer was primary on.
 */
import { Link, useParams } from 'react-router-dom';
import { Briefcase, Calendar, Award, AlertOctagon, ShieldCheck } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PriorityChip } from '@/components/data-display/priority-chip';
import { getOfficer, getOfficerStats, incidentsByOfficer, getUnit } from '@/lib/mock-db';
import { formatRelativeTime, cn } from '@/lib/utils';
import NotFoundPage from './not-found';

export default function OfficerDetailPage() {
  const { id = '' } = useParams<{ id: string }>();
  const o = getOfficer(id);
  if (!o) return <NotFoundPage />;

  const s = getOfficerStats(o.id);
  const unit = o.unitId ? getUnit(o.unitId) : undefined;
  const incidents = incidentsByOfficer(o.id).slice(0, 25);

  return (
    <>
      <PageHeader
        eyebrow="Officers · Officer 360"
        title={o.fullName}
        description={`${o.id} · Badge ${o.badgeNumber} · ${o.rank}${unit ? ` · Unit ${unit.callSign}` : ''}`}
      />
      <div className="space-y-6 px-8 py-6">
        <Card>
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="flex items-center gap-3">
              <Briefcase className="h-5 w-5 text-[var(--hub-700)]" />
              <Badge variant="muted" className="text-[10px]">{o.rank}</Badge>
              {o.isCitTrained && <Badge variant="success" className="text-[10px]">CIT-trained</Badge>}
            </div>
            <div className="text-[10px] text-[var(--muted-foreground)]">
              hired {formatRelativeTime(new Date(o.hireDate))}
            </div>
          </CardContent>
        </Card>

        {s && (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <Stat icon={Calendar} label="Open assignments" value={`${s.openIncidentCount}`} />
            <Stat icon={Calendar} label="YTD primary-on" value={`${s.ytdIncidentCount}`} />
            <Stat icon={Award} label="Commendations" value={`${s.commendationCount}`} hint="YTD" />
            <Stat icon={AlertOctagon} label="Use of force" value={`${s.useOfForceCount}`} hint="YTD" tone={s.useOfForceCount > 0 ? 'warn' : 'good'} />
            <Stat icon={AlertOctagon} label="Complaints" value={`${s.complaintCount}`} hint="past 12mo" tone={s.complaintCount > 0 ? 'warn' : 'good'} />
            <Stat icon={ShieldCheck} label="Training hours" value={`${s.trainingHoursYTD}h`} hint="YTD" />
            <Stat icon={Briefcase} label="Avg response" value={`${s.avgResponseTimeMin ?? '—'} min`} hint="priority 1+2 (90d)" />
            <Stat
              icon={ShieldCheck}
              label="Bias-audit score"
              value={`${s.biasAuditScore}`}
              hint="0–100, higher = better"
              tone={s.biasAuditScore >= 90 ? 'good' : s.biasAuditScore >= 80 ? 'good' : 'warn'}
            />
          </div>
        )}

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Recent incidents primary-on ({incidents.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {incidents.length === 0 ? (
              <p className="p-6 text-center text-xs text-[var(--muted-foreground)]">No recent incidents.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="border-b bg-[var(--graphite-50)]">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Incident</th>
                      <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Call type</th>
                      <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Priority</th>
                      <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Building</th>
                      <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Status</th>
                      <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Received</th>
                    </tr>
                  </thead>
                  <tbody>
                    {incidents.map((i) => (
                      <tr key={i.id} className="border-b last:border-0 hover:bg-[var(--graphite-50)]">
                        <td className="px-4 py-2">
                          <Link to={`/incidents/${encodeURIComponent(i.id)}`} className="font-mono text-[10px] text-[var(--hub-700)] hover:underline">{i.id}</Link>
                        </td>
                        <td className="px-4 py-2 text-[11px]">{i.callType}</td>
                        <td className="px-4 py-2"><PriorityChip priority={i.priority} compact /></td>
                        <td className="px-4 py-2 font-mono text-[10px] text-[var(--muted-foreground)]">{i.buildingId ?? '—'}</td>
                        <td className="px-4 py-2"><Badge variant="muted" className="text-[10px]">{i.status}</Badge></td>
                        <td className="px-4 py-2 text-[10px] text-[var(--muted-foreground)]">{formatRelativeTime(new Date(i.receivedAt))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function Stat({ icon: Icon, label, value, hint, tone }: { icon: React.ElementType; label: string; value: string; hint?: string; tone?: 'good' | 'warn' }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="mb-2 flex items-center justify-between">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">{label}</div>
          <Icon className="h-4 w-4 text-[var(--muted-foreground)]" />
        </div>
        <div className={cn(
          'font-display text-3xl font-semibold tabular-nums',
          tone === 'warn' && 'text-[var(--signal-amber)]',
        )}>
          {value}
        </div>
        {hint && <div className="mt-1 text-[10px] text-[var(--muted-foreground)]">{hint}</div>}
      </CardContent>
    </Card>
  );
}
