import { createFileRoute } from '@tanstack/react-router'
import { Download, ExternalLink } from 'lucide-react'
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
  const pdf = content.resume.versions.find((v) => v.id === 'pdf')
  const styled = content.resume.versions.find((v) => v.id === 'html')

  return (
    <Container className="py-section-sm">
      <SectionHeader as="h1" eyebrow="Resume" title="Resume" />

      {pdf || styled ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {pdf ? (
            <div className="flex flex-col items-start gap-3 rounded-md border border-border bg-surface p-6">
              <a href={pdf.url} download>
                <Button type="button">
                  <Download className="size-4" aria-hidden /> Download Resume (PDF)
                </Button>
              </a>
              {pdf.note ? <p className="text-small text-muted-foreground">{pdf.note}</p> : null}
            </div>
          ) : null}
          {styled ? (
            <div className="flex flex-col items-start gap-3 rounded-md border border-border bg-surface p-6">
              <a href={styled.url} target="_blank" rel="noopener noreferrer">
                <Button type="button" variant="secondary">
                  <ExternalLink className="size-4" aria-hidden /> View Styled Version
                </Button>
              </a>
              {styled.note ? <p className="text-small text-muted-foreground">{styled.note}</p> : null}
            </div>
          ) : null}
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

      {content.resume.updatedAt ? (
        <p className="mt-6 text-small text-muted-foreground">
          Last updated {formatDate(content.resume.updatedAt)}
        </p>
      ) : null}
    </Container>
  )
}
