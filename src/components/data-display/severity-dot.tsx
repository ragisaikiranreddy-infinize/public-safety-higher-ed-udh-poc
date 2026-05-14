/**
 * <SeverityDot severity="critical|warning|info" /> — small colored circle.
 */
import { cn } from '@/lib/utils';
import type { Severity } from '@/lib/types';

const COLOR: Record<Severity, string> = {
  critical: 'bg-[var(--signal-red)]',
  warning: 'bg-[var(--signal-amber)]',
  info: 'bg-[var(--signal-blue)]',
};

export function SeverityDot({
  severity,
  size = 'sm',
  className,
}: {
  severity: Severity;
  size?: 'sm' | 'md';
  className?: string;
}) {
  return (
    <span
      aria-label={`severity ${severity}`}
      className={cn(
        'inline-block rounded-full',
        size === 'sm' ? 'h-2 w-2' : 'h-2.5 w-2.5',
        COLOR[severity],
        className,
      )}
    />
  );
}
