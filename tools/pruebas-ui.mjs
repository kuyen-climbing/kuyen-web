/**
 * Pruebas de interacción con Chrome headless (protocolo de depuración).
 *
 *   npm run dev          (en otra terminal)
 *   npm run test:ui
 *
 * El sitio es una sola página, servida en la raíz. Lo que se comprueba: un solo
 * <h1>, Rubik Dirt y Rubik cargadas desde el sitio, ningún pedido a otros
 * dominios al cargar, contraste AA en todos los textos, sin desborde de 375 a
 * 1440 px, ninguna grilla con un elemento solo en la última fila, ningún texto
 * encima de los gatos del logo, el menú móvil funcionando, el mapa y las
 * publicaciones de Instagram incrustados y con carga diferida, y el visor de
 * fotos abriendo, recorriendo su grupo y cerrando.
 *
 * No saca capturas: todo se comprueba leyendo el DOM y el resultado es solo
 * texto. La verificación visual la hace una persona en su Chrome.
 */
import { spawn } from 'node:child_process'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { VARIANTE } from '../src/site.config.mjs'

const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const PORT = 9333
const BASE = process.argv[2] || 'http://localhost:8100'

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
// Errores de JavaScript de la página abierta (y de lo que cargue su iframe).
const erroresJs = []
// Lo que el navegador bloquea por la política de seguridad de la página.
const bloqueosCsp = []
ws.onmessage = (m) => {
  const d = JSON.parse(m.data)
  if (d.method === 'Runtime.exceptionThrown') {
    const e = d.params.exceptionDetails
    erroresJs.push(e.exception?.description?.split('\n')[0] || e.text)
  }
  if (d.method === 'Log.entryAdded' && /Content Security Policy/.test(d.params.entry.text)) {
    bloqueosCsp.push(d.params.entry.text.slice(0, 160))
  }
  if (d.id && pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id) }
}
const send = (method, params = {}) =>
  new Promise((res) => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })) })
await send('Page.enable')
await send('Runtime.enable')
await send('Log.enable')
// Sin caché: el perfil de Chrome se reusa entre corridas y GitHub Pages manda
// max-age=600, así que contra el sitio publicado la prueba podía leer la
// versión anterior y fallar por algo que ya estaba corregido.
await send('Network.enable')
await send('Network.setCacheDisabled', { cacheDisabled: true })

const evaluate = async (expression) => {
  const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
  if (r.result?.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails))
  return r.result?.result?.value
}
const metrics = (width, height) =>
  send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width < 768 })
const goto = async (path, espera = 5000) => { await send('Page.navigate', { url: BASE + path }); await sleep(espera) }

/** Evalúa `expr` con `d` apuntando al documento de la página abierta. */
const PAGINA = 'document'
const en = (doc, expr) => evaluate(`(function(){var d=${doc};return ${expr}})()`)

const results = []
const check = (nombre, ok, detalle = '') => { results.push([nombre, ok, detalle]); console.log(ok ? 'OK   ' : 'FALLA', nombre, detalle) }

const DESBORDE = 'd.documentElement.scrollWidth <= d.documentElement.clientWidth'
const DETALLE_DESBORDE = "d.documentElement.scrollWidth + 'px de contenido en ' + d.documentElement.clientWidth + 'px'"

/**
 * Contraste WCAG de cada texto visible contra lo que tiene detrás: compone los
 * colores de fondo de sus ancestros (con su opacidad) y, si alguno tiene un
 * gradiente, toma el peor de sus tonos. Mínimo 4,5, o 3 para texto grande.
 * Salta lo oculto, lo inerte y lo decorativo (aria-hidden).
 */
const CONTRASTE = `(function () {
  var w = d.defaultView
  function color(s) {
    var m = s && s.match(/rgba?\\(([^)]*)\\)/)
    if (!m) return null
    var p = m[1].split(/[\\s,\\/]+/).filter(Boolean).map(parseFloat)
    return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1]
  }
  function paradas(s) { return (s.match(/rgba?\\([^)]*\\)/g) || []).map(color) }
  function mezclar(a, b) { var k = a[3]; return [a[0] * k + b[0] * (1 - k), a[1] * k + b[1] * (1 - k), a[2] * k + b[2] * (1 - k), 1] }
  function lum(c) {
    var v = [0, 1, 2].map(function (i) { var x = c[i] / 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4) })
    return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]
  }
  function razon(a, b) { var x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05) }
  function oculto(el) {
    if (el.getClientRects().length === 0) return true
    for (var n = el; n && n.nodeType === 1; n = n.parentElement) {
      var cs = w.getComputedStyle(n)
      if (n.getAttribute('aria-hidden') === 'true' || n.inert || cs.visibility === 'hidden' || parseFloat(cs.opacity) < 0.1) return true
    }
    return false
  }
  function fondos(el) {
    var capas = []
    for (var n = el; n && n.nodeType === 1; n = n.parentElement) capas.push(n)
    var bases = [[255, 255, 255, 1]]
    for (var i = capas.length - 1; i >= 0; i--) {
      var cs = w.getComputedStyle(capas[i])
      var c = color(cs.backgroundColor)
      if (c && c[3] > 0) bases = bases.map(function (b) { return mezclar(c, b) })
      if (cs.backgroundImage.indexOf('gradient') !== -1) bases = paradas(cs.backgroundImage).map(function (p) { return mezclar(p, bases[0]) })
    }
    return bases
  }
  var fallas = [], vistos = new Set(), nodo
  var recorrido = d.createTreeWalker(d.body, NodeFilter.SHOW_TEXT)
  while ((nodo = recorrido.nextNode())) {
    var el = nodo.parentElement
    if (!nodo.nodeValue.trim() || vistos.has(el) || /^(SCRIPT|STYLE|NOSCRIPT)$/.test(el.tagName)) continue
    vistos.add(el)
    if (oculto(el)) continue
    var cs = w.getComputedStyle(el)
    var tam = parseFloat(cs.fontSize), peso = parseInt(cs.fontWeight, 10)
    var minimo = tam >= 24 || (tam >= 18.66 && peso >= 700) ? 3 : 4.5
    var fg = color(cs.color)
    var peor = Math.min.apply(null, fondos(el).map(function (b) { return razon(mezclar(fg, b), b) }))
    if (peor < minimo) fallas.push('"' + nodo.nodeValue.trim().slice(0, 28) + '" ' + peor.toFixed(2) + ' (mínimo ' + minimo + ')')
  }
  return fallas
})()`

// El logo con los gatos tiene dos usos, y cada uno su regla.
//
// Como fondo del hero (.m-cordillera--fondo, desde el 22-09-2026) va a todo el
// ancho y el texto se lee encima a propósito: lo que se revisa es que quede
// detrás y bien atenuado. La prueba de contraste AA no lo cubre, porque solo
// mira los fondos de los ancestros y no una imagen que está detrás, así que la
// opacidad y el desenfoque son la garantía de que el texto se siga leyendo.
//
// En cualquier otro uso sigue valiendo la regla del 15-09-2026: ningún texto ni
// la marquesina lo tapan. Solo cuenta lo que se ve.
const SOBRE_GATOS = `(function () {
  var w = d.defaultView
  var cruza = function (a, b) { return Math.min(a.right, b.right) - Math.max(a.left, b.left) > 2 && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 2 }
  var textos = [].slice.call(d.querySelectorAll('h1, h2, h3, p, a, button, .m-marquesina')).filter(function (e) {
    var r = e.getBoundingClientRect()
    return r.width > 0 && r.height > 0 && !e.closest('[inert]') && w.getComputedStyle(e).visibility !== 'hidden'
  })
  var problemas = []
  d.querySelectorAll('.m-cordillera').forEach(function (g) {
    var cs = w.getComputedStyle(g)
    if (g.classList.contains('m-cordillera--fondo')) {
      var opacidad = parseFloat(cs.opacity)
      if (!(opacidad <= 0.4)) problemas.push('fondo con opacidad ' + cs.opacity)
      if (cs.filter.indexOf('blur(') === -1) problemas.push('fondo sin desenfoque')
      if (cs.pointerEvents !== 'none') problemas.push('fondo que atrapa el puntero')
      var capa = parseInt(cs.zIndex, 10) || 0
      textos.forEach(function (t) {
        if (!cruza(g.getBoundingClientRect(), t.getBoundingClientRect())) return
        var ct = w.getComputedStyle(t.closest('[style*="z-index"], [class]') || t)
        var suya = parseInt(ct.zIndex, 10)
        if (!isNaN(suya) && suya < capa) problemas.push('texto detrás del fondo: ' + String(t.className || t.tagName).split(' ')[0])
      })
      return
    }
    var rg = g.getBoundingClientRect()
    textos.forEach(function (t) { if (cruza(rg, t.getBoundingClientRect())) problemas.push('encima de los gatos: ' + String(t.className || t.tagName).split(' ')[0]) })
  })
  return problemas
})()`

// Una grilla de tres columnas con cuatro elementos deja el cuarto solo abajo,
// con dos huecos al lado, y se ve como un error de maquetación. Lo que se mide
// no es "cuántos hay en la última fila" sino cuánto ancho queda sin usar: un
// elemento que se lleva la fila entera está bien, uno que ocupa un tercio y
// deja dos huecos al lado, no. Se reclama si sobra más de media columna.
const HUERFANOS = `(function () {
  var w = d.defaultView
  var problemas = []
  d.querySelectorAll('*').forEach(function (caja) {
    var cs = w.getComputedStyle(caja)
    if (cs.display !== 'grid' || cs.gridTemplateAreas !== 'none') return
    var pistas = cs.gridTemplateColumns.split(' ').filter(Boolean)
    if (pistas.length < 2) return
    var hijos = [].slice.call(caja.children).filter(function (e) {
      var r = e.getBoundingClientRect()
      return r.width > 0 && r.height > 0 && w.getComputedStyle(e).position !== 'absolute'
    })
    if (hijos.length < 3) return

    // Dos hijos van en la misma fila si se cruzan verticalmente, no si empiezan
    // a la misma altura: con align-items: center cada uno arranca donde le toca
    // según su alto, y comparar el borde de arriba partiría una sola fila en tres.
    var filas = []
    hijos.forEach(function (e) {
      var r = e.getBoundingClientRect()
      var fila = filas.filter(function (f) { return Math.min(f.bottom, r.bottom) - Math.max(f.top, r.top) > 1 })[0]
      if (fila) {
        fila.ancho += r.width
        fila.n++
        fila.top = Math.min(fila.top, r.top)
        fila.bottom = Math.max(fila.bottom, r.bottom)
      } else filas.push({ top: r.top, bottom: r.bottom, ancho: r.width, n: 1 })
    })
    if (filas.length < 2) return

    var separacion = parseFloat(cs.columnGap) || 0
    var interior = caja.getBoundingClientRect().width -
      (parseFloat(cs.paddingLeft) || 0) - (parseFloat(cs.paddingRight) || 0)
    var columna = (interior - separacion * (pistas.length - 1)) / pistas.length
    var ultima = filas[filas.length - 1]
    var usado = ultima.ancho + separacion * (ultima.n - 1)
    var sobra = interior - usado
    if (sobra > columna * 0.5) {
      problemas.push(String(caja.className || caja.tagName).split(' ')[0] +
        ' (' + hijos.length + ' en ' + pistas.length + ' columnas, sobran ' + Math.round(sobra) + 'px)')
    }
  })
  return problemas
})()`

// Todas las fotos de contenido se pueden ampliar: visor.js les pone role de
// botón y foco por tabulación. Las decorativas (alt vacío) quedan fuera a
// propósito, porque son capas de fondo con texto encima.
const FOTOS_AMPLIABLES = `(function () {
  var fotos = [].slice.call(d.querySelectorAll('img[src^="/img/fotos/"]')).filter(function (i) {
    if (!i.getAttribute('alt')) return false
    for (var n = i; n && n.nodeType === 1; n = n.parentElement) {
      if (n.getAttribute('aria-hidden') === 'true') return false
      if (n.tagName === 'A' && n.getAttribute('href')) return false
    }
    return true
  })
  var w = d.defaultView
  var sinVisor = fotos.filter(function (i) { return i.getAttribute('role') !== 'button' || i.getAttribute('tabindex') !== '0' })
  // La señal al pasar el mouse es la foto que crece dentro de un marco que se
  // enciende, no el cursor de lupa del navegador.
  var conLupa = fotos.filter(function (i) { return w.getComputedStyle(i).cursor === 'zoom-in' })
  var sinMarco = fotos.filter(function (i) { return !i.parentElement || !i.parentElement.classList.contains('visor-marco') })
  return { total: fotos.length, sinVisor: sinVisor.length, conLupa: conLupa.length, sinMarco: sinMarco.length }
})()`

/** Lo que tiene que cumplir cualquier variante propia. */
async function revisarVariante(doc, p) {
  check(`${p}: un solo h1`, (await en(doc, 'd.querySelectorAll("h1").length')) === 1)
  const sobreGatos = await en(doc, SOBRE_GATOS)
  check(`${p}: el logo con los gatos, atenuado y detrás del texto`, sobreGatos.length === 0, sobreGatos.slice(0, 4).join(', '))
  const fuentes = await en(doc, `d.fonts.ready.then(function () {
    var f = Array.from(d.fonts)
    return {
      errores: f.filter(function (x) { return x.status === 'error' }).length,
      cargadas: f.filter(function (x) { return x.status === 'loaded' }).map(function (x) { return x.family.replace(/"/g, '') })
    }
  })`)
  const cargadas = [...new Set(fuentes.cargadas)]
  check(`${p}: Rubik Dirt y Rubik cargan desde el sitio`,
    fuentes.errores === 0 && cargadas.includes('Rubik Dirt') && cargadas.includes('Rubik'), cargadas.join(', '))
  const ajenos = await en(doc, `d.defaultView.performance.getEntriesByType('resource')
    .map(function (e) { return new URL(e.name).host })
    .filter(function (h) { return h !== d.location.host })`)
  check(`${p}: no pide nada a otros dominios al cargar`, ajenos.length === 0, [...new Set(ajenos)].join(', '))
  // Los textos y fotos que aparecen al entrar en pantalla están invisibles hasta
  // entonces: se recorre la página entera antes de medir el contraste.
  await en(doc, `(async function () {
    var w = d.defaultView
    var max = d.documentElement.scrollHeight - w.innerHeight
    for (var y = 0; y <= max + 400; y += 400) {
      w.scrollTo(0, Math.min(y, max))
      await new Promise(function (r) { setTimeout(r, 110) })
    }
    return true
  })()`)
  await sleep(2000)
  const sinAparecer = await en(doc, `[].slice.call(d.querySelectorAll('[data-m-revelar], [data-m-aparece], .m-foto'))
    .filter(function (e) { return !e.classList.contains('m-visible') })
    .map(function (e) { return e.className.split(' ')[0] })`)
  check(`${p}: todo lo que entra al hacer scroll termina visible`, sinAparecer.length === 0,
    sinAparecer.length ? `${sinAparecer.length} sin aparecer: ${[...new Set(sinAparecer)].join(', ')}` : '')
  // La entrada del hero espera la foto principal o 1,2 s: pasado eso, tiene que haber terminado.
  const entradasPendientes = await en(doc, `[].slice.call(d.querySelectorAll('[data-m-entrada]'))
    .filter(function (e) { return !e.classList.contains('m-listo') }).length`)
  check(`${p}: la entrada del hero termina`, entradasPendientes === 0, entradasPendientes ? `${entradasPendientes} sin terminar` : '')
  // Con la página bajada hasta el final, la cabecera sigue arriba y a la vista.
  const cabecera = await en(doc, `(function () {
    var c = d.querySelector('[data-cabecera]')
    if (!c) return 'la página no marca su cabecera con data-cabecera'
    var b = c.getBoundingClientRect()
    return d.defaultView.scrollY > 0 && b.top >= 0 && b.top < 20 && b.height > 0 ? '' : 'queda en y=' + Math.round(b.top)
  })()`)
  check(`${p}: la cabecera queda a la vista al hacer scroll`, cabecera === '', cabecera)
  await en(doc, '(d.defaultView.scrollTo(0, 0), true)')
  const fallas = await en(doc, CONTRASTE)
  check(`${p}: contraste AA en todos los textos`, fallas.length === 0, fallas.slice(0, 4).join(' | '))
  check(`${p}: no se desborda a lo ancho`, await en(doc, DESBORDE), await en(doc, DETALLE_DESBORDE))
}

try {
  await metrics(1440, 900)
  await goto('/', 2500)
  await revisarVariante(PAGINA, '/')

  // El sitio en los anchos del estándar INCBA, y sus interacciones en móvil.
  {
    for (const ancho of [375, 640, 768, 1024, 1440]) {
      await metrics(ancho, 900)
      await goto('/', 2000)
      check(`a ${ancho} px: no se desborda a lo ancho`, await en(PAGINA, DESBORDE), await en(PAGINA, DETALLE_DESBORDE))
      const encima = await en(PAGINA, SOBRE_GATOS)
      check(`a ${ancho} px: el logo con los gatos, atenuado y detrás del texto`, encima.length === 0, encima.slice(0, 4).join(', '))
      const huerfanos = await en(PAGINA, HUERFANOS)
      check(`a ${ancho} px: ninguna grilla deja un elemento solo en la última fila`,
        huerfanos.length === 0, [...new Set(huerfanos)].slice(0, 4).join(' | '))
    }

    await metrics(375, 812)
    erroresJs.length = 0
    bloqueosCsp.length = 0
    await goto('/', 2000)
    check(`sin errores de JavaScript al cargar`, erroresJs.length === 0, erroresJs.slice(0, 3).join(' | '))
    // Toda la página, de a una pantalla, para que carguen el mapa y las
    // publicaciones, que van con loading="lazy".
    await en(PAGINA, `new Promise(function (listo) {
      var y = 0
      ;(function paso() {
        window.scrollTo(0, y += innerHeight)
        if (y < d.documentElement.scrollHeight) setTimeout(paso, 150)
        else listo(true)
      })()
    })`)
    await sleep(3000)
    check(`la política de seguridad no bloquea nada de la página`, bloqueosCsp.length === 0, bloqueosCsp.slice(0, 3).join(' | '))
    await en(PAGINA, '(window.scrollTo(0, 0), true)')
    await sleep(500)
    if (await en(PAGINA, '!!d.querySelector("[data-menu-abrir]")')) {
      await en(PAGINA, '(d.querySelector("[data-menu-abrir]").click(), true)')
      await sleep(700)
      check(`a 375 px: el menú móvil se abre`,
        await en(PAGINA, 'd.querySelector("[data-menu]").classList.contains("abierto") && !d.querySelector("[data-menu]").inert'))
      await en(PAGINA, '(d.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" })), true)')
      await sleep(700)
      check(`a 375 px: el menú móvil se cierra con Escape`,
        await en(PAGINA, '!d.querySelector("[data-menu]").classList.contains("abierto") && d.querySelector("[data-menu]").inert'))
    }
    // Desde el 22-09-2026 el mapa y las publicaciones vienen incrustados y no
    // esperan un clic. Lo que se revisa es que estén en la página, que apunten a
    // donde tienen que apuntar y que lleven loading="lazy", que es lo que evita
    // que la primera pantalla le pida algo a Google o a Instagram.
    const incrustados = await en(PAGINA, `[].slice.call(d.querySelectorAll('iframe')).map(function (m) {
      return { src: m.getAttribute('src') || '', lazy: m.getAttribute('loading') === 'lazy' }
    })`)
    const mapaIncrustado = incrustados.filter((m) => m.src.includes('google.com/maps'))
    const publicaciones = incrustados.filter((m) => m.src.includes('instagram.com/'))
    check(`el mapa viene incrustado, sin clic`, mapaIncrustado.length === 1, `${mapaIncrustado.length} mapas`)
    check(`las publicaciones de Instagram vienen incrustadas, sin clic`,
      publicaciones.length === 3, `${publicaciones.length} publicaciones`)
    // Las reseñas se publican citando Google: la ficha tiene que estar enlazada,
    // que es lo que sostiene la nota y deja comprobarlas.
    check(`la nota de Google enlaza a la ficha`,
      await en(PAGINA, `!!d.querySelector('a[href*="maps.app.goo.gl"], a[href*="google.com/maps"]')`))

    check(`el mapa y las publicaciones van con loading lazy`,
      [...mapaIncrustado, ...publicaciones].every((m) => m.lazy),
      [...mapaIncrustado, ...publicaciones].filter((m) => !m.lazy).map((m) => m.src).join(', '))

    // Visor de fotos (25-09-2026): cualquier foto de contenido se amplía y las
    // flechas recorren las de su grupo.
    await metrics(1440, 900)
    await goto('/', 2000)
    const ampliables = await en(PAGINA, FOTOS_AMPLIABLES)
    check(`todas las fotos de contenido se pueden ampliar`,
      ampliables.total > 0 && ampliables.sinVisor === 0, `${ampliables.sinVisor} de ${ampliables.total} sin visor`)
    check(`las fotos avisan con su marco y no con el cursor de lupa`,
      ampliables.conLupa === 0 && ampliables.sinMarco === 0,
      `${ampliables.conLupa} con lupa, ${ampliables.sinMarco} sin marco`)
    check(`el visor no deja nada en la página hasta que se abre`,
      await en(PAGINA, '!d.querySelector(".visor")'))
    // Una galería de tres va en una sola fila desde 1024 px: la regla que
    // reparte la tercera cuando hay dos columnas no puede pasarse de ancho.
    const galeriaTres = await en(PAGINA, `(function () {
      var fila = d.querySelector('.m-galeria--tres')
      if (!fila) return 'sin galería de tres'
      var cajas = [].slice.call(fila.children).map(function (c) { return c.getBoundingClientRect() })
      return cajas.every(function (r) { return Math.min(r.bottom, cajas[0].bottom) - Math.max(r.top, cajas[0].top) > 1 })
    })()`)
    if (galeriaTres !== 'sin galería de tres') {
      check('a 1440 px: la galería de tres va en una sola fila', galeriaTres === true)
    }

    // Se abre la segunda foto de una galería de cuatro, que es donde el carrusel
    // tiene hacia dónde moverse en los dos sentidos.
    const abierto = await en(PAGINA, `(function () {
      var fila = d.querySelector('.m-galeria--cuatro')
      if (!fila) return 'no hay una galería de cuatro'
      var img = fila.querySelectorAll('img')[1]
      img.setAttribute('data-prueba-origen', '1')
      img.click()
      var v = d.querySelector('.visor.visor--abierto')
      if (!v) return 'el visor no se abrió'
      var grande = v.querySelector('[data-visor-foto]').getAttribute('src') || ''
      return {
        h1: d.querySelectorAll('h1').length,
        dialogo: v.getAttribute('role') + '/' + v.getAttribute('aria-modal'),
        grande: /-1600\\.webp$/.test(grande),
        contador: v.querySelector('[data-visor-contador]').textContent,
        foco: d.activeElement === v.querySelector('[data-visor-cerrar]'),
      }
    })()`)
    check(`el visor abre la foto en grande`,
      typeof abierto === 'object' && abierto.dialogo === 'dialog/true' && abierto.grande && abierto.h1 === 1 && abierto.foco,
      JSON.stringify(abierto))
    check(`el visor cuenta las fotos del grupo, no las de la página`,
      typeof abierto === 'object' && abierto.contador === '2 de 4', typeof abierto === 'object' ? abierto.contador : String(abierto))

    await en(PAGINA, '(d.querySelector("[data-visor-siguiente]").click(), true)')
    await sleep(300)
    check(`la flecha siguiente avanza en el grupo`,
      (await en(PAGINA, 'd.querySelector("[data-visor-contador]").textContent')) === '3 de 4')

    await en(PAGINA, '(d.querySelector(".visor").dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })), true)')
    // El cierre se funde en 320 ms: hay que esperar a que termine para mirar
    // cómo queda oculto.
    await sleep(600)
    const cerrado = await en(PAGINA, `(function () {
      var v = d.querySelector('.visor')
      return {
        abierto: v.classList.contains('visor--abierto'),
        cuerpo: d.body.classList.contains('visor-abierto'),
        foco: d.activeElement === d.querySelector('[data-prueba-origen]'),
      }
    })()`)
    check(`Escape cierra el visor y el foco vuelve a la foto`,
      !cerrado.abierto && !cerrado.cuerpo && cerrado.foco, JSON.stringify(cerrado))
    // Cerrado se funde hasta desaparecer: queda en el DOM, pero oculto, sin
    // opacidad y sin atrapar clics.
    const oculto = await en(PAGINA, `(function () {
      var cs = getComputedStyle(d.querySelector('.visor'))
      return { visibilidad: cs.visibility, opacidad: cs.opacity, puntero: cs.pointerEvents }
    })()`)
    check(`el visor cerrado no se ve ni atrapa clics`,
      oculto.visibilidad === 'hidden' && oculto.opacidad === '0' && oculto.puntero === 'none',
      JSON.stringify(oculto))
  }
} finally {
  ws.close()
  chrome.kill()
}

const fallas = results.filter((r) => !r[1])
console.log(`\n${results.length - fallas.length}/${results.length} comprobaciones OK`)
process.exit(fallas.length ? 1 : 0)
