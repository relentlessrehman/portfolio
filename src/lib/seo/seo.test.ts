import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { createElement } from 'react'
import { content } from '#/content'
import { seoHead } from './meta'
import {
  articleJsonLd,
  breadcrumbJsonLd,
  personJsonLd,
  websiteJsonLd,
} from './jsonld'
import { JsonLd } from '#/components/shared/JsonLd'

describe('SEO output', () => {
  it('keeps a single page canonical and restricts private page indexing', () => {
    const head = seoHead({ path: '/dashboard', noIndex: true })
    expect(head.links).toEqual([
      { rel: 'canonical', href: `${content.seo.url}/dashboard` },
    ])
    expect(
      head.meta.filter((meta) => 'name' in meta && meta.name === 'robots'),
    ).toEqual([{ name: 'robots', content: 'noindex, nofollow' }])
  })

  it('connects article identity to its own page and the shared author', () => {
    const post = {
      slug: 'example',
      title: 'Example',
      description: 'An example.',
      publishedAt: '2026-10-27',
      tags: ['architecture'],
      readingStats: { words: 600, minutes: 3 },
    }
    const article = articleJsonLd(post)
    expect(article.mainEntityOfPage['@id']).toBe(
      `${content.seo.url}/writing/example`,
    )
    expect(article.author['@id']).toBe(personJsonLd()['@id'])
    expect(article.isPartOf['@id']).toBe(websiteJsonLd()['@id'])
    expect(article.dateModified).toBe(post.publishedAt)
    expect(article.timeRequired).toBe('PT3M')
  })

  it('does not point the current breadcrumb at the homepage', () => {
    const breadcrumb = breadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: 'Article' },
    ])
    expect(breadcrumb.itemListElement[0].item).toBe(`${content.seo.url}/`)
    expect(breadcrumb.itemListElement[1]).not.toHaveProperty('item')
  })

  it('prevents content from closing a JSON-LD script element', () => {
    const markup = renderToStaticMarkup(
      createElement(JsonLd, {
        data: { headline: '</script><script>alert(1)</script>' },
      }),
    )
    expect(markup.match(/<script/g)).toHaveLength(1)
    const encoded = markup
      .replace(/^<script[^>]*>/, '')
      .replace(/<\/script>$/, '')
    expect(JSON.parse(encoded).headline).toBe(
      '</script><script>alert(1)</script>',
    )
  })
})
