/**
 * /ask — Ask the Hub. NL → SQL grounded answer.
 *
 * The Thread A demo prompts are pinned at the top. Submitting routes
 * through askPlatform() which returns answer + SQL + tabular preview +
 * citations + a streaming-plan log.
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessagesSquare, Send, Sparkles } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ClassificationBadge } from '@/components/data-display/classification-badge';
import { askPlatform, type AIAskResult } from '@/lib/ai/mock-ai';

const SAMPLE_PROMPTS = [
  'After-hours swipes at Carter Hall over the past 60 days',
  'Open incidents right now',
  '2025 ASR completeness',
];

export default function AskPage() {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState<AIAskResult | null>(null);
  const [streamIndex, setStreamIndex] = useState(0);

  useEffect(() => {
    if (!result) return;
    if (streamIndex >= result.streamingPlan.length) return;
    const step = result.streamingPlan[streamIndex];
    const t = window.setTimeout(() => setStreamIndex((i) => i + 1), step.delayMs);
    return () => window.clearTimeout(t);
  }, [result, streamIndex]);

  function runPrompt(text: string) {
    setResult(askPlatform(text));
    setStreamIndex(0);
  }

  return (
    <>
      <PageHeader
        eyebrow="Intelligence · Ask the Hub"
        title="Ask the Hub"
        description="Natural-language Q+A grounded in the medallion catalog. Every answer carries the generated SQL and a citation list back to the source datasets."
      />

      <div className="space-y-6 px-8 py-6">
        <Card>
          <CardContent className="space-y-3 p-5">
            <div className="flex items-center gap-2">
              <MessagesSquare className="h-4 w-4 text-[var(--hub-700)]" />
              <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                Sample prompts
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_PROMPTS.map((p) => (
                <button
                  key={p}
                  onClick={() => { setPrompt(p); runPrompt(p); }}
                  className="rounded-md border bg-[var(--card)] px-3 py-1.5 text-xs hover:bg-[var(--graphite-50)]"
                >
                  {p}
                </button>
              ))}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (prompt.trim()) runPrompt(prompt);
              }}
              className="flex items-center gap-2"
            >
              <Input
                placeholder="Ask anything grounded in the catalog…"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
              <Button type="submit" variant="default" size="sm">
                <Send className="h-3.5 w-3.5" />
                <span className="ml-1">Ask</span>
              </Button>
            </form>
          </CardContent>
        </Card>

        {result && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Sparkles className="h-4 w-4 text-[var(--hub-700)]" />
                Answer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Streaming-plan log */}
              <div className="rounded-md border border-dashed bg-[var(--graphite-50)] p-3 font-mono text-[10px] leading-relaxed text-[var(--muted-foreground)]">
                {result.streamingPlan.slice(0, streamIndex).map((s, i) => (
                  <div key={i}>{s.text}</div>
                ))}
                {streamIndex < result.streamingPlan.length && (
                  <div className="animate-pulse">{result.streamingPlan[streamIndex].text}…</div>
                )}
                {streamIndex >= result.streamingPlan.length && (
                  <div className="text-[var(--signal-green)]">✓ query complete · {result.confidence}% confidence</div>
                )}
              </div>

              <p className="text-sm leading-relaxed">{result.answer}</p>

              <Separator />

              {/* Generated SQL */}
              <div>
                <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                  Generated SQL
                </div>
                <pre className="overflow-x-auto rounded-md border bg-[var(--graphite-50)] p-3 font-mono text-[11px] leading-relaxed">
                  {result.sql}
                </pre>
              </div>

              {/* Result preview */}
              {result.resultPreview.columns.length > 0 && (
                <div>
                  <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                    Result preview
                  </div>
                  <div className="overflow-x-auto rounded-md border">
                    <table className="w-full text-xs">
                      <thead className="border-b bg-[var(--graphite-50)]">
                        <tr>
                          {result.resultPreview.columns.map((c) => (
                            <th key={c} className="px-3 py-2 text-left font-mono text-[10px] text-[var(--muted-foreground)]">{c}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {result.resultPreview.rows.map((row, i) => (
                          <tr key={i} className="border-b last:border-0">
                            {row.map((v, j) => (
                              <td key={j} className="px-3 py-2 font-mono text-[11px]">{String(v)}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Citations */}
              {result.citations.length > 0 && (
                <div>
                  <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                    Citations
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {result.citations.map((c, i) =>
                      c.linkedRoute ? (
                        <Link
                          key={i}
                          to={c.linkedRoute}
                          className="inline-flex items-center rounded-md border bg-[var(--card)] px-1.5 py-0.5 text-[10px] hover:bg-[var(--graphite-50)]"
                        >
                          <ClassificationBadge classification={c.classification} />
                          <span className="ml-1 font-mono">{c.label}</span>
                        </Link>
                      ) : (
                        <Badge key={i} variant="outline" className="text-[10px]">{c.label}</Badge>
                      ),
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
