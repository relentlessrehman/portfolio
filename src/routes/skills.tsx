import { useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { ChevronDown, ChevronUp, Code2 } from 'lucide-react'
import { content, projectsUsingSkill } from '#/content'
import { seoHead } from '#/lib/seo/meta'
import { getTechIcon } from '#/lib/tech-icons'
import { Container } from '#/components/shared/Container'
import { SectionHeader } from '#/components/shared/SectionHeader'
import { SkillIconCard } from '#/components/shared/SkillIconCard'
import { Reveal } from '#/components/motion/Reveal'
import type { SkillCategory } from '#/content/schemas/skill'

export const Route = createFileRoute('/skills')({
  head: () =>
    seoHead({
      title: 'Skills',
      description:
        'Technologies Abdul Rehman works with — each backed by the real projects that use it, not percentages.',
      path: '/skills',
    }),
  component: SkillsPage,
})

const categoryLabels: Record<SkillCategory, string> = {
  language: 'Languages',
  frontend: 'Frontend',
  backend: 'Backend',
  database: 'Database',
  tools: 'Tools',
  concepts: 'Software Engineering Concepts',
}

const categoryOrder: Array<SkillCategory> = [
  'language',
  'frontend',
  'backend',
  'database',
  'tools',
  'concepts',
]

function SkillsPage() {
  return (
    <Container className="py-section-sm">
      <SectionHeader
        as="h1"
        eyebrow="Skills"
        title="What I work with"
        description="No percentages, no star ratings — each skill links to the shipped projects that prove it."
      />

      <div className="space-y-12">
        {categoryOrder.map((category, categoryIndex) => {
          const group = content.skills.filter((skill) => skill.category === category)
          if (group.length === 0) return null
          return (
            <Reveal key={category} delay={categoryIndex * 0.05}>
              <CollapsibleCategory category={category} group={group} />
            </Reveal>
          )
        })}

        {content.learningTopics.length > 0 ? (
          <Reveal delay={0.3}>
            <section className="border-t border-border pt-10">
              <h2 className="mb-4 font-mono text-mono-sm tracking-widest text-subtle-foreground uppercase">
                Currently learning
              </h2>
              <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
                {content.learningTopics.map((topic) => (
                  <li key={topic}>
                    <SkillIconCard name={topic} variant="learning" />
                  </li>
                ))}
              </ul>
            </section>
          </Reveal>
        ) : null}
      </div>
    </Container>
  )
}

function CollapsibleCategory({
  category,
  group,
}: {
  category: SkillCategory
  group: typeof content.skills
}) {
  const [expanded, setExpanded] = useState(false)
  const isMobileLong = group.length > 4

  const visibleItems = expanded ? group : group.slice(0, 4)

  return (
    <section>
      <h2 className="mb-4 font-mono text-mono-sm tracking-widest text-subtle-foreground uppercase">
        {categoryLabels[category]}
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(isMobileLong ? visibleItems : group).map((skill) => {
          const evidence = projectsUsingSkill(skill.name)
          const iconEntry = getTechIcon(skill.name)
          const Icon = iconEntry?.icon ?? Code2
          return (
            <div
              key={skill.name}
              className="rounded-md border border-border bg-surface p-5"
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className="size-5 shrink-0"
                  style={iconEntry?.color ? { color: iconEntry.color } : undefined}
                  aria-hidden
                />
                <h3 className="font-mono text-body font-medium text-foreground">{skill.name}</h3>
              </div>
              {evidence.length > 0 ? (
                <ul className="mt-3 space-y-1.5">
                  {evidence.map((project) => (
                    <li key={project.slug}>
                      <Link
                        to="/projects/$slug"
                        params={{ slug: project.slug }}
                        className="text-small text-accent hover:underline"
                      >
                        Used in {project.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-small text-subtle-foreground">
                  Coursework & personal practice
                </p>
              )}
            </div>
          )
        })}
      </div>
      {isMobileLong ? (
        <div className="mt-4 sm:hidden">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="flex w-full items-center justify-center gap-1.5 rounded-md border border-border bg-surface py-2.5 text-small font-medium text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground"
          >
            {expanded ? (
              <>
                Show less <ChevronUp className="size-3.5" aria-hidden />
              </>
            ) : (
              <>
                Show {group.length - 4} more <ChevronDown className="size-3.5" aria-hidden />
              </>
            )}
          </button>
        </div>
      ) : null}
    </section>
  )
}
