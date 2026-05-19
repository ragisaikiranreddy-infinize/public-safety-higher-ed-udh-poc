/**
 * /audit — Audit-of-audit panel.
 *
 * Live in-session barrier-hit log + synthetic platform access log.
 */
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ClassificationBadge } from '@/components/data-display/classification-badge';
import {
  PLATFORM_ACCESS_LOG, accessLogByActionKind,
} from '@/lib/mock-db';
import { useBarrierHits, INFORMATION_BARRIERS } from '@/lib/information-barriers';
import { formatRelativeTime, cn } from '@/lib/utils';
import { Eye, EyeOff, Ban, Download, Edit, ScrollText } from 'lucide-react';
import type { AccessLogActionKind } from '@/lib/types';

const ACTION_ICON: Record<AccessLogActionKind, React.ElementType> = {
  view: Eye,
  masked: EyeOff,
  denied: Ban,
  export: Download,
  edit: Edit,
  override: ScrollText,
  login: Eye,
  'role-switch': Eye,
};

const ACTION_COLOR: Record<AccessLogActionKind, string> = {
  view: 'text-[var(--muted-foreground)]',
  masked: 'text-[var(--barrier)]',
  denied: 'text-[var(--signal-red)]',
  export: 'text-[var(--signal-amber)]',
  edit: 'text-[var(--signal-blue)]',
  override: 'text-[var(--signal-amber)]',
  login: 'text-[var(--muted-foreground)]',
  'role-switch': 'text-[var(--muted-foreground)]',
};

export default function AuditPage() {
  const liveHits = useBarrierHits();
  const counts = useMemo(() => accessLogByActionKind(), []);

  return (
    <>
      <PageHeader
        eyebrow="Trust · Audit-of-Audit"
        title="Audit panel"
        description={`Live in-session barrier hits (top) + synthetic platform access log (${PLATFORM_ACCESS_LOG.length} entries over 14 days). Every barrier evaluation that masked / denied / overrode in this session is appended below.`}
      />

      <div className="space-y-6 px-8 py-6">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {(['view', 'masked', 'denied', 'override'] as AccessLogActionKind[]).map((k) => (
            <Card key={k}>
              <CardContent className="p-4">
                <div className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)]">{k}</div>
                <div className={cn('mt-1 font-display text-3xl font-semibold tabular-nums', ACTION_COLOR[k])}>
                  {counts[k] ?? 0}
                </div>
                <div className="mt-1 text-[10px] text-[var(--muted-foreground)]">14-day rolling</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Live barrier hits */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Live barrier-hit log ({liveHits.length} this session)</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {liveHits.length === 0 ? (
              <p className="p-6 text-center text-xs text-[var(--muted-foreground)]">
                No barrier hits this session. Switch role to Chief of Police and navigate to Title IX to fire a hit.
              </p>
            ) : (
              <ul className="divide-y">
                {liveHits.slice(0, 20).map((h) => {
                  const barrier = INFORMATION_BARRIERS.find((b) => b.id === h.barrierId);
                  return (
                    <li key={h.id} className="flex items-center justify-between gap-4 px-5 py-3 text-xs">
                      <div className="flex items-center gap-3">
                        <Badge variant={h.outcome === 'denied' ? 'danger' : h.outcome === 'masked' ? 'warning' : 'success'} className="text-[10px]">
                          {h.outcome}
                        </Badge>
                        <span className="font-mono text-[10px]">{h.barrierId}</span>
                        <span className="text-[11px]">{barrier?.name ?? '—'}</span>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-[var(--muted-foreground)]">
                        <span>actor <span className="font-mono">{h.actorRole}</span></span>
                        <span>resource <span className="font-mono">{h.resourceKind}:{h.resourceId}</span></span>
                        <span>{formatRelativeTime(new Date(h.at))}</span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Platform access log */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Platform access log (recent {Math.min(40, PLATFORM_ACCESS_LOG.length)} of {PLATFORM_ACCESS_LOG.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="border-b bg-[var(--graphite-50)]">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">When</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Actor role</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Action</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Resource</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Classification</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {PLATFORM_ACCESS_LOG.slice(0, 40).map((e) => {
                    const Icon = ACTION_ICON[e.action];
                    return (
                      <tr key={e.id} className="border-b last:border-0 hover:bg-[var(--graphite-50)]">
                        <td className="px-4 py-2 text-[10px] text-[var(--muted-foreground)]">{formatRelativeTime(new Date(e.at))}</td>
                        <td className="px-4 py-2 font-mono text-[10px]">{e.actorRole}</td>
                        <td className="px-4 py-2">
                          <span className="inline-flex items-center gap-1">
                            <Icon className={cn('h-3.5 w-3.5', ACTION_COLOR[e.action])} />
                            <span className="text-[11px]">{e.action}</span>
                          </span>
                        </td>
                        <td className="px-4 py-2 text-[10px]">
                          {e.resourceKind === 'incident' ? (
                            <Link to={`/incidents/${encodeURIComponent(e.resourceId)}`} className="font-mono text-[var(--hub-700)] hover:underline">{e.resourceId}</Link>
                          ) : (
                            <span className="font-mono">{e.resourceKind}:{e.resourceId}</span>
                          )}
                        </td>
                        <td className="px-4 py-2"><ClassificationBadge classification={e.classification} /></td>
                        <td className="px-4 py-2 max-w-[260px] text-[10px] text-[var(--muted-foreground)]">{e.reason ?? '—'}</td>
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
