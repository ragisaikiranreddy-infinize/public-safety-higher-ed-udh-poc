/**
 * /pipelines/:id/run — Live pipeline-run state-machine simulator.
 *
 * Phases: idle → running → gating → done | blocked
 *
 * Three demo paths are wired by reading the pipeline's status from
 * mocks/pipelines.ts:
 *
 *   success path (bronze-cad-events)        — walks all transform steps,
 *                                              quality gate passes, done.
 *   failed-gate path (silver-clery-classifier) — walks steps; quality gate
 *                                              animates → fails on the
 *                                              ambiguous-polygon rule.
 *   blocked path (gold-bit-briefing-features)  — short-circuits to blocked
 *                                              with a banner pointing at the
 *                                              upstream dataset.
 *
 * Per CLAUDE.md pitfall #5: every setInterval is paired with a `cancelled`
 * flag + clearInterval in the cleanup callback.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Play, RotateCcw, Loader2, CheckCircle2, XCircle, Ban } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Stepper } from '@/components/layout/stepper';
import { LayerBadge } from '@/components/data-display/layer-badge';
import { PipelineStatusPill } from '@/components/data-display/pipeline-status-pill';
import { SeverityDot } from '@/components/data-display/severity-dot';
import { getPipeline } from '@/lib/mock-db';
import {
  PIPELINE_FAILED_GATE_PATH_ID,
  PIPELINE_BLOCKED_PATH_ID,
} from '@/lib/mock-db';
import { formatNumber } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { PipelineRun } from '@/lib/types';
import NotFoundPage from './not-found';

type Phase = 'idle' | 'running' | 'gating' | 'done' | 'blocked' | 'failed';

interface StepState {
  index: number;
  status: 'pending' | 'in-progress' | 'completed' | 'skipped';
  startedAt?: number;
  finishedAt?: number;
}

interface RuleState {
  index: number;
  status: 'pending' | 'checking' | 'pass' | 'fail';
}

// Cadence — short enough to feel live, long enough to read.
const STEP_TICK_MS = 700;
const RULE_TICK_MS = 450;

export default function PipelineRunPage() {
  const { id = '' } = useParams<{ id: string }>();
  const pipeline = getPipeline(id);
  if (!pipeline) return <NotFoundPage />;
  // Inner component so hooks run unconditionally after the null-check guard.
  return <RunSimulator pipeline={pipeline} />;
}

function RunSimulator({ pipeline }: { pipeline: PipelineRun }) {
  // Decide the demo path from the pipeline's pre-canned status.
  const demoPath: 'success' | 'failed' | 'blocked' = useMemo(() => {
    if (pipeline.id === PIPELINE_BLOCKED_PATH_ID || pipeline.status === 'blocked')
      return 'blocked';
    if (pipeline.id === PIPELINE_FAILED_GATE_PATH_ID || pipeline.status === 'failed')
      return 'failed';
    return 'success';
  }, [pipeline]);

  const [phase, setPhase] = useState<Phase>('idle');
  const [steps, setSteps] = useState<StepState[]>(() =>
    pipeline.transformSteps.map((_, i) => ({ index: i, status: 'pending' as const })),
  );
  const [rules, setRules] = useState<RuleState[]>(() =>
    pipeline.qualityGate.rules.map((_, i) => ({ index: i, status: 'pending' as const })),
  );
  const [elapsedMs, setElapsedMs] = useState(0);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Reset state to idle.
  function reset() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
    intervalRef.current = null;
    elapsedTimerRef.current = null;
    setPhase('idle');
    setSteps(pipeline.transformSteps.map((_, i) => ({ index: i, status: 'pending' as const })));
    setRules(pipeline.qualityGate.rules.map((_, i) => ({ index: i, status: 'pending' as const })));
    setElapsedMs(0);
  }

  // Cleanup on unmount + route change. Pitfall #5.
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
    };
  }, []);

  function startRun() {
    let cancelled = false;

    // ----- Blocked path: short-circuit immediately -----
    if (demoPath === 'blocked') {
      setPhase('blocked');
      setSteps((prev) =>
        prev.map((s, i) =>
          i === 0 ? { ...s, status: 'in-progress', startedAt: Date.now() } : { ...s, status: 'skipped' },
        ),
      );
      return;
    }

    setPhase('running');
    setElapsedMs(0);
    elapsedTimerRef.current = setInterval(() => {
      if (cancelled) return;
      setElapsedMs((ms) => ms + 100);
    }, 100);

    // ----- Walk transform steps -----
    let stepIdx = 0;
    setSteps((prev) =>
      prev.map((s, i) => (i === 0 ? { ...s, status: 'in-progress', startedAt: Date.now() } : s)),
    );

    intervalRef.current = setInterval(() => {
      if (cancelled) return;
      // Complete current step.
      setSteps((prev) =>
        prev.map((s, i) =>
          i === stepIdx ? { ...s, status: 'completed', finishedAt: Date.now() } : s,
        ),
      );
      stepIdx++;
      if (stepIdx < pipeline.transformSteps.length) {
        // Advance to next step.
        setSteps((prev) =>
          prev.map((s, i) =>
            i === stepIdx ? { ...s, status: 'in-progress', startedAt: Date.now() } : s,
          ),
        );
      } else {
        // All steps done — transition to gating phase.
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = null;
        setPhase('gating');
        // Begin quality-gate animation.
        runQualityGate();
      }
    }, STEP_TICK_MS);

    function runQualityGate() {
      if (cancelled) return;
      if (pipeline.qualityGate.rules.length === 0) {
        // No rules to walk — declare done.
        setPhase('done');
        if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
        return;
      }
      let ruleIdx = 0;
      setRules((prev) =>
        prev.map((r, i) => (i === 0 ? { ...r, status: 'checking' as const } : r)),
      );
      intervalRef.current = setInterval(() => {
        if (cancelled) return;
        // Resolve current rule based on the pipeline's canned outcome.
        const ruleOutcome = pipeline.qualityGate.rules[ruleIdx];
        setRules((prev) =>
          prev.map((r, i) =>
            i === ruleIdx
              ? { ...r, status: ruleOutcome.passed ? 'pass' as const : 'fail' as const }
              : r,
          ),
        );
        ruleIdx++;
        if (ruleIdx < pipeline.qualityGate.rules.length) {
          setRules((prev) =>
            prev.map((r, i) => (i === ruleIdx ? { ...r, status: 'checking' as const } : r)),
          );
        } else {
          // All rules checked.
          if (intervalRef.current) clearInterval(intervalRef.current);
          intervalRef.current = null;
          if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
          // Final outcome: fail if any critical rule failed.
          const anyFail = pipeline.qualityGate.rules.some(
            (r) => !r.passed && r.severity === 'critical',
          );
          setPhase(anyFail ? 'failed' : 'done');
        }
      }, RULE_TICK_MS);
    }
  }

  const phaseSteps = useMemo(
    () => [
      { label: 'Idle', description: 'Ready' },
      { label: 'Running', description: 'Transform' },
      { label: 'Gating', description: 'Quality gate' },
      { label: phase === 'failed' ? 'Failed' : phase === 'blocked' ? 'Blocked' : 'Done' },
    ],
    [phase],
  );

  const phaseIdx = (() => {
    switch (phase) {
      case 'idle': return 0;
      case 'running': return 1;
      case 'gating': return 2;
      case 'done':
      case 'failed':
      case 'blocked':
        return 3;
    }
  })();

  const completedPhases =
    phase === 'idle' ? [] :
    phase === 'running' ? [0] :
    phase === 'gating' ? [0, 1] :
    phase === 'done' ? [0, 1, 2, 3] :
    [0, 1, 2]; // failed or blocked — third stage reached but not "completed"

  const failedPhase = phase === 'failed' || phase === 'blocked' ? 3 : undefined;

  return (
    <>
      <PageHeader
        eyebrow={`Pipelines · Live Run · ${demoPath} demo path`}
        title={pipeline.name}
        description={pipeline.description}
        actions={
          <div className="flex items-center gap-2">
            <LayerBadge layer={pipeline.toLayer} />
            <PipelineStatusPill status={pipeline.status} />
            {phase === 'idle' ? (
              <Button variant="accent" size="sm" onClick={startRun}>
                <Play className="h-3.5 w-3.5" />
                Run now
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={reset}>
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </Button>
            )}
            <Link to={`/pipelines/${encodeURIComponent(pipeline.id)}`}>
              <Button variant="ghost" size="sm">Detail view</Button>
            </Link>
          </div>
        }
      />

      <div className="space-y-6 px-8 py-6">
        {/* Phase stepper */}
        <Card>
          <CardContent className="p-5">
            <Stepper
              steps={phaseSteps}
              activeIndex={phaseIdx}
              completedIndices={completedPhases}
              failedIndex={failedPhase}
            />
          </CardContent>
        </Card>

        {/* Banner for blocked path */}
        {phase === 'blocked' && pipeline.blockedByDatasetId && (
          <Card className="border-[var(--signal-red)]">
            <CardContent className="flex items-center gap-3 p-4">
              <Ban className="h-5 w-5 text-[var(--signal-red)]" />
              <div className="flex-1 text-sm">
                <span className="font-semibold text-[var(--foreground)]">Blocked upstream.</span>{' '}
                Cannot run — upstream dataset{' '}
                <Link
                  to={`/catalog/${encodeURIComponent(pipeline.blockedByDatasetId)}`}
                  className="font-mono text-[var(--hub-700)] hover:underline"
                >
                  {pipeline.blockedByDatasetId}
                </Link>{' '}
                has not refreshed within its SLA window. The Maxient export job is the culprit
                (Thread A's data-side diagnosis path).
              </div>
            </CardContent>
          </Card>
        )}

        {/* Banner for failed gate */}
        {phase === 'failed' && (
          <Card className="border-[var(--signal-red)]">
            <CardContent className="flex items-center gap-3 p-4">
              <XCircle className="h-5 w-5 text-[var(--signal-red)]" />
              <div className="flex-1 text-sm">
                <span className="font-semibold text-[var(--foreground)]">Quality gate failed.</span>{' '}
                Critical rule did not pass; downstream consumers will block until remediation.
                Steward review queue updated.
              </div>
            </CardContent>
          </Card>
        )}

        {/* Banner for done */}
        {phase === 'done' && (
          <Card className="border-[var(--signal-green)]">
            <CardContent className="flex items-center gap-3 p-4">
              <CheckCircle2 className="h-5 w-5 text-[var(--signal-green)]" />
              <div className="flex-1 text-sm">
                <span className="font-semibold text-[var(--foreground)]">Run completed.</span>{' '}
                {formatNumber(pipeline.rowsOut)} rows materialized to{' '}
                <Link
                  to={`/catalog/${encodeURIComponent(pipeline.targetDatasetId)}`}
                  className="font-mono text-[var(--hub-700)] hover:underline"
                >
                  {pipeline.targetDatasetId}
                </Link>
                . Quality gate passed all critical rules.
              </div>
            </CardContent>
          </Card>
        )}

        {/* KPI row */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <KpiBox label="Phase" value={phase} />
          <KpiBox
            label="Elapsed"
            value={phase === 'idle' ? '—' : `${(elapsedMs / 1000).toFixed(1)}s`}
          />
          <KpiBox label="Steps" value={`${pipeline.transformSteps.length}`} />
          <KpiBox label="DQ rules" value={`${pipeline.qualityGate.rules.length}`} />
        </div>

        {/* Transform steps — live state */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Transform steps</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {pipeline.transformSteps.map((step, i) => {
              const state = steps[i];
              return (
                <div
                  key={step.id}
                  className={cn(
                    'flex items-start gap-3 rounded-md border bg-[var(--card)] p-3 transition-colors',
                    state.status === 'in-progress' && 'border-[var(--hub-600)] bg-[var(--hub-100)]',
                    state.status === 'completed' && 'border-[var(--signal-green)]/40',
                    state.status === 'skipped' && 'opacity-50',
                  )}
                >
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center">
                    {state.status === 'completed' && (
                      <CheckCircle2 className="h-4 w-4 text-[var(--signal-green)]" />
                    )}
                    {state.status === 'in-progress' && (
                      <Loader2 className="h-4 w-4 animate-spin text-[var(--hub-600)]" />
                    )}
                    {state.status === 'pending' && (
                      <span className="h-3 w-3 rounded-full border border-[var(--graphite-300)]" />
                    )}
                    {state.status === 'skipped' && (
                      <span className="h-3 w-3 rounded-full bg-[var(--graphite-200)]" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-[var(--foreground)]">
                        #{i + 1} · {step.kind}
                      </span>
                      {state.status === 'in-progress' && (
                        <Badge variant="info" className="text-[10px]">running</Badge>
                      )}
                      {state.status === 'completed' && (
                        <Badge variant="success" className="text-[10px]">done</Badge>
                      )}
                    </div>
                    <div className="mt-1 text-xs text-[var(--muted-foreground)]">{step.description}</div>
                    {state.status === 'completed' && step.rowsOut !== undefined && (
                      <div className="mt-1 text-[10px] text-[var(--muted-foreground)]">
                        in: {formatNumber(step.rowsIn ?? 0)} · out: {formatNumber(step.rowsOut)} · {step.durationMs ? `${(step.durationMs / 1000).toFixed(1)}s` : ''}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Quality gate — animates during 'gating' phase */}
        {pipeline.qualityGate.rules.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>Quality gate ({pipeline.qualityGate.rules.length} rules)</CardTitle>
                {phase === 'gating' && (
                  <Badge variant="info" className="animate-pulse">checking…</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {pipeline.qualityGate.rules.map((rule, i) => {
                const state = rules[i];
                return (
                  <div
                    key={rule.id}
                    className={cn(
                      'flex items-start gap-3 rounded-md border p-3 transition-colors',
                      state.status === 'checking' && 'border-[var(--hub-600)] bg-[var(--hub-100)]',
                      state.status === 'pass' && 'border-[var(--signal-green)]/40',
                      state.status === 'fail' && 'border-[var(--signal-red)] bg-[var(--signal-red-soft)]',
                    )}
                  >
                    <SeverityDot severity={rule.severity} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[var(--foreground)]">{rule.description}</span>
                        {state.status === 'checking' && (
                          <Loader2 className="h-3 w-3 animate-spin text-[var(--hub-600)]" />
                        )}
                      </div>
                      <div className="mt-1 text-[10px] text-[var(--muted-foreground)]">
                        {rule.dimension} · {rule.severity}
                        {rule.thresholdDescription ? ` · ${rule.thresholdDescription}` : ''}
                      </div>
                    </div>
                    {state.status === 'pass' && <Badge variant="success">pass</Badge>}
                    {state.status === 'fail' && <Badge variant="danger">fail</Badge>}
                    {state.status === 'pending' && <Badge variant="muted">pending</Badge>}
                    {state.status === 'checking' && <Badge variant="info">checking</Badge>}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* Demo-path hint footer */}
        <Card>
          <CardContent className="flex items-center gap-3 p-4 text-xs text-[var(--muted-foreground)]">
            <Separator orientation="vertical" className="h-8" />
            <div>
              This is the <strong className="text-[var(--foreground)]">{demoPath}</strong> demo
              path.{' '}
              {demoPath === 'success' && (
                <>Walks all {pipeline.transformSteps.length} transform steps, then animates the quality gate's {pipeline.qualityGate.rules.length} rules to a green outcome.</>
              )}
              {demoPath === 'failed' && (
                <>Walks transform steps, then the quality gate animates rule-by-rule until the ambiguous-polygon rule fails. Downstream gold-clery-asr mart freshness ages out.</>
              )}
              {demoPath === 'blocked' && (
                <>Short-circuits to blocked because the upstream dataset hasn't refreshed inside its SLA window — Maxient nightly export lag is propagating to this Gold mart.</>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function KpiBox({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
          {label}
        </div>
        <div className="mt-1 font-display text-2xl font-semibold capitalize text-[var(--foreground)]">{value}</div>
      </CardContent>
    </Card>
  );
}
