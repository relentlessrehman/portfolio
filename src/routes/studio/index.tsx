import { createFileRoute } from '@tanstack/react-router'
import { content } from '#/content'
import { collectionRegistry } from '#/content/studio/registry'
import { posts } from '#/features/writing/lib/posts'
import { Section } from '#/components/shared/Section'
import { SectionHeader } from '#/components/shared/SectionHeader'
import { StudioCard, StudioGate } from '#/features/studio/components/StudioChrome'
import type { CollectionKey } from '#/content/studio/registry'

export const Route = createFileRoute('/studio/')({
  head: () => ({ meta: [{ title: 'Studio — Abdul Rehman' }, { name: 'robots', content: 'noindex' }] }),
  component: StudioIndex,
})

function StudioIndex() {
  return (
    <StudioGate>
      <Section>
        <SectionHeader
          eyebrow="Studio"
          title="Edit your portfolio"
          description="A local, social-media-style editor for everything on this site. Changes save straight to your content files — commit them with git when you're happy. Only available while npm run dev is running."
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(Object.keys(collectionRegistry) as Array<CollectionKey>).map((key) => {
            const entry = collectionRegistry[key]
            const data = content[key as keyof typeof content]
            const meta = entry.kind === 'list' ? `${(data as Array<unknown>).length} entries` : 'Singleton'
            return (
              <StudioCard
                key={key}
                to="/studio/$collection"
                params={{ collection: key }}
                label={entry.label}
                description={entry.description}
                meta={meta}
              />
            )
          })}
          <StudioCard
            to="/studio/writing"
            label="Writing"
            description="Blog posts as MDX — title, description, tags, and body."
            meta={`${posts.length} published`}
          />
        </div>
      </Section>
    </StudioGate>
  )
}
