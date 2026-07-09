import { Link, createFileRoute } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { content, featuredProjects } from '#/content'
import { seoHead } from '#/lib/seo/meta'
import { formatDate } from '#/lib/dates'
import { Container } from '#/components/shared/Container'
import { SectionHeader } from '#/components/shared/SectionHeader'
import { SkillIconCard } from '#/components/shared/SkillIconCard'
import { Reveal } from '#/components/motion/Reveal'

export const Route = createFileRoute('/now')({
  head: () =>
    seoHead({
      title: 'Now',
      description: 'What Abdul Rehman is focused on right now.',
      path: '/now',
    }),
  component: NowPage,
})

function NowPage() {
  const current = featuredProjects[0]

  return (
    <Container className="py-section-sm" size="prose">
      <SectionHeader
        as="h1"
        eyebrow="Now"
        title="What I'm doing now"
        description={`Last updated ${formatDate(content.now.updatedAt)}`}
      />

      <Reveal>
        {content.now.note ? (
          <p className="mb-8 text-body-lg text-muted-foreground">{content.now.note}</p>
        ) : null}

        <h2 className="mb-4 font-mono text-mono-sm tracking-widest text-subtle-foreground uppercase">
          Current focus
        </h2>
        <ul className="space-y-3">
          {content.profile.currentFocus.map((item) => (
            <li key={item} className="flex gap-3 text-body-lg text-muted-foreground">
              <span className="mt-3 size-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
              {item}
            </li>
          ))}
        </ul>

        {current ? (
          <div className="mt-10 rounded-md border border-border bg-surface p-6">
            <h2 className="font-mono text-mono-sm tracking-widest text-accent uppercase">
              Building
            </h2>
            <p className="mt-2 text-title-3 font-medium text-foreground">{current.name}</p>
            <p className="mt-1 text-body text-muted-foreground">{current.tagline}</p>
            <Link
              to="/projects/$slug"
              params={{ slug: current.slug }}
              className="mt-3 inline-flex items-center gap-1 text-small text-accent hover:underline"
            >
              Read the case study
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        ) : null}

        {content.learningTopics.length > 0 ? (
          <div className="mt-10">
            <h2 className="mb-4 font-mono text-mono-sm tracking-widest text-subtle-foreground uppercase">
              Learning
            </h2>
            <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {content.learningTopics.map((topic) => (
                <li key={topic}>
                  <SkillIconCard name={topic} variant="learning" />
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </Reveal>
    </Container>
  )
}
