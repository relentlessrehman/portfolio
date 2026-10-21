import { createFileRoute } from '@tanstack/react-router'
import { seoHead } from '#/lib/seo/meta'
import { Deck } from '#/features/deck/Deck'
import { madadSlides } from '#/features/deck/madad-slides'

export const Route = createFileRoute('/projects/madad/presentation')({
  staticData: { bare: true },
  head: () =>
    seoHead({
      title: 'Madad · Project proposal',
      description:
        'Madad, a CS272 Artificial Intelligence proposal: two small models, a 300M Tutor and a 100M Organizer, trained from scratch to run fully offline.',
      path: '/projects/madad/presentation',
    }),
  component: MadadPresentation,
})

function MadadPresentation() {
  return <Deck slides={madadSlides} />
}
