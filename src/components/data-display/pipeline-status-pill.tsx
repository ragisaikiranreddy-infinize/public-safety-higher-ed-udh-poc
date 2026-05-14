/**
 * <PipelineStatusPill status="success|failed|running|delayed|blocked|scheduled" />
 */
import { Badge } from '@/components/ui/badge';
import type { PipelineStatus } from '@/lib/types';
import { cn } from '@/lib/utils';

const MAP: Record<PipelineStatus, { variant: Parameters<typeof Badge>[0]['variant']; label: string; pulse?: boolean }> = {
  success: { variant: 'success', label: 'Success' },
  failed: { variant: 'danger', label: 'Failed' },
  running: { variant: 'info', label: 'Running', pulse: true },
  delayed: { variant: 'warning', label: 'Delayed' },
  blocked: { variant: 'danger', label: 'Blocked' },
  scheduled: { variant: 'muted', label: 'Scheduled' },
};

export function PipelineStatusPill({ status }: { status: PipelineStatus }) {
  const m = MAP[status];
  return (
    <Badge
      variant={m.variant}
      className={cn(m.pulse && 'animate-pulse')}
    >
      {m.label}
    </Badge>
  );
}
