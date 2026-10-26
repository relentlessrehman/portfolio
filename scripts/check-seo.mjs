import assert from 'node:assert/strict'
import { readFile, readdir } from 'node:fs/promises'
import { parse } from 'yaml'

const origin = (process.argv[2] ?? 'http://localhost:3100').replace(/\/$/, '')
const seo = JSON.parse(
  await readFile(
    new URL('../src/content/data/seo.json', import.meta.url),
    'utf8',
  ),
)
const directory = new URL('../src/content/writing/', import.meta.url)
const articles = []
for (const filename of await readdir(directory)) {
  if (!filename.endsWith('.mdx')) continue
  const source = await readFile(new URL(filename, directory), 'utf8')
  const frontmatter = parse(
    source.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? '',
  )
  if (frontmatter.draft) continue
  articles.push({
    path: `/writing/${filename.replace(/\.mdx$/, '')}`,
    ...frontmatter,
  })
}

async function get(path) {
  const response = await fetch(`${origin}${path}`, {
    signal: AbortSignal.timeout(30000),
  })
  return { response, body: await response.text() }
}

function attribute(tag, name) {
  return tag.match(new RegExp(`\\b${name}="([^"]*)"`, 'i'))?.[1]
}

for (const path of [
  '/',
  '/about',
  '/projects',
  '/writing',
  ...articles.map((post) => post.path),
]) {
  const { response, body } = await get(path)
  assert.equal(response.status, 200, path)
  const canonicals = [...body.matchAll(/<link\b[^>]*>/g)]
    .map(([tag]) => tag)
    .filter((tag) => attribute(tag, 'rel') === 'canonical')
  assert.equal(canonicals.length, 1, `${path}: exactly one canonical`)
  assert.equal(
    attribute(canonicals[0], 'href'),
    `${seo.url}${path}`,
    `${path}: production canonical`,
  )
  const robots = [...body.matchAll(/<meta\b[^>]*>/g)]
    .map(([tag]) => tag)
    .filter((tag) => attribute(tag, 'name') === 'robots')
  assert.equal(robots.length, 1, `${path}: exactly one robots directive`)
  assert(
    !attribute(robots[0], 'content').includes('noindex'),
    `${path}: public page indexable`,
  )
  const structuredData = [
    ...body.matchAll(
      /<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g,
    ),
  ].map((match) => JSON.parse(match[1]))
  const post = articles.find((article) => article.path === path)
  if (post) {
    const article = structuredData.find(
      (data) => data['@type'] === 'BlogPosting',
    )
    assert(article, `${path}: BlogPosting`)
    assert.equal(article.headline, post.title)
    assert.equal(article.datePublished, post.publishedAt)
    assert(
      body.includes('<article'),
      `${path}: server-rendered article element`,
    )
    assert(
      body.replace(/<[^>]*>/g, '').includes('About Abdul Rehman'),
      `${path}: author bio`,
    )
    // Require real body paragraphs, beyond the article header and metadata.
    const articleMarkup =
      body.match(/<article\b[^>]*>([\s\S]*?)<\/article>/)?.[1] ?? ''
    assert(
      (articleMarkup.match(/<p[\s>]/g) ?? []).length >= 3,
      `${path}: server-rendered body paragraphs`,
    )
  }
  console.log(
    `PASS ${path}: HTTP 200, canonical, indexing, structured data${post ? ', article body' : ''}`,
  )
}

const { body: sitemap } = await get('/sitemap.xml')
const { body: rss } = await get('/rss.xml')
const { body: llms } = await get('/llms.txt')
for (const post of articles) {
  assert(
    sitemap.includes(`${seo.url}${post.path}`),
    `${post.path}: sitemap entry`,
  )
  assert(rss.includes(`${seo.url}${post.path}`), `${post.path}: RSS entry`)
  assert(
    llms.includes(`${seo.url}${post.path}`),
    `${post.path}: llms index entry`,
  )
}
for (const match of sitemap.matchAll(/<lastmod>(.*?)<\/lastmod>/g)) {
  assert(/^\d{4}-\d{2}-\d{2}$/.test(match[1]), 'Sitemap dates must be complete')
}
assert(
  !sitemap.includes('/studio') && !sitemap.includes('/dashboard'),
  'Private routes excluded',
)
const { body: robots } = await get('/robots.txt')
assert(
  robots.includes(`Sitemap: ${seo.url}/sitemap.xml`),
  'Sitemap discovery in robots.txt',
)
const missing = await get('/writing/seo-check-nonexistent-article')
assert.equal(
  missing.response.status,
  404,
  'Missing article must return HTTP 404',
)
const { body: dashboard } = await get('/dashboard')
assert(
  /name="robots"[^>]*content="noindex(?:, nofollow)?"/.test(dashboard),
  'Dashboard remains noindex',
)
console.log(
  `PASS discovery: ${articles.length} published articles in sitemap/RSS/llms.txt; valid dates; missing article 404; private dashboard noindex`,
)
