import { createFileRoute } from '@tanstack/react-router'
import { Mail } from 'lucide-react'
import { content, featuredSocials } from '#/content'
import { seoHead } from '#/lib/seo/meta'
import { Container } from '#/components/shared/Container'
import { CopyButton } from '#/components/shared/CopyButton'
import { buttonVariants } from '#/components/ui/button'
import { ContactForm } from '#/features/contact/components/ContactForm'

export const Route = createFileRoute('/contact')({
  head: () =>
    seoHead({
      title: 'Contact',
      description: `Get in touch with ${content.profile.name}. ${content.profile.availability.label}.`,
      path: '/contact',
    }),
  component: ContactPage,
})

/** The film ends with an invitation; the form lives here (DESIGN.md §12) */
function ContactPage() {
  const { profile } = content
  const nonEmailSocials = featuredSocials.filter(
    (link) => link.platform !== 'email',
  )

  return (
    <Container className="py-section-sm">
      <p className="nav-label text-subtle-foreground">Contact</p>
      <h1 className="mt-4 max-w-[14ch] font-display text-display uppercase">
        Let&apos;s build something worthwhile.
      </h1>
      <p className="mt-6 max-w-xl text-body-lg text-muted-foreground">
        {profile.availability.label}. If you&apos;re hiring interns, building
        something interesting, or want to talk engineering, my inbox is open. I
        read every message.
      </p>

      <div className="mt-10 flex flex-wrap items-center gap-3">
        <a
          href={`mailto:${profile.email}`}
          className={buttonVariants({ variant: 'primary', size: 'lg' })}
        >
          <Mail aria-hidden />
          {profile.email}
        </a>
        <CopyButton value={profile.email} label="Copy email address" />
      </div>

      <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
        {nonEmailSocials.map((link) => (
          <li key={link.platform}>
            <a
              href={link.url}
              target="_blank"
              rel="noreferrer"
              className="nav-label text-muted-foreground hover:text-foreground"
            >
              {link.label} ↗
            </a>
          </li>
        ))}
      </ul>

      <section
        aria-labelledby="message-title"
        className="mt-16 max-w-xl border-t border-hairline pt-10"
      >
        <h2
          id="message-title"
          className="nav-label mb-6 text-subtle-foreground"
        >
          Or send a message
        </h2>
        <ContactForm />
      </section>
    </Container>
  )
}
