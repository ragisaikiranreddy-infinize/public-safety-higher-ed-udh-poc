/**
 * Title IX cases — walled by default.
 *
 * Composition:
 *   - 1 hand-authored Thread A informal intake (TIX-2026-0014)
 *   - 8 procedural cases at various phases (intake → determination)
 *
 * Classification is always `title-ix-sensitive`. Most routes will only see
 * "fact-of-record" via the IB-TIX-TO-PD-HARD barrier; Title IX coordinator
 * role sees full content.
 */

import type { TitleIXCase, TitleIXPhase } from '@/lib/types';
import { isoSeconds, daysAgo, inDays } from '@/lib/time';
import { rng, randInt, pick } from '@/lib/seed';
import { PERSONS } from './persons';
import { THREAD_A_TITLE_IX_INTAKE_ID, THREAD_A_SUBJECT_PERSON_ID } from './threads';

const r = rng('title-ix-cases-v1');

// =========================================================================
// Thread A — TIX-2026-0014 (informal intake; complainant is PER-008471)
// =========================================================================

const threadACase: TitleIXCase = {
  id: THREAD_A_TITLE_IX_INTAKE_ID,
  complainantPersonId: 'PER-008471',
  respondentPersonId: THREAD_A_SUBJECT_PERSON_ID,
  phase: 'informal-intake',
  openedAt: isoSeconds(daysAgo(28)),
  formalComplaintAt: undefined,
  determinationDueAt: undefined,
  supportiveMeasures: [
    'no-contact-directive',
    'class-schedule-adjust',
    'counseling-referral',
  ],
  headline: 'Informal disclosure — Carter Hall pattern report',
  narrative:
    'Complainant disclosed sustained pattern of unwanted attention by named respondent ' +
    'over the past several weeks at her residence hall. No formal complaint filed. ' +
    'Supportive measures (no-contact directive, schedule adjustment, counseling referral) ' +
    'in place. Subject of record is under active CARE/BIT review for related concerns.\n\n' +
    'Coordinate with BIT chair on any overlapping supportive plans. Cross-reference: BIT-2026-0067.',
  classification: 'title-ix-sensitive',
  threadTag: 'A',
};

// =========================================================================
// Procedural cases
// =========================================================================

const PHASES: TitleIXPhase[] = [
  'informal-intake',
  'supportive-measures',
  'formal-complaint',
  'investigation',
  'hearing',
  'determination',
];

const SUPPORTIVE_POOL: TitleIXCase['supportiveMeasures'][number][] = [
  'no-contact-directive',
  'class-schedule-adjust',
  'housing-relocation',
  'academic-accommodation',
  'counseling-referral',
  'safety-escort',
];

const eligibleStudents = PERSONS.filter(
  (p) => p.affiliations.includes('student') && p.id !== THREAD_A_SUBJECT_PERSON_ID,
).slice(0, 40);

const procedural: TitleIXCase[] = [];
for (let i = 0; i < 8; i++) {
  const complainant = eligibleStudents[i * 2 % eligibleStudents.length];
  const respondent = eligibleStudents[(i * 2 + 1) % eligibleStudents.length];
  const phase = pick(r, PHASES);
  const opened = randInt(r, 14, 200);
  const idx = (15 + i).toString().padStart(4, '0');
  const supportiveCount = randInt(r, 1, 3);
  const measures: TitleIXCase['supportiveMeasures'] = [];
  for (let j = 0; j < supportiveCount; j++) {
    const m = pick(r, SUPPORTIVE_POOL);
    if (!measures.includes(m)) measures.push(m);
  }

  procedural.push({
    id: `TIX-2026-${idx}`,
    complainantPersonId: complainant.id,
    respondentPersonId: respondent.id,
    phase,
    openedAt: isoSeconds(daysAgo(opened)),
    formalComplaintAt:
      phase === 'informal-intake' || phase === 'supportive-measures'
        ? undefined
        : isoSeconds(daysAgo(Math.max(1, opened - 14))),
    determinationDueAt:
      phase === 'formal-complaint' || phase === 'investigation' || phase === 'hearing'
        ? isoSeconds(inDays(randInt(r, 5, 45)))
        : undefined,
    supportiveMeasures: measures,
    headline:
      phase === 'informal-intake' ? 'Informal disclosure — supportive measures only'
      : phase === 'investigation' ? 'Investigation in progress — interviews ongoing'
      : phase === 'hearing' ? 'Hearing scheduled within statutory window'
      : phase === 'determination' ? 'Pending determination from decision-maker'
      : 'Formal complaint received',
    narrative:
      'Case detail walled per IB-TIX-TO-PD-HARD. Full narrative visible only to ' +
      'Title IX coordinator. Supportive measures coordinated with Dean of Students.',
    classification: 'title-ix-sensitive',
  });
}

export const TITLE_IX_CASES: TitleIXCase[] = [threadACase, ...procedural];

export const THREAD_A_TITLE_IX_CASE = threadACase;
