import { content } from '#/content'
import { cn } from '#/lib/utils'
import type { AvailabilityStatus } from '#/content/schemas/profile'

const dotColor: Record<AvailabilityStatus, string> = {
  open: 'bg-success',
  selective: 'bg-warning',
  unavailable: 'bg-subtle-foreground',
}

/** Live availability pill driven by content/profile.ts */
export function AvailabilityBadge({ className }: { className?: string }) {
  const { availability } = content.profile

  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-1.5 text-small text-muted-foreground',
        className,
      )}
    >
      <span className="relative flex size-2" aria-hidden>
        <span
          className={cn(
            'absolute inline-flex size-full animate-pulse-3 rounded-full opacity-60 motion-reduce:animate-none',
            dotColor[availability.status],
          )}
        />
        <span
          className={cn('relative inline-flex size-2 rounded-full', dotColor[availability.status])}
        />
      </span>
      {availability.label}
    </span>
  )
}
