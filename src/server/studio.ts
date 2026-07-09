/*
 * Studio server functions — the only place content JSON files are written.
 * Local-editing tool only: every handler refuses to run once the site is
 * built for production, so none of this ships as a live write endpoint.
 */
import { createServerFn } from '@tanstack/react-start'
import { mkdir, readFile, readdir, unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { parse as parseYaml } from 'yaml'
import { collectionRegistry, isCollectionKey } from '#/content/studio/registry'
import { postFrontmatterSchema } from '#/content/schemas/writing'
import type { PostFrontmatter } from '#/content/schemas/writing'

function assertDev() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Studio is only available in development.')
  }
}

const dataDir = path.resolve(process.cwd(), 'src/content/data')
const writingDir = path.resolve(process.cwd(), 'src/content/writing')

/* ── Collections (JSON-backed content) ───────────────────────────────── */

export const readCollection = createServerFn({ method: 'GET' })
  .validator((key: string) => key)
  .handler(async ({ data: key }) => {
    assertDev()
    if (!isCollectionKey(key)) throw new Error(`Unknown collection: ${key}`)
    const entry = collectionRegistry[key]
    const raw = await readFile(path.join(dataDir, entry.file), 'utf-8')
    return JSON.parse(raw)
  })

export const writeCollection = createServerFn({ method: 'POST' })
  .validator((input: { key: string; value: unknown }) => input)
  .handler(async ({ data }) => {
    assertDev()
    if (!isCollectionKey(data.key)) throw new Error(`Unknown collection: ${data.key}`)
    const entry = collectionRegistry[data.key]
    const result = entry.schema.safeParse(data.value)
    if (!result.success) {
      return {
        ok: false as const,
        issues: result.error.issues.map(
          (issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`,
        ),
      }
    }
    await writeFile(
      path.join(dataDir, entry.file),
      `${JSON.stringify(data.value, null, 2)}\n`,
      'utf-8',
    )
    return { ok: true as const }
  })

/* ── Writing (MDX posts) ──────────────────────────────────────────────── */

export interface PostSummary extends PostFrontmatter {
  slug: string
}

function splitFrontmatter(raw: string): { frontmatter: string; body: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  if (!match) return { frontmatter: '', body: raw }
  const [, frontmatter, body] = match
  return { frontmatter, body }
}

function serializeFrontmatter(data: PostFrontmatter): string {
  const escape = (s: string) => s.replace(/'/g, "''")
  const lines = [
    `title: '${escape(data.title)}'`,
    `description: '${escape(data.description)}'`,
    `publishedAt: '${data.publishedAt}'`,
    ...(data.updatedAt ? [`updatedAt: '${data.updatedAt}'`] : []),
    `tags: [${data.tags.map((tag) => `'${escape(tag)}'`).join(', ')}]`,
    `draft: ${data.draft}`,
  ]
  return `---\n${lines.join('\n')}\n---\n`
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export const listPosts = createServerFn({ method: 'GET' }).handler(async () => {
  assertDev()
  await mkdir(writingDir, { recursive: true })
  const files = (await readdir(writingDir)).filter((file) => file.endsWith('.mdx'))
  const posts: Array<PostSummary> = []
  for (const file of files) {
    const raw = await readFile(path.join(writingDir, file), 'utf-8')
    const { frontmatter } = splitFrontmatter(raw)
    const parsed = postFrontmatterSchema.safeParse(parseYaml(frontmatter) ?? {})
    if (!parsed.success) continue
    posts.push({ slug: file.replace(/\.mdx$/, ''), ...parsed.data })
  }
  return posts.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
})

export const readPost = createServerFn({ method: 'GET' })
  .validator((slug: string) => slug)
  .handler(async ({ data: slug }) => {
    assertDev()
    const raw = await readFile(path.join(writingDir, `${slug}.mdx`), 'utf-8')
    const { frontmatter, body } = splitFrontmatter(raw)
    const parsed = postFrontmatterSchema.safeParse(parseYaml(frontmatter) ?? {})
    if (!parsed.success) {
      throw new Error(
        `Invalid frontmatter in ${slug}.mdx:\n${parsed.error.issues
          .map((issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`)
          .join('\n')}`,
      )
    }
    return { frontmatter: parsed.data, body: body.replace(/^\n+/, '') }
  })

export const createPost = createServerFn({ method: 'POST' })
  .validator((title: string) => title)
  .handler(async ({ data: title }) => {
    assertDev()
    const slug = slugify(title)
    if (!slug) throw new Error('Title must contain at least one letter or number.')
    await mkdir(writingDir, { recursive: true })
    const file = path.join(writingDir, `${slug}.mdx`)
    try {
      await readFile(file, 'utf-8')
      throw new Error(`A post with slug "${slug}" already exists.`)
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
    }
    const frontmatter: PostFrontmatter = {
      title,
      description: 'TODO — one or two sentences, shows in cards, meta tags, and RSS.',
      publishedAt: new Date().toISOString().slice(0, 10),
      tags: [],
      draft: true,
    }
    const body = '\nWrite here. Markdown, GFM tables, and fenced code blocks all work.\n'
    await writeFile(file, serializeFrontmatter(frontmatter) + body, 'utf-8')
    return { slug }
  })

export const savePost = createServerFn({ method: 'POST' })
  .validator((input: { slug: string; frontmatter: PostFrontmatter; body: string }) => input)
  .handler(async ({ data }) => {
    assertDev()
    const result = postFrontmatterSchema.safeParse(data.frontmatter)
    if (!result.success) {
      return {
        ok: false as const,
        issues: result.error.issues.map(
          (issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`,
        ),
      }
    }
    const file = path.join(writingDir, `${data.slug}.mdx`)
    const body = data.body.startsWith('\n') ? data.body : `\n${data.body}`
    await writeFile(file, serializeFrontmatter(result.data) + body, 'utf-8')
    return { ok: true as const }
  })

export const deletePost = createServerFn({ method: 'POST' })
  .validator((slug: string) => slug)
  .handler(async ({ data: slug }) => {
    assertDev()
    await unlink(path.join(writingDir, `${slug}.mdx`))
    return { ok: true as const }
  })
