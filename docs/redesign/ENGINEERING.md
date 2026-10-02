# Engineering: how the film is built (as built, 2026-10-02)

## 1. Stack decisions

| Concern | Decision | Why / rejected alternative |
|---|---|---|
| Framework | **Keep TanStack Start** (SSR, file routes, server functions) | Migrating to Next.js buys nothing. Content registry, Zod schemas, Studio, SEO, sitemap/RSS and the contact backend all carry over. The redesign is a presentation-layer rewrite |
| Scroll → time | **One paused GSAP timeline** whose time *is* the film time `T` (scene index + local progress), set from `scrollY` each frame by a pure function (`progress.ts`) | Planned as ScrollTrigger; dropped during the build. One timeline handles cross-scene objects (the Core, laptop, phone) in correct order, needs no pin-spacers, and saves the plugin's bytes. `gsap` core only |
| Smooth + directed scroll | **Lenis 1.3** for wheel *and* touch (`syncTouch`), with a `virtualScroll` hook (`scroll-control.ts`) that caps speed and adds stops | Owner decision: the film sets the pace (DESIGN §3.9). Film modes only |
| Pinning | CSS `position: sticky` layers, scenes overlapping by one viewport | Native, SSR-stable, no layout thrash |
| WebGL | **Vanilla three.js r186** (`gl/stage.ts`), one renderer, one canvas | React Three Fiber would add ~40–50 KB gz and a reconciler, for one object + three effects |
| DOM animation | GSAP on `transform` / `opacity` / `clip-path` only | Compositor-friendly |
| Fonts | Geist + Geist Mono, self-hosted variable woff2 in `public/fonts`, preloaded | 52 KB for the whole system (DESIGN §8) |
| Images | `scripts/film-assets.mjs` (sharp) → AVIF + WebP at display widths into `public/film/` | Device frames are CSS, so only screenshots/photos are raster |

## 2. Module layout

```
src/features/film/
  components/
    FilmPage.tsx          Mode state, boots the engine, renders rail + fixed layers + scenes
    Scenes.tsx            All 15 scenes' markup (SSR, semantic, reading order)
    Props.tsx             Fixed decorative layers: backdrop lights, laptop, phone, morph SVG
    primitives.tsx        Scene, Mask (masked type reveal), Pic, Orb, Corner, Arrow
  config/
    scenes.ts             THE registry: order, act, lengths {d, m}, stops
    copy.ts               Film-only words (facts verified in CONTENT.md)
  engine/                 lazy chunk "runtime" (~41 KB gz incl. gsap + lenis)
    mode.ts               film | film-lite | static; MODE_SCRIPT runs inline before paint
    progress.ts           PURE: scroll ↔ film time (unit-tested)
    choreography.ts       Builds the master timeline, one lazily-added builder per scene
    scroll-control.ts     Speed cap, stops (detents), settle, keyboard stepping
    runtime.ts            The frame loop, lazy boot, GL loading, quality ladder, HUD, a11y hooks
  gl/
    stage.ts              lazy chunk "stage" (~135 KB gz): droplet, swarm, ripple, halo shaders
  film.css                Layer sandwich, both layouts (static + film), compositions, finish
```

Rules: scene components render once, React state never changes on scroll, words come from
content (`content/index.ts`) or `copy.ts`, choreography lives in code.

## 3. Modes (decided before first paint)

`MODE_SCRIPT` (inline in `<head>`) sets `<html data-film="static|film-lite|film">`,
`data-intro` (play the CSS intro once per session) and `data-nav` (hide the nav during
the intro). No JS = no attribute = static. `prefers-reduced-motion`, the Motion toggle
(persisted, both directions) and missing WebGL2 → static. Save-Data, ≤ 4 GB RAM or ≤ 4
cores → `film-lite`. The runtime can only downgrade.

## 4. Layers and scene mechanics

```
z 45  grain            fixed static noise tile
z 40+ chrome           nav (liquid glass), chapter rail, skip links
z 4   front layers     per scene, sticky        text/UI the Core passes behind
z 3   canvas + vignette fixed                   droplet, swarm, ripple
z 2   props            fixed, aria-hidden       laptop, phone, beam, morph outline
z 1   back layers      per scene, sticky        titles the Core passes in front of
z 0   backdrop         fixed, aria-hidden       stage light, paper, ridgeline, horizon
```

- Layers are the sticky elements (sticky creates a stacking context, so a scene wrapper
  can't be the sticky element). `.f-scene` must never create a stacking context.
- Scenes overlap by `-100svh`, so scene N+1 sticks exactly when N unsticks.
- **Only the current scene is visible** (`[data-current]`, server-rendered on the intro).
  The incoming scene's layer is already in flow during the last viewport of the current
  one; opacity 0 hides it while keeping it in the accessibility tree.
- Props, lights and backgrounds start hidden in CSS. The engine reveals them on their beat.
- After the last scene, the fixed layers translate up with the credits.

## 5. Time: one clock, one source of truth

```
wheel/touch ─► scroll-control (cap, stops) ─► Lenis ─► scrollY
scrollY ─► filmTime() ─► built.ensure(scene + 1) ─► tl.time(T)
        ─► derive() (tracer, SVG morph) ─► stage.render() (damped, on demand)
```

- **Deterministic:** DOM state and the Core's target state are pure functions of
  scroll. The stage only damps toward them; the droplet physics (wobble, teardrop) reacts
  to the damped motion.
- **Lazy scenes:** the timeline builds scenes 1–2 at boot, then each next scene while you
  are in the previous one (`ensure`). Jumps build everything up to the target first.
  GSAP renders tweens in timeline order regardless of when they were added.
- **Lazy boot:** the first frame is pure CSS (name, labels, the CSS Core). The engine
  builds on idle (≤ 2.5 s) or immediately on the first wheel/touch/key/pointer. WebGL
  loads on intent, or after 8 s, and never competes with first paint.
- **Render on demand:** frames are skipped when nothing moves. Ambient motion drops to
  30 fps after 3 s idle. Hidden tabs pause the ticker.

## 6. Directed scrolling (`scroll-control.ts`)

- **Cap:** each wheel delta ≤ 14% of the viewport, each touch move ≤ 22%. Touch release
  inertia is taken over: it's capped at 55% of the viewport and checked against stops.
- **Stops:** every scene lists HOLD frames (`scenes.ts`). If a gesture's target crosses
  one, Lenis glides to it and input is held for ~0.5 s. The next gesture passes it.
- **Settle:** when input stops within 16% of a viewport of a stop, glide onto it.
- **Keys:** `↓`/`PageDown`/`Space` go to the next stop, `↑`/`PageUp`/`Shift+Space` to the
  previous one. Inputs, dialogs and modified keys are ignored.
- Returning `false` from Lenis' hook skips Lenis, so swallowed events are
  `preventDefault`ed explicitly (otherwise the browser would scroll natively).

## 7. WebGL specifics

- `antialias: false`, analytic silhouette AA (`fwidth`). DPR cap 1.5 desktop / 2 phones /
  1 lite, pixel cap 3.7 M (1.3 M lite).
- **Droplet** — art-directed shader (DESIGN §5.1); vertex shader adds surface-tension
  wobble and a velocity-aligned teardrop; additive halo + light pool.
- **Swarm** — `Points` + `LineSegments` (2,400 / 600 nodes), positions computed in the
  vertex shader from hierarchical seeds (`uSplit`), streams, query lift and a
  learning-path pulse.
- **Ripple** — analytic height field, shaded with a specular key and sheen; only drawn
  while visible.
- Additive materials output real alpha (an alpha of 1 blacks out the page behind the
  canvas).
- Quality ladder: p75 frame time over budget for 2 s → step DPR down, then halve the
  swarm, then fall back to the CSS Core. Hidden-tab and > 120 ms stalls are ignored.
- Context loss → tear down to the CSS Core.

## 8. Navigation, focus, resize

- Chapter rail, skip links and hash links (`/#stayza`) glide to a scene's first stop.
- **Focus-follow:** focusing a link scrolls to the beat where it's revealed (`data-beat`).
- Resize (width change or > 20% height change) rebuilds at the same scene + progress.
  Mobile URL-bar changes are ignored.

## 9. Testing

| Layer | Tool | What |
|---|---|---|
| Unit | Vitest | `progress.ts` math, registry invariants (unique ids, ordered stops) |
| Frames | `scripts/film-shots.mjs` (CDP, `?freeze` + `__film.seek(T)`) | Exact frames per scene × viewport; `PROBE="expr"` prints values per frame |
| Perf | Lighthouse 12 (mobile/desktop) on the production build | PERFORMANCE §8 |
| Scroll | In-browser wheel/key event scripts with `?hud` | Stops, cap, keyboard |

## 10. What stays untouched

`src/content/**` (schema gained `film: 'hero' | 'experiment' | 'none'`, editable in
Studio), `src/server/**`, Supabase/Resend/analytics/dashboard, SEO builders, sitemap
(+ `/contact`), robots, RSS.
