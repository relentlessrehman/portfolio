import { Container } from './Container'
import { cn } from '#/lib/utils'
import type { ReactNode } from 'react'

interface SectionProps {
  children: ReactNode
  id?: string
  className?: string
}

/** Standard page section: consistent vertical rhythm + container. */
export function Section({ children, id, className }: SectionProps) {
  return (
    <section id={id} className={cn('py-section-sm', className)}>
      <Container>{children}</Container>
    </section>
  )
}
