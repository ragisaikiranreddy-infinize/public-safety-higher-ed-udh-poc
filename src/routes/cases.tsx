/**
 * /cases — investigative case roster.
 *
 * Lists every case promoted from incidents (clery-reportable, RMS-numbered).
 * Filterable by status. Click → /cases/:id.
 */
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ClassificationBadge } from '@/components/data-display/classification-badge';
import { CASES, getOfficer } from '@/lib/mock-db';
import type { Case } from '@/lib/types';

type StatusFilter = 'all' | Case['status'];

const STATUS_TONE: Record<Case['status'], 'success' | 'warning' | 'muted' | 'danger' | 'info'> = {
  open: 'warning',
  pending: 'info',
  closed: 'muted',
  unfounded: 'danger',
  inactive: 'muted',
};

export default function CasesPage() {
  const [filter, setFilter] = useState('');
  const [tab, setTab] = useState<StatusFilter>('all');

  const filtered = useMemo(() => {
    let pool: Case[] = CASES;
    if (tab !== 'all') pool = pool.filter((c) => c.status === tab);
    const q = filter.trim().toLowerCase();
    if (!q) return pool;
    return pool.filter(
      (c) =>
        c.id.toLowerCase().includes(q) ||
        c.rmsCaseNumber.toLowerCase().includes(q) ||
        c.relatedIncidentIds.some((i) => i.toLowerCase().includes(q)) ||
        c.charges.join(' ').toLowerCase().includes(q),
    );
  }, [filter, tab]);

  const counts = useMemo(() => {
    const out: Record<Case['status'], number> = {
      open: 0,
      pending: 0,
      closed: 0,
      unfounded: 0,
      inactive: 0,
    };
    for (const c of CASES) out[c.status]++;
    return out;
  }, []);

  return (
    <>
      <PageHeader
        eyebrow="Incidents · Cases"
        title="Investigative cases"
        description={`${CASES.length} cases promoted from Clery-reportable incidents with RMS case numbers. Each case links back to its source incident(s) + primary detective.`}
        actions={
          <Badge variant="warning">{counts.open} open</Badge>
        }
      />

      <div className="space-y-6 px-8 py-6">
        <div className="flex flex-wrap items-center gap-2">
          <TabBtn label={`All (${CASES.length})`} active={tab === 'all'} onClick={() => setTab('all')} />
          <TabBtn label={`Open (${counts.open})`} active={tab === 'open'} onClick={() => setTab('open')} />
          <TabBtn label={`Closed (${counts.closed})`} active={tab === 'closed'} onClick={() => setTab('closed')} />
          <TabBtn label={`Unfounded (${counts.unfounded})`} active={tab === 'unfounded'} onClick={() => setTab('unfounded')} />
          <TabBtn label={`Inactive (${counts.inactive})`} active={tab === 'inactive'} onClick={() => setTab('inactive')} />
        </div>

        <Input
          type="search"
          placeholder="Search by case id, RMS number, related incident…"
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
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">RMS #</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Status</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Related incidents</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Detective</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Charges</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Classification</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.slice(0, 300).map((c) => {
                    const det = c.primaryDetectiveOfficerId ? getOfficer(c.primaryDetectiveOfficerId) : null;
                    return (
                      <tr key={c.id} className="border-b last:border-0 hover:bg-[var(--graphite-50)]">
                        <td className="px-4 py-2">
                          <Link to={`/cases/${encodeURIComponent(c.id)}`} className="flex items-center gap-2 text-[var(--hub-700)] hover:underline">
                            <ClipboardList className="h-3.5 w-3.5" />
                            <span className="font-mono text-[10px]">{c.id}</span>
                          </Link>
                        </td>
                        <td className="px-4 py-2 font-mono text-[10px] text-[var(--muted-foreground)]">{c.rmsCaseNumber}</td>
                        <td className="px-4 py-2"><Badge variant={STATUS_TONE[c.status]} className="text-[9px]">{c.status}</Badge></td>
                        <td className="px-4 py-2">
                          <div className="flex flex-wrap gap-1">
                            {c.relatedIncidentIds.slice(0, 2).map((iid) => (
                              <Link key={iid} to={`/incidents/${encodeURIComponent(iid)}`} className="font-mono text-[10px] text-[var(--hub-700)] hover:underline">
                                {iid}
                              </Link>
                            ))}
                            {c.relatedIncidentIds.length > 2 && (
                              <span className="text-[10px] text-[var(--muted-foreground)]">+{c.relatedIncidentIds.length - 2}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-2 font-mono text-[10px]">
                          {det ? (
                            <Link to={`/officers/${encodeURIComponent(det.id)}`} className="text-[var(--hub-700)] hover:underline">
                              {det.id}
                            </Link>
                          ) : <span className="text-[var(--muted-foreground)]">—</span>}
                        </td>
                        <td className="px-4 py-2 text-[10px]">
                          {c.charges.length === 0 ? <span className="text-[var(--muted-foreground)]">none</span> : c.charges.join(', ')}
                        </td>
                        <td className="px-4 py-2"><ClassificationBadge classification={c.classification} /></td>
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
