/**
 * <LayerBadge layer="bronze|silver|gold" /> — medallion layer chip.
 */
import { Badge } from '@/components/ui/badge';
import type { MedallionLayer } from '@/lib/types';

export function LayerBadge({ layer }: { layer: MedallionLayer }) {
  const variant = layer === 'bronze' ? 'bronze' : layer === 'silver' ? 'silver' : 'gold';
  const label = layer === 'bronze' ? 'Bronze' : layer === 'silver' ? 'Silver' : 'Gold';
  return <Badge variant={variant}>{label}</Badge>;
}
