import { Section } from '#/components/shared/Section'
import { SectionHeader } from '#/components/shared/SectionHeader'
import { Reveal } from '#/components/motion/Reveal'

interface Principle {
  title: string
  body: string
}

const principles: Array<Principle> = [
  {
    title: 'Purpose over novelty',
    body: 'I build software to solve a real problem, not to add a line to a resume. Stayza exists because students needed a better way to find housing, not because I wanted a side project.',
  },
  {
    title: 'Own the whole system',
    body: 'At Stayza I own the database schema, the backend, the interface, and the deploy. I would rather understand a system end to end than one slice of a large one.',
  },
  {
    title: 'Simple over clever',
    body: 'I default to the boring, maintainable solution before the clever one. Code should be easy to reason about months later, including by me.',
  },
  {
    title: 'Learn deliberately',
    body: 'Every project surfaces something I do not know yet. I treat that as the interesting part, and I make time to study the fundamentals instead of only learning on the job.',
  },
]

/** Numbered principle cards — a different visual texture from the bordered surfaces elsewhere. */
export function EngineeringPhilosophy() {
  return (
    <Section>
      <SectionHeader eyebrow="How I think" title="Engineering philosophy" />
      <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2">
        {principles.map((principle, index) => (
          <Reveal key={principle.title} delay={index * 0.06}>
            <div>
              <p className="font-mono text-mono-sm text-accent">
                {String(index + 1).padStart(2, '0')}
              </p>
              <h3 className="mt-2 text-title-3 font-medium text-foreground">{principle.title}</h3>
              <p className="mt-2 text-body text-muted-foreground">{principle.body}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  )
}
