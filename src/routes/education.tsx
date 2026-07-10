import { createFileRoute } from '@tanstack/react-router'
import { content } from '#/content'
import { seoHead } from '#/lib/seo/meta'
import { Container } from '#/components/shared/Container'
import { SectionHeader } from '#/components/shared/SectionHeader'
import { Reveal } from '#/components/motion/Reveal'
import { formatDate } from '#/lib/dates'

export const Route = createFileRoute('/education')({
  head: () =>
    seoHead({
      title: 'Education',
      description:
        'BS Computer Science at NUST (SEECS), Islamabad — and the road there.',
      path: '/education',
    }),
  component: EducationPage,
})

function formatPeriod(period: { start?: string; end: number; expected: boolean }): string {
  const end = period.expected ? `${period.end} (expected)` : String(period.end)
  return period.start ? `${formatDate(period.start)} — ${end}` : end
}

function EducationPage() {
  return (
    <Container className="py-section-sm">
      <SectionHeader as="h1" eyebrow="Education" title="Where I've studied" />

      <ol className="space-y-6">
        {content.education.map((entry, index) => (
          <li key={entry.id}>
            <Reveal delay={index * 0.08} className="rounded-md border border-border bg-surface p-6 md:p-8">
              <p className="font-mono text-mono-sm text-subtle-foreground">
                {formatPeriod(entry.period)}
              </p>
              <h2 className="mt-2 font-display text-title-2 text-foreground">{entry.degree}</h2>
              {entry.institution ? (
                <p className="mt-1 text-body text-muted-foreground">
                  {entry.institution}
                  {entry.school ? ` · ${entry.school}` : ''}
                </p>
              ) : null}
              {entry.location ? (
                <p className="mt-1 text-small text-subtle-foreground">{entry.location}</p>
              ) : null}
              {entry.summary ? (
                <p className="mt-4 max-w-prose text-body text-muted-foreground">{entry.summary}</p>
              ) : null}
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
            </Reveal>
          </li>
        ))}
      </ol>
    </Container>
  )
}
