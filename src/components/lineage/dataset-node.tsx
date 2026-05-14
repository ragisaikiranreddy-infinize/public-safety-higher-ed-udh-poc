/**
 * Custom xyflow node for the Bronze → Silver → Gold lineage graph.
 *
 * Per CLAUDE.md pitfall #2: node-data must extend Record<string, unknown>
 * via intersection.
 */
import { Handle, Position } from '@xyflow/react';
import type { MedallionLayer } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

export type DatasetNodeData = {
  datasetId: string;
  layer: MedallionLayer;
  name: string;
  isFocus: boolean;
} & Record<string, unknown>;

const LAYER_RING: Record<MedallionLayer, string> = {
  bronze: 'ring-[var(--layer-bronze)]',
  silver: 'ring-[var(--layer-silver)]',
  gold: 'ring-[var(--layer-gold)]',
};

const LAYER_BG: Record<MedallionLayer, string> = {
  bronze: 'bg-[var(--layer-bronze-soft)]',
  silver: 'bg-[var(--layer-silver-soft)]',
  gold: 'bg-[var(--layer-gold-soft)]',
};

const LAYER_LABEL: Record<MedallionLayer, string> = {
  bronze: 'Bronze',
  silver: 'Silver',
  gold: 'Gold',
};

export function DatasetNode({ data }: { data: DatasetNodeData }) {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate(`/catalog/${encodeURIComponent(data.datasetId)}`)}
      className={cn(
        'cursor-pointer rounded-md border bg-[var(--card)] px-3 py-2 shadow-sm transition-shadow hover:shadow-md',
        LAYER_BG[data.layer],
        'ring-2',
        LAYER_RING[data.layer],
        data.isFocus && 'ring-[var(--hub-600)] ring-4',
      )}
      style={{ width: 220 }}
    >
      <Handle type="target" position={Position.Left} className="!bg-[var(--graphite-400)]" />
      <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
        {LAYER_LABEL[data.layer]}
      </div>
      <div className="mt-1 truncate text-xs font-mono text-[var(--graphite-900)]">
        {data.datasetId}
      </div>
      <div className="mt-1 truncate text-[11px] text-[var(--muted-foreground)]">
        {data.name}
      </div>
      <Handle type="source" position={Position.Right} className="!bg-[var(--graphite-400)]" />
    </div>
  );
}
