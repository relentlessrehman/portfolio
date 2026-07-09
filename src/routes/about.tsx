import { createFileRoute } from '@tanstack/react-router'
import { ArrowUpRight } from 'lucide-react'
import { content, featuredSocials } from '#/content'
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

          <figure className="mt-10 border-l-2 border-accent pl-6">
            <blockquote className="font-serif text-title-3 text-foreground italic">
              “{profile.mission}”
            </blockquote>
            <figcaption className="mt-2 text-small text-subtle-foreground">Mission</figcaption>
          </figure>
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

            <FactList
              title="Values"
              items={profile.values}
            />
            <FactList
              title="Interests"
              items={profile.interests}
            />
            <div>
              <h2 className="mb-3 font-mono text-mono-sm tracking-widest text-subtle-foreground uppercase">
                Languages
              </h2>
              <ul className="space-y-1.5">
                {profile.spokenLanguages.map((language) => (
                  <li key={language.name} className="text-small text-muted-foreground">
                    {language.name}
                    {language.note ? (
                      <span className="text-subtle-foreground"> — {language.note}</span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="mb-3 font-mono text-mono-sm tracking-widest text-subtle-foreground uppercase">
                Find me
              </h2>
              <ul className="space-y-1.5">
                {featuredSocials.map((link) => (
                  <li key={link.platform}>
                    <a
                      href={link.url}
                      target={link.platform === 'email' ? undefined : '_blank'}
                      rel="noreferrer"
                      className="inline-flex items-center gap-0.5 text-small text-accent hover:underline"
                    >
                      {link.label}
                      {link.handle ? ` (${link.handle})` : ''}
                      {link.platform !== 'email' ? (
                        <ArrowUpRight className="size-3.5" aria-hidden />
                      ) : null}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
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
