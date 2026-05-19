/**
 * /governance — Governance hub.
 *
 * Policy registry + regulations summary + barrier-policy roster +
 * link-out to audit / policies / regulations detail pages.
 */
import { Link } from 'react-router-dom';
import { ShieldAlert, ScrollText, BookOpen, Lock } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  POLICIES, REGULATIONS, policiesDueForReview, accessLogByActionKind,
} from '@/lib/mock-db';
import { INFORMATION_BARRIERS } from '@/lib/information-barriers';
import { formatRelativeTime } from '@/lib/utils';

export default function GovernancePage() {
  const dueForReview = policiesDueForReview(60);
  const accessKinds = accessLogByActionKind();
  const fedRegs = REGULATIONS.filter((r) => r.jurisdiction === 'federal').length;
  const stateRegs = REGULATIONS.filter((r) => r.jurisdiction === 'state').length;
  const instRegs = REGULATIONS.filter((r) => r.jurisdiction === 'institutional').length;

  return (
    <>
      <PageHeader
        eyebrow="Trust · Governance"
        title="Governance"
        description="Institutional policies, regulatory registry, information barriers, and the audit-of-audit panel. Every policy maps to one or more regulations; every barrier maps back to a policy."
      />

      <div className="space-y-6 px-8 py-6">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <KpiCard icon={ScrollText} label="Policies" value={`${POLICIES.length}`} hint={`${dueForReview.length} due within 60 days`} href="/policies" />
          <KpiCard icon={BookOpen} label="Regulations" value={`${REGULATIONS.length}`} hint={`${fedRegs}f · ${stateRegs}s · ${instRegs}i`} href="/regulations" />
          <KpiCard icon={Lock} label="Information barriers" value={`${INFORMATION_BARRIERS.length}`} hint="hard-walls + soft / conditional / one-way" />
          <KpiCard icon={ShieldAlert} label="Audit events" value={`${Object.values(accessKinds).reduce((s, v) => s + v, 0)}`} hint="view · mask · deny · override · role-switch" href="/audit" />
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Information barriers ({INFORMATION_BARRIERS.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="border-b bg-[var(--graphite-50)]">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Barrier</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Direction</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Protects</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Blocks</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Override</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Hooks</th>
                  </tr>
                </thead>
                <tbody>
                  {INFORMATION_BARRIERS.map((b) => (
                    <tr key={b.id} className="border-b last:border-0 hover:bg-[var(--graphite-50)]">
                      <td className="px-4 py-2">
                        <div className="font-mono text-[10px]">{b.id}</div>
                        <div className="text-[11px]">{b.name}</div>
                      </td>
                      <td className="px-4 py-2"><Badge variant={b.direction === 'hard-wall' ? 'danger' : b.direction === 'soft-wall' ? 'warning' : 'muted'} className="text-[10px]">{b.direction}</Badge></td>
                      <td className="px-4 py-2 text-[10px]">{b.protects.join(', ')}</td>
                      <td className="px-4 py-2 text-[10px]">{Array.isArray(b.blocks) ? b.blocks.join(', ') : '*'}</td>
                      <td className="px-4 py-2 max-w-[280px] text-[10px] text-[var(--muted-foreground)]">{b.overridePath ?? '—'}</td>
                      <td className="px-4 py-2 text-[10px]">
                        <div className="flex flex-wrap gap-1">
                          {b.regulatoryHooks.map((r) => (
                            <Link key={r} to="/regulations" className="font-mono text-[var(--hub-700)] hover:underline">{r}</Link>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {dueForReview.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Policies due for review ({dueForReview.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ul className="divide-y">
                {dueForReview.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-4 px-5 py-3 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-[var(--muted-foreground)]">{p.id}</span>
                      <span>{p.name}</span>
                    </div>
                    <span className="text-[10px] text-[var(--muted-foreground)]">due {formatRelativeTime(new Date(p.nextReviewDueAt))}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}

function KpiCard({ icon: Icon, label, value, hint, href }: { icon: React.ElementType; label: string; value: string; hint: string; href?: string }) {
  const card = (
    <Card>
      <CardContent className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">{label}</div>
          <Icon className="h-4 w-4 text-[var(--muted-foreground)]" />
        </div>
        <div className="font-display text-3xl font-semibold tabular-nums">{value}</div>
        <div className="mt-1 text-[10px] text-[var(--muted-foreground)]">{hint}</div>
      </CardContent>
    </Card>
  );
  return href ? <Link to={href} className="transition-opacity hover:opacity-90">{card}</Link> : card;
}
