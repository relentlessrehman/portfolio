# Performance: budgets, tiers, evidence, test protocol

Performance is a design constraint (DESIGN.md principle 8). Every budget here is a
release gate. A scene that misses its budget doesn't ship until it fits or is
simplified.

## 1. Evidence gathered for this plan (2026-10-02)

### 1.1 Library weight (measured)

Bundled with esbuild, minified ESM, gzip -9, current versions:

| Package | What was bundled | Raw | **gzip** |
|---|---|---|---|
| three 0.186.1 | Subset we need (renderer, scene, camera, mesh, sphere/plane geometry, ShaderMaterial, Points, InstancedMesh, loaders, math) | 539 KB | **135 KB** |
| three 0.186.1 | Entire namespace (`import * as THREE`) for comparison | 746 KB | 191 KB |
| gsap 3.15 + ScrollTrigger | Core + plugin | 117 KB | **46 KB** |
| lenis 1.3.26 | Core | 19 KB | **5.5 KB** |

The `WebGLRenderer` pulls in most of three's core, so tree-shaking saves ~56 KB but
can't go much below ~130 KB. That's why three loads **lazily, off the critical path**
(§3).

### 1.2 Current site baseline (from existing `.output` build)

The main client entry is **≈ 130 KB gz**. Mermaid/cytoscape/katex chunks (≈ 135 + 136 +
77 KB gz) are already lazy and only load on pages with diagrams. The home route must
not regress this entry by more than +20 KB gz.

### 1.3 GPU spike (measured on Abdul's machine)

A standalone page with the **Core shader** (single-pass fake dispersion refraction),
**N instanced swarm nodes** animated purely in the vertex shader, and the **analytic
ripple plane**. GPU time from `EXT_disjoint_timer_query_webgl2`, 300 frames per run.
GPU: **AMD Radeon integrated (Vega-class iGPU), ANGLE/D3D11**.

| Render size | DPR | Nodes | Ripple | GPU avg | GPU p95 | Verdict |
|---|---|---|---|---|---|---|
| 390×844 (phone) | 2 | 1,000 | on | 0.61 ms | 0.96 ms | ✓ |
| 390×844 (phone) | 3 | 1,000 | on | 0.90 ms | 1.30 ms | ✓ |
| 1920×1080 | 1.5 | 3,000 | on | 1.33 ms | 1.84 ms | ✓ target config |
| 1920×1080 | 1.5 | 8,000 | on | 3.32 ms | 3.93 ms | ✓ but no visual gain |
| 1920×1080 | 2 | 3,000 | on | 2.85 ms | 3.65 ms | ✓ |
| 2560×1440 | 2 | 3,000 | off | 2.95 ms | 3.71 ms | ✓ |
| 2560×1440 | 2 | 3,000 | on | 5.13 ms | 5.86 ms | ◐ ripple ≈ +2.2 ms here |
| 2560×1440 | 1 | 20,000 | off | 4.09 ms | 4.75 ms | ◐ |
| 2560×1440 | 2 | 20,000 | on | **18.56 ms** | **21.27 ms** | ✗ misses 60 fps (frame p95 33 ms) |

**Conclusions adopted into the plan**
1. The Core look is **cheap** (≈ 1 ms). The single-pass fake refraction is the right call.
   A real transmission pass (render-to-texture every frame) would at least double this
   for no visible gain on a black background.
2. **Fill rate is the enemy**, not draw calls: DPR and large transparent surfaces
   (ripple) dominate. → Cap DPR at 1.5 on desktop, cap total render pixels, and only
   keep the ripple in the scene graph during scene 03.
3. High node counts as instanced meshes blow up at high resolution → **swarm uses
   `Points`**, capped at 2,400 (`film`) / 600 (`film-lite`).
4. Mobile GPUs typically have 3–6× less fill rate than this iGPU. The phone-size runs
   (0.6–0.9 ms here) leave plenty of headroom, but **this is extrapolation**. Phase 1's
   exit gate requires measuring on real phones (§7).

## 2. Core Web Vitals budgets (home route, field-like lab conditions)

| Metric | Budget (mobile, Lighthouse "Moto G Power / Slow 4G") | Budget (desktop) | How we hit it |
|---|---|---|---|
| **LCP** | ≤ 2.5 s (target 2.0) | ≤ 1.2 s | LCP element = the `ABDUL REHMAN` text (DOM, SSR). Display font preloaded. The intro reveal is **CSS**, starting ≤ 300ms after first paint, so it never waits for hydration or WebGL. The canvas is never the LCP element |
| **CLS** | ≤ 0.02 | ≤ 0.02 | Mode set pre-paint (Engineering §3); fixed-size stage; fonts with metric-matched fallbacks (`size-adjust`, `ascent-override`); every image has `aspect-ratio` |
| **INP** | ≤ 200 ms | ≤ 100 ms | No React renders on scroll; shader compile async; engine chunks split so no task > 50 ms |
| **TBT** | ≤ 200 ms | ≤ 100 ms | three parsed on idle; GSAP timelines built lazily per act (not all 14 scenes at boot) |
| Lighthouse Perf | ≥ 90 | ≥ 95 | n/a |
| Lighthouse A11y / BP / SEO | 100 / 100 / 100 | same | Keep the current scores |

> LCP note: Chrome ignores elements at `opacity: 0` as LCP candidates. The name
> therefore animates from `opacity: 0.001` and translate. The intro is kept to ≤ 300 ms
> of void, not the brief's 400–600 ms, for this reason.

## 3. Loading strategy and byte budgets

```
t0  HTML (SSR, all scene text) + critical CSS + inline mode script
    preload: Archivo display woff2 (latin), Inter woff2 (latin), still Core render (AVIF, ~15 KB)
    ─► first paint: void + CSS spark  ─► LCP: name
t1  hydration (existing entry ≈ 130 KB gz + film shell ≤ 15 KB gz)
t2  after hydration: import('film-engine')  GSAP + ScrollTrigger + Lenis + engine ≈ 72 KB gz
    → film choreography works (Core = still render, if WebGL not ready yet)
t3  requestIdleCallback (≤ 2 s after LCP): import('film-gl') three + shaders ≈ 160 KB gz
    → compileAsync → CSS spark/still crossfades to the live Core
t4+ scene assets stream one scene ahead of the playhead
```

| Budget | Mobile | Desktop |
|---|---|---|
| Critical JS (before LCP) | ≤ 150 KB gz | ≤ 150 KB gz |
| Total JS on home after full load | ≤ 400 KB gz | ≤ 400 KB gz |
| Fonts | ≤ 140 KB (2 files preloaded max) | same |
| Above-the-fold bytes (HTML+CSS+fonts+Core still) | ≤ 250 KB | ≤ 250 KB |
| Per-scene media | ≤ 250 KB | ≤ 400 KB |
| Whole film, fully scrolled | ≤ 2.0 MB | ≤ 3.5 MB |
| Inner pages JS | ≤ 160 KB gz (no three, no Lenis) | same |

Media rules: AVIF first, WebP fallback, `srcset` 800/1600/2400w; screenshots ≤ 200 KB
at 1600w; device frames are SVG (≈ 2–4 KB); horizon/landscape plates ≤ 120 KB
(they're dark and compress well); no video in v1.

Fonts: Archivo variable with both axes can be large. If the Latin subset with
`wdth`+`wght` exceeds 70 KB, subset it to the glyphs the display text uses
(uppercase, digits, punctuation) for the preloaded file. Body Archivo (labels) can
lazy-load in the full subset.

## 4. Frame budgets

| | Target | Hard floor |
|---|---|---|
| Desktop (iGPU class, like Abdul's laptop) | 60 fps, GPU ≤ 6 ms, main-thread ≤ 6 ms per frame | p95 frame ≤ 20 ms |
| Mid-tier phone (e.g. Pixel 6a / Galaxy A54 / iPhone 12) | 60 fps, GPU ≤ 8 ms | p95 frame ≤ 25 ms |
| Low-tier phone (`film-lite`) | ≥ 45 fps | p95 frame ≤ 33 ms |
| High-refresh displays (120 Hz) | Not targeted. We render at the display rate when cheap, and the damping is frame-rate independent | n/a |

Memory: JS heap ≤ 60 MB; GPU textures ≤ 96 MB mobile / 160 MB desktop (dispose two
scenes behind).

## 5. Quality tiers and the runtime ladder

**Initial tier** comes from the pre-paint script (Engineering §3), refined by the GPU
renderer string.

| Setting | `film` | `film-lite` | `static` |
|---|---|---|---|
| DPR cap | 1.5 desktop / 2 phone | 1.0 | n/a |
| Max render pixels | 3.7 M | 1.3 M | n/a |
| Swarm nodes | 2,400 | 600 | still image |
| Swarm edges | ≤ 4,800 | ≤ 600 | n/a |
| Ripple | shader plane | 3 CSS rings | still image |
| Beam | additive sprite | CSS gradient | still |
| Core geometry | 96×64 | 48×32 | AVIF still |
| Pointer parallax | on (fine pointer) | off | off |
| 3D CSS layer decomposition (05) | 5 layers | 3 layers | stacked rows |

**Runtime ladder** (`quality.ts`): sample frame times continuously. If p75 > 20 ms
(desktop) / 25 ms (phone) over a 2 s window, step down **one rung** and wait 3 s before
judging again:

`DPR −0.25` → `DPR −0.25` → `swarm ×0.5` → `ripple → CSS` → `film-lite` → `WebGL off (stills)`

Never step back up in the same session (prevents oscillation). The current tier and
rung are visible in `?hud`.

## 6. Hard performance rules (lint-able / review-able)

1. Animate only `transform`, `opacity`, `clip-path` (and SVG attrs on ≤ 2 small
   elements). Never `filter: blur()`, `backdrop-filter`, `box-shadow`, `width/height/top`.
2. `will-change` is set by ScrollTrigger `onToggle` only while a scene is active, and
   removed after. Never global.
3. No layout reads inside the RAF loop. Anchors and sizes are measured on refresh only.
4. No React state updates driven by scroll. (Debug HUD updates via direct DOM writes.)
5. No full-screen `mix-blend-mode` layers. Grain is a static texture at 2% opacity on
   its own layer.
6. One canvas, one renderer, one RAF (gsap.ticker).
7. Every fx module disposes its geometry, material and textures on `dispose()`. A
   Vitest test asserts `renderer.info.memory` returns to baseline after
   attach→dispose.
8. No asset > 400 KB without a written exception in this file.

## 7. Test protocol (run at every phase gate)

1. **Lighthouse CI** (mobile + desktop presets) against `vite build` + prod preview,
   3 runs, median. Fail on any §2 budget.
2. **Scripted scroll trace:** `scripts/perf-scroll.mjs` (Playwright + CDP tracing)
   scrolls the full film at constant 1,500 px/s with 4× CPU throttle and records frame
   times, long tasks (> 50 ms) and GPU time via `?hud` export. Fail if p95 frame >
   floor (§4) or any long task during scroll.
3. **Bundle check:** the build prints gz sizes per chunk. Fail if the critical entry
   grows > 20 KB gz or `film-gl` > 175 KB gz.
4. **Real-device pass** (manual, 10 min each), via remote debugging with `?hud`:
   - Abdul's laptop (AMD iGPU), Chrome + Edge
   - Abdul's phone (model: to record here)
   - One iPhone with Safari (iOS 17+)
   - One low-tier Android (≤ 4 GB RAM), which must land in `film-lite` and hold ≥ 45 fps
   Record fps p95, tier and any visual bug per scene in `docs/redesign/device-log.md`.
5. **Endurance:** scroll the film top→bottom→top 5×. JS heap and `renderer.info`
   must return to within 10% of the first pass (no leaks).
6. **Thermal:** on the phone, idle on scene 08 for 60 s. The frame rate must not
   collapse (render-on-demand + idle 30 fps should keep the device cool).

## 8. As built: measured (2026-10-02)

Production build (`vite build`, Nitro with pre-compressed gzip/brotli assets), served
locally, Lighthouse 12, median of two runs per preset.

| Chunk | gzip | Budget |
|---|---|---|
| Main entry (React, router, app shell) | 129.5 KB | unchanged from v1 |
| Home route (`routes`, all 15 scenes' markup) | ~7 KB | — |
| `runtime` (gsap core + Lenis + engine) | 40.8 KB | ≤ 72 KB ✓ |
| `stage` (three.js + shaders) | 135.2 KB | ≤ 175 KB ✓ |
| CSS (all routes) | 22.8 KB | — |
| Fonts (Geist + Geist Mono, preloaded) | 52 KB | ≤ 140 KB ✓ (was 135 KB) |
| Film imagery (AVIF, all scenes) | < 300 KB | ≤ 2.0 MB mobile ✓ |

| Lighthouse | Perf | A11y | Best practices | SEO | LCP | CLS | TBT |
|---|---|---|---|---|---|---|---|
| Desktop | **95–97** | 100 | 100 | 100 | 1.0–1.1 s | 0–0.008 | 0–90 ms |
| Mobile (simulated Moto G Power / slow 4G) | **~67** | 100 | 100 | 100 | ~5.1 s | 0 | ~200 ms |

**Where mobile still misses the budget (Perf ≥ 90, LCP ≤ 2.5 s):** LCP is the name, and
its lab render delay comes from the size of the first-render work: ~650 DOM nodes across
15 server-rendered scenes, plus style/layout under 4× CPU throttling. Hydration and the
deferred engine no longer sit in that window. The next levers, in order:
1. Render only scenes 01–02 on the server's first paint and stream the rest
   (`content-visibility: auto` on off-screen scenes is the cheap version).
2. Trim the global stylesheet: Tailwind utilities for inner pages ship on the home route.
3. Re-measure on the deployed Vercel URL. Local lab runs on this machine have varied ±20
   points in the past (v1 measured 68–93).

**Fixes made during measurement (each verified by a re-run):**
- No compression on the local server → `compressPublicAssets` in Nitro.
- The film engine hid the intro until it booted, so the LCP element was painted late →
  the intro is server-rendered as the current scene.
- A 660 ms (throttled) timeline build right after hydration → scenes build lazily, and the
  engine starts on idle or first intent.
- WebGL loading inside the startup window → loads on intent or after 8 s.
- Gradient-clipped text on the LCP element (Chrome doesn't treat it as painted) → the
  name is solid.
- Fonts went from 135 KB to 52 KB, and font CLS dropped from 0.07 to 0 (`font-display: block` on tiny preloaded files).

GPU: the droplet, halo and ripple cost ≈ 1–2 ms at 1080p on Abdul's AMD iGPU (§1.3). The
in-page HUD (`?hud`) shows frame times, DPR and the quality rung live. Measurements on
real phones (iPhone Safari, mid-range Android) are still to do (§7.4).
