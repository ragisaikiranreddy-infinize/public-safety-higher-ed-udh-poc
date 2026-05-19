/**
 * /conduct/amnesty — Medical Amnesty + FERPA §99.31 dashboard.
 *
 * Shows amnesty-invoked counts, the most recent amnesty case (run the assist
 * against), and the FERPA decision aid surface.
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AmnestyPanel } from '@/components/conduct/amnesty-panel';
import { ParentalNotifDecisionAid } from '@/components/conduct/parental-notif-decision-aid';
import {
  CONDUCT_CASES, PARENTAL_NOTIFICATIONS,
} from '@/lib/mock-db';
import { amnestyAssist, ferpaDecisionAid, type AIAmnestyAssessment, type AIFerpaDecisionAid } from '@/lib/ai/mock-ai';
import { formatRelativeTime } from '@/lib/utils';

export default function ConductAmnestyPage() {
  const [assessment, setAssessment] = useState<AIAmnestyAssessment | null>(null);
  const [aid, setAid] = useState<AIFerpaDecisionAid | null>(null);

  const amnestyCases = CONDUCT_CASES.filter((c) => c.medicalAmnestyInvoked);
  const ferpaConsidered = CONDUCT_CASES.filter((c) => c.parentalNotificationConsidered);

  const focusCase = CONDUCT_CASES.find(
    (c) => c.subtype === 'substance' && c.status !== 'closed-amnesty',
  ) ?? CONDUCT_CASES[0];

  return (
    <>
      <PageHeader
        eyebrow="Conduct · Module 5A · Amnesty & FERPA"
        title="Medical Amnesty + FERPA §99.31 dashboard"
        description={`${amnestyCases.length} cases with Medical Amnesty invoked · ${ferpaConsidered.length} cases where FERPA §99.31 parental notification was considered · ${PARENTAL_NOTIFICATIONS.length} entries in the parental-notification audit log.`}
      />

      <div className="space-y-6 px-8 py-6">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm">Medical Amnesty assistant</CardTitle>
              <Button onClick={() => setAssessment(amnestyAssist(focusCase.id))} size="sm" variant="default">
                Run on {focusCase.id}
              </Button>
            </CardHeader>
            <CardContent>
              {!assessment ? (
                <p className="rounded-md border bg-[var(--graphite-50)] p-4 text-xs text-[var(--muted-foreground)]">
                  Click <strong>Run</strong> to assess a candidate case against the 3-criterion Medical Amnesty test.
                </p>
              ) : (
                <AmnestyPanel assessment={assessment} />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm">FERPA §99.31 decision aid</CardTitle>
              <Button onClick={() => setAid(ferpaDecisionAid(focusCase.id))} size="sm" variant="default">
                Run on {focusCase.id}
              </Button>
            </CardHeader>
            <CardContent>
              {!aid ? (
                <p className="rounded-md border bg-[var(--graphite-50)] p-4 text-xs text-[var(--muted-foreground)]">
                  Click <strong>Run</strong> to evaluate §99.31(a)(15) and §99.31(a)(10) for the same case.
                </p>
              ) : (
                <ParentalNotifDecisionAid aid={aid} />
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Parental-notification audit log ({PARENTAL_NOTIFICATIONS.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="border-b bg-[var(--graphite-50)]">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Entry</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Trigger</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">FERPA basis</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Decision</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">When</th>
                  </tr>
                </thead>
                <tbody>
                  {PARENTAL_NOTIFICATIONS.map((p) => (
                    <tr key={p.id} className="border-b last:border-0 hover:bg-[var(--graphite-50)]">
                      <td className="px-4 py-2 font-mono text-[10px]">
                        {p.conductCaseId ? (
                          <Link to={`/conduct/${encodeURIComponent(p.conductCaseId)}`} className="text-[var(--hub-700)] hover:underline">
                            {p.id}
                          </Link>
                        ) : (
                          p.id
                        )}
                      </td>
                      <td className="px-4 py-2"><Badge variant="outline" className="text-[10px]">{p.trigger}</Badge></td>
                      <td className="px-4 py-2 font-mono text-[10px]">{p.ferpaBasis}</td>
                      <td className="px-4 py-2">
                        <Badge variant={p.decision === 'notified' ? 'info' : p.decision === 'declined' ? 'muted' : 'warning'} className="text-[10px]">
                          {p.decision}
                        </Badge>
                      </td>
                      <td className="px-4 py-2 text-[10px] text-[var(--muted-foreground)]">{formatRelativeTime(new Date(p.decidedAt))}</td>
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
