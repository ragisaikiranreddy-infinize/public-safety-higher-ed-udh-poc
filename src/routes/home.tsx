/**
 * Command Center — the hero screen.
 *
 * R0 ships a foundation version: KPI strip + role-aware reshape + roadmap
 * placeholders for the campus map and live ticker (both land in R4).
 *
 * This page demonstrates the spine already works:
 *   - role switcher in header reshapes the KPI tile order
 *   - sidebar groups appear/disappear per persona
 *   - PageHeader + Card primitives + theme tokens
 *   - mock-db helpers (residentialBuildingCount, totalResidentialOccupancy,
 *     shelterDesignatedBuildings) are working end-to-end
 */

import { useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CampusMap, DEFAULT_LAYERS } from '@/components/map/campus-map';
import { useRole } from '@/lib/role-context';
import {
  BUILDINGS,
  RESIDENCE_HALLS,
  BEATS,
  REGIONS,
  shelterDesignatedBuildings,
  totalResidentialOccupancy,
  totalResidentialCapacity,
} from '@/lib/mock-db';
import { currentSemester, currentShift } from '@/lib/time';
import {
  Activity,
  Building2,
  Bed,
  ShieldCheck,
  MapPin,
  Sparkles,
} from 'lucide-react';

interface KpiSpec {
  id: string;
  label: string;
  value: string;
  icon: React.ElementType;
  hint: string;
}

const KPI_LIBRARY: Record<string, KpiSpec> = {
  'open-incidents': {
    id: 'open-incidents',
    label: 'Open incidents',
    value: '— ',
    icon: Activity,
    hint: 'Lights up in R3 with CAD fixtures.',
  },
  'avg-response-time': {
    id: 'avg-response-time',
    label: 'Avg response (today)',
    value: '— ',
    icon: Activity,
    hint: 'Lights up in R3 with CAD fixtures.',
  },
  'active-runbooks': {
    id: 'active-runbooks',
    label: 'Active runbooks',
    value: '— ',
    icon: ShieldCheck,
    hint: 'Lights up in R6 with EOC thread.',
  },
  'open-bit-cases': {
    id: 'open-bit-cases',
    label: 'Open BIT / CARE cases',
    value: '— ',
    icon: Sparkles,
    hint: 'Lights up in R5 with Thread A.',
  },
  'calls-in-queue': {
    id: 'calls-in-queue',
    label: 'Calls in queue',
    value: '— ',
    icon: Activity,
    hint: 'Lights up in R3.',
  },
  'units-available': {
    id: 'units-available',
    label: 'Units available',
    value: '— ',
    icon: Activity,
    hint: 'Lights up in R3.',
  },
  'live-event-count': {
    id: 'live-event-count',
    label: 'Live events (rolling)',
    value: '— ',
    icon: Activity,
    hint: 'Lights up in R3.',
  },
  'active-activations': {
    id: 'active-activations',
    label: 'EOC activations',
    value: '— ',
    icon: ShieldCheck,
    hint: 'Lights up in R6 with Thread B.',
  },
  'buildings-in-lockdown': {
    id: 'buildings-in-lockdown',
    label: 'Buildings in lockdown',
    value: '— ',
    icon: ShieldCheck,
    hint: 'Lights up in R6.',
  },
  'campaigns-sent': {
    id: 'campaigns-sent',
    label: 'Notifications sent today',
    value: '— ',
    icon: ShieldCheck,
    hint: 'Lights up in R6.',
  },
  'generator-alerts': {
    id: 'generator-alerts',
    label: 'Generator alerts',
    value: '— ',
    icon: ShieldCheck,
    hint: 'Lights up in R6.',
  },
  'open-conduct-cases': {
    id: 'open-conduct-cases',
    label: 'Open conduct cases',
    value: '— ',
    icon: Sparkles,
    hint: 'Lights up in R8 with Module 5B.',
  },
  'substance-pattern-alerts': {
    id: 'substance-pattern-alerts',
    label: 'Substance-pattern alerts',
    value: '— ',
    icon: Sparkles,
    hint: 'Lights up in R8.',
  },
  'sanctions-due': {
    id: 'sanctions-due',
    label: 'Sanctions due (7d)',
    value: '— ',
    icon: Sparkles,
    hint: 'Lights up in R8.',
  },
  'open-title-ix-cases': {
    id: 'open-title-ix-cases',
    label: 'Open Title IX cases',
    value: '— ',
    icon: Sparkles,
    hint: 'Walled. Visible only in Title IX role.',
  },
  'supportive-measures-active': {
    id: 'supportive-measures-active',
    label: 'Supportive measures active',
    value: '— ',
    icon: Sparkles,
    hint: 'Walled.',
  },
  'statutory-deadlines': {
    id: 'statutory-deadlines',
    label: 'Statutory deadlines approaching',
    value: '— ',
    icon: Sparkles,
    hint: 'Walled.',
  },
  'annual-stats': {
    id: 'annual-stats',
    label: 'Annual stats progress',
    value: '— ',
    icon: Sparkles,
    hint: 'Walled.',
  },
  'risk-tier-changed': {
    id: 'risk-tier-changed',
    label: 'Risk tier changed (7d)',
    value: '— ',
    icon: Sparkles,
    hint: 'Lights up in R5.',
  },
  'weekly-meeting-agenda': {
    id: 'weekly-meeting-agenda',
    label: 'Weekly meeting agenda',
    value: '— ',
    icon: Sparkles,
    hint: 'Lights up in R5.',
  },
  'barrier-hits': {
    id: 'barrier-hits',
    label: 'Barrier hits today',
    value: '— ',
    icon: ShieldCheck,
    hint: 'Lights up in R3 with role-context.',
  },
  'asr-completeness': {
    id: 'asr-completeness',
    label: 'ASR build completeness',
    value: '— ',
    icon: ShieldCheck,
    hint: 'Lights up in R7 with Thread C.',
  },
  'timely-warnings': {
    id: 'timely-warnings',
    label: 'Timely Warnings (week)',
    value: '— ',
    icon: ShieldCheck,
    hint: 'Lights up in R7.',
  },
  'csa-outstanding': {
    id: 'csa-outstanding',
    label: 'CSA reports outstanding',
    value: '— ',
    icon: ShieldCheck,
    hint: 'Lights up in R7.',
  },
  'hate-crime-review': {
    id: 'hate-crime-review',
    label: 'Hate-crime review queue',
    value: '— ',
    icon: ShieldCheck,
    hint: 'Lights up in R7.',
  },
  'sources-unhealthy': {
    id: 'sources-unhealthy',
    label: 'Sources unhealthy',
    value: '— ',
    icon: ShieldCheck,
    hint: 'Lights up in R1 with source registry.',
  },
  'barrier-hits-today': {
    id: 'barrier-hits-today',
    label: 'Barrier hits (24h)',
    value: '— ',
    icon: ShieldCheck,
    hint: 'Lights up in R3.',
  },
  'cji-access-events': {
    id: 'cji-access-events',
    label: 'CJI access events',
    value: '— ',
    icon: ShieldCheck,
    hint: 'Lights up in R8 with governance.',
  },
  'dr-posture': {
    id: 'dr-posture',
    label: 'DR posture',
    value: '— ',
    icon: ShieldCheck,
    hint: 'Lights up in R8.',
  },
  'incidents-ytd': {
    id: 'incidents-ytd',
    label: 'Incidents YTD',
    value: '— ',
    icon: Activity,
    hint: 'Lights up in R3.',
  },
  'bit-cases-trend': {
    id: 'bit-cases-trend',
    label: 'BIT cases trend',
    value: '— ',
    icon: Sparkles,
    hint: 'Lights up in R5.',
  },
  'clery-audit-posture': {
    id: 'clery-audit-posture',
    label: 'Clery audit posture',
    value: '— ',
    icon: ShieldCheck,
    hint: 'Lights up in R7.',
  },
  'campus-safety-score': {
    id: 'campus-safety-score',
    label: 'Campus safety score',
    value: '— ',
    icon: ShieldCheck,
    hint: 'Lights up in R9.',
  },
};

export default function HomePage() {
  const { config } = useRole();
  const [layers, setLayers] = useState(DEFAULT_LAYERS);
  // Role-aware: pick first 4 KPIs from the persona's homeKpiOrder.
  const kpis = config.homeKpiOrder
    .slice(0, 4)
    .map((id) => KPI_LIBRARY[id])
    .filter(Boolean);

  const totalBuildings = BUILDINGS.length;
  const totalResHalls = RESIDENCE_HALLS.length;
  const shelterCount = shelterDesignatedBuildings().length;
  const occupancy = totalResidentialOccupancy();
  const capacity = totalResidentialCapacity();
  const occupancyPct = Math.round((occupancy / capacity) * 100);

  return (
    <>
      <PageHeader
        eyebrow={`${currentSemester()} Semester · Shift ${currentShift()}`}
        title="Command Center"
        description={`${config.label} view. KPIs reshape on role switch; sidebar visibility reshapes too. Click any persona in the header to see governance in motion.`}
      />

      <div className="space-y-6 px-8 py-6">
        {/* KPI strip — role-aware, top 4 from homeKpiOrder */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {kpis.map((k) => {
            const Icon = k.icon;
            return (
              <Card key={k.id}>
                <CardContent className="p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                      {k.label}
                    </div>
                    <Icon className="h-4 w-4 text-[var(--muted-foreground)]" />
                  </div>
                  <div className="font-display text-2xl font-semibold text-[var(--foreground)]">
                    {k.value}
                  </div>
                  <div className="mt-2 text-[11px] text-[var(--muted-foreground)]">
                    {k.hint}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Foundation status — what's working at end of R0 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>R0 — Foundation status</CardTitle>
              <Badge variant="success">All systems green</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <Item ok label="Vite + React 19 + TypeScript 5.7" />
              <Item ok label="Tailwind v4 (CSS-first) with public-safety tokens" />
              <Item ok label="React Router v7 (data router)" />
              <Item ok label="Role-context provider (9 personas)" />
              <Item ok label="Sidebar + Header + AppShell" />
              <Item ok label="mock-db swap-point (seed: regions, buildings, residence halls, beats)" />
              <Item ok label="ANCHOR-based time discipline" />
              <Item ok label="mulberry32 deterministic RNG" />
              <Item ok label="GeoPoint / GeoPolygon kit (geo.ts)" />
              <Item ok label="Types §1–§7 stubbed (~80 entities catalog target)" />
            </div>
            <Separator />
            <p className="text-xs leading-relaxed text-[var(--muted-foreground)]">
              <strong className="font-semibold text-[var(--foreground)]">Next up — R1:</strong>{' '}
              Medallion catalog (~45 datasets), source registry (~22 sources),
              pipelines list with five-tab detail, xyflow lineage graph, six-dimension DQ
              console. Then R2 wires the live pipeline state machine + 8-step source
              onboarding wizard.
            </p>
          </CardContent>
        </Card>

        {/* Live mock-db demo — proves the spine works */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Campus geography</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Row icon={Building2} label="Buildings" value={`${totalBuildings}`} />
              <Row icon={Bed} label="Residence halls" value={`${totalResHalls}`} />
              <Row icon={ShieldCheck} label="Shelter-designated" value={`${shelterCount}`} />
              <Row icon={MapPin} label="Patrol beats" value={`${BEATS.length}`} />
              <Row icon={MapPin} label="Regions" value={`${REGIONS.length}`} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Residential capacity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                Current occupancy
              </div>
              <div className="font-display text-3xl font-semibold">
                {occupancy.toLocaleString()}
                <span className="ml-2 text-base font-normal text-[var(--muted-foreground)]">
                  / {capacity.toLocaleString()}
                </span>
              </div>
              <div className="mt-1 text-xs text-[var(--muted-foreground)]">
                {occupancyPct}% of designed capacity across {totalResHalls} halls
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--graphite-100)]">
                <div
                  className="h-full bg-[var(--hub-600)]"
                  style={{ width: `${occupancyPct}%` }}
                />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Classification taxonomy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-3 text-xs text-[var(--muted-foreground)]">
                10-tier scale enforced at row + column level (lights up in R3+).
              </p>
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="public">public</Badge>
                <Badge variant="internal">internal</Badge>
                <Badge variant="ferpa">ferpa-edu-record</Badge>
                <Badge variant="cji">cji</Badge>
                <Badge variant="title-ix">title-ix-sensitive</Badge>
                <Badge variant="counseling">counseling-42cfr2</Badge>
                <Badge variant="pii">pii</Badge>
                <Badge variant="phi">phi</Badge>
                <Badge variant="juvenile">juvenile</Badge>
                <Badge variant="restricted-investigation">restricted-investigation</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Campus map — the live hero (R4) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Campus map
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <CampusMap
              layers={layers}
              onLayersChange={setLayers}
              height={460}
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function Item({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`inline-block h-2 w-2 rounded-full ${
          ok ? 'bg-[var(--signal-green)]' : 'bg-[var(--graphite-300)]'
        }`}
      />
      <span>{label}</span>
    </div>
  );
}

function Row({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <div className="font-display text-base font-semibold">{value}</div>
    </div>
  );
}
