import { createFileRoute } from '@tanstack/react-router'
import { content } from '#/content'
import { posts } from '#/features/writing/lib/posts'

/** Optional navigation aid for readers and tools; not a search ranking signal. */
export function buildLlmsText() {
  const { profile, seo } = content
  const link = (path: string) => new URL(path, seo.url).href
  return [
    `# ${profile.name}`,
    '',
    `> ${profile.shortBio}`,
    '',
    `Location: ${profile.location}.`,
    'This is Abdul Rehman’s personal portfolio and software engineering blog. Project status and implementation details are documented in each case study.',
    '',
    '## Profile',
    `- [About the author](${link('/about')}): Background, interests, and current focus.`,
    `- [Contact](${link('/contact')}): Internships and collaborations.`,
    `- [Skills](${link('/skills')}): Technologies and engineering interests.`,
    '',
    '## Project case studies',
    ...content.projects.map(
      (project) =>
        `- [${project.name}](${link(`/projects/${project.slug}`)}): ${project.summary} Status: ${project.status}.`,
    ),
    '',
    '## Articles',
    ...posts.map(
      (post) =>
        `- [${post.title}](${link(`/writing/${post.slug}`)}): ${post.description}`,
    ),
    '',
    '## Feeds and discovery',
    `- [All articles](${link('/writing')})`,
    `- [RSS feed](${link('/rss.xml')})`,
    `- [XML sitemap](${link('/sitemap.xml')})`,
    '',
  ].join('\n')
}

export const Route = createFileRoute('/llms.txt')({
  server: {
    handlers: {
      GET: () =>
        new Response(buildLlmsText(), {
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'public, max-age=3600',
          },
        }),
    },
  },
})
