/**
 * /access — Access Control event stream + building roll-up.
 */
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  ACCESS_EVENTS,
  BUILDINGS,
  getPerson,
  accessAnomaliesByBuilding,
} from '@/lib/mock-db';
import { useRole } from '@/lib/role-context';
import { formatRelativeTime } from '@/lib/utils';

export default function AccessPage() {
  const [filter, setFilter] = useState('');
  const { canSee } = useRole();

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return ACCESS_EVENTS.slice(0, 200);
    return ACCESS_EVENTS.filter(
      (e) =>
        e.id.toLowerCase().includes(q) ||
        e.doorId.toLowerCase().includes(q) ||
        e.buildingId.toLowerCase().includes(q) ||
        (e.personId ?? '').toLowerCase().includes(q),
    ).slice(0, 200);
  }, [filter]);

  const buildingsWithAnomalies = useMemo(() => {
    return BUILDINGS
      .map((b) => ({ b, count: accessAnomaliesByBuilding(b.id).length }))
      .filter((x) => x.count > 0)
      .sort((a, b) => b.count - a.count);
  }, []);

  return (
    <>
      <PageHeader
        eyebrow="Surveillance · Access Control"
        title="Access Events"
        description={`${ACCESS_EVENTS.length.toLocaleString()} door events over the past 30 days from ~30 access-controlled doors. Anomaly flags (after-hours · unusual-building · anti-passback) populated by the Silver conformer.`}
      />

      <div className="space-y-6 px-8 py-6">
        {/* Buildings with anomalies roll-up */}
        <Card>
          <CardContent className="p-5">
            <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
              Buildings with access anomalies (30d)
            </div>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
              {buildingsWithAnomalies.slice(0, 8).map((x) => (
                <Link
                  key={x.b.id}
                  to={`/access/buildings/${encodeURIComponent(x.b.id)}`}
                  className="rounded-md border bg-[var(--card)] p-3 text-xs transition-colors hover:bg-[var(--graphite-50)]"
                >
                  <div className="font-semibold">{x.b.name}</div>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="font-mono text-[10px] text-[var(--muted-foreground)]">{x.b.id}</span>
                    <Badge variant="warning">{x.count} anomalies</Badge>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        <Input
          type="search"
          placeholder="Search by event id, door, building, person…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="border-b bg-[var(--graphite-50)]">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">When</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Door</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Building</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Cardholder</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Kind</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Flags</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((e) => {
                    const masked = !canSee(e.classification);
                    const p = e.personId ? getPerson(e.personId) : undefined;
                    return (
                      <tr key={e.id} className="border-b last:border-0 hover:bg-[var(--graphite-50)]">
                        <td className="px-4 py-2 text-[10px] text-[var(--muted-foreground)]">
                          {formatRelativeTime(new Date(e.at))}
                        </td>
                        <td className="px-4 py-2 font-mono text-[10px]">{e.doorId}</td>
                        <td className="px-4 py-2">
                          <Link
                            to={`/access/buildings/${encodeURIComponent(e.buildingId)}`}
                            className="font-mono text-[10px] text-[var(--hub-700)] hover:underline"
                          >
                            {e.buildingId}
                          </Link>
                        </td>
                        <td className="px-4 py-2">
                          {masked ? (
                            <span className="text-[var(--barrier)]">[PII masked]</span>
                          ) : p ? (
                            <Link to={`/persons/${encodeURIComponent(p.id)}`} className="text-[var(--hub-700)] hover:underline">
                              {p.id}
                            </Link>
                          ) : (
                            <span className="font-mono text-[10px] text-[var(--muted-foreground)]">{e.cardholderToken}</span>
                          )}
                        </td>
                        <td className="px-4 py-2">
                          <Badge variant={e.kind === 'denied' || e.kind === 'forced' ? 'danger' : 'muted'}>
                            {e.kind}
                          </Badge>
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex flex-wrap gap-1">
                            {e.isAfterHours && <Badge variant="warning" className="text-[9px]">after-hours</Badge>}
                            {e.isUnusualBuilding && <Badge variant="warning" className="text-[9px]">unusual-bldg</Badge>}
                            {e.isAntiPassback && <Badge variant="danger" className="text-[9px]">anti-passback</Badge>}
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
