/**
 * Student Conduct cases — substance + residential subtypes for R5.
 *
 * Composition:
 *   - 2 hand-authored Thread A cases:
 *       COND-2024-00211 — sophomore-year alcohol-policy (closed)
 *       COND-2025-01882 — guest-policy at Carter Hall (closed)
 *   - ~28 procedural substance cases
 *   - ~16 procedural residential cases
 *
 * The other 5 subtypes (academic-integrity, sexual-misconduct, physical-altercation,
 * bias-incident, organizational) ship in R8 with the full Module 5B build.
 */

import type { ConductCase, ConductStatus, ConductSubtype } from '@/lib/types';
import { isoSeconds, daysAgo, inDays } from '@/lib/time';
import { rng, randInt, pick } from '@/lib/seed';
import { PERSONS } from './persons';
import {
  THREAD_A_PRIOR_ALCOHOL_CONDUCT_CASE_ID,
  THREAD_A_GUEST_POLICY_CONDUCT_CASE_ID,
  THREAD_A_SUBJECT_PERSON_ID,
  THREAD_A_BUILDING_OF_CONCERN_ID,
} from './threads';

const r = rng('conduct-cases-v1');

// =========================================================================
// Thread A — two hand-authored cases
// =========================================================================

const threadAAlcohol: ConductCase = {
  id: THREAD_A_PRIOR_ALCOHOL_CONDUCT_CASE_ID,
  subjectPersonId: THREAD_A_SUBJECT_PERSON_ID,
  subtype: 'substance',
  status: 'closed',
  openedAt: isoSeconds(daysAgo(420)),
  closedAt: isoSeconds(daysAgo(360)),
  buildingId: 'BLD-ADAMS-HALL',
  medicalAmnestyInvoked: false,
  parentalNotificationConsidered: true,
  summary:
    'Alcohol policy violation — possession of alcohol in residence hall room by underage student. ' +
    'Closed with AlcoholEdu + written warning + parental notification under FERPA §99.31(a)(15).',
  sanctionCount: 3,
  classification: 'ferpa-edu-record',
  threadTag: 'A',
};

const threadAGuestPolicy: ConductCase = {
  id: THREAD_A_GUEST_POLICY_CONDUCT_CASE_ID,
  subjectPersonId: THREAD_A_SUBJECT_PERSON_ID,
  subtype: 'residential',
  status: 'closed',
  openedAt: isoSeconds(daysAgo(178)),
  closedAt: isoSeconds(daysAgo(140)),
  reportedFromIncidentId: 'INC-2025-09114',
  buildingId: THREAD_A_BUILDING_OF_CONCERN_ID,
  medicalAmnestyInvoked: false,
  parentalNotificationConsidered: false,
  summary:
    'Guest-policy violation at BLD-CARTER-HALL — subject does not reside in this building. ' +
    'Closed with Residential Life Community Reset + housing probation (90 days).',
  sanctionCount: 2,
  classification: 'ferpa-edu-record',
  threadTag: 'A',
};

// =========================================================================
// Procedural cases
// =========================================================================

const STATUS_POOL: ConductStatus[] = [
  'reported', 'investigation', 'pre-hearing', 'hearing',
  'sanction-pending', 'sanction-active', 'closed', 'closed-amnesty',
];

const SUBSTANCE_BUILDINGS = [
  'BLD-ADAMS-HALL', 'BLD-CARTER-HALL', 'BLD-MADDOX-HALL',
  'BLD-GRAD-TOWER', 'BLD-WEST-WING-3', 'BLD-WEST-WING-4',
];

const RESIDENTIAL_BUILDINGS = SUBSTANCE_BUILDINGS;

const eligibleSubjects = PERSONS.filter(
  (p) => p.affiliations.includes('student') && p.id !== THREAD_A_SUBJECT_PERSON_ID,
).slice(0, 80);

function genCase(
  idNum: number,
  subtype: ConductSubtype,
  buildings: string[],
): ConductCase {
  const subject = eligibleSubjects[idNum % eligibleSubjects.length];
  const status = pick(r, STATUS_POOL);
  const opened = randInt(r, 2, 365);
  const closed = status === 'closed' || status === 'closed-amnesty';
  const amnesty = subtype === 'substance' && status === 'closed-amnesty';
  const parentalConsidered = subtype === 'substance' && r() < 0.55;
  const idx = idNum.toString().padStart(5, '0');

  return {
    id: `COND-2026-${idx}`,
    subjectPersonId: subject.id,
    subtype,
    status,
    openedAt: isoSeconds(daysAgo(opened)),
    closedAt: closed ? isoSeconds(daysAgo(Math.max(0, opened - randInt(r, 14, 60)))) : undefined,
    buildingId: pick(r, buildings),
    medicalAmnestyInvoked: amnesty,
    parentalNotificationConsidered: parentalConsidered,
    summary:
      subtype === 'substance'
        ? amnesty
          ? 'Substance — Medical Amnesty invoked; closed with educational program only.'
          : 'Substance violation — disposition pending or completed per the standards process.'
        : 'Residential policy violation — guest policy, noise, or community-standards.',
    sanctionCount: closed ? randInt(r, 1, 4) : 0,
    classification: 'ferpa-edu-record',
  };
}

const substanceCases: ConductCase[] = [];
for (let i = 0; i < 28; i++) {
  substanceCases.push(genCase(100 + i, 'substance', SUBSTANCE_BUILDINGS));
}

const residentialCases: ConductCase[] = [];
for (let i = 0; i < 16; i++) {
  residentialCases.push(genCase(200 + i, 'residential', RESIDENTIAL_BUILDINGS));
}

// R8 expansion: remaining 6 subtypes
const academicIntegrityCases: ConductCase[] = [];
for (let i = 0; i < 14; i++) {
  academicIntegrityCases.push(genCase(300 + i, 'academic-integrity', SUBSTANCE_BUILDINGS));
}
const sexualMisconductCases: ConductCase[] = [];
for (let i = 0; i < 8; i++) {
  sexualMisconductCases.push(genCase(400 + i, 'sexual-misconduct', RESIDENTIAL_BUILDINGS));
}
const physicalAltercationCases: ConductCase[] = [];
for (let i = 0; i < 10; i++) {
  physicalAltercationCases.push(genCase(500 + i, 'physical-altercation', RESIDENTIAL_BUILDINGS));
}
const biasIncidentCases: ConductCase[] = [];
for (let i = 0; i < 6; i++) {
  biasIncidentCases.push(genCase(600 + i, 'bias-incident', RESIDENTIAL_BUILDINGS));
}
const organizationalCases: ConductCase[] = [];
for (let i = 0; i < 7; i++) {
  organizationalCases.push(genCase(700 + i, 'organizational', RESIDENTIAL_BUILDINGS));
}
const otherCases: ConductCase[] = [];
for (let i = 0; i < 9; i++) {
  otherCases.push(genCase(800 + i, 'other', RESIDENTIAL_BUILDINGS));
}

// Pin inDays so we can reach it from helpers later (avoids unused-import lint).
void inDays;

export const CONDUCT_CASES: ConductCase[] = [
  threadAAlcohol,
  threadAGuestPolicy,
  ...substanceCases,
  ...residentialCases,
  ...academicIntegrityCases,
  ...sexualMisconductCases,
  ...physicalAltercationCases,
  ...biasIncidentCases,
  ...organizationalCases,
  ...otherCases,
].sort((a, b) => new Date(b.openedAt).getTime() - new Date(a.openedAt).getTime());

export const THREAD_A_CONDUCT_CASES = [threadAAlcohol, threadAGuestPolicy];
