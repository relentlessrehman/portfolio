// Minimal CDP-driven capture of stayza.pk (no puppeteer). Node 22+ (global WebSocket).
import { spawn } from 'node:child_process'
import { writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'

const OUT = path.resolve(process.argv[2] ?? 'shots')
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const PORT = 9333
await mkdir(OUT, { recursive: true })

const chrome = spawn(
  CHROME,
  [
    '--headless=new',
    '--hide-scrollbars',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${path.join(OUT, '.profile')}`,
    '--no-first-run',
    'about:blank',
  ],
  { stdio: 'ignore' },
)
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

let wsUrl
for (let i = 0; i < 50 && !wsUrl; i++) {
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

async function viewport(width, height, scale, mobile = false) {
  await send('Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: scale,
    mobile,
  })
}
async function go(url, wait = 6000) {
  await send('Page.navigate', { url })
  await sleep(wait)
}
async function shot(name, clip) {
  const res = await send('Page.captureScreenshot', {
    format: 'png',
    captureBeyondViewport: !!clip,
    ...(clip ? { clip: { ...clip, scale: 1 } } : {}),
  })
  await writeFile(
    path.join(OUT, `${name}.png`),
    Buffer.from(res.result.data, 'base64'),
  )
  console.log('saved', name)
}

await send('Page.enable')
await send('Runtime.enable')
await viewport(1440, 900, 2)
await go('https://www.stayza.pk/', 4000)
// Reject optional cookies (privacy-preserving choice) so the banner doesn't cover the UI
await evaluate(
  `localStorage.setItem('stayza_cookie_consent', JSON.stringify({version:2,date:'2026-09-07',savedAt:new Date().toISOString(),analytics:false,preference:false})); true`,
)
await go('https://www.stayza.pk/', 8000)
await shot('stayza-home')
// Featured listings further down the home page
const featuredY = await evaluate(
  `(() => { const h=[...document.querySelectorAll('h2')].find(e=>/Featured/i.test(e.textContent)); return h ? h.getBoundingClientRect().top + scrollY - 80 : 1000 })()`,
)
await evaluate(`scrollTo(0, ${featuredY}); true`)
await sleep(2500)
await shot('stayza-featured')
await evaluate('scrollTo(0,0); true')

await go('https://www.stayza.pk/search', 9000)
await shot('stayza-search')
const hostel = await evaluate(
  `(document.querySelector('a[href*="/hostel/"]')||{}).href || ''`,
)
console.log('hostel link', hostel)
if (hostel) {
  await go(hostel, 9000)
  await shot('stayza-hostel')
}
await go('https://www.stayza.pk/compare', 7000)
await shot('stayza-compare')

// Mobile
await viewport(390, 844, 3, true)
await go('https://www.stayza.pk/', 8000)
await shot('stayza-mobile-home')

ws.close()
chrome.kill()
process.exit(0)
