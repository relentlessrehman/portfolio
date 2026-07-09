# Spec Review — Critical Assessment

Status: Accepted with amendments · Date: 2026-07-02

The original specification is strong: data-driven content, evidence-over-decoration, no fake
skill percentages, case-study projects. The following issues were identified and resolved
before implementation. Each amendment optimizes for the stated goal: a credible,
maintainable 5–10 year platform.

## 1. Lovable Cloud is incompatible with the mandated stack (blocker)

Lovable Cloud is only provisioned from inside the Lovable platform editor, which generates
its own React SPA projects. It cannot be attached to a hand-built TanStack Start codebase.
Under the hood, Lovable Cloud *is* Supabase (Postgres, Auth, Edge Functions, Storage).

**Decision: use Supabase directly.** Same primitives, no platform lock-in, first-class
TypeScript client, and if the project ever moves into Lovable the data layer is already
compatible. All backend access goes through TanStack Start server functions in
`src/server/` — the browser never talks to the database directly, so swapping the
backend later touches one directory.

## 2. "Framer Motion" is now `motion`

The library was renamed; the maintained package is `motion` (imported as `motion/react`).
Identical API. The spec's intent (subtle, purposeful animation, reduced-motion respected)
is unchanged.

## 3. Route sprawl vs. credibility (highest product risk)

Twenty public routes for one person means some pages (Speaking, Reading, Open Source)
may launch thin or empty. A recruiter landing on an empty "Speaking" page loses more
trust than the page could ever earn.

**Decision: data-driven visibility.** Navigation, sitemap, and internal links derive from
the content registry. A section with zero published entries automatically unlists itself
(route still exists, returns a graceful empty state if visited directly). All 20 routes are
built; only populated ones are advertised. Adding content lights up the page — no code
change.

## 4. Derived data must be derived (Skills, Timeline)

The spec lists Skills and Timeline as content modules. If "projects using this skill" or
the unified timeline are hand-maintained lists, they rot within months.

**Decision:**
- Skills store identity only (name, category, `firstUsed` date, related tech). "Projects
  using skill" and "years using" are **computed** from project `techStack` arrays and dates.
- Timeline is **computed** by merging education, experience, projects, achievements,
  certifications, and speaking into one sorted stream, plus a small `milestones.ts` module
  for entries that belong nowhere else (e.g. "won hackathon X").

One source of truth per fact. Search indexes are likewise derived at module level, never
duplicated.

## 5. Private dashboard scope

Real analytics (visitors, countries, devices, referrers) means data collection: storage,
retention, and auth. Third-party scripts would cost Lighthouse points and privacy.

**Decision: first-party, cookie-less ingestion.** A tiny server function records
anonymous page-view events (path, referrer domain, coarse device class, country from
request geo header) into Supabase. No cookies, no fingerprinting, no consent banner
required. The `/dashboard` route sits behind Supabase Auth restricted to an allowlisted
email. This ships in a late phase; the event schema is defined early so data accrues from
launch.

## 6. Lighthouse 100 constraints

Achievable, but only with discipline:
- Command palette + Fuse.js index: **lazy-loaded on first invocation** (Ctrl+K or click),
  never in the critical bundle.
- Resume PDF: link/download by default; the embedded viewer renders on interaction.
- Fonts: self-hosted subsets via Fontsource, `font-display: swap`, preload only the two
  files used above the fold.
- Shiki: **build-time** highlighting via rehype plugin — zero runtime JS for code blocks.
- Images: explicit dimensions, `loading="lazy"` below fold, modern formats.

## 7. Typography constraint

Instrument Serif ships one weight (400 + italic). It is a display face: used for `h1`/`h2`
and pull quotes only. Inter carries all UI and body text; JetBrains Mono is code-only.
This is a feature — it enforces restraint.

## 8. MDX pipeline

MDX compiles at build time via `@mdx-js/rollup` in Vite, with remark-gfm,
remark-frontmatter, and a Shiki rehype plugin. Reading time and TOC are extracted at
build time. No client-side MDX compiler, no runtime highlighter.

## 9. Gaps in the original IA

- **Testimonials** were listed as a content module but appear on no page → surfaced on
  About and the home page (when populated).
- **RSS, sitemap, robots** need server routes in TanStack Start (`/rss.xml`,
  `/sitemap.xml`, `/robots.txt`) — generated from the content registry.
- **Resume versions**: modeled as a content module (`resumes.ts`) from day one, so
  "Academic CV" later is one new object + one PDF file.

## 10. Future integrations: interfaces now, implementations later

GitHub / LeetCode / Scholar / Dev.to etc. get a single `src/integrations/` directory with
typed adapter interfaces and static fallbacks. The Open Source page reads from the
adapter, which today returns data from the content module and tomorrow can hit the
GitHub API — no UI change. i18n is prepared only by keeping every UI string in content
modules (a de-facto message catalog), not by installing an i18n runtime nobody needs yet.

## 11. What was explicitly rejected

- **CMS / database-driven content** — typed TS modules + MDX in-repo are versioned,
  reviewable, and free. A CMS adds an availability dependency for a single-author site.
- **Client-side data fetching for content** — all content is statically imported and
  validated at build time with Zod. The network is only for contact form + analytics.
- **Global state library** — server functions + router loaders + a few small React
  contexts (theme, command palette) cover every need. Redux/Zustand would be
  résumé-driven engineering here.
