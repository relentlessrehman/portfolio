import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { SkillIconCard } from './SkillIconCard'
import { StatusBadge } from './StatusBadge'
import type { Project } from '#/content/schemas/project'

const MAX_BADGES = 5

interface ProjectCardProps {
  project: Project
}

/** Card used on the home page and projects grid — links to the case study. */
export function ProjectCard({ project }: ProjectCardProps) {
  const overflow = project.techStack.length - MAX_BADGES

  return (
    <Link
      to="/projects/$slug"
      params={{ slug: project.slug }}
      className="group block h-full"
    >
      <article className="flex h-full flex-col rounded-md border border-border bg-surface p-5 transition-[border-color,transform] duration-(--duration-base) group-hover:-translate-y-0.5 group-hover:border-border-strong motion-reduce:group-hover:translate-y-0 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-display text-title-2 text-foreground">{project.name}</h3>
          <StatusBadge status={project.status} className="mt-1.5 shrink-0" />
        </div>
        <p className="mt-1 text-small text-subtle-foreground">{project.tagline}</p>
        <p className="mt-4 flex-1 text-body text-muted-foreground">{project.summary}</p>
        <ul className="mt-5 flex flex-wrap gap-1.5" aria-label="Technologies used">
          {project.techStack.slice(0, MAX_BADGES).map((tech) => (
            <li key={tech}>
              <SkillIconCard name={tech} size="sm" />
            </li>
          ))}
          {overflow > 0 ? (
            <li className="self-center text-small text-subtle-foreground">+{overflow} more</li>
          ) : null}
        </ul>
        <p className="mt-5 inline-flex items-center gap-1 text-small text-accent">
          Read case study
          <ArrowRight
            className="size-4 transition-transform duration-(--duration-fast) group-hover:translate-x-0.5 motion-reduce:group-hover:translate-x-0"
            aria-hidden
          />
        </p>
      </article>
    </Link>
  )
}
