/**
 * <ICSGrid /> — ICS 207 (assignment list) — 8 seats in a 4×2 grid.
 *
 * Unfilled seats render with a warning chip; filled seats deep-link to the
 * assigned person's Person 360.
 */
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import type { ICSAssignment } from '@/lib/types';
import { getPerson } from '@/lib/mock-db';
import { cn } from '@/lib/utils';

const POSITION_LABEL: Record<ICSAssignment['position'], string> = {
  'incident-commander': 'Incident Commander',
  'public-information-officer': 'Public Information Officer',
  'safety-officer': 'Safety Officer',
  'liaison-officer': 'Liaison Officer',
  'operations-section-chief': 'Operations Section Chief',
  'planning-section-chief': 'Planning Section Chief',
  'logistics-section-chief': 'Logistics Section Chief',
  'finance-section-chief': 'Finance Section Chief',
};

interface Props {
  ics: ICSAssignment[];
}

export function ICSGrid({ ics }: Props) {
  // Index by position for stable ordering
  const byPos = new Map(ics.map((a) => [a.position, a]));
  const positions: ICSAssignment['position'][] = [
    'incident-commander', 'public-information-officer',
    'safety-officer', 'liaison-officer',
    'operations-section-chief', 'planning-section-chief',
    'logistics-section-chief', 'finance-section-chief',
  ];

  return (
    <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-4">
      {positions.map((pos) => {
        const a = byPos.get(pos);
        const unfilled = !a || a.isUnfilled;
        const person = a?.personId ? getPerson(a.personId) : undefined;
        return (
          <div
            key={pos}
            className={cn(
              'rounded-md border p-3 text-xs',
              unfilled ? 'border-[var(--signal-amber)] bg-[var(--signal-amber-soft)]/30' : 'bg-[var(--card)]',
            )}
          >
            <div className="text-[9px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
              {POSITION_LABEL[pos]}
            </div>
            <div className="mt-1">
              {unfilled ? (
                <Badge variant="warning" className="text-[10px]">Unfilled</Badge>
              ) : person ? (
                <Link
                  to={`/persons/${encodeURIComponent(person.id)}`}
                  className="font-mono text-[var(--hub-700)] hover:underline"
                >
                  {person.fullName ?? person.id}
                </Link>
              ) : (
                <span className="font-mono">{a?.personId}</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
