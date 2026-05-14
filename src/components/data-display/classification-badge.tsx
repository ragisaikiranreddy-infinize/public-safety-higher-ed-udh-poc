/**
 * <ClassificationBadge classification={...} /> — 10-tier classification chip.
 *
 * Variants map 1:1 to badge variants defined in src/components/ui/badge.tsx.
 */
import { Badge } from '@/components/ui/badge';
import type { Classification } from '@/lib/types';

const VARIANT_MAP: Record<Classification, Parameters<typeof Badge>[0]['variant']> = {
  public: 'public',
  internal: 'internal',
  'ferpa-edu-record': 'ferpa',
  cji: 'cji',
  'title-ix-sensitive': 'title-ix',
  'counseling-42cfr2': 'counseling',
  pii: 'pii',
  phi: 'phi',
  juvenile: 'juvenile',
  'restricted-investigation': 'restricted-investigation',
};

const LABEL_MAP: Record<Classification, string> = {
  public: 'public',
  internal: 'internal',
  'ferpa-edu-record': 'ferpa',
  cji: 'cji',
  'title-ix-sensitive': 'title-ix',
  'counseling-42cfr2': '42 CFR 2',
  pii: 'pii',
  phi: 'phi',
  juvenile: 'juvenile',
  'restricted-investigation': 'investigation',
};

export function ClassificationBadge({
  classification,
}: {
  classification: Classification;
}) {
  return (
    <Badge variant={VARIANT_MAP[classification]}>{LABEL_MAP[classification]}</Badge>
  );
}
