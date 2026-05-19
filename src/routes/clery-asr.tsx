/**
 * /clery/asr/:year — ASR workbench.
 *
 * Top: grid (20 × 4 = 80 cells). Click a cell → drawer-style detail with
 * source incidents + lineage trace + Clery classification card.
 */
import { useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ClassificationBadge } from '@/components/data-display/classification-badge';
import { ASRGrid } from '@/components/clery/asr-grid';
import { ClassificationCard } from '@/components/clery/classification-card';
import {
  asrRowsForYear, asrCompleteness, getIncident, getASRRow,
} from '@/lib/mock-db';
import { classifyCleryEvent } from '@/lib/ai/mock-ai';
import { formatRelativeTime } from '@/lib/utils';
import type { ASRWorkspaceRow } from '@/lib/types';
import NotFoundPage from './not-found';

export default function CleryASRPage() {
  const { year: yearParam = '' } = useParams<{ year: string }>();
  const year = parseInt(yearParam, 10);
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCellId = searchParams.get('cell');
  const [selectedCellId, setSelectedCellId] = useState<string | null>(initialCellId);

  if (!Number.isFinite(year) || year < 2020 || year > 2030) {
    return <NotFoundPage />;
  }

  const rows = useMemo(() => asrRowsForYear(year), [year]);
  const completeness = useMemo(() => asrCompleteness(year), [year]);
  const selectedRow = selectedCellId ? getASRRow(selectedCellId) : null;

  function selectCell(row: ASRWorkspaceRow) {
    setSelectedCellId(row.id);
    setSearchParams({ cell: row.id }, { replace: true });
  }

  return (
    <>
      <PageHeader
        eyebrow={`Compliance · Clery · ASR ${year}`}
        title={`Annual Security Report — ${year}`}
        description={`${completeness.reviewed} / ${completeness.total} cells reviewed (${Math.round(completeness.pct * 100)}%). Click any non-zero cell to drill into the source incidents and see the lineage trace back to bronze.cad.events_raw.`}
      />

      <div className="space-y-6 px-8 py-6">
        <Card>
          <CardContent className="p-0">
            <ASRGrid year={year} rows={rows} onCellSelect={selectCell} />
          </CardContent>
        </Card>

        {selectedRow && (
          <CellDetail row={selectedRow} onClose={() => { setSelectedCellId(null); setSearchParams({}, { replace: true }); }} />
        )}
      </div>
    </>
  );
}

function CellDetail({ row, onClose }: { row: ASRWorkspaceRow; onClose: () => void }) {
  // For the Thread C cell, classify the first source incident (the trigger).
  const isThreadC = row.threadTag === 'C';
  const classification = isThreadC ? classifyCleryEvent('INC-2025-08812') : null;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between pb-3">
          <div>
            <CardTitle>{row.id}</CardTitle>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="text-[10px]">{row.crime}</Badge>
              <Badge variant="outline" className="text-[10px]">{row.geography}</Badge>
              <Badge variant={
                row.status === 'submitted' ? 'success'
                : row.status === 'reviewed' ? 'info'
                : row.status === 'awaiting-review' ? 'warning'
                : 'muted'
              } className="text-[10px]">
                {row.status}
              </Badge>
              {row.needsReview && <Badge variant="warning" className="text-[9px]">needs review</Badge>}
              {row.threadTag && <Badge variant="accent" className="text-[9px]">Thread {row.threadTag}</Badge>}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          >
            Close ×
          </button>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)]">Count</div>
              <div className="mt-0.5 font-display text-2xl font-semibold tabular-nums">{row.count}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)]">Reviewed</div>
              <div className="mt-0.5 text-[11px]">
                {row.lastReviewedAt ? formatRelativeTime(new Date(row.lastReviewedAt)) : '—'}
                {row.lastReviewedByPersonId && (
                  <span className="ml-1 text-[var(--muted-foreground)]">by <span className="font-mono">{row.lastReviewedByPersonId}</span></span>
                )}
              </div>
            </div>
          </div>

          {row.reviewNote && (
            <div className="rounded-md border border-[var(--signal-amber)]/40 bg-[var(--signal-amber-soft)]/30 p-3 text-[11px] leading-relaxed">
              <span className="font-semibold">Review note: </span>{row.reviewNote}
            </div>
          )}

          {/* Source incidents */}
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
              Source incidents ({row.sourceIncidentIds.length})
            </div>
            {row.sourceIncidentIds.length === 0 ? (
              <p className="mt-1.5 text-[11px] text-[var(--muted-foreground)]">No source incidents.</p>
            ) : (
              <ul className="mt-1.5 space-y-1.5">
                {row.sourceIncidentIds.map((incId) => {
                  const inc = getIncident(incId);
                  return (
                    <li key={incId} className="rounded-md border bg-[var(--card)] p-2.5 text-xs">
                      <div className="flex items-center justify-between">
                        <Link to={`/incidents/${encodeURIComponent(incId)}`} className="font-mono text-[10px] text-[var(--hub-700)] hover:underline">
                          {incId}
                        </Link>
                        {inc && <ClassificationBadge classification={inc.classification} />}
                      </div>
                      {inc && (
                        <div className="mt-0.5 text-[10px] text-[var(--muted-foreground)]">
                          {inc.callType} · {inc.buildingId} · {inc.cleryGeographyClass} · {formatRelativeTime(new Date(inc.receivedAt))}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Bronze refs */}
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
              Bronze references
            </div>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {row.bronzeRefIds.map((ds) => (
                <Link
                  key={ds}
                  to={`/catalog/${encodeURIComponent(ds)}`}
                  className="inline-flex items-center rounded-md border px-1.5 py-0.5 font-mono text-[10px] hover:bg-[var(--graphite-50)]"
                >
                  {ds}
                </Link>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {classification && (
        <div>
          <ClassificationCard classification={classification} />
        </div>
      )}
    </div>
  );
}
