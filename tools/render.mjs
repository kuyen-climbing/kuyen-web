/**
 * Devuelve el HTML ya renderizado de una URL, usando el Chrome instalado en
 * modo headless por el protocolo de depuración (la misma plumbing que
 * tools/pruebas-ui.mjs, sin dependencias).
 *
 * Hace falta para los templates que arman el DOM en el navegador: bajar su
 * HTML con fetch devuelve un cascarón vacío.
 *
 * Node 20 necesita --experimental-websocket para tener WebSocket global.
 */
import { spawn } from 'node:child_process'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

export async function renderHtml(url, { puerto = 9444, espera = 6000, ancho = 1440, alto = 900 } = {}) {
  if (typeof WebSocket === 'undefined') {
    throw new Error('falta WebSocket: correr node con --experimental-websocket')
  }

  const chrome = spawn(
    CHROME,
    [
      '--headless=new',
      '--disable-gpu',
      '--hide-scrollbars',
      `--remote-debugging-port=${puerto}`,
      `--user-data-dir=${join(tmpdir(), 'kuyen-captura')}`,
      `--window-size=${ancho},${alto}`,
      'about:blank',
    ],
    { stdio: 'ignore' }
  )

  try {
    let wsUrl = null
    for (let i = 0; i < 100 && !wsUrl; i++) {
      try {
        const tabs = await (await fetch(`http://localhost:${puerto}/json`)).json()
        const t = tabs.find((t) => t.type === 'page')
        if (t) wsUrl = t.webSocketDebuggerUrl
      } catch {}
      if (!wsUrl) await sleep(200)
    }
    if (!wsUrl) throw new Error('Chrome no respondió')

    const ws = new WebSocket(wsUrl)
    await new Promise((r) => (ws.onopen = r))
    let id = 0
    const pendientes = new Map()
    ws.onmessage = (m) => {
      const d = JSON.parse(m.data)
      if (d.id && pendientes.has(d.id)) {
        pendientes.get(d.id)(d)
        pendientes.delete(d.id)
      }
    }
    const send = (method, params = {}) =>
      new Promise((res) => {
        const i = ++id
        pendientes.set(i, res)
        ws.send(JSON.stringify({ id: i, method, params }))
      })

    await send('Page.enable')
    await send('Runtime.enable')
    await send('Page.navigate', { url })
    await sleep(espera)

    // Un scroll hasta el pie para que se dispare lo que carga al aparecer en
    // pantalla (imágenes diferidas, animaciones de entrada), y de vuelta arriba.
    await send('Runtime.evaluate', {
      expression: `(async()=>{const h=document.body.scrollHeight;for(let y=0;y<h;y+=600){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,120))}window.scrollTo(0,0);await new Promise(r=>setTimeout(r,600));return 'ok'})()`,
      awaitPromise: true,
      returnByValue: true,
    })

    const r = await send('Runtime.evaluate', {
      expression: 'document.documentElement.outerHTML',
      returnByValue: true,
    })
    ws.close()
    const html = r.result?.result?.value
    if (!html) throw new Error('no se pudo leer el DOM')
    return '<!DOCTYPE html>\n' + html
  } finally {
    chrome.kill()
  }
}
