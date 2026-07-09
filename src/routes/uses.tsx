import { createFileRoute } from '@tanstack/react-router'
import { ArrowUpRight } from 'lucide-react'
import { content } from '#/content'
import { seoHead } from '#/lib/seo/meta'
import { Container } from '#/components/shared/Container'
import { SectionHeader } from '#/components/shared/SectionHeader'
import { Reveal } from '#/components/motion/Reveal'

export const Route = createFileRoute('/uses')({
  head: () =>
    seoHead({
      title: 'Uses',
      description: 'The tools, apps, and stack Abdul Rehman uses to build software.',
      path: '/uses',
    }),
  component: UsesPage,
})

function UsesPage() {
  return (
    <Container className="py-section-sm">
      <SectionHeader
        as="h1"
        eyebrow="Uses"
        title="Tools of the trade"
        description="What I actually build with, day to day."
      />

      <div className="space-y-10">
        {content.uses.map((category, index) => (
          <Reveal key={category.id} delay={index * 0.06}>
            <section>
              <h2 className="mb-4 font-mono text-mono-sm tracking-widest text-subtle-foreground uppercase">
                {category.title}
              </h2>
              <ul className="divide-y divide-border rounded-md border border-border bg-surface">
                {category.items.map((item) => (
                  <li key={item.name} className="flex items-baseline justify-between gap-4 p-4">
                    <div>
                      <span className="text-body font-medium text-foreground">{item.name}</span>
                      {item.note ? (
                        <span className="ml-3 text-small text-muted-foreground">{item.note}</span>
                      ) : null}
                    </div>
                    {item.url ? (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex shrink-0 items-center gap-1 text-small text-accent hover:underline"
                      >
                        Visit
                        <ArrowUpRight className="size-3.5" aria-hidden />
                      </a>
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>
          </Reveal>
        ))}
      </div>
    </Container>
  )
}
