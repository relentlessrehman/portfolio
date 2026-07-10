import { useEffect } from 'react'
import { HeadContent, Outlet, Scripts, ScrollRestoration, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'

import { seoHead } from '#/lib/seo/meta'
import { printConsoleGreeting } from '#/lib/easter-egg'
import { Navbar } from '#/components/layout/Navbar'
import { BottomNav } from '#/components/layout/BottomNav'
import { MobileNavDrawer } from '#/components/layout/MobileNavDrawer'
import { Footer } from '#/components/layout/Footer'
import { BackToTop } from '#/components/shared/BackToTop'
import { AuroraBackground } from '#/components/shared/AuroraBackground'
import { PageLoader } from '#/components/shared/PageLoader'
import { NotFound } from '#/components/layout/NotFound'
import { CommandPalette } from '#/features/search/components/CommandPalette'
import { PageViewTracker } from '#/features/analytics/components/PageViewTracker'

import appCss from '../styles.css?url'

export const Route = createRootRoute({
  head: () => {
    const seo = seoHead({ path: '/' })
    return {
      meta: [
        { charSet: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: '#06101a' },
        {
          name: 'google-site-verification',
          content: 'IlmZDs_7ASlO04SbWRPcLN8fNRmaf6Gpm-GJdV7iec8',
        },
        ...seo.meta,
      ],
      links: [
        { rel: 'stylesheet', href: appCss },
        { rel: 'alternate', type: 'application/rss+xml', title: 'RSS', href: '/rss.xml' },
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
    <div className="flex min-h-dvh flex-col pb-16 md:pb-0">
      <PageLoader />
      <AuroraBackground />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-accent focus:px-4 focus:py-2.5 focus:text-accent-foreground"
      >
        Skip to content
      </a>
      <Navbar />
      <main id="main" className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <BottomNav />
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
    <html lang="en">
      <head>
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
