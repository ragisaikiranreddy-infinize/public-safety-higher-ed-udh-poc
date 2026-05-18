/**
 * <ClassificationBanner classification /> — slim banner at the top of a
 * Person 360 / Incident 360 indicating the dominant classification of the
 * record. Helps the reader understand at-a-glance what tier they're in.
 */
import { ClassificationBadge } from '@/components/data-display/classification-badge';
import type { Classification } from '@/lib/types';

const RATIONALE: Partial<Record<Classification, string>> = {
  'ferpa-edu-record': 'FERPA-protected education record. Cells masked per active role.',
  cji: 'Criminal Justice Information. CJIS Security Policy applies.',
  'title-ix-sensitive': 'Title IX-sensitive. Walled from non-Title-IX roles by default.',
  'counseling-42cfr2': '42 CFR Part 2. Hard-walled from all roles without explicit patient consent.',
  pii: 'Personally identifiable information. Tokenization on display per classification.',
  'restricted-investigation': 'Active investigation hold. Narrative masked from broad reads.',
  internal: 'Internal-only record.',
  public: 'Public record.',
};

export function ClassificationBanner({ classification }: { classification: Classification }) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--graphite-50)] px-4 py-2">
      <ClassificationBadge classification={classification} />
      <p className="text-[11px] text-[var(--muted-foreground)]">
        {RATIONALE[classification] ?? 'Per classification policy.'}
      </p>
    </div>
  );
}
