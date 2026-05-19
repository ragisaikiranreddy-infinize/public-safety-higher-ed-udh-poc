/**
 * <GeographyEditor /> — Clery polygon set viewer + audit history.
 *
 * R7 ships a read-only view: polygon table grouped by Clery class, side-by-
 * side audit timeline. Actual polygon editing (add/remove/reclassify) lands
 * post-POC.
 */
import { Link } from 'react-router-dom';
import { History, MapPin, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { CleryPolygonSet, CleryGeographyClass } from '@/lib/types';
import { formatRelativeTime, cn } from '@/lib/utils';

const CLASS_LABEL: Record<CleryGeographyClass, string> = {
  'on-campus': 'On-Campus',
  'on-campus-residential': 'On-Campus Residential',
  'non-campus': 'Non-Campus',
  'public-property': 'Public Property',
  'off-campus': 'Off-Campus',
  'tbd': 'TBD',
};

const CLASS_COLOR: Record<CleryGeographyClass, string> = {
  'on-campus': 'bg-[var(--signal-blue-soft)] text-[oklch(0.38_0.12_235)]',
  'on-campus-residential': 'bg-[var(--hub-100)] text-[var(--hub-700)]',
  'non-campus': 'bg-[var(--graphite-100)] text-[var(--graphite-900)]',
  'public-property': 'bg-[var(--signal-amber-soft)] text-[oklch(0.42_0.13_70)]',
  'off-campus': 'bg-[var(--graphite-100)] text-[var(--muted-foreground)]',
  'tbd': 'bg-[var(--graphite-100)] text-[var(--muted-foreground)]',
};

interface Props {
  polygonSet: CleryPolygonSet;
}

export function GeographyEditor({ polygonSet }: Props) {
  const classes: CleryGeographyClass[] = [
    'on-campus', 'on-campus-residential', 'non-campus', 'public-property',
  ];

  const grouped = new Map<CleryGeographyClass, typeof polygonSet.polygons>();
  classes.forEach((c) => {
    grouped.set(c, polygonSet.polygons.filter((p) => p.cleryClass === c));
  });

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        <Card>
          <CardContent className="space-y-3 p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[var(--hub-700)]" />
                <span className="font-mono text-[10px] text-[var(--muted-foreground)]">{polygonSet.id}</span>
              </div>
              {polygonSet.certifiedAt && (
                <Badge variant="success" className="text-[10px]">
                  <CheckCircle2 className="mr-0.5 h-3 w-3" /> certified {formatRelativeTime(new Date(polygonSet.certifiedAt))}
                </Badge>
              )}
            </div>
            <div className="font-display text-base font-semibold">{polygonSet.name}</div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {classes.map((c) => (
                <div key={c} className="rounded-md border bg-[var(--card)] p-3 text-xs">
                  <div className={cn('inline-block rounded-md px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider', CLASS_COLOR[c])}>
                    {CLASS_LABEL[c]}
                  </div>
                  <div className="mt-1 font-display text-2xl font-semibold tabular-nums">
                    {grouped.get(c)?.length ?? 0}
                  </div>
                  <div className="text-[10px] text-[var(--muted-foreground)]">polygons</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {classes.map((c) => {
          const polys = grouped.get(c) ?? [];
          if (polys.length === 0) return null;
          return (
            <Card key={c}>
              <CardContent className="space-y-2 p-5">
                <div className={cn('inline-block rounded-md px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider', CLASS_COLOR[c])}>
                  {CLASS_LABEL[c]} ({polys.length})
                </div>
                <ul className="space-y-1">
                  {polys.map((p) => (
                    <li key={p.id} className="flex items-center justify-between rounded-md border bg-[var(--card)] p-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-[var(--muted-foreground)]">{p.id}</span>
                        <span>{p.name}</span>
                      </div>
                      {p.buildingId && (
                        <Link to={`/access/buildings/${encodeURIComponent(p.buildingId)}`} className="font-mono text-[10px] text-[var(--hub-700)] hover:underline">
                          {p.buildingId}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardContent className="space-y-3 p-5">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-[var(--hub-700)]" />
            <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
              Audit history ({polygonSet.audit.length})
            </div>
          </div>
          <ol className="space-y-2.5">
            {polygonSet.audit.slice().reverse().map((entry) => (
              <li key={entry.id} className="rounded-md border bg-[var(--card)] p-2.5 text-xs">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[9px]">{entry.changeKind}</Badge>
                  <span className="font-mono text-[10px] text-[var(--muted-foreground)]">{entry.polygonId}</span>
                </div>
                <p className="mt-1 leading-relaxed">{entry.notes}</p>
                <div className="mt-1 text-[10px] text-[var(--muted-foreground)]">
                  by <span className="font-mono">{entry.authorPersonId}</span> · {formatRelativeTime(new Date(entry.at))}
                </div>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
