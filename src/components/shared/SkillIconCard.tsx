import { Code2 } from 'lucide-react'
import { getTechIcon } from '#/lib/tech-icons'
import { cn } from '#/lib/utils'

interface SkillIconCardProps {
  name: string
  /** `learning` renders with a dashed border — under study, not claimed */
  variant?: 'default' | 'learning'
  /** `sm` fits inline tech-stack lists (project cards, experience); `md` (default) is for dedicated skill grids */
  size?: 'sm' | 'md'
  className?: string
}

/** Icon-forward skill card: mark on top, name below — built for fast scanning. */
export function SkillIconCard({ name, variant = 'default', size = 'md', className }: SkillIconCardProps) {
  const entry = getTechIcon(name)
  const Icon = entry?.icon ?? Code2

  return (
    <div
      className={cn(
        'flex h-full flex-col items-center rounded-lg border bg-surface text-center transition-[border-color,transform] duration-(--duration-base) hover:-translate-y-0.5 motion-reduce:hover:translate-y-0',
        size === 'md' ? 'gap-2 rounded-xl px-2.5 py-3.5 sm:gap-2.5 sm:px-3 sm:py-4' : 'gap-1.5 px-2 py-2',
        variant === 'default' ? 'border-border hover:border-border-strong' : 'border-dashed border-border-strong',
        className,
      )}
    >
      <span
        className={cn(
          'flex shrink-0 items-center justify-center rounded-md bg-surface-raised',
          size === 'md' ? 'size-9 sm:size-11 sm:rounded-lg' : 'size-6 rounded-sm',
        )}
      >
        <Icon
          className={size === 'md' ? 'size-5 sm:size-6' : 'size-3.5'}
          style={entry?.color ? { color: entry.color } : undefined}
          aria-hidden
        />
      </span>
      <span
        className={cn(
          'font-medium text-foreground',
          size === 'md' ? 'text-[0.75rem] sm:text-small' : 'text-[0.6875rem] leading-tight',
        )}
      >
        {name}
      </span>
    </div>
  )
}
