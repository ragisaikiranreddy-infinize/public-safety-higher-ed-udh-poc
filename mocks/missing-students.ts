/**
 * Missing-student reports per Clery / HEOA §485(j).
 *
 * Institutions must establish a missing-student protocol with a 24-hour
 * parental-notification trigger for students who have designated emergency
 * contacts. The fixture seeds 12 reports across the past 18 months — most
 * recovered within 24 hours.
 */

import type { MissingStudentReport, MissingStudentStatus } from '@/lib/types';
import { isoSeconds, daysAgo, hoursAgo } from '@/lib/time';
import { rng, randInt, pick } from '@/lib/seed';
import { PERSONS } from './persons';

const r = rng('missing-students-v1');

const STATUS_POOL: { status: MissingStudentStatus; weight: number }[] = [
  { status: 'recovered', weight: 8 },
  { status: 'closed-other', weight: 2 },
  { status: 'protocol-active', weight: 1 },
  { status: 'verification-in-progress', weight: 1 },
];

function pickStatus(): MissingStudentStatus {
  const pool: MissingStudentStatus[] = [];
  STATUS_POOL.forEach(({ status, weight }) => {
    for (let i = 0; i < weight; i++) pool.push(status);
  });
  return pick(r, pool);
}

const students = PERSONS.filter((p) => p.affiliations.includes('student'));
const buildings = ['BLD-ADAMS-HALL', 'BLD-CARTER-HALL', 'BLD-MADDOX-HALL', 'BLD-WEST-WING-3', 'BLD-WEST-WING-4', 'BLD-GRAD-TOWER'];

const NARRATIVES = [
  'Reported missing after failing to attend a scheduled study group. Recovered within 6 hours; had taken an impromptu trip with friends.',
  'Roommate reported subject not seen for 30 hours. Welfare check located subject at a relative\'s home off-campus.',
  'Family reported subject unreachable. UPD located subject; parental notification issued at the 24-hour mark.',
  'Faculty reported subject absent from required clinical rotation. Recovered via RA outreach.',
  'Self-reported overdue return from out-of-town trip. Recovered without intervention.',
];

export const MISSING_STUDENT_REPORTS: MissingStudentReport[] = Array.from({ length: 12 }, (_, i) => {
  const subj = students[i * 7 % students.length];
  const status = pickStatus();
  const daysBack = randInt(r, 1, 540);
  const hoursOverdue = status === 'recovered' || status === 'closed-other'
    ? randInt(r, 2, 20)
    : randInt(r, 24, 96);
  return {
    id: `MSR-2026-${(i + 1).toString().padStart(4, '0')}`,
    subjectPersonId: subj.id,
    reportedAt: isoSeconds(daysBack === 0 ? hoursAgo(randInt(r, 2, 23)) : daysAgo(daysBack)),
    status,
    reporterRole: pick(r, ['roommate', 'faculty', 'family', 'staff', 'self', 'other'] as const),
    hoursOverdue,
    parentalNotifiedAt: hoursOverdue >= 24 && status !== 'closed-other'
      ? isoSeconds(daysAgo(daysBack - 1))
      : undefined,
    lastSeenBuildingId: pick(r, buildings),
    narrative: pick(r, NARRATIVES),
    classification: 'ferpa-edu-record',
  };
});
