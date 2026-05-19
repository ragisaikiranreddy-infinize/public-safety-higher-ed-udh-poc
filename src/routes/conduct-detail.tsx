/**
 * /conduct/:id — Student Conduct case detail.
 *
 * Sections: summary, sanctions (with edu-program link), parental
 * notifications (FERPA §99.31), barrier-hit panel for blocked roles.
 */
import type { ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarrierIndicator } from '@/components/data-display/barrier-indicator';
import { ClassificationBadge } from '@/components/data-display/classification-badge';
import {
  getConductCase, getPerson,
  sanctionsForCase, getEduProgram,
  parentalNotificationsByPerson,
} from '@/lib/mock-db';
import { useRole } from '@/lib/role-context';
import { evaluateBarrier } from '@/lib/information-barriers';
import { formatRelativeTime } from '@/lib/utils';
import NotFoundPage from './not-found';

export default function ConductDetailPage() {
  const { id = '' } = useParams<{ id: string }>();
  const c = getConductCase(id);
  const { role } = useRole();

  if (!c) return <NotFoundPage />;

  const barrier = evaluateBarrier({
    actorRole: role,
    fieldClassification: c.classification,
    resourceKind: 'conduct-case',
    resourceId: c.id,
  });

  const subject = getPerson(c.subjectPersonId);
  const sanctions = sanctionsForCase(c.id);
  const parentalNotifs = parentalNotificationsByPerson(c.subjectPersonId)
    .filter((p) => p.conductCaseId === c.id);

  return (
    <>
      <PageHeader
        eyebrow="Conduct · Student Conduct case"
        title={c.id}
        description={`${c.subtype} · ${c.status} · opened ${formatRelativeTime(new Date(c.openedAt))}`}
      />
      <div className="space-y-6 px-8 py-6">
        {!barrier.allowed ? (
          <Card className="border-[var(--barrier)]">
            <CardContent className="space-y-3 p-6 text-center">
              <BarrierIndicator barrierId={barrier.barrierHit?.id} size="md" />
              <p className="text-sm">{barrier.barrierHit?.description}</p>
              <p className="text-[11px] text-[var(--muted-foreground)]">
                <strong>Override path:</strong> {barrier.barrierHit?.overridePath}
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="flex items-center gap-3">
                  <ClassificationBadge classification={c.classification} />
                  <Badge variant="outline" className="text-[10px]">{c.subtype}</Badge>
                  <Badge variant="muted" className="text-[10px]">{c.status}</Badge>
                  {c.threadTag && <Badge variant="accent">Thread {c.threadTag}</Badge>}
                  {c.medicalAmnestyInvoked && <Badge variant="success">medical amnesty</Badge>}
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-[var(--muted-foreground)]">Subject:</span>
                  <Link to={`/persons/${encodeURIComponent(c.subjectPersonId)}`} className="font-mono text-[var(--hub-700)] hover:underline">
                    {subject?.fullName ?? c.subjectPersonId}
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs leading-relaxed">{c.summary}</p>
                <div className="mt-3 grid grid-cols-2 gap-3 text-xs md:grid-cols-4">
                  {c.buildingId && (
                    <Stat label="Building" value={<span className="font-mono">{c.buildingId}</span>} />
                  )}
                  {c.reportedFromIncidentId && (
                    <Stat label="From incident" value={
                      <Link to={`/incidents/${encodeURIComponent(c.reportedFromIncidentId)}`} className="font-mono text-[var(--hub-700)] hover:underline">
                        {c.reportedFromIncidentId}
                      </Link>
                    } />
                  )}
                  {c.parentalNotificationConsidered && (
                    <Stat label="Parental notif." value="Considered (FERPA §99.31)" />
                  )}
                  <Stat
                    label="Opened"
                    value={<span className="text-[10px]">{formatRelativeTime(new Date(c.openedAt))}</span>}
                  />
                  {c.closedAt && (
                    <Stat
                      label="Closed"
                      value={<span className="text-[10px]">{formatRelativeTime(new Date(c.closedAt))}</span>}
                    />
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Sanctions ({sanctions.length})</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {sanctions.length === 0 ? (
                  <p className="p-6 text-center text-xs text-[var(--muted-foreground)]">No sanctions on file.</p>
                ) : (
                  <ul className="divide-y">
                    {sanctions.map((s) => {
                      const prog = s.eduProgramId ? getEduProgram(s.eduProgramId) : undefined;
                      return (
                        <li key={s.id} className="flex items-center justify-between gap-4 px-5 py-3 text-xs">
                          <div className="flex min-w-0 flex-1 items-center gap-3">
                            <Badge variant="outline" className="text-[10px]">{s.kind}</Badge>
                            <div className="min-w-0 flex-1">
                              <div className="text-[12px]">{s.description}</div>
                              <div className="text-[10px] text-[var(--muted-foreground)]">
                                {s.id} · issued {formatRelativeTime(new Date(s.issuedAt))}
                                {s.dueAt && ` · due ${formatRelativeTime(new Date(s.dueAt))}`}
                                {prog && (
                                  <> · <span className="font-mono">{prog.name}</span> ({prog.durationHours}h)</>
                                )}
                              </div>
                            </div>
                          </div>
                          <Badge
                            variant={
                              s.status === 'overdue' ? 'danger'
                              : s.status === 'completed' ? 'success'
                              : s.status === 'active' ? 'info'
                              : 'muted'
                            }
                            className="text-[10px]"
                          >
                            {s.status}
                          </Badge>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </CardContent>
            </Card>

            {parentalNotifs.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Parental notifications (FERPA §99.31)</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ul className="divide-y">
                    {parentalNotifs.map((p) => (
                      <li key={p.id} className="space-y-1 px-5 py-3 text-xs">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px]">{p.trigger}</Badge>
                          <Badge
                            variant={p.decision === 'notified' ? 'info' : p.decision === 'declined' ? 'muted' : 'warning'}
                            className="text-[10px]"
                          >
                            {p.decision}
                          </Badge>
                          <span className="text-[10px] text-[var(--muted-foreground)]">
                            decided {formatRelativeTime(new Date(p.decidedAt))}
                          </span>
                        </div>
                        <div className="text-[10px] font-mono text-[var(--muted-foreground)]">
                          FERPA basis: {p.ferpaBasis}
                        </div>
                        <p className="text-[11px] leading-relaxed">{p.rationale}</p>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </>
  );
}

function Stat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)]">{label}</div>
      <div className="mt-0.5">{value}</div>
    </div>
  );
}
