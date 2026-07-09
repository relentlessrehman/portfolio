import { cn } from '#/lib/utils'
import type { ReactNode } from 'react'

interface ContainerProps {
  children: ReactNode
  className?: string
  /** `prose` narrows the measure for long-form reading */
  size?: 'default' | 'prose'
}

export function Container({ children, className, size = 'default' }: ContainerProps) {
  return (
    <div
      className={cn(
        'mx-auto w-full px-[clamp(1rem,0.6rem+2vw,2rem)]',
        size === 'default' ? 'max-w-6xl' : 'max-w-[46rem]',
        className,
      )}
    >
      {children}
    </div>
  )
}
