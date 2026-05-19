/**
 * Role context — single auth + RBAC swap-point.
 *
 * Nine active personas. Each persona has:
 *   - `homeKpiOrder[]`     — order of KPI tiles on /
 *   - `visibleSidebar[]`   — which sidebar groups are visible
 *   - `classifications[]`  — which Classification values this persona can see
 *
 * In production, replace RoleProvider with one that resolves identity from
 * Entra ID / Okta / Shibboleth and computes these fields server-side.
 */

import * as React from 'react';
import type { Classification, RoleId } from './types';

export interface RoleConfig {
  id: RoleId;
  label: string;
  description: string;
  homeKpiOrder: string[];
  visibleSidebar: string[];
  classifications: Classification[];
}

const SIDEBAR_GROUPS = [
  'Overview',
  // R8: Data split into two surfaces.
  //   "Lineage & Audit" — Catalog + Metrics + Lineage view; read-only-feeling
  //     surface for compliance personas (Clery Officer, BIT Chair, Audit lead).
  //   "Data Platform" — Sources + Pipelines + Quality; admin surface for
  //     platform-operator personas (CISO / IT Director).
  'Lineage & Audit',
  'Data Platform',
  'Incidents',
  'People',
  'Threat Intel',
  'Conduct',
  'Title IX',
  'EOC',
  'Surveillance',
  'Campus Ops',
  'Compliance',
  'Officers',
  'Intelligence',
  'Trust',
] as const;

const ROLE_CONFIGS: Record<RoleId, RoleConfig> = {
  'chief-of-police': {
    id: 'chief-of-police',
    label: 'Chief of Police',
    description: 'Top-of-department command. CJI access; not Title IX or counseling.',
    homeKpiOrder: ['open-incidents', 'avg-response-time', 'active-runbooks', 'open-bit-cases'],
    visibleSidebar: [
      'Overview', 'Incidents', 'People', 'Threat Intel', 'EOC',
      'Surveillance', 'Compliance', 'Officers', 'Intelligence', 'Trust',
    ],
    classifications: [
      'public', 'internal', 'ferpa-edu-record', 'cji',
      'pii', 'restricted-investigation',
    ],
  },
  dispatcher: {
    id: 'dispatcher',
    label: 'Dispatcher (PSAP)',
    description: 'Call-take + dispatch. CJI access; operational scope only.',
    homeKpiOrder: ['calls-in-queue', 'units-available', 'live-event-count', 'open-incidents'],
    visibleSidebar: ['Overview', 'Incidents', 'People', 'Surveillance', 'Campus Ops'],
    classifications: ['public', 'internal', 'cji'],
  },
  'eoc-director': {
    id: 'eoc-director',
    label: 'EOC Director',
    description: 'Activations, runbooks, common operating picture.',
    homeKpiOrder: [
      'active-activations', 'buildings-in-lockdown', 'campaigns-sent', 'generator-alerts',
    ],
    // R8 split: EOC duty officer needs source health pre-activation → Data Platform.
    visibleSidebar: [
      'Overview', 'Data Platform', 'EOC', 'Surveillance', 'Campus Ops', 'Compliance', 'Intelligence',
    ],
    classifications: ['public', 'internal', 'cji'],
  },
  'dean-of-students': {
    id: 'dean-of-students',
    label: 'Dean of Students',
    description:
      'Student conduct, substance misconduct, residential, sanctions, parental notification.',
    homeKpiOrder: [
      'open-conduct-cases', 'substance-pattern-alerts', 'sanctions-due', 'open-bit-cases',
    ],
    visibleSidebar: ['Overview', 'People', 'Threat Intel', 'Conduct', 'Intelligence'],
    classifications: ['public', 'internal', 'ferpa-edu-record', 'pii', 'juvenile'],
  },
  'title-ix-coordinator': {
    id: 'title-ix-coordinator',
    label: 'Title IX Coordinator',
    description: 'Walled Title IX workflow. Supportive measures, statutory deadlines.',
    homeKpiOrder: [
      'open-title-ix-cases', 'supportive-measures-active', 'statutory-deadlines', 'annual-stats',
    ],
    visibleSidebar: ['Overview', 'People', 'Title IX', 'Compliance', 'Intelligence'],
    classifications: [
      'public', 'internal', 'ferpa-edu-record', 'title-ix-sensitive', 'pii',
    ],
  },
  'bit-chair': {
    id: 'bit-chair',
    label: 'CARE / BIT Chair',
    description: 'Behavioral threat assessment. NaBITA-aligned review.',
    homeKpiOrder: [
      'open-bit-cases', 'risk-tier-changed', 'weekly-meeting-agenda', 'barrier-hits',
    ],
    // R8 split: CARE chair gets the read-only lineage/audit surface — Lineage & Audit.
    // (For diagnosing a stale BIT briefing they cross-check the catalog freshness
    // pill; full pipeline ops belongs to CISO.)
    visibleSidebar: ['Overview', 'Lineage & Audit', 'People', 'Threat Intel', 'Conduct', 'Intelligence'],
    classifications: ['public', 'internal', 'ferpa-edu-record', 'pii'],
  },
  'clery-officer': {
    id: 'clery-officer',
    label: 'Clery Compliance Officer',
    description: 'Annual Security Report, geography, Timely Warnings, CSA register.',
    homeKpiOrder: [
      'asr-completeness', 'timely-warnings', 'csa-outstanding', 'hate-crime-review',
    ],
    // R8 split: Clery officer is a compliance role — Lineage & Audit only.
    // ASR lineage trace lives in Catalog; mart freshness is still visible there.
    visibleSidebar: ['Overview', 'Lineage & Audit', 'Incidents', 'Compliance', 'Intelligence'],
    classifications: ['public', 'internal', 'cji'],
  },
  ciso: {
    id: 'ciso',
    label: 'CISO / IT Director',
    description: 'Platform health, governance, audit oversight. All-access (with logging).',
    homeKpiOrder: [
      'sources-unhealthy', 'barrier-hits-today', 'cji-access-events', 'dr-posture',
    ],
    // R8 split: CISO keeps both surfaces — sees Lineage & Audit (read) and
    // Data Platform (admin).
    visibleSidebar: ['Overview', 'Lineage & Audit', 'Data Platform', 'Trust'],
    classifications: [
      'public', 'internal', 'ferpa-edu-record', 'cji', 'title-ix-sensitive',
      'pii', 'phi', 'juvenile', 'restricted-investigation',
    ],
  },
  executive: {
    id: 'executive',
    label: 'Executive (Provost / President)',
    description: 'Aggregate-only KPIs; no row-level PII.',
    homeKpiOrder: [
      'incidents-ytd', 'bit-cases-trend', 'clery-audit-posture', 'campus-safety-score',
    ],
    visibleSidebar: ['Overview', 'Compliance', 'Intelligence'],
    classifications: ['public', 'internal'],
  },
};

interface RoleContextValue {
  role: RoleId;
  config: RoleConfig;
  allRoles: RoleConfig[];
  sidebarGroups: readonly string[];
  setRole: (r: RoleId) => void;
  canSee: (c: Classification) => boolean;
}

const RoleContext = React.createContext<RoleContextValue | null>(null);

export function RoleProvider({
  initial,
  children,
}: {
  initial: RoleId;
  children: React.ReactNode;
}) {
  const [role, setRole] = React.useState<RoleId>(initial);
  const config = ROLE_CONFIGS[role];

  const canSee = React.useCallback(
    (c: Classification) => config.classifications.includes(c),
    [config],
  );

  const value: RoleContextValue = React.useMemo(
    () => ({
      role,
      config,
      allRoles: Object.values(ROLE_CONFIGS),
      sidebarGroups: SIDEBAR_GROUPS,
      setRole,
      canSee,
    }),
    [role, config, canSee],
  );

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole(): RoleContextValue {
  const v = React.useContext(RoleContext);
  if (!v) throw new Error('useRole must be used inside <RoleProvider>');
  return v;
}

export { ROLE_CONFIGS, SIDEBAR_GROUPS };
