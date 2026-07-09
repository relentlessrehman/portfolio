import { Link } from '@tanstack/react-router'
import { Container } from '#/components/shared/Container'
import { buttonVariants } from '#/components/ui/button'
import { cn } from '#/lib/utils'

export function NotFound() {
  return (
    <Container className="flex flex-col items-start justify-center py-section">
      <p className="font-mono text-mono-sm tracking-widest text-accent uppercase">404</p>
      <h1 className="mt-4 font-display text-display text-foreground">Page not found</h1>
      <p className="mt-4 max-w-md text-body-lg text-muted-foreground">
        The page you're looking for doesn't exist or has moved.
      </p>
      <Link to="/" className={cn(buttonVariants({ variant: 'secondary', size: 'md' }), 'mt-8')}>
        Back to home
      </Link>
    </Container>
  )
}
