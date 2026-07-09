import { Briefcase, GraduationCap, MapPin, Rocket } from 'lucide-react'
import { content, publishedExperience } from '#/content'
import { Section } from '#/components/shared/Section'
import { Reveal } from '#/components/motion/Reveal'
import type { LucideIcon } from 'lucide-react'

interface CredentialItem {
  icon: LucideIcon
  label: string
  value: string
  meta?: string
}

/**
 * Scannable fact cards, not abstract counters — every value here is a real
 * credential a recruiter can verify, pulled straight from content data.
 */
export function Credentials() {
  const { profile, education } = content
  const degree = education[0]
  const internship = publishedExperience.find((entry) => entry.type === 'internship')

  const items: Array<CredentialItem> = [
    { icon: GraduationCap, label: 'Education', value: degree.degree, meta: 'NUST' },
    { icon: Rocket, label: 'Current role', value: 'Founder & CEO', meta: 'Stayza' },
    ...(internship
      ? [{ icon: Briefcase, label: 'Experience', value: internship.role, meta: internship.organization }]
      : []),
    { icon: MapPin, label: 'Location', value: profile.location },
  ]

  return (
    <Section className="border-y border-border py-10 md:py-12">
      <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {items.map((item, index) => (
          <Reveal key={item.label} delay={index * 0.05}>
            <li className="flex h-full items-start gap-3 rounded-md border border-border bg-surface p-4">
              <item.icon className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden />
              <div>
                <p className="font-mono text-mono-sm tracking-widest text-subtle-foreground uppercase">
                  {item.label}
                </p>
                <p className="mt-1 text-body font-medium text-foreground">{item.value}</p>
                {item.meta ? <p className="text-small text-muted-foreground">{item.meta}</p> : null}
              </div>
            </li>
          </Reveal>
        ))}
      </ul>
    </Section>
  )
}
