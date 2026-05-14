import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-[var(--graphite-100)] text-[var(--graphite-900)]',
        outline: 'border border-[var(--border)] text-[var(--foreground)]',
        muted: 'bg-[var(--muted)] text-[var(--muted-foreground)]',
        accent:
          'bg-[var(--hub-100)] text-[var(--hub-700)] ring-1 ring-[var(--hub-300)]',

        // Signal
        success:
          'bg-[var(--signal-green-soft)] text-[oklch(0.38_0.12_155)] ring-1 ring-[color-mix(in_oklch,var(--signal-green)_30%,white)]',
        warning:
          'bg-[var(--signal-amber-soft)] text-[oklch(0.42_0.13_70)] ring-1 ring-[color-mix(in_oklch,var(--signal-amber)_30%,white)]',
        danger:
          'bg-[var(--signal-red-soft)] text-[var(--signal-red)] ring-1 ring-[color-mix(in_oklch,var(--signal-red)_30%,white)]',
        info:
          'bg-[var(--signal-blue-soft)] text-[oklch(0.38_0.12_235)] ring-1 ring-[color-mix(in_oklch,var(--signal-blue)_30%,white)]',

        // Medallion layers
        bronze:
          'bg-[var(--layer-bronze-soft)] text-[oklch(0.38_0.09_55)] ring-1 ring-[color-mix(in_oklch,var(--layer-bronze)_30%,white)]',
        silver:
          'bg-[var(--layer-silver-soft)] text-[oklch(0.38_0.02_240)] ring-1 ring-[color-mix(in_oklch,var(--layer-silver)_30%,white)]',
        gold:
          'bg-[var(--layer-gold-soft)] text-[oklch(0.38_0.10_85)] ring-1 ring-[color-mix(in_oklch,var(--layer-gold)_30%,white)]',

        // Classification (10-tier higher-ed public safety)
        public:
          'bg-[var(--class-public-soft)] text-[oklch(0.38_0.12_155)] ring-1 ring-[color-mix(in_oklch,var(--class-public)_30%,white)]',
        internal:
          'bg-[var(--class-internal-soft)] text-[oklch(0.38_0.12_235)] ring-1 ring-[color-mix(in_oklch,var(--class-internal)_30%,white)]',
        ferpa:
          'bg-[var(--class-ferpa-soft)] text-[oklch(0.35_0.14_290)] ring-1 ring-[color-mix(in_oklch,var(--class-ferpa)_30%,white)]',
        cji:
          'bg-[var(--class-cji-soft)] text-[var(--class-cji)] ring-1 ring-[color-mix(in_oklch,var(--class-cji)_30%,white)]',
        'title-ix':
          'bg-[var(--class-title-ix-soft)] text-[var(--class-title-ix)] ring-1 ring-[color-mix(in_oklch,var(--class-title-ix)_30%,white)]',
        counseling:
          'bg-[var(--class-counseling-soft)] text-[var(--class-counseling)] ring-1 ring-[color-mix(in_oklch,var(--class-counseling)_30%,white)]',
        pii:
          'bg-[var(--class-pii-soft)] text-[var(--class-pii)] ring-1 ring-[color-mix(in_oklch,var(--class-pii)_30%,white)]',
        phi:
          'bg-[var(--class-phi-soft)] text-[var(--class-phi)] ring-1 ring-[color-mix(in_oklch,var(--class-phi)_30%,white)]',
        juvenile:
          'bg-[var(--class-juvenile-soft)] text-[var(--class-juvenile)] ring-1 ring-[color-mix(in_oklch,var(--class-juvenile)_30%,white)]',
        'restricted-investigation':
          'bg-[var(--class-restricted-investigation-soft)] text-[var(--class-restricted-investigation)] ring-1 ring-[color-mix(in_oklch,var(--class-restricted-investigation)_30%,white)]',

        // Priority
        'p-1':
          'bg-[var(--priority-1-soft)] text-[var(--priority-1)] ring-1 ring-[color-mix(in_oklch,var(--priority-1)_30%,white)]',
        'p-2':
          'bg-[var(--priority-2-soft)] text-[oklch(0.42_0.13_60)] ring-1 ring-[color-mix(in_oklch,var(--priority-2)_30%,white)]',
        'p-3':
          'bg-[var(--priority-3-soft)] text-[oklch(0.42_0.12_100)] ring-1 ring-[color-mix(in_oklch,var(--priority-3)_30%,white)]',
        'p-4':
          'bg-[var(--priority-4-soft)] text-[var(--priority-4)] ring-1 ring-[color-mix(in_oklch,var(--priority-4)_30%,white)]',

        // Information-barrier indicator
        barrier:
          'bg-[var(--barrier-soft)] text-[var(--barrier)] ring-1 ring-[color-mix(in_oklch,var(--barrier)_30%,white)]',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { badgeVariants };
