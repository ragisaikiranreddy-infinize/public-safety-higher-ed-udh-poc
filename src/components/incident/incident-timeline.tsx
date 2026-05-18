/**
 * <IncidentTimeline incident /> — vertical timeline of the CAD lifecycle:
 *   received → dispatched → enroute → on-scene → cleared
 *
 * Renders elapsed deltas between each stage and the resulting response time
 * (received → on-scene minutes).
 */
import { CheckCircle2, Clock } from 'lucide-react';
import type { Incident } from '@/lib/types';
import { formatRelativeTime } from '@/lib/utils';

interface Stop {
  key: keyof Pick<
    Incident,
    'receivedAt' | 'dispatchedAt' | 'enrouteAt' | 'onSceneAt' | 'clearedAt'
  >;
  label: string;
}

const STOPS: Stop[] = [
  { key: 'receivedAt', label: 'Received' },
  { key: 'dispatchedAt', label: 'Dispatched' },
  { key: 'enrouteAt', label: 'Enroute' },
  { key: 'onSceneAt', label: 'On scene' },
  { key: 'clearedAt', label: 'Cleared' },
];

function deltaMin(a?: string, b?: string): string | null {
  if (!a || !b) return null;
  const ms = new Date(b).getTime() - new Date(a).getTime();
  const sec = Math.round(ms / 1000);
  if (sec < 60) return `${sec}s`;
  return `${(sec / 60).toFixed(1)}m`;
}

export function IncidentTimeline({ incident }: { incident: Incident }) {
  return (
    <ol className="relative space-y-3 pl-7">
      <div className="absolute left-3 top-0 h-full w-0.5 bg-[var(--graphite-200)]" />
      {STOPS.map((s) => {
        const ts = incident[s.key];
        const reached = !!ts;
        return (
          <li key={s.key} className="relative">
            <div className="absolute -left-[28px] top-0 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--card)]">
              {reached ? (
                <CheckCircle2 className="h-4 w-4 text-[var(--signal-green)]" />
              ) : (
                <Clock className="h-4 w-4 text-[var(--graphite-400)]" />
              )}
            </div>
            <div className="flex items-baseline justify-between gap-2">
              <span
                className={
                  reached ? 'text-sm font-semibold text-[var(--foreground)]' : 'text-sm text-[var(--muted-foreground)]'
                }
              >
                {s.label}
              </span>
              {ts && (
                <span className="font-mono text-[10px] text-[var(--muted-foreground)]">
                  {formatRelativeTime(new Date(ts))}
                </span>
              )}
            </div>
            {ts && (
              <div className="mt-0.5 text-[10px] text-[var(--muted-foreground)]">
                {new Date(ts).toLocaleString()}
              </div>
            )}
          </li>
        );
      })}
      {/* Response time summary */}
      {incident.receivedAt && incident.onSceneAt && (
        <li className="ml-1 mt-2 rounded-md border border-[var(--border)] bg-[var(--graphite-50)] p-2 text-[11px]">
          <span className="font-semibold text-[var(--foreground)]">Response time:</span>{' '}
          <span className="font-mono text-[var(--signal-green)]">
            {deltaMin(incident.receivedAt, incident.onSceneAt)}
          </span>
        </li>
      )}
    </ol>
  );
}
