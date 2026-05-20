/**
 * <CommandPalette /> — Cmd-K / Ctrl-K quick navigation.
 *
 * Hard-coded route + thread-anchor list (the demo's biggest deep-links).
 * Production should index dynamically from the registered route tree.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaletteEntry {
  to: string;
  label: string;
  category: string;
  keywords?: string;
}

const ENTRIES: PaletteEntry[] = [
  // Overview
  { to: '/', label: 'Command Center', category: 'Overview' },
  // Thread anchors
  { to: '/persons/PER-008470', label: 'Thread A subject · Tyler Anderson', category: 'Threads', keywords: 'thread a bit person' },
  { to: '/bit/BIT-2026-0067', label: 'Thread A · BIT-2026-0067', category: 'Threads', keywords: 'thread a bit care' },
  { to: '/eoc/activations/EOC-2026-013', label: 'Thread B · EOC tornado activation', category: 'Threads', keywords: 'thread b eoc tornado' },
  { to: '/clery/asr/2025', label: 'Thread C · ASR 2025 workbench', category: 'Threads', keywords: 'thread c asr clery' },
  { to: '/foia/requests/FOIA-2026-077', label: 'Thread C · FOIA press request', category: 'Threads', keywords: 'thread c foia press' },
  { to: '/access/buildings/BLD-CARTER-HALL', label: 'Building Intelligence — Carter Hall', category: 'Threads', keywords: 'thread a carter building access' },
  // AI surfaces
  { to: '/ask', label: 'Ask the Hub', category: 'AI surfaces', keywords: 'nl ask query sql' },
  { to: '/cohorts', label: 'Cohorts', category: 'AI surfaces' },
  { to: '/cohorts/new', label: 'New cohort (NL builder)', category: 'AI surfaces', keywords: 'cohort build new' },
  { to: '/dashboards', label: 'Dashboards', category: 'AI surfaces' },
  { to: '/dashboards/new', label: 'New dashboard (AI builder)', category: 'AI surfaces', keywords: 'dashboard build new ai' },
  { to: '/insights', label: 'Insights feed', category: 'AI surfaces' },
  { to: '/actions', label: 'Saved actions / watchpoints', category: 'AI surfaces' },
  { to: '/copilots', label: 'Copilots directory', category: 'AI surfaces' },
  // Data
  { to: '/catalog', label: 'Catalog', category: 'Data' },
  { to: '/sources', label: 'Sources', category: 'Data' },
  { to: '/pipelines', label: 'Pipelines', category: 'Data' },
  { to: '/quality', label: 'Quality', category: 'Data' },
  { to: '/metrics', label: 'Metrics', category: 'Data' },
  // Operations
  { to: '/incidents', label: 'Incidents', category: 'Operations' },
  { to: '/persons', label: 'Persons', category: 'Operations' },
  { to: '/cameras', label: 'Cameras', category: 'Operations' },
  { to: '/access', label: 'Access control', category: 'Operations' },
  { to: '/eoc', label: 'EOC', category: 'Operations' },
  { to: '/runbooks', label: 'Runbooks', category: 'Operations' },
  { to: '/notifications', label: 'Mass notifications', category: 'Operations' },
  { to: '/facilities', label: 'Facilities / IoT', category: 'Operations' },
  { to: '/transit', label: 'Transit', category: 'Operations' },
  // Conduct + Title IX
  { to: '/bit', label: 'BIT case board', category: 'Conduct' },
  { to: '/title-ix', label: 'Title IX (walled)', category: 'Conduct' },
  { to: '/conduct', label: 'Conduct cases', category: 'Conduct' },
  { to: '/conduct/amnesty', label: 'Amnesty + FERPA decision aid', category: 'Conduct' },
  { to: '/missing-students', label: 'Missing students', category: 'Conduct' },
  { to: '/bias', label: 'Bias incidents (BART)', category: 'Conduct' },
  { to: '/organizational', label: 'Organizational conduct', category: 'Conduct' },
  // Clery + NIBRS + FOIA
  { to: '/clery', label: 'Clery hub', category: 'Compliance' },
  { to: '/clery/geography', label: 'Clery geography', category: 'Compliance' },
  { to: '/nibris', label: 'NIBRS submissions', category: 'Compliance' },
  { to: '/foia', label: 'FOIA inbox', category: 'Compliance' },
  // Trust
  { to: '/governance', label: 'Governance', category: 'Trust' },
  { to: '/audit', label: 'Audit-of-audit', category: 'Trust' },
  { to: '/policies', label: 'Policies', category: 'Trust' },
  { to: '/regulations', label: 'Regulations', category: 'Trust' },
  // Officers
  { to: '/officers', label: 'Officers roster', category: 'Officers' },
  { to: '/workforce-analytics', label: 'Workforce analytics + bias audit', category: 'Officers' },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Global Cmd-K / Ctrl-K listener
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === 'Escape') {
        setOpen(false);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (open) {
      setQ('');
      setActiveIdx(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return ENTRIES;
    return ENTRIES.filter(
      (e) =>
        e.label.toLowerCase().includes(query) ||
        e.category.toLowerCase().includes(query) ||
        (e.keywords ?? '').toLowerCase().includes(query) ||
        e.to.toLowerCase().includes(query),
    );
  }, [q]);

  function go(entry: PaletteEntry) {
    navigate(entry.to);
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm"
      onClick={() => setOpen(false)}
      onKeyDown={(e) => {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setActiveIdx((i) => Math.min(filtered.length - 1, i + 1));
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setActiveIdx((i) => Math.max(0, i - 1));
        } else if (e.key === 'Enter') {
          e.preventDefault();
          if (filtered[activeIdx]) go(filtered[activeIdx]);
        }
      }}
    >
      <div
        className="mt-24 w-full max-w-2xl rounded-lg border bg-[var(--card)] shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b px-4 py-3">
          <Search className="h-4 w-4 text-[var(--muted-foreground)]" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => { setQ(e.target.value); setActiveIdx(0); }}
            placeholder="Jump to…"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--muted-foreground)]"
          />
          <kbd className="rounded border bg-[var(--graphite-50)] px-1.5 py-0.5 text-[10px] text-[var(--muted-foreground)]">ESC</kbd>
        </div>
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <p className="p-6 text-center text-xs text-[var(--muted-foreground)]">No matches.</p>
          ) : (
            <ul>
              {filtered.map((e, i) => (
                <li key={e.to}>
                  <button
                    onClick={() => go(e)}
                    onMouseEnter={() => setActiveIdx(i)}
                    className={cn(
                      'flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-xs transition-colors',
                      activeIdx === i ? 'bg-[var(--hub-50)]' : 'hover:bg-[var(--graphite-50)]',
                    )}
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <span className="rounded-md bg-[var(--graphite-100)] px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-[var(--muted-foreground)]">
                        {e.category}
                      </span>
                      <span className="truncate">{e.label}</span>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-[var(--muted-foreground)]" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="flex items-center justify-between border-t px-4 py-2 text-[10px] text-[var(--muted-foreground)]">
          <span><kbd className="rounded border bg-[var(--graphite-50)] px-1 py-0.5">↑</kbd> <kbd className="rounded border bg-[var(--graphite-50)] px-1 py-0.5">↓</kbd> navigate · <kbd className="rounded border bg-[var(--graphite-50)] px-1 py-0.5">↵</kbd> select · <kbd className="rounded border bg-[var(--graphite-50)] px-1 py-0.5">ESC</kbd> close</span>
          <span>{filtered.length} of {ENTRIES.length}</span>
        </div>
      </div>
    </div>
  );
}
