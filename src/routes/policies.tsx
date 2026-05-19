/**
 * /policies — institutional policy registry.
 */
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { POLICIES } from '@/lib/mock-db';
import { formatRelativeTime, cn } from '@/lib/utils';

export default function PoliciesPage() {
  const [filter, setFilter] = useState('');

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return POLICIES;
    return POLICIES.filter(
      (p) =>
        p.id.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q),
    );
  }, [filter]);

  return (
    <>
      <PageHeader
        eyebrow="Trust · Policies"
        title="Institutional policy registry"
        description={`${POLICIES.length} policies across student conduct, Title IX, Clery, FERPA, data classification, security, access control, mass notification, records retention, incident response, hazing prevention, and medical amnesty.`}
      />

      <div className="space-y-6 px-8 py-6">
        <Input
          type="search"
          placeholder="Search by id, name, or category…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="border-b bg-[var(--graphite-50)]">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Policy</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Category</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Owner</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Last reviewed</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Next review</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Regulatory hooks</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => {
                    const overdue = new Date(p.nextReviewDueAt).getTime() < Date.now();
                    return (
                      <tr key={p.id} className={cn('border-b last:border-0 hover:bg-[var(--graphite-50)]', overdue && 'bg-[var(--signal-amber-soft)]/30')}>
                        <td className="px-4 py-2">
                          <div className="font-mono text-[10px] text-[var(--muted-foreground)]">{p.id}</div>
                          <div className="text-[11px]">{p.name}</div>
                        </td>
                        <td className="px-4 py-2"><Badge variant="outline" className="text-[10px]">{p.category}</Badge></td>
                        <td className="px-4 py-2 font-mono text-[10px]">{p.ownerRole}</td>
                        <td className="px-4 py-2 text-[10px] text-[var(--muted-foreground)]">{formatRelativeTime(new Date(p.lastReviewedAt))}</td>
                        <td className="px-4 py-2 text-[10px] text-[var(--muted-foreground)]">
                          {formatRelativeTime(new Date(p.nextReviewDueAt))}
                          {overdue && <Badge variant="warning" className="ml-1 text-[9px]">overdue</Badge>}
                        </td>
                        <td className="px-4 py-2 text-[10px]">
                          <div className="flex flex-wrap gap-1">
                            {p.regulatoryHooks.map((r) => (
                              <Link key={r} to="/regulations" className="font-mono text-[var(--hub-700)] hover:underline">{r}</Link>
                            ))}
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
