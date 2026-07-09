import { createFileRoute } from '@tanstack/react-router'
import { ArrowUpRight, BookOpen } from 'lucide-react'
import { content } from '#/content'
import { seoHead } from '#/lib/seo/meta'
import { Container } from '#/components/shared/Container'
import { SectionHeader } from '#/components/shared/SectionHeader'
import { Reveal } from '#/components/motion/Reveal'
import type { ReadingItem, ReadingStatus } from '#/content/schemas/misc'

const statusLabels: Record<ReadingStatus, string> = {
  reading: 'Currently reading',
  read: 'Read',
  'want-to-read': 'Want to read',
}

const statusOrder: Array<ReadingStatus> = ['reading', 'want-to-read', 'read']

export const Route = createFileRoute('/reading')({
  head: () =>
    seoHead({
      title: 'Reading',
      description: 'Books and long-form pieces shaping how I think.',
      path: '/reading',
      noIndex: content.reading.length === 0,
    }),
  component: ReadingPage,
})

function ReadingPage() {
  const groups = statusOrder
    .map((status) => ({
      status,
      items: content.reading.filter((item) => item.status === status),
    }))
    .filter((group) => group.items.length > 0)

  return (
    <Container className="py-section-sm">
      <SectionHeader as="h1" eyebrow="Reading" title="What I'm reading" />

      {groups.length > 0 ? (
        <div className="mt-8 grid gap-10">
          {groups.map((group) => (
            <div key={group.status}>
              <h2 className="text-title-3 font-semibold text-foreground">
                {statusLabels[group.status]}
              </h2>
              <ul className="mt-4 grid gap-4 sm:grid-cols-2">
                {group.items.map((item, index) => (
                  <Reveal key={item.id} delay={index * 0.06}>
                    <ReadingCard item={item} />
                  </Reveal>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-md border border-border bg-surface p-10 text-center">
          <p className="text-body-lg text-muted-foreground">Nothing logged here yet.</p>
        </div>
      )}
    </Container>
  )
}

function ReadingCard({ item }: { item: ReadingItem }) {
  return (
    <li className="flex h-full gap-4 rounded-md border border-border bg-surface p-6">
      <BookOpen className="mt-1 size-5 shrink-0 text-accent" aria-hidden />
      <div>
        <h3 className="text-body font-medium text-foreground">{item.title}</h3>
        <p className="mt-0.5 text-small text-muted-foreground">{item.author}</p>
        {item.note ? <p className="mt-2 text-small text-muted-foreground">{item.note}</p> : null}
        {item.url ? (
          <a
            href={item.url}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-flex items-center gap-1 text-small text-accent hover:underline"
          >
            View
            <ArrowUpRight className="size-3.5" aria-hidden />
          </a>
        ) : null}
      </div>
    </li>
  )
}
