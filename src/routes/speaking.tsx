import { createFileRoute } from '@tanstack/react-router'
import { ArrowUpRight, Mic } from 'lucide-react'
import { content } from '#/content'
import { seoHead } from '#/lib/seo/meta'
import { formatDate } from '#/lib/dates'
import { Container } from '#/components/shared/Container'
import { SectionHeader } from '#/components/shared/SectionHeader'
import { Reveal } from '#/components/motion/Reveal'

export const Route = createFileRoute('/speaking')({
  head: () =>
    seoHead({
      title: 'Speaking',
      description: 'Talks and events.',
      path: '/speaking',
      noIndex: content.speaking.length === 0,
    }),
  component: SpeakingPage,
})

function SpeakingPage() {
  return (
    <Container className="py-section-sm">
      <SectionHeader as="h1" eyebrow="Speaking" title="Talks & events" />

      {content.speaking.length > 0 ? (
        <ul className="mt-8 grid gap-4">
          {content.speaking.map((engagement, index) => (
            <li key={engagement.id}>
              <Reveal
                delay={index * 0.06}
                className="flex items-start gap-4 rounded-md border border-border bg-surface p-6"
              >
                <Mic className="mt-1 size-5 shrink-0 text-accent" aria-hidden />
                <div>
                  <h2 className="text-body font-medium text-foreground">{engagement.title}</h2>
                  <p className="mt-0.5 text-small text-muted-foreground">
                    {engagement.event} · {formatDate(engagement.date)}
                  </p>
                  {engagement.description ? (
                    <p className="mt-2 text-small text-muted-foreground">
                      {engagement.description}
                    </p>
                  ) : null}
                  {engagement.url ? (
                    <a
                      href={engagement.url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-small text-accent hover:underline"
                    >
                      View
                      <ArrowUpRight className="size-3.5" aria-hidden />
                    </a>
                  ) : null}
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-8 rounded-md border border-border bg-surface p-10 text-center">
          <p className="text-body-lg text-muted-foreground">No talks or events yet.</p>
        </div>
      )}
    </Container>
  )
}
