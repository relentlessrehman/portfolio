import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useServerFn } from '@tanstack/react-start'
import { getDashboardData } from '#/server/dashboard'
import { isSupabaseAuthConfigured, supabaseBrowser } from '#/features/dashboard/lib/supabase-browser'
import { Container } from '#/components/shared/Container'
import { Button } from '#/components/ui/button'
import type { DashboardData } from '#/server/dashboard'
import type { FormEvent } from 'react'

export const Route = createFileRoute('/dashboard')({
  head: () => ({
    meta: [{ title: 'Dashboard — Abdul Rehman' }, { name: 'robots', content: 'noindex' }],
  }),
  component: DashboardPage,
})

type Phase = 'loading' | 'signed-out' | 'sent-link' | 'unauthorized' | 'ready' | 'unavailable'

function DashboardPage() {
  const [phase, setPhase] = useState<Phase>(isSupabaseAuthConfigured ? 'loading' : 'unavailable')
  const [email, setEmail] = useState('')
  const [data, setData] = useState<DashboardData | null>(null)
  const fetchData = useServerFn(getDashboardData)

  useEffect(() => {
    if (!supabaseBrowser) return

    async function loadDashboard(accessToken: string) {
      const result = await fetchData({ data: { accessToken } })
      if (result.ok) {
        setData(result.data)
        setPhase('ready')
      } else if (result.reason === 'unauthorized') {
        setPhase('unauthorized')
      } else {
        setPhase('unavailable')
      }
    }

    supabaseBrowser.auth.getSession().then(({ data: { session } }) => {
      if (session) void loadDashboard(session.access_token)
      else setPhase('signed-out')
    })

    const { data: subscription } = supabaseBrowser.auth.onAuthStateChange((_event, session) => {
      if (session) void loadDashboard(session.access_token)
      else setPhase('signed-out')
    })

    return () => subscription.subscription.unsubscribe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleSignIn(event: FormEvent) {
    event.preventDefault()
    if (!supabaseBrowser) return
    await supabaseBrowser.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.href },
    })
    setPhase('sent-link')
  }

  async function handleSignOut() {
    await supabaseBrowser?.auth.signOut()
    setData(null)
    setPhase('signed-out')
  }

  if (phase === 'unavailable') {
    return (
      <Container className="py-section-sm">
        <h1 className="text-title-1 font-semibold text-foreground">Dashboard unavailable</h1>
        <p className="mt-3 text-body text-muted-foreground">
          This needs a configured Supabase project (URL, anon key, service-role key, and an
          allowed email). See{' '}
          <code className="rounded-sm bg-surface px-1.5 py-0.5 font-mono text-mono-sm">
            docs/BACKEND.md
          </code>
          .
        </p>
      </Container>
    )
  }

  if (phase === 'loading') {
    return (
      <Container className="py-section-sm">
        <p className="text-body text-muted-foreground">Loading…</p>
      </Container>
    )
  }

  if (phase === 'signed-out' || phase === 'sent-link' || phase === 'unauthorized') {
    return (
      <Container className="py-section-sm">
        <h1 className="text-title-1 font-semibold text-foreground">Dashboard sign-in</h1>
        {phase === 'unauthorized' ? (
          <p className="mt-3 text-body text-danger">
            That account isn't allowed here. Signed in with the wrong email?
          </p>
        ) : null}
        {phase === 'sent-link' ? (
          <p className="mt-3 max-w-md text-body text-muted-foreground">
            Check your inbox — click the link to finish signing in.
          </p>
        ) : (
          <form onSubmit={handleSignIn} className="mt-6 flex max-w-sm gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="h-11 w-full rounded-md border border-border bg-surface px-3 text-body text-foreground placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            />
            <Button type="submit">Send link</Button>
          </form>
        )}
      </Container>
    )
  }

  return (
    <Container className="py-section-sm">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-title-1 font-semibold text-foreground">Dashboard</h1>
        <Button type="button" variant="ghost" size="sm" onClick={handleSignOut}>
          Sign out
        </Button>
      </div>

      <section className="mt-10">
        <h2 className="text-title-3 font-semibold text-foreground">
          Page views <span className="text-muted-foreground">({data!.totalViews} logged)</span>
        </h2>
        {data!.topPages.length === 0 ? (
          <p className="mt-3 text-body text-muted-foreground">No page views logged yet.</p>
        ) : (
          <ul className="mt-4 grid gap-1.5">
            {data!.topPages.map((page) => (
              <li
                key={page.path}
                className="flex items-center justify-between gap-4 rounded-md border border-border bg-surface px-4 py-2.5"
              >
                <span className="font-mono text-mono-sm text-foreground">{page.path}</span>
                <span className="text-small text-muted-foreground">{page.views}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-title-3 font-semibold text-foreground">Contact messages</h2>
        {data!.contactMessages.length === 0 ? (
          <p className="mt-3 text-body text-muted-foreground">No messages yet.</p>
        ) : (
          <ul className="mt-4 grid gap-3">
            {data!.contactMessages.map((message) => (
              <li key={message.id} className="rounded-md border border-border bg-surface p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-body font-medium text-foreground">
                    {message.name}{' '}
                    <a href={`mailto:${message.email}`} className="text-accent hover:underline">
                      {message.email}
                    </a>
                  </p>
                  <time className="text-small text-muted-foreground">
                    {new Date(message.created_at).toLocaleString()}
                  </time>
                </div>
                <p className="mt-2 text-small text-muted-foreground">{message.message}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </Container>
  )
}
