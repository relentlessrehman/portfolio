import { createFileRoute } from '@tanstack/react-router'
import { content } from '#/content'
import { posts } from '#/features/writing/lib/posts'

function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function rfc822(date: string): string {
  return new Date(`${date}T00:00:00Z`).toUTCString()
}

function buildRss(): string {
  const { seo, profile } = content
  const items = posts
    .map((post) => {
      const url = `${seo.url}/writing/${post.slug}`
      return [
        '    <item>',
        `      <title>${escapeXml(post.title)}</title>`,
        `      <link>${url}</link>`,
        `      <guid isPermaLink="true">${url}</guid>`,
        `      <description>${escapeXml(post.description)}</description>`,
        `      <pubDate>${rfc822(post.publishedAt)}</pubDate>`,
        ...post.tags.map((tag) => `      <category>${escapeXml(tag)}</category>`),
        '    </item>',
      ].join('\n')
    })
    .join('\n')

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    '  <channel>',
    `    <title>${escapeXml(seo.siteName)} — Writing</title>`,
    `    <link>${seo.url}/writing</link>`,
    `    <description>${escapeXml(`Notes on software engineering by ${profile.name}.`)}</description>`,
    '    <language>en</language>',
    `    <atom:link href="${seo.url}/rss.xml" rel="self" type="application/rss+xml"/>`,
    ...(posts.length > 0 ? [`    <lastBuildDate>${rfc822(posts[0].publishedAt)}</lastBuildDate>`] : []),
    items,
    '  </channel>',
    '</rss>',
  ].join('\n')
}

export const Route = createFileRoute('/rss.xml')({
  server: {
    handlers: {
      GET: () =>
        new Response(buildRss(), {
          headers: {
            'Content-Type': 'application/rss+xml; charset=utf-8',
            'Cache-Control': 'public, max-age=3600',
          },
        }),
    },
  },
})
