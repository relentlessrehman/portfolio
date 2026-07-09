#!/usr/bin/env node
/**
 * Generates the app icons and default OG image from the design tokens in
 * src/styles.css, so they're actually on-brand instead of the scaffolder's
 * placeholder TanStack logos. Re-run after changing the accent color or
 * the profile name/role:
 *
 *   npm run brand:assets
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import satori from 'satori'
import { Resvg } from '@resvg/resvg-js'
import profile from '../src/content/data/profile.json' with { type: 'json' }

/* ── OKLCH -> sRGB hex (styles.css tokens use OKLCH; satori needs hex) ─── */

function oklchToHex(l, c, h) {
  const hRad = (h * Math.PI) / 180
  const a = c * Math.cos(hRad)
  const b = c * Math.sin(hRad)

  const l_ = l + 0.3963377774 * a + 0.2158037573 * b
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b
  const s_ = l - 0.0894841775 * a - 1.2914855480 * b

  const l3 = l_ ** 3
  const m3 = m_ ** 3
  const s3 = s_ ** 3

  const r = 4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3
  const g = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3
  const bChannel = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3

  const toSrgb = (channel) => {
    const clamped = Math.max(0, Math.min(1, channel))
    const encoded = clamped <= 0.0031308 ? 12.92 * clamped : 1.055 * clamped ** (1 / 2.4) - 0.055
    return Math.round(Math.max(0, Math.min(1, encoded)) * 255)
  }

  const toHex = (n) => n.toString(16).padStart(2, '0')
  return `#${toHex(toSrgb(r))}${toHex(toSrgb(g))}${toHex(toSrgb(bChannel))}`
}

const COLOR = {
  background: oklchToHex(0.16, 0.005, 80),
  foreground: oklchToHex(0.93, 0.006, 80),
  mutedForeground: oklchToHex(0.71, 0.012, 80),
  accent: oklchToHex(0.8, 0.115, 80),
  accentForeground: oklchToHex(0.18, 0.03, 80),
}

const fontData = await readFile(
  path.resolve('node_modules/@fontsource/instrument-serif/files/instrument-serif-latin-400-normal.woff'),
)
const fonts = [{ name: 'Instrument Serif', data: fontData, weight: 400, style: 'normal' }]

async function renderPng(element, width, height) {
  const svg = await satori(element, { width, height, fonts })
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: width } })
  return resvg.render().asPng()
}

const initials = profile.name
  .split(' ')
  .map((part) => part[0])
  .join('')
  .slice(0, 2)
  .toUpperCase()

/* ── App icon: monogram on the accent color, matching the primary button ─ */

function iconElement(size) {
  return {
    type: 'div',
    props: {
      style: {
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLOR.accent,
        fontFamily: 'Instrument Serif',
      },
      children: {
        type: 'span',
        props: {
          style: { fontSize: size * 0.46, color: COLOR.accentForeground, lineHeight: 1 },
          children: initials,
        },
      },
    },
  }
}

/* ── Default OG image: name + role on the dark background ───────────────── */

function ogElement() {
  return {
    type: 'div',
    props: {
      style: {
        width: 1200,
        height: 630,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '0 90px',
        backgroundColor: COLOR.background,
        fontFamily: 'Instrument Serif',
      },
      children: [
        {
          type: 'div',
          props: {
            style: { fontSize: 30, color: COLOR.accent, letterSpacing: 2 },
            children: profile.location.toUpperCase(),
          },
        },
        {
          type: 'div',
          props: {
            style: { marginTop: 24, fontSize: 96, color: COLOR.foreground, lineHeight: 1.05 },
            children: profile.name,
          },
        },
        {
          type: 'div',
          props: {
            style: { marginTop: 20, fontSize: 34, color: COLOR.mutedForeground, maxWidth: 900 },
            children: profile.headline,
          },
        },
      ],
    },
  }
}

await mkdir(path.resolve('public/og'), { recursive: true })

await writeFile(path.resolve('public/icon-192.png'), await renderPng(iconElement(192), 192, 192))
await writeFile(path.resolve('public/icon-512.png'), await renderPng(iconElement(512), 512, 512))
await writeFile(path.resolve('public/og/default.png'), await renderPng(ogElement(), 1200, 630))

console.log('Generated public/icon-192.png, public/icon-512.png, public/og/default.png')
