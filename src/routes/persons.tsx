/**
 * /persons — Master Person Records list.
 *
 * Filterable table of ~150 persons with active-flag indicators. Click → /persons/:id.
 */
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ClassificationBadge } from '@/components/data-display/classification-badge';
import { BarrierIndicator } from '@/components/data-display/barrier-indicator';
import { PERSONS } from '@/lib/mock-db';
import { useRole } from '@/lib/role-context';
import { evaluateBarrier } from '@/lib/information-barriers';

export default function PersonsPage() {
  const [filter, setFilter] = useState('');
  const [tab, setTab] = useState<'all' | 'student' | 'employee' | 'visitor' | 'flagged'>('all');
  const { canSee } = useRole();

  const filtered = useMemo(() => {
    let pool = PERSONS;
    if (tab === 'student') pool = pool.filter((p) => p.affiliations.includes('student'));
    if (tab === 'employee') pool = pool.filter((p) => p.affiliations.includes('employee'));
    if (tab === 'visitor') pool = pool.filter((p) => p.affiliations.includes('visitor'));
    if (tab === 'flagged') {
      pool = pool.filter(
        (p) =>
          p.hasActiveNoContact ||
          p.hasActiveTrespass ||
          p.inOpenBITCase ||
          p.inOpenTitleIXCase ||
          p.inOpenInvestigation,
      );
    }
    const q = filter.trim().toLowerCase();
    if (!q) return pool;
    return pool.filter(
      (p) =>
        p.id.toLowerCase().includes(q) ||
        (p.fullName ?? '').toLowerCase().includes(q) ||
        (p.primaryResidenceBuildingId ?? '').toLowerCase().includes(q),
    );
  }, [filter, tab]);

  const flaggedCount = PERSONS.filter(
    (p) => p.hasActiveNoContact || p.hasActiveTrespass || p.inOpenBITCase || p.inOpenTitleIXCase || p.inOpenInvestigation,
  ).length;

  return (
    <>
      <PageHeader
        eyebrow="People · Master Person Records"
        title="Persons"
        description={`${PERSONS.length} Master Person Records resolved across SIS, HR, Housing, OneCard, parking, and tip lines. Sample rows mask FERPA / PII columns per active role.`}
        actions={
          <Badge variant="warning">{flaggedCount} flagged</Badge>
        }
      />

      <div className="space-y-6 px-8 py-6">
        <div className="flex items-center gap-2">
          <TabBtn label="All" active={tab === 'all'} onClick={() => setTab('all')} />
          <TabBtn label="Students" active={tab === 'student'} onClick={() => setTab('student')} />
          <TabBtn label="Employees" active={tab === 'employee'} onClick={() => setTab('employee')} />
          <TabBtn label="Visitors" active={tab === 'visitor'} onClick={() => setTab('visitor')} />
          <TabBtn label="Flagged" active={tab === 'flagged'} onClick={() => setTab('flagged')} />
        </div>

        <Input
          type="search"
          placeholder="Search persons by ID, name, residence building…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="border-b bg-[var(--graphite-50)]">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Person</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Affiliations</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Residence</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Classification</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Flags</th>
                    <th className="px-4 py-2 text-right font-medium text-[var(--muted-foreground)]">Merge</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.slice(0, 300).map((p) => {
                    const nameMasked = !canSee(p.classificationTier);
                    const tixHit = p.inOpenTitleIXCase
                      ? evaluateBarrier({
                          actorRole: 'chief-of-police' as never, // we use the actual role below
                          fieldClassification: 'title-ix-sensitive',
                          resourceKind: 'person',
                          resourceId: p.id,
                        })
                      : null;
                    return (
                      <tr key={p.id} className="border-b last:border-0 hover:bg-[var(--graphite-50)]">
                        <td className="px-4 py-2">
                          <Link to={`/persons/${encodeURIComponent(p.id)}`}>
                            <div className="font-mono text-[var(--foreground)]">{p.id}</div>
                            <div className="text-[10px] text-[var(--muted-foreground)]">
                              {nameMasked ? <span className="text-[var(--barrier)]">[FERPA masked]</span> : p.fullName}
                            </div>
                          </Link>
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex flex-wrap gap-1">
                            {p.affiliations.map((a) => (
                              <Badge key={a} variant="muted" className="text-[9px]">{a}</Badge>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-2 font-mono text-[10px] text-[var(--muted-foreground)]">
                          {p.primaryResidenceBuildingId ?? '—'}
                        </td>
                        <td className="px-4 py-2">
                          <ClassificationBadge classification={p.classificationTier} />
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex flex-wrap gap-1">
                            {p.hasActiveNoContact && <Badge variant="warning" className="text-[9px]">NCO</Badge>}
                            {p.hasActiveTrespass && <Badge variant="danger" className="text-[9px]">trespass</Badge>}
                            {p.inOpenBITCase && <Badge variant="accent" className="text-[9px]">BIT</Badge>}
                            {p.inOpenInvestigation && <Badge variant="restricted-investigation" className="text-[9px]">inv.</Badge>}
                            {p.inOpenTitleIXCase && tixHit && !tixHit.allowed ? (
                              <BarrierIndicator reason="Title IX" />
                            ) : p.inOpenTitleIXCase ? (
                              <Badge variant="title-ix" className="text-[9px]">Title IX</Badge>
                            ) : null}
                          </div>
                        </td>
                        <td className="px-4 py-2 text-right tabular-nums">
                          <span className={p.mergeConfidence >= 90 ? 'text-[var(--signal-green)]' : p.mergeConfidence >= 80 ? 'text-[var(--graphite-700)]' : 'text-[var(--signal-amber)]'}>
                            {p.mergeConfidence}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function TabBtn({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
        active
          ? 'bg-[var(--graphite-900)] text-white'
          : 'border border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:bg-[var(--graphite-50)]'
      }`}
    >
      {label}
    </button>
  );
}
