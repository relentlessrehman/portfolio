import { CircleCheck, CircleDashed, CircleDot, Lightbulb, Scale } from 'lucide-react'
import { cn } from '#/lib/utils'
import type {
  Challenge,
  RoadmapItem,
  RoadmapStatus,
  Tradeoff,
} from '#/content/schemas/project'

/* ── Lessons: insight cards ─────────────────────────────────────────── */

export function LessonCards({ items }: { items: Array<string> }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {items.map((lesson) => (
        <li
          key={lesson.slice(0, 40)}
          className="flex gap-3 rounded-md border border-border bg-surface p-5"
        >
          <Lightbulb className="mt-1 size-4 shrink-0 text-accent" aria-hidden />
          <p className="text-body text-muted-foreground">{lesson}</p>
        </li>
      ))}
    </ul>
  )
}

/* ── Challenges: challenge → why → solution → outcome ───────────────── */

const challengeRows = [
  ['whyItMattered', 'Why it mattered'],
  ['solution', 'Solution'],
  ['outcome', 'Outcome'],
] as const satisfies ReadonlyArray<readonly [keyof Challenge, string]>

export function ChallengeCards({ items }: { items: Array<string | Challenge> }) {
  return (
    <div className="space-y-4">
      {items.map((item) =>
        typeof item === 'string' ? (
          <p key={item.slice(0, 40)} className="text-body text-muted-foreground">
            {item}
          </p>
        ) : (
          <div
            key={item.challenge.slice(0, 40)}
            className="rounded-md border border-border bg-surface p-6"
          >
            <h3 className="text-body font-medium text-foreground">{item.challenge}</h3>
            <dl className="mt-4 space-y-3">
              {challengeRows.map(([key, label]) => {
                const value = item[key]
                if (!value) return null
                return (
                  <div key={key} className="grid gap-1 sm:grid-cols-[9rem_1fr] sm:gap-4">
                    <dt className="font-mono text-mono-sm text-subtle-foreground uppercase">
                      {label}
                    </dt>
                    <dd className="text-body text-muted-foreground">{value}</dd>
                  </div>
                )
              })}
            </dl>
          </div>
        ),
      )}
    </div>
  )
}

/* ── Tradeoffs: option comparison cards ─────────────────────────────── */

export function TradeoffCards({ items }: { items: Array<string | Tradeoff> }) {
  return (
    <div className="space-y-6">
      {items.map((item) =>
        typeof item === 'string' ? (
          <p key={item.slice(0, 40)} className="text-body text-muted-foreground">
            {item}
          </p>
        ) : (
          <div key={item.decision} className="rounded-md border border-border bg-surface p-6">
            <h3 className="flex items-center gap-2 text-body font-medium text-foreground">
              <Scale className="size-4 text-accent" aria-hidden />
              {item.decision}
            </h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {item.options.map((option) => (
                <div
                  key={option.name}
                  className={cn(
                    'rounded-md border p-4',
                    option.chosen ? 'border-accent bg-accent-muted' : 'border-border',
                  )}
                >
                  <p className="flex items-center justify-between gap-2 text-body font-medium text-foreground">
                    {option.name}
                    {option.chosen ? (
                      <span className="rounded-full border border-accent px-2 py-0.5 font-mono text-mono-sm text-accent">
                        Chosen
                      </span>
                    ) : null}
                  </p>
                  {option.pros.length > 0 ? (
                    <ul className="mt-3 space-y-1">
                      {option.pros.map((pro) => (
                        <li key={pro} className="flex gap-2 text-small text-muted-foreground">
                          <span className="text-success" aria-hidden>
                            +
                          </span>
                          {pro}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  {option.cons.length > 0 ? (
                    <ul className="mt-2 space-y-1">
                      {option.cons.map((con) => (
                        <li key={con} className="flex gap-2 text-small text-muted-foreground">
                          <span className="text-danger" aria-hidden>
                            −
                          </span>
                          {con}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ))}
            </div>
            {item.reason ? (
              <p className="mt-4 border-t border-border pt-4 text-small text-muted-foreground">
                <span className="font-medium text-foreground">Why: </span>
                {item.reason}
              </p>
            ) : null}
          </div>
        ),
      )}
    </div>
  )
}

/* ── Future improvements: roadmap cards ─────────────────────────────── */

const roadmapConfig: Record<
  RoadmapStatus,
  { label: string; icon: typeof CircleDot; className: string }
> = {
  completed: { label: 'Completed', icon: CircleCheck, className: 'text-success' },
  'in-progress': { label: 'In progress', icon: CircleDot, className: 'text-accent' },
  planned: { label: 'Planned', icon: CircleDashed, className: 'text-warning' },
  future: { label: 'Future', icon: CircleDashed, className: 'text-subtle-foreground' },
}

export function RoadmapCards({ items }: { items: Array<string | RoadmapItem> }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {items.map((item) => {
        const normalized: RoadmapItem =
          typeof item === 'string' ? { title: item, status: 'planned' } : item
        const config = roadmapConfig[normalized.status]
        const Icon = config.icon
        return (
          <li
            key={normalized.title}
            className="rounded-md border border-border bg-surface p-5"
          >
            <p className={cn('flex items-center gap-2 font-mono text-mono-sm', config.className)}>
              <Icon className="size-4" aria-hidden />
              {config.label}
            </p>
            <h3 className="mt-2 text-body font-medium text-foreground">{normalized.title}</h3>
            {normalized.description ? (
              <p className="mt-1 text-small text-muted-foreground">{normalized.description}</p>
            ) : null}
          </li>
        )
      })}
    </ul>
  )
}
