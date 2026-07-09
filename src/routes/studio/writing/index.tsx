import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useState } from 'react'
import { createPost, deletePost, listPosts } from '#/server/studio'
import { Section } from '#/components/shared/Section'
import { Button, buttonVariants } from '#/components/ui/button'
import { BackLink, StudioGate, StudioHeader } from '#/features/studio/components/StudioChrome'
import { cn } from '#/lib/utils'

export const Route = createFileRoute('/studio/writing/')({
  loader: () => listPosts(),
  head: () => ({
    meta: [{ title: 'Writing — Studio' }, { name: 'robots', content: 'noindex' }],
  }),
  component: WritingIndex,
})

function WritingIndex() {
  const posts = Route.useLoaderData()
  const navigate = useNavigate()
  const create = useServerFn(createPost)
  const remove = useServerFn(deletePost)
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  async function handleNew() {
    const title = window.prompt('Post title?')
    if (!title) return
    setCreating(true)
    try {
      const { slug } = await create({ data: title })
      await navigate({ to: '/studio/writing/$slug', params: { slug } })
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Could not create post.')
    } finally {
      setCreating(false)
    }
  }

  async function handleDelete(slug: string) {
    if (!window.confirm(`Delete "${slug}"? This cannot be undone.`)) return
    setDeleting(slug)
    await remove({ data: slug })
    window.location.reload()
  }

  return (
    <StudioGate>
      <Section>
        <StudioHeader
          title="Writing"
          description="Blog posts as MDX — title, description, tags, and body."
          back={<BackLink to="/studio">Back to Studio</BackLink>}
        />
        <div className="mt-8 grid gap-4">
          <Button type="button" className="w-fit" onClick={handleNew} disabled={creating}>
            {creating ? 'Creating…' : '+ New post'}
          </Button>
          {posts.length === 0 ? (
            <p className="text-body text-muted-foreground">No posts yet — write the first one.</p>
          ) : (
            <ul className="grid gap-3">
              {posts.map((post) => (
                <li
                  key={post.slug}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface p-4"
                >
                  <Link
                    to="/studio/writing/$slug"
                    params={{ slug: post.slug }}
                    className="grid gap-0.5"
                  >
                    <span className="flex items-center gap-2 text-body font-medium text-foreground">
                      {post.title}
                      {post.draft ? (
                        <span className={cn(buttonVariants({ variant: 'secondary', size: 'sm' }), 'h-auto px-2 py-0.5 text-small pointer-events-none')}>
                          Draft
                        </span>
                      ) : null}
                    </span>
                    <span className="text-small text-muted-foreground">{post.publishedAt}</span>
                  </Link>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(post.slug)}
                    disabled={deleting === post.slug}
                  >
                    Delete
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Section>
    </StudioGate>
  )
}
