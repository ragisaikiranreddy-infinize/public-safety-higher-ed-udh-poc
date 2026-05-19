/**
 * /organizational — Organizational conduct (Greek + athletics + clubs).
 *
 * Highlights cases marked `hazingActReportable` and `publishedToRoster` per
 * the Stop Campus Hazing Act.
 */
import { useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ORGANIZATIONAL_CONDUCT_CASES, organizationalHazingReportable,
  organizationalPublishedToRoster,
} from '@/lib/mock-db';
import { hazingClassifier, type AIHazingClassification } from '@/lib/ai/mock-ai';
import { formatRelativeTime, cn } from '@/lib/utils';
import { CheckCircle2, XCircle } from 'lucide-react';

export default function OrganizationalPage() {
  const [classification, setClassification] = useState<AIHazingClassification | null>(null);
  const hazing = organizationalHazingReportable();
  const published = organizationalPublishedToRoster();
  const focusCase = ORGANIZATIONAL_CONDUCT_CASES.find((o) => o.hazingActReportable) ?? ORGANIZATIONAL_CONDUCT_CASES[0];

  return (
    <>
      <PageHeader
        eyebrow="Conduct · Organizational"
        title="Organizational conduct"
        description={`${ORGANIZATIONAL_CONDUCT_CASES.length} cases across Greek chapters, athletic teams, and clubs · ${hazing.length} hazing-reportable per Stop Campus Hazing Act · ${published.length} published to roster.`}
      />

      <div className="space-y-6 px-8 py-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm">Stop Campus Hazing classifier</CardTitle>
            <Button onClick={() => setClassification(hazingClassifier(focusCase.id))} size="sm" variant="default">
              Classify {focusCase.id}
            </Button>
          </CardHeader>
          <CardContent>
            {!classification ? (
              <p className="rounded-md border bg-[var(--graphite-50)] p-4 text-xs text-[var(--muted-foreground)]">
                Click <strong>Classify</strong> to run the Stop Campus Hazing Act reportability classifier on a candidate case.
              </p>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant={classification.reportable ? 'danger' : 'muted'} className="text-[10px]">
                    {classification.reportable ? 'reportable' : 'not reportable'}
                  </Badge>
                  <span className="text-[10px] text-[var(--muted-foreground)]">confidence {classification.confidence}%</span>
                </div>
                <p className="text-[12px] leading-relaxed">{classification.rationale}</p>
                <ul className="space-y-2">
                  {classification.elements.map((e, i) => {
                    const Icon = e.met ? CheckCircle2 : XCircle;
                    return (
                      <li key={i} className={cn(
                        'flex gap-3 rounded-md border bg-[var(--card)] p-3 text-xs',
                        e.met ? 'border-[var(--signal-green)]/30' : 'border-[var(--signal-amber)]/30',
                      )}>
                        <Icon className={cn('mt-0.5 h-4 w-4 flex-shrink-0', e.met ? 'text-[var(--signal-green)]' : 'text-[var(--signal-amber)]')} />
                        <div>
                          <div className="font-semibold">{e.name}</div>
                          <p className="mt-0.5 text-[11px] leading-relaxed text-[var(--muted-foreground)]">{e.note}</p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="border-b bg-[var(--graphite-50)]">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Case</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Organization</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Kind</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Status</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Hazing Act</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Members charged</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Opened</th>
                  </tr>
                </thead>
                <tbody>
                  {ORGANIZATIONAL_CONDUCT_CASES.map((o) => (
                    <tr key={o.id} className={cn(
                      'border-b last:border-0 hover:bg-[var(--graphite-50)]',
                      o.publishedToRoster && 'bg-[var(--signal-red-soft)]/20',
                    )}>
                      <td className="px-4 py-2 font-mono text-[10px]">{o.id}</td>
                      <td className="px-4 py-2 text-[11px]">{o.organizationName}</td>
                      <td className="px-4 py-2"><Badge variant="outline" className="text-[9px]">{o.organizationKind}</Badge></td>
                      <td className="px-4 py-2"><Badge variant={o.status === 'derecognized' ? 'danger' : 'muted'} className="text-[10px]">{o.status}</Badge></td>
                      <td className="px-4 py-2">
                        {o.hazingActReportable && <Badge variant="warning" className="text-[10px]">reportable</Badge>}
                        {o.publishedToRoster && <Badge variant="danger" className="ml-1 text-[10px]">published</Badge>}
                      </td>
                      <td className="px-4 py-2 font-mono text-[10px]">{o.individualMemberChargedCount}</td>
                      <td className="px-4 py-2 text-[10px] text-[var(--muted-foreground)]">{formatRelativeTime(new Date(o.openedAt))}</td>
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
