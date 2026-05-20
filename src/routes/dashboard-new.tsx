/**
 * /dashboards/new — AI dashboard builder.
 *
 * NL prompt → buildDashboardFromNL() → staged 12-col grid that reveals
 * widget-by-widget with the configured stagger delays.
 */
import { useState } from 'react';
import { Send } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DashboardGrid } from '@/components/ai-surfaces/dashboard-grid';
import { buildDashboardFromNL, type AIDashboardBuildResult } from '@/lib/ai/mock-ai';
import type { Dashboard } from '@/lib/types';
import { isoSeconds } from '@/lib/time';

const SAMPLE_PROMPTS = [
  'Build an EOC operational readiness dashboard',
  'Build a Clery overview — ASR + Timely Warnings + FOIA',
  'Build a BIT weekly review',
];

export default function DashboardNewPage() {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState<AIDashboardBuildResult | null>(null);

  function run(text: string) {
    setResult(buildDashboardFromNL(text));
  }

  // Wrap the AI result into a Dashboard so we can reuse <DashboardGrid/>
  const dashboard: Dashboard | null = result
    ? {
        id: 'DSH-DRAFT',
        name: result.name,
        description: result.rationale,
        ownerRole: 'chief-of-police',
        promptSource: prompt,
        widgets: result.widgets,
        createdAt: isoSeconds(new Date()),
        isPinned: false,
        classification: 'internal',
      }
    : null;

  return (
    <>
      <PageHeader
        eyebrow="Intelligence · AI Dashboard builder"
        title="Build a dashboard from natural language"
        description="Describe the dashboard you want. The AI builder selects widget types, lays them out on a 12-column grid, and reveals them with stagger animation."
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
                placeholder="Describe the dashboard…"
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

        {dashboard && result && (
          <>
            <Card>
              <CardContent className="space-y-2 p-4">
                <div className="flex items-center justify-between">
                  <div className="font-display text-base font-semibold">{dashboard.name}</div>
                  <Badge variant="success" className="text-[10px]">{result.confidence}% confidence</Badge>
                </div>
                <p className="text-[11px] text-[var(--muted-foreground)]">{result.rationale}</p>
              </CardContent>
            </Card>
            <DashboardGrid dashboard={dashboard} animate />
          </>
        )}
      </div>
    </>
  );
}
