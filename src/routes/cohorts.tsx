/**
 * /cohorts — saved cohort list.
 */
import { Link } from 'react-router-dom';
import { Filter, Plus } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CohortChipPipeline } from '@/components/ai-surfaces/cohort-chip-pipeline';
import { COHORTS } from '@/lib/mock-db';
import { formatRelativeTime } from '@/lib/utils';

export default function CohortsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Intelligence · Cohorts"
        title="Saved cohorts"
        description={`${COHORTS.length} cohorts saved across BIT, EOC, Conduct, and Officer workflows. Each cohort is a chip-pipeline predicate stack resolved to entity IDs.`}
        actions={
          <Link to="/cohorts/new">
            <Button size="sm" variant="default">
              <Plus className="h-3.5 w-3.5" />
              <span className="ml-1">New cohort</span>
            </Button>
          </Link>
        }
      />
      <div className="space-y-4 px-8 py-6">
        {COHORTS.map((c) => (
          <Card key={c.id}>
            <CardContent className="space-y-3 p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-[var(--hub-700)]" />
                  <span className="font-mono text-[10px] text-[var(--muted-foreground)]">{c.id}</span>
                  <span className="font-display text-base font-semibold">{c.name}</span>
                  {c.threadTag && <Badge variant="accent">Thread {c.threadTag}</Badge>}
                </div>
                <div className="flex items-center gap-2 text-[10px] text-[var(--muted-foreground)]">
                  <Badge variant="outline" className="text-[10px]">{c.entityKind}</Badge>
                  <span>{c.memberIds.length} members</span>
                  <span>refreshed {formatRelativeTime(new Date(c.lastRefreshedAt))}</span>
                </div>
              </div>
              <CohortChipPipeline chips={c.chips} />
              {c.memberIds.length > 0 && (
                <div className="text-[11px] text-[var(--muted-foreground)]">
                  Sample members:{' '}
                  {c.memberIds.slice(0, 5).map((id, i) => (
                    <span key={id}>
                      <Link to={`/persons/${encodeURIComponent(id)}`} className="font-mono text-[var(--hub-700)] hover:underline">{id}</Link>
                      {i < Math.min(c.memberIds.length, 5) - 1 && <span>, </span>}
                    </span>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
