/**
 * <InsightCard /> — list-row card for an Insight.
 *
 * Three kinds: rca / prediction / anomaly. Each gets a distinct icon + tone.
 * Click → /insights/:id.
 */
import { Link } from 'react-router-dom';
import { GitBranch, TrendingUp, AlertOctagon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SeverityDot } from '@/components/data-display/severity-dot';
import { ClassificationBadge } from '@/components/data-display/classification-badge';
import type { Insight, InsightKind } from '@/lib/types';
import { formatRelativeTime, cn } from '@/lib/utils';

const KIND_ICON: Record<InsightKind, React.ElementType> = {
  rca: GitBranch,
  prediction: TrendingUp,
  anomaly: AlertOctagon,
};

const KIND_COLOR: Record<InsightKind, string> = {
  rca: 'text-[var(--hub-700)]',
  prediction: 'text-[var(--signal-blue)]',
  anomaly: 'text-[var(--signal-amber)]',
};

interface Props {
  insight: Insight;
}

export function InsightCard({ insight }: Props) {
  const Icon = KIND_ICON[insight.kind];
  return (
    <Link to={`/insights/${encodeURIComponent(insight.id)}`}>
      <Card className={cn(
        'transition-colors hover:bg-[var(--graphite-50)]',
        insight.threadTag && 'ring-2 ring-[var(--hub-500)]/40',
      )}>
        <CardContent className="space-y-2 p-4">
          <div className="flex items-start gap-3">
            <Icon className={cn('mt-0.5 h-4 w-4 flex-shrink-0', KIND_COLOR[insight.kind])} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <SeverityDot severity={insight.severity} />
                <Badge variant="outline" className="text-[9px]">{insight.kind}</Badge>
                <span className="font-mono text-[10px] text-[var(--muted-foreground)]">{insight.id}</span>
                {insight.threadTag && <Badge variant="accent" className="text-[9px]">Thread {insight.threadTag}</Badge>}
              </div>
              <div className="mt-1 font-display text-sm font-semibold leading-snug">{insight.title}</div>
              <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-[var(--muted-foreground)]">{insight.narrative}</p>
              <div className="mt-1.5 flex items-center justify-between text-[10px] text-[var(--muted-foreground)]">
                <div className="flex items-center gap-1.5">
                  <ClassificationBadge classification={insight.classification} />
                  {insight.contributors && (
                    <span>{insight.contributors.length} contributors</span>
                  )}
                  {insight.prediction && (
                    <span>{insight.prediction.confidence}% confidence</span>
                  )}
                </div>
                <span>{formatRelativeTime(new Date(insight.createdAt))}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
