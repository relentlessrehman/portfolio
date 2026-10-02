#!/usr/bin/env node
/**
 * Generates the app icons and default OG image from the v2 design system
 * (DESIGN.md §7, §8, §10): void background, the Core as the mark, Geist type.
 * Re-run after changing the palette or the profile name:
 *
 *   npm run brand:assets
 *
 * satori needs static TTF/OTF, so assets-src/fonts holds Geist instances
 * (made with fontTools from the variable woff2 in public/fonts).
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import satori from 'satori'
import { Resvg } from '@resvg/resvg-js'
import profile from '../src/content/data/profile.json' with { type: 'json' }

const COLOR = {
  void: '#050507',
  foreground: '#ededf2',
  muted: '#a1a1ad',
  subtle: '#7a7a85',
  core: '#a5a6f6',
}

const fonts = [
  {
    name: 'Geist',
    data: await readFile(path.resolve('assets-src/fonts/geist-600.ttf')),
    weight: 600,
    style: 'normal',
  },
  {
    name: 'Geist Mono',
    data: await readFile(path.resolve('assets-src/fonts/geist-mono-500.ttf')),
    weight: 500,
    style: 'normal',
  },
]

async function renderPng(element, width, height) {
  const svg = await satori(element, { width, height, fonts })
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: width } })
  return resvg.render().asPng()
}

/** The Core as a still: glass sphere, window highlight, caustic at the lower rim */
function core(size) {
  return {
    type: 'div',
    props: {
      style: {
        width: size,
        height: size,
        borderRadius: size,
        display: 'flex',
        backgroundImage: [
          'radial-gradient(circle at 31% 26%, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.35) 4%, rgba(255,255,255,0) 11%)',
          'radial-gradient(circle at 62% 80%, rgba(190,192,255,0.75) 0%, rgba(150,152,255,0.25) 18%, rgba(110,111,242,0) 36%)',
          'radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 62%, rgba(165,166,246,0.35) 69%, rgba(220,221,255,0.75) 71%, rgba(0,0,0,0) 72%)',
          'radial-gradient(circle at 50% 75%, rgba(40,42,110,0.9) 0%, rgba(12,12,24,0.95) 70%)',
        ].join(', '),
        boxShadow: `0 0 ${size * 0.6}px rgba(110,111,242,0.35)`,
      },
    },
  }
}

/* ── App icon: the Core on the void ─────────────────────────────────── */

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
        backgroundColor: COLOR.void,
      },
      children: core(size * 0.66),
    },
  }
}

/* ── Default OG image: the first frame of the film ──────────────────── */

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
        padding: '0 88px',
        backgroundColor: COLOR.void,
        backgroundImage:
          'radial-gradient(circle at 78% 42%, rgba(110,111,242,0.16) 0%, rgba(5,5,7,0) 45%)',
        position: 'relative',
      },
      children: [
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              right: 120,
              top: 170,
              display: 'flex',
            },
            children: core(190),
          },
        },
        {
          type: 'div',
          props: {
            style: {
              fontFamily: 'Geist Mono',
              fontSize: 22,
              color: COLOR.core,
              letterSpacing: 1.5,
              textTransform: 'uppercase',
            },
            children: `${profile.location} · Founder of Stayza`,
          },
        },
        {
          type: 'div',
          props: {
            style: {
              marginTop: 26,
              fontFamily: 'Geist',
              fontSize: 132,
              color: COLOR.foreground,
              letterSpacing: -7,
              lineHeight: 0.95,
              maxWidth: 760,
            },
            children: profile.name,
          },
        },
        {
          type: 'div',
          props: {
            style: {
              marginTop: 30,
              fontFamily: 'Geist Mono',
              fontSize: 22,
              color: COLOR.muted,
              letterSpacing: 1.5,
              textTransform: 'uppercase',
            },
            children: 'Software engineer · Product builder · Founder',
          },
        },
      ],
    },
  }
}

await mkdir(path.resolve('public/og'), { recursive: true })

await writeFile(
  path.resolve('public/icon-192.png'),
  await renderPng(iconElement(192), 192, 192),
)
await writeFile(
  path.resolve('public/icon-512.png'),
  await renderPng(iconElement(512), 512, 512),
)
await writeFile(
  path.resolve('public/og/default.png'),
  await renderPng(ogElement(), 1200, 630),
)

console.log(
  'Generated public/icon-192.png, public/icon-512.png, public/og/default.png',
)
