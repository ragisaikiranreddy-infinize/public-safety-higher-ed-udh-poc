/**
 * /access/buildings/:id — Building intelligence overlay.
 *
 * Layout:
 *   Header card  — building name + kind + region + shelter/generator flags
 *   Map focus    — campus map zoomed on this building (R4 layer toggles)
 *   Occupancy    — current estimate + capacity bar + 24-hr hourly histogram
 *   Cameras      — list of cameras serving this building
 *   Doors        — access-controlled doors with kind + ACS flag
 *   Access feed  — most recent door events (role-masked)
 *   Anomaly card — Thread A: 47 after-hours from a non-resident
 */

import { useParams, Link } from 'react-router-dom';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CampusMap, DEFAULT_LAYERS } from '@/components/map/campus-map';
import { ClassificationBadge } from '@/components/data-display/classification-badge';
import { FreshnessPill } from '@/components/data-display/freshness-pill';
import {
  getBuilding,
  camerasByBuilding,
  doorsByBuilding,
  blueLightsByBuilding,
  buildingOccupancyEstimate,
  buildingHourlySwipes,
  accessEventsByBuilding,
  accessAnomaliesByBuilding,
  getResidenceHall,
  getPerson,
} from '@/lib/mock-db';
import { useRole } from '@/lib/role-context';
import { Camera as CameraIcon, ShieldAlert, DoorOpen, Battery, Lightbulb } from 'lucide-react';
import { cn, formatRelativeTime } from '@/lib/utils';
import { useState } from 'react';
import NotFoundPage from './not-found';

export default function BuildingDetailPage() {
  const { id = '' } = useParams<{ id: string }>();
  const building = getBuilding(id);
  const { canSee } = useRole();

  const [layers, setLayers] = useState({ ...DEFAULT_LAYERS, doors: true });

  if (!building) return <NotFoundPage />;

  const cameras = camerasByBuilding(building.id);
  const doors = doorsByBuilding(building.id);
  const blueLights = blueLightsByBuilding(building.id);
  const occ = buildingOccupancyEstimate(building.id);
  const hourly = buildingHourlySwipes(building.id);
  const events = accessEventsByBuilding(building.id, 30);
  const anomalies = accessAnomaliesByBuilding(building.id);
  const rh = getResidenceHall(`RES-${building.id.replace('BLD-', '')}`);

  const occPct = Math.min(100, Math.round((occ.estimated / occ.capacity) * 100));
  const maxHourly = Math.max(1, ...hourly.map((h) => h.count));

  return (
    <>
      <PageHeader
        eyebrow={`Access · Building ${building.kind}`}
        title={building.name}
        description={building.primaryUseDescription ?? building.addressLine}
        actions={
          <div className="flex items-center gap-2">
            {building.hasBackupGenerator && (
              <Badge variant="success">
                <Battery className="h-3 w-3" />
                generator
              </Badge>
            )}
            {building.isShelterDesignated && <Badge variant="info">shelter</Badge>}
            {rh && (
              <Badge variant="muted">residence hall · {rh.capacity} beds</Badge>
            )}
          </div>
        }
      />

      <div className="space-y-6 px-8 py-6">
        {/* Map focus + occupancy strip */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardContent className="p-0">
              <CampusMap
                focusBuildingId={building.id}
                layers={layers}
                onLayersChange={setLayers}
                height={420}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Occupancy estimate</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="font-display text-4xl font-semibold text-[var(--foreground)]">
                  {occ.estimated.toLocaleString()}
                </div>
                <div className="text-xs text-[var(--muted-foreground)]">
                  / {occ.capacity.toLocaleString()} capacity · {occPct}%
                </div>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[var(--graphite-100)]">
                <div
                  className="h-full bg-[var(--hub-600)]"
                  style={{ width: `${occPct}%` }}
                />
              </div>
              <Separator />
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                  Hourly swipe pattern (30d)
                </div>
                <div className="mt-2 flex h-16 items-end gap-0.5">
                  {hourly.map((h) => (
                    <div
                      key={h.hour}
                      className="flex-1 flex flex-col-reverse"
                      title={`${h.hour.toString().padStart(2, '0')}:00 — ${h.count} swipes (${h.anomalyCount} anomalies)`}
                    >
                      <div
                        className={cn(
                          'rounded-t-sm',
                          h.anomalyCount > 0 ? 'bg-[var(--signal-amber)]' : 'bg-[var(--hub-500)]',
                        )}
                        style={{ height: `${(h.count / maxHourly) * 100}%` }}
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-1 flex justify-between text-[9px] text-[var(--muted-foreground)]">
                  <span>00</span>
                  <span>06</span>
                  <span>12</span>
                  <span>18</span>
                  <span>23</span>
                </div>
              </div>
              <div className="rounded-md bg-[var(--graphite-50)] p-2 text-[10px] text-[var(--muted-foreground)]">
                Decay model — {occ.contributors.map((c) => `${c.source} (${Math.round(c.weight * 100)}%)`).join(' · ')}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Anomaly highlight (Thread A surfaces) */}
        {anomalies.length > 0 && (
          <Card className={building.id === 'BLD-CARTER-HALL' ? 'border-[var(--signal-amber)]' : undefined}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>
                  Access anomalies (30d) · {anomalies.length}
                </CardTitle>
                {building.id === 'BLD-CARTER-HALL' && (
                  <Badge variant="warning">Thread A pattern</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                <Stat
                  label="After-hours"
                  value={anomalies.filter((a) => a.isAfterHours).length}
                  color="amber"
                />
                <Stat
                  label="Unusual-building"
                  value={anomalies.filter((a) => a.isUnusualBuilding).length}
                  color="amber"
                />
                <Stat
                  label="Anti-passback"
                  value={anomalies.filter((a) => a.isAntiPassback).length}
                  color="red"
                />
              </div>
              {building.id === 'BLD-CARTER-HALL' && (
                <div className="mt-3 rounded-md border border-[var(--signal-amber)] bg-[var(--signal-amber-soft)] p-3 text-xs">
                  <strong className="text-[var(--foreground)]">Thread A correlation:</strong> 47 of these
                  after-hours swipes trace to a single cardholder who does not live in this building. Multi-source
                  evidence (LiveSafe tips · camera loitering · prior conduct case) is assembled on the{' '}
                  <Link to="/persons/PER-008470" className="text-[var(--hub-700)] hover:underline">
                    BIT case briefing
                  </Link>
                  .
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Cameras + Doors + Blue lights */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <CameraIcon className="h-4 w-4" />
                Cameras ({cameras.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {cameras.length === 0 ? (
                <div className="text-xs text-[var(--muted-foreground)]">No cameras assigned.</div>
              ) : (
                <ul className="space-y-1.5">
                  {cameras.map((c) => (
                    <li key={c.id} className="flex items-center justify-between text-xs">
                      <Link to={`/cameras/${encodeURIComponent(c.id)}`} className="min-w-0 flex-1">
                        <div className="truncate font-mono">{c.id}</div>
                        <div className="truncate text-[10px] text-[var(--muted-foreground)]">{c.name}</div>
                      </Link>
                      <div className="flex shrink-0 items-center gap-1">
                        <Badge variant="muted" className="text-[9px]">{c.kind}</Badge>
                        <Badge variant={c.isOnline ? 'success' : 'danger'} className="text-[9px]">
                          {c.isOnline ? 'online' : 'offline'}
                        </Badge>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <DoorOpen className="h-4 w-4" />
                Doors ({doors.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {doors.length === 0 ? (
                <div className="text-xs text-[var(--muted-foreground)]">No access-controlled doors.</div>
              ) : (
                <ul className="space-y-1.5">
                  {doors.map((d) => (
                    <li key={d.id} className="text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-mono">{d.id}</span>
                        <Badge variant="muted" className="text-[9px]">{d.kind}</Badge>
                        {d.isAdaActuator && <Badge variant="info" className="text-[9px]">ADA</Badge>}
                        {d.controlledByAcs && <Badge variant="accent" className="text-[9px]">ACS</Badge>}
                      </div>
                      <div className="text-[10px] text-[var(--muted-foreground)]">{d.name}</div>
                      {d.postedHours && (
                        <div className="text-[9px] text-[var(--muted-foreground)]">{d.postedHours}</div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                Blue lights ({blueLights.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {blueLights.length === 0 ? (
                <div className="text-xs text-[var(--muted-foreground)]">None proximate.</div>
              ) : (
                <ul className="space-y-1.5">
                  {blueLights.map((b) => (
                    <li key={b.id} className="text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-mono">{b.id}</span>
                        <Badge variant={b.isOnline ? 'success' : 'danger'} className="text-[9px]">
                          {b.isOnline ? 'online' : 'offline'}
                        </Badge>
                      </div>
                      <div className="text-[10px] text-[var(--muted-foreground)]">{b.name}</div>
                      <div className="text-[9px] text-[var(--muted-foreground)]">
                        last heartbeat <FreshnessPill lastUpdatedIso={b.lastHeartbeatAt} />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Access feed */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Recent access events ({events.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="border-b bg-[var(--graphite-50)]">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Door</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Cardholder</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Event</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Flags</th>
                    <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">When</th>
                  </tr>
                </thead>
                <tbody>
                  {events.slice(0, 30).map((e) => {
                    const masked = !canSee(e.classification);
                    const p = e.personId ? getPerson(e.personId) : undefined;
                    return (
                      <tr key={e.id} className="border-b last:border-0">
                        <td className="px-4 py-2 font-mono">{e.doorId}</td>
                        <td className="px-4 py-2">
                          {masked ? (
                            <span className="text-[var(--barrier)]">[PII masked]</span>
                          ) : p ? (
                            <Link to={`/persons/${encodeURIComponent(p.id)}`} className="text-[var(--hub-700)] hover:underline">
                              {p.id}
                            </Link>
                          ) : (
                            <span className="font-mono text-[10px] text-[var(--muted-foreground)]">{e.cardholderToken}</span>
                          )}
                        </td>
                        <td className="px-4 py-2">
                          <Badge
                            variant={
                              e.kind === 'granted' ? 'muted' :
                              e.kind === 'denied' ? 'danger' :
                              e.kind === 'forced' ? 'danger' :
                              e.kind === 'propped' ? 'warning' :
                              'muted'
                            }
                          >
                            {e.kind}
                          </Badge>
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex flex-wrap gap-1">
                            {e.isAfterHours && <Badge variant="warning" className="text-[9px]">after-hours</Badge>}
                            {e.isUnusualBuilding && <Badge variant="warning" className="text-[9px]">unusual-bldg</Badge>}
                            {e.isAntiPassback && <Badge variant="danger" className="text-[9px]">anti-passback</Badge>}
                          </div>
                        </td>
                        <td className="px-4 py-2 text-[10px] text-[var(--muted-foreground)]">
                          {formatRelativeTime(new Date(e.at))}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-start gap-3 p-4 text-xs text-[var(--muted-foreground)]">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              Classification:&nbsp;
              <ClassificationBadge classification="pii" />
              &nbsp;Access-event rows are PII-classified and masked per active role.
              Switch role to <strong>Executive</strong> to see cardholder columns mask in place.
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color?: 'amber' | 'red' }) {
  return (
    <div className="rounded-md border p-3 text-center">
      <div className={cn(
        'font-display text-2xl font-semibold',
        color === 'amber' && 'text-[var(--signal-amber)]',
        color === 'red' && 'text-[var(--signal-red)]',
        !color && 'text-[var(--foreground)]',
      )}>
        {value}
      </div>
      <div className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)]">{label}</div>
    </div>
  );
}
