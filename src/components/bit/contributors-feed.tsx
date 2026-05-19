/**
 * <ContributorsFeed /> — vertical stack of evidence rows for a BIT case.
 *
 * Each row shows: source kind, observed-at, summary, weight chip, optional
 * dataset citation deep-link, and barrier-aware classification badge.
 */
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { ClassificationBadge } from '@/components/data-display/classification-badge';
import { BarrierIndicator } from '@/components/data-display/barrier-indicator';
import { formatRelativeTime } from '@/lib/utils';
import { useRole } from '@/lib/role-context';
import { evaluateBarrier } from '@/lib/information-barriers';
import type { BITEvidence } from '@/lib/types';

const KIND_LABEL: Record<BITEvidence['kind'], string> = {
  tip: 'Anonymous tip',
  incident: 'Incident',
  'access-anomaly': 'Access anomaly',
  'camera-analytic': 'Camera analytic',
  'conduct-case': 'Conduct case',
  'lms-engagement': 'LMS engagement',
  'roommate-report': 'Roommate report',
  'social-media': 'Social media',
  observation: 'Case-manager observation',
};

interface Props {
  evidence: readonly BITEvidence[];
}

export function ContributorsFeed({ evidence }: Props) {
  const { role } = useRole();

  if (evidence.length === 0) {
    return (
      <p className="text-xs text-[var(--muted-foreground)]">No evidence rows attached to this case.</p>
    );
  }

  return (
    <ul className="space-y-3">
      {evidence.map((e) => {
        const barrier = evaluateBarrier({
          actorRole: role,
          fieldClassification: e.classification,
          resourceKind: 'bit-evidence',
          resourceId: e.id,
        });
        const blocked = !barrier.allowed;
        return (
          <li
            key={e.id}
            className="rounded-md border bg-[var(--card)] p-3 text-xs"
          >
            <div className="mb-1 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px]">
                  {KIND_LABEL[e.kind]}
                </Badge>
                <span className="text-[10px] text-[var(--muted-foreground)]">
                  {formatRelativeTime(new Date(e.observedAt))}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Badge variant="muted" className="text-[10px]">weight {e.weight}</Badge>
                {blocked ? (
                  <BarrierIndicator barrierId={barrier.barrierHit?.id} size="sm" />
                ) : (
                  <ClassificationBadge classification={e.classification} />
                )}
              </div>
            </div>
            <p className="text-[12px] leading-relaxed text-[var(--foreground)]">
              {blocked ? (
                <span className="text-[var(--barrier)]">
                  [Content withheld — {barrier.barrierHit?.name ?? 'information barrier'}]
                </span>
              ) : (
                e.summary
              )}
            </p>
            {!blocked && e.evidenceDatasetId && (
              <div className="mt-1 text-[10px]">
                <span className="text-[var(--muted-foreground)]">cites: </span>
                <Link
                  to={`/catalog/${encodeURIComponent(e.evidenceDatasetId)}`}
                  className="font-mono text-[var(--hub-700)] hover:underline"
                >
                  {e.evidenceDatasetId}
                </Link>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
