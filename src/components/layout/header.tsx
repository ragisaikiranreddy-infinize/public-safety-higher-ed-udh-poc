import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { RoleSwitcher } from './role-switcher';
import { NotificationsBell } from './notifications-bell';
import { ThemeToggle } from './theme-toggle';

export function Header() {
  // Detect macOS for the ⌘/Ctrl hint.
  const [isMac, setIsMac] = useState(false);
  useEffect(() => {
    if (typeof navigator !== 'undefined') {
      setIsMac(/mac/i.test(navigator.platform) || /mac/i.test(navigator.userAgent));
    }
  }, []);

  function openPalette() {
    // Synthesize a Cmd-K event so the listener inside <CommandPalette/> picks it up.
    const e = new KeyboardEvent('keydown', { key: 'k', metaKey: true, ctrlKey: true });
    window.dispatchEvent(e);
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-[var(--background)] px-6">
      <button
        type="button"
        aria-label="Open command palette (Cmd+K)"
        onClick={openPalette}
        className="group relative flex max-w-md flex-1 items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-left text-sm text-[var(--muted-foreground)] shadow-sm hover:bg-[var(--graphite-50)]"
      >
        <Search className="h-4 w-4 shrink-0" />
        <span className="flex-1 truncate">
          Jump to anything — incidents, persons, dashboards, threads…
        </span>
        <kbd className="hidden items-center gap-0.5 rounded border border-[var(--border)] bg-[var(--graphite-50)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--muted-foreground)] sm:inline-flex">
          <span className="text-[11px]">{isMac ? '⌘' : 'Ctrl'}</span>K
        </kbd>
      </button>
      <div className="flex items-center gap-1.5">
        <NotificationsBell />
        <ThemeToggle />
        <RoleSwitcher />
      </div>
    </header>
  );
}
