import { createFileRoute } from '@tanstack/react-router'
import { Trophy } from 'lucide-react'
import { content } from '#/content'
import { seoHead } from '#/lib/seo/meta'
import { Container } from '#/components/shared/Container'
import { SectionHeader } from '#/components/shared/SectionHeader'
import { Reveal } from '#/components/motion/Reveal'

export const Route = createFileRoute('/achievements')({
  head: () =>
    seoHead({
      title: 'Achievements',
      description:
        'Awards, competition results, and milestones — including a 99.32 percentile PIEAS entry test and founding Stayza.',
      path: '/achievements',
    }),
  component: AchievementsPage,
})

function AchievementsPage() {
  return (
    <Container className="py-section-sm">
      <SectionHeader as="h1" eyebrow="Achievements" title="Milestones & awards" />

      <ul className="grid gap-4 sm:grid-cols-2">
        {content.achievements.map((achievement, index) => (
          <li key={achievement.id}>
            <Reveal
              delay={index * 0.06}
              className="flex h-full gap-4 rounded-md border border-border bg-surface p-6"
            >
              <Trophy className="mt-1 size-5 shrink-0 text-accent" aria-hidden />
              <div>
                <h2 className="text-body font-medium text-foreground">{achievement.title}</h2>
                {achievement.year ? (
                  <p className="mt-0.5 font-mono text-mono-sm text-subtle-foreground">
                    {achievement.year}
                  </p>
                ) : null}
                {achievement.description ? (
                  <p className="mt-2 text-small text-muted-foreground">
                    {achievement.description}
                  </p>
                ) : null}
              </div>
            </Reveal>
          </li>
        ))}
      </ul>
    </Container>
  )
}
