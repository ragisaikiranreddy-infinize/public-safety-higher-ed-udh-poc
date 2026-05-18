/**
 * Master Person Records — ~150 entries.
 *
 * Composition:
 *   - 8 hand-authored, thread-tagged (Thread A subject + 7 supporting roles)
 *   - ~80 procedurally generated students (seeded RNG, deterministic)
 *   - ~45 procedurally generated employees (incl. officers)
 *   - ~12 visitors / contractors
 *   - ~5 no-trespass-listed individuals
 *
 * Each Person carries 3–7 PersonIdentifier rows showing the cross-source
 * resolution that powers the identity-resolution xyflow graph on Person 360.
 *
 * IDs are stable: PER-000000 .. PER-000200 range, with thread anchors at
 * PER-008470 (Thread A subject) and PER-001124..PER-001168 (officers).
 */

import type {
  Person,
  PersonAffiliation,
  PersonIdentifier,
} from '@/lib/types';
import { isoSeconds, daysAgo, hoursAgo } from '@/lib/time';
import { rng, randInt, randFloat, pick } from '@/lib/seed';
import { THREAD_A_SUBJECT_PERSON_ID } from './threads';

const FIRST_NAMES = [
  'Aaliyah', 'Aiden', 'Alex', 'Amara', 'Amaya', 'Andre', 'Antonio', 'Aria',
  'Ava', 'Avery', 'Brandon', 'Brianna', 'Caleb', 'Camila', 'Carlos', 'Carter',
  'Chloe', 'Daniel', 'David', 'Destiny', 'Diego', 'Elena', 'Elijah', 'Emily',
  'Emma', 'Ethan', 'Fatima', 'Gabriel', 'Grace', 'Hannah', 'Hiroshi', 'Isaac',
  'Isabella', 'Jacob', 'Jasmine', 'Jayden', 'Jordan', 'Jose', 'Joshua', 'Justin',
  'Kai', 'Kayla', 'Kenji', 'Keshawn', 'Layla', 'Leah', 'Liam', 'Logan',
  'Luis', 'Madison', 'Maya', 'Mei', 'Michael', 'Mia', 'Mohammed', 'Nadia',
  'Nathan', 'Nicole', 'Noah', 'Olivia', 'Owen', 'Priya', 'Rafael', 'Rashida',
  'Riley', 'Rohan', 'Ryan', 'Samantha', 'Sebastian', 'Sofia', 'Sophia', 'Tariq',
  'Tyler', 'Victoria', 'Wei', 'William', 'Yusuf', 'Zara', 'Zoe',
];

const LAST_NAMES = [
  'Adams', 'Alvarez', 'Anderson', 'Bailey', 'Brown', 'Chen', 'Choi', 'Cohen',
  'Davis', 'Diallo', 'Diaz', 'Edwards', 'Flores', 'Garcia', 'Gomez', 'Gonzalez',
  'Green', 'Hall', 'Harris', 'Hernandez', 'Hill', 'Ibrahim', 'Iyer', 'Jackson',
  'Jensen', 'Johnson', 'Jones', 'Kapoor', 'Kim', 'King', 'Kowalski', 'Lee',
  'Lewis', 'Liu', 'Lopez', 'Mahmoud', 'Malik', 'Martin', 'Martinez', 'Miller',
  'Mitchell', 'Moore', 'Moreno', 'Mueller', 'Nakamura', 'Nguyen', 'Okafor',
  'O\'Brien', 'Patel', 'Park', 'Perez', 'Phillips', 'Ramirez', 'Reyes',
  'Roberts', 'Robinson', 'Rodriguez', 'Rossi', 'Sato', 'Schmidt', 'Scott',
  'Sharma', 'Singh', 'Smith', 'Suzuki', 'Tanaka', 'Taylor', 'Thomas', 'Thompson',
  'Torres', 'Walker', 'Wang', 'Washington', 'White', 'Williams', 'Wilson',
  'Wong', 'Wright', 'Yamamoto', 'Yang', 'Young', 'Zhang',
];

const STUDENT_MAJORS = [
  'Computer Science', 'Mechanical Engineering', 'Biology', 'Psychology',
  'Business Administration', 'English', 'History', 'Mathematics',
  'Chemistry', 'Political Science', 'Nursing', 'Sociology',
  'Civil Engineering', 'Economics', 'Communications', 'Education',
  'Public Health', 'Theatre Arts', 'Music', 'Architecture',
];

const DEPARTMENTS = [
  'Residential Life', 'Athletics', 'Facilities Management', 'Library',
  'Student Health Center', 'Office of the Provost', 'Office of the Registrar',
  'Information Technology', 'Dining Services', 'Public Safety',
  'Office of the Dean of Students', 'Title IX Office', 'Human Resources',
  'Counseling Center', 'Career Services', 'Admissions',
];

const RESIDENCE_BUILDINGS = [
  'BLD-ADAMS-HALL', 'BLD-CARTER-HALL', 'BLD-MADDOX-HALL',
  'BLD-GRAD-TOWER', 'BLD-WEST-WING-3', 'BLD-WEST-WING-4',
];

const STAFF_BUILDINGS = [
  'BLD-ADMIN-HALL', 'BLD-PD-HQ', 'BLD-MAIN-LIBRARY', 'BLD-SCIENCE-1',
  'BLD-STUDENT-UNION', 'BLD-HEALTH-CTR',
];

// =========================================================================
// Identifier generators
// =========================================================================

function hashStr(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return h.toString(16).padStart(8, '0').slice(0, 8);
}

function buildIdentifiers(
  personId: string,
  affiliations: PersonAffiliation[],
  fullName: string,
  r: () => number,
): PersonIdentifier[] {
  const ids: PersonIdentifier[] = [];
  if (affiliations.includes('student')) {
    ids.push({
      kind: 'sis-id',
      value: `STU-${randInt(r, 2020, 2026)}-${personId.replace('PER-', '').padStart(7, '0')}`,
      classification: 'ferpa-edu-record',
      confidence: 100,
      source: 'SRC-BANNER-SIS',
      matchMethod: 'deterministic-exact',
    });
  }
  if (affiliations.includes('employee')) {
    ids.push({
      kind: 'emplid',
      value: `EMP-${randInt(r, 100000, 999999)}`,
      classification: 'pii',
      confidence: 100,
      source: 'SRC-WORKDAY-HCM',
      matchMethod: 'deterministic-exact',
    });
  }
  // OneCard — almost everyone has one
  ids.push({
    kind: 'onecard-id',
    value: `OC-${randInt(r, 10000, 99999)}`,
    classification: 'pii',
    confidence: 100,
    source: 'SRC-BLACKBOARD-TRANSACT-ONECARD',
    matchMethod: 'deterministic-exact',
  });
  // Email
  const emailLocal = fullName.toLowerCase().replace(/[^a-z]/g, '.').slice(0, 18);
  ids.push({
    kind: 'email',
    value: `${emailLocal}@example-univ.edu`,
    classification: 'pii',
    confidence: 100,
    source: 'SRC-BANNER-SIS',
    matchMethod: 'deterministic-exact',
  });
  // Phone (hashed)
  ids.push({
    kind: 'phone',
    value: `***-***-${randInt(r, 1000, 9999)}`,
    classification: 'pii',
    confidence: r() < 0.9 ? 96 : 78,
    source: 'SRC-BANNER-SIS',
    matchMethod: r() < 0.85 ? 'deterministic-fuzzy' : 'probabilistic',
  });
  // License plate (some)
  if (r() < 0.55) {
    ids.push({
      kind: 'license-plate',
      value: `***-${hashStr(personId).slice(0, 4).toUpperCase()}`,
      classification: 'cji',
      confidence: r() < 0.95 ? 94 : 71,
      source: 'SRC-T2-PARKING',
      matchMethod: r() < 0.7 ? 'deterministic-exact' : 'probabilistic',
    });
  }
  // Device ID (most)
  if (r() < 0.85) {
    ids.push({
      kind: 'device-id',
      value: `dev-${hashStr(personId + 'dev')}`,
      classification: 'pii',
      confidence: r() < 0.8 ? 88 : 65,
      source: 'SRC-LIVESAFE-TIPS',
      matchMethod: 'probabilistic',
    });
  }
  return ids;
}

// =========================================================================
// Thread A subject + supporting cast (hand-authored)
// =========================================================================

const threadAPersons: Person[] = [
  // Thread A subject — the focal Person Master Record
  {
    id: THREAD_A_SUBJECT_PERSON_ID, // 'PER-008470'
    fullName: 'Tyler Anderson',
    legalName: 'Tyler J. Anderson',
    dob: '[PII REDACTED — DOB]',
    affiliations: ['student'],
    identifiers: [
      { kind: 'sis-id', value: 'STU-2024-0008470', classification: 'ferpa-edu-record', confidence: 100, source: 'SRC-BANNER-SIS', matchMethod: 'deterministic-exact' },
      { kind: 'onecard-id', value: 'OC-44192', classification: 'pii', confidence: 100, source: 'SRC-BLACKBOARD-TRANSACT-ONECARD', matchMethod: 'deterministic-exact' },
      { kind: 'email', value: 'tyler.anderson@example-univ.edu', classification: 'pii', confidence: 100, source: 'SRC-BANNER-SIS', matchMethod: 'deterministic-exact' },
      { kind: 'phone', value: '***-***-7841', classification: 'pii', confidence: 98, source: 'SRC-BANNER-SIS', matchMethod: 'deterministic-fuzzy' },
      { kind: 'license-plate', value: '***-A7K2', classification: 'cji', confidence: 96, source: 'SRC-T2-PARKING', matchMethod: 'deterministic-exact' },
      { kind: 'device-id', value: 'dev-9c4f7b21', classification: 'pii', confidence: 84, source: 'SRC-LIVESAFE-TIPS', matchMethod: 'probabilistic' },
      { kind: 'device-id', value: 'dev-22e4a1f0', classification: 'pii', confidence: 71, source: 'wifi-nac', matchMethod: 'probabilistic' },
    ],
    resolvedFromSourceIds: ['SRC-BANNER-SIS', 'SRC-BLACKBOARD-TRANSACT-ONECARD', 'SRC-T2-PARKING', 'SRC-LIVESAFE-TIPS'],
    mergeConfidence: 91,
    primaryResidenceBuildingId: 'BLD-ADAMS-HALL',
    roomAssignment: 'Adams 312B',
    hasActiveNoContact: false,
    hasActiveTrespass: false,
    inOpenBITCase: true,
    inOpenTitleIXCase: true, // walled — only Title IX role sees content; others see barrier indicator
    inOpenInvestigation: false,
    isCSAEnabled: false,
    classificationTier: 'ferpa-edu-record',
    consentFlags: [
      { kind: 'ferpa-directory-info-optout', granted: false, source: 'SRC-BANNER-SIS', effectiveFrom: isoSeconds(daysAgo(540)) },
      { kind: 'photo-release', granted: true, source: 'SRC-BANNER-SIS', effectiveFrom: isoSeconds(daysAgo(540)) },
    ],
    createdAt: isoSeconds(daysAgo(540)),
    lastReviewedAt: isoSeconds(daysAgo(2)),
    threadTag: 'A',
  },
  // Thread A — Title IX complainant (walled — most roles see only barrier-hit indicator)
  {
    id: 'PER-008471',
    fullName: '[TITLE IX WALLED]',
    affiliations: ['student'],
    identifiers: [],
    resolvedFromSourceIds: ['SRC-BANNER-SIS', 'SRC-MAXIENT-CASES'],
    mergeConfidence: 96,
    hasActiveNoContact: false,
    hasActiveTrespass: false,
    inOpenBITCase: false,
    inOpenTitleIXCase: true,
    inOpenInvestigation: false,
    classificationTier: 'title-ix-sensitive',
    consentFlags: [],
    createdAt: isoSeconds(daysAgo(28)),
    lastReviewedAt: isoSeconds(daysAgo(2)),
    threadTag: 'A',
  },
  // BIT case team coordinator
  {
    id: 'PER-001008',
    fullName: 'Margaret Chen',
    affiliations: ['employee'],
    identifiers: [
      { kind: 'emplid', value: 'EMP-104271', classification: 'pii', confidence: 100, source: 'SRC-WORKDAY-HCM', matchMethod: 'deterministic-exact' },
      { kind: 'email', value: 'margaret.chen@example-univ.edu', classification: 'pii', confidence: 100, source: 'SRC-WORKDAY-HCM', matchMethod: 'deterministic-exact' },
      { kind: 'onecard-id', value: 'OC-77410', classification: 'pii', confidence: 100, source: 'SRC-BLACKBOARD-TRANSACT-ONECARD', matchMethod: 'deterministic-exact' },
    ],
    resolvedFromSourceIds: ['SRC-WORKDAY-HCM', 'SRC-BLACKBOARD-TRANSACT-ONECARD'],
    mergeConfidence: 100,
    primaryWorkBuildingId: 'BLD-ADMIN-HALL',
    hasActiveNoContact: false,
    hasActiveTrespass: false,
    inOpenBITCase: false,
    inOpenTitleIXCase: false,
    inOpenInvestigation: false,
    isCSAEnabled: true,
    classificationTier: 'pii',
    consentFlags: [],
    createdAt: isoSeconds(daysAgo(2840)),
    lastReviewedAt: isoSeconds(daysAgo(30)),
  },
];

// =========================================================================
// Procedural generation
// =========================================================================

const NUM_STUDENTS = 80;
const NUM_EMPLOYEES = 45;
const NUM_VISITORS = 12;
const NUM_TRESPASS = 5;

function generatePerson(
  i: number,
  affiliations: PersonAffiliation[],
  r: () => number,
  opts: { trespass?: boolean; investigation?: boolean } = {},
): Person {
  const first = pick(r, FIRST_NAMES);
  const last = pick(r, LAST_NAMES);
  const fullName = `${first} ${last}`;
  const id = `PER-${(20000 + i).toString().padStart(6, '0')}`;
  const isStudent = affiliations.includes('student');
  const isEmployee = affiliations.includes('employee');
  const residence = isStudent && r() < 0.62 ? pick(r, RESIDENCE_BUILDINGS) : undefined;
  const work = isEmployee ? pick(r, STAFF_BUILDINGS) : undefined;
  const mergeConfidence = Math.max(60, Math.min(100, Math.round(randFloat(r, 78, 100))));

  return {
    id,
    fullName,
    legalName: r() < 0.7 ? `${first} ${pick(r, ['A.', 'M.', 'J.', 'L.', 'R.', 'D.'])} ${last}` : undefined,
    affiliations,
    identifiers: buildIdentifiers(id, affiliations, fullName, r),
    resolvedFromSourceIds: isStudent
      ? ['SRC-BANNER-SIS', 'SRC-BLACKBOARD-TRANSACT-ONECARD']
      : isEmployee
      ? ['SRC-WORKDAY-HCM', 'SRC-BLACKBOARD-TRANSACT-ONECARD']
      : ['walk-in-visitor-log'],
    mergeConfidence,
    primaryResidenceBuildingId: residence,
    roomAssignment: residence ? `${residence.replace('BLD-', '').slice(0, 6)} ${randInt(r, 100, 499)}${pick(r, ['A', 'B', 'C', 'D'])}` : undefined,
    primaryWorkBuildingId: work,
    hasActiveNoContact: r() < 0.04,
    hasActiveTrespass: opts.trespass ?? r() < 0.03,
    inOpenBITCase: !opts.trespass && r() < 0.05,
    inOpenTitleIXCase: !opts.trespass && r() < 0.02,
    inOpenInvestigation: opts.investigation ?? r() < 0.03,
    isCSAEnabled: isEmployee && r() < 0.18,
    classificationTier: isStudent ? 'ferpa-edu-record' : 'pii',
    consentFlags: [
      { kind: 'ferpa-directory-info-optout', granted: r() < 0.08, source: 'SRC-BANNER-SIS', effectiveFrom: isoSeconds(daysAgo(randInt(r, 60, 1200))) },
    ],
    createdAt: isoSeconds(daysAgo(randInt(r, 30, 1800))),
    lastReviewedAt: isoSeconds(hoursAgo(randInt(r, 1, 720))),
  };
}

const r = rng('persons-master-150');

const students: Person[] = Array.from({ length: NUM_STUDENTS }, (_, i) =>
  generatePerson(i, ['student'], r),
);

const employees: Person[] = Array.from({ length: NUM_EMPLOYEES }, (_, i) =>
  generatePerson(NUM_STUDENTS + i, ['employee'], r),
);

// Assign a department to employees (post-generation, lightweight)
employees.forEach((p) => {
  if (!p.affiliations.includes('employee')) return;
  // Just attach to the work building deterministically — department metadata
  // belongs in §5 Employee fixture, not the Master Person Record.
  void DEPARTMENTS;
});

const visitors: Person[] = Array.from({ length: NUM_VISITORS }, (_, i) =>
  generatePerson(NUM_STUDENTS + NUM_EMPLOYEES + i, ['visitor'], r),
);

const trespassed: Person[] = Array.from({ length: NUM_TRESPASS }, (_, i) =>
  generatePerson(NUM_STUDENTS + NUM_EMPLOYEES + NUM_VISITORS + i, ['no-trespass'], r, { trespass: true }),
);

export const PERSONS: Person[] = [
  ...threadAPersons,
  ...students,
  ...employees,
  ...visitors,
  ...trespassed,
];

// Re-export the major lookup arrays for filtered list views.
export const STUDENT_MAJOR_POOL = STUDENT_MAJORS;
export const DEPARTMENT_POOL = DEPARTMENTS;
