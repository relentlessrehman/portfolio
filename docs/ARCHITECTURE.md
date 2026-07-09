# Architecture

The portfolio is a statically-oriented TanStack Start application. Content lives in typed,
Zod-validated TypeScript modules and MDX files inside the repo. The server exists only
for the contact form, analytics ingestion, RSS/sitemap generation, and the private
dashboard.

## Folder structure

```
src/
  routes/                     File-based routes (thin: compose features, own SEO meta)
    __root.tsx                Document shell, theme, nav/footer, command palette mount
    index.tsx                 Home
    about.tsx  experience.tsx  education.tsx  skills.tsx ...
    projects/
      index.tsx  $slug.tsx
    writing/
      index.tsx  $slug.tsx
    dashboard/                Auth-gated
    rss[.]xml.ts  sitemap[.]xml.ts  robots[.]txt.ts   Server routes

  content/                    THE single source of truth for everything displayed
    schemas/                  Zod schemas (one file per module) + inferred types
    profile.ts  projects.ts  experience.ts  education.ts  skills.ts
    achievements.ts  certifications.ts  milestones.ts  uses.ts  now.ts
    reading.ts  speaking.ts  open-source.ts  testimonials.ts  resumes.ts
    changelog.ts  socials.ts  seo.ts
    writing/*.mdx             Blog posts (frontmatter validated)
    index.ts                  Registry: validates all modules, exports typed accessors

  features/                   Feature-scoped UI + logic (no cross-feature imports)
    home/  projects/  writing/  timeline/  skills/  search/  contact/  dashboard/
      components/  lib/       e.g. features/timeline/lib/build-timeline.ts (derivation)

  components/
    ui/                       shadcn primitives (generated, tokens only)
    layout/                   Navbar, Footer, CommandPalette shell, SkipLink
    shared/                   SectionHeader, TechBadge, MetricCard, EmptyState, ...
    motion/                   Reveal, CountUp, PageTransition, hover primitives

  server/                     ALL backend access lives here (server functions)
    contact.ts  analytics.ts  auth.ts  feeds.ts

  integrations/               Future-ready adapters (interface + static fallback)
    types.ts  github.ts  ...

  lib/                        Pure utilities: cn, dates, reading-time, slugs, seo/jsonld
  config/                     site.ts (URL, name), nav.ts (derived from registry)
  styles/app.css              Design tokens (Tailwind v4 @theme) + base styles
```

Rules:
- Routes are thin; they wire loaders, SEO meta, and feature components.
- `content/` is imported only through `content/index.ts` (validated registry).
- `features/*` may import `components/*` and `lib/*`, never other features.
- No component reads a hardcoded string that belongs to content.

## Routing

File-based via TanStack Router. Every route exports `head` metadata built by
`lib/seo/meta.ts` (title, description, canonical, OG, Twitter, JSON-LD). Dynamic routes
(`projects/$slug`, `writing/$slug`) resolve content in the loader and 404 via
`notFound()` for unknown slugs. Route-level code splitting is automatic; the command
palette and dashboard charts are additionally `lazy()`-loaded.

## Data flow

```
content modules ──> Zod validation (build fails on invalid content)
      │
      ├─> route loaders ──> pages (SSR/SSG, fully typed)
      ├─> derived data: timeline, skill evidence, related projects, search index
      └─> feeds: rss.xml, sitemap.xml (server routes)

browser ──> server functions (src/server/*) ──> Supabase
             contact form · page-view events · dashboard queries (auth-gated)
```

Adding a project = adding one object to `content/projects.ts`. It then automatically
appears in: projects grid, home featured (if flagged), search index, timeline, skill
evidence, related-projects, sitemap, and RSS (if it has a write-up).

## State management

| Concern            | Mechanism                                             |
|--------------------|-------------------------------------------------------|
| Content            | Static imports through the registry (build-time)      |
| Route data         | TanStack Router loaders                               |
| Command palette    | Small context + lazy Fuse index                       |
| Theme              | CSS-first dark default; class toggle if light ships   |
| Forms              | React Hook Form + Zod resolver (local state)          |
| Server mutations   | TanStack Start server functions                       |
| Dashboard data     | Router loader + server function (auth-gated)          |

No global state library. This is deliberate — see SPEC-REVIEW.md §11.

## Backend (Supabase)

Tables: `contact_messages`, `page_events`. Access is exclusively via server functions
using the service role on the server; RLS denies all anonymous access. Auth (dashboard
only): Supabase Auth, allowlisted email. Optional Resend notification on contact
submission. Environment via `.env` (`SUPABASE_URL`, `SUPABASE_SECRET_KEY`,
`RESEND_API_KEY?`) validated at boot.

## Search

Build-time-derived index (projects, posts, skills, pages, technologies) → lazy-loaded
Fuse.js in the command palette. Technology names are first-class index entries so
searching "Python" surfaces every project tagged with it.

## SEO

`lib/seo/` provides `buildMeta()` and JSON-LD builders (Person, Article,
BreadcrumbList, CreativeWork). Sitemap/RSS/robots are server routes reading the
registry. Breadcrumbs render on nested routes.

## Testing & quality gates

- `tsc --noEmit` strict — no `any`, no non-null assertions without justification.
- Content validation runs inside the build (registry throws on invalid data).
- ESLint + Prettier.
- Vitest for pure logic (derivations, seo builders, reading-time) as it lands.
