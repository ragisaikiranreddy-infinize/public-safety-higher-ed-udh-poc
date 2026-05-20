/**
 * /access/lockdowns — ACS lockdown state board.
 *
 * Reads off each active EOC activation's lockdownIds and renders a row per
 * building. Staged-release UX (per-zone reopen) is out-of-scope for the POC.
 */
import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { activeEOCActivations, getBuilding } from '@/lib/mock-db';
import { formatRelativeTime } from '@/lib/utils';

export default function LockdownsPage() {
  const active = activeEOCActivations();
  const lockdownRows: { lockId: string; buildingId: string; activationId: string; reason: string; openedAt: string; threadTag?: 'A' | 'B' | 'C' }[] = [];

  active.forEach((a) => {
    a.lockdownIds.forEach((lockId, i) => {
      const buildingId = a.buildingIds[i] ?? a.buildingIds[0] ?? 'BLD-UNKNOWN';
      lockdownRows.push({
        lockId,
        buildingId,
        activationId: a.id,
        reason: a.name,
        openedAt: a.openedAt,
        threadTag: a.threadTag,
      });
    });
  });

  return (
    <>
      <PageHeader
        eyebrow="Surveillance · Access Control · Lockdowns"
        title="Lockdown state"
        description={`${lockdownRows.length} active lockdown(s) across ${active.length} EOC activation(s).`}
      />

      <div className="space-y-6 px-8 py-6">
        {lockdownRows.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-xs text-[var(--muted-foreground)]">
              No active lockdowns. The campus is in normal access posture.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {lockdownRows.map((row) => {
              const b = getBuilding(row.buildingId);
              return (
                <Card key={row.lockId} className="border-[var(--signal-red)]/40">
                  <CardContent className="space-y-2 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Lock className="h-4 w-4 text-[var(--signal-red)]" />
                        <span className="font-mono text-[10px] text-[var(--muted-foreground)]">{row.lockId}</span>
                        <Badge variant="danger" className="text-[10px]">active</Badge>
                      </div>
                      {row.threadTag && <Badge variant="accent" className="text-[10px]">Thread {row.threadTag}</Badge>}
                    </div>
                    <div className="font-display text-sm font-semibold">
                      <Link to={`/access/buildings/${encodeURIComponent(row.buildingId)}`} className="hover:underline">
                        {b?.name ?? row.buildingId}
                      </Link>
                    </div>
                    <div className="text-[10px] text-[var(--muted-foreground)]">
                      Reason: {row.reason}
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-[var(--muted-foreground)]">
                      <span>opened {formatRelativeTime(new Date(row.openedAt))}</span>
                      <Link to={`/eoc/activations/${encodeURIComponent(row.activationId)}`} className="font-mono text-[var(--hub-700)] hover:underline">
                        {row.activationId} →
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
