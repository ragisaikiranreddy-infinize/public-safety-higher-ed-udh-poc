/**
 * <BarrierIndicator barrierId | reason /> — the platform's signature
 * "data is being withheld" chip. Appears anywhere an Information Barrier
 * (per src/lib/information-barriers.ts) is blocking content for the
 * active role.
 *
 * Renders a purple "WALL" badge with a tooltip-style reason. Click-through
 * to the barrier policy lands in R8 (Trust + Governance module).
 */
import { ShieldAlert } from 'lucide-react';
import { getBarrier } from '@/lib/information-barriers';
import { cn } from '@/lib/utils';

interface Props {
  barrierId?: string;
  reason?: string;
  size?: 'sm' | 'md';
  className?: string;
}

export function BarrierIndicator({
  barrierId,
  reason,
  size = 'sm',
  className,
}: Props) {
  const barrier = barrierId ? getBarrier(barrierId) : undefined;
  const label = barrier?.name ?? reason ?? 'Information barrier';
  const title = barrier?.description ?? reason ?? 'Content withheld by an information barrier.';

  return (
    <span
      title={title}
      className={cn(
        'inline-flex items-center gap-1 rounded-md bg-[var(--barrier-soft)] font-semibold text-[var(--barrier)] ring-1 ring-[color-mix(in_oklch,var(--barrier)_30%,white)]',
        size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-1 text-xs',
        className,
      )}
    >
      <ShieldAlert className={size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
      {label}
    </span>
  );
}
