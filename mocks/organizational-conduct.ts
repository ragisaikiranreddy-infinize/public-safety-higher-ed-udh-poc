/**
 * Organizational conduct — Greek chapters, athletic teams, cultural orgs.
 *
 * Per the Stop Campus Hazing Act (2024), institutions must maintain a
 * published roster of organizations found responsible for hazing. The
 * fixture seeds 10 organizational cases including one published-to-roster
 * Greek-chapter case for the demo.
 */

import type {
  OrganizationalConductCase,
  OrganizationKind,
  OrgConductStatus,
} from '@/lib/types';
import { isoSeconds, daysAgo } from '@/lib/time';
import { rng, randInt, pick } from '@/lib/seed';

const r = rng('org-conduct-v1');

const ORGS: { name: string; kind: OrganizationKind; chapterSize: number }[] = [
  { name: 'Alpha Phi Kappa (national chapter)', kind: 'fraternity', chapterSize: 78 },
  { name: 'Beta Delta Sigma', kind: 'sorority', chapterSize: 92 },
  { name: 'Gamma Theta Pi', kind: 'fraternity', chapterSize: 64 },
  { name: 'Men\'s Lacrosse', kind: 'athletic-team', chapterSize: 38 },
  { name: 'Women\'s Soccer', kind: 'athletic-team', chapterSize: 26 },
  { name: 'Black Student Union', kind: 'cultural-org', chapterSize: 220 },
  { name: 'International Student Association', kind: 'cultural-org', chapterSize: 410 },
  { name: 'Outdoor Adventures Club', kind: 'club', chapterSize: 145 },
  { name: 'Epsilon Chi Mu', kind: 'fraternity', chapterSize: 52 },
  { name: 'Pre-Med Society', kind: 'club', chapterSize: 168 },
];

const SUMMARIES = [
  'Hazing allegation involving forced alcohol consumption during a recruitment week event.',
  'Unregistered event with alcohol present served to underage members.',
  'Property-damage incident at off-campus chapter house.',
  'Repeated noise + community-standards violations from chapter house.',
  'Misuse of organization name to host unauthorized off-campus retreat.',
  'Allegations of exclusionary practices in selection / hazing process.',
  'Failure to comply with athletics-department code of conduct.',
];

export const ORGANIZATIONAL_CONDUCT_CASES: OrganizationalConductCase[] = ORGS.map((o, i) => {
  const status: OrgConductStatus = i === 0
    ? 'sanction-active'
    : i === 1
    ? 'derecognized'
    : pick(r, ['reported', 'investigation', 'sanction-pending', 'sanction-active', 'closed'] as const);
  const hazingActReportable = i < 3 && r() < 0.7;
  const publishedToRoster = i === 1; // Beta Delta Sigma — derecognized for hazing
  const openedDays = randInt(r, 30, 400);
  return {
    id: `ORG-2026-${(i + 1).toString().padStart(4, '0')}`,
    organizationName: o.name,
    organizationKind: o.kind,
    chapterSize: o.chapterSize,
    status,
    openedAt: isoSeconds(daysAgo(openedDays)),
    closedAt: status === 'closed' || status === 'derecognized' ? isoSeconds(daysAgo(Math.max(0, openedDays - 60))) : undefined,
    hazingActReportable,
    publishedToRoster,
    summary: pick(r, SUMMARIES),
    individualMemberChargedCount: hazingActReportable ? randInt(r, 4, 14) : randInt(r, 0, 3),
    classification: 'ferpa-edu-record',
  };
});
