import { cn } from '@/lib/utils';

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({ eyebrow, title, description, actions, className }: PageHeaderProps) {
  return (
    <div className={cn('border-b bg-[var(--background)] px-8 py-6', className)}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          {eyebrow && (
            <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
              {eyebrow}
            </div>
          )}
          <h1 className="font-display text-2xl font-semibold text-[var(--foreground)]">{title}</h1>
          {description && (
            <p className="mt-1 max-w-3xl text-sm text-[var(--muted-foreground)]">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
