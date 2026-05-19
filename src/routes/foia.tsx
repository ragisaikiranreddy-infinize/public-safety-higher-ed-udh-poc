/**
 * /foia — FOIA / public-records request inbox.
 */
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { FOIA_REQUESTS, foiaRequestsOverdue } from '@/lib/mock-db';
import { formatRelativeTime } from '@/lib/utils';
import type { FOIAStatus } from '@/lib/types';

export default function FOIAPage() {
  const [filter, setFilter] = useState('');

  const overdue = foiaRequestsOverdue();
  const active = FOIA_REQUESTS.filter(
    (r) => r.status !== 'released' && r.status !== 'denied' && r.status !== 'closed',
  );

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return FOIA_REQUESTS;
    return FOIA_REQUESTS.filter(
      (r) =>
        r.id.toLowerCase().includes(q) ||
        r.requesterName.toLowerCase().includes(q) ||
        r.request.toLowerCase().includes(q),
    );
  }, [filter]);

  return (
    <>
      <PageHeader
        eyebrow="Compliance · FOIA / Public Records"
        title="FOIA inbox"
        description={`${FOIA_REQUESTS.length} requests · ${active.length} active · ${overdue.length} past due. AI-assisted redaction previews ship as part of the response workflow.`}
      />
      <div className="space-y-6 px-8 py-6">
        <Input
          type="search"
          placeholder="Search by id, requester, or scope…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="border-b bg-[var(--graphite-50)]">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Request</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Requester</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Status</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Received</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Due</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Scope</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr key={r.id} className="border-b last:border-0 hover:bg-[var(--graphite-50)]">
                      <td className="px-4 py-2">
                        <Link to={`/foia/requests/${encodeURIComponent(r.id)}`} className="font-mono text-[10px] text-[var(--hub-700)] hover:underline">
                          {r.id}
                        </Link>
                        {r.threadTag && <Badge variant="accent" className="ml-1.5 text-[9px]">Thread {r.threadTag}</Badge>}
                      </td>
                      <td className="px-4 py-2">
                        <div className="text-[11px]">{r.requesterName}</div>
                        <Badge variant="outline" className="mt-0.5 text-[9px]">{r.requesterAffiliation}</Badge>
                      </td>
                      <td className="px-4 py-2">
                        <StatusPill status={r.status} />
                      </td>
                      <td className="px-4 py-2 text-[10px] text-[var(--muted-foreground)]">{formatRelativeTime(new Date(r.receivedAt))}</td>
                      <td className="px-4 py-2 text-[10px] text-[var(--muted-foreground)]">{formatRelativeTime(new Date(r.dueAt))}</td>
                      <td className="px-4 py-2 max-w-[300px] truncate text-[11px]">{r.request}</td>
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

function StatusPill({ status }: { status: FOIAStatus }) {
  const variant: 'success' | 'info' | 'warning' | 'muted' | 'danger' =
    status === 'released' ? 'success'
    : status === 'denied' ? 'danger'
    : status === 'closed' ? 'muted'
    : status === 'ai-redaction-draft' || status === 'attorney-review' || status === 'ready-for-release' ? 'info'
    : status === 'in-review' || status === 'received' ? 'warning'
    : 'muted';
  return <Badge variant={variant} className="text-[10px]">{status}</Badge>;
}
