import { ArrowUpRight, Github } from 'lucide-react'
import { StatusBadge } from '#/components/shared/StatusBadge'
import { buttonVariants } from '#/components/ui/button'
import { formatDuration, formatTimeline } from '../lib/case-study'
import type { EngineeringMetrics, Project } from '#/content/schemas/project'

const engineeringLabels: Record<keyof EngineeringMetrics, string> = {
  commits: 'Commits',
  features: 'Features',
  pages: 'Pages',
  apiRoutes: 'API routes',
  databaseTables: 'Database tables',
  users: 'Users',
  performanceScore: 'Performance score',
  lighthouseScore: 'Lighthouse score',
}

/** Fact panel: status, role, team, dates, metrics (structured + custom), links. */
export function ProjectMeta({ project }: { project: Project }) {
  const facts: Array<{ label: string; value: string }> = [
    { label: 'Role', value: project.role },
    { label: 'Team', value: project.teamSize === 1 ? 'Solo' : `${project.teamSize} people` },
    { label: 'Timeline', value: formatTimeline(project.timeline) },
    { label: 'Development time', value: formatDuration(project.timeline) },
    ...(project.version ? [{ label: 'Version', value: project.version }] : []),
    ...(project.difficulty
      ? [{ label: 'Difficulty', value: capitalize(project.difficulty) }]
      : []),
    { label: 'Technologies', value: String(project.techStack.length) },
    // Structured engineering metrics render automatically when present
    ...Object.entries(project.engineering ?? {}).map(([key, value]) => ({
      label: engineeringLabels[key as keyof EngineeringMetrics],
      value: String(value),
    })),
    ...project.metrics,
  ]

  return (
    <div className="rounded-md border border-border bg-surface p-6">
      <StatusBadge status={project.status} />
      <dl className="mt-5 space-y-4">
        {facts.map((fact) => (
          <div key={fact.label} className="flex items-baseline justify-between gap-4">
            <dt className="text-small text-subtle-foreground">{fact.label}</dt>
            <dd className="text-right text-small text-foreground">{fact.value}</dd>
          </div>
        ))}
      </dl>

      {project.links.live || project.links.github ? (
        <div className="mt-6 flex flex-col gap-2 border-t border-border pt-6 print:hidden">
          {project.links.live ? (
            <a
              href={project.links.live}
              target="_blank"
              rel="noreferrer"
              className={buttonVariants({ variant: 'primary', size: 'sm' })}
            >
              Live demo
              <ArrowUpRight aria-hidden />
            </a>
          ) : null}
          {project.links.github ? (
            <a
              href={project.links.github}
              target="_blank"
              rel="noreferrer"
              className={buttonVariants({ variant: 'secondary', size: 'sm' })}
            >
              <Github aria-hidden />
              Source code
            </a>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}
