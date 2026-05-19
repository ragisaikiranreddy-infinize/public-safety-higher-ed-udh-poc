/**
 * Command Center — the hero screen.
 *
 * Role-aware KPI strip (top 4 from the persona's homeKpiOrder), live EOC
 * banner, the campus map, and supporting context (geography, residential
 * capacity, classification taxonomy). Each KPI is computed at render time
 * from the mock-db helpers — no static placeholders.
 */

import { useState, useMemo } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CampusMap, DEFAULT_LAYERS } from '@/components/map/campus-map';
import { useRole } from '@/lib/role-context';
import {
  BUILDINGS,
  RESIDENCE_HALLS,
  BEATS,
  REGIONS,
  UNITS,
  INCIDENTS,
  BIT_CASES,
  TITLE_IX_CASES,
  SANCTIONS,
  CONDUCT_CASES,
  RUNBOOK_EXECUTIONS,
  NOTIFICATION_CAMPAIGNS,
  shelterDesignatedBuildings,
  totalResidentialOccupancy,
  totalResidentialCapacity,
  activeWeatherAlerts,
  activeEOCActivations,
  openIncidentCount,
  avgResponseTimeMinutesToday,
  openBITCasesCount,
  openConductCasesCount,
  sanctionsDueCount,
  sourcesUnhealthy,
  generatorsByMode,
  notificationDeliveryRollup30d,
  cleryReportableCount,
} from '@/lib/mock-db';
import { getBarrierHits } from '@/lib/information-barriers';
import { currentSemester, currentShift, ANCHOR, hoursAgo } from '@/lib/time';
import { formatMinutes } from '@/lib/utils';
import {
  Activity,
  Building2,
  Bed,
  ShieldCheck,
  MapPin,
  Sparkles,
  AlertOctagon,
  Siren,
  Radio,
  Zap,
  Truck,
  ScrollText,
  Lock,
} from 'lucide-react';
import { Link } from 'react-router-dom';

// =========================================================================
// KPI library — computed live from mock-db
// =========================================================================

interface KpiSpec {
  id: string;
  label: string;
  icon: React.ElementType;
  /** Live value. Returns either a numeric/string display or null (then the
   *  card renders "—" + the hint). */
  compute: () => { value: string; hint: string; href?: string; tone?: 'critical' | 'warning' | 'good' };
}

/** Count incidents received in the past 24h. */
function incidentsLast24h(): number {
  const cutoff = hoursAgo(24).getTime();
  return INCIDENTS.filter((i) => new Date(i.receivedAt).getTime() >= cutoff).length;
}

/** Count notification campaigns sent in the past 24h. */
function campaignsLast24h(): number {
  const cutoff = hoursAgo(24).getTime();
  return NOTIFICATION_CAMPAIGNS.filter(
    (c) => c.sentAt && new Date(c.sentAt).getTime() >= cutoff,
  ).length;
}

/** Count BIT cases whose trend is rising or falling (i.e. changed) in 7d window.
 *  We treat any case with a `lastReviewedAt` inside 7d AND riskTrend≠stable as “changed”. */
function bitCasesWithChangedTier7d(): number {
  const cutoff = ANCHOR.getTime() - 7 * 24 * 60 * 60 * 1000;
  return BIT_CASES.filter(
    (c) =>
      new Date(c.lastReviewedAt).getTime() >= cutoff &&
      c.riskTrend !== 'stable' &&
      c.status !== 'closed',
  ).length;
}

const KPI_LIBRARY: Record<string, KpiSpec> = {
  // ---------- Operational ops (R3 + R6) ----------
  'open-incidents': {
    id: 'open-incidents',
    label: 'Open incidents',
    icon: Activity,
    compute: () => {
      const n = openIncidentCount();
      return { value: `${n}`, hint: 'open + on-scene + pending', href: '/incidents' };
    },
  },
  'avg-response-time': {
    id: 'avg-response-time',
    label: 'Avg response (today)',
    icon: Activity,
    compute: () => {
      const m = avgResponseTimeMinutesToday();
      return {
        value: m === null ? '—' : formatMinutes(m),
        hint: m === null ? 'no priority-1/2 incidents today' : 'priority 1 + 2 incidents',
        href: '/incidents',
        tone: m !== null && m > 6 ? 'warning' : 'good',
      };
    },
  },
  'calls-in-queue': {
    id: 'calls-in-queue',
    label: 'Calls in queue',
    icon: Activity,
    compute: () => {
      const n = INCIDENTS.filter((i) => i.status === 'open' || i.status === 'pending').length;
      return { value: `${n}`, hint: 'open + pending dispatch', href: '/incidents' };
    },
  },
  'units-available': {
    id: 'units-available',
    label: 'Units available',
    icon: Truck,
    compute: () => {
      const avail = UNITS.filter((u) => u.status === 'available').length;
      return { value: `${avail} / ${UNITS.length}`, hint: 'patrol + supervisor + specialty' };
    },
  },
  'live-event-count': {
    id: 'live-event-count',
    label: 'Incidents (24h)',
    icon: Activity,
    compute: () => {
      const n = incidentsLast24h();
      return { value: `${n}`, hint: 'received in the last 24 hours', href: '/incidents' };
    },
  },

  // ---------- EOC + Notifications + Facilities (R6) ----------
  'active-runbooks': {
    id: 'active-runbooks',
    label: 'Active runbooks',
    icon: ScrollText,
    compute: () => {
      const n = RUNBOOK_EXECUTIONS.filter(
        (x) => x.status === 'in-progress' || x.status === 'queued',
      ).length;
      return { value: `${n}`, hint: 'in-progress + queued', href: '/runbooks' };
    },
  },
  'active-activations': {
    id: 'active-activations',
    label: 'EOC activations',
    icon: Siren,
    compute: () => {
      const list = activeEOCActivations();
      const tone = list.some((a) => a.level === 'full') ? 'critical' : list.length > 0 ? 'warning' : 'good';
      return { value: `${list.length}`, hint: list.length === 0 ? 'no active activations' : list.map((a) => a.level).join(' · '), href: '/eoc', tone };
    },
  },
  'buildings-in-lockdown': {
    id: 'buildings-in-lockdown',
    label: 'Buildings in lockdown',
    icon: Lock,
    compute: () => {
      const total = activeEOCActivations().reduce((s, a) => s + a.lockdownIds.length, 0);
      return { value: `${total}`, hint: total === 0 ? 'normal access posture' : 'across active activations', href: '/access/lockdowns', tone: total > 0 ? 'warning' : 'good' };
    },
  },
  'campaigns-sent': {
    id: 'campaigns-sent',
    label: 'Notifications sent (24h)',
    icon: Radio,
    compute: () => {
      const n = campaignsLast24h();
      return { value: `${n}`, hint: 'mass-notification campaigns', href: '/notifications' };
    },
  },
  'generator-alerts': {
    id: 'generator-alerts',
    label: 'Generators not normal',
    icon: Zap,
    compute: () => {
      const counts = generatorsByMode();
      const failed = counts.failed ?? 0;
      const onBattery = counts['on-battery'] ?? 0;
      const onGen = counts['on-generator'] ?? 0;
      const total = failed + onBattery + onGen;
      return {
        value: `${total}`,
        hint: failed > 0 ? `${failed} failed` : total === 0 ? 'all generators normal' : 'check facilities',
        href: '/facilities',
        tone: failed > 0 ? 'critical' : total > 0 ? 'warning' : 'good',
      };
    },
  },

  // ---------- Threat Intel + Conduct + Title IX (R5) ----------
  'open-bit-cases': {
    id: 'open-bit-cases',
    label: 'Open BIT / CARE cases',
    icon: Sparkles,
    compute: () => {
      const n = openBITCasesCount();
      const critical = BIT_CASES.filter((c) => c.riskTier === 'critical' && c.status !== 'closed').length;
      const elevated = BIT_CASES.filter((c) => c.riskTier === 'elevated' && c.status !== 'closed').length;
      return {
        value: `${n}`,
        hint: critical > 0 ? `${critical} critical · ${elevated} elevated` : `${elevated} elevated`,
        href: '/bit',
        tone: critical > 0 ? 'critical' : elevated > 0 ? 'warning' : 'good',
      };
    },
  },
  'risk-tier-changed': {
    id: 'risk-tier-changed',
    label: 'Risk tier moved (7d)',
    icon: Sparkles,
    compute: () => {
      const n = bitCasesWithChangedTier7d();
      return { value: `${n}`, hint: 'rising or falling since last review', href: '/bit' };
    },
  },
  'weekly-meeting-agenda': {
    id: 'weekly-meeting-agenda',
    label: 'BIT agenda — this week',
    icon: ScrollText,
    compute: () => {
      const cutoff = ANCHOR.getTime() + 7 * 24 * 60 * 60 * 1000;
      const dueThisWeek = BIT_CASES.filter(
        (c) => c.status !== 'closed' && new Date(c.nextReviewDueAt).getTime() <= cutoff,
      ).length;
      return { value: `${dueThisWeek}`, hint: 'cases up for review within 7 days', href: '/bit' };
    },
  },
  'open-conduct-cases': {
    id: 'open-conduct-cases',
    label: 'Open conduct cases',
    icon: Sparkles,
    compute: () => {
      const n = openConductCasesCount();
      return { value: `${n}`, hint: 'substance + residential (R5)' };
    },
  },
  'substance-pattern-alerts': {
    id: 'substance-pattern-alerts',
    label: 'Substance cases (30d)',
    icon: Sparkles,
    compute: () => {
      const cutoff = ANCHOR.getTime() - 30 * 24 * 60 * 60 * 1000;
      const recent = CONDUCT_CASES.filter(
        (c) => c.subtype === 'substance' && new Date(c.openedAt).getTime() >= cutoff,
      ).length;
      return { value: `${recent}`, hint: 'substance-subtype conduct cases opened' };
    },
  },
  'sanctions-due': {
    id: 'sanctions-due',
    label: 'Sanctions due',
    icon: Sparkles,
    compute: () => {
      const n = sanctionsDueCount();
      const overdue = SANCTIONS.filter((s) => s.status === 'overdue').length;
      return {
        value: `${n}`,
        hint: overdue > 0 ? `${overdue} overdue` : 'pending + active',
        tone: overdue > 0 ? 'warning' : 'good',
      };
    },
  },
  // ---------- Title IX (walled) ----------
  'open-title-ix-cases': {
    id: 'open-title-ix-cases',
    label: 'Open Title IX cases',
    icon: Sparkles,
    compute: () => {
      const n = TITLE_IX_CASES.filter((c) => c.phase !== 'closed').length;
      return { value: `${n}`, hint: 'across all phases', href: '/title-ix' };
    },
  },
  'supportive-measures-active': {
    id: 'supportive-measures-active',
    label: 'Supportive measures active',
    icon: ShieldCheck,
    compute: () => {
      const n = TITLE_IX_CASES.filter((c) => c.phase !== 'closed').reduce(
        (s, c) => s + c.supportiveMeasures.length,
        0,
      );
      return { value: `${n}`, hint: 'across open cases', href: '/title-ix' };
    },
  },
  'statutory-deadlines': {
    id: 'statutory-deadlines',
    label: 'Statutory deadlines (14d)',
    icon: Sparkles,
    compute: () => {
      const cutoff = ANCHOR.getTime() + 14 * 24 * 60 * 60 * 1000;
      const due = TITLE_IX_CASES.filter(
        (c) => c.determinationDueAt && new Date(c.determinationDueAt).getTime() <= cutoff,
      ).length;
      return { value: `${due}`, hint: 'determination due within 14 days', tone: due > 0 ? 'warning' : 'good' };
    },
  },
  'annual-stats': {
    id: 'annual-stats',
    label: 'Annual stats (Clery)',
    icon: ShieldCheck,
    compute: () => ({ value: '—', hint: 'ASR workbench lands in R7' }),
  },

  // ---------- Governance / Trust (CISO) ----------
  'barrier-hits': {
    id: 'barrier-hits',
    label: 'Barrier hits (session)',
    icon: ShieldCheck,
    compute: () => {
      const n = getBarrierHits().length;
      return { value: `${n}`, hint: 'logged this session — see /audit (R8)' };
    },
  },
  'barrier-hits-today': {
    id: 'barrier-hits-today',
    label: 'Barrier hits (24h)',
    icon: ShieldCheck,
    compute: () => {
      const cutoff = hoursAgo(24).getTime();
      const recent = getBarrierHits().filter((h) => new Date(h.at).getTime() >= cutoff).length;
      return { value: `${recent}`, hint: 'masked / denied / overridden' };
    },
  },
  'sources-unhealthy': {
    id: 'sources-unhealthy',
    label: 'Sources unhealthy',
    icon: ShieldCheck,
    compute: () => {
      const list = sourcesUnhealthy();
      return {
        value: `${list.length}`,
        hint: 'composite health < 90',
        href: '/sources',
        tone: list.length > 5 ? 'warning' : 'good',
      };
    },
  },
  'cji-access-events': {
    id: 'cji-access-events',
    label: 'CJI events (24h)',
    icon: ShieldCheck,
    compute: () => {
      const cutoff = hoursAgo(24).getTime();
      const n = INCIDENTS.filter(
        (i) => i.classification === 'cji' && new Date(i.receivedAt).getTime() >= cutoff,
      ).length;
      return { value: `${n}`, hint: 'CJI-classified incidents received' };
    },
  },
  'dr-posture': {
    id: 'dr-posture',
    label: 'DR posture',
    icon: ShieldCheck,
    compute: () => ({ value: '—', hint: 'governance panel lands in R8' }),
  },

  // ---------- Executive (aggregate) ----------
  'incidents-ytd': {
    id: 'incidents-ytd',
    label: 'Incidents (rolling 12mo)',
    icon: Activity,
    compute: () => ({ value: `${INCIDENTS.length}`, hint: 'across all classifications', href: '/incidents' }),
  },
  'bit-cases-trend': {
    id: 'bit-cases-trend',
    label: 'BIT cases · open',
    icon: Sparkles,
    compute: () => {
      const n = openBITCasesCount();
      return { value: `${n}`, hint: 'across 4 NaBITA tiers', href: '/bit' };
    },
  },
  'clery-audit-posture': {
    id: 'clery-audit-posture',
    label: 'Clery — reportable (12mo)',
    icon: ShieldCheck,
    compute: () => ({ value: `${cleryReportableCount()}`, hint: 'Clery-reportable incidents (full audit in R7)' }),
  },
  'campus-safety-score': {
    id: 'campus-safety-score',
    label: 'Campus safety score',
    icon: ShieldCheck,
    compute: () => ({ value: '—', hint: 'composite score lands in R9' }),
  },

  // ---------- Compliance (Clery officer) — R7 ----------
  'asr-completeness': {
    id: 'asr-completeness',
    label: 'ASR build completeness',
    icon: ShieldCheck,
    compute: () => ({ value: '—', hint: 'ASR workbench lands in R7' }),
  },
  'timely-warnings': {
    id: 'timely-warnings',
    label: 'Timely Warnings (week)',
    icon: ShieldCheck,
    compute: () => ({ value: '—', hint: 'Timely Warning ledger lands in R7' }),
  },
  'csa-outstanding': {
    id: 'csa-outstanding',
    label: 'CSA reports outstanding',
    icon: ShieldCheck,
    compute: () => ({ value: '—', hint: 'CSA register lands in R7' }),
  },
  'hate-crime-review': {
    id: 'hate-crime-review',
    label: 'Hate-crime review queue',
    icon: ShieldCheck,
    compute: () => ({ value: '—', hint: 'Bias review queue lands in R7' }),
  },
};

// =========================================================================
// Page
// =========================================================================

const TONE_BG: Record<'critical' | 'warning' | 'good', string> = {
  critical: 'bg-[var(--signal-red-soft)] ring-1 ring-[color-mix(in_oklch,var(--signal-red)_30%,white)]',
  warning: 'bg-[var(--signal-amber-soft)] ring-1 ring-[color-mix(in_oklch,var(--signal-amber)_30%,white)]',
  good: '',
};

const TONE_VALUE: Record<'critical' | 'warning' | 'good', string> = {
  critical: 'text-[var(--signal-red)]',
  warning: 'text-[oklch(0.42_0.13_70)]',
  good: 'text-[var(--foreground)]',
};

export default function HomePage() {
  const { config } = useRole();
  const [layers, setLayers] = useState(DEFAULT_LAYERS);

  const kpis = useMemo(
    () =>
      config.homeKpiOrder
        .slice(0, 4)
        .map((id) => KPI_LIBRARY[id])
        .filter(Boolean),
    [config.homeKpiOrder],
  );

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
        {/* Active EOC + Weather banner — Thread B trigger surface */}
        <EOCBanner />

        {/* KPI strip — role-aware, top 4 from homeKpiOrder */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {kpis.map((k) => {
            const Icon = k.icon;
            const computed = k.compute();
            const tone = computed.tone ?? 'good';
            const card = (
              <Card className={tone !== 'good' ? TONE_BG[tone] : undefined}>
                <CardContent className="p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                      {k.label}
                    </div>
                    <Icon className="h-4 w-4 text-[var(--muted-foreground)]" />
                  </div>
                  <div className={`font-display text-2xl font-semibold ${TONE_VALUE[tone]}`}>
                    {computed.value}
                  </div>
                  <div className="mt-2 text-[11px] text-[var(--muted-foreground)]">
                    {computed.hint}
                  </div>
                </CardContent>
              </Card>
            );
            return computed.href ? (
              <Link key={k.id} to={computed.href} className="transition-opacity hover:opacity-90">
                {card}
              </Link>
            ) : (
              <div key={k.id}>{card}</div>
            );
          })}
        </div>

        {/* Live activity panel — replaces the R0 foundation card */}
        <LiveActivityPanel />

        {/* Supporting context — geography, residential capacity, classification taxonomy */}
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
                10-tier scale enforced at row + column level via Information Barriers.
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

// =========================================================================
// Live activity panel — six tiles summarizing the current operational state
// =========================================================================

function LiveActivityPanel() {
  const incidents24h = incidentsLast24h();
  const openIncidents = openIncidentCount();
  const openBIT = openBITCasesCount();
  const activeAct = activeEOCActivations().length;
  const campaigns24h = campaignsLast24h();
  const gens = generatorsByMode();
  const genFailed = gens.failed ?? 0;
  const rollup = notificationDeliveryRollup30d();
  const barrierHitsSession = getBarrierHits().length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Live activity
          </CardTitle>
          <Badge variant={activeAct > 0 || genFailed > 0 ? 'warning' : 'success'}>
            {activeAct > 0 ? `${activeAct} activation${activeAct === 1 ? '' : 's'} active` : 'normal operations'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-x-6 gap-y-4 md:grid-cols-3 lg:grid-cols-6">
          <Stat
            label="Incidents · 24h"
            value={incidents24h.toLocaleString()}
            sub={`${openIncidents} open right now`}
            href="/incidents"
          />
          <Stat
            label="BIT cases · open"
            value={`${openBIT}`}
            sub="across 4 NaBITA tiers"
            href="/bit"
          />
          <Stat
            label="EOC activations"
            value={`${activeAct}`}
            sub={activeAct === 0 ? 'none active' : 'partial / full / monitoring'}
            href="/eoc"
            tone={activeAct > 0 ? 'warn' : 'good'}
          />
          <Stat
            label="Notifications · 24h"
            value={`${campaigns24h}`}
            sub={`${(rollup.deliveryRate * 100).toFixed(1)}% delivery rate (30d)`}
            href="/notifications"
          />
          <Stat
            label="Generators · not normal"
            value={`${genFailed + (gens['on-battery'] ?? 0) + (gens['on-generator'] ?? 0)}`}
            sub={genFailed > 0 ? `${genFailed} failed` : 'all generators normal'}
            href="/facilities"
            tone={genFailed > 0 ? 'critical' : 'good'}
          />
          <Stat
            label="Barrier hits · session"
            value={`${barrierHitsSession}`}
            sub="masked / denied / overridden"
          />
        </div>
      </CardContent>
    </Card>
  );
}

// =========================================================================
// Helpers
// =========================================================================

function Stat({
  label,
  value,
  sub,
  href,
  tone,
}: {
  label: string;
  value: string;
  sub: string;
  href?: string;
  tone?: 'good' | 'warn' | 'critical';
}) {
  const valueClass =
    tone === 'critical' ? 'text-[var(--signal-red)]'
    : tone === 'warn' ? 'text-[oklch(0.42_0.13_70)]'
    : 'text-[var(--foreground)]';

  const inner = (
    <div className="space-y-0.5">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
        {label}
      </div>
      <div className={`font-display text-xl font-semibold tabular-nums ${valueClass}`}>
        {value}
      </div>
      <div className="text-[10px] text-[var(--muted-foreground)]">{sub}</div>
    </div>
  );
  if (href) {
    return (
      <Link to={href} className="transition-opacity hover:opacity-80">
        {inner}
      </Link>
    );
  }
  return inner;
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

/**
 * EOCBanner — surfaces active weather alerts + active EOC activations on the
 * Command Center. When the Thread B tornado warning is live (and the
 * activation is open), this is the "click to enter EOC" entry point.
 */
function EOCBanner() {
  const weather = activeWeatherAlerts();
  const activations = activeEOCActivations();

  if (weather.length === 0 && activations.length === 0) return null;

  return (
    <div className="space-y-3">
      {weather.map((w) => (
        <div
          key={w.id}
          className="flex items-start gap-3 rounded-md border border-[var(--signal-red)]/60 bg-[var(--signal-red-soft)]/30 p-4"
        >
          <AlertOctagon className="mt-0.5 h-5 w-5 text-[var(--signal-red)]" />
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="danger" className="text-[10px]">{w.kind}</Badge>
              <Badge variant="warning" className="text-[10px]">{w.severity}</Badge>
              <span className="text-[10px] font-mono text-[var(--muted-foreground)]">{w.id}</span>
            </div>
            <p className="mt-1 text-sm font-semibold">{w.headline}</p>
            <p className="mt-1 text-[12px] leading-relaxed text-[var(--muted-foreground)]">
              {w.raw.slice(0, 220)}…
            </p>
          </div>
          <Link
            to="/eoc"
            className="rounded-md bg-[var(--signal-red)] px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90"
          >
            Open EOC →
          </Link>
        </div>
      ))}
      {activations.map((a) => (
        <Link
          key={a.id}
          to={`/eoc/activations/${encodeURIComponent(a.id)}`}
          className="flex items-start gap-3 rounded-md border border-[var(--signal-amber)]/60 bg-[var(--signal-amber-soft)]/30 p-4 transition-colors hover:bg-[var(--signal-amber-soft)]/50"
        >
          <Siren className="mt-0.5 h-5 w-5 text-[var(--signal-amber)]" />
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="warning" className="text-[10px]">{a.level} activation</Badge>
              {a.threadTag && <Badge variant="accent" className="text-[10px]">Thread {a.threadTag}</Badge>}
              <span className="font-mono text-[10px] text-[var(--muted-foreground)]">{a.id}</span>
            </div>
            <p className="mt-1 text-sm font-semibold">{a.name}</p>
            <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-[var(--muted-foreground)]">{a.narrative}</p>
          </div>
          <span className="text-xs font-semibold text-[var(--signal-amber)]">
            Open COP →
          </span>
        </Link>
      ))}
    </div>
  );
}
