import { useEffect, useState } from 'react'
import { cn } from '#/lib/utils'

export interface TocEntry {
  id: string
  title: string
}

/**
 * Table of contents with scroll-spy: the section nearest the top of the
 * viewport is highlighted. Smooth scrolling and sticky-navbar offset come
 * from global CSS (scroll-behavior + scroll-mt on sections).
 */
export function Toc({ entries }: { entries: Array<TocEntry> }) {
  const [activeId, setActiveId] = useState<string | null>(null)

  useEffect(() => {
    const headings = entries
      .map((entry) => document.getElementById(entry.id))
      .filter((element) => element !== null)
    if (headings.length === 0) return

    const visible = new Set<string>()
    const observer = new IntersectionObserver(
      (observed) => {
        for (const entry of observed) {
          if (entry.isIntersecting) visible.add(entry.target.id)
          else visible.delete(entry.target.id)
        }
        // Highlight the first document-order section currently in view
        const first = headings.find((heading) => visible.has(heading.id))
        if (first) setActiveId(first.id)
      },
      // Track the upper half of the viewport, below the sticky navbar
      { rootMargin: '-80px 0px -50% 0px' },
    )
    for (const heading of headings) observer.observe(heading)
    return () => observer.disconnect()
  }, [entries])

  if (entries.length < 2) return null

  return (
    <nav aria-label="Table of contents">
      <h2 className="font-mono text-mono-sm tracking-widest text-subtle-foreground uppercase">
        On this page
      </h2>
      <ol className="mt-3 space-y-1.5 border-l border-border">
        {entries.map((entry) => (
          <li key={entry.id}>
            <a
              href={`#${entry.id}`}
              aria-current={activeId === entry.id ? 'true' : undefined}
              className={cn(
                '-ml-px block border-l py-0.5 pl-4 text-small transition-colors duration-(--duration-fast)',
                activeId === entry.id
                  ? 'border-accent text-foreground'
                  : 'border-transparent text-muted-foreground hover:border-border-strong hover:text-foreground',
              )}
            >
              {entry.title}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}
