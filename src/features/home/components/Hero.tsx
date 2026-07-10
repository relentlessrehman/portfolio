import { Link } from '@tanstack/react-router'
import { ArrowRight, Download, Github, Globe, Linkedin, Mail, Twitter } from 'lucide-react'
import { content, featuredSocials } from '#/content'
import { Container } from '#/components/shared/Container'
import { AvailabilityBadge } from '#/components/shared/AvailabilityBadge'
import { Reveal } from '#/components/motion/Reveal'
import { buttonVariants } from '#/components/ui/button'
import type { SocialPlatform } from '#/content/schemas/social'

const socialIcons: Record<SocialPlatform, typeof Github> = {
  github: Github,
  linkedin: Linkedin,
  x: Twitter,
  email: Mail,
  devto: Globe,
  medium: Globe,
  hashnode: Globe,
  leetcode: Globe,
  codeforces: Globe,
  scholar: Globe,
  orcid: Globe,
  youtube: Globe,
  website: Globe,
}

export function Hero() {
  const { profile } = content
  const resumePdf = content.resume.versions.find((v) => v.id === 'pdf')

  return (
    <section className="hero-glow relative">
      <Container className="flex min-h-[34rem] max-h-[52rem] flex-col items-center py-14 text-center sm:min-h-[calc(100dvh-4rem)] sm:py-section-sm">
        <div className="flex flex-1 flex-col items-center justify-center">
          <Reveal>
            <AvailabilityBadge />

            {profile.portrait ? (
              <img
                src={profile.portrait.src}
                alt={profile.portrait.alt}
                width={profile.portrait.width}
                height={profile.portrait.height}
                className="mx-auto mt-6 size-24 rounded-full border border-border object-cover sm:mt-8 sm:size-28 md:size-32"
                loading="eager"
                fetchPriority="high"
              />
            ) : null}

            <h1 className="mt-6 font-display text-display text-foreground sm:mt-8">{profile.name}</h1>

            <p className="mx-auto mt-4 max-w-2xl font-display text-title-2 text-foreground sm:mt-5">
              {profile.headline}
            </p>

            <p className="mx-auto mt-4 max-w-xl text-body-lg text-muted-foreground sm:mt-5">
              {profile.shortBio}
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:mt-10">
              <Link to="/projects" className={buttonVariants({ variant: 'primary', size: 'lg' })}>
                View projects
                <ArrowRight aria-hidden />
              </Link>
              <a href="#contact" className={buttonVariants({ variant: 'secondary', size: 'lg' })}>
                Get in touch
              </a>
              {resumePdf ? (
                <a
                  href={resumePdf.url}
                  download
                  className={buttonVariants({ variant: 'secondary', size: 'lg' })}
                >
                  <Download aria-hidden />
                  Download resume
                </a>
              ) : (
                <Link to="/resume" className={buttonVariants({ variant: 'secondary', size: 'lg' })}>
                  <Download aria-hidden />
                  Download resume
                </Link>
              )}
            </div>

            {featuredSocials.length > 0 ? (
              <ul className="mt-6 flex items-center justify-center gap-3">
                {featuredSocials.map((link) => {
                  const Icon = socialIcons[link.platform]
                  return (
                    <li key={link.platform}>
                      <a
                        href={link.url}
                        target={link.platform === 'email' ? undefined : '_blank'}
                        rel="noreferrer"
                        aria-label={link.label}
                        className="flex size-11 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors duration-(--duration-fast) hover:border-border-strong hover:text-foreground"
                      >
                        <Icon className="size-4" aria-hidden />
                      </a>
                    </li>
                  )
                })}
              </ul>
            ) : null}
          </Reveal>
        </div>

        <div className="mt-10 hidden flex-col items-center gap-2 md:flex" aria-hidden>
          <span className="font-mono text-mono-sm tracking-widest text-subtle-foreground uppercase">
            Scroll
          </span>
          <div className="scroll-cue-line" />
        </div>
      </Container>
    </section>
  )
}
