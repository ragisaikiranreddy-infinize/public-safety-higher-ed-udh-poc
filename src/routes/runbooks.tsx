/**
 * /runbooks — pre-approved playbook catalog.
 *
 * Each card opens to /runbooks/:id/run which simulates execution.
 */
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RUNBOOKS, RUNBOOK_EXECUTIONS } from '@/lib/mock-db';
import { formatRelativeTime } from '@/lib/utils';

export default function RunbooksPage() {
  // Active executions for the active-executions strip
  const active = RUNBOOK_EXECUTIONS.filter((x) => x.status === 'in-progress' || x.status === 'queued');

  return (
    <>
      <PageHeader
        eyebrow="EOC · Runbooks"
        title="Runbook catalog"
        description={`${RUNBOOKS.length} pre-approved playbooks. Each is a deterministic sequence of automatable + human steps; a runbook execution writes to the situation log of the parent activation.`}
      />

      <div className="space-y-6 px-8 py-6">
        {active.length > 0 && (
          <Card>
            <CardContent className="space-y-3 p-5">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                Active executions ({active.length})
              </div>
              <ul className="space-y-2">
                {active.map((x) => {
                  const def = RUNBOOKS.find((r) => r.id === x.runbookId);
                  const completed = x.steps.filter((s) => s.status === 'completed').length;
                  return (
                    <li key={x.id}>
                      <Link
                        to={`/runbooks/${encodeURIComponent(x.id)}/run`}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-md border bg-[var(--card)] p-3 text-xs hover:bg-[var(--graphite-50)]"
                      >
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-[var(--hub-700)]" />
                          <span className="font-mono text-[10px] text-[var(--hub-700)]">{x.id}</span>
                          <span className="font-medium">{def?.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] text-[var(--muted-foreground)]">{completed} / {def?.steps.length ?? 0} steps</span>
                          <Badge variant="warning" className="text-[10px]">{x.status}</Badge>
                          {x.threadTag && <Badge variant="accent" className="text-[10px]">Thread {x.threadTag}</Badge>}
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {RUNBOOKS.map((r) => (
            <Card key={r.id}>
              <CardContent className="space-y-2 p-5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-[var(--muted-foreground)]">{r.id}</span>
                  <Badge variant="muted" className="text-[10px]">{r.category}</Badge>
                </div>
                <div className="font-display text-base font-semibold">{r.name}</div>
                <p className="text-[11px] leading-relaxed text-[var(--muted-foreground)]">{r.description}</p>
                <div className="flex items-center justify-between text-[10px] text-[var(--muted-foreground)]">
                  <span>{r.steps.length} steps · owner: <span className="font-mono">{r.ownerRole}</span></span>
                  <span>reviewed {formatRelativeTime(new Date(r.lastReviewedAt))}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
