# Implementation Roadmap

Each phase ships working, verified code. Later phases never require reworking earlier
ones — extension points are laid in Phase 1. All 10 phases below are complete.

## Phase 1 — Foundation ✅
Scaffold (TanStack Start, React 19, TS strict, Tailwind v4, shadcn), design tokens,
fonts, root document (SEO shell, skip link, theme), Navbar/Footer, container/section
primitives, motion primitives (Reveal, PageTransition, reduced-motion gate), content
registry with Zod schemas + profile/socials/seo modules, `lib/seo` meta builder,
404 page. Build + typecheck green.

## Phase 2 — Home ✅
Hero (portrait, animated subtitle, availability badge, CTAs), quick stats (CountUp),
featured projects, about/skills/experience previews, latest writing, Currently Building
card, contact CTA. Console easter egg (from profile data).

## Phase 3 — Projects as case studies ✅
Project schema (full case-study fields, metrics, status), projects index (filter by
tech/status), detail page: TOC, reading progress, share/copy, gallery + lightbox,
architecture diagram slot, related projects, prev/next.

## Phase 4 — Writing (MDX) ✅
MDX pipeline (build-time Shiki, GFM, frontmatter), post layout (TOC, progress,
reading time, tags), writing index with tag filter, RSS.

## Phase 5 — Evidence pages ✅
Experience, Education, Skills (computed evidence), Achievements, Certifications,
unified Timeline (derived), Uses, Now, Changelog.

## Studio — content editor ✅
A local, dev-only editor at `/studio` covering every content collection with real
form fields, backed by JSON files and validated against the same Zod schemas the
build enforces. See [docs/CONTENT-GUIDE.md](CONTENT-GUIDE.md).

## Phase 6 — Long-tail pages ✅
Open Source, Reading, Speaking, Resume — all data-driven, all hidden from nav/sitemap
until real content exists (same pattern as Certifications).

## Phase 7 — Search ✅
Command palette (Ctrl/Cmd+K, `/`, or the Navbar search button), lazy Fuse.js index,
technology-aware search (a skill's entry shows which projects use it, and project
keywords include their tech stack), grouped results, keyboard navigation.

## Phase 8 — Backend ✅
Contact form (React Hook Form + Zod + server function), cookie-less `page_events`
analytics, optional Resend email notification. Degrades gracefully to the
mailto/copy-email fallback when Supabase isn't configured — see
[docs/BACKEND.md](BACKEND.md) for setup (requires creating your own Supabase project;
not something that can be provisioned for you).

## Phase 9 — Dashboard (private) ✅
`/dashboard` — Supabase Auth magic-link sign-in restricted to one allowlisted email,
analytics (top pages, total views), contact inbox. Reports itself unavailable until
Phase 8's Supabase project is configured.

## Phase 10 — Hardening ✅
Dynamic `sitemap.xml` and `robots.txt` (mirror each page's noIndex gating), on-brand
favicon/app icons/OG image (generated from the design tokens via satori — see
`npm run brand:assets`), manifest.json fixed (no more scaffolder TanStack branding),
accessibility fixes (contrast token, `<dl>`/`<ol>`/`<ul>` semantics), 19 new Vitest
cases (timeline, search index, contact schema — 31 total), verified against Lighthouse:
**Accessibility 100, Best Practices 100, SEO 100** (Performance varies 68–93 in local
`vite preview` runs on this dev machine — re-check after deploying to real hosting
with proper compression/CDN, which this local setup doesn't have).

## Not done — needs you, not more code
- Portrait image, resume PDF, confirmed production domain (`seo.json`), Stayza tech
  stack confirmation, personalizing the first blog post's voice.
- A Supabase project + `.env` (Phase 8/9 code is complete and tested in its
  "not configured" state; wiring it live needs your own account — see BACKEND.md).
- This still isn't a git repository, and nothing has been deployed anywhere.
