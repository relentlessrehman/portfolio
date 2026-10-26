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
    '@id': `${seo.url}/#person`,
    name: profile.name,
    jobTitle: profile.role,
    description: profile.shortBio,
    email: `mailto:${profile.email}`,
    url: seo.url,
    mainEntityOfPage: `${seo.url}/about`,
    homeLocation: { '@type': 'Place', name: profile.location },
    knowsAbout: profile.interests,
    ...(profile.portrait ? { image: `${seo.url}${profile.portrait.src}` } : {}),
    ...(university
      ? {
          alumniOf: {
            '@type': 'CollegeOrUniversity',
            name: university.institution,
          },
        }
      : {}),
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
  cover?: { src: string }
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
    ...(project.cover
      ? { image: new URL(project.cover.src, seo.url).href }
      : {}),
    ...(project.publishedAt ? { datePublished: project.publishedAt } : {}),
    ...(project.updatedAt ? { dateModified: project.updatedAt } : {}),
    ...(project.links.github ? { codeRepository: project.links.github } : {}),
    ...(project.links.live
      ? { workExample: { '@type': 'WebSite', url: project.links.live } }
      : {}),
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
  readingStats?: { words: number; minutes: number }
}) {
  const { profile, seo } = content
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${seo.url}/writing/${post.slug}#article`,
    headline: post.title,
    description: post.description,
    url: `${seo.url}/writing/${post.slug}`,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt ?? post.publishedAt,
    keywords: post.tags.join(', '),
    inLanguage: 'en',
    image: new URL(seo.defaultOgImage, seo.url).href,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${seo.url}/writing/${post.slug}`,
    },
    isPartOf: { '@id': `${seo.url}/#website` },
    ...(post.readingStats
      ? {
          wordCount: post.readingStats.words,
          timeRequired: `PT${post.readingStats.minutes}M`,
        }
      : {}),
    author: {
      '@type': 'Person',
      '@id': `${seo.url}/#person`,
      name: profile.name,
      url: `${seo.url}/about`,
    },
  }
}

export function websiteJsonLd() {
  const { seo } = content
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${seo.url}/#website`,
    url: seo.url,
    name: seo.siteName,
    description: seo.defaultDescription,
    inLanguage: 'en',
    author: { '@id': `${seo.url}/#person` },
  }
}

export function breadcrumbJsonLd(items: Array<{ name: string; path?: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      ...(item.path !== undefined ? { item: `${content.seo.url}${item.path}` } : {}),
    })),
  }
}

/** The film's hero projects as an ItemList on the home page (ACCESSIBILITY.md §6) */
export function featuredWorkJsonLd() {
  const { seo } = content
  const heroes = content.projects.filter((project) => project.film === 'hero')
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Featured work',
    itemListElement: heroes.map((project, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `${seo.url}/projects/${project.slug}`,
      name: project.name,
    })),
  }
}
