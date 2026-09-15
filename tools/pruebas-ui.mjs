/**
 * Pruebas de interacción con Chrome headless (protocolo de depuración).
 *
 *   npm run dev          (en otra terminal)
 *   npm run test:ui
 *
 * Comprueba el marco y el ToggleTheme: que arranque con el template por
 * defecto, que cada clic cargue el siguiente sin recargar la página de arriba,
 * que la elección se guarde y sobreviva a una recarga, y que cada /t/<id> cargue
 * de verdad su contenido y sus assets.
 *
 * Si /t/<id> es una variante propia, además: un solo <h1>, Rubik Dirt y Rubik
 * cargadas desde el sitio, ningún pedido a otros dominios al cargar, contraste AA
 * en todos los textos, sin desborde de 375 a 1440 px, ningún texto encima de los
 * gatos del logo, y el menú móvil y el mapa funcionando. Si es una captura, sus
 * ajustes.
 *
 * No saca capturas: todo se comprueba leyendo el DOM y el resultado es solo
 * texto. La verificación visual la hace una persona en su Chrome.
 */
import { spawn } from 'node:child_process'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { TEMAS, TEMA_POR_DEFECTO, rutaTema } from '../src/site.config.mjs'
import { tieneVariante } from './build.mjs'

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
ws.onmessage = (m) => {
  const d = JSON.parse(m.data)
  if (d.method === 'Runtime.exceptionThrown') {
    const e = d.params.exceptionDetails
    erroresJs.push(e.exception?.description?.split('\n')[0] || e.text)
  }
  if (d.id && pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id) }
}
const send = (method, params = {}) =>
  new Promise((res) => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })) })
await send('Page.enable')
await send('Runtime.enable')
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

/** Evalúa `expr` con `d` apuntando a un documento: el que carga el marco o la página abierta. */
const MARCO = "document.getElementById('kt-marco').contentDocument"
const PAGINA = 'document'
const en = (doc, expr) => evaluate(`(function(){var d=${doc};return ${expr}})()`)
const dentro = (expr) => en(MARCO, expr)

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

// Textos o marquesina encima de la cordillera con los gatos del logo. Solo cuenta
// lo que se ve: los elementos ocultos o inertes no tapan nada.
const SOBRE_GATOS = `(function () {
  var cruza = function (a, b) { return Math.min(a.right, b.right) - Math.max(a.left, b.left) > 2 && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 2 }
  var textos = [].slice.call(d.querySelectorAll('h1, h2, h3, p, a, button, .m-marquesina')).filter(function (e) {
    var r = e.getBoundingClientRect()
    return r.width > 0 && r.height > 0 && !e.closest('[inert]') && d.defaultView.getComputedStyle(e).visibility !== 'hidden'
  })
  var encima = []
  d.querySelectorAll('.m-cordillera').forEach(function (g) {
    var rg = g.getBoundingClientRect()
    textos.forEach(function (t) { if (cruza(rg, t.getBoundingClientRect())) encima.push(String(t.className || t.tagName).split(' ')[0]) })
  })
  return encima
})()`

/** Lo que tiene que cumplir cualquier variante propia. */
async function revisarVariante(doc, p) {
  check(`${p}: un solo h1`, (await en(doc, 'd.querySelectorAll("h1").length')) === 1)
  const sobreGatos = await en(doc, SOBRE_GATOS)
  check(`${p}: ningún texto ni la marquesina tapan a los gatos`, sobreGatos.length === 0, sobreGatos.slice(0, 4).join(', '))
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
  await goto('/')
  // Chrome reusa su perfil entre corridas: sin esto la prueba arrancaría con
  // el template que quedó elegido la vez anterior.
  await evaluate('localStorage.removeItem("kuyen-tema"); "ok"')
  await goto('/')

  check('el marco tiene un solo h1', (await evaluate('document.querySelectorAll("h1").length')) === 1)
  check('el ToggleTheme está en el marco', await evaluate('!!document.querySelector("[data-tema-boton]")'))
  check('arranca con el template por defecto',
    (await evaluate('new URL(document.getElementById("kt-marco").src).pathname')) === rutaTema(TEMA_POR_DEFECTO))

  // A la izquierda, a 1rem del borde, y con su centro en el centro vertical de la pantalla.
  const POSICION_TOGGLE = `(function(){
    var r = document.querySelector('[data-tema-boton]').getBoundingClientRect()
    var centrado = Math.abs(r.top + r.height / 2 - window.innerHeight / 2) <= 1
    var izquierda = Math.abs(r.left - 16) <= 1
    return centrado && izquierda
  })()`
  check('el toggle queda a la izquierda y centrado verticalmente', await evaluate(POSICION_TOGGLE),
    await evaluate(`(function(){var r=document.querySelector('[data-tema-boton]').getBoundingClientRect();return 'left ' + r.left + 'px, centro ' + (r.top + r.height / 2) + 'px de ' + window.innerHeight})()`))

  const urlArriba = await evaluate('location.href')

  for (let i = 0; i < TEMAS.length; i++) {
    const tema = TEMAS[i]
    const esVariante = tieneVariante(tema.id)
    const que = esVariante ? 'la variante' : 'el template'

    const siguiente = TEMAS[(i + 1) % TEMAS.length]
    check(`${tema.id}: el title del toggle nombra el template activo`,
      (await evaluate('document.querySelector("[data-tema-boton]").title')) === `Template ${tema.nombre}`)
    check(`${tema.id}: el aria-label anuncia el siguiente, como en PP`,
      (await evaluate('document.querySelector("[data-tema-boton]").getAttribute("aria-label")')) === `Cambiar a Template ${siguiente.nombre}`)
    check(`${tema.id}: el pulsador está en su posición`,
      (await evaluate('document.querySelector("[data-tema-knob]").style.transform')) === `translateX(${0.25 + 1.375 * i}rem)`)

    // Lo cargado dentro del marco, con su contenido y sus assets.
    check(`${tema.id}: ${que} cargó su contenido`, (await dentro('d.body.innerText.trim().length')) > 800)
    check(`${tema.id}: ${que} trajo sus estilos`,
      (await dentro('getComputedStyle(d.body).fontFamily')).length > 0 &&
        (await dentro('getComputedStyle(d.body).fontFamily')) !== 'Times New Roman')
    check(`${tema.id}: sin imágenes rotas`, (await dentro('[].slice.call(d.images).filter(function(i){return i.complete && i.naturalWidth === 0}).length')) === 0,
      `${await dentro('d.images.length')} imágenes`)

    // Si la página no pinta fondo propio (NexStudio), lo que se ve detrás es el
    // iframe: tiene que ser el blanco por defecto del navegador, igual que al abrirla
    // sola. La comparación de píxeles mide /t/<id> suelto y no ve este caso.
    check(`${tema.id}: el fondo detrás del contenido es el mismo que abriéndolo solo`, await evaluate(`(function(){
      var marco = document.getElementById('kt-marco'), d = marco.contentDocument, w = d.defaultView
      var el = d.elementFromPoint(720, 450)
      while (el) {
        var b = w.getComputedStyle(el).backgroundColor
        if (b !== 'rgba(0, 0, 0, 0)' && b !== 'transparent') return true
        if (w.getComputedStyle(el).backgroundImage.indexOf('gradient') !== -1) return true
        el = el.parentElement
      }
      return getComputedStyle(marco).backgroundColor === 'rgb(255, 255, 255)'
    })()`))

    if (esVariante) {
      await revisarVariante(MARCO, tema.id)
    } else {
      check(`${tema.id}: el router no cayó en su página de error`,
        !(await dentro('d.body.innerText')).match(/Page Not Found|404 - |Esta p[aá]gina no existe/i))

      // Lo que se pidió sacar de un template (ver `ajustes` en TEMAS) no se ve, y
      // no deja hueco.
      if (tema.ajustes?.ocultar) {
        // El texto sigue en el DOM (se oculta, no se borra), pero ningún
        // elemento que lo contenga se pinta.
        const texto = JSON.stringify(tema.ajustes.ocultar)
        check(`${tema.id}: no se ve "${tema.ajustes.ocultar}"`, await dentro(`(function () {
          var recorrido = d.createTreeWalker(d.body, NodeFilter.SHOW_TEXT), nodo, hallados = 0
          while ((nodo = recorrido.nextNode())) {
            if (nodo.nodeValue.indexOf(${texto}) === -1) continue
            hallados++
            if (nodo.parentElement && nodo.parentElement.getClientRects().length > 0) return false
          }
          return hallados > 0
        })()`))
      }
      if (tema.ajustes?.sinMargen) {
        check(`${tema.id}: no quedó el margen de lo que se sacó`,
          await dentro(`[].slice.call(d.querySelectorAll(${JSON.stringify(tema.ajustes.sinMargen)})).every(function (el) { return getComputedStyle(el).marginTop === '0px' })`))
      }
      if (tema.ajustes?.contiguos) {
        const [antes, despues] = tema.ajustes.contiguos
        const selector = (nombre) => JSON.stringify(`[data-framer-name="${nombre}"]`)
        check(`${tema.id}: "${antes}" y "${despues}" quedan seguidos, sin hueco`, await dentro(`(function () {
          var a = d.querySelector(${selector(antes)}), b = d.querySelector(${selector(despues)})
          if (!a || !b) return false
          var separacion = parseFloat(getComputedStyle(a.parentElement).rowGap) || 0
          return Math.abs(b.getBoundingClientRect().top - a.getBoundingClientRect().bottom - separacion) <= 2
        })()`), await dentro(`(function () {
          var a = d.querySelector(${selector(antes)}), b = d.querySelector(${selector(despues)})
          if (!a || !b) return 'no encontré las secciones'
          return 'distancia ' + Math.round(b.getBoundingClientRect().top - a.getBoundingClientRect().bottom) + 'px, separación del contenedor ' + getComputedStyle(a.parentElement).rowGap
        })()`))
      }
    }

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
  check('en móvil el toggle también queda a la izquierda y centrado verticalmente', await evaluate(POSICION_TOGGLE))

  // Cada variante abierta sola: sin desborde en los anchos del estándar INCBA, y
  // sus interacciones en móvil.
  for (const tema of TEMAS.filter((t) => tieneVariante(t.id))) {
    for (const ancho of [375, 640, 768, 1024, 1440]) {
      await metrics(ancho, 900)
      await goto(rutaTema(tema.id), 2000)
      check(`${tema.id} a ${ancho} px: no se desborda a lo ancho`, await en(PAGINA, DESBORDE), await en(PAGINA, DETALLE_DESBORDE))
      const encima = await en(PAGINA, SOBRE_GATOS)
      check(`${tema.id} a ${ancho} px: ningún texto ni la marquesina tapan a los gatos`, encima.length === 0, encima.slice(0, 4).join(', '))
    }

    await metrics(375, 812)
    erroresJs.length = 0
    await goto(rutaTema(tema.id), 2000)
    check(`${tema.id}: sin errores de JavaScript al cargar`, erroresJs.length === 0, erroresJs.slice(0, 3).join(' | '))
    if (await en(PAGINA, '!!d.querySelector("[data-menu-abrir]")')) {
      await en(PAGINA, '(d.querySelector("[data-menu-abrir]").click(), true)')
      await sleep(700)
      check(`${tema.id} a 375 px: el menú móvil se abre`,
        await en(PAGINA, 'd.querySelector("[data-menu]").classList.contains("abierto") && !d.querySelector("[data-menu]").inert'))
      await en(PAGINA, '(d.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" })), true)')
      await sleep(700)
      check(`${tema.id} a 375 px: el menú móvil se cierra con Escape`,
        await en(PAGINA, '!d.querySelector("[data-menu]").classList.contains("abierto") && d.querySelector("[data-menu]").inert'))
    }
    if (await en(PAGINA, '!!d.querySelector("[data-mapa]")')) {
      check(`${tema.id}: el mapa no se carga antes del clic`, await en(PAGINA, '!d.querySelector("iframe")'))
      await en(PAGINA, '(d.querySelector("[data-mapa]").click(), true)')
      check(`${tema.id}: el mapa se carga al hacer clic`, await en(PAGINA, '!!d.querySelector("iframe[src*=\\"google.com/maps\\"]")'))
    }
  }
} finally {
  ws.close()
  chrome.kill()
}

const fallas = results.filter((r) => !r[1])
console.log(`\n${results.length - fallas.length}/${results.length} comprobaciones OK`)
process.exit(fallas.length ? 1 : 0)
