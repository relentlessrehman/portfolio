import { Link, createFileRoute } from '@tanstack/react-router'
import { ArrowUpRight, BadgeCheck } from 'lucide-react'
import { content } from '#/content'
import { seoHead } from '#/lib/seo/meta'
import { Container } from '#/components/shared/Container'
import { SectionHeader } from '#/components/shared/SectionHeader'
import { Reveal } from '#/components/motion/Reveal'

export const Route = createFileRoute('/certifications')({
  head: () =>
    seoHead({
      title: 'Certifications',
      description: 'Verified certifications and credentials.',
      path: '/certifications',
      noIndex: content.certifications.length === 0,
    }),
  component: CertificationsPage,
})

function CertificationsPage() {
  return (
    <Container className="py-section-sm">
      <SectionHeader as="h1" eyebrow="Certifications" title="Credentials" />

      {content.certifications.length > 0 ? (
        <ul className="grid gap-4 sm:grid-cols-2">
          {content.certifications.map((certification, index) => (
            <li key={certification.id}>
              <Reveal
                delay={index * 0.06}
                className="flex h-full gap-4 rounded-md border border-border bg-surface p-6"
              >
                <BadgeCheck className="mt-1 size-5 shrink-0 text-accent" aria-hidden />
                <div>
                  <h2 className="text-body font-medium text-foreground">{certification.name}</h2>
                  <p className="mt-0.5 text-small text-muted-foreground">
                    {certification.issuer}
                    {certification.year ? ` · ${certification.year}` : ''}
                  </p>
                  {certification.url ? (
                    <a
                      href={certification.url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-small text-accent hover:underline"
                    >
                      Verify
                      <ArrowUpRight className="size-3.5" aria-hidden />
                    </a>
                  ) : null}
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-md border border-border bg-surface p-10 text-center">
          <p className="text-body-lg text-muted-foreground">
            Certifications are in progress — check back soon.
          </p>
          <Link to="/skills" className="mt-3 inline-block text-body text-accent hover:underline">
            See my skills instead
          </Link>
        </div>
      )}
    </Container>
  )
}
