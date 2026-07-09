import { createFileRoute } from '@tanstack/react-router'
import { content } from '#/content'

function buildRobots(): string {
  return [
    'User-agent: *',
    'Allow: /',
    'Disallow: /studio',
    'Disallow: /dashboard',
    '',
    `Sitemap: ${content.seo.url}/sitemap.xml`,
    '',
  ].join('\n')
}

export const Route = createFileRoute('/robots.txt')({
  server: {
    handlers: {
      GET: () =>
        new Response(buildRobots(), {
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'public, max-age=3600',
          },
        }),
    },
  },
})
