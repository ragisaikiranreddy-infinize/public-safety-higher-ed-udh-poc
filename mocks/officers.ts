/**
 * Officers — ~45 sworn personnel + civilian Campus Security Officers (CSOs).
 *
 * Each Officer optionally references an Employee record in §5 (post-R3).
 * Officer IDs are stable: OFC-0100..OFC-0145, with OFC-0124 anchored as the
 * primary officer on multiple Thread A/B/C incidents.
 */

import type { Officer } from '@/lib/types';
import { rng, randInt, pick } from '@/lib/seed';
import { isoSeconds, daysAgo } from '@/lib/time';

const NAMES = [
  'Samantha Reyes', 'Marcus Webb', 'Joseph Nguyen', 'Devon Patel', 'Erica Liu',
  'Brandon Murphy', 'Christopher Davis', 'Anita Sharma', 'Travis Cole',
  'Jamal Robinson', 'Diana Foster', 'Kevin O\'Brien', 'Maya Singh', 'Antonio Russo',
  'Lauren Walsh', 'Hector Vargas', 'Daniel Park', 'Tasha Williams', 'Vincent Lee',
  'Rachel Bennett', 'Andre Jackson', 'Sophie Mueller', 'Tyrone Brooks',
  'Olivia Schneider', 'Eric Chen', 'Kayla Morgan', 'Nathaniel Ross',
  'Carla Mendoza', 'Bryan Carter', 'Felicia Bailey', 'Sergio Diaz',
  'Hannah Cohen', 'Mateo Garcia', 'Whitney James', 'Aaron Hill',
  'Janelle Pierce', 'Owen Adams', 'Caroline Hayes', 'Ramon Castillo',
  'Priscilla Brooks', 'Trevor Knox', 'Yolanda Pearson', 'Quentin Maxwell',
  'Megan Pruitt', 'Jordan Reyes',
];

const RANKS = ['officer', 'sergeant', 'lieutenant', 'captain', 'chief', 'cso'] as const;

const r = rng('officers-45');

function generate(i: number): Officer {
  const isCSO = i >= 40; // last 5 are civilian CSOs
  const name = NAMES[i] ?? `${pick(r, NAMES).split(' ')[0]} ${pick(r, NAMES).split(' ')[1] ?? 'Smith'}`;
  const rank = isCSO ? 'cso' as const : pickRank(i, r);
  return {
    id: `OFC-${(100 + i).toString().padStart(4, '0')}`,
    fullName: name,
    badgeNumber: `${randInt(r, 1000, 9999)}`,
    rank,
    hireDate: isoSeconds(daysAgo(randInt(r, 90, 7200))),
    isCitTrained: r() < 0.45,
    classification: 'pii',
  };
}

function pickRank(i: number, r2: () => number): typeof RANKS[number] {
  // Hand-shaped pyramid: 1 chief, 2 captains, 4 lts, 8 sgts, rest officers.
  if (i === 0) return 'chief';
  if (i <= 2) return 'captain';
  if (i <= 6) return 'lieutenant';
  if (i <= 14) return 'sergeant';
  void r2;
  return 'officer';
}

// Make OFC-0124 a sergeant (primary officer on Thread A/B/C incidents)
const baseOfficers: Officer[] = Array.from({ length: 45 }, (_, i) => generate(i));

// Pin Thread anchors
const sergeantIdx = baseOfficers.findIndex((o) => o.id === 'OFC-0124');
if (sergeantIdx >= 0) {
  baseOfficers[sergeantIdx] = {
    ...baseOfficers[sergeantIdx],
    fullName: 'Sergeant Devon Patel',
    rank: 'sergeant',
    isCitTrained: true,
  };
}

// Pin chief — OFC-0100
const chiefIdx = baseOfficers.findIndex((o) => o.id === 'OFC-0100');
if (chiefIdx >= 0) {
  baseOfficers[chiefIdx] = {
    ...baseOfficers[chiefIdx],
    fullName: 'Chief Samantha Reyes',
    rank: 'chief',
    isCitTrained: true,
  };
}

// Pin OFC-0021 as the Clery Compliance Officer's go-to duty officer
// (referenced in mart.timely_warning_decisions sample row)
baseOfficers.push({
  id: 'OFC-0021',
  fullName: 'Officer Maria Hernandez',
  badgeNumber: '2104',
  rank: 'officer',
  hireDate: isoSeconds(daysAgo(2840)),
  isCitTrained: true,
  classification: 'pii',
});

export const OFFICERS: Officer[] = baseOfficers;
