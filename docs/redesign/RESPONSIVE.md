# Responsive: the film on every screen

The film is **recomposed** per screen class, not scaled down. A 375px phone gets its
own choreography with the same story, the same Core and the same directions. It is not
a shrunken desktop.

## 1. Screen classes

Width and height are classified independently, because landscape phones and
ultrawide monitors break width-only thinking.

| Width class | Range | Examples | Film length table |
|---|---|---|---|
| `compact` | < 600px | iPhone SE 375, iPhone 15 393, Pixel 412, 430 Pro Max | `M` |
| `medium` | 600–1023px | iPad portrait 768/820, small tablets, **desktop at 200% zoom** | `D` (layouts adapted) |
| `expanded` | 1024–1599px | iPad landscape 1180, laptops 1280/1366/1440/1536 | `D` |
| `wide` | ≥ 1600px | 1920, 2560, ultrawide 3440 | `D`, content capped at 1600px, centred |

| Height class | Range | Treatment |
|---|---|---|
| `short` | < 560px | Landscape phones, small laptop windows. Display type sized by `svh` (the `min(vw, svh)` clamps in Design §8); corner labels hidden; index lists hidden; scene lengths × 0.8 |
| `regular` | 560–1100px | Default |
| `tall` | > 1100px | Portrait monitors / tall tablets. Compositions centre vertically; nothing stretches |

| Input | Detection | Treatment |
|---|---|---|
| Fine pointer + wheel | `(pointer: fine)` | Lenis smoothing, pointer parallax on the Core (≤ 1.5%) |
| Touch | `(pointer: coarse)` | **Native scroll** (no Lenis), no parallax, tap targets ≥ 44px, no hover-only info |
| Keyboard | always | Native scroll keys, focus-follow (Engineering §7) |

## 2. Viewport units and mobile browser chrome

- Layer heights use **`svh`**. Content is laid out for the *small* viewport, so nothing
  important hides under the URL bar.
- The canvas uses **`lvh`**. It covers the *large* viewport so no gap shows when the
  URL bar collapses.
- Height-only changes < 20% (URL bar show/hide) do **not** trigger re-layout or a
  canvas resize (`ScrollTrigger.config({ ignoreMobileResize: true })`).
- Safe areas: `padding: env(safe-area-inset-*)` on chrome and on corner labels.
  `viewport-fit=cover` in the viewport meta.
- No ancestor of a sticky layer may have `overflow: hidden` (it breaks sticky). Use
  `overflow: clip` on `html/body` only if horizontal overflow needs suppressing.

## 3. Per-scene adaptation

| # | Expanded / wide (reference composition) | Compact (phone portrait) | Short (landscape phone) |
|---|---|---|---|
| 01 | Name on one line, parts left/right | Name on two lines; `ABDUL` exits up, `REHMAN` exits down | One line, `min(vw,svh)` sizing; labels hidden |
| 02 | Words scattered across the stage, Core diagonal TL→BR | Words stacked left in one column; Core TR→BL | Words on one row, statement below |
| 03 | Beam + drop + tilted ripple, right labels | Same, labels move under the ripple as a single row | Same; labels hidden |
| 04 | Laptop right 60%, text left, index bottom-right | Laptop top 45svh at 92vw; text below; index hidden | Laptop left 50%, text right, compact |
| 05 | 5-layer CSS 3D decomposition, Core L→R, captions left | **No 3D:** screenshot pans vertically in a phone-width window; Core marks stops; captions below | 3 layers, captions overlay bottom |
| 06 | Outline morph left→centre | Same, centred (works naturally) | Same, scaled by height |
| 07 | Phone centre-right, title left, index right, widgets detach sideways | Phone centred 62svh; title above; active feature as a caption; widgets detach *upward* | Phone left, title right |
| 08 | Title left, lattice right, pipeline right column | Lattice full-bleed behind a 70% void scrim; pipeline vertical under title | Title left, lattice right, pipeline hidden (shows in case study) |
| 09 | Panes along a horizontal curve into Z | Panes along a vertical stack into Z | Panes on a horizontal curve, smaller |
| 10 | Portrait right 60%, text left | Portrait top 60svh, text below on a scrim | Portrait left 45%, text right |
| 11 | Horizontal track, right→left | **Vertical timeline**, Core walks down | Horizontal, fewer labels |
| 12 | Row of 5 cards drifting in | **Native scroll-snap carousel** + `1 / 5` counter | Row, scroll-snap |
| 13 | Headline left-centre, Core = period, thumbnails converge | Headline centred, 3 lines; thumbnails limited to 4 | Headline one line |
| 14 | Wide planet arc | Taller arc crop | Thin arc |

## 4. Typography at the extremes

| Text | 360px | 1440px | 2560px |
|---|---|---|---|
| Name (Display XXL) | ~58px, 2 lines | ~158px, 1 line | capped 176px (11rem) |
| Project names (Display XL) | ~44px | ~130px | capped 144px |
| Statements (Display L) | ~32px | ~79px | capped 88px |
| Body | 16px | 17–18px | 18px |
| Label | 11px | 11px | 12px |

- At 360px the longest single word on one line, `CAMPUSFLOW` at Display XL with `wdth
  125`, must fit in 328px (360 − 2×16 gutter). If it doesn't, the compact Display XL
  clamp drops `wdth` to 110 (the variable width axis is the responsive tool, not
  smaller text). **Test case in visual regression.**
- Body text never drops below 16px. Labels never below 11px.

## 5. Zoom, text resizing, orientation

- **Browser zoom 200%** on a 1440px laptop = a 720px CSS viewport → `medium` class. The
  film must be fully usable (WCAG 1.4.4, 1.4.10). This is in the visual regression matrix.
- **Text spacing overrides** (WCAG 1.4.12: line-height 1.5, letter-spacing 0.12em,
  word-spacing 0.16em): no clipping. Display lines are allowed to wrap; containers have
  no fixed heights around text.
- **Orientation change:** debounced `ScrollTrigger.refresh()` + re-measure anchors +
  canvas resize. The current scene and local progress are preserved: we restore by scene
  id + p, not raw pixels, because scene lengths differ between `D` and `M`.

## 6. Test matrix (visual regression + manual)

| Viewport | Class | Why |
|---|---|---|
| 360×740 | compact | Smallest common Android |
| 390×844 | compact | iPhone 12–15 |
| 430×932 | compact | Large iPhone |
| 844×390 | compact × short | Landscape phone |
| 768×1024 | medium | iPad portrait |
| 1180×820 | expanded | iPad landscape |
| 1366×768 | expanded × regular | Most common budget laptop |
| 1440×900 | expanded | MacBook Air class |
| 1920×1080 | wide | Standard desktop |
| 2560×1440 | wide | DPR cap + pixel cap verification |
| 720×450 (1440@200%) | medium × short | Zoom accessibility |

Each viewport × {`film` hold frames for all 14 scenes, `static` full page} gives
11 × 15 = 165 snapshots, run in CI on Playwright Chromium. WebKit runs the compact
subset to catch iOS-specific sticky/viewport bugs.
