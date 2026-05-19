/**
 * Per-case violation charges.
 *
 * Each conduct case carries 1..3 charges drawn from the Code of Student
 * Conduct. The Thread A cases get hand-authored charges; the rest get
 * procedural draws keyed off the subtype.
 */

import type { ConductCharge, ConductSubtype, RegulationId } from '@/lib/types';
import { rng, randInt, pick } from '@/lib/seed';
import { CONDUCT_CASES } from './conduct-cases';
import {
  THREAD_A_PRIOR_ALCOHOL_CONDUCT_CASE_ID,
  THREAD_A_GUEST_POLICY_CONDUCT_CASE_ID,
} from './threads';

const r = rng('charges-v1');

interface ChargeTemplate {
  code: string;
  label: string;
  regulatoryHooks: RegulationId[];
}

const TEMPLATES: Record<ConductSubtype, ChargeTemplate[]> = {
  'substance': [
    { code: 'R-3.1.A', label: 'Possession or consumption of alcohol by underage student', regulatoryHooks: ['REG-DFSCA', 'REG-FERPA-99-31'] },
    { code: 'R-3.1.B', label: 'Possession or use of controlled substances', regulatoryHooks: ['REG-DFSCA', 'REG-FERPA-99-31'] },
    { code: 'R-3.1.C', label: 'Open-container violation in residence common space', regulatoryHooks: ['REG-DFSCA'] },
    { code: 'R-3.1.D', label: 'Hosting unregistered party with alcohol present', regulatoryHooks: ['REG-DFSCA'] },
  ],
  'residential': [
    { code: 'R-4.2.A', label: 'Guest-policy violation — unauthorized non-resident', regulatoryHooks: [] },
    { code: 'R-4.2.B', label: 'Unauthorized entry to a residence hall', regulatoryHooks: [] },
    { code: 'R-4.2.C', label: 'Quiet-hours / community-standards violation', regulatoryHooks: [] },
    { code: 'R-4.2.D', label: 'Tampering with residence-hall life-safety equipment', regulatoryHooks: ['REG-CLERY'] },
  ],
  'academic-integrity': [
    { code: 'R-5.1.A', label: 'Plagiarism', regulatoryHooks: ['REG-FERPA'] },
    { code: 'R-5.1.B', label: 'Unauthorized collaboration', regulatoryHooks: ['REG-FERPA'] },
    { code: 'R-5.1.C', label: 'Unattributed use of generative AI', regulatoryHooks: ['REG-FERPA'] },
    { code: 'R-5.1.D', label: 'Fabrication of data or sources', regulatoryHooks: ['REG-FERPA'] },
  ],
  'sexual-misconduct': [
    { code: 'R-6.1.A', label: 'Non-consensual sexual contact', regulatoryHooks: ['REG-TITLE-IX', 'REG-VAWA'] },
    { code: 'R-6.1.B', label: 'Sexual harassment under institutional policy', regulatoryHooks: ['REG-TITLE-IX'] },
    { code: 'R-6.1.C', label: 'Stalking under institutional policy', regulatoryHooks: ['REG-VAWA', 'REG-TITLE-IX'] },
  ],
  'physical-altercation': [
    { code: 'R-7.1.A', label: 'Physical assault', regulatoryHooks: ['REG-CLERY'] },
    { code: 'R-7.1.B', label: 'Threatening behavior', regulatoryHooks: [] },
    { code: 'R-7.1.C', label: 'Fighting in a public-campus space', regulatoryHooks: [] },
  ],
  'bias-incident': [
    { code: 'R-8.1.A', label: 'Bias-motivated harassment', regulatoryHooks: ['REG-CLERY'] },
    { code: 'R-8.1.B', label: 'Discriminatory speech directed at a protected class', regulatoryHooks: [] },
  ],
  'organizational': [
    { code: 'R-9.1.A', label: 'Hazing (initiation activity)', regulatoryHooks: ['REG-STOP-CAMPUS-HAZING'] },
    { code: 'R-9.1.B', label: 'Unregistered event with alcohol present', regulatoryHooks: ['REG-DFSCA'] },
    { code: 'R-9.1.C', label: 'Misuse of organization name or facilities', regulatoryHooks: [] },
  ],
  'other': [
    { code: 'R-10.1.A', label: 'Disorderly conduct', regulatoryHooks: [] },
    { code: 'R-10.1.B', label: 'Failure to comply with university directive', regulatoryHooks: [] },
  ],
};

// =========================================================================
// Thread A — 4 hand-authored charges
// =========================================================================

const threadACharges: ConductCharge[] = [
  {
    id: 'CHG-2024-00211-01',
    conductCaseId: THREAD_A_PRIOR_ALCOHOL_CONDUCT_CASE_ID,
    code: 'R-3.1.A',
    label: 'Possession or consumption of alcohol by underage student',
    sustained: true,
    sustainingPersonId: 'PER-001008',
    regulatoryHooks: ['REG-DFSCA', 'REG-FERPA-99-31'],
    classification: 'ferpa-edu-record',
  },
  {
    id: 'CHG-2024-00211-02',
    conductCaseId: THREAD_A_PRIOR_ALCOHOL_CONDUCT_CASE_ID,
    code: 'R-3.1.C',
    label: 'Open-container violation in residence common space',
    sustained: true,
    sustainingPersonId: 'PER-001008',
    regulatoryHooks: ['REG-DFSCA'],
    classification: 'ferpa-edu-record',
  },
  {
    id: 'CHG-2025-01882-01',
    conductCaseId: THREAD_A_GUEST_POLICY_CONDUCT_CASE_ID,
    code: 'R-4.2.A',
    label: 'Guest-policy violation — unauthorized non-resident',
    sustained: true,
    sustainingPersonId: 'PER-001008',
    regulatoryHooks: [],
    classification: 'ferpa-edu-record',
  },
  {
    id: 'CHG-2025-01882-02',
    conductCaseId: THREAD_A_GUEST_POLICY_CONDUCT_CASE_ID,
    code: 'R-4.2.B',
    label: 'Unauthorized entry to a residence hall',
    sustained: true,
    sustainingPersonId: 'PER-001008',
    regulatoryHooks: [],
    classification: 'ferpa-edu-record',
  },
];

// =========================================================================
// Procedural — 1..3 charges per non-Thread-A case
// =========================================================================

const procedural: ConductCharge[] = [];
let seq = 0;
CONDUCT_CASES.filter(
  (c) =>
    c.id !== THREAD_A_PRIOR_ALCOHOL_CONDUCT_CASE_ID &&
    c.id !== THREAD_A_GUEST_POLICY_CONDUCT_CASE_ID,
).forEach((c) => {
  const templates = TEMPLATES[c.subtype] ?? TEMPLATES.other;
  const n = randInt(r, 1, Math.min(3, templates.length));
  const seen = new Set<string>();
  for (let i = 0; i < n; i++) {
    const t = pick(r, templates);
    if (seen.has(t.code)) continue;
    seen.add(t.code);
    seq++;
    procedural.push({
      id: `CHG-${seq.toString().padStart(6, '0')}`,
      conductCaseId: c.id,
      code: t.code,
      label: t.label,
      sustained:
        c.status === 'closed' || c.status === 'sanction-active' || c.status === 'closed-amnesty'
          ? r() > 0.15
          : null,
      sustainingPersonId:
        c.status === 'closed' || c.status === 'sanction-active' || c.status === 'closed-amnesty'
          ? 'PER-001008'
          : undefined,
      regulatoryHooks: t.regulatoryHooks,
      classification: 'ferpa-edu-record',
    });
  }
});

export const CONDUCT_CHARGES: ConductCharge[] = [...threadACharges, ...procedural];

export const THREAD_A_CONDUCT_CHARGES = threadACharges;
