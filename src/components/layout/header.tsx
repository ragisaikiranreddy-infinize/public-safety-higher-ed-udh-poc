import { Search } from 'lucide-react';
import { RoleSwitcher } from './role-switcher';

export function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-[var(--background)] px-6">
      <button
        type="button"
        aria-label="Open search (Cmd+K)"
        disabled
        className="group relative flex max-w-md flex-1 items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-left text-sm text-[var(--muted-foreground)] shadow-sm opacity-60"
        title="Cmd-K command palette lands in R9"
      >
        <Search className="h-4 w-4 shrink-0" />
        <span className="flex-1 truncate">
          Search incidents, persons, buildings, cases…
        </span>
        <kbd className="hidden items-center gap-0.5 rounded border border-[var(--border)] bg-[var(--graphite-50)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--muted-foreground)] sm:inline-flex">
          <span className="text-[11px]">⌘</span>K
        </kbd>
      </button>
      <div className="flex items-center gap-1.5">
        <RoleSwitcher />
      </div>
    </header>
  );
}
