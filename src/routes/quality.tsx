/**
 * /quality — DQ console.
 *
 * Surface 40 rules across the six dimensions with pass/fail status,
 * 7-day trend, severity, affected rows. Failing rules listed first.
 */
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SeverityDot } from '@/components/data-display/severity-dot';
import {
  DQ_RULES,
  dqRulesByDimension,
  failingDqRulesByDimension,
  failingDqRules,
} from '@/lib/mock-db';
import type { QualityDimensions } from '@/lib/types';

const DIMENSIONS: { key: keyof QualityDimensions; label: string }[] = [
  { key: 'accuracy', label: 'Accuracy' },
  { key: 'completeness', label: 'Completeness' },
  { key: 'consistency', label: 'Consistency' },
  { key: 'timeliness', label: 'Timeliness' },
  { key: 'uniqueness', label: 'Uniqueness' },
  { key: 'validity', label: 'Validity' },
];

export default function QualityPage() {
  const counts = useMemo(() => dqRulesByDimension(), []);
  const fails = useMemo(() => failingDqRulesByDimension(), []);
  const failing = useMemo(() => failingDqRules(), []);
  const passing = useMemo(() => DQ_RULES.filter((r) => r.passed), []);

  return (
    <>
      <PageHeader
        eyebrow="Data · Quality Console"
        title="Six-dimension Data Quality"
        description={`${DQ_RULES.length} rules across the six DQ dimensions. ${failing.length} failing today — failing rules surface first.`}
      />

      <div className="space-y-6 px-8 py-6">
        {/* Six-dim score cards */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {DIMENSIONS.map((d) => {
            const total = counts[d.key] ?? 0;
            const fail = fails[d.key] ?? 0;
            return (
              <Card key={d.key}>
                <CardContent className="p-4">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                    {d.label}
                  </div>
                  <div className="mt-1 font-display text-2xl font-semibold tabular-nums text-[var(--foreground)]">
                    {total - fail}
                    <span className="ml-1 text-sm font-normal text-[var(--muted-foreground)]">
                      / {total}
                    </span>
                  </div>
                  {fail > 0 ? (
                    <Badge variant="danger" className="mt-2 text-[10px]">{fail} failing</Badge>
                  ) : (
                    <Badge variant="success" className="mt-2 text-[10px]">all pass</Badge>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Failing rules */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Failing rules ({failing.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {failing.length === 0 ? (
              <div className="text-sm text-[var(--muted-foreground)]">All rules passing. ✨</div>
            ) : (
              <RuleTable rules={failing} />
            )}
          </CardContent>
        </Card>

        {/* Passing rules */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Passing rules ({passing.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <RuleTable rules={passing} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function RuleTable({ rules }: { rules: typeof DQ_RULES }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead className="border-b bg-[var(--graphite-50)]">
          <tr>
            <th className="px-3 py-2 text-left font-medium text-[var(--muted-foreground)]">Dataset</th>
            <th className="px-3 py-2 text-left font-medium text-[var(--muted-foreground)]">Field</th>
            <th className="px-3 py-2 text-left font-medium text-[var(--muted-foreground)]">Rule</th>
            <th className="px-3 py-2 text-left font-medium text-[var(--muted-foreground)]">Dimension</th>
            <th className="px-3 py-2 text-left font-medium text-[var(--muted-foreground)]">Severity</th>
            <th className="px-3 py-2 text-right font-medium text-[var(--muted-foreground)]">Affected</th>
            <th className="px-3 py-2 text-center font-medium text-[var(--muted-foreground)]">7d trend</th>
          </tr>
        </thead>
        <tbody>
          {rules.map((r) => (
            <tr key={r.id} className="border-b last:border-0">
              <td className="px-3 py-2">
                <Link to={`/catalog/${encodeURIComponent(r.datasetId)}`} className="font-mono text-[var(--hub-700)] hover:underline">
                  {r.datasetId}
                </Link>
              </td>
              <td className="px-3 py-2 font-mono text-[var(--graphite-700)]">{r.field}</td>
              <td className="px-3 py-2 text-[var(--foreground)]">{r.description}</td>
              <td className="px-3 py-2"><Badge variant="muted">{r.dimension}</Badge></td>
              <td className="px-3 py-2"><SeverityDot severity={r.severity} /></td>
              <td className="px-3 py-2 text-right tabular-nums">
                {r.affectedRows ?? '—'}
              </td>
              <td className="px-3 py-2">
                <div className="flex items-center justify-center gap-0.5">
                  {r.trend7d.map((t, i) => (
                    <span
                      key={i}
                      className={`inline-block h-2 w-1.5 rounded-sm ${
                        t ? 'bg-[var(--signal-green)]' : 'bg-[var(--signal-red)]'
                      }`}
                    />
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
