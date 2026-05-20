/**
 * <ThemeToggle /> — toggles dark mode via the `dark` class on <html>.
 *
 * The theme tokens in styles/globals.css already define a dark variant;
 * this button just flips the class.
 */
import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  const [dark, setDark] = useState(() => {
    if (typeof document === 'undefined') return false;
    return document.documentElement.classList.contains('dark');
  });

  useEffect(() => {
    const cls = document.documentElement.classList;
    if (dark) cls.add('dark');
    else cls.remove('dark');
  }, [dark]);

  return (
    <button
      onClick={() => setDark((v) => !v)}
      className="flex h-9 w-9 items-center justify-center rounded-md hover:bg-[var(--graphite-100)]"
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {dark
        ? <Sun className="h-4 w-4 text-[var(--muted-foreground)]" />
        : <Moon className="h-4 w-4 text-[var(--muted-foreground)]" />}
    </button>
  );
}
