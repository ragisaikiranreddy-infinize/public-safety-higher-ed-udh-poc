/**
 * /conduct — Student Conduct case board + outstanding sanctions.
 *
 * Filters: subtype (substance / residential / etc.) · status quick-toggles.
 */
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Send } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CaseBoard } from '@/components/conduct/case-board';
import { SanctionTracker } from '@/components/conduct/sanction-tracker';
import {
  CONDUCT_CASES, SANCTIONS, openConductCasesCount, sanctionsDueCount,
} from '@/lib/mock-db';
import { useRole } from '@/lib/role-context';
import { conductCopilot, type AICitation } from '@/lib/ai/mock-ai';
import type { ConductSubtype } from '@/lib/types';
import { cn } from '@/lib/utils';

const SUBTYPES: { id: ConductSubtype; label: string }[] = [
  { id: 'substance', label: 'Substance' },
  { id: 'residential', label: 'Residential' },
  { id: 'academic-integrity', label: 'Academic integrity' },
  { id: 'sexual-misconduct', label: 'Sexual misconduct' },
  { id: 'physical-altercation', label: 'Physical altercation' },
  { id: 'bias-incident', label: 'Bias incident' },
  { id: 'organizational', label: 'Organizational' },
  { id: 'other', label: 'Other' },
];

interface CopilotMessage {
  role: 'user' | 'assistant';
  text: string;
  citations?: AICitation[];
}

export default function ConductPage() {
  const [subtypeFilter, setSubtypeFilter] = useState<'all' | ConductSubtype>('all');
  const [filter, setFilter] = useState('');
  const { role } = useRole();
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<CopilotMessage[]>([]);

  const filtered = useMemo(() => {
    let pool = CONDUCT_CASES;
    if (subtypeFilter !== 'all') pool = pool.filter((c) => c.subtype === subtypeFilter);
    const q = filter.trim().toLowerCase();
    if (!q) return pool;
    return pool.filter(
      (c) =>
        c.id.toLowerCase().includes(q) ||
        c.summary.toLowerCase().includes(q) ||
        (c.buildingId ?? '').toLowerCase().includes(q),
    );
  }, [filter, subtypeFilter]);

  const caseSummaries = useMemo(() => {
    const m = new Map<string, string>();
    CONDUCT_CASES.forEach((c) => m.set(c.id, c.summary));
    return m;
  }, []);

  const subtypeCounts = useMemo(() => {
    const m: Record<string, number> = {};
    SUBTYPES.forEach((s) => { m[s.id] = CONDUCT_CASES.filter((c) => c.subtype === s.id).length; });
    return m;
  }, []);

  function handleSendPrompt() {
    if (!prompt.trim()) return;
    const reply = conductCopilot(prompt, role);
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
        eyebrow="Conduct · Student Conduct"
        title="Conduct case board"
        description={`${CONDUCT_CASES.length} cases across 8 subtypes · ${openConductCasesCount()} open · ${sanctionsDueCount()} sanctions pending / overdue. Click any subtype to filter; click a card to open the case detail.`}
      />

      <div className="space-y-6 px-8 py-6">
        {/* Subtype filter strip */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSubtypeFilter('all')}
            className={cn(
              'rounded-md border px-3 py-1.5 text-xs font-semibold transition-colors',
              subtypeFilter === 'all'
                ? 'border-[var(--hub-500)] bg-[var(--hub-50)] text-[var(--hub-700)]'
                : 'text-[var(--muted-foreground)] hover:bg-[var(--graphite-50)]',
            )}
          >
            All ({CONDUCT_CASES.length})
          </button>
          {SUBTYPES.map((s) => (
            <button
              key={s.id}
              onClick={() => setSubtypeFilter(s.id)}
              className={cn(
                'rounded-md border px-3 py-1.5 text-xs font-semibold transition-colors',
                subtypeFilter === s.id
                  ? 'border-[var(--hub-500)] bg-[var(--hub-50)] text-[var(--hub-700)]'
                  : 'text-[var(--muted-foreground)] hover:bg-[var(--graphite-50)]',
              )}
            >
              {s.label} ({subtypeCounts[s.id] ?? 0})
            </button>
          ))}
        </div>

        <Input
          type="search"
          placeholder="Search by id, summary, building…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />

        <CaseBoard cases={filtered} />

        {/* Outstanding sanctions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Outstanding sanctions ({SANCTIONS.filter((s) => s.status === 'pending' || s.status === 'active' || s.status === 'overdue').length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <SanctionTracker sanctions={SANCTIONS} caseSummaries={caseSummaries} />
          </CardContent>
        </Card>

        {/* Conduct copilot */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Conduct copilot</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-[11px] text-[var(--muted-foreground)]">
              Try: <em>"medical amnesty"</em> · <em>"ferpa §99.31 parental"</em> · <em>"stop campus hazing"</em> · <em>"sanctions due"</em>
            </div>
            <div className="space-y-2">
              {messages.length === 0 && (
                <p className="rounded-md border bg-[var(--graphite-50)] p-3 text-[11px] text-[var(--muted-foreground)]">
                  Ask the copilot about a Module 5B decision flow.
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
                placeholder="Ask the conduct copilot…"
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
