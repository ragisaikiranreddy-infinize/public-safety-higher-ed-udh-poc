/**
 * /eoc — EOC home: active activations + weather feed + activation history.
 *
 * If a Thread B activation is open, the COP-style preview lands at the top.
 */
import { Link } from 'react-router-dom';
import { CloudRain, AlertOctagon, Siren } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  activeEOCActivations, EOC_ACTIVATIONS, activeWeatherAlerts,
  bmsAlarmsCritical, generatorsByMode,
} from '@/lib/mock-db';
import { formatRelativeTime, cn } from '@/lib/utils';

const SEVERITY_COLOR: Record<string, string> = {
  extreme: 'text-[var(--signal-red)]',
  severe: 'text-[var(--signal-amber)]',
  moderate: 'text-[var(--signal-blue)]',
  minor: 'text-[var(--muted-foreground)]',
};

export default function EOCPage() {
  const active = activeEOCActivations();
  const weather = activeWeatherAlerts();
  const criticalAlarms = bmsAlarmsCritical();
  const gens = generatorsByMode();

  return (
    <>
      <PageHeader
        eyebrow="EOC · Emergency Operations Center"
        title="EOC Home"
        description={`${active.length} active activation(s) · ${weather.length} active weather alert(s) · ${criticalAlarms.length} critical alarm(s). Activations auto-open from NWS feeds intersecting the campus polygon, from PD 911 escalation, or from runbook manual launch.`}
      />

      <div className="space-y-6 px-8 py-6">
        {/* Active activations strip */}
        {active.length > 0 && (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {active.map((a) => (
              <Link key={a.id} to={`/eoc/activations/${encodeURIComponent(a.id)}`}>
                <Card className={cn(
                  'transition-colors hover:bg-[var(--graphite-50)]',
                  a.level === 'full' && 'border-[var(--signal-red)]',
                  a.level === 'partial' && 'border-[var(--signal-amber)]',
                )}>
                  <CardContent className="space-y-2 p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Siren className="h-4 w-4 text-[var(--signal-amber)]" />
                        <span className="font-mono text-[10px] text-[var(--muted-foreground)]">{a.id}</span>
                        <Badge variant={a.level === 'full' ? 'danger' : 'warning'}>{a.level}</Badge>
                      </div>
                      {a.threadTag && <Badge variant="accent">Thread {a.threadTag}</Badge>}
                    </div>
                    <div className="font-display text-base font-semibold">{a.name}</div>
                    <p className="line-clamp-2 text-[11px] text-[var(--muted-foreground)]">{a.narrative}</p>
                    <div className="flex items-center justify-between text-[10px] text-[var(--muted-foreground)]">
                      <span>{a.buildingIds.length} buildings · {a.lockdownIds.length} lockdowns · {a.campaignIds.length} campaigns</span>
                      <span>opened {formatRelativeTime(new Date(a.openedAt))}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Weather feed */}
        <Card>
          <CardContent className="space-y-3 p-5">
            <div className="flex items-center gap-2">
              <CloudRain className="h-4 w-4 text-[var(--signal-blue)]" />
              <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                NWS feed — active alerts
              </div>
            </div>
            {weather.length === 0 ? (
              <p className="text-xs text-[var(--muted-foreground)]">No active weather alerts intersecting the campus polygon.</p>
            ) : (
              <ul className="space-y-2">
                {weather.map((w) => (
                  <li
                    key={w.id}
                    className="flex items-start gap-3 rounded-md border bg-[var(--card)] p-3 text-xs"
                  >
                    <AlertOctagon className={cn('mt-0.5 h-4 w-4', SEVERITY_COLOR[w.severity])} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-[var(--muted-foreground)]">{w.id}</span>
                        <Badge variant="danger" className="text-[9px]">{w.kind}</Badge>
                        <Badge variant="warning" className="text-[9px]">{w.severity}</Badge>
                        <span className="text-[10px] text-[var(--muted-foreground)]">issued {formatRelativeTime(new Date(w.issuedAt))}</span>
                      </div>
                      <div className="mt-1 font-semibold">{w.headline}</div>
                      <p className="mt-1 text-[11px] leading-relaxed text-[var(--muted-foreground)]">{w.raw.slice(0, 280)}…</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Generators snapshot */}
        <Card>
          <CardContent className="space-y-3 p-5">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
              Backup generators
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
              {(['normal', 'on-generator', 'on-battery', 'test', 'failed'] as const).map((m) => (
                <div key={m} className="rounded-md border bg-[var(--card)] p-3 text-xs">
                  <div className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)]">{m}</div>
                  <div className={cn(
                    'mt-1 font-display text-2xl font-semibold tabular-nums',
                    m === 'failed' && (gens[m] ?? 0) > 0 && 'text-[var(--signal-red)]',
                  )}>
                    {gens[m] ?? 0}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* History */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="border-b bg-[var(--graphite-50)]">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Activation</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Name</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Kind</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Level</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Status</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Opened</th>
                  </tr>
                </thead>
                <tbody>
                  {EOC_ACTIVATIONS.map((a) => (
                    <tr key={a.id} className="border-b last:border-0 hover:bg-[var(--graphite-50)]">
                      <td className="px-4 py-2">
                        <Link to={`/eoc/activations/${encodeURIComponent(a.id)}`} className="font-mono text-[var(--hub-700)] hover:underline">
                          {a.id}
                        </Link>
                      </td>
                      <td className="px-4 py-2">{a.name}</td>
                      <td className="px-4 py-2"><Badge variant="muted" className="text-[10px]">{a.kind}</Badge></td>
                      <td className="px-4 py-2"><Badge variant={a.level === 'full' ? 'danger' : a.level === 'partial' ? 'warning' : 'info'} className="text-[10px]">{a.level}</Badge></td>
                      <td className="px-4 py-2"><Badge variant={a.status === 'active' ? 'warning' : 'success'} className="text-[10px]">{a.status}</Badge></td>
                      <td className="px-4 py-2 text-[10px] text-[var(--muted-foreground)]">{formatRelativeTime(new Date(a.openedAt))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
