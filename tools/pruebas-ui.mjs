/**
 * Pruebas de interacción y capturas con Chrome headless (protocolo de depuración).
 *
 *   node tools/build.mjs --out=dist
 *   node tools/serve.mjs dist --port=8100      (en otra terminal)
 *   npm run test:ui
 *
 * Lo que comprueba es el ToggleTheme: que cicle los cuatro temas sobre la misma
 * página sin navegar, que cada tema cambie de verdad color y tipografía, que la
 * elección sobreviva a una recarga y que el menú móvil siga funcionando.
 * Deja una captura por tema en dist-pruebas/.
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
const goto = async (path, espera = 1800) => { await send('Page.navigate', { url: BASE + path }); await sleep(espera) }

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

/** Lo que define visualmente a un tema: fondo, texto, primario y tipografía del título. */
const estilos = () =>
  evaluate(`(function(){
    var b = getComputedStyle(document.body)
    var h1 = document.querySelector('h1')
    return {
      clase: document.documentElement.className,
      fondo: b.backgroundColor,
      texto: b.color,
      cuerpoFuente: b.fontFamily,
      tituloFuente: h1 ? getComputedStyle(h1).fontFamily : '',
      tituloTracking: h1 ? getComputedStyle(h1).letterSpacing : '',
      primario: getComputedStyle(document.querySelector('a[href^="https://wa.me"]')).backgroundColor,
      radio: getComputedStyle(document.querySelector('.rounded-tema')).borderRadius
    }
  })()`)

const results = []
const check = (nombre, ok, detalle = '') => { results.push([nombre, ok, detalle]); console.log(ok ? 'OK   ' : 'FALLA', nombre, detalle) }

try {
  await metrics(1440, 900)
  await goto('/')
  // Chrome reusa su perfil entre corridas: sin esto la prueba arrancaría con
  // el tema que quedó elegido la vez anterior.
  await evaluate('localStorage.removeItem("kuyen-tema"); "ok"')
  await goto('/')

  check('la página tiene un solo h1', (await evaluate('document.querySelectorAll("h1").length')) === 1)
  check('arranca con el tema por defecto', (await evaluate('document.documentElement.classList.contains("tema-' + TEMA_POR_DEFECTO + '")')))
  check('el ToggleTheme está en la página', await evaluate('!!document.querySelector("[data-tema-boton]")'))

  // Un ciclo completo: cada clic pasa al siguiente tema, sin navegar.
  const urlInicial = await evaluate('location.href')
  const vistos = []
  for (let i = 0; i < TEMAS.length; i++) {
    const tema = TEMAS[i]
    const est = await estilos()

    check(`${tema.id}: la clase del tema está en <html>`, est.clase.includes('tema-' + tema.id), est.clase)
    check(`${tema.id}: la etiqueta del toggle lo nombra`, (await evaluate('document.querySelector("[data-tema-etiqueta]").textContent')) === tema.nombre)
    check(`${tema.id}: el pulsador se movió a su posición`, (await evaluate('document.querySelector("[data-tema-knob]").style.transform')).includes('translateX'))
    vistos.push({ id: tema.id, ...est })

    await shot(`tema-${tema.id}-desktop`, { full: true })

    await evaluate('document.querySelector("[data-tema-boton]").click(); "ok"')
    await sleep(400)
  }

  check('cambiar de tema no navega', (await evaluate('location.href')) === urlInicial)
  check('vuelve al primer tema al completar el ciclo', await evaluate('document.documentElement.classList.contains("tema-' + TEMAS[0].id + '")'))

  // Cada tema tiene que verse distinto de los demás, no solo llamarse distinto.
  const firmas = vistos.map((v) => [v.fondo, v.texto, v.primario, v.tituloFuente, v.tituloTracking].join('|'))
  check('los cuatro temas se ven distintos entre sí', new Set(firmas).size === TEMAS.length,
    `${new Set(firmas).size} combinaciones distintas de ${TEMAS.length}`)
  const fuentes = new Set(vistos.map((v) => v.tituloFuente.split(',')[0].trim()))
  check('los temas usan tipografías de título distintas', fuentes.size >= 3, [...fuentes].join(' / '))

  // La elección sobrevive a la recarga.
  await evaluate('document.querySelector("[data-tema-boton]").click(); "ok"')
  await sleep(300)
  const elegido = await evaluate('localStorage.getItem("kuyen-tema")')
  await goto('/')
  check('la elección sobrevive a recargar', (await evaluate('localStorage.getItem("kuyen-tema")')) === elegido)
  check('la recarga abre con el tema elegido', await evaluate(`document.documentElement.classList.contains('tema-' + ${JSON.stringify(elegido)})`))

  // Capturas de referencia: el template original de cada tema.
  for (const tema of TEMAS) {
    const res = await evaluate(`fetch(${JSON.stringify(rutaTema(tema.id))}).then(r => r.status)`)
    check(`la referencia ${rutaTema(tema.id)} responde`, res === 200, String(res))
  }

  // Móvil.
  await metrics(390, 844)
  await goto('/')
  check('sin desborde horizontal en móvil', await evaluate('document.documentElement.scrollWidth <= window.innerWidth'),
    await evaluate('document.documentElement.scrollWidth + "px de " + window.innerWidth'))
  check('el toggle sigue visible en móvil', await evaluate(`(function(){var b=document.querySelector('[data-tema-boton]');var r=b.getBoundingClientRect();return r.width>0&&r.right<=window.innerWidth})()`))
  check('menú móvil cerrado al cargar', await evaluate(`getComputedStyle(document.getElementById('menu-movil')).display === 'none'`))
  await evaluate('document.querySelector("[data-mobile-toggle]").click(); "ok"')
  await sleep(300)
  check('el menú móvil se abre', await evaluate(`getComputedStyle(document.getElementById('menu-movil')).display === 'flex'`))
  await shot('menu-mobile')
  await evaluate('document.querySelector("[data-mobile-overlay]").click(); "ok"')
  await sleep(300)
  await shot('sitio-mobile', { full: true })
} finally {
  ws.close()
  chrome.kill()
}

const fallas = results.filter((r) => !r[1])
console.log(`\n${results.length - fallas.length}/${results.length} comprobaciones OK`)
process.exit(fallas.length ? 1 : 0)
