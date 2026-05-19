/**
 * Academic-integrity cases.
 *
 * Faculty-level resolutions stay at the course level; severe / repeat cases
 * escalate to the Office of Student Conduct. The fixture seeds 18 cases with
 * the gen-AI-misuse category prominently represented (a 2024+ pattern).
 */

import type {
  AcademicIntegrityCase,
  AcademicIntegrityKind,
  AcademicIntegrityStatus,
} from '@/lib/types';
import { isoSeconds, daysAgo } from '@/lib/time';
import { rng, randInt, pick } from '@/lib/seed';
import { PERSONS } from './persons';

const r = rng('academic-integrity-v1');

const KINDS: AcademicIntegrityKind[] = [
  'plagiarism', 'unauthorized-collaboration', 'fabrication',
  'cheating', 'gen-ai-misuse', 'gen-ai-misuse', 'gen-ai-misuse', // weighted
  'tampering',
];

const STATUS_POOL: AcademicIntegrityStatus[] = [
  'reported', 'faculty-resolution', 'standards-review',
  'sanction-active', 'closed', 'closed', 'closed',
];

const COURSES = ['CS-3110', 'CS-2110', 'ENGL-1010', 'CHEM-1410', 'BIOL-2210', 'HIST-3300', 'PSYCH-2050', 'MATH-2310', 'BUS-3120', 'ART-2010'];

const RESOLUTIONS = [
  'Zero on assignment + written warning + integrity-tutorial completion.',
  'Course grade reduction by one full letter; subject acknowledged understanding.',
  'Resubmission with attribution audit; first-incident notation in file.',
  'Faculty-level resolution declined by subject; case escalated to standards review.',
];

const students = PERSONS.filter((p) => p.affiliations.includes('student'));
const faculty = PERSONS.filter((p) => p.affiliations.includes('employee'));

export const ACADEMIC_INTEGRITY_CASES: AcademicIntegrityCase[] = Array.from({ length: 18 }, (_, i) => {
  const status = pick(r, STATUS_POOL);
  const facultyResolution = status === 'faculty-resolution' || status === 'closed' ? pick(r, RESOLUTIONS) : undefined;
  return {
    id: `AIC-2026-${(i + 1).toString().padStart(4, '0')}`,
    subjectPersonId: students[i % students.length].id,
    facultyPersonId: faculty[i % faculty.length]?.id ?? 'PER-001008',
    courseCode: pick(r, COURSES),
    kind: pick(r, KINDS),
    status,
    reportedAt: isoSeconds(daysAgo(randInt(r, 4, 270))),
    facultyResolution,
    escalatedToConduct: status === 'standards-review' || status === 'sanction-active' || (status === 'closed' && r() < 0.2),
    classification: 'ferpa-edu-record',
  };
});
