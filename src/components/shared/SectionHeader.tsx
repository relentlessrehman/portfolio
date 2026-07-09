import { cn } from '#/lib/utils'

interface SectionHeaderProps {
  /** Small mono eyebrow above the title, e.g. "Selected work" */
  eyebrow?: string
  title: string
  description?: string
  className?: string
  /** Render the title as h1 (page-level) or h2 (section-level, default) */
  as?: 'h1' | 'h2'
}

export function SectionHeader({ eyebrow, title, description, className, as: Tag = 'h2' }: SectionHeaderProps) {
  return (
    <header className={cn('mb-6 max-w-2xl sm:mb-8 md:mb-10', className)}>
      {eyebrow ? (
        <p className="mb-2 font-mono text-mono-sm tracking-widest text-accent uppercase sm:mb-3">
          {eyebrow}
        </p>
      ) : null}
      <Tag className="font-display text-title-1 text-foreground">{title}</Tag>
      {description ? (
        <p className="mt-3 text-body-lg text-muted-foreground sm:mt-4">{description}</p>
      ) : null}
    </header>
  )
}
