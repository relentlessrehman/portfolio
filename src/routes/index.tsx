import { createFileRoute } from '@tanstack/react-router'
import { seoHead } from '#/lib/seo/meta'
import { featuredWorkJsonLd, personJsonLd } from '#/lib/seo/jsonld'
import { JsonLd } from '#/components/shared/JsonLd'
import { FilmPage } from '#/features/film/components/FilmPage'

export const Route = createFileRoute('/')({
  head: () => seoHead({ path: '/' }),
  component: Home,
})

function Home() {
  return (
    <>
      <JsonLd data={personJsonLd()} />
      <JsonLd data={featuredWorkJsonLd()} />
      <FilmPage />
    </>
  )
}
