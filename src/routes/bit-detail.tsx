/**
 * /bit/:id — BIT case detail.
 *
 * Tabs:
 *   Briefing      — the AI briefing component (canonical Thread A bullet list)
 *   Evidence      — contributors feed (every signal attached)
 *   Plan          — support-plan actions w/ status
 *   Copilot       — conversational follow-up (Thread A canned)
 */
import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { BarrierIndicator } from '@/components/data-display/barrier-indicator';
import { ClassificationBadge } from '@/components/data-display/classification-badge';
import { BriefingCard } from '@/components/bit/briefing-card';
import { ContributorsFeed } from '@/components/bit/contributors-feed';
import {
  getBITCase, bitEvidenceForCase, bitPlanActionsForCase, getPerson,
} from '@/lib/mock-db';
import { useRole } from '@/lib/role-context';
import { evaluateBarrier } from '@/lib/information-barriers';
import { summarizeBITSubject, bitCopilot, type AICitation } from '@/lib/ai/mock-ai';
import { formatRelativeTime, cn } from '@/lib/utils';
import { Send } from 'lucide-react';
import NotFoundPage from './not-found';

interface CopilotMessage {
  role: 'user' | 'assistant';
  text: string;
  citations?: AICitation[];
}

export default function BITDetailPage() {
  const { id = '' } = useParams<{ id: string }>();
  const c = getBITCase(id);
  const { role } = useRole();
  const [tab, setTab] = useState('briefing');
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<CopilotMessage[]>([]);

  if (!c) return <NotFoundPage />;

  // Barrier check on the case itself
  const barrier = evaluateBarrier({
    actorRole: role,
    fieldClassification: c.classification,
    resourceKind: 'bit-case',
    resourceId: c.id,
  });

  const subject = getPerson(c.subjectPersonId);
  const evidence = useMemo(() => bitEvidenceForCase(c.id), [c.id]);
  const plan = useMemo(() => bitPlanActionsForCase(c.id), [c.id]);
  const briefing = useMemo(
    () => summarizeBITSubject(c.subjectPersonId, role),
    [c.subjectPersonId, role],
  );

  if (!barrier.allowed) {
    return (
      <>
        <PageHeader
          eyebrow="Threat Intel · CARE / BIT"
          title={c.id}
          description="Case content is withheld for the active role."
        />
        <div className="px-8 py-6">
          <Card className="border-[var(--barrier)]">
            <CardContent className="space-y-3 p-6 text-center">
              <BarrierIndicator barrierId={barrier.barrierHit?.id} size="md" />
              <p className="text-sm">{barrier.barrierHit?.description}</p>
              <p className="text-[11px] text-[var(--muted-foreground)]">
                <strong>Override path:</strong> {barrier.barrierHit?.overridePath}
              </p>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  function handleSendPrompt() {
    if (!prompt.trim() || !c) return;
    const reply = bitCopilot(c.id, prompt, role);
    setMessages((m) => [
      ...m,
      { role: 'user', text: prompt },
      { role: 'assistant', text: reply.reply, citations: reply.citations },
    ]);
    setPrompt('');
  }

  return (
    <>
      <PageHeader
        eyebrow="Threat Intel · CARE / BIT"
        title={c.id}
        description={`Subject: ${subject?.fullName ?? c.subjectPersonId} · Opened ${formatRelativeTime(new Date(c.openedAt))} · Next review ${formatRelativeTime(new Date(c.nextReviewDueAt))}`}
      />

      <div className="space-y-6 px-8 py-6">
        {/* Header banner — status + subject CTA */}
        <Card>
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="flex items-center gap-3">
              <ClassificationBadge classification={c.classification} />
              <Badge variant="muted">{c.status}</Badge>
              {c.threadTag && <Badge variant="accent">Thread {c.threadTag}</Badge>}
              {c.imminentThreatFinding && <Badge variant="danger">imminent-threat finding</Badge>}
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[var(--muted-foreground)]">Subject:</span>
              <Link
                to={`/persons/${encodeURIComponent(c.subjectPersonId)}`}
                className="font-mono text-[var(--hub-700)] hover:underline"
              >
                {subject?.fullName ?? c.subjectPersonId}
              </Link>
            </div>
          </CardContent>
        </Card>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="briefing">AI Briefing</TabsTrigger>
            <TabsTrigger value="evidence">Evidence ({evidence.length})</TabsTrigger>
            <TabsTrigger value="plan">Support Plan ({plan.length})</TabsTrigger>
            <TabsTrigger value="copilot">Copilot</TabsTrigger>
          </TabsList>

          <TabsContent value="briefing">
            <BriefingCard briefing={briefing} nabita={c.nabita} />
          </TabsContent>

          <TabsContent value="evidence">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Contributors ({evidence.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <ContributorsFeed evidence={evidence} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="plan">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Support Plan ({plan.length})</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {plan.length === 0 ? (
                  <p className="p-6 text-center text-xs text-[var(--muted-foreground)]">
                    No support-plan actions yet for this case.
                  </p>
                ) : (
                  <ul className="divide-y">
                    {plan.map((a) => (
                      <li key={a.id} className="flex items-center justify-between gap-4 px-5 py-3 text-xs">
                        <div className="flex min-w-0 flex-1 items-center gap-3">
                          <Badge variant="outline" className="text-[10px]">{a.kind}</Badge>
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-[12px]">{a.notes}</div>
                            <div className="text-[10px] text-[var(--muted-foreground)]">
                              Owner role: <span className="font-mono">{a.ownerRole}</span> · Due {formatRelativeTime(new Date(a.dueAt))}
                            </div>
                          </div>
                        </div>
                        <Badge
                          variant={
                            a.status === 'overdue' ? 'danger'
                            : a.status === 'completed' ? 'success'
                            : a.status === 'in-progress' ? 'info'
                            : 'muted'
                          }
                          className="text-[10px]"
                        >
                          {a.status}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="copilot">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>BIT Copilot</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-[11px] text-[var(--muted-foreground)]">
                  Try: <em>"what should we do next"</em> · <em>"show me the swipe timeline"</em> · <em>"what's the NaBITA risk trend"</em>
                </div>
                <div className="space-y-2">
                  {messages.length === 0 && (
                    <p className="rounded-md border bg-[var(--graphite-50)] p-3 text-[11px] text-[var(--muted-foreground)]">
                      Ask a follow-up question about this case. Replies cite the same datasets the briefing pulled from.
                    </p>
                  )}
                  {messages.map((m, i) => (
                    <div
                      key={i}
                      className={cn(
                        'rounded-md border p-3 text-xs',
                        m.role === 'user' ? 'bg-[var(--hub-50)]/30' : 'bg-[var(--card)]',
                      )}
                    >
                      <div className="text-[9px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                        {m.role === 'user' ? 'You' : 'Copilot'}
                      </div>
                      <p className="mt-0.5 leading-relaxed">{m.text}</p>
                      {m.citations && m.citations.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {m.citations.map((ct, ci) =>
                            ct.linkedRoute ? (
                              <Link
                                key={ci}
                                to={ct.linkedRoute}
                                className="inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] hover:bg-[var(--graphite-50)]"
                              >
                                <ClassificationBadge classification={ct.classification} />
                                <span className="ml-1 font-mono">{ct.label}</span>
                              </Link>
                            ) : (
                              <Badge key={ci} variant="outline" className="text-[10px]">
                                {ct.label}
                              </Badge>
                            ),
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendPrompt();
                  }}
                  className="flex items-center gap-2"
                >
                  <Input
                    placeholder="Ask the copilot…"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                  />
                  <Button type="submit" variant="default" size="sm">
                    <Send className="h-3.5 w-3.5" />
                    <span className="ml-1">Send</span>
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
