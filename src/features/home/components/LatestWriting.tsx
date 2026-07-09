import { Link } from '@tanstack/react-router'
import { ArrowRight, Clock } from 'lucide-react'
import { posts } from '#/features/writing/lib/posts'
import { formatDate } from '#/lib/dates'
import { Section } from '#/components/shared/Section'
import { SectionHeader } from '#/components/shared/SectionHeader'
import { Reveal } from '#/components/motion/Reveal'

const MAX_POSTS = 3

export function LatestWriting() {
  if (posts.length === 0) return null
  const latest = posts.slice(0, MAX_POSTS)

  return (
    <Section>
      <div className="flex items-end justify-between gap-4">
        <SectionHeader eyebrow="Writing" title="Latest writing" className="mb-0" />
        <Link
          to="/writing"
          className="mb-2 hidden shrink-0 items-center gap-1 text-small text-accent hover:underline sm:inline-flex"
        >
          All posts
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>

      <ol className="mt-10 space-y-4">
        {latest.map((post, index) => (
          <li key={post.slug}>
            <Reveal delay={index * 0.06}>
              <Link
                to="/writing/$slug"
                params={{ slug: post.slug }}
                className="group flex flex-col gap-1 rounded-md border border-border bg-surface p-5 transition-[border-color] duration-(--duration-base) hover:border-border-strong sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
              >
                <span className="text-body font-medium text-foreground group-hover:text-accent">
                  {post.title}
                </span>
                <span className="flex shrink-0 items-center gap-3 text-small text-subtle-foreground">
                  <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="size-3.5" aria-hidden />
                    {post.readingStats.minutes} min
                  </span>
                </span>
              </Link>
            </Reveal>
          </li>
        ))}
      </ol>

      <Reveal delay={0.2} className="mt-8 text-center sm:hidden">
        <Link to="/writing" className="inline-block text-body font-medium text-accent hover:underline">
          View all posts
        </Link>
      </Reveal>
    </Section>
  )
}
