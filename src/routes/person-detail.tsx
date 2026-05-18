/**
 * /persons/:id — Person 360.
 *
 * Six tabs:
 *   Overview          — affiliations + identifiers + identity-resolution graph
 *   Incidents & Cases — every incident involving this person (role-masked)
 *   Vehicles          — registered vehicles
 *   BIT               — visible to BIT-chair + Dean; barrier indicator otherwise
 *   Title IX          — walled, visible only to Title IX coordinator
 *   AI Briefing       — placeholder (lands in R5)
 */
import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { PersonHeaderCard } from '@/components/person/person-header-card';
import { ClassificationBanner } from '@/components/person/classification-banner';
import { BarrierIndicator } from '@/components/data-display/barrier-indicator';
import { ClassificationBadge } from '@/components/data-display/classification-badge';
import { PriorityChip } from '@/components/data-display/priority-chip';
import { IdentityResolutionGraph } from '@/components/identity/identity-resolution-graph';
import {
  getPerson,
  incidentsByPerson,
  vehiclesByPerson,
  noContactOrdersByPerson,
  trespassOrdersByPerson,
} from '@/lib/mock-db';
import { useRole } from '@/lib/role-context';
import { evaluateBarrier } from '@/lib/information-barriers';
import { formatRelativeTime } from '@/lib/utils';
import { Sparkles } from 'lucide-react';
import NotFoundPage from './not-found';

export default function PersonDetailPage() {
  const { id = '' } = useParams<{ id: string }>();
  const person = getPerson(id);
  const [tab, setTab] = useState('overview');
  const { role, canSee } = useRole();

  if (!person) return <NotFoundPage />;

  const incidents = incidentsByPerson(person.id);
  const vehicles = vehiclesByPerson(person.id);
  const ncos = noContactOrdersByPerson(person.id);
  const trespasses = trespassOrdersByPerson(person.id);

  // BIT tab barrier
  const bitBarrier = evaluateBarrier({
    actorRole: role,
    fieldClassification: 'ferpa-edu-record',
    resourceKind: 'bit-case',
    resourceId: person.id,
  });

  // Title IX tab barrier
  const tixBarrier = evaluateBarrier({
    actorRole: role,
    fieldClassification: 'title-ix-sensitive',
    resourceKind: 'tix-case',
    resourceId: person.id,
  });

  return (
    <>
      <PageHeader
        eyebrow="People · Person 360"
        title={canSee(person.classificationTier) ? (person.fullName || person.id) : person.id}
        description={`Master Person Record resolved from ${person.resolvedFromSourceIds.length} source system(s). Merge confidence ${person.mergeConfidence}%.`}
      />

      <div className="space-y-6 px-8 py-6">
        <ClassificationBanner classification={person.classificationTier} />
        <PersonHeaderCard person={person} />

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="incidents">Incidents & Cases ({incidents.length})</TabsTrigger>
            <TabsTrigger value="vehicles">Vehicles ({vehicles.length})</TabsTrigger>
            <TabsTrigger value="bit">BIT {person.inOpenBITCase && '●'}</TabsTrigger>
            <TabsTrigger value="title-ix">Title IX {person.inOpenTitleIXCase && '●'}</TabsTrigger>
            <TabsTrigger value="ai">AI Briefing</TabsTrigger>
          </TabsList>

          {/* ===== Overview ===== */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader className="pb-3">
                  <CardTitle>Identity Resolution</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <IdentityResolutionGraph personId={person.id} />
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Identifiers ({person.identifiers.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-xs">
                    {person.identifiers.map((idr, i) => {
                      const masked = !canSee(idr.classification);
                      return (
                        <li key={i} className="flex items-start gap-2">
                          <Badge variant="muted" className="text-[9px]">{idr.kind}</Badge>
                          <div className="min-w-0 flex-1">
                            <div className="font-mono text-[var(--foreground)] truncate">
                              {masked ? <span className="text-[var(--barrier)]">[masked: {idr.classification}]</span> : idr.value}
                            </div>
                            <div className="text-[10px] text-[var(--muted-foreground)]">
                              {idr.source} · {idr.matchMethod} · {idr.confidence}%
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </CardContent>
              </Card>
              {ncos.length > 0 && (
                <Card className="lg:col-span-2">
                  <CardHeader className="pb-3">
                    <CardTitle>No-contact orders ({ncos.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-xs">
                      {ncos.map((o) => (
                        <li key={o.id} className="flex items-center justify-between rounded-md border p-2">
                          <div>
                            <div className="font-mono">{o.id}</div>
                            <div className="text-[10px] text-[var(--muted-foreground)]">
                              {o.scope} · issued by {o.issuingOffice} · {formatRelativeTime(new Date(o.issuedAt))}
                            </div>
                          </div>
                          <ClassificationBadge classification={o.classification} />
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
              {trespasses.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle>Trespass orders ({trespasses.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-xs">
                      {trespasses.map((o) => (
                        <li key={o.id} className="rounded-md border p-2">
                          <div className="font-mono">{o.id}</div>
                          <div className="text-[10px] text-[var(--muted-foreground)]">{o.scope}</div>
                          <div className="mt-1 text-[11px]">{o.rationale}</div>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* ===== Incidents & Cases ===== */}
          <TabsContent value="incidents">
            <Card>
              <CardContent className="p-0">
                {incidents.length === 0 ? (
                  <div className="p-6 text-center text-xs text-[var(--muted-foreground)]">
                    No incidents involve this person.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead className="border-b bg-[var(--graphite-50)]">
                        <tr>
                          <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Incident</th>
                          <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Call type</th>
                          <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Priority</th>
                          <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Building</th>
                          <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Received</th>
                          <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {incidents.map((inc) => {
                          const narMasked = !canSee(inc.classification);
                          return (
                            <tr key={inc.id} className="border-b last:border-0 hover:bg-[var(--graphite-50)]">
                              <td className="px-4 py-2">
                                <Link to={`/incidents/${encodeURIComponent(inc.id)}`} className="font-mono text-[var(--hub-700)] hover:underline">
                                  {inc.id}
                                </Link>
                              </td>
                              <td className="px-4 py-2">{narMasked ? <span className="text-[var(--barrier)]">[masked]</span> : inc.callType}</td>
                              <td className="px-4 py-2"><PriorityChip priority={inc.priority} compact /></td>
                              <td className="px-4 py-2 font-mono text-[10px] text-[var(--muted-foreground)]">{inc.buildingId ?? '—'}</td>
                              <td className="px-4 py-2 text-[10px] text-[var(--muted-foreground)]">{formatRelativeTime(new Date(inc.receivedAt))}</td>
                              <td className="px-4 py-2"><Badge variant="muted">{inc.status}</Badge></td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ===== Vehicles ===== */}
          <TabsContent value="vehicles">
            <Card>
              <CardContent className="p-0">
                {vehicles.length === 0 ? (
                  <div className="p-6 text-center text-xs text-[var(--muted-foreground)]">
                    No vehicles registered to this person.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead className="border-b bg-[var(--graphite-50)]">
                        <tr>
                          <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Vehicle</th>
                          <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Plate</th>
                          <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Make/Model</th>
                          <th className="px-4 py-2 text-left font-medium text-[var(--muted-foreground)]">Flags</th>
                        </tr>
                      </thead>
                      <tbody>
                        {vehicles.map((v) => {
                          const plateMasked = !canSee(v.plateClassification);
                          return (
                            <tr key={v.id} className="border-b last:border-0">
                              <td className="px-4 py-2 font-mono">{v.id}</td>
                              <td className="px-4 py-2 font-mono">
                                {plateMasked ? <span className="text-[var(--barrier)]">[CJI masked]</span> : `${v.plate} (${v.state})`}
                              </td>
                              <td className="px-4 py-2">{v.year} {v.make} {v.model} · {v.color}</td>
                              <td className="px-4 py-2">{v.isHotlisted && <Badge variant="danger">{v.hotlistReason}</Badge>}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ===== BIT ===== */}
          <TabsContent value="bit">
            {!person.inOpenBITCase ? (
              <Card>
                <CardContent className="p-6 text-center text-xs text-[var(--muted-foreground)]">
                  No BIT/CARE case is open for this person.
                </CardContent>
              </Card>
            ) : !bitBarrier.allowed ? (
              <Card className="border-[var(--barrier)]">
                <CardContent className="space-y-3 p-6 text-center">
                  <BarrierIndicator barrierId={bitBarrier.barrierHit?.id} size="md" />
                  <p className="text-sm text-[var(--foreground)]">
                    BIT involvement exists for this person, but content is withheld by an information barrier for the active role.
                  </p>
                  <p className="text-[11px] text-[var(--muted-foreground)]">
                    {bitBarrier.barrierHit?.description}
                  </p>
                  <p className="text-[11px] text-[var(--muted-foreground)]">
                    <strong>Override:</strong> {bitBarrier.barrierHit?.overridePath}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-6 text-center text-xs text-[var(--muted-foreground)]">
                  BIT case content lands in R5 with the full AI briefing component. For now: case ID
                  <code className="ml-1 font-mono">BIT-2026-0067</code>, risk level{' '}
                  <Badge variant="warning">elevated</Badge> trending high.
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* ===== Title IX ===== */}
          <TabsContent value="title-ix">
            {!person.inOpenTitleIXCase ? (
              <Card>
                <CardContent className="p-6 text-center text-xs text-[var(--muted-foreground)]">
                  No Title IX case involves this person.
                </CardContent>
              </Card>
            ) : !tixBarrier.allowed ? (
              <Card className="border-[var(--barrier)]">
                <CardContent className="space-y-3 p-6 text-center">
                  <BarrierIndicator barrierId={tixBarrier.barrierHit?.id} size="md" />
                  <p className="text-sm text-[var(--foreground)]">
                    Title IX content is walled for this role.{' '}
                    <strong>Coordinate with the Title IX Coordinator.</strong>
                  </p>
                  <p className="text-[11px] text-[var(--muted-foreground)]">
                    {tixBarrier.barrierHit?.description}
                  </p>
                  <Separator />
                  <p className="text-[11px] text-[var(--muted-foreground)]">
                    Switch role to <strong>Title IX Coordinator</strong> to see the underlying case detail.
                    This is the live information-barrier demo moment.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Title IX involvement</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">Case ID</span>
                    <div className="mt-0.5 font-mono">TIX-2026-0014</div>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">Status</span>
                    <div className="mt-0.5">Informal intake · no formal complaint filed · supportive measures in place</div>
                  </div>
                  <p className="text-[11px] text-[var(--muted-foreground)]">
                    Full case detail + supportive-measure tracking lands in R8 with the Title IX module.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* ===== AI Briefing ===== */}
          <TabsContent value="ai">
            <Card>
              <CardContent className="space-y-3 p-6 text-center">
                <Sparkles className="mx-auto h-8 w-8 text-[var(--hub-600)]" />
                <p className="text-sm font-semibold text-[var(--foreground)]">AI Briefing (R5)</p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  The multi-source AI briefing for this person lands in R5 with{' '}
                  <code className="font-mono">summarizeBITSubject()</code>. It will assemble a 7-bullet
                  summary from incidents · access patterns · tips · camera analytics · LMS engagement,
                  with NaBITA-aligned risk classification and barrier-aware citations.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
