/**
 * <CommonOperatingPicture /> — the EOC activation hub.
 *
 * Single-glance view of an activation:
 *   - Headline + activation level + duration
 *   - ICS 207 grid (8 seats)
 *   - Active runbook step progress
 *   - Campaign delivery roll-up
 *   - Critical BMS alarms
 *
 * Designed to be the at-a-glance status for the IC + section chiefs.
 */
import { Link } from 'react-router-dom';
import { AlertOctagon, Radio, BookOpen, Activity } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ICSGrid } from './ics-grid';
import type {
  EOCActivation, NotificationCampaign, RunbookExecution, BMSAlarm, Runbook,
} from '@/lib/types';
import { formatRelativeTime, cn } from '@/lib/utils';

interface Props {
  activation: EOCActivation;
  runbook?: Runbook;
  runbookExecution?: RunbookExecution;
  campaigns: NotificationCampaign[];
  criticalAlarms: BMSAlarm[];
}

const LEVEL_BG: Record<EOCActivation['level'], string> = {
  monitoring: 'bg-[var(--signal-blue-soft)] text-[oklch(0.38_0.12_235)]',
  partial: 'bg-[var(--signal-amber-soft)] text-[oklch(0.42_0.13_70)]',
  full: 'bg-[var(--signal-red-soft)] text-[var(--signal-red)]',
  'after-action': 'bg-[var(--signal-green-soft)] text-[oklch(0.38_0.12_155)]',
};

export function CommonOperatingPicture({
  activation, runbook, runbookExecution, campaigns, criticalAlarms,
}: Props) {
  const openedAt = new Date(activation.openedAt);
  const elapsedMin = Math.round((Date.now() - openedAt.getTime()) / 60_000);

  const completedSteps = runbookExecution?.steps.filter((s) => s.status === 'completed').length ?? 0;
  const inProgressStep = runbookExecution?.steps.find((s) => s.status === 'in-progress');
  const totalSteps = runbook?.steps.length ?? 0;
  const inProgressStepDef = inProgressStep
    ? runbook?.steps.find((d) => d.id === inProgressStep.stepId)
    : undefined;

  return (
    <div className="space-y-4">
      {/* Headline */}
      <Card>
        <CardContent className="space-y-3 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className={cn('inline-block rounded-md px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider', LEVEL_BG[activation.level])}>
                {activation.level}
              </span>
              <span className="font-display text-lg font-semibold">{activation.name}</span>
              <Badge variant={activation.status === 'active' ? 'warning' : 'muted'}>
                {activation.status}
              </Badge>
              {activation.threadTag && (
                <Badge variant="accent" className="text-[10px]">Thread {activation.threadTag}</Badge>
              )}
            </div>
            <div className="text-[11px] text-[var(--muted-foreground)]">
              Opened {formatRelativeTime(openedAt)} · T+{elapsedMin}m
            </div>
          </div>
          <p className="text-[13px] leading-relaxed text-[var(--foreground)]">{activation.narrative}</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Runbook progress */}
        <Card className="lg:col-span-2">
          <CardContent className="space-y-3 p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-[var(--hub-700)]" />
                <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                  Runbook progress
                </div>
              </div>
              {runbookExecution && (
                <Link to={`/runbooks/${encodeURIComponent(runbookExecution.id)}/run`} className="text-[11px] text-[var(--hub-700)] hover:underline">
                  Open run →
                </Link>
              )}
            </div>
            {!runbookExecution || !runbook ? (
              <p className="text-xs text-[var(--muted-foreground)]">No runbook started for this activation.</p>
            ) : (
              <>
                <div className="text-sm font-medium">{runbook.name}</div>
                {/* Step progress bar */}
                <div className="h-1.5 overflow-hidden rounded-full bg-[var(--graphite-100)]">
                  <div
                    className="h-full rounded-full bg-[var(--signal-blue)]"
                    style={{ width: `${totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-[var(--muted-foreground)]">
                  <span>{completedSteps} / {totalSteps} steps complete</span>
                  <span>{runbookExecution.status}</span>
                </div>
                {inProgressStepDef && (
                  <div className="rounded-md border border-[var(--signal-blue)]/30 bg-[var(--signal-blue-soft)]/30 p-2.5 text-xs">
                    <span className="font-semibold">In progress: </span>
                    {inProgressStepDef.title}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Campaign delivery */}
        <Card>
          <CardContent className="space-y-2 p-5">
            <div className="flex items-center gap-2">
              <Radio className="h-4 w-4 text-[var(--hub-700)]" />
              <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                Campaigns sent
              </div>
            </div>
            {campaigns.length === 0 ? (
              <p className="text-xs text-[var(--muted-foreground)]">No campaigns for this activation.</p>
            ) : (
              <ul className="space-y-2">
                {campaigns.map((c) => {
                  const totalDelivered = c.delivery.reduce((s, d) => s + d.delivered, 0);
                  const totalAttempted = c.delivery.reduce((s, d) => s + d.attempted, 0);
                  return (
                    <li key={c.id}>
                      <Link
                        to={`/notifications/${encodeURIComponent(c.id)}`}
                        className="block rounded-md border bg-[var(--card)] p-2.5 text-xs hover:bg-[var(--graphite-50)]"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] text-[var(--hub-700)]">{c.id}</span>
                          <Badge variant="success" className="text-[9px]">{c.status}</Badge>
                        </div>
                        <div className="mt-0.5 truncate text-[11px]">{c.name}</div>
                        <div className="text-[10px] text-[var(--muted-foreground)]">
                          {totalDelivered.toLocaleString()} / {totalAttempted.toLocaleString()} delivered
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ICS 207 */}
      <Card>
        <CardContent className="space-y-3 p-5">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
            ICS 207 — assignment list
          </div>
          <ICSGrid ics={activation.ics} />
        </CardContent>
      </Card>

      {/* Critical alarms */}
      {criticalAlarms.length > 0 && (
        <Card className="border-[var(--signal-red)]/40">
          <CardContent className="space-y-3 p-5">
            <div className="flex items-center gap-2">
              <AlertOctagon className="h-4 w-4 text-[var(--signal-red)]" />
              <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--signal-red)]">
                Critical operational alarms ({criticalAlarms.length})
              </div>
            </div>
            <ul className="space-y-2">
              {criticalAlarms.map((a) => (
                <li
                  key={a.id}
                  className="flex items-start gap-3 rounded-md border bg-[var(--card)] p-2.5 text-xs"
                >
                  <Activity className="mt-0.5 h-3.5 w-3.5 text-[var(--signal-red)]" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-[var(--muted-foreground)]">{a.id}</span>
                      <Badge variant="muted" className="text-[9px]">{a.kind}</Badge>
                      <Badge variant="danger" className="text-[9px]">{a.severity}</Badge>
                      <span className="font-mono text-[10px] text-[var(--muted-foreground)]">{a.systemTag}</span>
                      <span className="text-[10px] text-[var(--muted-foreground)]">@ {a.buildingId}</span>
                    </div>
                    <p className="mt-1 leading-relaxed">{a.detail}</p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
