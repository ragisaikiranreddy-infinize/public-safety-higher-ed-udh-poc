/**
 * <NotificationsBell /> — header bell icon with unread badge + dropdown.
 *
 * Uses the notification-store for live-ping: 25s after first subscription,
 * the Thread A anonymous-tip notification appears at the top of the list.
 */
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ClassificationBadge } from '@/components/data-display/classification-badge';
import { useNotifications, markAllRead } from '@/lib/notification-store';
import { formatRelativeTime, cn } from '@/lib/utils';

export function NotificationsBell() {
  const list = useNotifications();
  const [open, setOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const unread = list.filter((n) => n.unread).length;

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (!popoverRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  return (
    <div className="relative" ref={popoverRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-9 w-9 items-center justify-center rounded-md hover:bg-[var(--graphite-100)]"
        aria-label={`Notifications · ${unread} unread`}
      >
        <Bell className="h-4 w-4 text-[var(--muted-foreground)]" />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--signal-red)] px-1 text-[9px] font-bold text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-[420px] rounded-lg border bg-[var(--card)] shadow-xl">
          <div className="flex items-center justify-between border-b px-4 py-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
              Notifications · {unread} unread
            </span>
            <button
              onClick={() => { markAllRead(); }}
              className="text-[10px] text-[var(--hub-700)] hover:underline"
            >
              Mark all read
            </button>
          </div>
          <ul className="max-h-[60vh] overflow-y-auto">
            {list.length === 0 ? (
              <li className="p-6 text-center text-xs text-[var(--muted-foreground)]">No notifications.</li>
            ) : (
              list.map((n) => {
                const inner = (
                  <div className={cn(
                    'space-y-1 px-4 py-3 text-xs',
                    n.unread && 'bg-[var(--hub-50)]/30',
                  )}>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[9px]">{n.kind}</Badge>
                      {n.threadTag && <Badge variant="accent" className="text-[9px]">Thread {n.threadTag}</Badge>}
                      <ClassificationBadge classification={n.classification} />
                      <span className="ml-auto text-[10px] text-[var(--muted-foreground)]">{formatRelativeTime(new Date(n.at))}</span>
                    </div>
                    <div className="font-semibold">{n.title}</div>
                    <p className="line-clamp-2 text-[11px] text-[var(--muted-foreground)]">{n.body}</p>
                  </div>
                );
                return (
                  <li key={n.id} className="border-b last:border-0">
                    {n.linkedRoute ? (
                      <Link to={n.linkedRoute} onClick={() => setOpen(false)} className="block transition-colors hover:bg-[var(--graphite-50)]">
                        {inner}
                      </Link>
                    ) : (
                      inner
                    )}
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
