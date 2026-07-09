import { createFileRoute } from '@tanstack/react-router'
import { ArrowUpRight } from 'lucide-react'
import { publishedExperience } from '#/content'
import { seoHead } from '#/lib/seo/meta'
import { Container } from '#/components/shared/Container'
import { SectionHeader } from '#/components/shared/SectionHeader'
import { SkillIconCard } from '#/components/shared/SkillIconCard'
import { Reveal } from '#/components/motion/Reveal'

export const Route = createFileRoute('/experience')({
  head: () =>
    seoHead({
      title: 'Experience',
      description:
        'Where Abdul Rehman has worked — founder and engineering roles, with the real responsibilities behind each.',
      path: '/experience',
    }),
  component: ExperiencePage,
})

function formatPeriod(start: string, end?: string): string {
  const startYear = start.slice(0, 4)
  const endYear = end ? end.slice(0, 4) : 'Present'
  return startYear === endYear ? startYear : `${startYear} — ${endYear}`
}

function ExperiencePage() {
  return (
    <Container className="py-section-sm">
      <SectionHeader
        as="h1"
        eyebrow="Experience"
        title="Where I've worked"
        description="Roles and what I actually did in them — responsibilities over titles."
      />

      <ol className="relative space-y-8 border-l border-border pl-8">
        {publishedExperience.map((entry, index) => (
          <li key={entry.id} className="relative">
            <Reveal delay={index * 0.08}>
              <span
                className="absolute top-2 -left-[37px] size-[11px] rounded-full border-2 border-background bg-accent"
                aria-hidden
              />
              <p className="font-mono text-mono-sm text-subtle-foreground">
                {formatPeriod(entry.start, entry.end)}
              </p>
              <h2 className="mt-1 text-title-3 font-medium text-foreground">
                {entry.role} ·{' '}
                {entry.organizationUrl ? (
                  <a
                    href={entry.organizationUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-0.5 text-accent hover:underline"
                  >
                    {entry.organization}
                    <ArrowUpRight className="size-3.5" aria-hidden />
                  </a>
                ) : (
                  entry.organization
                )}
              </h2>
              <p className="mt-2 max-w-prose text-body text-muted-foreground">{entry.summary}</p>
              {entry.highlights.length > 0 ? (
                <ul className="mt-4 max-w-prose space-y-2">
                  {entry.highlights.map((highlight) => (
                    <li
                      key={highlight.slice(0, 40)}
                      className="flex gap-2.5 text-body text-muted-foreground"
                    >
                      <span className="mt-2.5 size-1 shrink-0 rounded-full bg-accent" aria-hidden />
                      {highlight}
                    </li>
                  ))}
                </ul>
              ) : null}
              {entry.techStack.length > 0 ? (
                <ul className="mt-4 flex flex-wrap gap-1.5">
                  {entry.techStack.map((tech) => (
                    <li key={tech}>
                      <SkillIconCard name={tech} size="sm" />
                    </li>
                  ))}
                </ul>
              ) : null}
            </Reveal>
          </li>
        ))}
      </ol>
    </Container>
  )
}
