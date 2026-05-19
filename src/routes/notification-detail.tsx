/**
 * /notifications/:id — campaign detail.
 *
 * Shows per-channel delivery + latency, message body, and audience.
 */
import { Link, useParams } from 'react-router-dom';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ClassificationBadge } from '@/components/data-display/classification-badge';
import { getNotificationCampaign } from '@/lib/mock-db';
import { formatRelativeTime } from '@/lib/utils';
import NotFoundPage from './not-found';

export default function NotificationDetailPage() {
  const { id = '' } = useParams<{ id: string }>();
  const c = getNotificationCampaign(id);
  if (!c) return <NotFoundPage />;

  return (
    <>
      <PageHeader
        eyebrow="EOC · Mass Notification"
        title={c.name}
        description={`${c.id} · ${c.status === 'sent' ? `sent ${formatRelativeTime(new Date(c.sentAt ?? c.createdAt))}` : c.status}`}
      />
      <div className="space-y-6 px-8 py-6">
        <Card>
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="flex items-center gap-3">
              <ClassificationBadge classification={c.classification} />
              <Badge variant={c.status === 'sent' ? 'success' : 'warning'}>{c.status}</Badge>
              {c.threadTag && <Badge variant="accent">Thread {c.threadTag}</Badge>}
              <span className="text-xs text-[var(--muted-foreground)]">
                authored by <span className="font-mono">{c.authoredByRole}</span>
              </span>
            </div>
            {c.triggeredByActivationId && (
              <div className="text-xs">
                <span className="text-[var(--muted-foreground)]">Activation: </span>
                <Link to={`/eoc/activations/${encodeURIComponent(c.triggeredByActivationId)}`} className="font-mono text-[var(--hub-700)] hover:underline">
                  {c.triggeredByActivationId}
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Message</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-line rounded-md border bg-[var(--graphite-50)] p-4 text-sm leading-relaxed">{c.message}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Audience + channels</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">Audiences</div>
              <div className="mt-1 flex flex-wrap gap-1">
                {c.audiences.map((a) => <Badge key={a} variant="muted" className="text-[10px]">{a}</Badge>)}
              </div>
            </div>
            {c.buildingIds.length > 0 && (
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">Buildings</div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {c.buildingIds.map((b) => (
                    <Badge key={b} variant="outline" className="font-mono text-[10px]">{b}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Per-channel delivery</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="border-b bg-[var(--graphite-50)]">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Channel</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Attempted</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Delivered</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Failed</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Rate</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">P50</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">P95</th>
                  </tr>
                </thead>
                <tbody>
                  {c.delivery.map((d) => {
                    const rate = d.attempted > 0 ? (d.delivered / d.attempted) * 100 : 0;
                    return (
                      <tr key={d.channel} className="border-b last:border-0">
                        <td className="px-4 py-2"><Badge variant="outline" className="text-[10px]">{d.channel}</Badge></td>
                        <td className="px-4 py-2 font-mono">{d.attempted.toLocaleString()}</td>
                        <td className="px-4 py-2 font-mono">{d.delivered.toLocaleString()}</td>
                        <td className="px-4 py-2 font-mono">{d.failed.toLocaleString()}</td>
                        <td className="px-4 py-2 font-mono">{rate.toFixed(1)}%</td>
                        <td className="px-4 py-2 font-mono">{d.latencyP50Sec}s</td>
                        <td className="px-4 py-2 font-mono">{d.latencyP95Sec}s</td>
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
