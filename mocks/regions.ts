/**
 * Campus regions — the header region filter scopes data to these.
 *
 * Anchored to a fictional flagship-state-university silhouette.
 * No real-world institution association implied.
 */

import type { Region } from '@/lib/types';

export const REGIONS: Region[] = [
  {
    id: 'north-campus',
    name: 'North Campus',
    description:
      'Older residential core plus the original quad. Contains most first-year residence halls and the historic library.',
  },
  {
    id: 'central-campus',
    name: 'Central Campus',
    description:
      'Academic core — main classroom buildings, student union, dining commons, and the police-headquarters building.',
  },
  {
    id: 'south-campus',
    name: 'South Campus',
    description:
      'Athletics complex, graduate housing, and parking decks. Where most large-event activity concentrates.',
  },
];
