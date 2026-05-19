/**
 * /nibris — NIBRS submissions history + posture summary.
 */
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { NIBRIS_SUBMISSIONS, nibrsSubmissionsRejected } from '@/lib/mock-db';
import { formatRelativeTime, cn } from '@/lib/utils';

export default function NIBRISPage() {
  const rejected = nibrsSubmissionsRejected();
  const accepted = NIBRIS_SUBMISSIONS.filter((s) => s.status === 'accepted' || s.status === 'resubmitted');

  return (
    <>
      <PageHeader
        eyebrow="Compliance · NIBRS"
        title="NIBRS submission history"
        description={`${NIBRIS_SUBMISSIONS.length} reporting periods. ${rejected.length} rejected (with resubmission required). All exports are CJI-classified.`}
      />
      <div className="space-y-6 px-8 py-6">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <KpiCard label="Total submissions" value={`${NIBRIS_SUBMISSIONS.length}`} hint="across all reporting periods" />
          <KpiCard label="Accepted" value={`${accepted.length}`} hint="incl. resubmissions" />
          <KpiCard label="Rejected" value={`${rejected.length}`} hint={rejected.length > 0 ? 'resubmission required' : 'clean run'} tone={rejected.length > 0 ? 'warn' : 'good'} />
          <KpiCard label="In progress" value={`${NIBRIS_SUBMISSIONS.filter((s) => s.status === 'in-progress').length}`} hint="current cycle" />
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="border-b bg-[var(--graphite-50)]">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Submission</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Period</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Status</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Records</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Submitted</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Detail</th>
                  </tr>
                </thead>
                <tbody>
                  {NIBRIS_SUBMISSIONS.map((s) => (
                    <tr key={s.id} className={cn(
                      'border-b last:border-0 hover:bg-[var(--graphite-50)]',
                      s.status === 'rejected' && 'bg-[var(--signal-red-soft)]/20',
                    )}>
                      <td className="px-4 py-2 font-mono text-[10px]">{s.id}</td>
                      <td className="px-4 py-2 font-mono text-[10px]">{s.reportingPeriod}</td>
                      <td className="px-4 py-2">
                        <Badge variant={
                          s.status === 'rejected' ? 'danger'
                          : s.status === 'accepted' || s.status === 'resubmitted' ? 'success'
                          : s.status === 'submitted' ? 'info'
                          : 'muted'
                        } className="text-[10px]">
                          {s.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-2 font-mono text-[10px]">
                        {s.recordCount}
                        {s.errorCount > 0 && (
                          <span className="ml-1 text-[var(--signal-red)]">({s.errorCount} err)</span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-[10px] text-[var(--muted-foreground)]">
                        {s.submittedAt ? formatRelativeTime(new Date(s.submittedAt)) : '—'}
                      </td>
                      <td className="px-4 py-2 max-w-[420px] text-[10px] text-[var(--muted-foreground)]">
                        {s.rejectionNote ?? (s.acceptedAt ? `accepted ${formatRelativeTime(new Date(s.acceptedAt))}` : '—')}
                      </td>
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

function KpiCard({ label, value, hint, tone }: { label: string; value: string; hint: string; tone?: 'good' | 'warn' }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)]">{label}</div>
        <div className={cn(
          'mt-1 font-display text-3xl font-semibold tabular-nums',
          tone === 'warn' && 'text-[var(--signal-amber)]',
          tone === 'good' && 'text-[var(--signal-green)]',
        )}>
          {value}
        </div>
        <div className="mt-1 text-[10px] text-[var(--muted-foreground)]">{hint}</div>
      </CardContent>
    </Card>
  );
}
