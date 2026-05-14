/**
 * Role switcher — the live governance demo moment.
 *
 * Switching role reshapes the entire app in place: Home KPI tiles re-order,
 * sidebar groups appear/disappear, and information-barrier banners light up
 * on Person 360 / BIT / Title IX / Conduct pages (later phases).
 *
 * Implemented as a dropdown that lists all 9 active personas.
 */

import { ChevronDown, User } from 'lucide-react';
import { useRole } from '@/lib/role-context';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

export function RoleSwitcher() {
  const { role, config, allRoles, setRole } = useRole();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Click-outside to close.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      window.addEventListener('mousedown', onClick);
      return () => window.removeEventListener('mousedown', onClick);
    }
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-xs font-medium text-[var(--foreground)] shadow-sm transition-colors hover:bg-[var(--graphite-50)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-1"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <User className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">{config.label}</span>
        <ChevronDown className="h-3 w-3" />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-1 w-72 overflow-hidden rounded-md border border-[var(--border)] bg-[var(--popover)] shadow-lg"
        >
          <div className="border-b bg-[var(--graphite-50)] px-3 py-2">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
              Switch role
            </div>
          </div>
          <ul className="max-h-96 overflow-y-auto py-1">
            {allRoles.map((r) => {
              const active = r.id === role;
              return (
                <li key={r.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setRole(r.id);
                      setOpen(false);
                    }}
                    className={cn(
                      'flex w-full items-start gap-3 px-3 py-2 text-left transition-colors',
                      active
                        ? 'bg-[var(--hub-100)] text-[var(--hub-700)]'
                        : 'hover:bg-[var(--graphite-50)]',
                    )}
                  >
                    <div className="flex-1">
                      <div className="text-sm font-semibold">{r.label}</div>
                      <div className="text-[11px] leading-relaxed text-[var(--muted-foreground)]">
                        {r.description}
                      </div>
                    </div>
                    {active && (
                      <span className="mt-1 h-2 w-2 rounded-full bg-[var(--hub-600)]" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
