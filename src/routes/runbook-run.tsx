/**
 * /runbooks/:id/run — runbook execution view.
 *
 * Step-by-step state with start/complete timestamps + result notes.
 * Read-only for R6 (the demo activation is already in progress); execution
 * mutation is R9 work.
 */
import { Link, useParams } from 'react-router-dom';
import { CheckCircle2, Loader2, Circle, XCircle, Zap, User } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getRunbookExecution, getRunbook } from '@/lib/mock-db';
import { formatRelativeTime, cn } from '@/lib/utils';
import type { RunbookStepStatus } from '@/lib/types';
import NotFoundPage from './not-found';

const STATUS_ICON: Record<RunbookStepStatus, React.ElementType> = {
  pending: Circle,
  'in-progress': Loader2,
  completed: CheckCircle2,
  skipped: Circle,
  failed: XCircle,
};

const STATUS_COLOR: Record<RunbookStepStatus, string> = {
  pending: 'text-[var(--muted-foreground)]',
  'in-progress': 'text-[var(--signal-blue)] animate-spin',
  completed: 'text-[var(--signal-green)]',
  skipped: 'text-[var(--muted-foreground)]',
  failed: 'text-[var(--signal-red)]',
};

export default function RunbookRunPage() {
  const { id = '' } = useParams<{ id: string }>();
  const execution = getRunbookExecution(id);
  if (!execution) return <NotFoundPage />;

  const def = getRunbook(execution.runbookId);
  if (!def) return <NotFoundPage />;

  const completed = execution.steps.filter((s) => s.status === 'completed').length;
  const total = def.steps.length;
  const inProgress = execution.steps.find((s) => s.status === 'in-progress');
  const inProgressDef = inProgress ? def.steps.find((d) => d.id === inProgress.stepId) : undefined;

  return (
    <>
      <PageHeader
        eyebrow="EOC · Runbook execution"
        title={def.name}
        description={`${execution.id} · started ${formatRelativeTime(new Date(execution.startedAt))} · ${completed} / ${total} steps complete`}
      />

      <div className="space-y-6 px-8 py-6">
        <Card>
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-5">
            <div className="flex items-center gap-3">
              <Badge variant={execution.status === 'in-progress' ? 'warning' : execution.status === 'completed' ? 'success' : 'muted'}>
                {execution.status}
              </Badge>
              <Badge variant="muted">{def.category}</Badge>
              {execution.threadTag && <Badge variant="accent">Thread {execution.threadTag}</Badge>}
            </div>
            {execution.activationId && (
              <div className="text-xs">
                <span className="text-[var(--muted-foreground)]">Activation: </span>
                <Link to={`/eoc/activations/${encodeURIComponent(execution.activationId)}`} className="font-mono text-[var(--hub-700)] hover:underline">
                  {execution.activationId}
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {inProgressDef && (
          <Card className="border-[var(--signal-blue)]/40 bg-[var(--signal-blue-soft)]/20">
            <CardContent className="space-y-1 p-5">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--signal-blue)]">
                In progress
              </div>
              <div className="text-sm font-semibold">{inProgressDef.title}</div>
              <p className="text-[12px] leading-relaxed text-[var(--muted-foreground)]">{inProgressDef.description}</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-0">
            <ol className="divide-y">
              {execution.steps.map((s) => {
                const stepDef = def.steps.find((d) => d.id === s.stepId)!;
                const Icon = STATUS_ICON[s.status];
                return (
                  <li key={s.stepId} className="flex items-start gap-4 px-5 py-3 text-xs">
                    <div className="flex flex-col items-center pt-0.5">
                      <Icon className={cn('h-4 w-4', STATUS_COLOR[s.status])} />
                      <span className="mt-1 font-mono text-[9px] text-[var(--muted-foreground)]">
                        #{stepDef.order.toString().padStart(2, '0')}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-[13px]">{stepDef.title}</span>
                        <Badge variant="outline" className="text-[9px]">{stepDef.kind}</Badge>
                        {stepDef.automatable ? (
                          <Badge variant="info" className="text-[9px]">
                            <Zap className="mr-0.5 h-3 w-3" /> auto
                          </Badge>
                        ) : (
                          <Badge variant="muted" className="text-[9px]">
                            <User className="mr-0.5 h-3 w-3" /> manual
                          </Badge>
                        )}
                      </div>
                      <p className="mt-1 leading-relaxed text-[var(--muted-foreground)]">{stepDef.description}</p>
                      {s.resultNote && (
                        <p className="mt-1 rounded-md border bg-[var(--graphite-50)] p-2 text-[11px] leading-relaxed">{s.resultNote}</p>
                      )}
                      <div className="mt-1 flex items-center gap-3 text-[10px] text-[var(--muted-foreground)]">
                        {s.startedAt && <span>started {formatRelativeTime(new Date(s.startedAt))}</span>}
                        {s.completedAt && <span>completed {formatRelativeTime(new Date(s.completedAt))}</span>}
                        {!s.startedAt && <span>ETA {Math.round(stepDef.etaSec / 60)}m from start</span>}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
