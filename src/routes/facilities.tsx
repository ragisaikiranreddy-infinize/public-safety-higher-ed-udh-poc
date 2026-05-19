/**
 * /facilities — Facilities / IoT board.
 *
 * Three sections: generator state, recent BMS alarms, fire-panel events,
 * and anomalous environmental readings.
 */
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Zap, AlertOctagon, Flame, Thermometer } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  GENERATOR_STATE, BMS_ALARMS, FIRE_PANEL_EVENTS, envReadingsAnomalous,
  generatorsByMode,
} from '@/lib/mock-db';
import { formatRelativeTime, cn } from '@/lib/utils';

export default function FacilitiesPage() {
  const recentAlarms = BMS_ALARMS.slice(0, 20);
  const anomalousEnv = useMemo(() => envReadingsAnomalous().slice(0, 15), []);
  const recentFire = FIRE_PANEL_EVENTS.filter((e) => e.kind !== 'normal').slice(0, 15);
  const genCounts = generatorsByMode();

  return (
    <>
      <PageHeader
        eyebrow="Campus Ops · Facilities + IoT"
        title="Building Management System"
        description={`6 backup generators · ${BMS_ALARMS.length} BMS alarms in the past 30 days · ${FIRE_PANEL_EVENTS.length} fire-panel events in the past 60 days. The active Thread B activation has 1 critical BMS alarm (WW4 generator-fail).`}
      />

      <div className="space-y-6 px-8 py-6">
        {/* Generators */}
        <Card>
          <CardContent className="space-y-3 p-5">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-[var(--hub-700)]" />
              <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                Backup generators
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
              {(['normal', 'on-generator', 'on-battery', 'test', 'failed'] as const).map((m) => (
                <div key={m} className="rounded-md border bg-[var(--card)] p-3 text-xs">
                  <div className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)]">{m}</div>
                  <div className={cn(
                    'mt-1 font-display text-2xl font-semibold tabular-nums',
                    m === 'failed' && (genCounts[m] ?? 0) > 0 && 'text-[var(--signal-red)]',
                  )}>
                    {genCounts[m] ?? 0}
                  </div>
                </div>
              ))}
            </div>
            <ul className="mt-3 space-y-1">
              {GENERATOR_STATE.map((g) => (
                <li key={g.id} className="flex flex-wrap items-center gap-3 rounded-md border bg-[var(--card)] p-2 text-xs">
                  <span className="font-mono text-[10px] text-[var(--muted-foreground)]">{g.id}</span>
                  <Link to={`/access/buildings/${encodeURIComponent(g.buildingId)}`} className="font-mono text-[10px] text-[var(--hub-700)] hover:underline">
                    {g.buildingId}
                  </Link>
                  <Badge variant={g.mode === 'failed' ? 'danger' : g.mode === 'normal' ? 'success' : 'warning'} className="text-[9px]">
                    {g.mode}
                  </Badge>
                  <span className="text-[10px] text-[var(--muted-foreground)]">fuel {g.fuelLevelPct}%</span>
                  <span className="text-[10px] text-[var(--muted-foreground)]">tested {formatRelativeTime(new Date(g.lastTestAt))}</span>
                  {g.lastFaultDetail && (
                    <span className="text-[10px] text-[var(--signal-red)]">⚠ {g.lastFaultDetail}</span>
                  )}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* BMS alarms */}
        <Card>
          <CardContent className="space-y-3 p-5">
            <div className="flex items-center gap-2">
              <AlertOctagon className="h-4 w-4 text-[var(--signal-amber)]" />
              <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                Recent BMS alarms ({recentAlarms.length} of {BMS_ALARMS.length})
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="border-b bg-[var(--graphite-50)]">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium text-[var(--muted-foreground)]">When</th>
                    <th className="px-3 py-2 text-left font-medium text-[var(--muted-foreground)]">Building</th>
                    <th className="px-3 py-2 text-left font-medium text-[var(--muted-foreground)]">System</th>
                    <th className="px-3 py-2 text-left font-medium text-[var(--muted-foreground)]">Kind</th>
                    <th className="px-3 py-2 text-left font-medium text-[var(--muted-foreground)]">Severity</th>
                    <th className="px-3 py-2 text-left font-medium text-[var(--muted-foreground)]">Detail</th>
                  </tr>
                </thead>
                <tbody>
                  {recentAlarms.map((a) => (
                    <tr key={a.id} className="border-b last:border-0 hover:bg-[var(--graphite-50)]">
                      <td className="px-3 py-2 text-[10px] text-[var(--muted-foreground)]">{formatRelativeTime(new Date(a.at))}</td>
                      <td className="px-3 py-2 font-mono text-[10px]">{a.buildingId}</td>
                      <td className="px-3 py-2 font-mono text-[10px]">{a.systemTag}</td>
                      <td className="px-3 py-2"><Badge variant="muted" className="text-[9px]">{a.kind}</Badge></td>
                      <td className="px-3 py-2">
                        <Badge
                          variant={a.severity === 'critical' ? 'danger' : a.severity === 'major' ? 'warning' : 'muted'}
                          className="text-[9px]"
                        >
                          {a.severity}
                        </Badge>
                      </td>
                      <td className="px-3 py-2 max-w-[400px] truncate">{a.detail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Fire-panel events */}
          <Card>
            <CardContent className="space-y-3 p-5">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-[var(--signal-red)]" />
                <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                  Recent fire-panel events
                </div>
              </div>
              <ul className="space-y-1">
                {recentFire.map((e) => (
                  <li key={e.id} className="flex flex-wrap items-center gap-2 rounded-md border bg-[var(--card)] p-2 text-xs">
                    <Badge
                      variant={e.kind === 'pre-alarm' ? 'warning' : e.kind === 'alarm' ? 'danger' : 'muted'}
                      className="text-[9px]"
                    >
                      {e.kind}
                    </Badge>
                    <span className="font-mono text-[10px]">{e.buildingId}</span>
                    <span className="text-[10px] text-[var(--muted-foreground)]">{e.deviceLabel}</span>
                    <span className="ml-auto text-[10px] text-[var(--muted-foreground)]">{formatRelativeTime(new Date(e.at))}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Anomalous environmental readings */}
          <Card>
            <CardContent className="space-y-3 p-5">
              <div className="flex items-center gap-2">
                <Thermometer className="h-4 w-4 text-[var(--signal-blue)]" />
                <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                  Anomalous environmental readings
                </div>
              </div>
              {anomalousEnv.length === 0 ? (
                <p className="text-xs text-[var(--muted-foreground)]">No anomalous readings in the past 24 hours.</p>
              ) : (
                <ul className="space-y-1">
                  {anomalousEnv.map((r) => (
                    <li key={r.id} className="flex flex-wrap items-center gap-2 rounded-md border bg-[var(--card)] p-2 text-xs">
                      <Badge variant="warning" className="text-[9px]">{r.kind}</Badge>
                      <span className="font-mono text-[10px]">{r.sensorTag}</span>
                      {r.buildingId && <span className="font-mono text-[10px]">{r.buildingId}</span>}
                      <span className="font-mono">{r.value}{r.unit}</span>
                      <span className="text-[10px] text-[var(--muted-foreground)]">
                        (range {r.thresholdLow ?? '?'}–{r.thresholdHigh ?? '?'}{r.unit})
                      </span>
                      <span className="ml-auto text-[10px] text-[var(--muted-foreground)]">{formatRelativeTime(new Date(r.at))}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
