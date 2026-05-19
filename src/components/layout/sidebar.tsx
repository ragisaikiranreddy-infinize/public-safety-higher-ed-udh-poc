import { NavLink } from 'react-router-dom';
import {
  Gauge,
  Database,
  Plug,
  Target,
  ArrowRightLeft,
  ShieldCheck,
  Siren,
  ClipboardList,
  Users,
  Brain,
  GraduationCap,
  Scale,
  Radio,
  Camera,
  Bus,
  FileWarning,
  Briefcase,
  MessagesSquare,
  Filter,
  LayoutDashboard,
  Lightbulb,
  Bookmark,
  Bot,
  ShieldAlert,
  Layers,
} from 'lucide-react';
import { useRole } from '@/lib/role-context';
import { cn } from '@/lib/utils';

interface NavItem {
  to: string;
  label: string;
  icon: React.ElementType;
  end?: boolean;
  badge?: string;
}

interface NavSection {
  label: string;          // must match an entry in role-context SIDEBAR_GROUPS
  items: NavItem[];
}

const SECTIONS: NavSection[] = [
  { label: 'Overview', items: [{ to: '/', label: 'Command Center', icon: Gauge, end: true }] },
  {
    label: 'Data',
    items: [
      { to: '/catalog', label: 'Catalog', icon: Database },
      { to: '/sources', label: 'Sources', icon: Plug },
      { to: '/pipelines', label: 'Pipelines', icon: ArrowRightLeft },
      { to: '/quality', label: 'Quality', icon: ShieldCheck },
      { to: '/metrics', label: 'Metrics', icon: Target },
    ],
  },
  {
    label: 'Incidents',
    items: [
      { to: '/incidents', label: 'Incidents', icon: Siren },
      { to: '/cases', label: 'Cases', icon: ClipboardList },
      { to: '/calls', label: 'Calls for Service', icon: Radio },
    ],
  },
  {
    label: 'People',
    items: [
      { to: '/persons', label: 'Persons', icon: Users },
      { to: '/vehicles', label: 'Vehicles', icon: Bus },
    ],
  },
  {
    label: 'Threat Intel',
    items: [
      { to: '/bit', label: 'BIT / CARE', icon: Brain, badge: 'AI' },
    ],
  },
  {
    label: 'Conduct',
    items: [
      // R5 ships the conduct detail page; the list + subtype views land in R8.
      { to: '/conduct/COND-2024-00211', label: 'Conduct (Thread A demo)', icon: GraduationCap },
    ],
  },
  {
    label: 'Title IX',
    items: [
      { to: '/title-ix', label: 'Title IX', icon: Scale, badge: 'WALL' },
    ],
  },
  {
    label: 'EOC',
    items: [
      { to: '/eoc', label: 'EOC Home', icon: Siren },
      { to: '/runbooks', label: 'Runbooks', icon: ClipboardList },
      { to: '/notifications', label: 'Mass Notifications', icon: Radio },
    ],
  },
  {
    label: 'Surveillance',
    items: [
      { to: '/cameras', label: 'Cameras', icon: Camera },
      { to: '/access', label: 'Access Control', icon: ShieldCheck },
    ],
  },
  {
    label: 'Campus Ops',
    items: [
      { to: '/transit', label: 'Transit', icon: Bus },
      { to: '/parking', label: 'Parking / LPR', icon: Bus },
      { to: '/facilities', label: 'Facilities / IoT', icon: ShieldCheck },
    ],
  },
  {
    label: 'Compliance',
    items: [
      { to: '/clery', label: 'Clery', icon: FileWarning },
      { to: '/nibris', label: 'NIBRS', icon: FileWarning },
      { to: '/foia', label: 'FOIA', icon: FileWarning },
      { to: '/regulations', label: 'Regulations', icon: ShieldCheck },
    ],
  },
  {
    label: 'Officers',
    items: [
      { to: '/officers', label: 'Officers', icon: Briefcase },
      { to: '/workforce-analytics', label: 'Workforce', icon: Briefcase },
    ],
  },
  {
    label: 'Intelligence',
    items: [
      { to: '/ask', label: 'Ask the Hub', icon: MessagesSquare, badge: 'AI' },
      { to: '/cohorts', label: 'Cohorts', icon: Filter },
      { to: '/dashboards', label: 'Dashboards', icon: LayoutDashboard, badge: 'AI' },
      { to: '/insights', label: 'Insights', icon: Lightbulb },
      { to: '/actions', label: 'Actions', icon: Bookmark },
      { to: '/copilots', label: 'Copilots', icon: Bot, badge: 'AI' },
    ],
  },
  {
    label: 'Trust',
    items: [
      { to: '/governance', label: 'Governance', icon: ShieldAlert },
      { to: '/audit', label: 'Audit-of-Audit', icon: ShieldAlert },
    ],
  },
];

export function Sidebar() {
  const { config } = useRole();
  // Per-role enforcement: hide any group the active persona doesn't claim.
  const visible = SECTIONS.filter((s) => config.visibleSidebar.includes(s.label));

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r bg-[var(--card)] md:flex">
      <div className="flex h-16 items-center gap-2.5 border-b px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--graphite-900)] text-white">
          <Layers className="h-4 w-4" />
        </div>
        <div className="leading-tight">
          <div className="font-display text-sm font-semibold text-[var(--foreground)]">
            Unified Campus Safety
          </div>
          <div className="text-[10px] font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
            Higher Education
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-3 overflow-y-auto px-3 py-4">
        {visible.map((section) => (
          <div key={section.label}>
            <div className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
              {section.label}
            </div>
            <div className="space-y-0.5">
              {section.items.map((item, idx) => {
                const Icon = item.icon;
                const key = `${section.label}-${item.label}-${idx}`;
                return (
                  <NavLink
                    key={key}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      cn(
                        'group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-[var(--graphite-100)] text-[var(--graphite-900)]'
                          : 'text-[var(--muted-foreground)] hover:bg-[var(--graphite-50)] hover:text-[var(--graphite-900)]',
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon
                          className={cn(
                            'h-4 w-4',
                            isActive
                              ? 'text-[var(--graphite-900)]'
                              : 'text-[var(--muted-foreground)] group-hover:text-[var(--graphite-900)]',
                          )}
                        />
                        <span className="flex-1">{item.label}</span>
                        {item.badge && (
                          <span className={cn(
                            'rounded-sm px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider',
                            item.badge === 'WALL'
                              ? 'bg-[var(--barrier-soft)] text-[var(--barrier)]'
                              : 'bg-[var(--hub-100)] text-[var(--hub-700)]',
                          )}>
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t p-4">
        <div className="rounded-md border border-[var(--graphite-200)] bg-[var(--graphite-50)] p-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[var(--layer-bronze)]" />
            <span className="h-2 w-2 rounded-full bg-[var(--layer-silver)]" />
            <span className="h-2 w-2 rounded-full bg-[var(--layer-gold)]" />
            <span className="text-xs font-semibold text-[var(--graphite-900)]">Medallion</span>
          </div>
          <p className="mt-1.5 text-[11px] leading-relaxed text-[var(--muted-foreground)]">
            Bronze → Silver → Gold. Every dataset is layered, lineaged, classified.
          </p>
        </div>
      </div>
    </aside>
  );
}
