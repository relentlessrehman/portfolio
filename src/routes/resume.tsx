import { createFileRoute } from '@tanstack/react-router'
import { Download, Printer } from 'lucide-react'
import { content } from '#/content'
import { seoHead } from '#/lib/seo/meta'
import { formatDate } from '#/lib/dates'
import { Container } from '#/components/shared/Container'
import { SectionHeader } from '#/components/shared/SectionHeader'
import { Button } from '#/components/ui/button'

export const Route = createFileRoute('/resume')({
  head: () =>
    seoHead({
      title: 'Resume',
      description: `${content.profile.name}'s resume.`,
      path: '/resume',
      noIndex: content.resume.versions.length === 0,
    }),
  component: ResumePage,
})

function ResumePage() {
  const current = content.resume.versions[0]

  return (
    <Container className="py-section-sm">
      <SectionHeader as="h1" eyebrow="Resume" title="Resume" />

      {current ? (
        <div className="mt-8 grid gap-6">
          <div className="flex flex-wrap items-center gap-3 print:hidden">
            <a href={current.url} download>
              <Button type="button">
                <Download className="size-4" aria-hidden /> Download PDF
              </Button>
            </a>
            <Button type="button" variant="secondary" onClick={() => window.print()}>
              <Printer className="size-4" aria-hidden /> Print
            </Button>
            {content.resume.updatedAt ? (
              <span className="text-small text-muted-foreground">
                Last updated {formatDate(content.resume.updatedAt)}
              </span>
            ) : null}
          </div>
          <div className="overflow-hidden rounded-md border border-border print:hidden">
            <iframe title={current.label} src={current.url} className="h-[85vh] w-full" />
          </div>
        </div>
      ) : (
        <div className="mt-8 rounded-md border border-border bg-surface p-10 text-center">
          <p className="text-body-lg text-muted-foreground">
            No resume uploaded yet — reach out and I'll send one directly.
          </p>
          <a
            href={`mailto:${content.profile.email}`}
            className="mt-3 inline-block text-body text-accent hover:underline"
          >
            {content.profile.email}
          </a>
        </div>
      )}
    </Container>
  )
}
