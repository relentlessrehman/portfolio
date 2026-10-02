/*
 * Builds the film's raster assets from the originals in assets-src/film/.
 * Run: node scripts/film-assets.mjs
 *
 * Every output is AVIF + WebP at the widths the film actually displays
 * (docs/redesign/PERFORMANCE.md §3). Crops are fixed coordinates in the
 * source images. Re-capture Stayza with scripts/capture-stayza.mjs.
 */
import sharp from 'sharp'
import { mkdir, stat } from 'node:fs/promises'
import path from 'node:path'

const SRC = path.resolve('assets-src/film')
const OUT = path.resolve('public/film')
await mkdir(OUT, { recursive: true })

/** @param {sharp.Sharp} img */
async function emit(name, img, widths) {
  for (const width of widths) {
    const base = img.clone().resize({ width, withoutEnlargement: true })
    const avif = path.join(OUT, `${name}-${width}.avif`)
    const webp = path.join(OUT, `${name}-${width}.webp`)
    await base.clone().avif({ quality: 52, effort: 6 }).toFile(avif)
    await base.clone().webp({ quality: 78 }).toFile(webp)
    const [a, w] = await Promise.all([stat(avif), stat(webp)])
    console.log(
      `${name}-${width}: avif ${(a.size / 1024).toFixed(0)}KB · webp ${(w.size / 1024).toFixed(0)}KB`,
    )
  }
}

const src = (file) => sharp(path.join(SRC, file))

/* Stayza — laptop screen (home hero, 2880×1800 capture) */
await emit('stayza-home', src('stayza-home.png'), [1440, 2400])

/* Stayza — up-close panels (crops in 2880×1800 capture pixels) */
await emit(
  'stayza-panel-search',
  src('stayza-home.png').extract({
    left: 540,
    top: 915,
    width: 1790,
    height: 420,
  }),
  [900, 1400],
)
await emit(
  'stayza-panel-ai',
  src('stayza-search.png').extract({
    left: 340,
    top: 150,
    width: 2200,
    height: 540,
  }),
  [900, 1400],
)
await emit(
  'stayza-panel-compare',
  src('stayza-compare.png').extract({
    left: 800,
    top: 230,
    width: 1280,
    height: 650,
  }),
  [700, 1100],
)

/* CampusFlow — real screens, Android status bar cropped off (1080×2400) */
const STATUS_BAR = 110
for (const name of ['now', 'day', 'import']) {
  await emit(
    `campusflow-${name}`,
    src(`campusflow-${name}.jpeg`).extract({
      left: 0,
      top: STATUS_BAR,
      width: 1080,
      height: 2400 - STATUS_BAR,
    }),
    [480, 900],
  )
}
/* The real "Next class" card, lifted out of the NOW screen for the detach beat */
await emit(
  'campusflow-card',
  src('campusflow-now.jpeg').extract({
    left: 44,
    top: 274,
    width: 992,
    height: 648,
  }),
  [480, 900],
)

/* Portrait — editorial black & white, gently lowered highlights */
await emit(
  'portrait',
  src('portrait.png')
    .grayscale()
    .linear(1.12, -14)
    .modulate({ brightness: 0.92 }),
  [720, 1254],
)

console.log('done')
