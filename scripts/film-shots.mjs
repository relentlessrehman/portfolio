/*
 * Captures film frames at exact film times for visual review / regression.
 * The film's state is a pure function of scroll, so ?freeze + __film.seek(T)
 * reproduces any frame (docs/redesign/ENGINEERING.md §9).
 *
 *   node scripts/film-shots.mjs [baseUrl] [outDir] [WxH] [T,T,...]
 *   node scripts/film-shots.mjs http://localhost:3000 film-shots 1440x900
 */
import { spawn } from 'node:child_process'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import os from 'node:os'

const [
  base = 'http://localhost:3000',
  outDir = 'film-shots',
  size = '1440x900',
  times,
] = process.argv.slice(2)
const [width, height] = size.split('x').map(Number)
const mobile = width < 600
const CHROME =
  process.env.CHROME ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const PORT = 9334
// One hold frame per scene + the transitions worth checking
const T = times
  ? times.split(',').map(Number)
  : [
      0.0, 0.5, 1.82, 2.6, 2.8, 3.6, 4.25, 4.45, 4.62, 5.5, 5.9, 6.35, 6.5, 7.3,
      7.85, 8.45, 9.72, 10.5, 11.55, 12.78, 13.8,
    ]

await mkdir(outDir, { recursive: true })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const chrome = spawn(
  CHROME,
  [
    '--headless=new',
    '--hide-scrollbars',
    `--remote-debugging-port=${PORT}`,
    '--enable-unsafe-swiftshader',
    `--user-data-dir=${path.join(os.tmpdir(), 'film-shots-profile')}`,
    '--no-first-run',
    'about:blank',
  ],
  { stdio: 'ignore' },
)

let wsUrl
for (let i = 0; i < 60 && !wsUrl; i++) {
  try {
    const list = await (
      await fetch(`http://127.0.0.1:${PORT}/json/list`)
    ).json()
    wsUrl = list.find((t) => t.type === 'page')?.webSocketDebuggerUrl
  } catch {
    await sleep(200)
  }
}
const ws = new WebSocket(wsUrl)
await new Promise((r) => ws.addEventListener('open', r))
let id = 0
const pending = new Map()
ws.addEventListener('message', (e) => {
  const msg = JSON.parse(e.data)
  if (msg.id && pending.has(msg.id)) {
    pending.get(msg.id)(msg)
    pending.delete(msg.id)
  }
})
const send = (method, params = {}) =>
  new Promise((resolve) => {
    const n = ++id
    pending.set(n, resolve)
    ws.send(JSON.stringify({ id: n, method, params }))
  })
const evaluate = async (expression) =>
  (
    await send('Runtime.evaluate', {
      expression,
      awaitPromise: true,
      returnByValue: true,
    })
  ).result?.result?.value

await send('Page.enable')
await send('Emulation.setDeviceMetricsOverride', {
  width,
  height,
  deviceScaleFactor: 1,
  mobile,
})
if (mobile) await send('Emulation.setTouchEmulationEnabled', { enabled: true })
await send('Page.navigate', { url: `${base}/?freeze` })
await sleep(9000)
await evaluate(
  `new Promise(r => { const i = setInterval(() => { if (window.__film && document.querySelector('[data-gl][data-ready]')) { clearInterval(i); r(true) } }, 200); setTimeout(() => r(false), 15000) })`,
)

for (const t of T) {
  await evaluate(`window.__film.seek(${t}); true`)
  await sleep(900)
  // PROBE="js expression" prints a value per frame instead of only screenshotting
  if (process.env.PROBE) console.log(t, await evaluate(process.env.PROBE))
  const shot = await send('Page.captureScreenshot', { format: 'png' })
  const name = `t${t.toFixed(2).padStart(5, '0')}.png`
  await writeFile(
    path.join(outDir, name),
    Buffer.from(shot.result.data, 'base64'),
  )
  console.log('saved', name)
}
ws.close()
chrome.kill()
process.exit(0)
