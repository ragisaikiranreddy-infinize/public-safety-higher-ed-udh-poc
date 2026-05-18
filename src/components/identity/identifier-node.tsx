/**
 * Identifier node for the xyflow identity-resolution graph. One per source
 * identifier (SIS / OneCard / email / phone / license-plate / device-id /
 * emplid). Edge style depends on `matchMethod`:
 *   - deterministic-exact → solid
 *   - deterministic-fuzzy → dashed
 *   - probabilistic       → dashed amber, confidence label
 *
 * Per CLAUDE.md pitfall #2: node-data extends Record<string, unknown> via
 * intersection.
 */
import { Handle, Position } from '@xyflow/react';
import type { Classification } from '@/lib/types';
import { cn } from '@/lib/utils';

export type IdentifierNodeData = {
  label: string;
  source?: string;
  confidence?: number;
  matchMethod?: 'deterministic-exact' | 'deterministic-fuzzy' | 'probabilistic';
  classification?: Classification;
  kind: 'person' | 'identifier';
} & Record<string, unknown>;

const CLASS_COLOR: Record<string, string> = {
  'ferpa-edu-record': 'border-[var(--class-ferpa)]',
  cji: 'border-[var(--class-cji)]',
  pii: 'border-[var(--class-pii)]',
  'title-ix-sensitive': 'border-[var(--class-title-ix)]',
  internal: 'border-[var(--class-internal)]',
  public: 'border-[var(--class-public)]',
};

export function IdentifierNode({ data }: { data: IdentifierNodeData }) {
  const isPerson = data.kind === 'person';
  const ringClass = data.classification ? CLASS_COLOR[data.classification] : undefined;

  if (isPerson) {
    return (
      <div
        className="flex items-center justify-center rounded-full border-2 border-[var(--hub-600)] bg-[var(--hub-100)] px-4 py-3 font-display text-sm font-semibold text-[var(--hub-700)] shadow-md"
        style={{ width: 200 }}
      >
        <Handle type="source" position={Position.Top} className="!opacity-0" />
        <Handle type="source" position={Position.Right} className="!opacity-0" />
        <Handle type="source" position={Position.Bottom} className="!opacity-0" />
        <Handle type="source" position={Position.Left} className="!opacity-0" />
        <div className="text-center">
          <div className="text-[10px] font-medium uppercase tracking-wider text-[var(--hub-600)]">
            Master Person
          </div>
          <div className="mt-0.5 text-sm">{data.label}</div>
        </div>
      </div>
    );
  }

  const conf = data.confidence ?? 0;
  const confColor = conf >= 95 ? 'text-[var(--signal-green)]' : conf >= 80 ? 'text-[var(--hub-700)]' : 'text-[var(--signal-amber)]';

  return (
    <div
      className={cn(
        'rounded-md border-2 bg-[var(--card)] px-2.5 py-1.5 text-[10px] shadow-sm',
        ringClass ?? 'border-[var(--graphite-300)]',
      )}
      style={{ width: 180 }}
    >
      <Handle type="target" position={Position.Left} className="!opacity-0" />
      <Handle type="target" position={Position.Right} className="!opacity-0" />
      <Handle type="target" position={Position.Top} className="!opacity-0" />
      <Handle type="target" position={Position.Bottom} className="!opacity-0" />
      <div className="font-mono text-[var(--graphite-900)] whitespace-pre-line">{data.label}</div>
      <div className="mt-1 flex items-center justify-between gap-1">
        <span className="truncate text-[9px] text-[var(--muted-foreground)]">{data.source}</span>
        <span className={cn('tabular-nums font-semibold', confColor)}>{conf}%</span>
      </div>
    </div>
  );
}
