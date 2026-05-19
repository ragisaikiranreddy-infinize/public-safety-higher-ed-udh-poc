/**
 * <RiskGauge /> — NaBITA tier + trend pill + four-dimension stack.
 *
 * Uses simple CSS bars (no Recharts needed); each dimension is 0..10. The
 * tier is colored mild→critical and the trend arrow uses lucide.
 */
import { ArrowUpRight, ArrowRight, ArrowDownRight } from 'lucide-react';
import type { BITRiskTier, BITRiskTrend } from '@/lib/types';
import { cn } from '@/lib/utils';

const TIER_COLOR: Record<BITRiskTier, string> = {
  mild: 'bg-[var(--signal-green-soft)] text-[oklch(0.38_0.12_155)] ring-[color-mix(in_oklch,var(--signal-green)_30%,white)]',
  moderate: 'bg-[var(--signal-blue-soft)] text-[oklch(0.38_0.12_235)] ring-[color-mix(in_oklch,var(--signal-blue)_30%,white)]',
  elevated: 'bg-[var(--signal-amber-soft)] text-[oklch(0.42_0.13_70)] ring-[color-mix(in_oklch,var(--signal-amber)_30%,white)]',
  critical: 'bg-[var(--signal-red-soft)] text-[var(--signal-red)] ring-[color-mix(in_oklch,var(--signal-red)_30%,white)]',
};

const BAR_COLOR: Record<BITRiskTier, string> = {
  mild: 'bg-[var(--signal-green)]',
  moderate: 'bg-[var(--signal-blue)]',
  elevated: 'bg-[var(--signal-amber)]',
  critical: 'bg-[var(--signal-red)]',
};

interface Props {
  tier: BITRiskTier;
  trend: BITRiskTrend;
  nabita: {
    subject: number;
    target: number;
    environment: number;
    precipitating: number;
  };
  confidence?: number; // 0..100
  rationale?: string;
}

export function RiskGauge({ tier, trend, nabita, confidence, rationale }: Props) {
  const TrendIcon = trend === 'rising' ? ArrowUpRight : trend === 'falling' ? ArrowDownRight : ArrowRight;
  const dims: { label: string; value: number }[] = [
    { label: 'Subject', value: nabita.subject },
    { label: 'Target', value: nabita.target },
    { label: 'Environment', value: nabita.environment },
    { label: 'Precipitating', value: nabita.precipitating },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold uppercase tracking-wider ring-1',
            TIER_COLOR[tier],
          )}
        >
          {tier}
        </span>
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--muted-foreground)]">
          <TrendIcon className="h-3.5 w-3.5" />
          trending {trend}
        </span>
        {typeof confidence === 'number' && (
          <span className="text-[10px] text-[var(--muted-foreground)]">· {confidence}% confidence</span>
        )}
      </div>

      <div className="space-y-1.5">
        {dims.map((d) => (
          <div key={d.label} className="flex items-center gap-2">
            <div className="w-24 text-[10px] uppercase tracking-wider text-[var(--muted-foreground)]">{d.label}</div>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--graphite-100)]">
              <div
                className={cn('h-full rounded-full', BAR_COLOR[tier])}
                style={{ width: `${(d.value / 10) * 100}%` }}
              />
            </div>
            <div className="w-6 text-right font-mono text-[10px] text-[var(--foreground)]">{d.value}</div>
          </div>
        ))}
      </div>

      {rationale && (
        <p className="text-[11px] leading-relaxed text-[var(--muted-foreground)]">{rationale}</p>
      )}
    </div>
  );
}
