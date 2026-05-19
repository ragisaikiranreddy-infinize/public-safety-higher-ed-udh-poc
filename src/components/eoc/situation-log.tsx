/**
 * <SituationLog /> — chronological factual log for an activation.
 *
 * Each entry shows the time-offset from activation start, an icon-coded kind,
 * the narrative, and any referenced IDs (rendered as deep-link badges).
 */
import { Link } from 'react-router-dom';
import {
  AlertTriangle, Radio, Lock, Unlock, PlayCircle, CheckCircle2,
  Activity, Truck, MessageSquare, BookOpen, FileText,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { SitLogEntry, SitLogEntryKind } from '@/lib/types';
import { cn } from '@/lib/utils';

const ICON_MAP: Record<SitLogEntryKind, React.ElementType> = {
  'alert-received': AlertTriangle,
  'activation-opened': PlayCircle,
  'campaign-sent': Radio,
  'lockdown-initiated': Lock,
  'lockdown-released': Unlock,
  'runbook-started': BookOpen,
  'runbook-step-completed': CheckCircle2,
  'iot-anomaly': Activity,
  'unit-assigned': Truck,
  'general-observation': MessageSquare,
  'decision': FileText,
  'activation-closed': CheckCircle2,
};

const COLOR_MAP: Record<SitLogEntryKind, string> = {
  'alert-received': 'text-[var(--signal-red)]',
  'activation-opened': 'text-[var(--signal-amber)]',
  'campaign-sent': 'text-[var(--signal-blue)]',
  'lockdown-initiated': 'text-[var(--signal-red)]',
  'lockdown-released': 'text-[var(--signal-green)]',
  'runbook-started': 'text-[var(--signal-blue)]',
  'runbook-step-completed': 'text-[var(--signal-green)]',
  'iot-anomaly': 'text-[var(--signal-amber)]',
  'unit-assigned': 'text-[var(--graphite-900)]',
  'general-observation': 'text-[var(--muted-foreground)]',
  'decision': 'text-[var(--hub-700)]',
  'activation-closed': 'text-[var(--signal-green)]',
};

interface Props {
  entries: SitLogEntry[];
  /** Activation open time — used to render T+offsets. */
  activationOpenedAt: string;
}

export function SituationLog({ entries, activationOpenedAt }: Props) {
  const t0 = new Date(activationOpenedAt).getTime();

  if (entries.length === 0) {
    return <p className="text-xs text-[var(--muted-foreground)]">No log entries yet.</p>;
  }

  return (
    <ol className="space-y-3">
      {entries.map((e) => {
        const Icon = ICON_MAP[e.kind];
        const offsetSec = Math.round((new Date(e.at).getTime() - t0) / 1000);
        const offsetLabel = offsetSec < 60
          ? `T+${offsetSec}s`
          : offsetSec < 3600
          ? `T+${Math.floor(offsetSec / 60)}m`
          : `T+${(offsetSec / 3600).toFixed(1)}h`;

        return (
          <li key={e.id} className="flex gap-3">
            <div className="flex flex-col items-center pt-0.5">
              <Icon className={cn('h-4 w-4', COLOR_MAP[e.kind])} />
              <span className="mt-1 font-mono text-[9px] text-[var(--muted-foreground)]">{offsetLabel}</span>
            </div>
            <div className="min-w-0 flex-1 rounded-md border bg-[var(--card)] p-2.5 text-xs">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[9px]">{e.kind}</Badge>
                {e.authorRole && (
                  <span className="text-[10px] text-[var(--muted-foreground)]">
                    by <span className="font-mono">{e.authorRole}</span>
                  </span>
                )}
              </div>
              <p className="mt-1 leading-relaxed">{e.text}</p>
              {e.references && e.references.length > 0 && (
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {e.references.map((r) => (
                    <ReferenceChip key={r} refId={r} />
                  ))}
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function ReferenceChip({ refId }: { refId: string }) {
  // Route the chip based on the ID prefix.
  let to: string | undefined;
  if (refId.startsWith('MNP-')) to = `/notifications/${encodeURIComponent(refId)}`;
  else if (refId.startsWith('RBX-')) to = `/runbooks/${encodeURIComponent(refId)}/run`;
  else if (refId.startsWith('NWS-')) to = `/eoc`;
  else if (refId.startsWith('LOCK-')) to = `/access/lockdowns`;
  else if (refId.startsWith('BMS-')) to = `/facilities`;
  else if (refId.startsWith('RTE-')) to = `/transit`;
  else if (refId.startsWith('DEC-')) to = undefined;

  if (!to) {
    return (
      <Badge variant="muted" className="font-mono text-[10px]">{refId}</Badge>
    );
  }

  return (
    <Link
      to={to}
      className="inline-flex items-center rounded-md border bg-[var(--card)] px-1.5 py-0.5 font-mono text-[10px] hover:bg-[var(--graphite-50)]"
    >
      {refId}
    </Link>
  );
}
