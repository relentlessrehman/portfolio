# DESIGN.md — *Abdul Rehman: a short film about someone who builds things*

> **Status:** Approved direction for the full redesign (v2). Supersedes `docs/DESIGN-SYSTEM.md`.
> **Read with:** [`docs/redesign/`](docs/redesign/README.md): storyboard, engineering,
> performance, responsive, accessibility, content, stress test, roadmap.
> **Visual reference:** `portfolio-design-reference` (PNG, 1536×1024, 14 storyboard frames).
> The reference sets the **look**. Its **facts** are placeholders: it has the wrong
> timeline years, an AI-generated portrait, made-up experiments and an X/Twitter icon.
> Real facts live in [`docs/redesign/CONTENT.md`](docs/redesign/CONTENT.md).

---

## 1. The idea in one paragraph

The home page is a short film, and the visitor's scroll wheel is the playhead. Scrolling
moves time forward, not a stack of sections. The film has one protagonist, **the
Core**: a small glass-and-light object. It appears as a single point in the first frame
and never leaves. It leads the eye, marks the transitions, changes shape when the story
changes register, and ends the film as the full stop of the last sentence. Every scene
is either one idea held still or one movement between ideas. Nothing moves without a
reason, and nothing moves in a direction the camera language doesn't allow.

The test for every decision: **does this help the visitor understand one more thing
about Abdul, or does it just show off?** If it shows off, cut it.

## 2. What we borrow from Apple (and what we don't)

| We take | We leave |
|---|---|
| Scale: one enormous idea per screen | SF Pro, white-on-white, frosted glass cards |
| Pacing: stillness, then movement | Product-page gradients |
| Hierarchy: a headline, one sentence, lots of space | Copying page layouts |
| Treating products as hero objects, not cards | "Learn more ›" link clutter |
| Spatial continuity: one object transforms instead of being replaced | Autoplay video loops |
| Restraint | Effects that exist only because they're possible |

## 3. Principles (ranked; earlier wins conflicts)

1. **Truth over spectacle.** Every claim, date, screenshot and photo is real. No placeholder
   facts ship. If an asset is missing, that scene falls back to its typographic version.
   We never fake one.
2. **Content is never hostage to the film.** All text is server-rendered HTML in reading
   order. Search engines, screen readers, no-JS visitors and reduced-motion visitors get
   the whole story as a designed editorial page (§11).
3. **One protagonist.** The Core is the only persistent animated object. Everything else
   enters, says its one thing, and leaves.
4. **One motion at a time.** Each beat has a single primary movement. Secondary motion
   is ≤ 30% of the primary's travel and starts after it.
5. **Stillness is a material.** At least **40% of every scene's scroll length is
   "hold"**, where only reading happens. Motion means something because of the stillness
   around it.
6. **Direction is grammar.** Things only move in the current act's direction (§6).
7. **Deterministic and reversible.** The visual state is a pure function of scroll
   position. Scrolling backwards plays the film in reverse with no "once" triggers.
   Jumping to a chapter lands on the same frame as scrolling there.
8. **Performance is part of the look.** A dropped frame breaks the film just like a bad
   cut does. Budgets in [`PERFORMANCE.md`](docs/redesign/PERFORMANCE.md) are design
   constraints, not engineering afterthoughts.
9. **The film sets the pace (directed scrolling).** *Owner decision, 2026-10-02.* Every
   scene has **stops** at its hold frames. Wheel and touch speed is capped. A flick that
   crosses a stop halts there for about half a second, and the next gesture continues.
   Pausing near a stop settles onto it. `↓`/`PageDown`/`Space` step stop to stop. This is
   film mode only: reduced motion and Motion off get native scroll on the static page
   (see ACCESSIBILITY §1).

## 4. Structure: five acts, fifteen scenes

```
0% ───────────────────────────────────────────────────────────────────── 100%
│ ACT I  ARRIVAL     │ ACT II  THE WORK             │ ACT III DEPTH │ ACT IV  PERSON │ ACT V  CONVERGE │
│ 01 Intro           │ 04 Stayza                    │ 08 Madad      │ 10 Behind the  │ 13 More work    │
│ 02 Identity        │ 05 Stayza, up close          │ 09 Under the  │    work        │ 14 Let's build  │
│ 03 The Drop        │ 06 Web → Mobile              │    hood       │ 11 Timeline    │ 15 Outro        │
│                    │ 07 CampusFlow (light)        │               │ 12 Toolkit     │   + Credits     │
```

Full beat-by-beat spec: [`docs/redesign/STORYBOARD.md`](docs/redesign/STORYBOARD.md).
Desktop running length is ≈ 28.7 viewport-heights of scroll. With directed scrolling and
its stops, a full watch takes about 60–90 seconds. Mobile is ≈ 23.6 vh-units.

The film is **curated, not exhaustive**, and every project in it passed a recruiter
review ([CONTENT.md](docs/redesign/CONTENT.md) §3). It has three hero projects with their own scenes (Stayza,
CampusFlow, Madad), a data-driven "More work" row (Raabta AI, Smart Academic File
Organizer, Crime Management System), and a Toolkit built only from the tech those projects
actually use. Everything else lives in `/projects`.

## 5. The Core

### 5.1 Object: a water droplet

A droplet of clear water lit like a product shot. It's art-directed the way product
renderers fake glass on black, not physically simulated. A physical HDR studio was tried
and rejected: on black it produced a blown-out wedge and a flat body.

- **Highlight:** a soft round window highlight with a hot core at ≈ 10 o'clock, plus a
  faint secondary glint lower right. It never moves relative to the camera, which is
  what sells "a real lit object".
- **Rim:** a thin luminous fresnel ring, cool at the top, brightening toward the lower
  right where light exits the drop. A whisper of violet dispersion sits at the silhouette.
- **Caustic:** a crescent of focused light inside the lower right.
- **Body:** mostly clear, with a lavender transmitted-light gradient (lit from below
  through itself) and a darker inner ring for depth. It breathes ±3% over 6 s.
- **Liquid behaviour:** it rings with surface tension after it moves (wobble decays
  over ~0.4 s). It stretches into a **teardrop** along its direction of travel, so the
  fall in scene 03 is a real drop. Gentle pointer parallax (≤ 1.2%) on desktop.
- **Halo:** a soft lavender glow with a faint light pool just below it.
- **Ink mode** (paper scene): obsidian glass with the same highlight.
- Silhouette anti-aliased analytically (`fwidth`), because the renderer runs without MSAA.
- **Base size:** `r = 7.5vmin` in the intro, 2–4vmin as a guide; scenes scale it from a
  pinpoint (bookends) to `2.2×` (Madad).

### 5.2 State machine

The Core is always in exactly one state, or blending linearly between two at a scene
boundary.

| State | Scenes | Scale | Material | Behaviour |
|---|---|---|---|---|
| `spark` | 01 (t<1s) | 0.15× | emissive point only | A CSS light, then hands off to WebGL when it's ready |
| `orb` | 01 | 1.0× | glass | Drifts toward the camera as the name parts |
| `lead` | 02 | 1.0× | glass | Diagonal travel. Words pass behind it |
| `drop` | 03 | 0.8× | glass, +6% vertical stretch at max velocity | Falls into an invisible surface → ripple |
| `guide` | 04–05 | 0.6× | glass | Orbits the product and stops beside each detail being explained |
| `tracer` | 06 | 0.35× | glass + light trail | Runs the outline as the laptop screen morphs into a phone |
| `ink` | 07 | 0.8× | dark glass (`uDark=1`) | Lives on paper. Contact shadow on |
| `swarm` | 08–09 | 1→N nodes | glass nodes / points | Splits 1→3→20→N, builds a graph, then re-converges |
| `refract` | 10 | 1.4× | glass sampling the portrait texture | Passes behind the photo cut-out |
| `marker` | 11 | 0.5× | glass | Walks the timeline line and pauses at each milestone |
| `scanner` | 12 | 0.4× | glass | Runs behind the toolkit rows, left to right |
| `satellite` | 13 | 0.5× | glass | Rests beside the More work row |
| `period` | 14 | ≈ the full stop | glass, partly emissive | Lands exactly on the full stop of "worthwhile." |
| `horizon` | 15 | pinpoint | emissive | Sinks onto the planet's horizon as a single light, mirroring the first frame |

**Bookends:** the film opens on a point of light in the void and closes on a point of
light on a horizon.

### 5.3 Rules for the Core

- It does something *significant* at most **once every ~1.5 screens**. In between it
  floats (amplitude ≤ 0.6% of viewport, 6 s period) or holds still.
- It never spins showily. Rotation is a slow 30 s/turn, only visible through how the
  highlight sits in the dispersion.
- It is **never** a cursor follower. Desktop pointer parallax is allowed: ≤ 1.2% of
  viewport, damped, mouse only, and off in static mode.
- It is decorative to assistive tech (`aria-hidden`). It never carries information that
  isn't also in text.

## 6. Camera language (direction is grammar)

| Act | Primary direction | Exits go | Entrances come from | Feeling |
|---|---|---|---|---|
| I · Arrival | forward (+Z) and down | past the camera / downward | the depth / above | Being let in |
| II · The Work | left → right | right | left | Progression, a product line-up |
| III · Depth | into Z | through the camera | far depth | Complexity, the inside of a system |
| IV · Person | camera pulls back (–Z) | outward to the edges | the centre | Reflection, room to breathe |
| V · Converge | toward centre | into the centre / into depth | the edges | Resolution, ending |

**Hard rules**

- An element exits along the act direction. Its replacement enters from the opposite
  side.
- Act boundaries are the **only** places direction may change, and the Core always
  carries the change (the Drop, the Split, the Converge).
- Never animate the same element on more than two axes at once.
- **Max rotation for any product or device: 12°.** No full spins.
- No "random from below" fade-ups anywhere in the film. Fade-ups are allowed only on the
  inner pages.

## 7. Colour

Dark void, one cool light, and one paper scene.

| Token | Value | Use | Contrast (on its bg) |
|---|---|---|---|
| `--void` | `#050507` | Film & site background | n/a |
| `--void-raised` | `#0C0C11` | Cards, panes, nav backdrop | n/a |
| `--hairline` | `rgb(255 255 255 / 0.08)` | Dividers, outlines, device edges | decorative |
| `--hairline-strong` | `rgb(255 255 255 / 0.16)` | Pill buttons, inputs | 3:1 UI ✓ |
| `--fg` | `#EDEDF2` | Primary text | 17.6:1 ✓ AAA |
| `--fg-muted` | `#A1A1AD` | Body / secondary | 7.6:1 ✓ AAA |
| `--fg-subtle` | `#7A7A85` | Labels, captions (≥ 11px) | 4.8:1 ✓ AA |
| `--core` | `#A5A6F6` | The one accent: Core light, focus ring, active index | 9.1:1 ✓ |
| `--core-deep` | `#6E6FF2` | Glows only (never text) | decorative |
| `--paper` | `#F7F7F5` | Scene 07 / light case-study sections | n/a |
| `--paper-ink` | `#0B0B0C` | Text on paper | 18.9:1 ✓ |
| `--paper-muted` | `#5C5C63` | Secondary on paper | 6.2:1 ✓ |

- **No multi-colour gradients.** Gradients are light falloff only: one hue fading to
  void.
- Photography is **black & white or desaturated ≤ 20%** so it never fights `--core`.
  Product screenshots stay in full colour; they're the evidence.
- The site is **art-directed dark**. There's no light/dark toggle. Paper appears as
  designed moments (scene 07, CampusFlow case study), not as a theme.
- Film grain: a static 3.5% tiled noise texture (16 KB WebP) over the film. It is
  never animated (full-screen repaints). A vignette sits above the canvas and below the
  text. It switches off on paper.
- **Metallic headlines:** display type is filled with a vertical gradient (white →
  cool grey), like a product name. The intro name stays solid, because it's the LCP
  element and Chrome doesn't count text-clipped glyphs as painted.
- **Product light:** the laptop and phone each sit in their own soft glow, with glass
  glare on their screens.

## 8. Typography

**Geist + Geist Mono** (chosen 2026-10-02 from a three-option specimen on the real
content: Geist, Instrument Sans + Instrument Serif, Bricolage condensed). One family with
two voices: the closest free match to Apple's SF Pro Display school. It's precise,
product-like and neutral enough to let the work speak. Self-hosted, Latin, variable,
preloaded: **52 KB for both** (it replaced Archivo + Inter + JetBrains Mono at 135 KB).

| Role | Font | Settings | Size (fluid) |
|---|---|---|---|
| **Display XXL** (name) | Geist | `600`, `-0.058em`, line-height `0.9`, mixed case, solid colour | `clamp(3.5rem, min(14vw, 27svh), 15rem)` one line · phones: 2 lines at `min(21vw, 12svh)` |
| **Display XL** (product names) | Geist | `600`, `-0.055em`, metallic | `clamp(3rem, min(9.5vw, 19svh), 9.5rem)` |
| **Display L** (statements, headings) | Geist | `600`, `-0.048em`, metallic | `clamp(2.25rem, min(6vw, 12svh), 6rem)` |
| **Statement** (scene 02) | Geist | `500`, `-0.042em` | `clamp(2rem, 1.3rem + 2.6vw, 3.75rem)` |
| **Title** (taglines) | Geist | `500`, `-0.035em`, sentence case | `clamp(1.6rem, 1.1rem + 1.6vw, 2.75rem)` |
| **Body** | Geist | `400`, `-0.011em`, `--fg-muted`, ≤ 40ch, `text-wrap: pretty` | `1.0625rem → 1.2rem` |
| **Label / index / CTA** | Geist Mono | `500`, UPPERCASE, `+0.06em`, tabular figures | `0.75rem` (12px) |
| **Code** | Geist Mono | — | `0.875rem` |

- **Mixed case for everything you read**, with uppercase reserved for mono labels.
  Product names end with a full stop: **Stayza.** **CampusFlow.** **Madad.**
  **Toolkit.** It's part of the voice.
- Headlines use `text-wrap: balance`, body uses `pretty`.
- **Masked reveals:** headlines rise from behind a clip, by word (never per character:
  splitting letters into boxes destroys kerning pairs).
- Display sizes use `min(vw, svh)` so short landscape screens never get a headline taller
  than the viewport.
- `font-display: block` on both faces. They're tiny and preloaded, and a fallback swap
  on the first frame would be a layout shift.

## 9. Space, layout, shape

- **Stage grid:** 12 columns, `--gutter: clamp(16px, 2.5vw, 40px)`, outer margin
  `clamp(16px, 4vw, 64px)`, content max-width `1600px`, centred on ultrawide screens.
- **Film safe area:** important text stays inside the central 88% × 84% of the stage and
  clears `env(safe-area-inset-*)`.
- **Corner labels:** scenes may use the reference's four-corner furniture: scene index +
  name top-left, `SCROLL ↓` top-right (first two scenes only), lists bottom-right. These
  are `Label` style at `--fg-subtle`.
- **Radius:** devices are drawn to real proportions (laptop screen 10px, phone 48px).
  UI elements: pill buttons `999px`, panes `14px`, cards `10px`.
- **Elevation:** light, not shadows. Glass panes and chips are `--void-raised` at
  ~80% with a `--hairline` border, a lit 1px top edge and a soft drop. Content surfaces
  never use `backdrop-filter`: blur over a moving canvas is the most expensive thing on
  the page.
- **Liquid glass** (the water-droplet material, Apple's current chrome language) is
  reserved for **chrome**: the nav pill and the primary pill CTA. It's dark-tinted (so it
  stays legible over photographs and the paper scene) with a specular cap, a lit top
  edge, and `blur(16px) saturate(170%)` behind it. Two small elements, so the cost stays
  bounded.

## 10. Components (site-wide)

| Component | Spec |
|---|---|
| **Text link CTA** | Geist Mono label, `--fg`, trailing `→` that moves 4px on hover/focus. e.g. `VIEW CASE STUDY →` |
| **Pill CTA** | 44px min height, liquid glass, mono label. e.g. `LET'S TALK →` |
| **Chapter rail** | A quiet row under the nav, top-right (desktop ≥ 900px). `01–05` per act; the active act shows its name in `--core`. Real `<a href="#…">` links |
| **Nav** | Hidden during the intro, fades in at the end of scene 01. Left: Core dot + `ABDUL REHMAN` (mono). Right: a **liquid glass pill** with `WORK · ABOUT · WRITING · CONTACT` + `⌘K` + Motion toggle. Over paper it switches to light glass and ink. Mobile: wordmark + a glass pill with search and the menu sheet (`BottomNav` is retired because it covered the film) |
| **Tech chip** | Toolkit: monochrome icon + name + "used in" projects (mono). The brand colour appears only on hover; one accent stays the rule |
| **Motion toggle** | `MOTION: ON/OFF` in nav and footer. Persisted. Overrides OS setting in both directions |
| **Index list** | `01  IDEA` rows, Label style, active row `--fg` with a 12px `--core` tick, others `--fg-subtle` |
| **Glass pane** | See §9 elevation. Used for architecture panes (09) and experiment cards (12) |
| **Device frames** | Laptop and phone drawn in **SVG/CSS**, not PNG mockups. They stay crisp at any DPR, weigh a few KB and can be themed. Screens hold real screenshots |
| **Focus ring** | 2px `--core`, 3px offset, on every interactive element, also inside the film |

**Brand mark:** the Core is the logo. The app icon is the droplet on the void. The OG
image is the first frame: the name in Geist, the droplet beside it. Both come from
`npm run brand:assets` (satori, with Geist TTF instances in `assets-src/fonts`).

## 11. The three modes (one markup, three presentations)

| Mode | Who gets it | What they see |
|---|---|---|
| **`film`** | Capable devices, motion allowed | The full film: WebGL Core, scrubbed choreography |
| **`film-lite`** | Low-tier devices, Save-Data, or the runtime downgrades | Same choreography; Core at reduced resolution; swarm ≤ 600 points; ripple replaced by a CSS ring; nothing heavier than transforms |
| **`static`** | No JS, `prefers-reduced-motion`, Motion toggle off, no WebGL2, blocked GPU | **The storyboard as an editorial page:** every scene rendered at its "hold" frame, stacked, with a still Core render placed per scene. Opacity-only reveals ≤ 200ms. This is a designed layout, not a broken one. It should look like the reference sheet |

The mode is decided **before first paint** by a tiny inline script, so the layout
never jumps after load (see Engineering §3).

## 12. Inner pages

`/projects/$slug`, `/about`, `/writing`, `/experience`, `/skills`, `/timeline`, `/uses`,
`/now`, `/resume`… keep their routes and content and get the new system. **New: `/contact`**.
The contact form moves out of the home page, because form inputs don't belong inside a
scrubbed film. Scene 13's CTA links to it.

- Same tokens, type, components and grain. **No WebGL, no Lenis**: native scroll and
  fast pages.
- **Case study = product page:** full-bleed hero with the product object (device frame +
  real screenshot) and a still Core. Then chapters (`01 PROBLEM · 02 PRODUCT · 03
  ARCHITECTURE · 04 IMPACT`) with the same index-list furniture. Then large single
  screenshots with one-sentence captions. Then next project. CampusFlow's case study
  uses paper sections.
- Motion on inner pages: CSS scroll-driven reveals (`animation-timeline: view()`) under
  `@supports`, 12–24px, opacity + translate, once. That's it.
- `/studio` and `/dashboard` are internal tools and **stay as they are**. They only pick
  up the new tokens.

## 13. Voice

- Short. Declarative. Present tense. Periods.
- The film never says "passionate", "innovative", "cutting-edge" or "leveraging".
- Abdul is positioned as **Software Engineer · Product Builder · Founder**. Lead with
  what he built and why. Tech stack is a supporting detail, never a headline.
- One sentence per screen in the film. Paragraphs belong to the case studies.

## 14. Definition of "on-brand" (review checklist)

A screen passes design review only if all of these are true:

- [ ] There's one idea on screen, and you can say it in one sentence
- [ ] Every movement follows the act direction (§6)
- [ ] ≥ 40% of the scene's scroll is hold
- [ ] The Core is visible and in a defined state
- [ ] All text is real HTML and matches `CONTENT.md` facts
- [ ] It reads correctly in `static` mode
- [ ] Contrast ≥ 4.5:1 for every text element at its hold frame
- [ ] It holds frame budget on the reference mobile device
