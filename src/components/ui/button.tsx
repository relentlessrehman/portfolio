import { cva } from 'class-variance-authority'
import { cn } from '#/lib/utils'
import type { VariantProps } from 'class-variance-authority'
import type { ComponentPropsWithRef } from 'react'

/*
 * shadcn-style button adapted to the design system: 44px minimum touch
 * target at md+, token-driven colors, visible focus ring. Primary and
 * secondary carry the glass treatment (blur, border highlight, reflection
 * sweep, lift-on-hover); ghost/link stay flat for lower-emphasis actions.
 */
const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 rounded-full font-medium',
    'whitespace-nowrap transition-[color,transform,box-shadow] duration-(--duration-base) motion-safe:hover:-translate-y-0.5',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
    'disabled:pointer-events-none disabled:opacity-50 disabled:hover:translate-y-0',
    '[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  ],
  {
    variants: {
      variant: {
        primary:
          'btn-glass-sweep border border-white/20 bg-gradient-to-br from-accent to-accent-2 text-accent-foreground shadow-[0_8px_30px_rgb(107_124_255_/_0.35)] hover:shadow-[0_12px_40px_rgb(85_214_255_/_0.4)]',
        secondary: 'btn-glass-sweep glass text-foreground hover:border-border-strong',
        ghost: 'text-muted-foreground hover:bg-surface hover:text-foreground',
        link: 'text-accent underline-offset-4 hover:underline',
      },
      size: {
        sm: 'h-9 px-3.5 text-small',
        md: 'h-11 px-5 text-body',
        lg: 'h-12 px-6 text-body',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
)

interface ButtonProps
  extends ComponentPropsWithRef<'button'>,
    VariantProps<typeof buttonVariants> {}

function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
}

export { Button, buttonVariants }
