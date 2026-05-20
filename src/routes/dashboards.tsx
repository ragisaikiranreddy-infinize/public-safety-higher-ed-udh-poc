/**
 * /dashboards — saved + pinned dashboards.
 */
import { Link } from 'react-router-dom';
import { LayoutDashboard, Plus, Pin } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DASHBOARDS } from '@/lib/mock-db';
import { formatRelativeTime } from '@/lib/utils';

export default function DashboardsPage() {
  const pinned = DASHBOARDS.filter((d) => d.isPinned);
  const rest = DASHBOARDS.filter((d) => !d.isPinned);

  return (
    <>
      <PageHeader
        eyebrow="Intelligence · Dashboards"
        title="Dashboards"
        description={`${DASHBOARDS.length} dashboards · ${pinned.length} pinned. Build new dashboards from a natural-language prompt — the AI builder stages widgets onto a 12-column grid with stagger-reveal.`}
        actions={
          <Link to="/dashboards/new">
            <Button size="sm" variant="default">
              <Plus className="h-3.5 w-3.5" />
              <span className="ml-1">New dashboard</span>
            </Button>
          </Link>
        }
      />
      <div className="space-y-6 px-8 py-6">
        {pinned.length > 0 && (
          <div>
            <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
              <Pin className="h-3.5 w-3.5" />
              Pinned
            </div>
            <DashboardGrid dashboards={pinned} />
          </div>
        )}
        {rest.length > 0 && (
          <div>
            <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
              All
            </div>
            <DashboardGrid dashboards={rest} />
          </div>
        )}
      </div>
    </>
  );
}

function DashboardGrid({ dashboards }: { dashboards: typeof DASHBOARDS }) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
      {dashboards.map((d) => (
        <Link key={d.id} to={`/dashboards/${encodeURIComponent(d.id)}`}>
          <Card className="transition-colors hover:bg-[var(--graphite-50)]">
            <CardContent className="space-y-2 p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <LayoutDashboard className="h-4 w-4 text-[var(--hub-700)]" />
                  <span className="font-mono text-[10px] text-[var(--muted-foreground)]">{d.id}</span>
                </div>
                {d.isPinned && <Pin className="h-3.5 w-3.5 text-[var(--hub-700)]" />}
              </div>
              <div className="font-display text-base font-semibold">{d.name}</div>
              <p className="line-clamp-2 text-[11px] text-[var(--muted-foreground)]">{d.description}</p>
              <div className="flex items-center justify-between text-[10px] text-[var(--muted-foreground)]">
                <Badge variant="outline" className="text-[9px]">{d.ownerRole}</Badge>
                <span>{d.widgets.length} widgets · {formatRelativeTime(new Date(d.createdAt))}</span>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
