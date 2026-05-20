/**
 * <DashboardGrid /> — 12-column widget grid with stagger-reveal.
 *
 * Renders real Recharts visualizations for chart kinds, real data lists for
 * insight-feed / cohort-summary, and a styled table for the table kind.
 */
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  BarChart3,
  PieChart as PieIcon,
  Table as TableIcon,
  Map as MapIcon,
  Lightbulb,
  Users,
  GitBranch,
  AlertOctagon,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SeverityDot } from '@/components/data-display/severity-dot';
import { INSIGHTS, COHORTS } from '@/lib/mock-db';
import type { Dashboard, DashboardWidget, DashboardWidgetKind, InsightKind } from '@/lib/types';
import { cn, formatRelativeTime } from '@/lib/utils';

const KIND_ICON: Record<DashboardWidgetKind, React.ElementType> = {
  kpi: TrendingUp,
  'line-chart': TrendingUp,
  'bar-chart': BarChart3,
  donut: PieIcon,
  table: TableIcon,
  map: MapIcon,
  'insight-feed': Lightbulb,
  'cohort-summary': Users,
};

const INSIGHT_ICON: Record<InsightKind, React.ElementType> = {
  rca: GitBranch,
  prediction: TrendingUp,
  anomaly: AlertOctagon,
};

/** Hub-derived palette for chart segments. */
const PALETTE = [
  'var(--hub-600)',
  'var(--hub-400)',
  'var(--signal-amber)',
  'var(--signal-green)',
  'var(--signal-blue)',
  'var(--graphite-500)',
];

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

  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center justify-between">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
            {w.title}
          </div>
          <Icon className="h-4 w-4 text-[var(--muted-foreground)]" />
        </div>
        <WidgetBody widget={w} />
        {w.hint && <div className="text-[10px] text-[var(--muted-foreground)]">{w.hint}</div>}
      </CardContent>
    </Card>
  );
}

function WidgetBody({ widget: w }: { widget: DashboardWidget }) {
  switch (w.kind) {
    case 'kpi':
      return (
        <div>
          <div className="font-display text-3xl font-semibold tabular-nums">{w.value ?? '—'}</div>
          {w.sparkline && w.sparkline.length >= 3 && <KpiSparkline points={w.sparkline} />}
        </div>
      );
    case 'line-chart':
      return <LineWidget points={w.sparkline ?? []} />;
    case 'bar-chart':
      return <BarWidget points={w.sparkline ?? []} labels={w.labels} />;
    case 'donut':
      return <DonutWidget points={w.sparkline ?? []} labels={w.labels} />;
    case 'table':
      return <TableWidget rows={w.tableRows} hint={w.hint} />;
    case 'insight-feed':
      return <InsightFeedWidget threadTag={w.threadTag} />;
    case 'cohort-summary':
      return <CohortSummaryWidget />;
    case 'map':
      return <MapStub />;
  }
}

// ---------- KPI inline sparkline ----------

function KpiSparkline({ points }: { points: number[] }) {
  const data = useMemo(() => points.map((v, i) => ({ i, v })), [points]);
  return (
    <div className="mt-2 h-8">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="kpi-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--hub-500)" stopOpacity={0.45} />
              <stop offset="100%" stopColor="var(--hub-500)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="v"
            stroke="var(--hub-600)"
            strokeWidth={1.5}
            fill="url(#kpi-fill)"
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ---------- Line ----------

function LineWidget({ points }: { points: number[] }) {
  const data = useMemo(
    () =>
      points.length > 0
        ? points.map((v, i) => ({ i, v, label: `D-${points.length - i - 1}` }))
        : [],
    [points],
  );
  if (data.length === 0) return <EmptyState label="no series" />;
  return (
    <div className="h-32">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="line-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--hub-500)" stopOpacity={0.4} />
              <stop offset="100%" stopColor="var(--hub-500)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--border)" strokeDasharray="2 4" vertical={false} />
          <XAxis dataKey="i" hide />
          <YAxis tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }} width={24} />
          <Tooltip
            cursor={{ stroke: 'var(--hub-300)', strokeWidth: 1 }}
            contentStyle={{ fontSize: 10, padding: '4px 8px', borderRadius: 6 }}
            formatter={(v: number) => [v, 'count']}
            labelFormatter={(_, p) => (p[0] ? p[0].payload.label : '')}
          />
          <Area
            type="monotone"
            dataKey="v"
            stroke="var(--hub-600)"
            strokeWidth={2}
            fill="url(#line-fill)"
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ---------- Bar ----------

function BarWidget({ points, labels }: { points: number[]; labels?: string[] }) {
  const data = useMemo(
    () => points.map((v, i) => ({ name: labels?.[i] ?? `#${i + 1}`, v })),
    [points, labels],
  );
  if (data.length === 0) return <EmptyState label="no data" />;
  return (
    <div className="h-32">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="var(--border)" strokeDasharray="2 4" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }}
            interval={0}
          />
          <YAxis tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }} width={24} />
          <Tooltip contentStyle={{ fontSize: 10, padding: '4px 8px', borderRadius: 6 }} />
          <Bar dataKey="v" radius={[3, 3, 0, 0]} isAnimationActive={false}>
            {data.map((_, i) => (
              <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ---------- Donut ----------

function DonutWidget({ points, labels }: { points: number[]; labels?: string[] }) {
  const data = useMemo(
    () => points.map((v, i) => ({ name: labels?.[i] ?? `#${i + 1}`, v })),
    [points, labels],
  );
  const total = data.reduce((s, d) => s + d.v, 0);
  if (data.length === 0 || total === 0) return <EmptyState label="no data" />;
  return (
    <div className="flex h-32 items-center gap-3">
      <div className="relative h-32 w-32 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="v"
              nameKey="name"
              innerRadius={32}
              outerRadius={52}
              paddingAngle={2}
              isAnimationActive={false}
              stroke="var(--card)"
            >
              {data.map((_, i) => (
                <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ fontSize: 10, padding: '4px 8px', borderRadius: 6 }} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center font-display text-base font-semibold tabular-nums">
          {total}
        </div>
      </div>
      <ul className="flex-1 space-y-1 text-[10px]">
        {data.map((d, i) => {
          const pct = Math.round((d.v / total) * 100);
          return (
            <li key={i} className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5">
                <span
                  className="inline-block h-2 w-2 rounded-sm"
                  style={{ background: PALETTE[i % PALETTE.length] }}
                />
                <span className="truncate text-[var(--muted-foreground)]">{d.name}</span>
              </span>
              <span className="font-mono tabular-nums">
                {d.v} · {pct}%
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ---------- Table ----------

function TableWidget({ rows, hint }: { rows?: string[][]; hint?: string }) {
  if (!rows || rows.length === 0) {
    return (
      <div className="rounded-md border bg-[var(--graphite-50)] p-3 text-[11px] text-[var(--muted-foreground)]">
        {hint ?? 'no rows'}
      </div>
    );
  }
  const [header, ...body] = rows;
  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="w-full text-[11px]">
        <thead className="bg-[var(--graphite-50)]">
          <tr>
            {header.map((h, i) => (
              <th key={i} className="px-2 py-1.5 text-left font-medium text-[var(--muted-foreground)]">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((row, i) => (
            <tr key={i} className="border-t last:border-b-0">
              {row.map((cell, j) => (
                <td key={j} className="px-2 py-1.5 font-mono text-[10px]">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---------- Insight feed ----------

function InsightFeedWidget({ threadTag }: { threadTag?: 'A' | 'B' | 'C' }) {
  const items = useMemo(() => {
    const filtered = threadTag
      ? INSIGHTS.filter((i) => i.threadTag === threadTag)
      : INSIGHTS;
    return filtered.slice(0, 3);
  }, [threadTag]);
  if (items.length === 0) return <EmptyState label="no insights" />;
  return (
    <ul className="space-y-2">
      {items.map((ins) => {
        const Icon = INSIGHT_ICON[ins.kind];
        return (
          <li key={ins.id}>
            <Link
              to={`/insights/${encodeURIComponent(ins.id)}`}
              className="block rounded-md border bg-[var(--card)] p-2 hover:bg-[var(--graphite-50)]"
            >
              <div className="flex items-center gap-2">
                <SeverityDot severity={ins.severity} />
                <Icon className="h-3 w-3 text-[var(--hub-700)]" />
                <Badge variant="outline" className="text-[9px]">
                  {ins.kind}
                </Badge>
                <span className="ml-auto text-[9px] text-[var(--muted-foreground)]">
                  {formatRelativeTime(new Date(ins.createdAt))}
                </span>
              </div>
              <div className="mt-1 line-clamp-2 text-[11px] leading-snug">{ins.title}</div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

// ---------- Cohort summary ----------

function CohortSummaryWidget() {
  const top = useMemo(() => COHORTS.slice(0, 3), []);
  if (top.length === 0) return <EmptyState label="no cohorts" />;
  return (
    <ul className="space-y-1.5 text-[11px]">
      {top.map((c) => (
        <li key={c.id} className="flex items-center justify-between gap-2 rounded-md border bg-[var(--card)] p-2">
          <Link to="/cohorts" className="truncate text-[var(--hub-700)] hover:underline">
            {c.name}
          </Link>
          <Badge variant="muted" className="text-[9px]">
            {c.memberIds.length} members
          </Badge>
        </li>
      ))}
    </ul>
  );
}

// ---------- Map stub (intentionally inline — heavy MapLibre belongs on /map) ----------

function MapStub() {
  return (
    <div className="relative h-32 overflow-hidden rounded-md border bg-[linear-gradient(135deg,var(--hub-50)_0%,var(--graphite-50)_100%)]">
      <div className="absolute inset-0 opacity-50 [background-image:linear-gradient(var(--border)_1px,transparent_1px),linear-gradient(90deg,var(--border)_1px,transparent_1px)] [background-size:16px_16px]" />
      <div className="relative flex h-full items-center justify-center text-[10px] text-[var(--muted-foreground)]">
        <MapIcon className="mr-1.5 h-3.5 w-3.5" />
        campus map · open <Link to="/map" className="ml-1 text-[var(--hub-700)] hover:underline">/map</Link>
      </div>
    </div>
  );
}

// ---------- Empty state ----------

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex h-24 items-center justify-center rounded-md border border-dashed bg-[var(--graphite-50)] text-[10px] text-[var(--muted-foreground)]">
      {label}
    </div>
  );
}
