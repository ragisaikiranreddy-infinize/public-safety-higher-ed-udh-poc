/**
 * <DashboardGrid /> — 12-column widget grid with stagger-reveal.
 *
 * Each widget animates in with its `staggerMs` delay. KPI widgets render
 * inline (with optional sparkline). Other kinds render as content placeholders
 * with the type label — full chart rendering lands post-POC.
 */
import { useEffect, useState } from 'react';
import { TrendingUp, BarChart3, PieChart, Table as TableIcon, Map, Lightbulb, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Dashboard, DashboardWidget, DashboardWidgetKind } from '@/lib/types';
import { cn } from '@/lib/utils';

const KIND_ICON: Record<DashboardWidgetKind, React.ElementType> = {
  kpi: TrendingUp,
  'line-chart': TrendingUp,
  'bar-chart': BarChart3,
  donut: PieChart,
  table: TableIcon,
  map: Map,
  'insight-feed': Lightbulb,
  'cohort-summary': Users,
};

interface Props {
  dashboard: Dashboard;
  /** Whether to play the stagger animation. */
  animate?: boolean;
  /** Optional callback when all widgets have revealed. */
  onAllRevealed?: () => void;
}

export function DashboardGrid({ dashboard, animate = true, onAllRevealed }: Props) {
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!animate) {
      setRevealedIds(new Set(dashboard.widgets.map((w) => w.id)));
      onAllRevealed?.();
      return;
    }
    setRevealedIds(new Set());
    const timers: number[] = [];
    dashboard.widgets.forEach((w) => {
      const t = window.setTimeout(() => {
        setRevealedIds((prev) => {
          const next = new Set(prev);
          next.add(w.id);
          if (next.size === dashboard.widgets.length) onAllRevealed?.();
          return next;
        });
      }, w.staggerMs);
      timers.push(t);
    });
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [dashboard.id, animate]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="grid grid-cols-12 gap-3">
      {dashboard.widgets.map((w) => {
        const revealed = revealedIds.has(w.id);
        return (
          <div
            key={w.id}
            className={cn(
              'col-span-12 transition-all duration-500',
              w.span === 3 && 'md:col-span-6 lg:col-span-3',
              w.span === 4 && 'md:col-span-6 lg:col-span-4',
              w.span === 6 && 'lg:col-span-6',
              w.span === 8 && 'lg:col-span-8',
              w.span === 12 && 'col-span-12',
              revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2',
            )}
          >
            <WidgetCard widget={w} />
          </div>
        );
      })}
    </div>
  );
}

function WidgetCard({ widget: w }: { widget: DashboardWidget }) {
  const Icon = KIND_ICON[w.kind];

  if (w.kind === 'kpi') {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">{w.title}</div>
            <Icon className="h-4 w-4 text-[var(--muted-foreground)]" />
          </div>
          <div className="font-display text-3xl font-semibold tabular-nums">{w.value ?? '—'}</div>
          {w.hint && <div className="mt-1 text-[10px] text-[var(--muted-foreground)]">{w.hint}</div>}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="mb-2 flex items-center justify-between">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">{w.title}</div>
          <Icon className="h-4 w-4 text-[var(--muted-foreground)]" />
        </div>
        <div className="flex h-24 items-center justify-center rounded-md border border-dashed bg-[var(--graphite-50)] text-[10px] text-[var(--muted-foreground)]">
          <div className="text-center">
            <Badge variant="outline" className="text-[9px]">{w.kind}</Badge>
            {w.sparkline && w.sparkline.length > 0 && (
              <div className="mt-2 flex items-end gap-0.5">
                {w.sparkline.slice(0, 30).map((v, i) => (
                  <div
                    key={i}
                    className="bg-[var(--hub-500)]/60"
                    style={{ height: `${Math.max(4, Math.min(40, v))}px`, width: '4px' }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
        {w.hint && <div className="mt-2 text-[10px] text-[var(--muted-foreground)]">{w.hint}</div>}
      </CardContent>
    </Card>
  );
}
