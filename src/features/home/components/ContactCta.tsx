import { Mail } from 'lucide-react'
import { content, featuredSocials } from '#/content'
import { Section } from '#/components/shared/Section'
import { Reveal } from '#/components/motion/Reveal'
import { CopyButton } from '#/components/shared/CopyButton'
import { buttonVariants } from '#/components/ui/button'
import { ContactForm } from '#/features/contact/components/ContactForm'

export function ContactCta() {
  const { profile } = content
  const nonEmailSocials = featuredSocials.filter((link) => link.platform !== 'email')

  return (
    <Section id="contact" className="scroll-mt-16">
      <Reveal>
        <div className="flex flex-col items-center rounded-md border border-border bg-surface px-6 py-14 text-center md:py-16">
          <h2 className="max-w-2xl font-display text-title-1 text-foreground">
            Let's build something together
          </h2>
          <p className="mt-4 max-w-xl text-body-lg text-muted-foreground">
            {profile.availability.label}. If you're hiring interns, building something
            interesting, or just want to talk engineering, my inbox is open. I read every
            message and usually reply within a couple of days.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href={`mailto:${profile.email}`}
              className={buttonVariants({ variant: 'primary', size: 'lg' })}
            >
              <Mail aria-hidden />
              {profile.email}
            </a>
            <CopyButton value={profile.email} label="Copy email address" />
          </div>

          <p className="mt-6 text-small text-subtle-foreground">
            Or find me on{' '}
            {nonEmailSocials.map((link, index) => (
              <span key={link.platform}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-muted-foreground underline underline-offset-4 hover:text-foreground"
                >
                  {link.label}
                </a>
                {index < nonEmailSocials.length - 1 ? ' and ' : ''}
              </span>
            ))}
          </p>

          <div className="mt-10 w-full max-w-xl border-t border-border pt-10">
            <p className="mb-5 text-small text-subtle-foreground">Or send a message directly</p>
            <ContactForm />
          </div>
        </div>
      </Reveal>
    </Section>
  )
}
