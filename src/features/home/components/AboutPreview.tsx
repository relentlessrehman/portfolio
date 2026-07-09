import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { content } from '#/content'
import { Section } from '#/components/shared/Section'
import { SectionHeader } from '#/components/shared/SectionHeader'
import { Reveal } from '#/components/motion/Reveal'

export function AboutPreview() {
  const { profile } = content

  return (
    <Section>
      <div className="grid gap-10 md:grid-cols-[1fr_20rem] md:gap-16">
        <div>
          <SectionHeader eyebrow="About" title="Who I am" />
          <Reveal>
            <div className="max-w-prose space-y-5 text-body-lg text-muted-foreground">
              {profile.about.slice(0, 2).map((paragraph) => (
                <p key={paragraph.slice(0, 32)}>{paragraph}</p>
              ))}
            </div>
            <Link
              to="/about"
              className="mt-6 inline-flex items-center gap-1 text-small text-accent hover:underline"
            >
              More about me
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </Reveal>
        </div>

        <Reveal delay={0.1}>
          <figure className="rounded-md border border-border bg-surface p-6 md:mt-24">
            <blockquote className="font-display text-title-3 text-foreground italic">
              “{profile.motto}”
            </blockquote>
            <figcaption className="mt-4 text-small text-subtle-foreground">
              Personal motto
            </figcaption>
          </figure>
        </Reveal>
      </div>
    </Section>
  )
}
