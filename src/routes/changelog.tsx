import { createFileRoute } from '@tanstack/react-router'
import { content } from '#/content'
import { seoHead } from '#/lib/seo/meta'
import { formatDate } from '#/lib/dates'
import { Container } from '#/components/shared/Container'
import { SectionHeader } from '#/components/shared/SectionHeader'
import { Reveal } from '#/components/motion/Reveal'
import { cn } from '#/lib/utils'
import type { ChangelogTag } from '#/content/schemas/misc'

export const Route = createFileRoute('/changelog')({
  head: () =>
    seoHead({
      title: 'Changelog',
      description: 'Every update to this site, logged.',
      path: '/changelog',
    }),
  component: ChangelogPage,
})

const tagStyles: Record<ChangelogTag, string> = {
  added: 'text-success border-success/40',
  changed: 'text-warning border-warning/40',
  fixed: 'text-accent border-accent/40',
  milestone: 'text-foreground border-border-strong',
}

function ChangelogPage() {
  return (
    <Container className="py-section-sm" size="prose">
      <SectionHeader
        as="h1"
        eyebrow="Changelog"
        title="Site history"
        description="Every meaningful update to this site, logged like a product."
      />

      <ol className="relative space-y-8 border-l border-border pl-8">
        {content.changelog.map((entry, index) => (
          <li key={`${entry.date}-${entry.title}`} className="relative">
            <Reveal delay={Math.min(index * 0.05, 0.3)}>
              <span
                className="absolute top-2 -left-[37px] size-[11px] rounded-full border-2 border-background bg-border-strong"
                aria-hidden
              />
              <p className="flex flex-wrap items-center gap-3">
                <time
                  dateTime={entry.date}
                  className="font-mono text-mono-sm text-subtle-foreground"
                >
                  {formatDate(entry.date)}
                </time>
                <span
                  className={cn(
                    'rounded-full border px-2 py-0.5 font-mono text-[0.6875rem] tracking-wide uppercase',
                    tagStyles[entry.tag],
                  )}
                >
                  {entry.tag}
                </span>
              </p>
              <h2 className="mt-2 text-body font-medium text-foreground">{entry.title}</h2>
              {entry.description ? (
                <p className="mt-1 text-small text-muted-foreground">{entry.description}</p>
              ) : null}
            </Reveal>
          </li>
        ))}
      </ol>
    </Container>
  )
}
