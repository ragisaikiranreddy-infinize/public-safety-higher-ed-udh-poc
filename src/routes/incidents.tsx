/**
 * /incidents — Live CAD board + recent-incident table.
 *
 * Top strip: open + on-scene counts, avg response time, Clery-reportable
 * count. Below: filterable incident table.
 */
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { PriorityChip } from '@/components/data-display/priority-chip';
import { FreshnessPill } from '@/components/data-display/freshness-pill';
import {
  INCIDENTS,
  openIncidentCount,
  avgResponseTimeMinutesToday,
  cleryReportableCount,
} from '@/lib/mock-db';
import { formatMinutes } from '@/lib/utils';
import type { IncidentStatus } from '@/lib/types';

export default function IncidentsPage() {
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | IncidentStatus>('all');

  const filtered = useMemo(() => {
    let pool = INCIDENTS;
    if (statusFilter !== 'all') pool = pool.filter((i) => i.status === statusFilter);
    const q = filter.trim().toLowerCase();
    if (!q) return pool;
    return pool.filter(
      (i) =>
        i.id.toLowerCase().includes(q) ||
        i.cfsNumber.toLowerCase().includes(q) ||
        i.callType.toLowerCase().includes(q) ||
        (i.buildingId ?? '').toLowerCase().includes(q),
    );
  }, [filter, statusFilter]);

  const openCount = openIncidentCount();
  const avgResp = avgResponseTimeMinutesToday();
  const cleryCount = cleryReportableCount();

  return (
    <>
      <PageHeader
        eyebrow="Incidents · Response"
        title="Incidents"
        description={`${INCIDENTS.length} incidents over the last 18 months. Click any row to open the Incident 360 — timeline, units, geofence, related cameras + doors, NIBRS code, Clery classification.`}
      />

      <div className="space-y-6 px-8 py-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <KpiBox label="Open + on-scene" value={`${openCount}`} variant="info" />
          <KpiBox label="Avg response (7d)" value={avgResp !== null ? formatMinutes(avgResp) : '—'} />
          <KpiBox label="Clery-reportable" value={`${cleryCount}`} />
          <KpiBox label="Total (18mo window)" value={`${INCIDENTS.length}`} />
        </div>

        {/* Status filter strip */}
        <div className="flex flex-wrap items-center gap-2">
          {(['all', 'open', 'on-scene', 'cleared', 'pending', 'closed', 'unfounded'] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                statusFilter === s
                  ? 'bg-[var(--graphite-900)] text-white'
                  : 'border border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:bg-[var(--graphite-50)]'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <Input
          type="search"
          placeholder="Search incidents by ID, CFS number, call type, building…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="border-b bg-[var(--graphite-50)]">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Incident</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Call type</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Priority</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Building</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Status</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Clery</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Received</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.slice(0, 300).map((i) => (
                    <tr key={i.id} className="border-b last:border-0 hover:bg-[var(--graphite-50)]">
                      <td className="px-4 py-2">
                        <Link to={`/incidents/${encodeURIComponent(i.id)}`}>
                          <div className="font-mono text-[var(--foreground)]">{i.id}</div>
                          <div className="text-[10px] text-[var(--muted-foreground)]">{i.cfsNumber}</div>
                        </Link>
                      </td>
                      <td className="px-4 py-2"><Badge variant="muted">{i.callType}</Badge></td>
                      <td className="px-4 py-2"><PriorityChip priority={i.priority} compact /></td>
                      <td className="px-4 py-2 font-mono text-[10px] text-[var(--muted-foreground)]">{i.buildingId ?? '—'}</td>
                      <td className="px-4 py-2">
                        <Badge
                          variant={
                            i.status === 'open' ? 'danger' :
                            i.status === 'on-scene' ? 'warning' :
                            i.status === 'cleared' ? 'success' :
                            i.status === 'unfounded' ? 'muted' :
                            'muted'
                          }
                        >
                          {i.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-2">
                        {i.cleryReportable ? (
                          <Badge variant="warning" className="text-[9px]">reportable</Badge>
                        ) : (
                          <span className="text-[10px] text-[var(--muted-foreground)]">—</span>
                        )}
                      </td>
                      <td className="px-4 py-2"><FreshnessPill lastUpdatedIso={i.receivedAt} /></td>
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

function KpiBox({ label, value, variant }: { label: string; value: string; variant?: 'info' | 'default' }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
          {label}
        </div>
        <div className={`mt-1 font-display text-2xl font-semibold ${variant === 'info' ? 'text-[var(--hub-700)]' : 'text-[var(--foreground)]'}`}>
          {value}
        </div>
      </CardContent>
    </Card>
  );
}
