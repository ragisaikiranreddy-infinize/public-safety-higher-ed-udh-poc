/**
 * /vehicles/:id — Master Vehicle Record detail.
 *
 * Plate is CJI-masked for non-CJI roles. Links to owner Person 360.
 */
import { Link, useParams } from 'react-router-dom';
import { Bus, AlertTriangle } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ClassificationBadge } from '@/components/data-display/classification-badge';
import { VEHICLES, getPerson } from '@/lib/mock-db';
import { useRole } from '@/lib/role-context';
import NotFoundPage from './not-found';

export default function VehicleDetailPage() {
  const { id = '' } = useParams<{ id: string }>();
  const v = VEHICLES.find((veh) => veh.id === id);
  if (!v) return <NotFoundPage />;

  const { canSee } = useRole();
  const plateMasked = !canSee(v.plateClassification);
  const owner = v.registeredToPersonId ? getPerson(v.registeredToPersonId) : null;

  return (
    <>
      <PageHeader
        eyebrow="People · Vehicle"
        title={v.id}
        description={`${v.year} ${v.make} ${v.model} · ${v.color}`}
      />

      <div className="space-y-6 px-8 py-6">
        <Card>
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="flex items-center gap-3">
              <Bus className="h-4 w-4 text-[var(--hub-700)]" />
              <ClassificationBadge classification={v.plateClassification} />
              {v.isHotlisted && (
                <Badge variant="danger" className="text-[10px]">
                  <AlertTriangle className="mr-1 h-3 w-3" />
                  {v.hotlistReason}
                </Badge>
              )}
            </div>
            <div className="font-mono text-xs">
              {plateMasked ? (
                <span className="text-[var(--barrier)]">[CJI masked]</span>
              ) : (
                <>
                  {v.plate} <span className="text-[var(--muted-foreground)]">({v.state})</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Vehicle</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-y-2 text-xs">
                <dt className="text-[var(--muted-foreground)]">Make</dt>
                <dd className="font-medium">{v.make}</dd>
                <dt className="text-[var(--muted-foreground)]">Model</dt>
                <dd className="font-medium">{v.model}</dd>
                <dt className="text-[var(--muted-foreground)]">Year</dt>
                <dd className="font-medium tabular-nums">{v.year}</dd>
                <dt className="text-[var(--muted-foreground)]">Color</dt>
                <dd className="font-medium">{v.color}</dd>
                <dt className="text-[var(--muted-foreground)]">State</dt>
                <dd className="font-mono">{v.state}</dd>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Registered owner</CardTitle>
            </CardHeader>
            <CardContent>
              {owner ? (
                <Link to={`/persons/${encodeURIComponent(owner.id)}`} className="block rounded-md border bg-[var(--card)] p-3 hover:bg-[var(--graphite-50)]">
                  <div className="font-mono text-[11px]">{owner.id}</div>
                  <div className="mt-0.5 text-xs font-medium">{owner.fullName}</div>
                  <div className="mt-0.5 flex flex-wrap gap-1">
                    {owner.affiliations.map((a) => (
                      <Badge key={a} variant="muted" className="text-[9px]">{a}</Badge>
                    ))}
                  </div>
                </Link>
              ) : (
                <div className="rounded-md border border-dashed p-3 text-center text-[11px] text-[var(--muted-foreground)]">
                  No registered owner — plate read against state DMV pending.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="space-y-1 p-4 text-[11px] text-[var(--muted-foreground)]">
            <p>
              Parking permits + LPR detections are tracked in the source systems and remain out-of-scope for the POC.
              The Hub keeps the canonical Vehicle record + hotlist state.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
