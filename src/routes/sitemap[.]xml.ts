import { createFileRoute } from '@tanstack/react-router'
import { content } from '#/content'
import { posts } from '#/features/writing/lib/posts'

interface SitemapEntry {
  path: string
  lastmod?: string
}

/**
 * Mirrors the noIndex gating on each route (SPEC-REVIEW.md §3) — a page
 * that isn't indexed doesn't belong in the sitemap either.
 */
function buildEntries(): Array<SitemapEntry> {
  const siteUpdated = content.changelog[0]?.date

  const staticPages: Array<SitemapEntry> = [
    { path: '/', lastmod: siteUpdated },
    { path: '/projects', lastmod: siteUpdated },
    { path: '/about', lastmod: siteUpdated },
    { path: '/skills', lastmod: siteUpdated },
    { path: '/timeline', lastmod: siteUpdated },
    { path: '/education', lastmod: siteUpdated },
    { path: '/now', lastmod: content.now.updatedAt },
    { path: '/uses' },
    ...(posts.length > 0 ? [{ path: '/writing', lastmod: posts[0].publishedAt }] : []),
    ...(content.experience.some((entry) => entry.published) ? [{ path: '/experience' }] : []),
    ...(content.achievements.length > 0 ? [{ path: '/achievements' }] : []),
    ...(content.certifications.length > 0 ? [{ path: '/certifications' }] : []),
    ...(content.changelog.length > 0 ? [{ path: '/changelog', lastmod: siteUpdated }] : []),
    ...(content.openSource.length > 0 ? [{ path: '/open-source' }] : []),
    ...(content.reading.length > 0 ? [{ path: '/reading' }] : []),
    ...(content.speaking.length > 0 ? [{ path: '/speaking', lastmod: content.speaking[0]?.date }] : []),
    ...(content.resume.versions.length > 0
      ? [{ path: '/resume', lastmod: content.resume.updatedAt }]
      : []),
  ]

  const projectPages: Array<SitemapEntry> = content.projects.map((project) => ({
    path: `/projects/${project.slug}`,
    lastmod: project.updatedAt ?? project.publishedAt,
  }))

  const postPages: Array<SitemapEntry> = posts.map((post) => ({
    path: `/writing/${post.slug}`,
    lastmod: post.updatedAt ?? post.publishedAt,
  }))

  return [...staticPages, ...projectPages, ...postPages]
}

function buildSitemap(): string {
  const { url } = content.seo
  const urls = buildEntries()
    .map((entry) =>
      [
        '  <url>',
        `    <loc>${url}${entry.path}</loc>`,
        ...(entry.lastmod ? [`    <lastmod>${entry.lastmod}</lastmod>`] : []),
        '  </url>',
      ].join('\n'),
    )
    .join('\n')

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urls,
    '</urlset>',
  ].join('\n')
}

export const Route = createFileRoute('/sitemap.xml')({
  server: {
    handlers: {
      GET: () =>
        new Response(buildSitemap(), {
          headers: {
            'Content-Type': 'application/xml; charset=utf-8',
            'Cache-Control': 'public, max-age=3600',
          },
        }),
    },
  },
})
