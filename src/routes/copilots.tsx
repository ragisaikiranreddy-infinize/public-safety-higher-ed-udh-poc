/**
 * /copilots — copilot directory.
 */
import { Link } from 'react-router-dom';
import { Bot } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { COPILOTS } from '@/lib/mock-db';
import { formatRelativeTime } from '@/lib/utils';

export default function CopilotsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Intelligence · Copilots"
        title="Copilots"
        description={`${COPILOTS.length} conversational AI surfaces across BIT, EOC, Clery, Conduct, and Platform-wide ask. Every copilot is barrier-aware — replies cite only the datasets the active role can read.`}
      />
      <div className="grid grid-cols-1 gap-4 px-8 py-6 md:grid-cols-2">
        {COPILOTS.map((c) => (
          <Link key={c.id} to={c.route}>
            <Card className="transition-colors hover:bg-[var(--graphite-50)]">
              <CardContent className="space-y-2 p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bot className="h-4 w-4 text-[var(--hub-700)]" />
                    <span className="font-mono text-[10px] text-[var(--muted-foreground)]">{c.id}</span>
                  </div>
                  <Badge variant="outline" className="text-[10px]">{c.scope}</Badge>
                </div>
                <div className="font-display text-base font-semibold">{c.name}</div>
                <p className="text-[11px] leading-relaxed text-[var(--muted-foreground)]">{c.description}</p>
                <div className="flex items-center justify-between text-[10px] text-[var(--muted-foreground)]">
                  <span>roles: <span className="font-mono">{c.ownerRoles.join(', ')}</span></span>
                  {c.lastUsedAt && <span>last used {formatRelativeTime(new Date(c.lastUsedAt))}</span>}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </>
  );
}
