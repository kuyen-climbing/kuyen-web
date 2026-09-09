/**
 * Compara la copia local de cada template contra el original en línea.
 *
 *   node tools/build.mjs --out=dist
 *   node tools/serve.mjs dist --port=8100          (en otra terminal)
 *   node --experimental-websocket tools/comparar-tema.mjs [http://localhost:8100]
 *
 * Toma la misma captura de pantalla completa de los dos, las superpone en un
 * canvas y cuenta qué proporción de píxeles difiere. Deja las dos imágenes y el
 * mapa de diferencias en dist-comparacion/, para poder mirar dónde falla.
 *
 * Nunca da 0: los templates tienen animaciones, videos y contenido que cambia
 * de una carga a otra. Sirve para detectar lo que importa, que es una sección
 * que no cargó, una tipografía que no llegó o un bloque en blanco.
 */
import { spawn } from 'node:child_process'
import { writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { tmpdir } from 'node:os'
import { TEMAS, rutaTema } from '../src/site.config.mjs'

const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const PORT = 9355
const BASE = process.argv[2] || 'http://localhost:8100'
const ANCHO = 1440
const ALTO = 900
const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist-comparacion')
mkdirSync(OUT, { recursive: true })

// Umbral por canal para considerar que un píxel cambió, y proporción de
// píxeles distintos a partir de la cual conviene mirar la captura.
const TOLERANCIA_CANAL = 24
const MAXIMO_DIFERENCIA = 0.06

const chrome = spawn(
  CHROME,
  [
    '--headless=new', '--disable-gpu', '--hide-scrollbars', `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${join(tmpdir(), 'kuyen-comparacion')}`,
    `--window-size=${ANCHO},${ALTO}`, 'about:blank',
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
await send('Emulation.setDeviceMetricsOverride', { width: ANCHO, height: ALTO, deviceScaleFactor: 1, mobile: false })

const evaluate = async (expression) => {
  const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
  if (r.result?.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails))
  return r.result?.result?.value
}

/** Carga una URL, la recorre entera y devuelve la captura completa en base64. */
async function captura(url, alto) {
  await send('Page.navigate', { url })
  await sleep(6000)
  await evaluate(
    `(async()=>{const h=document.body.scrollHeight;for(let y=0;y<h;y+=600){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,120))}window.scrollTo(0,0);await new Promise(r=>setTimeout(r,1200));return 'ok'})()`
  )
  const altoReal = alto || Math.min(await evaluate('document.documentElement.scrollHeight'), 12000)
  const r = await send('Page.captureScreenshot', {
    format: 'png',
    clip: { x: 0, y: 0, width: ANCHO, height: altoReal, scale: 1 },
    captureBeyondViewport: true,
  })
  return { datos: r.result.data, alto: altoReal }
}

/** Superpone las dos capturas en un canvas y cuenta los píxeles distintos. */
async function diferencia(a, b) {
  await send('Page.navigate', { url: 'about:blank' })
  await sleep(400)
  const expr = `(async () => {
    const cargar = (d) => new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.src = 'data:image/png;base64,' + d })
    const ia = await cargar(${JSON.stringify(a)})
    const ib = await cargar(${JSON.stringify(b)})
    const w = Math.min(ia.width, ib.width), h = Math.min(ia.height, ib.height)
    const lienzo = (img) => { const c = document.createElement('canvas'); c.width = w; c.height = h; c.getContext('2d').drawImage(img, 0, 0); return c.getContext('2d').getImageData(0, 0, w, h).data }
    const da = lienzo(ia), db = lienzo(ib)
    const salida = document.createElement('canvas'); salida.width = w; salida.height = h
    const ctx = salida.getContext('2d'); const mapa = ctx.createImageData(w, h)
    let distintos = 0
    for (let i = 0; i < da.length; i += 4) {
      const d = Math.max(Math.abs(da[i] - db[i]), Math.abs(da[i+1] - db[i+1]), Math.abs(da[i+2] - db[i+2]))
      const cambio = d > ${TOLERANCIA_CANAL}
      if (cambio) distintos++
      mapa.data[i] = cambio ? 255 : da[i]
      mapa.data[i+1] = cambio ? 0 : da[i+1]
      mapa.data[i+2] = cambio ? 0 : da[i+2]
      mapa.data[i+3] = cambio ? 255 : 60
    }
    ctx.putImageData(mapa, 0, 0)
    return { proporcion: distintos / (w * h), alto: h, mapa: salida.toDataURL('image/png').split(',')[1] }
  })()`
  return evaluate(expr)
}

const resultados = []
try {
  for (const tema of TEMAS) {
    process.stdout.write(`${tema.nombre}: capturando el original... `)
    const original = await captura(tema.fuente)
    process.stdout.write('la copia... ')
    const copia = await captura(BASE + rutaTema(tema.id), original.alto)

    const d = await diferencia(original.datos, copia.datos)
    resultados.push([tema, d.proporcion])

    writeFileSync(join(OUT, `${tema.id}-original.png`), Buffer.from(original.datos, 'base64'))
    writeFileSync(join(OUT, `${tema.id}-copia.png`), Buffer.from(copia.datos, 'base64'))
    writeFileSync(join(OUT, `${tema.id}-diferencia.png`), Buffer.from(d.mapa, 'base64'))

    const pct = (d.proporcion * 100).toFixed(2)
    console.log(`${d.proporcion <= MAXIMO_DIFERENCIA ? 'OK   ' : 'REVISAR'} ${pct}% de píxeles distintos sobre ${ANCHO}x${d.alto}`)
  }
} finally {
  ws.close()
  chrome.kill()
}

const malos = resultados.filter(([, p]) => p > MAXIMO_DIFERENCIA)
console.log(`\n${resultados.length - malos.length}/${resultados.length} templates dentro del ${MAXIMO_DIFERENCIA * 100}% de diferencia`)
console.log(`Capturas y mapas de diferencia en ${OUT}`)
process.exit(malos.length ? 1 : 0)
