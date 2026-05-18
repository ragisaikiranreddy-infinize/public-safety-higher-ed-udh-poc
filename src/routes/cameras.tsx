/**
 * /cameras — Camera grid (filterable).
 */
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CAMERAS, camerasOnlineCount } from '@/lib/mock-db';
import { Camera as CameraIcon } from 'lucide-react';

export default function CamerasPage() {
  const [filter, setFilter] = useState('');

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return CAMERAS;
    return CAMERAS.filter(
      (c) =>
        c.id.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.vendor.toLowerCase().includes(q) ||
        (c.buildingId ?? '').toLowerCase().includes(q),
    );
  }, [filter]);

  const online = camerasOnlineCount();
  const offline = CAMERAS.length - online;

  return (
    <>
      <PageHeader
        eyebrow="Surveillance"
        title="Cameras"
        description={`${CAMERAS.length} cameras across the campus. ${online} online · ${offline} offline. Click any camera to see analytics events + the FOV cone on the map (R4) or live feed (R5 production).`}
        actions={
          <div className="flex items-center gap-2">
            <Badge variant="success">{online} online</Badge>
            {offline > 0 && <Badge variant="danger">{offline} offline</Badge>}
          </div>
        }
      />

      <div className="space-y-6 px-8 py-6">
        <Input
          type="search"
          placeholder="Search cameras by ID, name, vendor, building…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <Link
              key={c.id}
              to={`/cameras/${encodeURIComponent(c.id)}`}
              className="block"
            >
              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-[var(--graphite-100)]">
                      <CameraIcon className="h-6 w-6 text-[var(--graphite-500)]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-mono text-[11px] text-[var(--muted-foreground)]">{c.id}</div>
                      <div className="truncate text-sm font-semibold">{c.name}</div>
                      <div className="mt-1 flex flex-wrap gap-1">
                        <Badge variant="muted" className="text-[9px]">{c.kind}</Badge>
                        <Badge variant="muted" className="text-[9px]">{c.vendor}</Badge>
                        {c.hasAnalytics && <Badge variant="accent" className="text-[9px]">analytics</Badge>}
                        <Badge variant={c.isOnline ? 'success' : 'danger'} className="text-[9px]">
                          {c.isOnline ? 'online' : 'offline'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
