/**
 * /clery/geography — polygon set + audit history (read-only for R7).
 */
import { PageHeader } from '@/components/layout/page-header';
import { GeographyEditor } from '@/components/clery/geography-editor';
import { THREAD_C_CLERY_POLYGON_SET } from '@/lib/mock-db';

export default function CleryGeographyPage() {
  const set = THREAD_C_CLERY_POLYGON_SET;

  return (
    <>
      <PageHeader
        eyebrow="Compliance · Clery · Geography"
        title={`Clery polygon set — ${set.reportingYear}`}
        description={`${set.polygons.length} certified polygons across on-campus, on-campus-residential, non-campus, and public-property classifications. Eight audit-history entries trace every classification change since the initial ingest.`}
      />
      <div className="px-8 py-6">
        <GeographyEditor polygonSet={set} />
      </div>
    </>
  );
}
