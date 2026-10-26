import { content } from '#/content'

export interface PageMetaInput {
  /** Page title without the site suffix; omit for the home page */
  title?: string
  description?: string
  /** Route path beginning with "/", used for the canonical URL */
  path: string
  /** Absolute or /public path to a social image */
  image?: string
  type?: 'website' | 'article'
  /** Set true on private/utility routes to keep them out of indexes */
  noIndex?: boolean
  publishedAt?: string
  updatedAt?: string
  tags?: Array<string>
}

function absoluteUrl(pathOrUrl: string): string {
  if (pathOrUrl.startsWith('http')) return pathOrUrl
  return `${content.seo.url}${pathOrUrl}`
}

/**
 * Builds the `head()` payload for a route: title, description, canonical,
 * Open Graph, and Twitter cards — from one declaration.
 */
export function seoHead(input: PageMetaInput) {
  const { seo } = content
  const title = input.title
    ? seo.titleTemplate.replace('%s', input.title)
    : seo.defaultTitle
  const description = input.description ?? seo.defaultDescription
  const canonical = absoluteUrl(input.path)
  const image = absoluteUrl(input.image ?? seo.defaultOgImage)

  return {
    meta: [
      { title },
      { name: 'description', content: description },
      {
        name: 'robots',
        content: input.noIndex
          ? 'noindex, nofollow'
          : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
      },
      { name: 'author', content: content.profile.name },
      { property: 'og:type', content: input.type ?? 'website' },
      { property: 'og:site_name', content: seo.siteName },
      { property: 'og:locale', content: seo.locale },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:url', content: canonical },
      { property: 'og:image', content: image },
      { property: 'og:image:alt', content: title },
      ...(input.type === 'article'
        ? [
            { property: 'article:author', content: `${seo.url}/about` },
            ...(input.publishedAt
              ? [
                  {
                    property: 'article:published_time',
                    content: input.publishedAt,
                  },
                ]
              : []),
            ...(input.updatedAt
              ? [
                  {
                    property: 'article:modified_time',
                    content: input.updatedAt,
                  },
                ]
              : []),
            ...(input.tags ?? []).map((tag) => ({
              property: 'article:tag',
              content: tag,
            })),
          ]
        : []),
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: image },
      { name: 'twitter:image:alt', content: title },
      ...(seo.twitterHandle
        ? [{ name: 'twitter:site', content: seo.twitterHandle }]
        : []),
    ],
    links: [{ rel: 'canonical', href: canonical }],
  }
}
