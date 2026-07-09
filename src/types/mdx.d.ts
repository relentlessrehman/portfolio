declare module '*.mdx' {
  import type { ComponentType } from 'react'

  /** Raw frontmatter — validated with Zod in features/writing/lib/posts.ts */
  export const frontmatter: unknown
  /** Injected at build time by remark-reading-stats */
  export const readingStats: { words: number; minutes: number }

  const MDXContent: ComponentType<{
    components?: Record<string, ComponentType<Record<string, unknown>>>
  }>
  export default MDXContent
}
