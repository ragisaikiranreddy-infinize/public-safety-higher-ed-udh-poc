/**
 * <DomainIcon domainId={...} /> — resolves a Domain's iconKey to a lucide icon.
 */
import {
  Siren,
  ClipboardList,
  Brain,
  Scale,
  Radio,
  Camera,
  ShieldCheck,
  Bus,
  Wrench,
  FileWarning,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { getDomain } from '@/lib/mock-db';
import type { DomainId } from '@/lib/types';
import { cn } from '@/lib/utils';

const ICONS: Record<string, LucideIcon> = {
  Siren,
  ClipboardList,
  Brain,
  Scale,
  Radio,
  Camera,
  ShieldCheck,
  Bus,
  Wrench,
  FileWarning,
  Users,
};

export function DomainIcon({
  domainId,
  className,
}: {
  domainId: DomainId;
  className?: string;
}) {
  const domain = getDomain(domainId);
  const Icon = (domain && ICONS[domain.iconKey]) ?? ShieldCheck;
  return <Icon className={cn('h-4 w-4', className)} />;
}
