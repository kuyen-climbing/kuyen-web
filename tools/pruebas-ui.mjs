/**
 * Pruebas de interacción y capturas con Chrome headless (protocolo de depuración).
 *
 *   node tools/build.mjs --out=dist
 *   node tools/serve.mjs dist --port=8100      (en otra terminal)
 *   npm run test:ui
 *
 * Comprueba el marco y el ToggleTheme: que arranque con el template por
 * defecto, que cada clic cargue el siguiente sin recargar la página de arriba,
 * que la elección se guarde y sobreviva a una recarga, y que cada template
 * cargue de verdad su contenido y sus assets.
 *
 * Deja una captura por template en dist-pruebas/.
 */
import { spawn } from 'node:child_process'
import { writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { tmpdir } from 'node:os'
import { TEMAS, TEMA_POR_DEFECTO, rutaTema } from '../src/site.config.mjs'

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
const goto = async (path, espera = 5000) => { await send('Page.navigate', { url: BASE + path }); await sleep(espera) }

async function shot(name, { full = false } = {}) {
  const params = { format: 'jpeg', quality: 72 }
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

/** El documento cargado dentro del marco. */
const dentro = (expr) => evaluate(`(function(){var d=document.getElementById('kt-marco').contentDocument;return ${expr}})()`)

const results = []
const check = (nombre, ok, detalle = '') => { results.push([nombre, ok, detalle]); console.log(ok ? 'OK   ' : 'FALLA', nombre, detalle) }

try {
  await metrics(1440, 900)
  await goto('/')
  // Chrome reusa su perfil entre corridas: sin esto la prueba arrancaría con
  // el template que quedó elegido la vez anterior.
  await evaluate('localStorage.removeItem("kuyen-tema"); "ok"')
  await goto('/')

  check('el marco tiene un solo h1', (await evaluate('document.querySelectorAll("h1").length')) === 1)
  check('el ToggleTheme está en el marco', await evaluate('!!document.querySelector("[data-tema-boton]")'))
  check('arranca con el template por defecto',
    (await evaluate('new URL(document.getElementById("kt-marco").src).pathname')) === rutaTema(TEMA_POR_DEFECTO))

  const urlArriba = await evaluate('location.href')

  for (let i = 0; i < TEMAS.length; i++) {
    const tema = TEMAS[i]

    check(`${tema.id}: la etiqueta del toggle lo nombra`,
      (await evaluate('document.querySelector("[data-tema-etiqueta]").textContent')) === tema.nombre)
    check(`${tema.id}: el contador muestra la posición`,
      (await evaluate('document.querySelector("[data-tema-contador]").textContent')) === `${i + 1}/${TEMAS.length}`)
    check(`${tema.id}: el pulsador se movió a su posición`,
      (await evaluate('document.querySelector("[data-tema-knob]").style.transform')).includes('translateX'))

    // El template cargado de verdad, con su contenido y sus assets.
    check(`${tema.id}: el template cargó su contenido`, (await dentro('d.body.innerText.trim().length')) > 800)
    check(`${tema.id}: el template trajo sus estilos`,
      (await dentro('getComputedStyle(d.body).fontFamily')).length > 0 &&
        (await dentro('getComputedStyle(d.body).fontFamily')) !== 'Times New Roman')
    check(`${tema.id}: sin imágenes rotas`, (await dentro('[].slice.call(d.images).filter(function(i){return i.complete && i.naturalWidth === 0}).length')) === 0,
      `${await dentro('d.images.length')} imágenes`)
    check(`${tema.id}: el router no cayó en su página de error`,
      !(await dentro('d.body.innerText')).match(/Page Not Found|404 - |Esta p[aá]gina no existe/i))

    await shot(`marco-${tema.id}`)

    await evaluate('document.querySelector("[data-tema-boton]").click(); "ok"')
    await sleep(5000)
  }

  check('cambiar de template no recarga la página de arriba', (await evaluate('location.href')) === urlArriba)
  check('vuelve al primero al completar el ciclo',
    (await evaluate('new URL(document.getElementById("kt-marco").src).pathname')) === rutaTema(TEMAS[0].id))

  // La elección sobrevive a la recarga.
  await evaluate('document.querySelector("[data-tema-boton]").click(); "ok"')
  await sleep(1500)
  const elegido = await evaluate('localStorage.getItem("kuyen-tema")')
  check('la elección queda guardada', elegido === TEMAS[1].id, String(elegido))
  await goto('/')
  check('la recarga abre con el template elegido',
    (await evaluate('new URL(document.getElementById("kt-marco").src).pathname')) === rutaTema(elegido))

  // Móvil.
  await metrics(390, 844)
  await goto('/')
  check('el toggle entra en pantalla chica',
    await evaluate(`(function(){var b=document.querySelector('.kt-barra');var r=b.getBoundingClientRect();return r.width<=window.innerWidth})()`))
  await shot('marco-mobile')
} finally {
  ws.close()
  chrome.kill()
}

const fallas = results.filter((r) => !r[1])
console.log(`\n${results.length - fallas.length}/${results.length} comprobaciones OK`)
process.exit(fallas.length ? 1 : 0)
