# Stress test: the brief vs. reality

The original brief (the "short film whose playhead is the scroll wheel" concept + the
14-frame reference image) was tested against performance, responsiveness,
accessibility, SEO, recruiter usability, content truth, robustness, maintainability and
browser support **before** any code was written. This file records what broke, what
changed and where the fix now lives. ✓ = survives as-is · ◐ = survives with changes ·
✗ = cut or replaced.

## 1. Verdict

**The concept survives.** The persistent Core, the five acts and the camera grammar are
sound and buildable within budget. Of 30 findings, 3 pass as-is, 22 survive with
changes (mostly *how* things are built), and 5 are cut: places where the reference
would have shipped false facts.

## 2. Findings

| # | Brief / reference said | Tested against | Problem found | Verdict → resolution | Lives in |
|---|---|---|---|---|---|
| 1 | Next.js stack | Maintainability | Rewriting a working TanStack Start app (content registry, Studio, SEO, backend) for no capability gain | ◐ Keep TanStack Start; redesign the presentation layer only | ENGINEERING §1 |
| 2 | React Three Fiber | Performance | +40–50 KB gz and a reconciler, for 1 object + 3 effects | ◐ Vanilla three (measured 135 KB gz subset), imperative modules | ENGINEERING §1 |
| 3 | "Pure black, 400–600ms of nothing" then the name | Performance (LCP) | Chrome excludes `opacity:0` elements from LCP, so delaying the name delays LCP 1:1; JS-driven intros wait for hydration | ◐ ≤ 300ms of void, CSS-driven reveal from opacity 0.001, first visit only, skippable | PERFORMANCE §2, STORYBOARD 01 |
| 4 | Glass Core refracting things | Performance + physics of the web | Real transmission = render-to-texture every frame; and **WebGL can't see DOM**, so it can't refract HTML | ◐ Single-pass fake dispersion (measured ≈1 ms GPU); where it must refract something (portrait), that thing is also loaded as a texture | DESIGN §5.1, ENGINEERING §6 |
| 5 | Text passes behind the Core, Core passes behind the photo | Engineering | One canvas = one z-layer; and `position: sticky` creates stacking contexts | ◐ The layer sandwich (back · props · canvas · front · chrome) with the *layers* as the sticky elements | ENGINEERING §4.1 |
| 6 | "Hundreds of tiny nodes" (Madad) | Performance (GPU spike) | 20k instanced meshes at 1440p@2× = 18.6 ms GPU (fails 60 fps); fill-rate bound | ◐ `Points`, ≤ 2,400 nodes (`film`) / 600 (`film-lite`), vertex-shader animated | PERFORMANCE §1.3 |
| 7 | Ripple surface | Performance | Large transparent overdraw: ≈ +2.2 ms at 1440p@2× | ◐ Analytic shader, only in the scene graph during scene 03, CSS rings in `film-lite` | PERFORMANCE §5 |
| 8 | 3D laptop / phone | Performance + responsiveness | GLTF devices = 1–3 MB, lighting setup, blurry screens unless hi-res textures | ◐ SVG/CSS device frames (KBs, crisp at any DPR) + real screenshots, CSS 3D ≤ 12° | DESIGN §10 |
| 9 | Lenis smooth scroll everywhere | Responsiveness (touch) | Emulated touch scroll feels broken on iOS/Android | ◐ Lenis for wheel only; native touch momentum | ENGINEERING §1 |
| 10 | GSAP ScrollTrigger pinning | Robustness / SSR | Pin-spacers relayout the page, fight SSR, break overlapping scenes | ◐ CSS sticky layers + −100svh scene overlap; ScrollTrigger only reads progress | ENGINEERING §4.2 |
| 11 | 14 scenes of pinned scroll | Recruiter usability | A recruiter wanting "projects, now" has to watch ~40s | ◐ Skip links ("Skip to work"), chapter rail, nav from scene 01, hash deep links that jump instantly, full case studies one click away | ACCESSIBILITY §3, ENGINEERING §7 |
| 12 | Animations that "appear" when reached | Robustness | One-shot triggers break reverse scroll, chapter jumps and resize | ◐ Everything is `f(scroll)`, deterministic and reversible; this also makes every frame screenshot-testable | DESIGN §3.7, ENGINEERING §5 |
| 13 | Large zooms, fly-throughs, parallax | Accessibility (vestibular) | All of them are documented motion-sickness triggers | ◐ Reduced motion → designed `static` mode; visible Motion toggle in both directions; flash-safe ramps | ACCESSIBILITY §1 |
| 14 | Text revealed by scroll | SEO / screen readers / no-JS | Content that only exists after JS/scroll is invisible to crawlers and AT | ✓ All text SSR'd in reading order; film is enhancement | ACCESSIBILITY §2, §6 |
| 15 | Horizontal motion (Act II) | Responsiveness (phones) | ±45vw on 375px is 170px, so it reads as a nudge, not a journey | ◐ Compact choreography: vertical partings, stacked words, vertical timeline, native carousels | RESPONSIVE §3 |
| 16 | Huge display type | Responsiveness (landscape, zoom) | Width-only clamps make the name taller than a 390px-high landscape screen; `CAMPUSFLOW` overflows 360px | ◐ `min(vw, svh)` clamps; width axis (`wdth`) drops before size does | DESIGN §8, RESPONSIVE §4 |
| 17 | Contact form at the end | UX / a11y | Inputs inside a scrubbed, pinned film are awkward and error-prone | ◐ The film ends with links; the form moves to `/contact` | DESIGN §12 |
| 18 | Portrait in scene 10 | Truth | The reference portrait is AI-generated, not Abdul | ✗ Real photo, or the typographic variant. Never a generated face | CONTENT §1 |
| 19 | Timeline 2022–2026 | Truth | Wrong years (NUST was 2025, Stayza 2026) | ✗ Real derived timeline | STORYBOARD 11 |
| 20 | Experiments: AI Study Buddy, UniLens… | Truth | These projects don't exist | ✗ Real projects, data-driven | STORYBOARD 12 |
| 21 | CampusFlow and Madad as hero scenes | Truth / content | Not in the portfolio's content files. Verified against their repos in `E:\Startups`: both are real (CampusFlow v1.0 Android, 156 tests; Madad C++/Python, 11k+ checks) | ✓ Kept as hero scenes with verified copy; only screenshots/portrait still needed | CONTENT §3, §6 |
| 29 | Madad framed as "AI-powered RAG system" (reference + brief) | Truth | Madad's own README: *"It is not an AI chatbot"*. It's an offline search engine with from-scratch data structures | ✗ Scenes 08–09 rebuilt around the real system: chunks, concept graph, hybrid search, Brain/Contract/Engine | STORYBOARD 08–09 |
| 30 | CampusFlow features "assignments, announcements, community" (reference) | Truth | Not features of the app. The real ones are NOW/NEXT, leave-now, exceptions, widget | ✗ Real feature list; the "widgets detach" beat now uses the real Android widget | STORYBOARD 07 |
| 22 | Film grain "ambience" | Performance | Animated full-screen noise = full repaint every frame | ◐ Static 2% texture, own layer, no blend mode | DESIGN §7 |
| 23 | Frosted glass panes | Performance | `backdrop-filter` over a moving canvas is the most expensive compositing case | ◐ Solid translucent panes with a hairline + top highlight | DESIGN §9 |
| 24 | 120 Hz / 4K / ultrawide | Performance | 2560×1440@2× = 14.7 M pixels per frame | ◐ DPR cap 1.5 desktop, 3.7 M pixel cap, content max-width 1600px | PERFORMANCE §5 |
| 25 | iOS Safari URL bar | Responsiveness | `100vh` jumps, canvas gaps, refresh storms | ◐ `svh` layers, `lvh` canvas, ignore height-only resizes < 20% | RESPONSIVE §2 |
| 26 | Adding future projects | Maintainability | Bespoke scenes can't grow automatically | ◐ 3 curated hero scenes + data-driven Experiments + `/projects`; `film` field in schema & Studio | CONTENT §3 |
| 27 | WebGL failures | Robustness | Context loss, blocklisted GPUs, software renderers | ◐ Still Core renders everywhere WebGL isn't; one restore attempt, then `film-lite` | ENGINEERING §6 |
| 28 | The Core "never leaves" | Design (overuse) | A constantly busy Core becomes noise | ✓ with rule: one significant Core event per ~1.5 screens; ≥ 40% hold per scene | DESIGN §3, §5.3 |

## 2b. Findings during the build (2026-10-02)

| # | What happened | Tested against | Resolution |
|---|---|---|---|
| 31 | Owner asked for controlled scroll: "if he scrolls too fast he misses things" | UX vs accessibility (finding 13 said "never hijack") | Directed scrolling in film modes only: speed cap, stops, settle, keyboard stepping; static mode keeps native scroll (ENGINEERING §6, ACCESSIBILITY §1) |
| 32 | LimitTrack, SnapType and TypoBuddy were about to be added | Recruiter lens | LimitTrack (reads as ToS-dodging) and TypoBuddy (keyboard hook, impersonation) excluded; SnapType in `/projects` only. The owner now approves projects first |
| 33 | stayza.pk's only public listing is "QA Test Boys Hostel" | Truth / recruiter lens | Film shows only the real hero, search, AI search and compare UI; trust tiers are described in text. **Owner action: remove the QA listing** |
| 34 | First Archivo-wide uppercase type rejected by the owner ("use better fonts like a real designer") | Taste | Three-system specimen on real content → Geist + Geist Mono chosen |
| 35 | Droplet v1 (HDR studio env) looked like a dark marble with a blown-out wedge | Visual | Art-directed glass shader: window highlight, rim, caustic, clear body, AA |
| 36 | Lighthouse mobile 36 → 67: no compression, intro hidden pre-boot, eager timeline build, eager WebGL, text-clip on LCP | Performance | Each fixed and re-measured (PERFORMANCE §8). Mobile LCP still above budget, with the next levers listed |
| 37 | Props/backgrounds visible before the engine booted (owner screenshot) | Robustness | Hidden by default in CSS, revealed by the engine |
| 38 | Next scene's layer slid over the current one during the overlap viewport | Engineering | Only `[data-current]` scenes are visible (opacity, so they stay in the a11y tree) |

## 3. Residual risks (accepted, monitored)

| Risk | Likelihood | Impact | Mitigation / trigger |
|---|---|---|---|
| Mobile GPU performance is lower than extrapolated | Medium | High | Phase 1 gate requires real-phone measurements; the runtime ladder downgrades automatically |
| CampusFlow screenshots / portrait arrive late | Medium | Medium | Facts are verified; only imagery is pending. Scene 10 has a typographic variant. CampusFlow screens can come from the APK or an Expo web build. Fallback cut if needed: 01-02-03-04-05-08-09-10-11-12-13-14 |
| Archivo's look doesn't match the reference's thin wide grotesk closely enough | Low | Medium | Type spike in Phase 1 (Archivo vs. alternatives at `wdth 125, wght 200–300`) before scenes are built |
| Scroll length feels too long in user testing | Medium | Medium | Lengths are CSS variables in one registry; tune after the 5-person test in Phase 8 |
| Find-in-page lands on unrevealed text | Low | Low | Documented limitation; `static` mode unaffected |
| Safari sticky / stacking quirks | Medium | Medium | WebKit visual-regression subset in CI from Phase 1 |
