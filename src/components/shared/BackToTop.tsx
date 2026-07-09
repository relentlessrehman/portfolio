import { useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'
import { useReducedMotion } from 'motion/react'
import { Button } from '#/components/ui/button'
import { cn } from '#/lib/utils'

export function BackToTop() {
  const [visible, setVisible] = useState(false)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    function handleScroll() {
      // Show button after scrolling down 400px
      setVisible(window.scrollY > 400)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  function scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: reducedMotion ? 'auto' : 'smooth',
    })
  }

  return (
    <Button
      type="button"
      variant="secondary"
      onClick={scrollToTop}
      aria-label="Back to top"
      className={cn(
        'fixed right-6 bottom-24 z-40 rounded-full p-3 shadow-lg transition-all duration-(--duration-base) md:bottom-8 print:hidden',
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0',
      )}
    >
      <ArrowUp className="size-5" aria-hidden />
    </Button>
  )
}
