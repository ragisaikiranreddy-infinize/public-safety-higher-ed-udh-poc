/**
 * <ASRGrid /> — the 20×4 crime/geography matrix for a reporting year.
 *
 * Each cell shows count + status. Cells with needsReview=true get an amber
 * border + warning chip. Clicking a non-zero cell calls onCellSelect.
 *
 * Thread C cell (sex-offense-rape × on-campus-residential) is highlighted
 * with an accent border when its anchor row passes through.
 */
import { Link } from 'react-router-dom';
import { AlertOctagon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { ASRWorkspaceRow, CleryCrimeCategory, CleryGeographyClass } from '@/lib/types';
import { cn } from '@/lib/utils';

const CRIMES: { id: CleryCrimeCategory; label: string; group: 'crime' | 'vawa' | 'arrest' | 'referral' }[] = [
  { id: 'murder-nonneg-manslaughter', label: 'Murder / non-negligent manslaughter', group: 'crime' },
  { id: 'negligent-manslaughter', label: 'Negligent manslaughter', group: 'crime' },
  { id: 'sex-offense-rape', label: 'Sex Offenses — Rape', group: 'crime' },
  { id: 'sex-offense-fondling', label: 'Sex Offenses — Fondling', group: 'crime' },
  { id: 'sex-offense-incest', label: 'Sex Offenses — Incest', group: 'crime' },
  { id: 'sex-offense-statutory', label: 'Sex Offenses — Statutory', group: 'crime' },
  { id: 'robbery', label: 'Robbery', group: 'crime' },
  { id: 'aggravated-assault', label: 'Aggravated assault', group: 'crime' },
  { id: 'burglary', label: 'Burglary', group: 'crime' },
  { id: 'motor-vehicle-theft', label: 'Motor vehicle theft', group: 'crime' },
  { id: 'arson', label: 'Arson', group: 'crime' },
  { id: 'domestic-violence', label: 'Domestic violence (VAWA)', group: 'vawa' },
  { id: 'dating-violence', label: 'Dating violence (VAWA)', group: 'vawa' },
  { id: 'stalking', label: 'Stalking (VAWA)', group: 'vawa' },
  { id: 'arrest-weapons', label: 'Arrest — Weapons', group: 'arrest' },
  { id: 'arrest-drug-abuse', label: 'Arrest — Drug abuse', group: 'arrest' },
  { id: 'arrest-liquor', label: 'Arrest — Liquor law', group: 'arrest' },
  { id: 'referral-weapons', label: 'Referral — Weapons', group: 'referral' },
  { id: 'referral-drug-abuse', label: 'Referral — Drug abuse', group: 'referral' },
  { id: 'referral-liquor', label: 'Referral — Liquor law', group: 'referral' },
];

const GEOS: CleryGeographyClass[] = ['on-campus', 'on-campus-residential', 'non-campus', 'public-property'];

const GEO_LABEL: Record<CleryGeographyClass, string> = {
  'on-campus': 'On-Campus',
  'on-campus-residential': 'On-Campus Residential',
  'non-campus': 'Non-Campus',
  'public-property': 'Public Property',
  'off-campus': 'Off-Campus',
  'tbd': 'TBD',
};

const GROUP_HEADERS: Record<'crime' | 'vawa' | 'arrest' | 'referral', string> = {
  crime: 'Criminal offenses',
  vawa: 'VAWA additions',
  arrest: 'Arrests',
  referral: 'Disciplinary referrals',
};

interface Props {
  year: number;
  rows: ASRWorkspaceRow[];
  onCellSelect?: (row: ASRWorkspaceRow) => void;
}

export function ASRGrid({ year, rows, onCellSelect }: Props) {
  // Index by (crime, geography)
  const index = new Map<string, ASRWorkspaceRow>();
  for (const row of rows) {
    index.set(`${row.crime}::${row.geography}`, row);
  }

  // Group crimes for visual hierarchy
  let lastGroup: typeof CRIMES[number]['group'] | null = null;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead className="border-b bg-[var(--graphite-50)]">
          <tr>
            <th className="px-3 py-2 text-left font-medium text-[var(--muted-foreground)]">Crime</th>
            {GEOS.map((g) => (
              <th key={g} className="px-3 py-2 text-center font-medium text-[var(--muted-foreground)]">
                {GEO_LABEL[g]}
              </th>
            ))}
            <th className="px-3 py-2 text-center font-medium text-[var(--muted-foreground)]">Row total</th>
          </tr>
        </thead>
        <tbody>
          {CRIMES.map((crime) => {
            const groupHeader = crime.group !== lastGroup;
            lastGroup = crime.group;
            const rowTotal = GEOS.reduce((s, g) => s + (index.get(`${crime.id}::${g}`)?.count ?? 0), 0);
            return (
              <>
                {groupHeader && (
                  <tr key={`hdr-${crime.group}`} className="bg-[var(--graphite-50)]/60">
                    <td colSpan={GEOS.length + 2} className="px-3 py-1.5 text-[9px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                      {GROUP_HEADERS[crime.group]}
                    </td>
                  </tr>
                )}
                <tr key={crime.id} className="border-b last:border-0">
                  <td className="px-3 py-2 text-[11px]">{crime.label}</td>
                  {GEOS.map((g) => {
                    const row = index.get(`${crime.id}::${g}`);
                    return (
                      <td key={g} className="px-3 py-2 text-center">
                        <Cell row={row} year={year} onSelect={onCellSelect} />
                      </td>
                    );
                  })}
                  <td className="px-3 py-2 text-center font-mono text-[11px] text-[var(--muted-foreground)]">
                    {rowTotal}
                  </td>
                </tr>
              </>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Cell({
  row,
  year,
  onSelect,
}: {
  row: ASRWorkspaceRow | undefined;
  year: number;
  onSelect?: (row: ASRWorkspaceRow) => void;
}) {
  if (!row) {
    return <span className="text-[var(--muted-foreground)]">—</span>;
  }
  const isThreadC = row.threadTag === 'C';
  const isZero = row.count === 0;

  const inner = (
    <div
      className={cn(
        'mx-auto inline-flex min-w-[3rem] flex-col items-center gap-0.5 rounded-md px-2 py-1.5 text-[11px] transition-colors',
        isZero && 'text-[var(--muted-foreground)]',
        !isZero && 'hover:bg-[var(--graphite-50)] cursor-pointer',
        row.needsReview && !isZero && 'border border-[var(--signal-amber)]/60 bg-[var(--signal-amber-soft)]/30',
        isThreadC && 'ring-2 ring-[var(--hub-500)]',
      )}
    >
      <div className="font-mono text-[14px] font-semibold tabular-nums">{row.count}</div>
      <div className="flex items-center gap-1">
        {row.needsReview && (
          <Badge variant="warning" className="text-[8px]">
            <AlertOctagon className="mr-0.5 h-2.5 w-2.5" /> review
          </Badge>
        )}
        {isThreadC && <Badge variant="accent" className="text-[8px]">Thread C</Badge>}
      </div>
    </div>
  );

  if (isZero) return inner;

  if (onSelect) {
    return (
      <button onClick={() => onSelect(row)} className="cursor-pointer border-0 bg-transparent p-0">
        {inner}
      </button>
    );
  }

  return <Link to={`/clery/asr/${year}?cell=${encodeURIComponent(row.id)}`}>{inner}</Link>;
}
