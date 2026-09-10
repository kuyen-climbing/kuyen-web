/**
 * Generador del sitio de Kuyen Climbing.
 *
 *   node tools/build.mjs [--site=cl|preview] [--out DIR]
 *
 * Etapa actual: los cuatro templates candidatos servidos tal cual, uno por
 * ruta (/t/<id>), y un marco en la raíz que muestra el activo a pantalla
 * completa con el ToggleTheme encima para pasar al siguiente.
 *
 * Los templates no se tocan: salen del HTML capturado en src/temas/<id>/, con
 * sus propios estilos, scripts y assets bajo temas/<id>/. Lo único que les
 * agrega el generador es el noindex, porque son markup de terceros.
 *
 * El build es determinista y valida antes de escribir: si algo no cumple,
 * aborta sin tocar el disco y dice qué.
 */

import { readFileSync, writeFileSync, rmSync, mkdirSync, cpSync, existsSync } from 'node:fs'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { SITES, TEMAS, TEMA_POR_DEFECTO, PAGINA, LIMITES, rutaTema } from '../src/site.config.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const SRC = join(ROOT, 'src')

const read = (...p) => readFileSync(join(SRC, ...p), 'utf8')
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

function fill(tpl, vars) {
  return tpl.replace(/\{\{(\w+)\}\}/g, (m, k) => (k in vars ? vars[k] : m))
}

/** El marco: la página de la raíz, con el template activo y el toggle. */
function buildMarco(site, partials) {
  const porDefecto = TEMAS.find((t) => t.id === TEMA_POR_DEFECTO) || TEMAS[0]

  const head = fill(partials.head, {
    lang: site.lang,
    locale: site.locale,
    robots: site.robots,
    title: esc(PAGINA.title),
    description: esc(PAGINA.description),
    canonical: `${site.host}/`,
  })

  const marco = fill(partials.marco, {
    temasJson: JSON.stringify(TEMAS.map((t) => ({ id: t.id, nombre: t.nombre, icono: t.icono, ruta: rutaTema(t.id) }))),
    temaInicialRuta: rutaTema(porDefecto.id),
    temaIconoInicial: porDefecto.icono,
    temaNombreInicial: porDefecto.nombre,
    temaTotal: String(TEMAS.length),
  })

  return [head, marco, '</body>', '</html>', ''].join('\n')
}

/**
 * Lo único que se le inyecta a un template, y va primero de todo en el <head>
 * para correr antes que sus bundles. Son dos arreglos para que el template se
 * comporte igual que en su sitio, sirviéndose desde otra ruta:
 *
 * 1. La ruta. El template se sirve en /t/<id>, pero su router espera la ruta
 *    original: sin esto, NexStudio no encuentra ninguna coincidencia y muestra
 *    su propia página de 404.
 * 2. Las imágenes de Next.js. Al hidratar, el componente de imagen vuelve a
 *    pedirlas a /_next/image?url=...&w=..., un endpoint que en un sitio
 *    estático no existe. Se reapuntan a la imagen original ya descargada.
 */
function arranque(tema) {
  const prefijo = `/temas/${tema.id}`
  const ruta = new URL(tema.fuente).pathname
  const ajustes = tema.ajustes || {}

  // Ajustes pedidos para un template puntual (ver `ajustes` en TEMAS): una
  // cookie que el template lee para cambiar su propio estado, y CSS para que el
  // cambio no se vea un instante antes de hidratar.
  const cookie = ajustes.cookie
    ? `\n    try { document.cookie = ${JSON.stringify(`${ajustes.cookie}; path=/; max-age=31536000; SameSite=Lax`)} } catch (e) {}`
    : ''
  const estilos = ajustes.css ? `  <style>${ajustes.css}</style>\n` : ''

  return `${estilos}  <script>
  (function () {
    try { history.replaceState(null, '', ${JSON.stringify(ruta)}) } catch (e) {}${cookie}

    var PREFIJO = ${JSON.stringify(prefijo)}
    var OPTIMIZADOR = /(?:\\/temas\\/[\\w-]+)?\\/_next\\/image\\?[^"'\\s,]*url=([^&"'\\s,]+)[^"'\\s,]*/g

    function reapuntar(valor) {
      return valor.replace(OPTIMIZADOR, function (todo, codificada) {
        try { return PREFIJO + decodeURIComponent(codificada) } catch (e) { return todo }
      })
    }
    function arreglar(el) {
      if (!el || !el.getAttribute) return
      for (var i = 0; i < 2; i++) {
        var attr = i ? 'srcset' : 'src'
        var v = el.getAttribute(attr)
        if (!v || v.indexOf('/_next/image') === -1) continue
        var n = reapuntar(v)
        if (n !== v) el.setAttribute(attr, n)
      }
    }
    function barrer(raiz) {
      if (!raiz || !raiz.querySelectorAll) return
      var imgs = raiz.querySelectorAll('img, source')
      for (var i = 0; i < imgs.length; i++) arreglar(imgs[i])
    }

    new MutationObserver(function (cambios) {
      for (var i = 0; i < cambios.length; i++) {
        var c = cambios[i]
        if (c.type === 'attributes') arreglar(c.target)
        for (var j = 0; j < c.addedNodes.length; j++) {
          arreglar(c.addedNodes[j])
          barrer(c.addedNodes[j])
        }
      }
    }).observe(document.documentElement, {
      childList: true, subtree: true, attributes: true, attributeFilter: ['src', 'srcset'],
    })

    document.addEventListener('DOMContentLoaded', function () { barrer(document) })
    window.addEventListener('load', function () { barrer(document) })
  })()
  </script>`
}

/**
 * Página de un template: el HTML capturado, tal cual, con el arranque de
 * arriba y el noindex, porque es markup de terceros y no tiene por qué
 * aparecer en buscadores.
 */
function buildTema(tema) {
  const archivo = join(SRC, 'temas', tema.id, 'pagina.html')
  if (!existsSync(archivo)) {
    throw new Error(
      `falta la captura de "${tema.id}". Corré: node --experimental-websocket tools/capturar-tema.mjs ${tema.id} ${tema.fuente}`
    )
  }
  let html = readFileSync(archivo, 'utf8')

  html = html.replace(/<head([^>]*)>/i, `<head$1>\n${arranque(tema)}`)

  const noindex = '<meta name="robots" content="noindex, nofollow">'
  if (/<meta[^>]+name=["']robots["'][^>]*>/i.test(html)) {
    html = html.replace(/<meta[^>]+name=["']robots["'][^>]*>/gi, noindex)
  } else if (/<head[^>]*>/i.test(html)) {
    html = html.replace(/<head([^>]*)>/i, `<head$1>\n${noindex}`)
  }

  return { tema, html }
}

function validar(marco) {
  const problemas = []

  if (PAGINA.title.length > LIMITES.title) {
    problemas.push(`título de ${PAGINA.title.length} caracteres (máximo ${LIMITES.title})`)
  }
  if (PAGINA.description.length > LIMITES.description) {
    problemas.push(`descripción de ${PAGINA.description.length} caracteres (máximo ${LIMITES.description})`)
  }

  const h1 = (marco.match(/<h1[\s>]/g) || []).length
  if (h1 !== 1) problemas.push(`el marco tiene ${h1} etiquetas <h1> (tiene que haber exactamente 1)`)

  const sinResolver = marco.match(/\{\{\w+\}\}/g)
  if (sinResolver) problemas.push(`tokens sin resolver en el marco: ${[...new Set(sinResolver)].join(', ')}`)

  // Cada template tiene que existir y tener sus assets en su lugar.
  for (const tema of TEMAS) {
    const dir = join(ROOT, 'temas', tema.id)
    if (!existsSync(dir)) problemas.push(`faltan los assets de "${tema.id}" en temas/${tema.id}/`)
  }

  return problemas
}

function robotsTxt(site) {
  if (!site.sitemap) return '# Preview interno: no indexar.\nUser-agent: *\nDisallow: /\n'
  // Los templates son de terceros: fuera del índice.
  return `User-agent: *\nAllow: /$\nDisallow: /t/\nDisallow: /temas/\nSitemap: ${site.host}/sitemap.xml\n`
}

const sitemapXml = (site) =>
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>${site.host}/</loc>\n    <changefreq>monthly</changefreq>\n    <priority>1.0</priority>\n  </url>\n</urlset>\n`

export function build({ siteId, out }) {
  const site = SITES[siteId]
  if (!site) throw new Error(`sitio desconocido: ${siteId}`)

  const partials = {
    head: read('partials', 'head.html'),
    marco: read('partials', 'marco.html'),
  }

  const marco = buildMarco(site, partials)
  const temas = TEMAS.map((t) => buildTema(t))

  const problemas = validar(marco)
  if (problemas.length) {
    console.error(`\nEl build no pasa las validaciones:\n`)
    console.error(problemas.map((p) => `  ${p}`).join('\n'))
    console.error('\nNada se escribió en disco.\n')
    process.exit(1)
  }

  const dir = join(ROOT, out)
  if (out !== '.') {
    rmSync(dir, { recursive: true, force: true })
    mkdirSync(dir, { recursive: true })
    for (const asset of ['img', 'temas']) {
      if (existsSync(join(ROOT, asset))) cpSync(join(ROOT, asset), join(dir, asset), { recursive: true })
    }
    // El preview vive en kuyen-climbing.github.io y se sirve en la raíz, así
    // que va sin CNAME: con CNAME, GitHub Pages redirige al dominio propio.
    if (site.cname) writeFileSync(join(dir, 'CNAME'), `${site.cname}\n`)
    writeFileSync(join(dir, '.nojekyll'), '')
  }

  writeFileSync(join(dir, 'index.html'), marco)

  for (const { tema, html } of temas) {
    const archivo = join(dir, `${rutaTema(tema.id).replace(/^\//, '')}.html`)
    mkdirSync(dirname(archivo), { recursive: true })
    writeFileSync(archivo, html)
  }

  writeFileSync(join(dir, 'robots.txt'), robotsTxt(site))
  if (site.sitemap) writeFileSync(join(dir, 'sitemap.xml'), sitemapXml(site))

  return { site, temas: temas.length, dir: out }
}

const DEFAULT_OUT = { cl: 'dist', preview: 'dist-preview' }

// Comparación de rutas nativas en vez de comparar contra "file://" a mano:
// en Windows fileURLToPath resuelve barras y unidad correctamente, la
// comparación de strings cruda fallaba en silencio en este entorno.
if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const args = Object.fromEntries(
    process.argv.slice(2).map((a) => {
      const [k, v] = a.replace(/^--/, '').split('=')
      return [k, v ?? true]
    })
  )
  const siteId = args.site || 'cl'
  const out = args.out || DEFAULT_OUT[siteId]
  const r = build({ siteId, out })
  console.log(`${siteId}: marco + ${r.temas} templates en ${r.dir}/ (${r.site.cname || r.site.host})`)
}
