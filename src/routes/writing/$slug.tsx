import { Suspense, useEffect, useRef, useState } from 'react'
import { Link, createFileRoute, notFound } from '@tanstack/react-router'
import { Clock, FileText } from 'lucide-react'
import { content } from '#/content'
import { postBySlug, postComponent } from '#/features/writing/lib/posts'
import { seoHead } from '#/lib/seo/meta'
import { articleJsonLd } from '#/lib/seo/jsonld'
import { formatDate } from '#/lib/dates'
import { JsonLd } from '#/components/shared/JsonLd'
import { Container } from '#/components/shared/Container'
import { Breadcrumbs } from '#/components/shared/Breadcrumbs'
import { ReadingProgress } from '#/components/shared/ReadingProgress'
import { Toc } from '#/components/shared/Toc'
import { CopyButton } from '#/components/shared/CopyButton'
import type { TocEntry } from '#/components/shared/Toc'

export const Route = createFileRoute('/writing/$slug')({
  loader: ({ params }) => {
    const post = postBySlug(params.slug)
    if (!post) throw notFound()
    return { post }
  },
  head: ({ loaderData }) =>
    loaderData
      ? seoHead({
          title: loaderData.post.title,
          description: loaderData.post.description,
          path: `/writing/${loaderData.post.slug}`,
          type: 'article',
        })
      : {},
  component: PostPage,
})

function PostPage() {
  const { post } = Route.useLoaderData()
  const Mdx = postComponent(post.slug)
  const articleRef = useRef<HTMLDivElement>(null)
  const [tocEntries, setTocEntries] = useState<Array<TocEntry>>([])
  const canonicalUrl = `${content.seo.url}/writing/${post.slug}`

  return (
    <>
      <ReadingProgress />
      <Container className="py-section-sm">
        <div className="print:hidden">
          <Breadcrumbs
            items={[
              { name: 'Home', path: '/' },
              { name: 'Writing', path: '/writing' },
              { name: post.title },
            ]}
          />
        </div>

        <JsonLd data={articleJsonLd(post)} />

        <header className="mt-8 max-w-3xl">
          <h1 className="font-display text-display text-foreground">{post.title}</h1>
          <p className="mt-4 text-body-lg text-muted-foreground">{post.description}</p>
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-small text-subtle-foreground">
            <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
            {post.updatedAt ? <span>Updated {formatDate(post.updatedAt)}</span> : null}
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-4" aria-hidden />
              {post.readingStats.minutes} min read
            </span>
            <span className="inline-flex items-center gap-1.5">
              <FileText className="size-4" aria-hidden />
              {post.readingStats.words.toLocaleString()} words
            </span>
            <CopyButton value={canonicalUrl} label="Copy link to this post" />
          </div>
          {post.tags.length > 0 ? (
            <ul className="mt-4 flex flex-wrap gap-2" aria-label="Tags">
              {post.tags.map((tag) => (
                <li key={tag}>
                  <Link
                    to="/writing"
                    search={{ tag }}
                    className="rounded-full border border-border px-3 py-1 font-mono text-mono-sm text-muted-foreground hover:border-border-strong hover:text-foreground"
                  >
                    {tag}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </header>

        <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_16rem]">
          <div ref={articleRef} className="min-w-0">
            {Mdx ? (
              <Suspense
                fallback={<p className="text-body text-subtle-foreground">Loading article…</p>}
              >
                <Article Mdx={Mdx} onReady={() => setTocEntries(collectHeadings(articleRef.current))} />
              </Suspense>
            ) : null}
          </div>

          <aside className="hidden print:hidden lg:block">
            <div className="lg:sticky lg:top-24">
              <Toc entries={tocEntries} />
            </div>
          </aside>
        </div>
      </Container>
    </>
  )
}

interface ArticleProps {
  Mdx: React.ComponentType
  onReady: () => void
}

/** Renders the MDX body; effects run once the lazy chunk has resolved. */
function Article({ Mdx, onReady }: ArticleProps) {
  useEffect(() => {
    onReady()
    // onReady identity changes per render; running once after mount is enough
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <article className="prose prose-invert max-w-prose prose-headings:scroll-mt-24 prose-headings:font-display prose-headings:font-normal prose-a:text-accent">
      <Mdx />
    </article>
  )
}

/** TOC derives from the rendered document itself — it can never drift. */
function collectHeadings(container: HTMLElement | null): Array<TocEntry> {
  if (!container) return []
  return [...container.querySelectorAll('h2[id]')].map((heading) => ({
    id: heading.id,
    title: heading.textContent ?? '',
  }))
}
