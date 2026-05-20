/**
 * /dashboards/:id — saved dashboard view (animate on entry).
 */
import { useParams } from 'react-router-dom';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DashboardGrid } from '@/components/ai-surfaces/dashboard-grid';
import { ClassificationBadge } from '@/components/data-display/classification-badge';
import { getDashboard } from '@/lib/mock-db';
import { formatRelativeTime } from '@/lib/utils';
import NotFoundPage from './not-found';

export default function DashboardDetailPage() {
  const { id = '' } = useParams<{ id: string }>();
  const d = getDashboard(id);
  if (!d) return <NotFoundPage />;

  return (
    <>
      <PageHeader
        eyebrow="Intelligence · Dashboard"
        title={d.name}
        description={d.description}
      />
      <div className="space-y-6 px-8 py-6">
        <Card>
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="flex items-center gap-3">
              <ClassificationBadge classification={d.classification} />
              <Badge variant="outline" className="text-[10px]">{d.ownerRole}</Badge>
              {d.isPinned && <Badge variant="accent" className="text-[10px]">pinned</Badge>}
            </div>
            <div className="text-[10px] text-[var(--muted-foreground)]">
              {d.widgets.length} widgets · created {formatRelativeTime(new Date(d.createdAt))}
            </div>
          </CardContent>
        </Card>

        {d.promptSource && (
          <Card>
            <CardContent className="space-y-2 p-4">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                Built from prompt
              </div>
              <p className="rounded-md border bg-[var(--graphite-50)] p-3 text-xs leading-relaxed">{d.promptSource}</p>
            </CardContent>
          </Card>
        )}

        <DashboardGrid dashboard={d} animate />
      </div>
    </>
  );
}
