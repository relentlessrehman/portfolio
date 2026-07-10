import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { featuredProjects } from '#/content'
import { Section } from '#/components/shared/Section'
import { SectionHeader } from '#/components/shared/SectionHeader'
import { ProjectCard } from '#/components/shared/ProjectCard'
import { StatusBadge } from '#/components/shared/StatusBadge'
import { SkillIconCard } from '#/components/shared/SkillIconCard'
import { Reveal } from '#/components/motion/Reveal'
import type { Project } from '#/content/schemas/project'

/**
 * Bento layout: the first featured project gets the large cell, the rest
 * stack beside it. Degrades gracefully to a single wide card or a plain
 * grid as the featured count changes — content decides, not code.
 */
export function FeaturedProjects() {
  if (featuredProjects.length === 0) return null
  const [lead, ...rest] = featuredProjects

  return (
    <Section id="work">
      <div className="flex items-end justify-between gap-4">
        <SectionHeader
          eyebrow="Selected work"
          title="Featured projects"
          description="From a production platform serving real users to hackathon builds and hands-on experiments. Start with Stayza."
          className="mb-0"
        />
        <Link
          to="/projects"
          className="mb-2 hidden shrink-0 items-center gap-1 text-small text-accent hover:underline sm:inline-flex"
        >
          All projects
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-12">
        <Reveal className={rest.length > 0 ? 'md:col-span-8' : 'md:col-span-12'}>
          <LeadProjectCard project={lead} />
        </Reveal>
        {rest.length > 0 ? (
          <div className="flex flex-col gap-6 md:col-span-4">
            {rest.map((project, index) => (
              <Reveal key={project.slug} delay={(index + 1) * 0.08} className="flex-1">
                <ProjectCard project={project} />
              </Reveal>
            ))}
          </div>
        ) : null}
      </div>

      <Link
        to="/projects"
        className="mt-6 inline-flex items-center gap-1 text-small text-accent hover:underline sm:hidden"
      >
        All projects
        <ArrowRight className="size-4" aria-hidden />
      </Link>
    </Section>
  )
}

/** Case-study framed treatment for the lead project — problem, approach, stack, in one glance. */
function LeadProjectCard({ project }: { project: Project }) {
  const problem = project.caseStudy?.problem?.[0]
  const approach = project.caseStudy?.implementation?.[0]

  return (
    <Link to="/projects/$slug" params={{ slug: project.slug }} className="group block h-full">
      <article className="flex h-full flex-col rounded-md border border-border bg-surface p-5 transition-[border-color,transform] duration-(--duration-base) group-hover:-translate-y-0.5 group-hover:border-border-strong motion-reduce:group-hover:translate-y-0 sm:p-6 md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-mono-sm tracking-widest text-accent uppercase">
              Lead project
            </p>
            <h3 className="mt-2 font-display text-title-1 text-foreground">{project.name}</h3>
            <p className="mt-1 text-small text-subtle-foreground">{project.tagline}</p>
          </div>
          <StatusBadge status={project.status} className="mt-1.5 shrink-0" />
        </div>

        <p className="mt-4 text-body-lg text-muted-foreground">{project.summary}</p>

        {problem || approach ? (
          <div className="mt-6 grid gap-5 border-t border-border pt-6 sm:grid-cols-2">
            {problem ? (
              <div>
                <p className="font-mono text-mono-sm tracking-widest text-subtle-foreground uppercase">
                  The problem
                </p>
                <p className="mt-1.5 line-clamp-4 text-small text-muted-foreground">{problem}</p>
              </div>
            ) : null}
            {approach ? (
              <div>
                <p className="font-mono text-mono-sm tracking-widest text-subtle-foreground uppercase">
                  What I built
                </p>
                <p className="mt-1.5 line-clamp-4 text-small text-muted-foreground">{approach}</p>
              </div>
            ) : null}
          </div>
        ) : null}

        <ul className="mt-5 flex flex-wrap gap-1.5" aria-label="Technologies used">
          {project.techStack.map((tech) => (
            <li key={tech}>
              <SkillIconCard name={tech} size="sm" />
            </li>
          ))}
        </ul>

        <p className="mt-6 inline-flex items-center gap-1 text-small text-accent">
          Read the full case study
          <ArrowRight
            className="size-4 transition-transform duration-(--duration-fast) group-hover:translate-x-0.5 motion-reduce:group-hover:translate-x-0"
            aria-hidden
          />
        </p>
      </article>
    </Link>
  )
}
