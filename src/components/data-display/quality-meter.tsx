/**
 * <QualityMeter score detail? /> — composite DQ score with optional six-dim
 * breakdown bars.
 *
 * Layout: large composite number + six dimension rows (accuracy, completeness,
 * consistency, timeliness, uniqueness, validity), each a label + value + bar.
 */
import type { QualityScoreDetail } from '@/lib/types';
import { cn } from '@/lib/utils';

interface Props {
  score: number;
  detail?: QualityScoreDetail;
  className?: string;
  showLabel?: boolean;
}

const DIMENSIONS: { key: keyof QualityScoreDetail['dimensions']; label: string }[] = [
  { key: 'accuracy', label: 'Accuracy' },
  { key: 'completeness', label: 'Completeness' },
  { key: 'consistency', label: 'Consistency' },
  { key: 'timeliness', label: 'Timeliness' },
  { key: 'uniqueness', label: 'Uniqueness' },
  { key: 'validity', label: 'Validity' },
];

function scoreClass(v: number): string {
  if (v >= 95) return 'text-[var(--signal-green)]';
  if (v >= 85) return 'text-[var(--graphite-700)]';
  if (v >= 75) return 'text-[var(--signal-amber)]';
  return 'text-[var(--signal-red)]';
}

function barClass(v: number): string {
  if (v >= 95) return 'bg-[var(--signal-green)]';
  if (v >= 85) return 'bg-[var(--hub-600)]';
  if (v >= 75) return 'bg-[var(--signal-amber)]';
  return 'bg-[var(--signal-red)]';
}

export function QualityMeter({ score, detail, className, showLabel = true }: Props) {
  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-baseline gap-2">
        <span className={cn('font-display text-3xl font-semibold', scoreClass(score))}>
          {score}
        </span>
        <span className="text-xs text-[var(--muted-foreground)]">
          {showLabel ? '/ 100 composite' : '/ 100'}
        </span>
      </div>
      {detail && (
        <div className="space-y-1.5">
          {DIMENSIONS.map((dim) => {
            const v = detail.dimensions[dim.key];
            return (
              <div key={dim.key} className="flex items-center gap-3 text-xs">
                <span className="w-24 shrink-0 text-[var(--muted-foreground)]">
                  {dim.label}
                </span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--graphite-100)]">
                  <div
                    className={cn('h-full', barClass(v))}
                    style={{ width: `${v}%` }}
                  />
                </div>
                <span className={cn('w-8 text-right tabular-nums', scoreClass(v))}>{v}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
