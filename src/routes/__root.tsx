import { useEffect } from 'react'
import {
  HeadContent,
  Outlet,
  Scripts,
  ScrollRestoration,
  createRootRoute,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'

import { seoHead } from '#/lib/seo/meta'
import { printConsoleGreeting } from '#/lib/easter-egg'
import { Navbar } from '#/components/layout/Navbar'
import { MobileNavDrawer } from '#/components/layout/MobileNavDrawer'
import { Footer } from '#/components/layout/Footer'
import { BackToTop } from '#/components/shared/BackToTop'
import { NotFound } from '#/components/layout/NotFound'
import { CommandPalette } from '#/features/search/components/CommandPalette'
import { PageViewTracker } from '#/features/analytics/components/PageViewTracker'
import { MODE_SCRIPT } from '#/features/film/engine/mode'

import appCss from '../styles.css?url'

export const Route = createRootRoute({
  head: () => {
    const seo = seoHead({ path: '/' })
    return {
      meta: [
        { charSet: 'utf-8' },
        {
          name: 'viewport',
          content: 'width=device-width, initial-scale=1, viewport-fit=cover',
        },
        { name: 'theme-color', content: '#050507' },
        {
          name: 'google-site-verification',
          content: 'IlmZDs_7ASlO04SbWRPcLN8fNRmaf6Gpm-GJdV7iec8',
        },
        ...seo.meta,
      ],
      links: [
        // The name in the first frame is the LCP element — its fonts must not wait
        ...['/fonts/geist.woff2', '/fonts/geist-mono.woff2'].map((href) => ({
          rel: 'preload',
          href,
          as: 'font',
          type: 'font/woff2',
          crossOrigin: 'anonymous' as const,
        })),
        { rel: 'stylesheet', href: appCss },
        {
          rel: 'alternate',
          type: 'application/rss+xml',
          title: 'RSS',
          href: '/rss.xml',
        },
        { rel: 'icon', type: 'image/png', href: '/icon-192.png' },
        { rel: 'apple-touch-icon', href: '/icon-512.png' },
        { rel: 'manifest', href: '/manifest.json' },
        ...seo.links,
      ],
    }
  },
  notFoundComponent: NotFound,
  shellComponent: RootDocument,
  component: RootLayout,
})

function RootLayout() {
  useEffect(() => {
    printConsoleGreeting()
  }, [])

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[60] focus:rounded-full focus:bg-accent focus:px-4 focus:py-2.5 focus:text-accent-foreground"
      >
        Skip to content
      </a>
      <Navbar />
      <main id="main" className="flex-1 pt-20">
        <Outlet />
      </main>
      <Footer />
      <MobileNavDrawer />
      <BackToTop />
      <CommandPalette />
      <PageViewTracker />
      <ScrollRestoration />
    </div>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    // data-film / data-intro / data-nav are set by MODE_SCRIPT before first paint
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Presentation mode decided before paint so the layout never jumps (Engineering §3) */}
        <script dangerouslySetInnerHTML={{ __html: MODE_SCRIPT }} />
        <HeadContent />
      </head>
      <body>
        {children}
        {import.meta.env.DEV ? (
          <TanStackDevtools
            config={{ position: 'bottom-right' }}
            plugins={[
              {
                name: 'TanStack Router',
                render: <TanStackRouterDevtoolsPanel />,
              },
            ]}
          />
        ) : null}
        <Scripts />
      </body>
    </html>
  )
}
