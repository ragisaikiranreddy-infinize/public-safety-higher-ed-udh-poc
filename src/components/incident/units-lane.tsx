/**
 * <UnitsLane unitIds /> — compact list of units assigned to an incident,
 * with call-sign, kind, and current status.
 */
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { getUnit, getOfficer } from '@/lib/mock-db';
import { Radio } from 'lucide-react';

interface Props {
  unitIds: string[];
  primaryOfficerId?: string;
}

export function UnitsLane({ unitIds, primaryOfficerId }: Props) {
  if (unitIds.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-[var(--border)] p-3 text-center text-xs text-[var(--muted-foreground)]">
        No units assigned yet.
      </div>
    );
  }
  return (
    <ul className="space-y-1.5">
      {unitIds.map((id) => {
        const u = getUnit(id);
        if (!u) return null;
        const isPrimaryHere = primaryOfficerId && u.assignedOfficerIds.includes(primaryOfficerId);
        return (
          <li
            key={id}
            className="flex items-center gap-3 rounded-md border bg-[var(--card)] p-2 text-xs"
          >
            <Radio className="h-4 w-4 text-[var(--graphite-500)]" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-mono font-semibold text-[var(--foreground)]">{u.callSign}</span>
                <Badge variant="muted" className="text-[9px]">{u.kind}</Badge>
                {isPrimaryHere && <Badge variant="accent" className="text-[9px]">primary</Badge>}
              </div>
              <div className="mt-0.5 text-[10px] text-[var(--muted-foreground)]">
                {u.assignedOfficerIds.map((oid) => {
                  const o = getOfficer(oid);
                  return o ? (
                    <Link key={oid} to={`#`} className="hover:underline">
                      {o.fullName}
                    </Link>
                  ) : null;
                }).reduce((acc, el, i, arr) => {
                  if (!el) return acc;
                  return [...acc, el, i < arr.length - 1 ? <span key={`s-${i}`}> · </span> : null];
                }, [] as React.ReactNode[])}
              </div>
            </div>
            <Badge
              variant={
                u.status === 'on-scene' ? 'success' :
                u.status === 'enroute' ? 'info' :
                u.status === 'transport' ? 'warning' :
                u.status === 'oos' ? 'danger' :
                'muted'
              }
              className="text-[9px]"
            >
              {u.status}
            </Badge>
          </li>
        );
      })}
    </ul>
  );
}
