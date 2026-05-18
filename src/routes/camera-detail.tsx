/**
 * /cameras/:id — Camera detail.
 *
 * Header card + map focus + analytics event stream. The Thread A
 * loitering cluster surfaces here when viewing CAM-CARTER-N3.
 */
import { useParams, Link } from 'react-router-dom';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ClassificationBadge } from '@/components/data-display/classification-badge';
import { FreshnessPill } from '@/components/data-display/freshness-pill';
import { CampusMap, DEFAULT_LAYERS } from '@/components/map/campus-map';
import {
  getCamera,
  getBuilding,
  cameraEventsByCamera,
} from '@/lib/mock-db';
import { formatRelativeTime } from '@/lib/utils';
import { Camera as CameraIcon, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import NotFoundPage from './not-found';

export default function CameraDetailPage() {
  const { id = '' } = useParams<{ id: string }>();
  const camera = getCamera(id);

  const [layers, setLayers] = useState({ ...DEFAULT_LAYERS, cameras: true });

  if (!camera) return <NotFoundPage />;

  const building = camera.buildingId ? getBuilding(camera.buildingId) : undefined;
  const events = cameraEventsByCamera(camera.id);
  const isThreadA = camera.id === 'CAM-CARTER-N3';

  return (
    <>
      <PageHeader
        eyebrow={`Surveillance · ${camera.vendor}`}
        title={camera.name}
        description={building ? `${building.name} (${building.id})` : 'Exterior / public-property camera'}
        actions={
          <div className="flex items-center gap-2">
            <Badge variant="muted">{camera.kind}</Badge>
            {camera.hasAnalytics && <Badge variant="accent">analytics</Badge>}
            <Badge variant={camera.isOnline ? 'success' : 'danger'}>
              {camera.isOnline ? 'online' : 'offline'}
            </Badge>
          </div>
        }
      />

      <div className="space-y-6 px-8 py-6">
        {/* Map + identity */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardContent className="p-0">
              <CampusMap
                focusBuildingId={camera.buildingId}
                layers={layers}
                onLayersChange={setLayers}
                height={360}
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Identity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <Field label="ID" value={camera.id} mono />
              <Field label="Vendor" value={camera.vendor} />
              <Field label="Kind" value={camera.kind} />
              <Field
                label="FOV"
                value={`${camera.fovDeg}° at ${camera.azimuthDeg}°`}
              />
              <Field
                label="Location"
                value={`${camera.location.lat.toFixed(5)}, ${camera.location.lng.toFixed(5)}`}
                mono
              />
              <Separator />
              <Field
                label="Last seen"
                value=""
              >
                <FreshnessPill lastUpdatedIso={camera.lastSeenAt} />
              </Field>
              <div className="text-[10px] text-[var(--muted-foreground)]">
                Media stays in the VMS; the Hub stores metadata + analytics events only.
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live feed placeholder */}
        <Card className="border-dashed">
          <CardContent className="flex h-48 items-center justify-center text-center">
            <div>
              <CameraIcon className="mx-auto h-8 w-8 text-[var(--muted-foreground)]" />
              <div className="mt-2 text-sm font-medium text-[var(--foreground)]">Live feed placeholder</div>
              <div className="mt-1 text-[11px] text-[var(--muted-foreground)]">
                Per spec §15 out-of-scope: video media stays in the VMS. Hub renders metadata only.
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Thread A correlation banner */}
        {isThreadA && (
          <Card className="border-[var(--signal-amber)]">
            <CardContent className="flex items-start gap-3 p-4">
              <AlertCircle className="mt-0.5 h-5 w-5 text-[var(--signal-amber)]" />
              <div className="flex-1 text-sm">
                <span className="font-semibold text-[var(--foreground)]">Thread A loitering cluster.</span>{' '}
                11 loitering events at this camera between 22:00–02:00 over the past 60 days. The cluster correlates
                with the after-hours card-swipe pattern at{' '}
                <Link to="/access/buildings/BLD-CARTER-HALL" className="text-[var(--hub-700)] hover:underline">
                  Carter Hall (BLD-CARTER-HALL)
                </Link>
                . The BIT case briefing (R5) joins these signals with anonymous tips + prior conduct cases.
              </div>
            </CardContent>
          </Card>
        )}

        {/* Analytics events */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Analytics events ({events.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {events.length === 0 ? (
              <div className="p-6 text-center text-xs text-[var(--muted-foreground)]">
                No analytics events recorded.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="border-b bg-[var(--graphite-50)]">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Event ID</th>
                      <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Kind</th>
                      <th className="px-4 py-2 text-right font-medium text-[var(--muted-foreground)]">Confidence</th>
                      <th className="px-4 py-2 text-right font-medium text-[var(--muted-foreground)]">Duration</th>
                      <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">When</th>
                      <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Thread</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.slice(0, 30).map((e) => (
                      <tr key={e.id} className="border-b last:border-0">
                        <td className="px-4 py-2 font-mono text-[10px]">{e.id}</td>
                        <td className="px-4 py-2">
                          <Badge variant={e.analyticKind === 'loitering' ? 'warning' : 'muted'}>
                            {e.analyticKind}
                          </Badge>
                        </td>
                        <td className="px-4 py-2 text-right tabular-nums">
                          {(e.confidence * 100).toFixed(0)}%
                        </td>
                        <td className="px-4 py-2 text-right tabular-nums">{e.durationSec}s</td>
                        <td className="px-4 py-2 text-[10px] text-[var(--muted-foreground)]">
                          {formatRelativeTime(new Date(e.at))}
                        </td>
                        <td className="px-4 py-2">
                          {e.threadTag && <Badge variant="accent" className="text-[9px]">Thread {e.threadTag}</Badge>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-start gap-3 p-4 text-xs text-[var(--muted-foreground)]">
            <ClassificationBadge classification="restricted-investigation" />
            <span>
              All camera event rows are restricted-investigation. Visibility per active role.
            </span>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function Field({
  label, value, mono, children,
}: {
  label: string; value?: string; mono?: boolean; children?: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">{label}</div>
      <div className={`mt-0.5 ${mono ? 'font-mono' : ''} text-[var(--foreground)]`}>
        {children ?? value}
      </div>
    </div>
  );
}
