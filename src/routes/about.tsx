import { createFileRoute } from '@tanstack/react-router'
import { Check } from 'lucide-react'
import { content } from '#/content'
import { seoHead } from '#/lib/seo/meta'
import { personJsonLd } from '#/lib/seo/jsonld'
import { JsonLd } from '#/components/shared/JsonLd'
import { Container } from '#/components/shared/Container'
import { SectionHeader } from '#/components/shared/SectionHeader'
import { Reveal } from '#/components/motion/Reveal'
import { TechBadge } from '#/components/shared/TechBadge'

export const Route = createFileRoute('/about')({
  head: () =>
    seoHead({
      title: 'About',
      description: content.profile.shortBio,
      path: '/about',
    }),
  component: AboutPage,
})

function AboutPage() {
  const { profile } = content

  return (
    <Container className="py-section-sm">
      <JsonLd data={personJsonLd()} />
      <SectionHeader as="h1" eyebrow="About" title="Who I am" description={profile.role} />

      <div className="grid gap-12 lg:grid-cols-[1fr_20rem]">
        <Reveal>
          <div className="max-w-prose space-y-5 text-body-lg text-muted-foreground">
            {profile.about.map((paragraph) => (
              <p key={paragraph.slice(0, 32)}>{paragraph}</p>
            ))}
          </div>

          <div className="mt-10 rounded-md border border-border bg-surface p-6">
            <h2 className="font-mono text-mono-sm tracking-widest text-subtle-foreground uppercase">
              Mission
            </h2>
            <p className="mt-3 font-display text-title-3 text-foreground">{profile.mission}</p>
          </div>

          <div className="mt-10">
            <h2 className="mb-3 font-mono text-mono-sm tracking-widest text-subtle-foreground uppercase">
              What I believe
            </h2>
            <ul className="space-y-2.5">
              {profile.values.map((value) => (
                <li key={value} className="flex items-start gap-2.5 text-body-lg text-muted-foreground">
                  <Check className="mt-1 size-4 shrink-0 text-accent" aria-hidden />
                  {value}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="space-y-8">
            {profile.portrait ? (
              <div className="mx-auto max-w-xs md:max-w-sm lg:max-w-none">
                <img
                  src={profile.portrait.src}
                  alt={profile.portrait.alt}
                  width={profile.portrait.width}
                  height={profile.portrait.height}
                  className="w-full rounded-md border border-border object-cover"
                  loading="lazy"
                />
              </div>
            ) : null}

            <FactList title="Technologies I enjoy" items={profile.interests} />
          </div>
        </Reveal>
      </div>
    </Container>
  )
}

function FactList({ title, items }: { title: string; items: Array<string> }) {
  return (
    <div>
      <h2 className="mb-3 font-mono text-mono-sm tracking-widest text-subtle-foreground uppercase">
        {title}
      </h2>
      <ul className="flex flex-wrap gap-2">
        {items.map((item) => (
          <li key={item}>
            <TechBadge name={item} />
          </li>
        ))}
      </ul>
    </div>
  )
}
