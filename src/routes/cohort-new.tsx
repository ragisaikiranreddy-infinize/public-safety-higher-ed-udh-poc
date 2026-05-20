/**
 * /cohorts/new — NL cohort builder.
 *
 * Submit a natural-language prompt → cohortFromNL() returns a chip pipeline
 * + sample members + dataset list.
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Send } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CohortChipPipeline } from '@/components/ai-surfaces/cohort-chip-pipeline';
import { cohortFromNL, type AICohortBuildResult } from '@/lib/ai/mock-ai';

const SAMPLE_PROMPTS = [
  'Find subjects with multi-signal patterns at residence halls — Carter Hall area',
  'Officers with high incident load and low training hours',
];

export default function CohortNewPage() {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState<AICohortBuildResult | null>(null);

  function run(text: string) {
    setResult(cohortFromNL(text));
  }

  return (
    <>
      <PageHeader
        eyebrow="Intelligence · New cohort"
        title="Build a cohort from natural language"
        description="Describe the cohort in plain English. The platform proposes a chip-pipeline predicate stack + sample resolved members + the datasets the cohort would read from."
      />
      <div className="space-y-6 px-8 py-6">
        <Card>
          <CardContent className="space-y-3 p-5">
            <div className="flex flex-wrap gap-2">
              {SAMPLE_PROMPTS.map((p) => (
                <button
                  key={p}
                  onClick={() => setPrompt(p)}
                  className="rounded-md border bg-[var(--card)] px-3 py-1.5 text-xs hover:bg-[var(--graphite-50)]"
                >
                  {p}
                </button>
              ))}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (prompt.trim()) run(prompt);
              }}
              className="flex items-center gap-2"
            >
              <Input
                placeholder="Describe the cohort…"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
              <Button type="submit" variant="default" size="sm">
                <Send className="h-3.5 w-3.5" />
                <span className="ml-1">Build</span>
              </Button>
            </form>
          </CardContent>
        </Card>

        {result && (
          <Card>
            <CardContent className="space-y-4 p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="font-display text-base font-semibold">{result.name}</div>
                <div className="flex items-center gap-2 text-[10px] text-[var(--muted-foreground)]">
                  <Badge variant="success" className="text-[10px]">~{result.estimatedCount} members</Badge>
                  <span>{result.confidence}% confidence</span>
                </div>
              </div>
              <CohortChipPipeline chips={result.chips} />

              {result.sampleMemberIds.length > 0 && (
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                    Sample resolved members
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {result.sampleMemberIds.map((id) => (
                      <Link
                        key={id}
                        to={id.startsWith('PER-') ? `/persons/${id}` : id.startsWith('OFC-') ? `/officers/${id}` : '#'}
                        className="inline-flex items-center rounded-md border bg-[var(--card)] px-1.5 py-0.5 font-mono text-[10px] hover:bg-[var(--graphite-50)]"
                      >
                        {id}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {result.datasets.length > 0 && (
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                    Datasets the cohort reads from
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {result.datasets.map((d) => (
                      <Link key={d} to={`/catalog/${encodeURIComponent(d)}`} className="inline-flex items-center rounded-md border px-1.5 py-0.5 font-mono text-[10px] hover:bg-[var(--graphite-50)]">
                        {d}
                      </Link>
                    ))}
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
