import { Link, createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { Clock } from 'lucide-react'
import { allTags, posts } from '#/features/writing/lib/posts'
import { seoHead } from '#/lib/seo/meta'
import { cn } from '#/lib/utils'
import { Container } from '#/components/shared/Container'
import { SectionHeader } from '#/components/shared/SectionHeader'
import { Reveal } from '#/components/motion/Reveal'
import { formatDate } from '#/lib/dates'

const searchSchema = z.object({
  tag: z.string().optional().catch(undefined),
})

export const Route = createFileRoute('/writing/')({
  validateSearch: searchSchema,
  head: () =>
    seoHead({
      title: 'Writing',
      description:
        'Notes on software engineering — architecture decisions, lessons from building products, and things worth writing down.',
      path: '/writing',
    }),
  component: WritingIndex,
})

function WritingIndex() {
  const { tag } = Route.useSearch()
  const filtered = tag ? posts.filter((post) => post.tags.includes(tag)) : posts

  return (
    <Container className="py-section-sm">
      <SectionHeader
        eyebrow="Writing"
        title="Notes & articles"
        description="Things I've learned building software, written down so I actually retain them."
      />

      {allTags.length > 0 ? (
        <div className="mb-10 flex flex-wrap items-center gap-2">
          <span className="mr-1 font-mono text-mono-sm text-subtle-foreground uppercase">
            Tags
          </span>
          {allTags.map((option) => {
            const isActive = tag === option
            return (
              <Link
                key={option}
                to="/writing"
                search={isActive ? {} : { tag: option }}
                className={cn(
                  'rounded-full border px-3 py-1.5 font-mono text-mono-sm transition-colors duration-(--duration-fast)',
                  isActive
                    ? 'border-accent bg-accent-muted text-accent'
                    : 'border-border text-muted-foreground hover:border-border-strong hover:text-foreground',
                )}
              >
                {option}
              </Link>
            )
          })}
        </div>
      ) : null}

      {filtered.length > 0 ? (
        <ol className="space-y-5">
          {filtered.map((post, index) => (
            <li key={post.slug}>
              <Reveal delay={index * 0.05}>
                <Link
                  to="/writing/$slug"
                  params={{ slug: post.slug }}
                  className="group block rounded-md border border-border bg-surface p-6 transition-[border-color] duration-(--duration-base) hover:border-border-strong"
                >
                  <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                    <h2 className="font-display text-title-2 text-foreground group-hover:text-accent">
                      {post.title}
                    </h2>
                  </div>
                  <p className="mt-2 max-w-prose text-body text-muted-foreground">
                    {post.description}
                  </p>
                  <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-small text-subtle-foreground">
                    <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="size-3.5" aria-hidden />
                      {post.readingStats.minutes} min read
                    </span>
                    {post.tags.length > 0 ? (
                      <span className="font-mono">{post.tags.join(' · ')}</span>
                    ) : null}
                  </p>
                </Link>
              </Reveal>
            </li>
          ))}
        </ol>
      ) : (
        <div className="rounded-md border border-border bg-surface p-10 text-center">
          <p className="text-body-lg text-muted-foreground">No posts with this tag yet.</p>
          <Link to="/writing" className="mt-3 inline-block text-body text-accent hover:underline">
            All posts
          </Link>
        </div>
      )}
    </Container>
  )
}
