/**
 * /eoc/activations/:id — the activation detail page.
 *
 * Tabs: COP · Situation Log · Decision Log · After-Action Report · Copilot.
 */
import { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Send, FileDown } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ClassificationBadge } from '@/components/data-display/classification-badge';
import { CommonOperatingPicture } from '@/components/eoc/common-operating-picture';
import { SituationLog } from '@/components/eoc/situation-log';
import { DecisionLog } from '@/components/eoc/decision-log';
import {
  getEOCActivation, sitLogForActivation, decisionLogForActivation,
  campaignsForActivation, runbookExecutionsForActivation, getRunbook,
  bmsAlarmsCritical,
} from '@/lib/mock-db';
import { useRole } from '@/lib/role-context';
import { eocCopilot, draftAAR, type AICitation, type AIAAR } from '@/lib/ai/mock-ai';
import { cn } from '@/lib/utils';
import NotFoundPage from './not-found';

interface CopilotMessage {
  role: 'user' | 'assistant';
  text: string;
  citations?: AICitation[];
}

export default function EOCDetailPage() {
  const { id = '' } = useParams<{ id: string }>();
  const activation = getEOCActivation(id);
  const { role } = useRole();
  const [tab, setTab] = useState('cop');
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<CopilotMessage[]>([]);
  const [aar, setAar] = useState<AIAAR | null>(null);

  if (!activation) return <NotFoundPage />;

  const sitLog = useMemo(() => sitLogForActivation(activation.id), [activation.id]);
  const decisions = useMemo(() => decisionLogForActivation(activation.id), [activation.id]);
  const campaigns = useMemo(() => campaignsForActivation(activation.id), [activation.id]);
  const executions = useMemo(() => runbookExecutionsForActivation(activation.id), [activation.id]);
  const runbookExec = executions[0];
  const runbook = runbookExec ? getRunbook(runbookExec.runbookId) : undefined;
  const criticalAlarms = useMemo(() => bmsAlarmsCritical(), []);

  function handleSendPrompt() {
    if (!prompt.trim() || !activation) return;
    const reply = eocCopilot(activation.id, prompt, role);
    setMessages((m) => [
      ...m,
      { role: 'user', text: prompt },
      { role: 'assistant', text: reply.reply, citations: reply.citations },
    ]);
    setPrompt('');
  }

  function handleDraftAAR() {
    if (!activation) return;
    setAar(draftAAR(activation.id));
  }

  return (
    <>
      <PageHeader
        eyebrow="EOC · Activation"
        title={activation.name}
        description={`${activation.id} · ${activation.kind} · ${activation.level} activation. ${activation.status === 'active' ? 'Active now.' : 'Closed.'}`}
      />

      <div className="space-y-6 px-8 py-6">
        <Card>
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="flex items-center gap-3">
              <ClassificationBadge classification={activation.classification} />
              {activation.threadTag && <Badge variant="accent">Thread {activation.threadTag}</Badge>}
              <Badge variant="muted">{activation.kind}</Badge>
            </div>
            {activation.triggeredByAlertId && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-[var(--muted-foreground)]">Triggered by:</span>
                <Link to="/eoc" className="font-mono text-[var(--hub-700)] hover:underline">
                  {activation.triggeredByAlertId}
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="cop">Common Operating Picture</TabsTrigger>
            <TabsTrigger value="situation">Situation Log ({sitLog.length})</TabsTrigger>
            <TabsTrigger value="decisions">Decision Log ({decisions.length})</TabsTrigger>
            <TabsTrigger value="aar">After-Action Report</TabsTrigger>
            <TabsTrigger value="copilot">Copilot</TabsTrigger>
          </TabsList>

          <TabsContent value="cop">
            <CommonOperatingPicture
              activation={activation}
              runbook={runbook}
              runbookExecution={runbookExec}
              campaigns={campaigns}
              criticalAlarms={criticalAlarms}
            />
          </TabsContent>

          <TabsContent value="situation">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Situation log</CardTitle>
              </CardHeader>
              <CardContent>
                <SituationLog entries={sitLog} activationOpenedAt={activation.openedAt} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="decisions">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Decision log</CardTitle>
              </CardHeader>
              <CardContent>
                <DecisionLog entries={decisions} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="aar">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 pb-3">
                <CardTitle>After-Action Report draft</CardTitle>
                <Button onClick={handleDraftAAR} size="sm" variant="default">
                  <FileDown className="h-3.5 w-3.5" />
                  <span className="ml-1">Draft AAR</span>
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {!aar ? (
                  <p className="rounded-md border bg-[var(--graphite-50)] p-4 text-xs text-[var(--muted-foreground)]">
                    Click <strong>Draft AAR</strong> to generate the After-Action Report from the live activation timeline, decisions, and campaigns.
                  </p>
                ) : (
                  <>
                    <p className="text-sm leading-relaxed">{aar.headline}</p>
                    {aar.sections.map((s, i) => (
                      <div key={i} className="space-y-1.5">
                        <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                          {s.heading}
                        </div>
                        <ul className="list-disc space-y-1 pl-5 text-[12px] leading-relaxed">
                          {s.bullets.map((b, j) => <li key={j}>{b}</li>)}
                        </ul>
                      </div>
                    ))}
                    {aar.lessonsLearned.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                          Lessons learned
                        </div>
                        <ul className="space-y-2">
                          {aar.lessonsLearned.map((l, i) => (
                            <li key={i} className="rounded-md border bg-[var(--card)] p-3 text-xs">
                              <div className="font-medium">{l.observation}</div>
                              <div className="mt-1 text-[var(--muted-foreground)]">
                                <strong>Recommendation:</strong> {l.recommendation}
                              </div>
                              <Badge variant="muted" className="mt-1 text-[10px]">owner: {l.ownerRole}</Badge>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="text-[10px] text-[var(--muted-foreground)]">
                      Model: {aar.model.name} {aar.model.version} · {aar.model.promptTokens} in / {aar.model.completionTokens} out tokens
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="copilot">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>EOC Copilot</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-[11px] text-[var(--muted-foreground)]">
                  Try: <em>"sitrep"</em> · <em>"what's happening with the WW4 generator"</em> · <em>"campaign delivery summary"</em>
                </div>
                <div className="space-y-2">
                  {messages.length === 0 && (
                    <p className="rounded-md border bg-[var(--graphite-50)] p-3 text-[11px] text-[var(--muted-foreground)]">
                      Ask the copilot about the current state of this activation. Replies cite the datasets the answer drew from.
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
                          {m.citations.map((c, ci) =>
                            c.linkedRoute ? (
                              <Link
                                key={ci}
                                to={c.linkedRoute}
                                className="inline-flex items-center rounded-md border px-1.5 py-0.5 font-mono text-[10px] hover:bg-[var(--graphite-50)]"
                              >
                                {c.label}
                              </Link>
                            ) : (
                              <Badge key={ci} variant="outline" className="text-[10px]">{c.label}</Badge>
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
                    placeholder="Ask the EOC copilot…"
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
