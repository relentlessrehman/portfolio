import { getTechIcon } from '#/lib/tech-icons'
import { cn } from '#/lib/utils'

interface TechBadgeProps {
  name: string
  /** `learning` renders with a dashed border — under study, not claimed */
  variant?: 'default' | 'learning'
  className?: string
}

export function TechBadge({ name, variant = 'default', className }: TechBadgeProps) {
  const entry = getTechIcon(name)
  const Icon = entry?.icon

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-mono-sm text-muted-foreground',
        variant === 'default' && 'border border-border bg-surface',
        variant === 'learning' && 'border border-dashed border-border-strong',
        className,
      )}
    >
      {Icon ? (
        <Icon className="size-3.5 shrink-0" style={entry.color ? { color: entry.color } : undefined} aria-hidden />
      ) : null}
      {name}
    </span>
  )
}
