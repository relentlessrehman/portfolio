# Design System

Dark-first, minimal, evidence-over-decoration. Every visual value is a token defined in
`src/styles/app.css` via Tailwind v4 `@theme`. Components never hardcode colors, sizes,
durations, or radii.

## Color

OKLCH throughout (perceptually uniform, wide-gamut safe). Near-black surface ramp with
off-white text and a single restrained accent (desaturated warm amber — distinctive
without reading "startup gradient"). All pairs meet WCAG AA; body text meets AAA.

| Token                | Role                                    |
|----------------------|-----------------------------------------|
| `background`         | Page base (near-black, slightly warm)   |
| `surface` / `surface-raised` | Cards, popovers                 |
| `foreground`         | Primary text (off-white)                |
| `muted-foreground`   | Secondary text                          |
| `subtle-foreground`  | Tertiary text / captions                |
| `border` / `border-strong` | Hairlines, focus outlines input   |
| `accent` / `accent-foreground` / `accent-muted` | The one accent |
| `success` `warning` `danger` | Status (project status, forms)  |
| `ring`               | Focus ring (accent-based)               |

Light theme is prepared as a token override block but not shipped until needed.

## Typography

- **Instrument Serif** — display only (`h1`, `h2`, pull quotes). One weight; italic allowed.
- **Inter** (variable) — all UI and body text.
- **JetBrains Mono** — code, metrics, technical labels.

Fluid scale via `clamp()` between 375px and 1440px viewports:

| Token       | Range              | Use                    |
|-------------|--------------------|------------------------|
| `display`   | 2.75rem → 4.5rem   | Page hero              |
| `title-1`   | 2rem → 3rem        | Section headings       |
| `title-2`   | 1.5rem → 2rem      | Card/subsection        |
| `title-3`   | 1.25rem → 1.5rem   | Minor headings         |
| `body-lg`   | 1.0625rem → 1.1875rem | Lead paragraphs     |
| `body`      | 1rem (fixed)       | Default                |
| `small`     | 0.875rem           | Meta, captions         |
| `mono-sm`   | 0.8125rem          | Code, badges           |

Line heights maintain a 4px baseline rhythm; prose measure capped at ~68ch.

## Spacing, radius, elevation

- Spacing: Tailwind's 4px scale; section rhythm tokens `--spacing-section` (fluid
  6rem→9rem) and `--spacing-section-sm`.
- Radius: `sm 6px · md 10px · lg 14px · full`. Cards use `md`.
- Elevation: borders and subtle background shifts, not shadows. Two shadow tokens
  exist (`shadow-raised`, `shadow-overlay`) for popovers/dialogs only.

## Layout

- Container: `max-w-6xl` (72rem) with fluid inline padding (1rem→2rem).
- Prose container: `max-w-prose-lg` (~46rem) for writing and case studies.
- Grid: 1 col mobile → 2 col ≥768px → 3 col ≥1024px for card grids.
- Breakpoints: Tailwind defaults (sm 640, md 768, lg 1024, xl 1280, 2xl 1536).
- Touch targets ≥ 44×44px; interactive rows get generous padding, not tiny icons.

## Motion

`motion/react` only. Durations: `fast 150ms · base 250ms · slow 400ms · reveal 600ms`.
Easing: `--ease-out-quart` for entrances, `--ease-in-out` for layout shifts.

Allowed animations (exhaustive): hero fade-up, section reveal on scroll (once, 12–24px
translate), card hover (border + 2px lift), number count-up, page transition (fade,
150ms), palette open/close. Everything respects `prefers-reduced-motion` via a
`useReducedMotion` gate — reduced mode gets opacity-only or nothing.

## Navigation

Desktop: sticky top bar (brand, section links, contact). Mobile: a fixed
**bottom navigation bar** (Home / Projects / Writing / Contact) keeps primary
destinations in thumb reach — there is no hamburger menu. The bottom bar
respects `safe-area-inset-bottom` and is hidden ≥768px and in print.

The hero uses a restrained radial "glow" (`.hero-glow`, accent at 12% alpha
fading to transparent) and a scroll cue line — both token-driven and disabled
or static under reduced motion. This is the ceiling for ambience: no
glassmorphism, no multi-color gradients.

## Iconography

Lucide only, `1em` sizing bound to text, `stroke-width 1.75`, always with an accessible
label or `aria-hidden` next to visible text.

## Component variants

Buttons: `primary` (accent), `secondary` (surface + border), `ghost`, `link` ·
sizes `sm | md | lg` (all ≥44px tall at md+). Badges: `tech`, `status-*`, `availability`.
Cards: `default`, `interactive` (hover lift + focus ring). Every interactive element has
a visible `:focus-visible` ring using the `ring` token.
