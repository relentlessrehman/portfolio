import { content } from '#/content'

/**
 * JSON-LD builders. Rendered via <JsonLd> inside page components —
 * search engines parse structured data anywhere in the document.
 */

export function personJsonLd() {
  const { profile, socials, seo, education } = content
  const university = education.find((entry) => entry.id === 'nust-bscs')
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.name,
    jobTitle: profile.role,
    description: profile.shortBio,
    email: `mailto:${profile.email}`,
    url: seo.url,
    ...(profile.portrait ? { image: `${seo.url}${profile.portrait.src}` } : {}),
    ...(university ? { alumniOf: { '@type': 'CollegeOrUniversity', name: university.institution } } : {}),
    sameAs: socials
      .filter((link) => link.platform !== 'email')
      .map((link) => link.url),
  }
}

/**
 * SoftwareSourceCode (a CreativeWork subtype) for a project case study —
 * includes repository/demo links and technology keywords.
 */
export function projectJsonLd(project: {
  slug: string
  name: string
  summary: string
  publishedAt?: string
  updatedAt?: string
  techStack: Array<string>
  categories: Array<string>
  links: { live?: string; github?: string }
  seo?: { keywords?: Array<string> }
}) {
  const { profile, seo } = content
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareSourceCode',
    name: project.name,
    description: project.summary,
    url: `${seo.url}/projects/${project.slug}`,
    ...(project.publishedAt ? { datePublished: project.publishedAt } : {}),
    ...(project.updatedAt ? { dateModified: project.updatedAt } : {}),
    ...(project.links.github ? { codeRepository: project.links.github } : {}),
    ...(project.links.live ? { workExample: { '@type': 'WebSite', url: project.links.live } } : {}),
    author: { '@type': 'Person', name: profile.name, url: seo.url },
    keywords: [
      ...(project.seo?.keywords ?? []),
      ...project.techStack,
      ...project.categories,
    ].join(', '),
  }
}

/** BlogPosting for a writing post */
export function articleJsonLd(post: {
  slug: string
  title: string
  description: string
  publishedAt: string
  updatedAt?: string
  tags: Array<string>
}) {
  const { profile, seo } = content
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    url: `${seo.url}/writing/${post.slug}`,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt ?? post.publishedAt,
    keywords: post.tags.join(', '),
    author: { '@type': 'Person', name: profile.name, url: seo.url },
  }
}

export function breadcrumbJsonLd(
  items: Array<{ name: string; path: string }>,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${content.seo.url}${item.path}`,
    })),
  }
}
