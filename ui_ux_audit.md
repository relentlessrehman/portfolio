# UI/UX Audit — Abdul Rehman Portfolio

> Full code-based audit of the portfolio at `localhost:3000`. Covers design system, accessibility, layout, navigation, responsiveness, animation, and per-page issues.

---

## Overall Verdict

This is a **well-architected portfolio** with a disciplined design system, strong SEO foundations, and thoughtful accessibility basics. The codebase is impressively consistent — semantic tokens, fluid typography, and content-driven navigation are all done right. That said, several UI/UX issues range from minor polish gaps to genuine usability concerns.

**Severity scale**: 🔴 Critical · 🟡 Medium · 🟢 Low (polish)

---

## 1. Design System & Tokens

### ✅ What's Done Well
- OKLCH color palette with warm near-black ramp — sophisticated and perceptually uniform
- Fluid type scale (`clamp()`) from 375px→1440px with proper line heights
- Consistent design tokens consumed via Tailwind — no hardcoded colors
- Print stylesheet is thorough and production-quality
- `::selection` styling matches the accent color
- Shadow hierarchy (raised vs overlay) is restrained and appropriate for dark themes

### Issues Found

| # | Severity | Issue | Location |
|---|----------|-------|----------|
| 1.1 | 🟢 | **No light mode** — `:root` carries only dark values, no `.light` class override exists. The comment says "if ever shipped" but there's no `prefers-color-scheme` media query either. Users in bright environments get no relief. | [styles.css](file:///e:/My-Portfolio/src/styles.css#L19-L22) |
| 1.2 | 🟢 | **`--spacing-section` is defined but `py-section` utility is used inconsistently** — `Section` component uses `py-section-sm` while `Footer` uses `mt-section`. The `--spacing-section` (larger) token exists but is only used on the NotFound page. This creates uneven vertical rhythm across pages. | [Section.tsx](file:///e:/My-Portfolio/src/components/shared/Section.tsx#L14), [Footer.tsx](file:///e:/My-Portfolio/src/components/layout/Footer.tsx#L10) |
| 1.3 | 🟢 | **No `--text-muted-foreground` WCAG annotation** — `--subtle-foreground` has a WCAG AA comment but `--muted-foreground` (0.71 lightness) doesn't. At OKLCH 0.71 against 0.16 background, the contrast ratio is approximately 4.2:1 which is _borderline_ and may fail AA for small text. | [styles.css](file:///e:/My-Portfolio/src/styles.css#L31) |

---

## 2. Accessibility (a11y)

### ✅ What's Done Well
- Skip-to-content link present and well-styled on focus
- `aria-label` on all navs (`"Primary"`, `"Primary mobile"`, `"Footer"`, `"Breadcrumb"`, `"Table of contents"`)
- `aria-hidden` on all decorative icons and elements
- `aria-current="page"` on mobile bottom nav active item
- `prefers-reduced-motion` respected throughout — animations degrade to opacity-only or static
- Focus-visible ring is 2px with offset — meets WCAG 2.4.7
- Typewriter has `sr-only` full text for screen readers
- Honeypot field in contact form is `aria-hidden` and `tabIndex={-1}`

### Issues Found

| # | Severity | Issue | Location |
|---|----------|-------|----------|
| 2.1 | 🟡 | **`SectionHeader` uses `<h2>` on every page** — but page-level titles should be `<h1>`. On pages like `/skills`, `/experience`, etc., the `SectionHeader` renders an `<h2>` as the page title, skipping `<h1>` entirely. This breaks heading hierarchy. | [SectionHeader.tsx](file:///e:/My-Portfolio/src/components/shared/SectionHeader.tsx#L19) |
| 2.2 | 🟡 | **`QuickStats` has `<dd>` before `<dt>`** — the `<dd>` (value) renders before `<dt>` (label). Visually this is fine, but semantically it's inverted for screen readers. Each pair should also be wrapped in a `<div>` for proper association in HTML5. | [QuickStats.tsx](file:///e:/My-Portfolio/src/features/home/components/QuickStats.tsx#L26-L29) |
| 2.3 | 🟡 | **Command palette `<dialog>` has no `role="search"` or ARIA combobox pattern** — it functions as a search combobox (input + list of results + keyboard navigation), but the results have no `role="listbox"`, items have no `role="option"`, and `aria-activedescendant` is missing. Screen reader users can't navigate results. | [CommandPalette.tsx](file:///e:/My-Portfolio/src/features/search/components/CommandPalette.tsx#L121-L188) |
| 2.4 | 🟡 | **`ReadingProgress` returns `null` for reduced motion** — this removes a functional UI element (scroll position indicator). The reduced-motion preference should suppress _animation_, not remove the entire element. A static bar that tracks without smoothing would be more accessible. | [ReadingProgress.tsx](file:///e:/My-Portfolio/src/components/shared/ReadingProgress.tsx#L12) |
| 2.5 | 🟢 | **Contact form inputs have no `aria-describedby`** — error messages exist but aren't linked to their inputs via `aria-describedby`. Screen readers won't announce validation errors. | [ContactForm.tsx](file:///e:/My-Portfolio/src/features/contact/components/ContactForm.tsx#L51-L77) |
| 2.6 | 🟢 | **External links missing visible indicator** — links that open in `_blank` (organization URLs, social links) have no visual cue (icon or text) that they leave the site. Some have `ArrowUpRight` but many don't. | [experience.tsx](file:///e:/My-Portfolio/src/routes/experience.tsx#L49-L56) |

---

## 3. Navigation & Information Architecture

### ✅ What's Done Well
- Content-driven nav — empty sections auto-hide from navigation
- Mobile bottom bar replaces hamburger menu — smart UX choice for thumb reach
- Desktop nav is minimal (3 items + contact) — avoids overwhelming
- Footer has comprehensive 3-column grouping with logical categories
- Command palette (Ctrl+K) with fuzzy search is a premium feature
- `safe-area-inset-bottom` respected in bottom nav for notched phones

### Issues Found

| # | Severity | Issue | Location |
|---|----------|-------|----------|
| 3.1 | 🟡 | **20 pages, only 3 in primary nav** — Pages like Skills, Experience, Timeline, Achievements, Education, Certifications, Reading, etc. are _only_ discoverable through footer links or the command palette. First-time visitors likely miss them entirely. Consider a secondary nav or an "Explore" dropdown. | [nav.ts](file:///e:/My-Portfolio/src/config/nav.ts#L14-L18) |
| 3.2 | 🟡 | **Mobile bottom nav has only 4 items** — About, Skills, Experience, Timeline, and other key pages have **no mobile nav entry at all**. Mobile users must scroll to the footer or know Ctrl+K exists. The bottom nav items (Home, Projects, Writing, Contact) miss the "About" page which is arguably the most-visited page on a portfolio. | [nav.ts](file:///e:/My-Portfolio/src/config/nav.ts#L30-L35) |
| 3.3 | 🟢 | **No "back to top" button on long pages** — Pages like `/skills` (3725px per your browser state), `/timeline`, and `/projects/$slug` can be very tall. There's no back-to-top affordance. | Global |
| 3.4 | 🟢 | **`Contact` CTA in navbar is `mailto:` link** — clicking it opens the mail client, which may surprise users expecting a contact page/form. The home page has a full contact form at `#contact`, but the navbar link bypasses it. | [Navbar.tsx](file:///e:/My-Portfolio/src/components/layout/Navbar.tsx#L46-L50) |

---

## 4. Layout & Spacing

### ✅ What's Done Well
- Fluid container padding with `clamp(1rem, 0.6rem + 2vw, 2rem)` — excellent
- `max-w-6xl` default, `max-w-[46rem]` for prose — proper reading measures
- `min-h-dvh` on root layout — handles dynamic viewport height on mobile
- Consistent `gap` and `space-y` usage throughout

### Issues Found

| # | Severity | Issue | Location |
|---|----------|-------|----------|
| 4.1 | 🟡 | **About page sidebar breaks at medium viewports** — the grid is `lg:grid-cols-[1fr_20rem]` which means on tablets (md breakpoint, ~768-1023px), the sidebar content (portrait, values, interests, languages, find me) stacks below the text. But when it does stack, the `20rem` sidebar loses its max-width constraint and fills full width, potentially making the portrait image stretch oddly. | [about.tsx](file:///e:/My-Portfolio/src/routes/about.tsx#L29) |
| 4.2 | 🟡 | **Project detail sidebar order swap** — the `<aside>` has `order-first lg:order-none`. On mobile/tablet, the meta sidebar (status, links, etc.) appears ABOVE the project content, pushing the actual case study below the fold. For long-form content, readers expect meta as a sidebar or at the bottom — not blocking the content. | [$slug.tsx](file:///e:/My-Portfolio/src/routes/projects/$slug.tsx#L165) |
| 4.3 | 🟢 | **Inconsistent card padding** — achievement and certification cards use `p-6`, education cards use `p-6 md:p-8`, currently-building uses `p-8 md:p-10`, experience preview uses `p-6`. This creates subtle visual inconsistency across pages. | Multiple routes |
| 4.4 | 🟢 | **`FeaturedProjects` bento layout may create unequal column heights** — the lead card gets `md:col-span-8` and remaining cards stack in `md:col-span-4`. If there are 3+ secondary cards, the right column becomes significantly taller than the left. | [FeaturedProjects.tsx](file:///e:/My-Portfolio/src/features/home/components/FeaturedProjects.tsx#L36-L48) |

---

## 5. Responsive Design

### ✅ What's Done Well
- Bottom nav for mobile instead of hamburger — modern pattern
- Fluid typography eliminates most breakpoint-dependent font sizing
- Grid layouts gracefully degrade (`sm:grid-cols-2`, `lg:grid-cols-3`)
- `pb-16 md:pb-0` on root layout accounts for bottom nav height

### Issues Found

| # | Severity | Issue | Location |
|---|----------|-------|----------|
| 5.1 | 🟡 | **Skills page 3-column grid on desktop, 2 on tablet, 1 on mobile** — with many skill cards, the single-column mobile view creates a very long scroll (3725px per your viewport). No collapse/accordion or "show more" pattern exists. | [skills.tsx](file:///e:/My-Portfolio/src/routes/skills.tsx#L58) |
| 5.2 | 🟡 | **Project filter pills may overflow on mobile** — `FilterRow` is `flex flex-wrap` but with many technologies, the wrap creates a tall filter area that pushes content far down. There's no horizontal scroll option or "More filters" collapse. | [projects/index.tsx](file:///e:/My-Portfolio/src/routes/projects/index.tsx#L96-L119) |
| 5.3 | 🟢 | **Hero `min-h-[calc(100dvh-4rem)]` may be excessive on large screens** — On a 1440p+ display, the hero section can be enormous with content floating in the center. Consider a `max-h` or reduced minimum. | [Hero.tsx](file:///e:/My-Portfolio/src/features/home/components/Hero.tsx#L19) |
| 5.4 | 🟢 | **"All projects" and "All posts" links are `hidden sm:inline-flex`** — on mobile, the desktop inline links disappear. `FeaturedProjects` has a mobile fallback link below the grid, but `LatestWriting` does not — mobile users have no "All posts" link in that section. | [LatestWriting.tsx](file:///e:/My-Portfolio/src/features/home/components/LatestWriting.tsx#L19-L25) |

---

## 6. Animations & Motion

### ✅ What's Done Well
- `useReducedMotion()` checked in every animated component
- Typewriter degrades to static text
- CountUp server-renders final value (works without JS)
- Scroll-cue animation is restrained and purposeful
- `motion-reduce:group-hover:translate-y-0` on project cards — detail-level polish
- Staggered reveals with capped delays (`Math.min(index * 0.05, 0.3)`)

### Issues Found

| # | Severity | Issue | Location |
|---|----------|-------|----------|
| 6.1 | 🟡 | **Reveal animation fires on every scroll-into-view** — `viewport={{ once: true }}` is set, but every `<Reveal>` component creates a new `IntersectionObserver` via `motion.div`. On pages with 30+ reveals (skills, timeline), this could cause performance jank on low-end devices. Consider a single shared observer. | [Reveal.tsx](file:///e:/My-Portfolio/src/components/motion/Reveal.tsx#L20-L28) |
| 6.2 | 🟢 | **No loading/skeleton states** — page transitions are instant (SPA), but server function calls (dashboard, contact form) show no loading skeleton. The dashboard has a text "Loading…" but no visual skeleton. | [dashboard.tsx](file:///e:/My-Portfolio/src/routes/dashboard.tsx#L88-L93) |
| 6.3 | 🟢 | **AvailabilityBadge ping animation runs indefinitely** — `animate-ping` is a perpetual animation that can be distracting and waste GPU resources. Consider stopping after 3-5 cycles. | [AvailabilityBadge.tsx](file:///e:/My-Portfolio/src/components/shared/AvailabilityBadge.tsx#L25) |

---

## 7. Interaction Design

### ✅ What's Done Well
- Project cards have subtle lift on hover (`-translate-y-0.5`) — delightful
- Arrow icon nudge on "Read case study" hover
- Button variants (primary, secondary, ghost, link) are well-differentiated
- 44px touch targets on buttons (h-11, h-12) meet accessibility guidelines
- Copy button with success feedback (check icon + "Copied" text)

### Issues Found

| # | Severity | Issue | Location |
|---|----------|-------|----------|
| 7.1 | 🟡 | **TechBadge in project detail is wrapped in `<Link>` but looks identical to non-clickable badges** — on `/projects/$slug`, tech badges link to filtered project view, but they have no hover state, underline, or cursor change to indicate clickability. Users won't realize they're interactive. | [$slug.tsx](file:///e:/My-Portfolio/src/routes/projects/$slug.tsx#L127-L129) |
| 7.2 | 🟡 | **No active/current-page indicator on desktop nav links** — the class includes `[&.active]:text-accent` but TanStack Router's `activeProps` may not automatically add `.active`. Verify this works — if not, users can't tell which page they're on from the navbar. | [Navbar.tsx](file:///e:/My-Portfolio/src/components/layout/Navbar.tsx#L38) |
| 7.3 | 🟢 | **Contact form has no success animation** — after submission, it abruptly switches to a plain text "Message sent — I'll get back to you soon." A fade transition or check animation would feel more polished. | [ContactForm.tsx](file:///e:/My-Portfolio/src/features/contact/components/ContactForm.tsx#L40-L46) |
| 7.4 | 🟢 | **Keyboard shortcut "Ctrl K" shown without `+`** — the kbd element shows `Ctrl K` without a separator. Standard convention is `Ctrl+K` or `⌘K`. | [Navbar.tsx](file:///e:/My-Portfolio/src/components/layout/Navbar.tsx#L29) |

---

## 8. Content & Copy

### Issues Found

| # | Severity | Issue | Location |
|---|----------|-------|----------|
| 8.1 | 🟡 | **Missing portrait image** — `profile.ts` has a `TODO(content): add a portrait` comment. The hero and about page conditionally render a portrait, but if it's missing, the hero feels impersonal — just name + text with no human element. | [profile.ts](file:///e:/My-Portfolio/src/content/profile.ts#L5-L6) |
| 8.2 | 🟢 | **About page blockquote uses typographic quotes inconsistently** — the code uses `"` and `"` curly quotes hardcoded in JSX for the mission quote, but uses straight quotes for the motto in `AboutPreview`. | [about.tsx](file:///e:/My-Portfolio/src/routes/about.tsx#L39), [AboutPreview.tsx](file:///e:/My-Portfolio/src/features/home/components/AboutPreview.tsx#L35) |
| 8.3 | 🟢 | **"Coursework & personal practice" fallback** — on the skills page, skills with no linked projects show this generic text. It doesn't differentiate between a skill actively used in unpublished work vs. one only studied academically. | [skills.tsx](file:///e:/My-Portfolio/src/routes/skills.tsx#L84-L86) |

---

## 9. SEO & Performance

### ✅ What's Done Well
- JSON-LD structured data (Person, BreadcrumbList, project-specific)
- Dynamic `<head>` with proper meta tags per route
- RSS feed, sitemap, and robots.txt all present
- `fetchPriority="high"` on hero portrait
- `loading="lazy"` on below-fold images
- Canonical URLs properly constructed
- `noIndex` on empty content pages (certifications)

### Issues Found

| # | Severity | Issue | Location |
|---|----------|-------|----------|
| 9.1 | 🟡 | **No `<h1>` on most pages** — as noted in §2.1, `SectionHeader` renders `<h2>`. Google expects exactly one `<h1>` per page for SEO. | [SectionHeader.tsx](file:///e:/My-Portfolio/src/components/shared/SectionHeader.tsx#L19) |
| 9.2 | 🟢 | **Fuse.js loaded lazily but search index built eagerly** — `buildSearchIndex()` is called in `useMemo` at component mount, building the full index even if the user never opens search. Consider deferring to `open()`. | [CommandPalette.tsx](file:///e:/My-Portfolio/src/features/search/components/CommandPalette.tsx#L38) |

---

## 10. Per-Page Summary

| Page | Grade | Key Issues |
|------|-------|------------|
| **Home (`/`)** | A- | Missing portrait, availability badge perpetual ping, hero too tall on large screens |
| **About (`/about`)** | B+ | No `<h1>`, sidebar stacking on tablet, mission quote styling |
| **Skills (`/skills`)** | B | Very long on mobile (3725px), no collapse/filter, no `<h1>` |
| **Experience (`/experience`)** | A- | Clean timeline, minor: no `<h1>`, external links lack visual indicator |
| **Projects (`/projects`)** | B+ | Filter pills overflow on mobile, no `<h1>` |
| **Project Detail (`/projects/$slug`)** | A- | Excellent case study layout, sidebar-above-content on mobile is questionable |
| **Achievements (`/achievements`)** | A- | Clean cards, no `<h1>` |
| **Timeline (`/timeline`)** | A | Well-executed chronological view, category dots are clear |
| **Education (`/education`)** | A- | Clean cards, no `<h1>` |
| **Now (`/now`)** | A | Good use of prose-width container |
| **Certifications (`/certifications`)** | A | Graceful empty state with cross-link |
| **Reading (`/reading`)** | A- | Clean, grouped by status |
| **Dashboard (`/dashboard`)** | B | No loading skeleton, "Loading…" text only, no `<h1>` |
| **404** | A | Good use of display typography, clear CTA |

---

## Top 10 Recommendations (Priority Order)

1. **Add `<h1>` support to `SectionHeader`** — add an `as` prop or `level` prop so page-level headers render as `<h1>` instead of always `<h2>`. This fixes both a11y heading hierarchy and SEO.

2. **Add portrait image** — the hero and about page are designed for it, but it's missing. This is the single biggest visual gap.

3. **Improve discoverability of secondary pages** — consider an "Explore" or "More" dropdown in the desktop nav, or a slide-out menu for mobile, to surface the 17+ pages hidden in the footer.

4. **Add ARIA combobox pattern to CommandPalette** — add `role="combobox"`, `role="listbox"`, `role="option"`, and `aria-activedescendant` to make search accessible to screen readers.

5. **Fix `QuickStats` `<dd>`/`<dt>` order** — swap order or wrap each pair in a `<div>` with flexbox reordering.

6. **Add `aria-describedby` to contact form fields** — link error messages to inputs for screen reader announcement.

7. **Make clickable `TechBadge` look interactive** — add hover state, cursor-pointer, or underline to badges in project detail that link to filtered views.

8. **Add "All posts" mobile link to `LatestWriting`** — mirror the pattern used in `FeaturedProjects`.

9. **Add mobile "About" to bottom nav** — or replace one of the current 4 items. About is arguably the most important page on a portfolio.

10. **Consider collapsible sections on `/skills`** — or a tab/filter pattern to reduce the 3700px+ scroll depth on mobile.

---

> **Overall Score: B+ / A-**
> The foundation is excellent — design tokens, content architecture, SEO, and code quality are all above average for a portfolio. The main gaps are heading semantics, navigation discoverability, and a few missing polish details. Fixing the top 5 recommendations would push this to a solid **A**.
