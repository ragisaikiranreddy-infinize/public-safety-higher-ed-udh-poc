/**
 * <FreshnessPill lastUpdatedIso="..." /> — relative-time pill colored by age.
 *
 *  green  < 5 minutes
 *  blue   < 1 hour
 *  amber  < 6 hours
 *  red    >= 6 hours
 */
import { Badge } from '@/components/ui/badge';
import { formatRelativeTime } from '@/lib/utils';

export function FreshnessPill({ lastUpdatedIso }: { lastUpdatedIso: string }) {
  const updated = new Date(lastUpdatedIso);
  const ageMin = (Date.now() - updated.getTime()) / 60_000;
  let variant: Parameters<typeof Badge>[0]['variant'] = 'success';
  if (ageMin >= 5 && ageMin < 60) variant = 'info';
  else if (ageMin >= 60 && ageMin < 360) variant = 'warning';
  else if (ageMin >= 360) variant = 'danger';
  return <Badge variant={variant}>{formatRelativeTime(updated)}</Badge>;
}
