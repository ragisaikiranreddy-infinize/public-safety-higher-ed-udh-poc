/**
 * /title-ix/:id — Title IX case detail (walled).
 *
 * Non-Title-IX-Coordinator roles see only the barrier-hit panel with the
 * override path. Title IX Coordinator sees headline + narrative + parties +
 * supportive measures.
 */
import { Link, useParams } from 'react-router-dom';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarrierIndicator } from '@/components/data-display/barrier-indicator';
import { getTitleIXCase, getPerson } from '@/lib/mock-db';
import { useRole } from '@/lib/role-context';
import { evaluateBarrier } from '@/lib/information-barriers';
import { formatRelativeTime } from '@/lib/utils';
import NotFoundPage from './not-found';

export default function TitleIXDetailPage() {
  const { id = '' } = useParams<{ id: string }>();
  const c = getTitleIXCase(id);
  const { role } = useRole();

  if (!c) return <NotFoundPage />;

  const barrier = evaluateBarrier({
    actorRole: role,
    fieldClassification: c.classification,
    resourceKind: 'tix-case',
    resourceId: c.id,
  });

  return (
    <>
      <PageHeader
        eyebrow="Title IX · Walled"
        title={c.id}
        description={`Phase: ${c.phase} · Opened ${formatRelativeTime(new Date(c.openedAt))}`}
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
              <p className="text-[11px] text-[var(--muted-foreground)]">
                Switch to the <strong>Title IX Coordinator</strong> role to see this case.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardContent className="space-y-4 p-5">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                  Headline
                </div>
                <p className="text-sm font-medium">{c.headline}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="space-y-3 p-5">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                  Narrative
                </div>
                <p className="whitespace-pre-line text-xs leading-relaxed">{c.narrative}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="space-y-3 p-5">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                  Parties
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <div className="text-[10px] text-[var(--muted-foreground)]">Complainant</div>
                    <Link to={`/persons/${encodeURIComponent(c.complainantPersonId)}`} className="font-mono text-[var(--hub-700)] hover:underline">
                      {getPerson(c.complainantPersonId)?.fullName ?? c.complainantPersonId}
                    </Link>
                  </div>
                  <div>
                    <div className="text-[10px] text-[var(--muted-foreground)]">Respondent</div>
                    <Link to={`/persons/${encodeURIComponent(c.respondentPersonId)}`} className="font-mono text-[var(--hub-700)] hover:underline">
                      {getPerson(c.respondentPersonId)?.fullName ?? c.respondentPersonId}
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="space-y-3 p-5">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                  Supportive measures
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {c.supportiveMeasures.length === 0 ? (
                    <span className="text-xs text-[var(--muted-foreground)]">None on file.</span>
                  ) : (
                    c.supportiveMeasures.map((m) => (
                      <Badge key={m} variant="muted" className="text-[10px]">{m}</Badge>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </>
  );
}
