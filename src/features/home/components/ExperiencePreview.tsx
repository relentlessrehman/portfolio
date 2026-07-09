import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { publishedExperience } from '#/content'
import { Section } from '#/components/shared/Section'
import { SectionHeader } from '#/components/shared/SectionHeader'
import { Reveal } from '#/components/motion/Reveal'

function formatPeriod(start: string, end?: string): string {
  const startYear = start.slice(0, 4)
  const endYear = end ? end.slice(0, 4) : 'Present'
  return startYear === endYear ? startYear : `${startYear} — ${endYear}`
}

export function ExperiencePreview() {
  if (publishedExperience.length === 0) return null

  return (
    <Section>
      <SectionHeader eyebrow="Experience" title="Where I've worked" />
      <ol className="space-y-6">
        {publishedExperience.map((entry, index) => (
          <li key={entry.id}>
            <Reveal
              delay={index * 0.08}
              className="grid gap-2 rounded-md border border-border bg-surface p-6 md:grid-cols-[9rem_1fr] md:gap-8"
            >
              <p className="font-mono text-mono-sm text-subtle-foreground">
                {formatPeriod(entry.start, entry.end)}
              </p>
              <div>
                <h3 className="text-title-3 font-medium text-foreground">
                  {entry.role} ·{' '}
                  {entry.organizationUrl ? (
                    <a
                      href={entry.organizationUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-accent hover:underline"
                    >
                      {entry.organization}
                    </a>
                  ) : (
                    entry.organization
                  )}
                </h3>
                <p className="mt-2 text-body text-muted-foreground">{entry.summary}</p>
              </div>
            </Reveal>
          </li>
        ))}
      </ol>

      <Link
        to="/experience"
        className="mt-8 inline-flex items-center gap-1 text-small text-accent hover:underline"
      >
        Full experience
        <ArrowRight className="size-4" aria-hidden />
      </Link>
    </Section>
  )
}
