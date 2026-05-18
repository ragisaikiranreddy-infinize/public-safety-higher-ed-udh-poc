/**
 * /incidents/:id — Incident 360.
 *
 * Layout:
 *   Header card  — incident id + cfs# + RMS case# + status + priority + Clery class
 *   Timeline     — received → dispatched → enroute → on-scene → cleared
 *   Units lane   — units assigned + primary officer
 *   People panel — reporter / involved persons (role-masked)
 *   Geofence     — location, building, Clery class, related cameras/doors (R4 placeholder)
 *   NIBRS + ASR  — NIBRS codes, Clery reportability, ASR line linkage
 */
import { useParams, Link } from 'react-router-dom';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { PriorityChip } from '@/components/data-display/priority-chip';
import { ClassificationBadge } from '@/components/data-display/classification-badge';
import { FreshnessPill } from '@/components/data-display/freshness-pill';
import { IncidentTimeline } from '@/components/incident/incident-timeline';
import { UnitsLane } from '@/components/incident/units-lane';
import { ClassificationBanner } from '@/components/person/classification-banner';
import { getIncident, getBuilding, getOfficer, getPerson } from '@/lib/mock-db';
import { useRole } from '@/lib/role-context';
import { MapPin, Camera, DoorOpen, Bell } from 'lucide-react';
import NotFoundPage from './not-found';

export default function IncidentDetailPage() {
  const { id = '' } = useParams<{ id: string }>();
  const incident = getIncident(id);
  const { canSee } = useRole();

  if (!incident) return <NotFoundPage />;

  const building = incident.buildingId ? getBuilding(incident.buildingId) : undefined;
  const primary = incident.primaryOfficerId ? getOfficer(incident.primaryOfficerId) : undefined;
  const reporter = incident.reportedByPersonId ? getPerson(incident.reportedByPersonId) : undefined;

  return (
    <>
      <PageHeader
        eyebrow={`Incidents · ${incident.cfsNumber}`}
        title={incident.id}
        description={`${incident.callType} incident${building ? ` at ${building.name}` : ''}.`}
        actions={
          <div className="flex items-center gap-2">
            <PriorityChip priority={incident.priority} />
            <Badge
              variant={
                incident.status === 'open' ? 'danger' :
                incident.status === 'on-scene' ? 'warning' :
                incident.status === 'cleared' ? 'success' :
                'muted'
              }
            >
              {incident.status}
            </Badge>
            <FreshnessPill lastUpdatedIso={incident.receivedAt} />
          </div>
        }
      />

      <div className="space-y-6 px-8 py-6">
        <ClassificationBanner classification={incident.classification} />

        {/* Key facts strip */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <KpiBox label="CFS #" value={incident.cfsNumber} mono />
          <KpiBox label="RMS case #" value={incident.rmsCaseNumber ?? '— (not promoted)'} mono />
          <KpiBox label="Clery class" value={incident.cleryGeographyClass} />
          <KpiBox label="Reportable" value={incident.cleryReportable ? 'YES' : 'no'} />
        </div>

        {/* 3-column: timeline | units | geofence/related */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <IncidentTimeline incident={incident} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Units ({incident.assignedUnitIds.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <UnitsLane unitIds={incident.assignedUnitIds} primaryOfficerId={incident.primaryOfficerId} />
              {primary && (
                <>
                  <Separator className="my-3" />
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                    Primary officer
                  </div>
                  <div className="mt-1 text-sm">{primary.fullName}</div>
                  <div className="text-[10px] text-[var(--muted-foreground)]">
                    Badge {primary.badgeNumber} · {primary.rank}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Geofence</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              {building ? (
                <Link to={`#`} className="block rounded-md border p-2 transition-colors hover:bg-[var(--graphite-50)]">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-[var(--graphite-500)]" />
                    <span className="font-semibold">{building.name}</span>
                  </div>
                  <div className="mt-1 font-mono text-[10px] text-[var(--muted-foreground)]">{building.id}</div>
                  <div className="text-[10px] text-[var(--muted-foreground)]">{building.addressLine}</div>
                </Link>
              ) : (
                <div className="rounded-md border border-dashed p-2 text-center text-[10px] text-[var(--muted-foreground)]">
                  No building resolved (public-property or off-campus).
                </div>
              )}
              <div className="mt-3 grid grid-cols-1 gap-1.5">
                <RelatedRow icon={Camera} label="Related cameras" count={incident.relatedCameraIds.length} placeholder="R4" />
                <RelatedRow icon={DoorOpen} label="Related door events" count={incident.relatedDoorEventIds.length} placeholder="R4" />
                <RelatedRow icon={Bell} label="Notification campaigns" count={incident.relatedCampaignIds.length} placeholder="R6" />
              </div>
              <Separator className="my-2" />
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">Lat/lng</div>
                <div className="mt-0.5 font-mono">{incident.location.lat.toFixed(5)}, {incident.location.lng.toFixed(5)}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* People + Compliance row */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>People involved</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {reporter && (
                <div className="rounded-md border p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">Reporter</div>
                  <Link to={`/persons/${encodeURIComponent(reporter.id)}`} className="font-mono text-xs text-[var(--hub-700)] hover:underline">
                    {reporter.id}
                  </Link>
                  <span className="ml-2 text-[10px] text-[var(--muted-foreground)]">
                    {canSee(reporter.classificationTier) ? reporter.fullName : '[FERPA masked]'}
                  </span>
                </div>
              )}
              {incident.involvedPersonIds.length === 0 ? (
                <div className="text-xs text-[var(--muted-foreground)]">No additional persons recorded.</div>
              ) : (
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                    Involved ({incident.involvedPersonIds.length})
                  </div>
                  <ul className="mt-1 space-y-1">
                    {incident.involvedPersonIds.map((pid) => {
                      const p = getPerson(pid);
                      if (!p) return null;
                      return (
                        <li key={pid} className="flex items-center gap-2 text-xs">
                          <Link to={`/persons/${encodeURIComponent(pid)}`} className="font-mono text-[var(--hub-700)] hover:underline">
                            {pid}
                          </Link>
                          <span className="text-[10px] text-[var(--muted-foreground)]">
                            {canSee(p.classificationTier) ? p.fullName : '[FERPA masked]'}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Compliance + classification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <Field label="NIBRS codes">
                <div className="flex flex-wrap gap-1">
                  {incident.nibrsOffenseCodes.length === 0 && <span className="text-[10px] text-[var(--muted-foreground)]">none</span>}
                  {incident.nibrsOffenseCodes.map((c) => (
                    <Badge key={c} variant="outline">{c}</Badge>
                  ))}
                </div>
              </Field>
              <Field label="Clery geography">
                <Badge variant="muted">{incident.cleryGeographyClass}</Badge>
              </Field>
              <Field label="Clery reportable">
                {incident.cleryReportable ? (
                  <Badge variant="warning">YES — feeds Annual Security Report</Badge>
                ) : (
                  <span className="text-[10px] text-[var(--muted-foreground)]">not reportable</span>
                )}
              </Field>
              <Field label="Timely Warning issued">
                {incident.timelyWarningIssued ? (
                  <Badge variant="success">issued · {incident.timelyWarningDecisionId ?? 'decision ID pending'}</Badge>
                ) : (
                  <span className="text-[10px] text-[var(--muted-foreground)]">not issued</span>
                )}
              </Field>
              <Field label="Classification">
                <ClassificationBadge classification={incident.classification} />
              </Field>
              {incident.asrLineItemIds.length > 0 && (
                <Field label="ASR lines">
                  <div className="flex flex-wrap gap-1">
                    {incident.asrLineItemIds.map((id) => (
                      <Badge key={id} variant="outline">{id}</Badge>
                    ))}
                  </div>
                </Field>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Narrative (role-masked) */}
        {incident.narrative && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Officer narrative</CardTitle>
            </CardHeader>
            <CardContent>
              {canSee('restricted-investigation') ? (
                <p className="text-sm text-[var(--foreground)] whitespace-pre-wrap">{incident.narrative}</p>
              ) : (
                <div className="rounded-md border border-[var(--barrier)] bg-[var(--barrier-soft)] p-3 text-center text-xs text-[var(--barrier)]">
                  Narrative withheld — active-investigation hold barrier.
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}

function KpiBox({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">{label}</div>
        <div className={`mt-1 ${mono ? 'font-mono text-sm' : 'font-display text-lg font-semibold'} text-[var(--foreground)]`}>
          {value}
        </div>
      </CardContent>
    </Card>
  );
}

function RelatedRow({ icon: Icon, label, count, placeholder }: { icon: React.ElementType; label: string; count: number; placeholder?: string }) {
  return (
    <div className="flex items-center gap-2 text-[11px]">
      <Icon className="h-3.5 w-3.5 text-[var(--graphite-500)]" />
      <span className="flex-1 text-[var(--muted-foreground)]">{label}</span>
      <span className="tabular-nums text-[var(--foreground)]">
        {count} {placeholder && count === 0 && <span className="text-[9px] text-[var(--muted-foreground)]">({placeholder})</span>}
      </span>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">{label}</div>
      <div className="mt-1">{children}</div>
    </div>
  );
}
