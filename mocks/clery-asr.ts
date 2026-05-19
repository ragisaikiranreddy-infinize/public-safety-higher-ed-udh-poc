/**
 * Annual Security Report (ASR) workspace — 2024 + 2025.
 *
 * Per 34 CFR 668.46(c), ASR Table 1 reports counts across the matrix of
 * crime categories × Clery geographies, for the past 3 calendar years.
 * This fixture builds workspace rows (cells) for 2024 + 2025, including
 * the hand-authored Thread C anchor cell:
 *
 *   ASR-2025-RESHALL-SEXOFF — Sex Offenses (rape) × On-Campus Residential
 *   count: 3   sources: INC-2025-08812 + INC-2025-04019 + INC-2025-07217
 *   needsReview: false   status: 'reviewed'
 *
 * The workspace is the surface where the Clery officer reviews each cell
 * before submission. Cells flagged `needsReview` show why (geography
 * ambiguity / classification ambiguity / Title IX cross-reference).
 */

import type { ASRWorkspaceRow, CleryCrimeCategory, CleryGeographyClass } from '@/lib/types';
import { isoSeconds, daysAgo } from '@/lib/time';
import { rng, randInt, pick } from '@/lib/seed';
import {
  THREAD_C_ASR_LINE_ID,
  THREAD_C_RELATED_INCIDENT_IDS,
  THREAD_C_ASR_YEAR,
} from './threads';

const r = rng('clery-asr-workspace');

const CRIMES: CleryCrimeCategory[] = [
  'murder-nonneg-manslaughter',
  'negligent-manslaughter',
  'sex-offense-rape',
  'sex-offense-fondling',
  'sex-offense-incest',
  'sex-offense-statutory',
  'robbery',
  'aggravated-assault',
  'burglary',
  'motor-vehicle-theft',
  'arson',
  'domestic-violence',
  'dating-violence',
  'stalking',
  'arrest-weapons',
  'arrest-drug-abuse',
  'arrest-liquor',
  'referral-weapons',
  'referral-drug-abuse',
  'referral-liquor',
];

const GEOS: CleryGeographyClass[] = [
  'on-campus',
  'on-campus-residential',
  'non-campus',
  'public-property',
];

// Per-crime baseline frequency (events/year on a small campus). Sex offenses
// + arrests/referrals for drug + liquor are the high-volume cells; capital
// crimes are mostly zero.
const BASE_FREQ: Partial<Record<CleryCrimeCategory, number>> = {
  'murder-nonneg-manslaughter': 0,
  'negligent-manslaughter': 0,
  'sex-offense-rape': 4,
  'sex-offense-fondling': 5,
  'sex-offense-incest': 0,
  'sex-offense-statutory': 0,
  'robbery': 1,
  'aggravated-assault': 2,
  'burglary': 8,
  'motor-vehicle-theft': 3,
  'arson': 0,
  'domestic-violence': 3,
  'dating-violence': 4,
  'stalking': 5,
  'arrest-weapons': 1,
  'arrest-drug-abuse': 14,
  'arrest-liquor': 22,
  'referral-weapons': 0,
  'referral-drug-abuse': 18,
  'referral-liquor': 64,
};

// Geography distribution weights (sum to 1.0).
const GEO_WEIGHTS: Record<CleryGeographyClass, number> = {
  'on-campus': 0.42,
  'on-campus-residential': 0.38,
  'non-campus': 0.05,
  'public-property': 0.15,
  'off-campus': 0,
  'tbd': 0,
};

function distribute(total: number): Record<CleryGeographyClass, number> {
  const out = {
    'on-campus': 0,
    'on-campus-residential': 0,
    'non-campus': 0,
    'public-property': 0,
    'off-campus': 0,
    'tbd': 0,
  } as Record<CleryGeographyClass, number>;
  let remaining = total;
  GEOS.forEach((geo, i) => {
    if (i === GEOS.length - 1) {
      out[geo] = remaining;
    } else {
      const draw = Math.min(remaining, Math.round(total * GEO_WEIGHTS[geo] * (0.85 + r() * 0.3)));
      out[geo] = draw;
      remaining = Math.max(0, remaining - draw);
    }
  });
  return out;
}

function buildWorkspaceRow(
  year: number,
  crime: CleryCrimeCategory,
  geography: CleryGeographyClass,
  count: number,
  opts: { isThreadC?: boolean; sourceIds?: string[]; needsReview?: boolean; reviewNote?: string } = {},
): ASRWorkspaceRow {
  const isThreadC = !!opts.isThreadC;
  const id = isThreadC
    ? THREAD_C_ASR_LINE_ID
    : `ASR-${year}-${crime.toUpperCase().replace(/-/g, '')}-${geography.toUpperCase().replace(/-/g, '')}`;
  const sourceIds = opts.sourceIds ?? (count > 0
    ? Array.from({ length: Math.min(count, 8) }, (_, i) => `INC-${year}-${(randInt(r, 1000, 9000) + i).toString().padStart(5, '0')}`)
    : []);
  const needsReview = opts.needsReview ?? (count > 0 && r() < 0.08);
  const status = isThreadC
    ? 'reviewed'
    : needsReview
    ? pick(r, ['awaiting-review', 'open'] as const)
    : pick(r, ['reviewed', 'submitted', 'reviewed', 'reviewed'] as const);
  return {
    id,
    reportingYear: year,
    crime,
    geography,
    count,
    sourceIncidentIds: sourceIds,
    needsReview,
    reviewNote: opts.reviewNote ?? (needsReview ? pick(r, [
      'Geography ambiguity — incident occurred at boundary between on-campus and public property.',
      'Classification ambiguity — second sex-offense element in narrative requires review.',
      'Pending Title IX cross-reference — coordinate before counting.',
      'CSA disclosure pending — wait for annual attestation cycle.',
    ]) : undefined),
    status,
    bronzeRefIds: count > 0
      ? ['cad.events_raw', 'rms.case_raw']
      : [],
    lastReviewedByPersonId: status === 'reviewed' || status === 'submitted' ? 'PER-001008' : undefined,
    lastReviewedAt: status === 'reviewed' || status === 'submitted' ? isoSeconds(daysAgo(randInt(r, 5, 60))) : undefined,
    classification: 'public',
    threadTag: isThreadC ? 'C' : undefined,
  };
}

// =========================================================================
// Thread C anchor — sex-offense-rape × on-campus-residential, 2025
// =========================================================================

const threadCRow = buildWorkspaceRow(
  THREAD_C_ASR_YEAR,
  'sex-offense-rape',
  'on-campus-residential',
  3,
  {
    isThreadC: true,
    sourceIds: [...THREAD_C_RELATED_INCIDENT_IDS],
  },
);

// =========================================================================
// Build the full 2024 + 2025 workspaces
// =========================================================================

function buildYear(year: number): ASRWorkspaceRow[] {
  const rows: ASRWorkspaceRow[] = [];
  CRIMES.forEach((crime) => {
    const total = BASE_FREQ[crime] ?? 0;
    if (total === 0) {
      // Still emit zero rows for the grid
      GEOS.forEach((geo) => {
        rows.push(buildWorkspaceRow(year, crime, geo, 0));
      });
      return;
    }
    const yearMultiplier = year === 2024 ? 1.15 : year === 2025 ? 1.0 : 0.9;
    const yearTotal = Math.round(total * yearMultiplier);
    const dist = distribute(yearTotal);
    GEOS.forEach((geo) => {
      // Skip Thread C anchor — it's hand-crafted
      if (year === THREAD_C_ASR_YEAR && crime === 'sex-offense-rape' && geo === 'on-campus-residential') {
        return;
      }
      rows.push(buildWorkspaceRow(year, crime, geo, dist[geo]));
    });
  });
  return rows;
}

const rows2025 = buildYear(2025);
const rows2024 = buildYear(2024);

export const CLERY_ASR_WORKSPACE: ASRWorkspaceRow[] = [
  threadCRow,
  ...rows2025,
  ...rows2024,
];

export const THREAD_C_ASR_ROW = threadCRow;
