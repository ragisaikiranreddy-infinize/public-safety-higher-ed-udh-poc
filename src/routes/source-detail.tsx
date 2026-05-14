/**
 * /sources/:id — Source detail.
 */
import { useParams, Link } from 'react-router-dom';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ClassificationBadge } from '@/components/data-display/classification-badge';
import { FreshnessPill } from '@/components/data-display/freshness-pill';
import { DomainIcon } from '@/components/data-display/domain-icon';
import { getSource, getDataset, getDomain } from '@/lib/mock-db';
import NotFoundPage from './not-found';

export default function SourceDetailPage() {
  const { id = '' } = useParams<{ id: string }>();
  const source = getSource(id);
  if (!source) return <NotFoundPage />;
  const domain = getDomain(source.domainId);

  return (
    <>
      <PageHeader
        eyebrow={`Data · Source Registry · ${source.vendor}`}
        title={source.name}
        description={source.description}
        actions={
          <div className="flex items-center gap-2">
            <ClassificationBadge classification={source.sensitivityTier} />
            <FreshnessPill lastUpdatedIso={source.health.lastSuccessfulRunAt} />
          </div>
        }
      />

      <div className="space-y-6 px-8 py-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <KpiBox label="Health composite" value={`${source.health.composite}`} />
          <KpiBox label="Freshness" value={`${source.health.freshness}`} />
          <KpiBox label="Completeness" value={`${source.health.completeness}`} />
          <KpiBox label="Schema stability" value={`${source.health.schemaStability}`} />
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Identity</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 text-xs md:grid-cols-2">
            <Field label="ID" value={source.id} mono />
            <Field label="Vendor" value={source.vendor} />
            <Field label="Category" value={source.category} />
            <Field label="Protocol" value={source.protocol} />
            <Field label="Cadence" value={source.cadence} />
            <Field label="Schema version" value={source.schemaVersion} />
            <Field label="Owner" value={source.owner} />
            <Field label="Steward" value={source.steward} />
            {domain && (
              <div className="text-xs">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">Domain</div>
                <div className="mt-1 flex items-center gap-2">
                  <DomainIcon domainId={domain.id} />
                  <span>{domain.name}</span>
                </div>
              </div>
            )}
            {source.credentialRef && (
              <Field label="Credential ref" value={source.credentialRef} mono />
            )}
            {source.credentialDaysToRotation !== undefined && (
              <Field
                label="Days to credential rotation"
                value={`${source.credentialDaysToRotation}`}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Connected datasets ({source.connectedDatasetIds.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {source.connectedDatasetIds.length === 0 && (
              <div className="text-xs text-[var(--muted-foreground)]">
                No Bronze datasets wired through this source yet. Will land in a later phase.
              </div>
            )}
            <div className="space-y-2">
              {source.connectedDatasetIds.map((dsId) => {
                const ds = getDataset(dsId);
                if (!ds) return null;
                return (
                  <Link
                    key={dsId}
                    to={`/catalog/${encodeURIComponent(dsId)}`}
                    className="flex items-center justify-between rounded-md border bg-[var(--card)] p-2 transition-colors hover:bg-[var(--graphite-50)]"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-mono text-xs">{ds.id}</div>
                      <div className="truncate text-[10px] text-[var(--muted-foreground)]">{ds.name}</div>
                    </div>
                    <ClassificationBadge classification={ds.classification} />
                  </Link>
                );
              })}
            </div>
            <Separator className="my-4" />
            <div>
              <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                Regulatory hooks
              </div>
              <div className="flex flex-wrap gap-1">
                {source.regulatoryHooks.map((r) => (
                  <Badge key={r} variant="outline">{r}</Badge>
                ))}
                {source.regulatoryHooks.length === 0 && (
                  <span className="text-[10px] text-[var(--muted-foreground)]">none</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function KpiBox({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
          {label}
        </div>
        <div className="mt-1 font-display text-2xl font-semibold text-[var(--foreground)]">{value}</div>
      </CardContent>
    </Card>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">{label}</div>
      <div className={`mt-1 ${mono ? 'font-mono' : ''} text-[var(--foreground)]`}>{value}</div>
    </div>
  );
}
