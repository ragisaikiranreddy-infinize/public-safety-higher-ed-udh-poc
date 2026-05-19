/**
 * /transit — shuttle route board.
 *
 * Shows the 4 routes + per-route status + active-vehicle pings.
 */
import { Bus, AlertOctagon } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SHUTTLE_ROUTES, transitPingsForRoute, shuttleRoutesByStatus } from '@/lib/mock-db';
import { formatRelativeTime, cn } from '@/lib/utils';

export default function TransitPage() {
  const byStatus = shuttleRoutesByStatus();

  return (
    <>
      <PageHeader
        eyebrow="Campus Ops · Transit"
        title="Shuttle network"
        description={`${SHUTTLE_ROUTES.length} routes · ${byStatus.normal ?? 0} normal · ${byStatus.detour ?? 0} detour · ${byStatus.suspended ?? 0} suspended. Active Thread B activation has suspended two west-side routes.`}
      />

      <div className="space-y-6 px-8 py-6">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {SHUTTLE_ROUTES.map((r) => {
            const pings = transitPingsForRoute(r.id);
            return (
              <Card
                key={r.id}
                className={cn(r.status === 'suspended' && 'border-[var(--signal-red)]/40')}
              >
                <CardContent className="space-y-3 p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bus className="h-4 w-4" style={{ color: r.color }} />
                      <span className="font-mono text-[10px] text-[var(--muted-foreground)]">{r.id}</span>
                    </div>
                    <Badge
                      variant={r.status === 'suspended' ? 'danger' : r.status === 'detour' ? 'warning' : 'success'}
                      className="text-[10px]"
                    >
                      {r.status}
                    </Badge>
                  </div>
                  <div className="font-display text-base font-semibold">{r.name}</div>
                  <div className="flex flex-wrap gap-1 text-[10px]">
                    {r.stops.map((s, i) => (
                      <span key={i}>
                        <span className="rounded-full bg-[var(--graphite-100)] px-2 py-0.5">{s}</span>
                        {i < r.stops.length - 1 && <span className="mx-1 text-[var(--muted-foreground)]">→</span>}
                      </span>
                    ))}
                  </div>
                  {r.riderNote && (
                    <div className="flex items-start gap-2 rounded-md border border-[var(--signal-amber)]/30 bg-[var(--signal-amber-soft)]/30 p-2 text-[11px]">
                      <AlertOctagon className="mt-0.5 h-3.5 w-3.5 text-[var(--signal-amber)]" />
                      <span>{r.riderNote}</span>
                    </div>
                  )}
                  <div className="text-[10px] text-[var(--muted-foreground)]">
                    {r.activeVehicleCount} active vehicle{r.activeVehicleCount === 1 ? '' : 's'}
                  </div>
                  {pings.length > 0 && (
                    <ul className="space-y-1 text-[10px]">
                      {pings.map((p) => (
                        <li key={p.id} className="flex justify-between font-mono text-[var(--muted-foreground)]">
                          <span>{p.vehicleId} · {p.speedMph}mph · {p.headingDeg}°</span>
                          <span>{formatRelativeTime(new Date(p.at))}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </>
  );
}
