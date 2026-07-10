import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { content, projectsUsingSkill } from '#/content'
import { Section } from '#/components/shared/Section'
import { SectionHeader } from '#/components/shared/SectionHeader'
import { SkillIconCard } from '#/components/shared/SkillIconCard'
import { Reveal } from '#/components/motion/Reveal'
import type { SkillCategory } from '#/content/schemas/skill'

const categoryLabels: Record<SkillCategory, string> = {
  language: 'Languages',
  frontend: 'Frontend',
  backend: 'Backend',
  database: 'Database',
  tools: 'Tools',
  concepts: 'Concepts',
}

// Homepage stays to the tangible categories a recruiter scans fastest —
// the more abstract "concepts" list gets its full due on /skills.
const categoryOrder: Array<SkillCategory> = ['language', 'frontend', 'backend', 'database', 'tools']
const GRID_CLASS = 'grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6'

export function SkillsPreview() {
  return (
    <Section>
      <SectionHeader
        eyebrow="Skills"
        title="What I work with"
        description="No fake percentages — every skill here is backed by real projects."
      />

      <div className="space-y-10">
        {categoryOrder.map((category, index) => {
          // Skills that show up in more shipped projects rank first — real
          // usage decides emphasis, not a hand-picked "primary" flag.
          const group = content.skills
            .filter((skill) => skill.category === category)
            .sort(
              (a, b) => projectsUsingSkill(b.name).length - projectsUsingSkill(a.name).length,
            )
          if (group.length === 0) return null

          return (
            <Reveal key={category} delay={index * 0.05}>
              <h3 className="mb-4 font-mono text-mono-sm tracking-widest text-subtle-foreground uppercase">
                {categoryLabels[category]}
              </h3>
              <div className={GRID_CLASS}>
                {group.map((skill) => (
                  <SkillIconCard key={skill.name} name={skill.name} />
                ))}
              </div>
            </Reveal>
          )
        })}

        {content.learningTopics.length > 0 ? (
          <Reveal delay={0.25}>
            <h3 className="mb-4 border-t border-border pt-8 font-mono text-mono-sm tracking-widest text-subtle-foreground uppercase">
              Learning now
            </h3>
            <div className={GRID_CLASS}>
              {content.learningTopics.map((topic) => (
                <SkillIconCard key={topic} name={topic} variant="learning" />
              ))}
            </div>
          </Reveal>
        ) : null}
      </div>

      <Link
        to="/skills"
        className="mt-8 inline-flex items-center gap-1 text-small text-accent hover:underline"
      >
        Skills with evidence
        <ArrowRight className="size-4" aria-hidden />
      </Link>
    </Section>
  )
}
