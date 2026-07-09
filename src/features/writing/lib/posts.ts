import { lazy } from 'react'
import { postFrontmatterSchema } from '#/content/schemas/writing'
import type { ComponentType, LazyExoticComponent } from 'react'
import type { PostFrontmatter } from '#/content/schemas/writing'

/*
 * Post registry: adding one MDX file to src/content/writing/ makes it
 * appear in the writing index, home "latest writing", RSS, search, and
 * the sitemap. Frontmatter is Zod-validated at build time; reading stats
 * are injected by the remark plugin at compile time.
 */

interface ReadingStats {
  words: number
  minutes: number
}

// Metadata is eager (needed for lists/feeds); components load lazily so a
// post's compiled body is only fetched when its page is opened.
const frontmatterModules = import.meta.glob('../../../content/writing/*.mdx', {
  eager: true,
  import: 'frontmatter',
})
const statsModules = import.meta.glob('../../../content/writing/*.mdx', {
  eager: true,
  import: 'readingStats',
})
const componentLoaders = import.meta.glob('../../../content/writing/*.mdx', {
  import: 'default',
}) as Record<string, () => Promise<ComponentType>>

export interface Post extends PostFrontmatter {
  slug: string
  readingStats: ReadingStats
}

function slugOf(path: string): string {
  const file = path.split('/').pop()
  return (file ?? path).replace(/\.mdx$/, '')
}

const allPosts: Array<Post> = Object.entries(frontmatterModules).map(([path, raw]) => {
  const parsed = postFrontmatterSchema.safeParse(raw)
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `  • ${issue.path.join('.') || '(root)'}: ${issue.message}`)
      .join('\n')
    throw new Error(`Invalid frontmatter in ${path}:\n${issues}`)
  }
  return {
    slug: slugOf(path),
    ...parsed.data,
    readingStats: statsModules[path] as ReadingStats,
  }
})

/** Published posts, newest first */
export const posts: Array<Post> = allPosts
  .filter((post) => !post.draft)
  .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))

export const allTags: Array<string> = [...new Set(posts.flatMap((post) => post.tags))].sort(
  (a, b) => a.localeCompare(b),
)

export function postBySlug(slug: string): Post | undefined {
  return posts.find((post) => post.slug === slug)
}

// Stable lazy-component cache so React doesn't remount on re-render
const lazyComponents = new Map<string, LazyExoticComponent<ComponentType>>()

export function postComponent(slug: string): LazyExoticComponent<ComponentType> | undefined {
  const path = Object.keys(componentLoaders).find((key) => slugOf(key) === slug)
  if (!path) return undefined
  let component = lazyComponents.get(slug)
  if (!component) {
    const load = componentLoaders[path]
    component = lazy(async () => ({ default: await load() }))
    lazyComponents.set(slug, component)
  }
  return component
}
