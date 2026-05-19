/**
 * /missing-students — Missing-student protocol board.
 */
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  MISSING_STUDENT_REPORTS, missingStudentReportsActive, getPerson,
} from '@/lib/mock-db';
import { formatRelativeTime, cn } from '@/lib/utils';
import type { MissingStudentStatus } from '@/lib/types';

export default function MissingStudentsPage() {
  const [filter, setFilter] = useState('');

  const active = missingStudentReportsActive();
  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return MISSING_STUDENT_REPORTS;
    return MISSING_STUDENT_REPORTS.filter(
      (r) =>
        r.id.toLowerCase().includes(q) ||
        r.subjectPersonId.toLowerCase().includes(q) ||
        r.narrative.toLowerCase().includes(q),
    );
  }, [filter]);

  return (
    <>
      <PageHeader
        eyebrow="Conduct · Missing-Student Protocol"
        title="Missing-student reports"
        description={`${MISSING_STUDENT_REPORTS.length} reports over the past 18 months · ${active.length} active. Per HEOA §485(j), a 24-hour parental-notification trigger fires for students with designated emergency contacts.`}
      />

      <div className="space-y-6 px-8 py-6">
        <Input
          type="search"
          placeholder="Search by id, subject, narrative…"
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
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Subject</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Status</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Hours overdue</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Parental notified</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Last seen</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Reported</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => {
                    const subj = getPerson(r.subjectPersonId);
                    const overdue = r.hoursOverdue >= 24;
                    return (
                      <tr key={r.id} className={cn(
                        'border-b last:border-0 hover:bg-[var(--graphite-50)]',
                        overdue && r.status !== 'recovered' && r.status !== 'closed-other' && 'bg-[var(--signal-amber-soft)]/30',
                      )}>
                        <td className="px-4 py-2 font-mono text-[10px]">{r.id}</td>
                        <td className="px-4 py-2">
                          <Link to={`/persons/${encodeURIComponent(r.subjectPersonId)}`} className="font-mono text-[10px] text-[var(--hub-700)] hover:underline">
                            {subj?.fullName ?? r.subjectPersonId}
                          </Link>
                        </td>
                        <td className="px-4 py-2"><StatusPill status={r.status} /></td>
                        <td className="px-4 py-2 font-mono text-[10px]">{r.hoursOverdue}h</td>
                        <td className="px-4 py-2 text-[10px] text-[var(--muted-foreground)]">
                          {r.parentalNotifiedAt ? formatRelativeTime(new Date(r.parentalNotifiedAt)) : '—'}
                        </td>
                        <td className="px-4 py-2 font-mono text-[10px]">{r.lastSeenBuildingId ?? '—'}</td>
                        <td className="px-4 py-2 text-[10px] text-[var(--muted-foreground)]">{formatRelativeTime(new Date(r.reportedAt))}</td>
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

function StatusPill({ status }: { status: MissingStudentStatus }) {
  const variant =
    status === 'recovered' ? 'success'
    : status === 'closed-other' ? 'muted'
    : status === 'protocol-active' ? 'danger'
    : 'warning';
  return <Badge variant={variant} className="text-[10px]">{status}</Badge>;
}
