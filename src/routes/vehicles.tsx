/**
 * /vehicles — Master Vehicle Records list.
 *
 * Filterable table of ~80 vehicles. Plates are CJI-classified and masked for
 * roles without CJI clearance. Click → /vehicles/:id.
 */
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bus } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { VEHICLES, getPerson } from '@/lib/mock-db';
import { useRole } from '@/lib/role-context';

type Tab = 'all' | 'hotlisted' | 'registered' | 'unknown';

export default function VehiclesPage() {
  const [filter, setFilter] = useState('');
  const [tab, setTab] = useState<Tab>('all');
  const { canSee } = useRole();

  const filtered = useMemo(() => {
    let pool = VEHICLES;
    if (tab === 'hotlisted') pool = pool.filter((v) => v.isHotlisted);
    if (tab === 'registered') pool = pool.filter((v) => Boolean(v.registeredToPersonId));
    if (tab === 'unknown') pool = pool.filter((v) => !v.registeredToPersonId);
    const q = filter.trim().toLowerCase();
    if (!q) return pool;
    return pool.filter(
      (v) =>
        v.id.toLowerCase().includes(q) ||
        v.plate.toLowerCase().includes(q) ||
        `${v.make} ${v.model}`.toLowerCase().includes(q) ||
        v.color.toLowerCase().includes(q) ||
        (v.registeredToPersonId ?? '').toLowerCase().includes(q),
    );
  }, [filter, tab]);

  const hotlistedCount = VEHICLES.filter((v) => v.isHotlisted).length;
  const registeredCount = VEHICLES.filter((v) => v.registeredToPersonId).length;

  return (
    <>
      <PageHeader
        eyebrow="People · Master Vehicle Records"
        title="Vehicles"
        description={`${VEHICLES.length} Master Vehicle Records resolved across parking, OneCard, and LPR feeds. Plates are CJI-classified — masked for non-CJI roles.`}
        actions={
          <Badge variant={hotlistedCount > 0 ? 'danger' : 'muted'}>{hotlistedCount} hotlisted</Badge>
        }
      />

      <div className="space-y-6 px-8 py-6">
        <div className="flex flex-wrap items-center gap-2">
          <TabBtn label={`All (${VEHICLES.length})`} active={tab === 'all'} onClick={() => setTab('all')} />
          <TabBtn label={`Registered (${registeredCount})`} active={tab === 'registered'} onClick={() => setTab('registered')} />
          <TabBtn label={`Unknown owner (${VEHICLES.length - registeredCount})`} active={tab === 'unknown'} onClick={() => setTab('unknown')} />
          <TabBtn label={`Hotlisted (${hotlistedCount})`} active={tab === 'hotlisted'} onClick={() => setTab('hotlisted')} />
        </div>

        <Input
          type="search"
          placeholder="Search by id, plate, make, model, owner…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="border-b bg-[var(--graphite-50)]">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Vehicle</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Plate</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Make/Model</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Year</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Color</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Owner</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Hotlist</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.slice(0, 300).map((v) => {
                    const plateMasked = !canSee(v.plateClassification);
                    const owner = v.registeredToPersonId ? getPerson(v.registeredToPersonId) : null;
                    return (
                      <tr key={v.id} className="border-b last:border-0 hover:bg-[var(--graphite-50)]">
                        <td className="px-4 py-2">
                          <Link to={`/vehicles/${encodeURIComponent(v.id)}`} className="flex items-center gap-2 text-[var(--hub-700)] hover:underline">
                            <Bus className="h-3.5 w-3.5" />
                            <span className="font-mono text-[10px]">{v.id}</span>
                          </Link>
                        </td>
                        <td className="px-4 py-2 font-mono text-[10px]">
                          {plateMasked ? (
                            <span className="text-[var(--barrier)]">[CJI masked]</span>
                          ) : (
                            `${v.plate} (${v.state})`
                          )}
                        </td>
                        <td className="px-4 py-2">{v.make} {v.model}</td>
                        <td className="px-4 py-2 tabular-nums">{v.year}</td>
                        <td className="px-4 py-2 text-[var(--muted-foreground)]">{v.color}</td>
                        <td className="px-4 py-2 font-mono text-[10px]">
                          {owner ? (
                            <Link to={`/persons/${encodeURIComponent(owner.id)}`} className="text-[var(--hub-700)] hover:underline">
                              {owner.id}
                            </Link>
                          ) : <span className="text-[var(--muted-foreground)]">—</span>}
                        </td>
                        <td className="px-4 py-2">
                          {v.isHotlisted ? <Badge variant="danger" className="text-[9px]">{v.hotlistReason}</Badge> : <span className="text-[10px] text-[var(--muted-foreground)]">—</span>}
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

function TabBtn({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
        active
          ? 'bg-[var(--graphite-900)] text-white'
          : 'border border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:bg-[var(--graphite-50)]'
      }`}
    >
      {label}
    </button>
  );
}
