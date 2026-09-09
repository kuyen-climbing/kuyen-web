/**
 * Pruebas de interacción y capturas con Chrome headless (protocolo de depuración).
 *
 *   node tools/build.mjs --out=dist
 *   node tools/serve.mjs dist --port=8100      (en otra terminal)
 *   npm run test:ui
 *
 * Comprueba el selector y el ToggleTheme de cada template, y deja las capturas
 * en dist-pruebas/. Usa el Chrome instalado (variable CHROME para otra ruta).
 */
import { spawn } from 'node:child_process'
import { writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { tmpdir } from 'node:os'
import { TEMAS, rutaTema } from '../src/site.config.mjs'

const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const PORT = 9333
const BASE = process.argv[2] || 'http://localhost:8100'
const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist-pruebas')
mkdirSync(OUT, { recursive: true })

const chrome = spawn(
  CHROME,
  [
    '--headless=new', '--disable-gpu', '--hide-scrollbars', `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${join(tmpdir(), 'kuyen-pruebas-ui')}`,
    '--window-size=1440,900', 'about:blank',
  ],
  { stdio: 'ignore' }
)

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
async function wsUrl() {
  for (let i = 0; i < 100; i++) {
    try {
      const tabs = await (await fetch(`http://localhost:${PORT}/json`)).json()
      const t = tabs.find((t) => t.type === 'page')
      if (t) return t.webSocketDebuggerUrl
    } catch {}
    await sleep(200)
  }
  throw new Error('Chrome no respondió')
}
const ws = new WebSocket(await wsUrl())
await new Promise((r) => (ws.onopen = r))
let id = 0
const pending = new Map()
ws.onmessage = (m) => {
  const d = JSON.parse(m.data)
  if (d.id && pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id) }
}
const send = (method, params = {}) =>
  new Promise((res) => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })) })
await send('Page.enable')
await send('Runtime.enable')

const evaluate = async (expression) => {
  const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
  if (r.result?.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails))
  return r.result?.result?.value
}
const metrics = (width, height) =>
  send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width < 768 })
const goto = async (path, espera = 3000) => { await send('Page.navigate', { url: BASE + path }); await sleep(espera) }

async function shot(name, { full = false } = {}) {
  const params = { format: 'jpeg', quality: 70 }
  if (full) {
    const h = Math.min(await evaluate('document.documentElement.scrollHeight'), 16000)
    const w = await evaluate('window.innerWidth')
    params.clip = { x: 0, y: 0, width: w, height: h, scale: 1 }
    params.captureBeyondViewport = true
  }
  const r = await send('Page.captureScreenshot', params)
  writeFileSync(`${OUT}/${name}.jpg`, Buffer.from(r.result.data, 'base64'))
  console.log('captura', name)
}

const results = []
const check = (nombre, ok, detalle = '') => { results.push([nombre, ok, detalle]); console.log(ok ? 'OK   ' : 'FALLA', nombre, detalle) }

try {
  // ---- Selector
  await metrics(1440, 900)
  await goto('/')
  check('el selector lista los 4 templates', (await evaluate('document.querySelectorAll("[data-tema]").length')) === TEMAS.length)
  check('el selector tiene un solo h1', (await evaluate('document.querySelectorAll("h1").length')) === 1)
  await shot('selector-desktop', { full: true })

  // ---- Cada template, con su ToggleTheme
  for (let i = 0; i < TEMAS.length; i++) {
    const tema = TEMAS[i]
    await goto(rutaTema(tema.id), 4000)

    check(`${tema.id}: el template cargó contenido`, (await evaluate('document.body.innerText.trim().length')) > 500)
    check(`${tema.id}: el ToggleTheme está presente`, await evaluate('!!document.querySelector("[data-toggle-tema]")'))
    check(`${tema.id}: la barra queda visible sobre el contenido`, await evaluate(`(function(){var b=document.querySelector('.kt-barra');if(!b)return false;var r=b.getBoundingClientRect();return r.top<window.innerHeight&&r.bottom>0&&getComputedStyle(b).position==='fixed'})()`))
    check(`${tema.id}: la etiqueta dice el nombre del tema`, (await evaluate('document.querySelector("[data-etiqueta]")?.textContent')) === tema.nombre)
    check(`${tema.id}: el template quedó con noindex`, await evaluate(`document.querySelector('meta[name="robots"]')?.content?.includes('noindex')`))

    // El toggle avanza al siguiente template del ciclo.
    const siguiente = TEMAS[(i + 1) % TEMAS.length]
    await evaluate('document.querySelector("[data-toggle-tema]").click(); "ok"')
    await sleep(2500)
    check(`${tema.id}: el toggle lleva a ${siguiente.id}`, (await evaluate('location.pathname')) === rutaTema(siguiente.id))
    check(`${tema.id}: la elección queda guardada`, (await evaluate('localStorage.getItem("kuyen-tema")')) === siguiente.id)

    await goto(rutaTema(tema.id), 4000)
    await shot(`tema-${tema.id}-desktop`, { full: true })
  }

  // ---- Móvil
  await metrics(390, 844)
  await goto('/')
  check('selector sin desborde horizontal en móvil', await evaluate('document.documentElement.scrollWidth <= window.innerWidth'),
    await evaluate('document.documentElement.scrollWidth + "px de " + window.innerWidth'))
  await shot('selector-mobile', { full: true })

  await goto(rutaTema(TEMAS[0].id), 4000)
  check('la barra del toggle entra en pantalla chica', await evaluate(`(function(){var b=document.querySelector('.kt-barra');if(!b)return false;return b.getBoundingClientRect().width<=window.innerWidth})()`))
  await shot(`tema-${TEMAS[0].id}-mobile`)
} finally {
  ws.close()
  chrome.kill()
}

const fallas = results.filter((r) => !r[1])
console.log(`\n${results.length - fallas.length}/${results.length} comprobaciones OK`)
process.exit(fallas.length ? 1 : 0)
