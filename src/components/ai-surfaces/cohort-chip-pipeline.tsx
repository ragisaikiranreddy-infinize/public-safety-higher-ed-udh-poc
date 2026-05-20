/**
 * <CohortChipPipeline /> — left-to-right chip pipeline rendering of cohort
 * predicates. Each chip has a kind-icon and shows the field/op/value tuple.
 */
import { Filter, Sigma, Clock, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { CohortChip } from '@/lib/types';
import { cn } from '@/lib/utils';

const KIND_ICON: Record<CohortChip['kind'], React.ElementType> = {
  filter: Filter,
  aggregate: Sigma,
  window: Clock,
  threshold: Activity,
};

const KIND_COLOR: Record<CohortChip['kind'], string> = {
  filter: 'bg-[var(--signal-blue-soft)] text-[oklch(0.38_0.12_235)] ring-[color-mix(in_oklch,var(--signal-blue)_30%,white)]',
  aggregate: 'bg-[var(--hub-50)] text-[var(--hub-700)] ring-[var(--hub-300)]',
  window: 'bg-[var(--signal-amber-soft)] text-[oklch(0.42_0.13_70)] ring-[color-mix(in_oklch,var(--signal-amber)_30%,white)]',
  threshold: 'bg-[var(--signal-green-soft)] text-[oklch(0.38_0.12_155)] ring-[color-mix(in_oklch,var(--signal-green)_30%,white)]',
};

interface Props {
  chips: CohortChip[];
}

export function CohortChipPipeline({ chips }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((c, i) => {
        const Icon = KIND_ICON[c.kind];
        return (
          <div key={c.id} className="flex items-center gap-2">
            <span
              className={cn(
                'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-medium ring-1',
                KIND_COLOR[c.kind],
              )}
            >
              <Icon className="h-3 w-3" />
              {c.label}
              <Badge variant="outline" className="ml-1 text-[8px]">{c.kind}</Badge>
            </span>
            {i < chips.length - 1 && (
              <span className="text-[var(--muted-foreground)]">→</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
