/**
 * <PriorityChip priority={1|2|3|4} /> — CAD/incident priority indicator.
 *
 *   P1 — Immediate threat (red)
 *   P2 — Urgent (amber)
 *   P3 — Standard (yellow-green)
 *   P4 — Administrative (blue)
 */
import { Badge } from '@/components/ui/badge';
import type { Priority } from '@/lib/types';

const LABEL: Record<Priority, string> = {
  1: 'P1 · Immediate',
  2: 'P2 · Urgent',
  3: 'P3 · Standard',
  4: 'P4 · Admin',
};

const VARIANT: Record<Priority, Parameters<typeof Badge>[0]['variant']> = {
  1: 'p-1',
  2: 'p-2',
  3: 'p-3',
  4: 'p-4',
};

export function PriorityChip({
  priority,
  compact = false,
}: {
  priority: Priority;
  compact?: boolean;
}) {
  return (
    <Badge variant={VARIANT[priority]}>
      {compact ? `P${priority}` : LABEL[priority]}
    </Badge>
  );
}
