import { cn } from '#/lib/utils'
import type { ProjectStatus } from '#/content/schemas/project'

const statusConfig: Record<ProjectStatus, { label: string; dot: string }> = {
  idea: { label: 'Idea', dot: 'bg-subtle-foreground' },
  planning: { label: 'Planning', dot: 'bg-subtle-foreground' },
  building: { label: 'Building', dot: 'bg-warning' },
  testing: { label: 'Testing', dot: 'bg-warning' },
  production: { label: 'In production', dot: 'bg-success' },
  maintained: { label: 'Maintained', dot: 'bg-success' },
  archived: { label: 'Archived', dot: 'bg-subtle-foreground' },
}

export function StatusBadge({ status, className }: { status: ProjectStatus; className?: string }) {
  const config = statusConfig[status]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-0.5 text-small text-muted-foreground',
        className,
      )}
    >
      <span className={cn('size-1.5 rounded-full', config.dot)} aria-hidden />
      {config.label}
    </span>
  )
}
