/**
 * /actions — saved watchpoints, scheduled reports, bookmarks, saved
 * cohorts + pinned dashboards.
 */
import { Link } from 'react-router-dom';
import { Bookmark, Bell, Calendar, Filter, LayoutDashboard } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SAVED_ACTIONS, savedActionsByKind } from '@/lib/mock-db';
import { formatRelativeTime, cn } from '@/lib/utils';
import type { ActionKind, SavedAction } from '@/lib/types';

const KIND_ICON: Record<ActionKind, React.ElementType> = {
  watchpoint: Bell,
  'scheduled-report': Calendar,
  'saved-cohort': Filter,
  'pinned-dashboard': LayoutDashboard,
  bookmark: Bookmark,
};

const KIND_LABEL: Record<ActionKind, string> = {
  watchpoint: 'Watchpoints',
  'scheduled-report': 'Scheduled reports',
  'saved-cohort': 'Saved cohorts',
  'pinned-dashboard': 'Pinned dashboards',
  bookmark: 'Bookmarks',
};

const KIND_ORDER: ActionKind[] = ['watchpoint', 'scheduled-report', 'saved-cohort', 'pinned-dashboard', 'bookmark'];

export default function ActionsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Intelligence · Actions"
        title="Saved actions"
        description={`${SAVED_ACTIONS.length} saved actions across the platform — watchpoints fire in real-time, scheduled reports run on cadence, cohorts + dashboards + bookmarks are quick-access references.`}
      />
      <div className="space-y-6 px-8 py-6">
        {KIND_ORDER.map((kind) => {
          const items = savedActionsByKind(kind);
          if (items.length === 0) return null;
          const Icon = KIND_ICON[kind];
          return (
            <Card key={kind}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Icon className="h-4 w-4 text-[var(--hub-700)]" />
                  {KIND_LABEL[kind]} ({items.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ul className="divide-y">
                  {items.map((a) => (
                    <ActionRow key={a.id} action={a} />
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
}

function ActionRow({ action: a }: { action: SavedAction }) {
  const target = a.targetId
    ? a.kind === 'saved-cohort' ? `/cohorts`
    : a.kind === 'pinned-dashboard' ? `/dashboards/${encodeURIComponent(a.targetId)}`
    : a.kind === 'bookmark' && a.targetId.startsWith('BIT-') ? `/bit/${encodeURIComponent(a.targetId)}`
    : a.kind === 'bookmark' && a.targetId.startsWith('INC-') ? `/incidents/${encodeURIComponent(a.targetId)}`
    : a.kind === 'bookmark' && a.targetId.startsWith('PER-') ? `/persons/${encodeURIComponent(a.targetId)}`
    : undefined
    : undefined;

  const content = (
    <div className={cn(
      'flex items-center justify-between gap-4 px-5 py-3 text-xs',
      target && 'transition-colors hover:bg-[var(--graphite-50)]',
    )}>
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Badge variant={a.status === 'active' ? 'success' : a.status === 'paused' ? 'muted' : 'warning'} className="text-[10px]">
          {a.status}
        </Badge>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium">{a.name}</span>
            {a.threadTag && <Badge variant="accent" className="text-[9px]">Thread {a.threadTag}</Badge>}
          </div>
          <div className="text-[10px] text-[var(--muted-foreground)]">{a.description}</div>
          {a.condition && (
            <code className="mt-1 block rounded bg-[var(--graphite-50)] p-1 font-mono text-[10px] text-[var(--muted-foreground)]">{a.condition}</code>
          )}
        </div>
      </div>
      <div className="text-right text-[10px] text-[var(--muted-foreground)]">
        <div><Badge variant="outline" className="text-[9px]">{a.cadence}</Badge></div>
        {a.lastFiredAt && <div className="mt-1">fired {formatRelativeTime(new Date(a.lastFiredAt))}</div>}
      </div>
    </div>
  );

  return target ? <li><Link to={target}>{content}</Link></li> : <li>{content}</li>;
}
