/**
 * /notifications — mass-notification campaign list + 30-day delivery rollup.
 */
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  NOTIFICATION_CAMPAIGNS, notificationDeliveryRollup30d,
} from '@/lib/mock-db';
import { formatRelativeTime, cn } from '@/lib/utils';
import type { NotifCampaignStatus } from '@/lib/types';

export default function NotificationsPage() {
  const [filter, setFilter] = useState('');
  const rollup = useMemo(() => notificationDeliveryRollup30d(), []);

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return NOTIFICATION_CAMPAIGNS;
    return NOTIFICATION_CAMPAIGNS.filter(
      (c) =>
        c.id.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.audiences.some((a) => a.toLowerCase().includes(q)),
    );
  }, [filter]);

  return (
    <>
      <PageHeader
        eyebrow="EOC · Mass Notification"
        title="Mass-notification campaigns"
        description={`${NOTIFICATION_CAMPAIGNS.length} campaigns over the past 90 days across SMS, push, email, voice, desktop alert, and digital signs. The active Thread B activation has dispatched 2 campaigns in the past 17 minutes.`}
      />

      <div className="space-y-6 px-8 py-6">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <RollupBox label="Sent (30d)" value={rollup.totalSent.toLocaleString()} />
          <RollupBox label="Delivered" value={rollup.totalDelivered.toLocaleString()} />
          <RollupBox
            label="Delivery rate"
            value={`${(rollup.deliveryRate * 100).toFixed(1)}%`}
            variant={rollup.deliveryRate >= 0.95 ? 'good' : 'warn'}
          />
          <RollupBox label="SMS P95 latency" value={`${rollup.p95LatencySec}s`} />
        </div>

        <Input
          type="search"
          placeholder="Search by id, name, audience…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="border-b bg-[var(--graphite-50)]">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Campaign</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Name</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Audiences</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Channels</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Delivered</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Sent</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => {
                    const attempted = c.delivery.reduce((s, d) => s + d.attempted, 0);
                    const delivered = c.delivery.reduce((s, d) => s + d.delivered, 0);
                    return (
                      <tr key={c.id} className="border-b last:border-0 hover:bg-[var(--graphite-50)]">
                        <td className="px-4 py-2">
                          <Link to={`/notifications/${encodeURIComponent(c.id)}`} className="font-mono text-[var(--hub-700)] hover:underline">
                            {c.id}
                          </Link>
                          {c.threadTag && (
                            <Badge variant="accent" className="ml-2 text-[9px]">Thread {c.threadTag}</Badge>
                          )}
                        </td>
                        <td className="px-4 py-2">{c.name}</td>
                        <td className="px-4 py-2">
                          <div className="flex flex-wrap gap-1">
                            {c.audiences.map((a) => (
                              <Badge key={a} variant="muted" className="text-[9px]">{a}</Badge>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex flex-wrap gap-1">
                            {c.channels.map((ch) => (
                              <Badge key={ch} variant="outline" className="text-[9px]">{ch}</Badge>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-2 font-mono text-[10px]">
                          {delivered.toLocaleString()} / {attempted.toLocaleString()}
                        </td>
                        <td className="px-4 py-2 text-[10px] text-[var(--muted-foreground)]">
                          <StatusBadge status={c.status} />{' '}
                          {c.sentAt ? formatRelativeTime(new Date(c.sentAt)) : '—'}
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

function StatusBadge({ status }: { status: NotifCampaignStatus }) {
  const variant =
    status === 'sent' ? 'success'
    : status === 'sending' ? 'warning'
    : status === 'queued' ? 'info'
    : status === 'cancelled' ? 'danger'
    : 'muted';
  return <Badge variant={variant} className="mr-1 text-[9px]">{status}</Badge>;
}

function RollupBox({ label, value, variant }: { label: string; value: string; variant?: 'good' | 'warn' }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)]">{label}</div>
        <div className={cn(
          'mt-1 font-display text-3xl font-semibold tabular-nums',
          variant === 'warn' && 'text-[var(--signal-amber)]',
          variant === 'good' && 'text-[var(--signal-green)]',
        )}>
          {value}
        </div>
      </CardContent>
    </Card>
  );
}
