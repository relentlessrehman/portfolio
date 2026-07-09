import { cn } from '#/lib/utils'
import { formatDate } from '../lib/case-study'
import type { ProjectStage } from '#/content/schemas/project'

const stageLabels: Record<ProjectStage['stage'], string> = {
  idea: 'Idea',
  planning: 'Planning',
  development: 'Development',
  testing: 'Testing',
  deployment: 'Deployment',
  maintenance: 'Maintenance',
}

const dotStyles: Record<ProjectStage['state'], string> = {
  completed: 'bg-success',
  current: 'bg-accent animate-pulse motion-reduce:animate-none',
  upcoming: 'bg-transparent border border-border-strong',
}

/** Vertical lifecycle timeline: idea → planning → … → maintenance */
export function ProjectStages({ stages }: { stages: Array<ProjectStage> }) {
  return (
    <ol className="space-y-0">
      {stages.map((entry, index) => (
        <li key={entry.stage} className="relative flex gap-4 pb-6 last:pb-0">
          {index < stages.length - 1 ? (
            <span
              className="absolute top-4 left-[5px] h-full w-px bg-border"
              aria-hidden
            />
          ) : null}
          <span
            className={cn('relative mt-1.5 size-[11px] shrink-0 rounded-full', dotStyles[entry.state])}
            aria-hidden
          />
          <div>
            <p className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
              <span className="text-body font-medium text-foreground">
                {stageLabels[entry.stage]}
              </span>
              {entry.date ? (
                <span className="font-mono text-mono-sm text-subtle-foreground">
                  {formatDate(entry.date)}
                </span>
              ) : null}
              {entry.state === 'current' ? (
                <span className="font-mono text-mono-sm text-accent">now</span>
              ) : null}
            </p>
            {entry.note ? (
              <p className="mt-1 text-small text-muted-foreground">{entry.note}</p>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  )
}
