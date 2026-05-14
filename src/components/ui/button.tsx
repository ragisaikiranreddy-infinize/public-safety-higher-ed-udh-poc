import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          'bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--graphite-800)] shadow-sm',
        destructive:
          'bg-[var(--destructive)] text-[var(--destructive-foreground)] hover:opacity-90 shadow-sm',
        outline:
          'border border-[var(--border)] bg-[var(--background)] hover:bg-[var(--graphite-100)] hover:text-[var(--graphite-900)]',
        secondary:
          'bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:bg-[var(--graphite-200)]',
        ghost: 'hover:bg-[var(--graphite-100)] hover:text-[var(--graphite-900)]',
        link: 'text-[var(--primary)] underline-offset-4 hover:underline',
        accent:
          'bg-[var(--hub-600)] text-white hover:bg-[var(--hub-700)] shadow-sm',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-6',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
