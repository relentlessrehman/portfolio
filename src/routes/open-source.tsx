import { createFileRoute } from '@tanstack/react-router'
import { ArrowUpRight, GitPullRequest } from 'lucide-react'
import { content, featuredSocials } from '#/content'
import { seoHead } from '#/lib/seo/meta'
import { Container } from '#/components/shared/Container'
import { SectionHeader } from '#/components/shared/SectionHeader'
import { Reveal } from '#/components/motion/Reveal'

export const Route = createFileRoute('/open-source')({
  head: () =>
    seoHead({
      title: 'Open Source',
      description: 'Contributions to projects outside my own.',
      path: '/open-source',
      noIndex: content.openSource.length === 0,
    }),
  component: OpenSourcePage,
})

function OpenSourcePage() {
  const github = featuredSocials.find((link) => link.platform === 'github')

  return (
    <Container className="py-section-sm">
      <SectionHeader as="h1" eyebrow="Open Source" title="Contributions" />

      {content.openSource.length > 0 ? (
        <ul className="mt-8 grid gap-4">
          {content.openSource.map((contribution, index) => (
            <li key={contribution.id}>
              <Reveal delay={index * 0.06} className="rounded-md border border-border bg-surface p-6">
                <div className="flex items-start gap-4">
                  <GitPullRequest className="mt-1 size-5 shrink-0 text-accent" aria-hidden />
                  <div>
                    <h2 className="text-body font-medium text-foreground">
                      {contribution.project}
                    </h2>
                    <p className="mt-1 text-small text-muted-foreground">
                      {contribution.description}
                    </p>
                    <p className="mt-1 text-small text-muted-foreground">
                      {[contribution.role, contribution.year].filter(Boolean).join(' · ')}
                    </p>
                    <a
                      href={contribution.url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-small text-accent hover:underline"
                    >
                      View
                      <ArrowUpRight className="size-3.5" aria-hidden />
                    </a>
                  </div>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-8 flex flex-col items-center justify-center rounded-md border border-border bg-surface py-20 text-center">
          <GitPullRequest className="mb-4 size-10 text-muted-foreground opacity-50" aria-hidden />
          <p className="text-body-lg font-medium text-foreground">
            No public contributions
          </p>
          <p className="mt-1 text-small text-muted-foreground">
            I haven't logged any open source contributions here yet.
          </p>
          {github ? (
            <a
              href={github.url}
              target="_blank"
              rel="noreferrer"
              className="mt-6 rounded-md border border-border px-4 py-2 text-small font-medium text-foreground transition-colors hover:border-border-strong hover:bg-surface"
            >
              See my work on GitHub
            </a>
          ) : null}
        </div>
      )}
    </Container>
  )
}
