/**
 * <Stepper steps activeIndex completedIndices /> — horizontal step indicator.
 *
 * Used by the Add Source wizard (R2) and the Pipeline live-run state machine
 * to communicate progress through a multi-stage process.
 */
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  steps: { label: string; description?: string }[];
  activeIndex: number;
  completedIndices?: number[];
  failedIndex?: number;
  className?: string;
}

export function Stepper({
  steps,
  activeIndex,
  completedIndices = [],
  failedIndex,
  className,
}: Props) {
  return (
    <ol className={cn('flex items-start gap-0', className)}>
      {steps.map((s, i) => {
        const isCompleted = completedIndices.includes(i);
        const isFailed = failedIndex === i;
        const isActive = i === activeIndex;
        const isLast = i === steps.length - 1;
        return (
          <li key={i} className="flex flex-1 items-start gap-0">
            <div className="flex flex-col items-center" style={{ minWidth: 0 }}>
              <div
                className={cn(
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold transition-colors',
                  isFailed
                    ? 'bg-[var(--signal-red)] text-white'
                    : isCompleted
                    ? 'bg-[var(--signal-green)] text-white'
                    : isActive
                    ? 'bg-[var(--hub-600)] text-white ring-4 ring-[var(--hub-100)]'
                    : 'bg-[var(--graphite-100)] text-[var(--muted-foreground)]',
                )}
              >
                {isFailed ? (
                  <span className="text-xs">!</span>
                ) : isCompleted ? (
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                ) : (
                  i + 1
                )}
              </div>
              <div
                className={cn(
                  'mt-1.5 text-center text-[10px] font-medium leading-tight',
                  isActive
                    ? 'text-[var(--foreground)]'
                    : 'text-[var(--muted-foreground)]',
                )}
                style={{ maxWidth: 100 }}
              >
                {s.label}
              </div>
              {s.description && (
                <div
                  className="mt-0.5 text-center text-[9px] leading-tight text-[var(--muted-foreground)]"
                  style={{ maxWidth: 100 }}
                >
                  {s.description}
                </div>
              )}
            </div>
            {!isLast && (
              <div
                className={cn(
                  'mt-3.5 h-0.5 flex-1',
                  isCompleted ? 'bg-[var(--signal-green)]' : 'bg-[var(--graphite-200)]',
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
