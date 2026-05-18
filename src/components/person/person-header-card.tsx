/**
 * <PersonHeaderCard person /> — top-of-page identity + flags strip for
 * Person 360. Surfaces the active no-contact / trespass / BIT / Title IX /
 * investigation flags, with information-barrier indicators where the
 * actor's role can't see the underlying detail.
 */
import { UserCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarrierIndicator } from '@/components/data-display/barrier-indicator';
import { ClassificationBadge } from '@/components/data-display/classification-badge';
import { useRole } from '@/lib/role-context';
import type { Person } from '@/lib/types';
import { evaluateBarrier } from '@/lib/information-barriers';

export function PersonHeaderCard({ person }: { person: Person }) {
  const { role, canSee } = useRole();

  // Apply masking on legal name + DOB per role.
  const legalNameMasked = !canSee('ferpa-edu-record');
  const dobMasked = !canSee('pii');

  // Title IX barrier evaluation — surfaces a barrier indicator if blocked.
  const tixResult = person.inOpenTitleIXCase
    ? evaluateBarrier({
        actorRole: role,
        fieldClassification: 'title-ix-sensitive',
        resourceKind: 'person',
        resourceId: person.id,
      })
    : null;

  // BIT barrier evaluation.
  const bitResult = person.inOpenBITCase
    ? evaluateBarrier({
        actorRole: role,
        fieldClassification: 'ferpa-edu-record',
        resourceKind: 'person',
        resourceId: person.id,
      })
    : null;

  // Investigation barrier evaluation.
  const invResult = person.inOpenInvestigation
    ? evaluateBarrier({
        actorRole: role,
        fieldClassification: 'restricted-investigation',
        resourceKind: 'person',
        resourceId: person.id,
      })
    : null;

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[var(--graphite-100)]">
            <UserCircle2 className="h-10 w-10 text-[var(--graphite-500)]" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="font-display text-xl font-semibold text-[var(--foreground)]">
                {person.fullName || person.id}
              </h2>
              <span className="font-mono text-[11px] text-[var(--muted-foreground)]">{person.id}</span>
            </div>
            <div className="mt-1 grid grid-cols-1 gap-x-6 gap-y-1 text-xs md:grid-cols-3">
              <Field label="Legal name" value={person.legalName ?? '—'} masked={legalNameMasked} />
              <Field label="DOB" value={person.dob ?? '—'} masked={dobMasked} />
              <Field
                label="Affiliations"
                value={person.affiliations.join(', ')}
              />
              <Field label="Residence" value={person.primaryResidenceBuildingId ?? '—'} />
              <Field label="Room" value={person.roomAssignment ?? '—'} masked={!canSee('ferpa-edu-record')} />
              <Field label="Merge confidence" value={`${person.mergeConfidence}%`} />
            </div>
          </div>
          <div className="ml-auto flex shrink-0 flex-col items-end gap-1.5">
            <ClassificationBadge classification={person.classificationTier} />
          </div>
        </div>
        {/* Status flag strip */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {person.hasActiveNoContact && <Badge variant="warning">no-contact order</Badge>}
          {person.hasActiveTrespass && <Badge variant="danger">trespass order</Badge>}
          {bitResult && !bitResult.allowed ? (
            <BarrierIndicator barrierId={bitResult.barrierHit?.id} reason="BIT involvement (barrier active)" />
          ) : person.inOpenBITCase ? (
            <Badge variant="accent">open BIT case</Badge>
          ) : null}
          {tixResult && !tixResult.allowed ? (
            <BarrierIndicator barrierId={tixResult.barrierHit?.id} reason="Title IX involvement (walled)" />
          ) : person.inOpenTitleIXCase ? (
            <Badge variant="title-ix">open Title IX case</Badge>
          ) : null}
          {invResult && !invResult.allowed ? (
            <BarrierIndicator barrierId={invResult.barrierHit?.id} reason="Active investigation hold" />
          ) : person.inOpenInvestigation ? (
            <Badge variant="restricted-investigation">active investigation</Badge>
          ) : null}
          {person.isCSAEnabled && <Badge variant="info">CSA-designated</Badge>}
          {!person.hasActiveNoContact && !person.hasActiveTrespass && !person.inOpenBITCase && !person.inOpenTitleIXCase && !person.inOpenInvestigation && (
            <span className="text-[11px] text-[var(--muted-foreground)]">No active flags.</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function Field({ label, value, masked }: { label: string; value: string; masked?: boolean }) {
  return (
    <div>
      <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">{label}: </span>
      {masked ? (
        <span className="text-[var(--barrier)]">[masked]</span>
      ) : (
        <span className="text-[var(--foreground)]">{value}</span>
      )}
    </div>
  );
}
