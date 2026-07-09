import { Link, createFileRoute } from '@tanstack/react-router'
import { seoHead } from '#/lib/seo/meta'
import { timelineByYear } from '#/features/timeline/lib/build-timeline'
import { Container } from '#/components/shared/Container'
import { SectionHeader } from '#/components/shared/SectionHeader'
import { Reveal } from '#/components/motion/Reveal'
import { cn } from '#/lib/utils'
import type { TimelineCategory } from '#/features/timeline/lib/build-timeline'

export const Route = createFileRoute('/timeline')({
  head: () =>
    seoHead({
      title: 'Timeline',
      description:
        'Everything in one stream — education, projects, experience, achievements, and milestones, in order.',
      path: '/timeline',
    }),
  component: TimelinePage,
})

const categoryStyles: Record<TimelineCategory, { label: string; dot: string }> = {
  education: { label: 'Education', dot: 'bg-success' },
  experience: { label: 'Experience', dot: 'bg-accent' },
  project: { label: 'Project', dot: 'bg-warning' },
  achievement: { label: 'Achievement', dot: 'bg-accent' },
  certification: { label: 'Certification', dot: 'bg-success' },
  milestone: { label: 'Milestone', dot: 'bg-subtle-foreground' },
}

function TimelinePage() {
  const years = timelineByYear()

  return (
    <Container className="py-section-sm">
      <SectionHeader
        as="h1"
        eyebrow="Timeline"
        title="The whole story, in order"
        description="Education, projects, experience, achievements, and milestones — one derived stream, newest first."
      />

      <div className="space-y-12">
        {years.map(({ year, events }) => (
          <section key={year}>
            <h2 className="mb-6 font-display text-title-1 text-foreground">{year}</h2>
            <ol className="relative space-y-6 border-l border-border pl-8">
              {events.map((event, index) => {
                const style = categoryStyles[event.category]
                const body = (
                  <>
                    <p className="flex flex-wrap items-center gap-2 font-mono text-mono-sm text-subtle-foreground">
                      <span className={cn('size-2 rounded-full', style.dot)} aria-hidden />
                      {style.label}
                    </p>
                    <h3 className="mt-1.5 text-body font-medium text-foreground">{event.title}</h3>
                    {event.subtitle ? (
                      <p className="mt-0.5 text-small text-muted-foreground">{event.subtitle}</p>
                    ) : null}
                    {event.description ? (
                      <p className="mt-2 max-w-prose text-small text-muted-foreground">
                        {event.description}
                      </p>
                    ) : null}
                  </>
                )
                return (
                  <li key={event.id} className="relative">
                    <Reveal delay={Math.min(index * 0.05, 0.3)}>
                      <span
                        className="absolute top-1.5 -left-[37px] size-[11px] rounded-full border-2 border-background bg-border-strong"
                        aria-hidden
                      />
                      {event.href ? (
                        <Link
                          to={event.href}
                          className="group block rounded-md transition-colors hover:bg-surface -m-2 p-2"
                        >
                          {body}
                        </Link>
                      ) : (
                        body
                      )}
                    </Reveal>
                  </li>
                )
              })}
            </ol>
          </section>
        ))}
      </div>
    </Container>
  )
}
