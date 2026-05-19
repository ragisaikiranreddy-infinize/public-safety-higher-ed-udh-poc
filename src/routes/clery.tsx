/**
 * /clery — Clery compliance home.
 *
 * Year selector → ASR workbench card · Timely Warning ledger · CSA register ·
 * Geography certification · Compliance copilot.
 */
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Send, FileWarning, MapPin, BookOpen, Megaphone } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  asrCompleteness, asrRowsForYear, asrRowsAwaitingReview,
  timelyWarningCounts, TIMELY_WARNINGS,
  CSA_REPORTS, csaReportsAsrIncluded,
  THREAD_C_CLERY_POLYGON_SET,
} from '@/lib/mock-db';
import { useRole } from '@/lib/role-context';
import { cleryCopilot, type AICitation } from '@/lib/ai/mock-ai';
import { formatRelativeTime, cn } from '@/lib/utils';

interface CopilotMessage {
  role: 'user' | 'assistant';
  text: string;
  citations?: AICitation[];
}

const YEARS = [2025, 2024];

export default function CleryPage() {
  const [year, setYear] = useState<number>(2025);
  const { role } = useRole();
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<CopilotMessage[]>([]);

  const completeness = useMemo(() => asrCompleteness(year), [year]);
  const rows = useMemo(() => asrRowsForYear(year), [year]);
  const awaiting = useMemo(() => asrRowsAwaitingReview(year), [year]);
  const totalCount = rows.reduce((s, r) => s + r.count, 0);
  const tw = useMemo(() => timelyWarningCounts(), []);
  const csaIncluded = csaReportsAsrIncluded().length;

  function handleSendPrompt() {
    if (!prompt.trim()) return;
    const reply = cleryCopilot(prompt, role);
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
        eyebrow="Compliance · Clery"
        title="Clery compliance"
        description="Annual Security Report workspace, geography certification, Timely Warning ledger, CSA register, NIBRS submissions, and FOIA / public-records redaction. The Thread C demo lives here — every ASR cell traces back to Bronze CAD events."
      />

      <div className="space-y-6 px-8 py-6">
        {/* Year selector */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
            Reporting year
          </span>
          {YEARS.map((y) => (
            <button
              key={y}
              onClick={() => setYear(y)}
              className={cn(
                'rounded-md border px-3 py-1.5 text-xs font-semibold transition-colors',
                year === y
                  ? 'border-[var(--hub-500)] bg-[var(--hub-50)] text-[var(--hub-700)]'
                  : 'text-[var(--muted-foreground)] hover:bg-[var(--graphite-50)]',
              )}
            >
              {y}
            </button>
          ))}
        </div>

        {/* KPI strip */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <KpiCard label="ASR completeness" value={`${Math.round(completeness.pct * 100)}%`} hint={`${completeness.reviewed} / ${completeness.total} cells reviewed`} />
          <KpiCard label="ASR cell total" value={`${totalCount}`} hint="across all crime × geography cells" />
          <KpiCard label="Timely Warnings" value={`${tw.issued} issued`} hint={`${tw.declined} declined · ${tw.pending} pending · avg ${tw.avgMinutesToIssue ?? '—'} min to issue`} />
          <KpiCard label="CSA disclosures" value={`${CSA_REPORTS.length}`} hint={`${csaIncluded} ASR-included`} />
        </div>

        {/* ASR workbench card */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Link to={`/clery/asr/${year}`}>
            <Card className="transition-colors hover:bg-[var(--graphite-50)]">
              <CardContent className="space-y-3 p-5">
                <div className="flex items-center gap-2">
                  <FileWarning className="h-4 w-4 text-[var(--hub-700)]" />
                  <span className="font-display text-base font-semibold">ASR workbench — {year}</span>
                </div>
                <p className="text-xs text-[var(--muted-foreground)]">
                  20 crime × 4 geography = 80 cells. Click a cell to drill into source incidents and the lineage trace to Bronze.
                </p>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <Stat label="reviewed" value={`${completeness.reviewed}`} />
                  <Stat label="awaiting" value={`${awaiting.length}`} tone={awaiting.length > 0 ? 'warn' : 'good'} />
                  <Stat label="total cells" value={`${completeness.total}`} />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/clery/geography">
            <Card className="transition-colors hover:bg-[var(--graphite-50)]">
              <CardContent className="space-y-3 p-5">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[var(--hub-700)]" />
                  <span className="font-display text-base font-semibold">Geography — {THREAD_C_CLERY_POLYGON_SET.reportingYear}</span>
                </div>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {THREAD_C_CLERY_POLYGON_SET.polygons.length} polygons certified ·{' '}
                  {THREAD_C_CLERY_POLYGON_SET.audit.length} audit entries
                </p>
                <Badge variant="success" className="text-[10px]">
                  certified {formatRelativeTime(new Date(THREAD_C_CLERY_POLYGON_SET.certifiedAt!))}
                </Badge>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Timely Warnings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Megaphone className="h-4 w-4" />
              Timely Warning ledger
            </CardTitle>
            <div className="text-[10px] text-[var(--muted-foreground)]">
              avg time-to-issue: <span className="font-mono">{tw.avgMinutesToIssue ?? '—'} min</span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="border-b bg-[var(--graphite-50)]">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Warning</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Decision</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">VAWA</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Time-to-issue</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">When</th>
                  </tr>
                </thead>
                <tbody>
                  {TIMELY_WARNINGS.map((w) => (
                    <tr key={w.id} className="border-b last:border-0 hover:bg-[var(--graphite-50)]">
                      <td className="px-4 py-2">
                        <span className="font-mono text-[10px]">{w.id}</span>
                        {w.threadTag && <Badge variant="accent" className="ml-1.5 text-[9px]">Thread {w.threadTag}</Badge>}
                      </td>
                      <td className="px-4 py-2">
                        <Badge variant={w.decision === 'issued' ? 'success' : w.decision === 'declined' ? 'muted' : 'warning'} className="text-[10px]">
                          {w.decision}
                        </Badge>
                      </td>
                      <td className="px-4 py-2 text-[10px]">{w.vawaEligible ? 'yes' : 'no'}</td>
                      <td className="px-4 py-2 font-mono text-[10px]">{w.minutesToIssue ? `${w.minutesToIssue}m` : '—'}</td>
                      <td className="px-4 py-2 text-[10px] text-[var(--muted-foreground)]">{formatRelativeTime(new Date(w.decidedAt))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Copilot */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <BookOpen className="h-4 w-4" />
              Clery copilot
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-[11px] text-[var(--muted-foreground)]">
              Try: <em>"ASR completeness"</em> · <em>"geography certification"</em> · <em>"timely warning ledger"</em>
            </div>
            <div className="space-y-2">
              {messages.length === 0 && (
                <p className="rounded-md border bg-[var(--graphite-50)] p-3 text-[11px] text-[var(--muted-foreground)]">
                  Ask the copilot about ASR, geography, or Timely Warnings.
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
                placeholder="Ask the Clery copilot…"
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
      </div>
    </>
  );
}

function KpiCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)]">{label}</div>
        <div className="mt-1 font-display text-3xl font-semibold tabular-nums">{value}</div>
        <div className="mt-1 text-[10px] text-[var(--muted-foreground)]">{hint}</div>
      </CardContent>
    </Card>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: 'good' | 'warn' }) {
  return (
    <div className={cn(
      'rounded-md border bg-[var(--card)] p-2 text-center',
      tone === 'warn' && 'border-[var(--signal-amber)]/40 bg-[var(--signal-amber-soft)]/30',
    )}>
      <div className="font-mono text-base font-semibold">{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)]">{label}</div>
    </div>
  );
}
