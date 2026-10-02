# Redesign roadmap

> **Status 2026-10-02:** phases 0–6 are built on `redesign/film` (all 15 scenes, static
> mode, directed scrolling, droplet, Geist, Liquid Glass chrome, `/contact`, OG/icons).
> Phase 7 is partial: inner pages inherit the new tokens, type and nav/credits, but the
> case-study template redesign hasn't happened yet. Phase 8 is open: real-device passes,
> mobile LCP work (PERFORMANCE §8), deploy. Nothing is merged to `main`.

Work happens on a branch (`redesign/film`). The old home page stays live on `main`
until Phase 6 passes its gate. Each phase ends with a **gate**: a list of checks that
must pass before the next phase starts. Gates reference
[PERFORMANCE §7](PERFORMANCE.md) and [ACCESSIBILITY §7](ACCESSIBILITY.md).

## Phase 0: Content
- ✅ Domain (`iamabdulrehman.vercel.app`), GitHub (`rehmanoncloud9`), and all project
  facts verified from `E:\Startups` (2026-10-02)
- Add CampusFlow, Madad, LimitTrack, SnapType, TypoBuddy to `projects.json` + the
  `film` field (CONTENT §5). *I can do this.*
- Capture Stayza screenshots from stayza.pk (A2). *I can do this with the browser.*
- Abdul: portrait (A1), CampusFlow screens from the APK (A3), approve taglines and
  dates (CONTENT §7)
**Gate:** the next phase's scenes have their imagery or an agreed variant.
*Phase 1 doesn't wait for this. It uses no unconfirmed content.*

## Phase 1: Engine foundation + type spike
- Tokens, fonts (Archivo spike vs. 1–2 alternatives on scene 01/02 frames), grain,
  base layout; retire Instrument Serif and the old amber accent
- Pre-paint mode script, `mode.ts`, `quality.ts`, Motion toggle
- Scene registry, `progress.ts` (+ unit tests), layer sandwich CSS, sticky/overlap
  mechanics, stacking-context guard test
- Clock (gsap.ticker + Lenis + ScrollTrigger), chapter jumps, focus-follow, `?hud`/`?p`/`?freeze`
- `Stage.ts` + Core shader v1 + CoreTrack with 3 placeholder scenes
- Playwright + axe + perf-scroll script + Lighthouse CI wired up

**Gate:** 3 placeholder scenes scroll forward/back deterministically · desktop p95 ≤ 20 ms ·
**measured on ≥ 2 real phones** (p95 ≤ 25 ms mid-tier, `film-lite` engages on low-tier) ·
Lighthouse mobile Perf ≥ 90 with engine loaded · critical JS ≤ 150 KB gz.

## Phase 2: Act I (01 Intro, 02 Identity, 03 Drop)
CSS intro + spark handoff, name parting, identity words, statement assembly, drop,
beam, ripple, stage-radial background. Static variants. Compact choreography.
**Gate:** LCP ≤ 2.5 s mobile / CLS ≤ 0.02 · flash check on 03 · visual-regression
baselines for 01–03 × 11 viewports × 2 modes · axe clean.

## Phase 3: Act II (04 Stayza, 05 Up close, 06 Web→Mobile, 07 CampusFlow)
Props layer, SVG laptop/phone, real screenshots pipeline (`sharp` script), 2.5D
decomposition, outline morph + tracer, paper flood/contract, phone screens, widget
detach. *04–05 need A2. 06–07 need A4–A5. Build order follows content arrival.*
**Gate:** per-scene media ≤ budget · continuity checklist (STORYBOARD end) passes ·
contrast on paper ✓ · real-device pass.

## Phase 4: Act III (08 Madad, 09 Under the hood)
Swarm (`Points`, hierarchical split, edges, pipeline pulses), glass panes fly-through,
converge. *Needs A6.*
**Gate:** swarm within GPU budget at both tiers · endurance test (no GPU leak across 5
passes).

## Phase 5: Acts IV–V (10–14) + Credits
Portrait cut-out + refraction (or typographic variant), timeline (horizontal/vertical),
data-driven experiments + carousel, thumbnails convergence, Core-as-period,
horizon, credits footer, `/contact` page with the form.
**Gate:** full-film perf-scroll trace passes · full keyboard + screen reader run.

## Phase 6: Static mode polish, SEO, switch-over
Static editorial layout reviewed against the reference sheet. JSON-LD `ItemList`, new
OG image, titles/descriptions. Fallback cut ready if CampusFlow/Madad are still blocked.
**Gate:** all ACCESSIBILITY §7 checks · Lighthouse 90+/100/100/100 · **merge to `main`
and the film becomes the home page.**

## Phase 7: Inner pages
Case-study template (product-page structure, paper sections for CampusFlow), about,
writing, experience/education/skills/timeline, uses/now/achievements/changelog,
résumé, 404. CSS scroll-driven reveals. Nav/footer restyle, BottomNav retired.
Remove `motion` if unused. Fix the remaining `ui_ux_audit.md` items. Studio/dashboard
token update only.
**Gate:** inner-page JS ≤ 160 KB gz · Lighthouse unchanged or better on every route.

## Phase 8: Hardening & launch
Full real-device matrix (PERFORMANCE §7.4) logged in `device-log.md`, thermal test,
5-person scroll test (watch people use it: where do they stop, what do they skip?),
tune scene lengths, deploy preview, production deploy.
**Gate:** every budget green on production URL · no open P1 bugs.

## Rough sizing

| Phase | Effort (focused sessions) |
|---|---|
| 1 | 3–4 |
| 2 | 2–3 |
| 3 | 4–5 |
| 4 | 2–3 |
| 5 | 3–4 |
| 6 | 1–2 |
| 7 | 3–4 |
| 8 | 2 |
