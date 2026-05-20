import { Outlet } from 'react-router-dom';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { CommandPalette } from './command-palette';

export function AppShell() {
  return (
    <div className="flex h-full min-h-screen flex-col bg-[var(--background)]">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Header />
          <main className="flex-1 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
      <CommandPalette />
    </div>
  );
}
