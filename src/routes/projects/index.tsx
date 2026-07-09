import { Link, createFileRoute } from '@tanstack/react-router'
import { FolderGit2 } from 'lucide-react'
import { z } from 'zod'
import { allProjectTechnologies, content } from '#/content'
import { projectStatusSchema } from '#/content/schemas/project'
import { seoHead } from '#/lib/seo/meta'
import { cn } from '#/lib/utils'
import { Container } from '#/components/shared/Container'
import { SectionHeader } from '#/components/shared/SectionHeader'
import { ProjectCard } from '#/components/shared/ProjectCard'
import { Reveal } from '#/components/motion/Reveal'

const searchSchema = z.object({
  tech: z.string().optional().catch(undefined),
  status: projectStatusSchema.optional().catch(undefined),
})

export const Route = createFileRoute('/projects/')({
  validateSearch: searchSchema,
  head: () =>
    seoHead({
      title: 'Projects',
      description:
        'Engineering case studies — every project documented from problem to production: architecture, tradeoffs, and lessons.',
      path: '/projects',
    }),
  component: ProjectsIndex,
})

/** Statuses that actually occur in content — never render dead filters */
const activeStatuses = [...new Set(content.projects.map((project) => project.status))]

function ProjectsIndex() {
  const { tech, status } = Route.useSearch()

  const filtered = content.projects.filter(
    (project) =>
      (!tech || project.techStack.includes(tech)) && (!status || project.status === status),
  )

  return (
    <Container className="py-section-sm">
      <SectionHeader
        as="h1"
        eyebrow="Projects"
        title="Engineering case studies"
        description="Not feature lists — each project documents the problem, the architecture, the tradeoffs, and what I learned shipping it."
      />

      {allProjectTechnologies.length > 1 || activeStatuses.length > 1 ? (
        <div className="mb-10 space-y-3">
          <FilterRow
            label="Technology"
            options={allProjectTechnologies}
            active={tech}
            makeSearch={(value) => ({ tech: value, status })}
          />
          {activeStatuses.length > 1 ? (
            <FilterRow
              label="Status"
              options={activeStatuses}
              active={status}
              makeSearch={(value) => ({ tech, status: value as typeof status })}
            />
          ) : null}
        </div>
      ) : null}

      {filtered.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {filtered.map((project, index) => (
            <Reveal key={project.slug} delay={index * 0.06}>
              <ProjectCard project={project} />
            </Reveal>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-md border border-border bg-surface py-20 text-center">
          <FolderGit2 className="mb-4 size-10 text-muted-foreground opacity-50" aria-hidden />
          <p className="text-body-lg font-medium text-foreground">No projects found</p>
          <p className="mt-1 text-small text-muted-foreground">
            There are no case studies matching your selected filters.
          </p>
          <Link to="/projects" className="mt-6 rounded-md bg-accent px-4 py-2 text-small font-medium text-background transition-opacity hover:opacity-90">
            Clear filters
          </Link>
        </div>
      )}
    </Container>
  )
}

interface FilterRowProps {
  label: string
  options: Array<string>
  active: string | undefined
  makeSearch: (value: string | undefined) => Record<string, string | undefined>
}

function FilterRow({ label, options, active, makeSearch }: FilterRowProps) {
  return (
    <div className="flex w-full items-center gap-2 overflow-x-auto pb-2 scrollbar-hide md:flex-wrap md:overflow-visible md:pb-0">
      <span className="mr-1 shrink-0 font-mono text-mono-sm text-subtle-foreground uppercase">{label}</span>
      {options.map((option) => {
        const isActive = active === option
        return (
          <Link
            key={option}
            to="/projects"
            search={makeSearch(isActive ? undefined : option)}
            className={cn(
              'shrink-0 rounded-full border px-3 py-1.5 font-mono text-mono-sm transition-colors duration-(--duration-fast)',
              isActive
                ? 'border-accent bg-accent-muted text-accent'
                : 'border-border text-muted-foreground hover:border-border-strong hover:text-foreground',
            )}
          >
            {option}
          </Link>
        )
      })}
    </div>
  )
}
