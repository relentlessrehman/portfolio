import { Link, createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useServerFn } from '@tanstack/react-start'
import {
  dashboardSignIn,
  dashboardSignOut,
  getDashboardData,
  getDashboardSecurityQuestions,
} from '#/server/dashboard'
import { Container } from '#/components/shared/Container'
import { Button, buttonVariants } from '#/components/ui/button'
import type { DashboardData } from '#/server/dashboard'
import type { FormEvent } from 'react'

export const Route = createFileRoute('/dashboard')({
  head: () => ({
    meta: [{ title: 'Dashboard — Abdul Rehman' }, { name: 'robots', content: 'noindex' }],
  }),
  component: DashboardPage,
})

type Phase = 'loading' | 'signed-out' | 'unauthorized' | 'ready' | 'unavailable'

function DashboardPage() {
  const [phase, setPhase] = useState<Phase>('loading')
  const [password, setPassword] = useState('')
  const [answer1, setAnswer1] = useState('')
  const [answer2, setAnswer2] = useState('')
  const [questions, setQuestions] = useState<{ question1: string; question2: string } | null>(
    null,
  )
  const [data, setData] = useState<DashboardData | null>(null)
  const fetchData = useServerFn(getDashboardData)
  const fetchQuestions = useServerFn(getDashboardSecurityQuestions)
  const signIn = useServerFn(dashboardSignIn)
  const signOut = useServerFn(dashboardSignOut)

  useEffect(() => {
    fetchData().then((result) => {
      if (result.ok) {
        setData(result.data)
        setPhase('ready')
      } else if (result.reason === 'unauthorized') {
        setPhase('signed-out')
      } else {
        setPhase('unavailable')
      }
    })
  }, [fetchData])

  useEffect(() => {
    if (phase !== 'signed-out' && phase !== 'unauthorized') return
    fetchQuestions().then(setQuestions)
  }, [phase, fetchQuestions])

  async function handleSignIn(event: FormEvent) {
    event.preventDefault()
    const result = await signIn({ data: { password, answer1, answer2 } })
    setPassword('')
    setAnswer1('')
    setAnswer2('')
    if (!result.ok) {
      setPhase('unauthorized')
      return
    }
    const dashboard = await fetchData()
    if (dashboard.ok) {
      setData(dashboard.data)
      setPhase('ready')
    } else {
      setPhase('unavailable')
    }
  }

  async function handleSignOut() {
    await signOut()
    setData(null)
    setPhase('signed-out')
  }

  if (phase === 'unavailable') {
    return (
      <Container className="py-section-sm">
        <h1 className="text-title-1 font-semibold text-foreground">Dashboard unavailable</h1>
        <p className="mt-3 text-body text-muted-foreground">This page isn't set up yet.</p>
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

  if (phase === 'signed-out' || phase === 'unauthorized') {
    return (
      <Container className="py-section-sm">
        <h1 className="text-title-1 font-semibold text-foreground">Dashboard sign-in</h1>
        {phase === 'unauthorized' ? (
          <p className="mt-3 text-body text-danger">
            Wrong password or answer. All three must be correct.
          </p>
        ) : null}
        <form onSubmit={handleSignIn} className="mt-6 grid max-w-sm gap-4">
          <input
            type="password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password"
            className="h-11 w-full rounded-md border border-border bg-surface px-3 text-body text-foreground placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          />
          {questions ? (
            <>
              <label className="grid gap-1.5">
                <span className="text-small text-muted-foreground">{questions.question1}</span>
                <input
                  type="text"
                  required
                  value={answer1}
                  onChange={(event) => setAnswer1(event.target.value)}
                  className="h-11 w-full rounded-md border border-border bg-surface px-3 text-body text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                />
              </label>
              <label className="grid gap-1.5">
                <span className="text-small text-muted-foreground">{questions.question2}</span>
                <input
                  type="text"
                  required
                  value={answer2}
                  onChange={(event) => setAnswer2(event.target.value)}
                  className="h-11 w-full rounded-md border border-border bg-surface px-3 text-body text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                />
              </label>
            </>
          ) : null}
          <Button type="submit" className="justify-self-start">
            Sign in
          </Button>
        </form>
      </Container>
    )
  }

  return (
    <Container className="py-section-sm">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-title-1 font-semibold text-foreground">Dashboard</h1>
        <div className="flex items-center gap-2">
          {import.meta.env.DEV ? (
            <Link to="/studio" className={buttonVariants({ variant: 'secondary', size: 'sm' })}>
              Open Studio
            </Link>
          ) : null}
          <Button type="button" variant="ghost" size="sm" onClick={handleSignOut}>
            Sign out
          </Button>
        </div>
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
