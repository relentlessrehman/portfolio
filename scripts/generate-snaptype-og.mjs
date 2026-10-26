/** Rebuild SnapType's social preview: node scripts/generate-snaptype-og.mjs */
import { readFile, writeFile } from 'node:fs/promises'
import satori from 'satori'
import { Resvg } from '@resvg/resvg-js'

const text = (children, style = {}) => ({
  type: 'div',
  props: { style: { display: 'flex', ...style }, children },
})

const image = text(
  [
    text('ABDUL REHMAN / OPEN-SOURCE SOFTWARE', {
      color: '#a5a6f6',
      fontSize: 22,
      letterSpacing: 2,
    }),
    text('SnapType', { fontSize: 100, marginTop: 42, letterSpacing: -5 }),
    text('Free text expander for Windows', {
      color: '#c8c8d4',
      fontSize: 38,
      marginTop: 4,
    }),
    text(
      [
        text('omw', {
          backgroundColor: '#232337',
          border: '1px solid #555572',
          borderRadius: 12,
          padding: '16px 28px',
          color: '#b9baff',
        }),
        text('>>', { color: '#a5a6f6', padding: '0 28px' }),
        text('on my way', { color: '#ededf2' }),
      ],
      { alignItems: 'center', fontSize: 46, marginTop: 42 },
    ),
    text('LOCAL SNIPPETS  /  PER-APP RULES  /  INSTANT UNDO', {
      color: '#a1a1ad',
      fontSize: 20,
      letterSpacing: 1,
      marginTop: 42,
    }),
  ],
  {
    width: 1200,
    height: 630,
    padding: '54px 72px',
    flexDirection: 'column',
    backgroundColor: '#08080d',
    backgroundImage:
      'radial-gradient(ellipse at 100% 0%, #29294e 0%, #08080d 65%)',
    color: '#ededf2',
    fontFamily: 'Geist',
    borderBottom: '6px solid #a5a6f6',
  },
)

const svg = await satori(image, {
  width: 1200,
  height: 630,
  fonts: [
    {
      name: 'Geist',
      data: await readFile(new URL('../assets-src/fonts/geist-600.ttf', import.meta.url)),
      weight: 600,
      style: 'normal',
    },
  ],
})
await writeFile(
  new URL('../public/og/snaptype.png', import.meta.url),
  new Resvg(svg).render().asPng(),
)
