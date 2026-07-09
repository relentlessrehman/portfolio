import { Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { Container } from '#/components/shared/Container'
import { Button } from '#/components/ui/button'
import type { ReactNode } from 'react'
import type { LinkProps } from '@tanstack/react-router'

export function BackLink({ children, ...props }: LinkProps & { children?: ReactNode }) {
  return (
    <Link
      {...props}
      className="inline-flex w-fit items-center gap-1.5 text-small text-muted-foreground hover:text-foreground"
    >
      <ArrowLeft className="size-3.5" /> {children ?? 'Back'}
    </Link>
  )
}

/** Guards every /studio route: the feature only exists in development. */
export function StudioGate({ children }: { children: ReactNode }) {
  if (import.meta.env.PROD) {
    return (
      <Container size="prose" className="py-section-sm">
        <h1 className="text-title-2 font-semibold text-foreground">Studio unavailable</h1>
        <p className="mt-3 text-body text-muted-foreground">
          The content editor only runs in development. Run{' '}
          <code className="rounded-sm bg-surface px-1.5 py-0.5 font-mono text-mono-sm">
            npm run dev
          </code>{' '}
          locally and open this page there.
        </p>
      </Container>
    )
  }
  return <>{children}</>
}

export function StudioHeader({
  title,
  description,
  back,
}: {
  title: string
  description?: string
  back?: ReactNode
}) {
  return (
    <div className="grid gap-2">
      {back}
      <h1 className="text-title-1 font-semibold text-foreground">{title}</h1>
      {description ? <p className="text-body text-muted-foreground">{description}</p> : null}
    </div>
  )
}

interface StudioCardProps {
  to: string
  params?: Record<string, string>
  label: string
  description: string
  meta: string
}

export function StudioCard({ to, params, label, description, meta }: StudioCardProps) {
  return (
    <Link
      to={to}
      params={params}
      className="group grid gap-2 rounded-lg border border-border bg-surface p-5 transition-colors hover:border-border-strong hover:bg-surface-raised"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-body-lg font-semibold text-foreground">{label}</span>
        <span className="text-small text-muted-foreground">{meta}</span>
      </div>
      <p className="text-small text-muted-foreground">{description}</p>
    </Link>
  )
}

interface SaveBarProps {
  onSave: () => void
  onDelete?: () => void
  saving: boolean
  status: 'idle' | 'saved' | 'error'
  errors?: Array<string>
}

export function SaveBar({ onSave, onDelete, saving, status, errors }: SaveBarProps) {
  return (
    <div className="sticky bottom-0 -mx-[clamp(1rem,0.6rem+2vw,2rem)] mt-8 border-t border-border bg-background/95 px-[clamp(1rem,0.6rem+2vw,2rem)] py-4 backdrop-blur-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button type="button" onClick={onSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
          {onDelete ? (
            <Button type="button" variant="ghost" onClick={onDelete} disabled={saving}>
              Delete
            </Button>
          ) : null}
          {status === 'saved' ? (
            <span className="text-small text-accent">Saved — reloading…</span>
          ) : null}
        </div>
      </div>
      {errors && errors.length > 0 ? (
        <ul className="mt-3 grid gap-1 text-small text-danger">
          {errors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
