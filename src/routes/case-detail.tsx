/**
 * /cases/:id — investigative case detail.
 *
 * Renders case header, status, classification, primary detective, charges,
 * and links to all related incidents (each resolved via getIncident).
 */
import { Link, useParams } from 'react-router-dom';
import { ClipboardList, Briefcase, Siren } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ClassificationBadge } from '@/components/data-display/classification-badge';
import { PriorityChip } from '@/components/data-display/priority-chip';
import { getCase, getIncident, getOfficer } from '@/lib/mock-db';
import { formatRelativeTime } from '@/lib/utils';
import type { Case } from '@/lib/types';
import NotFoundPage from './not-found';

const STATUS_TONE: Record<Case['status'], 'success' | 'warning' | 'muted' | 'danger' | 'info'> = {
  open: 'warning',
  pending: 'info',
  closed: 'muted',
  unfounded: 'danger',
  inactive: 'muted',
};

export default function CaseDetailPage() {
  const { id = '' } = useParams<{ id: string }>();
  const c = getCase(id);
  if (!c) return <NotFoundPage />;

  const det = c.primaryDetectiveOfficerId ? getOfficer(c.primaryDetectiveOfficerId) : null;
  const incidents = c.relatedIncidentIds
    .map((iid) => getIncident(iid))
    .filter((i): i is NonNullable<typeof i> => Boolean(i));

  return (
    <>
      <PageHeader
        eyebrow="Incidents · Case"
        title={c.id}
        description={`RMS ${c.rmsCaseNumber} · ${c.relatedIncidentIds.length} related incident(s)`}
      />

      <div className="space-y-6 px-8 py-6">
        <Card>
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="flex items-center gap-3">
              <ClipboardList className="h-4 w-4 text-[var(--hub-700)]" />
              <Badge variant={STATUS_TONE[c.status]} className="text-[10px]">{c.status}</Badge>
              <ClassificationBadge classification={c.classification} />
            </div>
            <div className="text-[10px] text-[var(--muted-foreground)]">
              RMS <span className="font-mono">{c.rmsCaseNumber}</span>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Primary detective</CardTitle>
            </CardHeader>
            <CardContent>
              {det ? (
                <Link to={`/officers/${encodeURIComponent(det.id)}`} className="flex items-center gap-3 rounded-md border bg-[var(--card)] p-3 hover:bg-[var(--graphite-50)]">
                  <Briefcase className="h-4 w-4 text-[var(--hub-700)]" />
                  <div>
                    <div className="font-mono text-[11px]">{det.id}</div>
                    <div className="text-xs font-medium">{det.fullName}</div>
                    <div className="text-[10px] text-[var(--muted-foreground)]">{det.rank}</div>
                  </div>
                </Link>
              ) : (
                <div className="rounded-md border border-dashed p-3 text-center text-[11px] text-[var(--muted-foreground)]">
                  No detective assigned.
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Charges</CardTitle>
            </CardHeader>
            <CardContent>
              {c.charges.length === 0 ? (
                <div className="rounded-md border border-dashed p-3 text-center text-[11px] text-[var(--muted-foreground)]">
                  No charges filed.
                </div>
              ) : (
                <ul className="space-y-1.5">
                  {c.charges.map((ch, i) => (
                    <li key={i} className="rounded-md border bg-[var(--card)] p-2 text-xs">
                      {ch}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Related incidents ({incidents.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {incidents.length === 0 ? (
              <div className="rounded-md border border-dashed p-3 text-center text-[11px] text-[var(--muted-foreground)]">
                No incidents linked.
              </div>
            ) : (
              <ul className="space-y-2">
                {incidents.map((inc) => (
                  <li key={inc.id}>
                    <Link to={`/incidents/${encodeURIComponent(inc.id)}`}>
                      <Card className="transition-colors hover:bg-[var(--graphite-50)]">
                        <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                          <div className="flex items-center gap-3">
                            <Siren className="h-4 w-4 text-[var(--hub-700)]" />
                            <span className="font-mono text-xs">{inc.id}</span>
                            <Badge variant="muted" className="text-[10px]">{inc.callType}</Badge>
                            <PriorityChip priority={inc.priority} />
                            <Badge variant="outline" className="text-[10px]">{inc.status}</Badge>
                          </div>
                          <span className="text-[11px] text-[var(--muted-foreground)]">
                            received {formatRelativeTime(new Date(inc.receivedAt))}
                          </span>
                        </CardContent>
                      </Card>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
