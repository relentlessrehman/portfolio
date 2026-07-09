import { Hammer } from 'lucide-react'
import { content } from '#/content'
import { Section } from '#/components/shared/Section'
import { SectionHeader } from '#/components/shared/SectionHeader'
import { Reveal } from '#/components/motion/Reveal'

const MAX_FOCUS_ITEMS = 4

/** Forward-looking focus list only — the project itself already got its moment in Featured Projects. */
export function CurrentlyBuilding() {
  if (content.profile.currentFocus.length === 0) return null

  return (
    <Section>
      <SectionHeader
        eyebrow="Growth"
        title="Still leveling up"
        description="A few things I'm actively working on right now."
      />
      <Reveal>
        <ul className="grid gap-3 sm:grid-cols-2">
          {content.profile.currentFocus.slice(0, MAX_FOCUS_ITEMS).map((item) => (
            <li
              key={item}
              className="flex items-start gap-2.5 rounded-md border border-border bg-surface px-4 py-3 text-small text-muted-foreground"
            >
              <Hammer className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
              {item}
            </li>
          ))}
        </ul>
      </Reveal>
    </Section>
  )
}
