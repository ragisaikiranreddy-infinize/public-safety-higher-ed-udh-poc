/**
 * Educational programs — the sanctions library for Student Conduct.
 *
 * Real-world examples per spec §4 Module 5A:
 *   - AlcoholEdu (EverFi)
 *   - Marijuana 101
 *   - BASICS (Brief Alcohol Screening + Intervention)
 *   - Stop Campus Hazing online module
 *   - Project Northland adolescent series
 *
 * R5 ships a small catalog (6 programs) covering substance + residential.
 */

import type { EduProgram } from '@/lib/types';

export const EDU_PROGRAMS: EduProgram[] = [
  {
    id: 'EDU-PROG-ALCEDU',
    name: 'AlcoholEdu',
    provider: 'EverFi',
    durationHours: 2.5,
    targetSubtype: 'substance',
    description: 'Online evidence-based alcohol prevention program required of first-year students nationally.',
  },
  {
    id: 'EDU-PROG-MARIJUANA-101',
    name: 'Marijuana 101',
    provider: '3rd Millennium Classrooms',
    durationHours: 1.5,
    targetSubtype: 'substance',
    description: 'Brief intervention for students sanctioned for marijuana-policy violations.',
  },
  {
    id: 'EDU-PROG-BASICS',
    name: 'BASICS (Brief Alcohol Screening + Intervention for College Students)',
    provider: 'Counseling Center',
    durationHours: 2.0,
    targetSubtype: 'substance',
    description: 'Two-session motivational-interviewing program for repeat alcohol-policy violators.',
  },
  {
    id: 'EDU-PROG-HAZE-PREV',
    name: 'Stop Campus Hazing — Online Prevention',
    provider: 'StopHazing.org',
    durationHours: 1.0,
    targetSubtype: 'organizational',
    description: 'Federally-aligned hazing-prevention module required by the Stop Campus Hazing Act.',
  },
  {
    id: 'EDU-PROG-RESLIFE-RESET',
    name: 'Residential Life Community Reset',
    provider: 'ResLife',
    durationHours: 3.0,
    targetSubtype: 'residential',
    description: 'In-person workshop for guest-policy + community-standards violations in residence halls.',
  },
  {
    id: 'EDU-PROG-NORTHLAND-ADV',
    name: 'Project Northland — Advanced',
    provider: 'Hazelden Publishing',
    durationHours: 4.0,
    targetSubtype: 'substance',
    description: 'Advanced alcohol-prevention series for high-risk drinking and repeated incidents.',
  },
];
