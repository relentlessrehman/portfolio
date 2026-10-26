# Search and AI discoverability

Production origin: https://iamabdulrehman.vercel.app

## What is maintained automatically

- `seoHead` builds titles, descriptions, one page canonical, indexing directives,
  social previews, and article dates/tags.
- JSON-LD identifies the author, website, project source code, articles, and
  breadcrumbs. Facts must agree with the visible page.
- Published MDX posts populate `/writing`, site search, `/rss.xml`, `/sitemap.xml`,
  and the optional `/llms.txt` navigation index. Drafts are excluded.
- Article `relatedProjects` slugs create case-study links. Shared tags and project
  references determine related articles. Studio preserves these fields on save.
- The sitemap omits month-only modification dates instead of inventing a day.
  Set a full date only when a meaningful change actually occurred.

## Publishing

Run `npm run verify`, review the diff, then publish through the existing GitHub
`main` → Vercel production integration. Confirm the Vercel deployment status for
the exact commit and check the live URLs. Never force-push to publish content.

Inspect the final HTTP responses for article body text, canonical links, indexing
directives, and parseable JSON-LD. A client-side screenshot alone cannot establish
that the server delivered the article. Verify missing articles return HTTP 404.

## Follow-up in search tools

The site already includes a Google Search Console verification meta tag. A tag
alone does not prove access to the verified property. In the property owner's
Search Console account:

1. Submit `https://iamabdulrehman.vercel.app/sitemap.xml` in Sitemaps.
2. Inspect the homepage, writing index, and new article URLs. Request indexing
   where appropriate; submission does not guarantee indexing.
3. Check Page Indexing for unexpected exclusions or duplicate canonicals.
4. Use the Rich Results Test for article markup and PageSpeed Insights for
   representative desktop/mobile pages.
5. Compare impressions, clicks, queries, and click-through rates over time.
   Avoid attributing short-term fluctuations to a single edit.

The same sitemap can be submitted in Bing Webmaster Tools once property access
is available. No search-tool submission has occurred merely because a sitemap is
public or referenced in robots.txt.

## Editorial rules

Write around real projects and answer a specific reader question near the start.
Explain implementation choices, include sources for external technical claims,
and distinguish targets from measurements. Link to supporting case studies.
Use the actual publication date and update the modification date after substantive
changes. Do not invent users, growth, benchmarks, credentials, or testimonials.

`llms.txt` is an optional tool-friendly index, not a ranking mechanism. Google says
its AI search features use the usual SEO foundations and do not use special AI
text files. No metadata file guarantees rankings, AI mentions, or citations.

References:

- [Google AI search guidance](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)
- [Article structured data](https://developers.google.com/search/docs/appearance/structured-data/article)
- [Building a sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [JavaScript SEO](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)
