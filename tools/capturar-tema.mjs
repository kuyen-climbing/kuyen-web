/**
 * Captura de un template de referencia como tema del sitio.
 *
 *   node tools/capturar-tema.mjs <id> <url>
 *   node tools/capturar-tema.mjs hive https://hive-nextjs-template.vercel.app/
 *
 * Baja el HTML de la página, sus hojas de estilo, tipografías e imágenes, los
 * guarda en temas/<id>/assets/ y reescribe las referencias a rutas locales.
 * El resultado queda en src/temas/<id>/pagina.html, que es lo que sirve el
 * generador cuando ese tema está activo.
 *
 * Sirve para las páginas que llegan renderizadas desde el servidor. Las que
 * arman el HTML en el navegador (React del lado del cliente) no se pueden
 * capturar así: para esas hace falta el DOM ya renderizado.
 *
 * IMPORTANTE: los templates son de terceros. Esta captura es material de
 * trabajo interno para elegir dirección visual; el markup y los assets se
 * reemplazan por los propios de Kuyen antes de publicar.
 */

import { writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { join, dirname, extname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

const AGENTE =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36'

const EXTENSIONES_TEXTO = new Set(['.css'])

/** Lo que sí es un asset: todo lo demás que aparezca en un href es navegación. */
const EXTENSIONES_ASSET = new Set([
  '.css', '.png', '.jpg', '.jpeg', '.webp', '.avif', '.gif', '.svg', '.ico',
  '.woff', '.woff2', '.ttf', '.otf', '.eot', '.mp4', '.webm', '.mov', '.json',
])

/** Endpoints que sirven imágenes sin extensión en la ruta (Next.js, Framer, CDNs). */
const RUTAS_DE_IMAGEN = [/\/_next\/image/, /\/image\?/, /framerusercontent\.com/, /\/cdn-cgi\/image\//]

const decodificar = (s) =>
  s
    .split('&amp;').join('&')
    .split('&#x26;').join('&')
    .split('&quot;').join('"')
    .split('&#39;').join("'")

function esAsset(url) {
  const ext = extname(new URL(url).pathname).toLowerCase()
  if (EXTENSIONES_ASSET.has(ext)) return true
  return RUTAS_DE_IMAGEN.some((re) => re.test(url))
}

/** Extensión por tipo de contenido, para las URLs que no la traen en la ruta
 *  (los endpoints de imagen tipo /_next/image sirven .webp sin decirlo). */
const EXT_POR_TIPO = {
  'image/webp': '.webp',
  'image/avif': '.avif',
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/gif': '.gif',
  'image/svg+xml': '.svg',
  'image/x-icon': '.ico',
  'video/mp4': '.mp4',
  'video/webm': '.webm',
  'font/woff2': '.woff2',
  'font/woff': '.woff',
  'text/css': '.css',
  'application/json': '.json',
}

/** Nombre local estable para una URL remota: hash del origen + extensión. */
function nombreLocal(url, tipo = '') {
  const h = createHash('sha1').update(url).digest('hex').slice(0, 10)
  let ext = extname(new URL(url).pathname).split('?')[0].toLowerCase()
  if (!ext || ext.length > 6) ext = EXT_POR_TIPO[tipo.split(';')[0].trim()] || ''
  return `${h}${ext}`
}

async function bajar(url) {
  const r = await fetch(url, { headers: { 'user-agent': AGENTE }, redirect: 'follow' })
  if (!r.ok) throw new Error(`${r.status} ${r.statusText}`)
  const buf = Buffer.from(await r.arrayBuffer())
  return { buf, tipo: r.headers.get('content-type') || '' }
}

/**
 * Assets referenciados por el HTML. Devuelve pares {crudo, abs}: `crudo` es el
 * texto tal como aparece en el archivo (puede venir relativo y con entidades
 * HTML) y es lo que después hay que reemplazar; `abs` es la URL real a bajar.
 */
function urlsDeHtml(html, base) {
  const encontradas = new Map()
  const patrones = [
    /(?:href|src|poster)="([^"]+)"/gi,
    /srcset="([^"]+)"/gi,
    /url\((['"]?)([^)'"]+)\1\)/g,
  ]
  for (const re of patrones) {
    for (const m of html.matchAll(re)) {
      const crudoCompleto = re.source.includes('url\\(') ? m[2] : m[1]
      // srcset trae varias URLs con su descriptor de ancho.
      for (const parte of crudoCompleto.split(',')) {
        const crudo = parte.trim().split(/\s+/)[0]
        if (!crudo || crudo.startsWith('data:') || crudo.startsWith('#') || crudo.startsWith('mailto:') || crudo.startsWith('tel:')) continue
        try {
          const abs = new URL(decodificar(crudo), base)
          if (abs.protocol !== 'http:' && abs.protocol !== 'https:') continue
          if (!esAsset(abs.href)) continue
          encontradas.set(crudo, abs.href)
        } catch {}
      }
    }
  }
  return encontradas
}

/** URLs referenciadas dentro de una hoja de estilo. */
function urlsDeCss(css, base) {
  const encontradas = new Set()
  for (const m of css.matchAll(/url\((['"]?)([^)'"]+)\1\)/g)) {
    const u = m[2].trim()
    if (!u || u.startsWith('data:')) continue
    try {
      const abs = new URL(u, base)
      if (abs.protocol === 'http:' || abs.protocol === 'https:') encontradas.add(abs.href)
    } catch {}
  }
  for (const m of css.matchAll(/@import\s+(?:url\()?['"]([^'"]+)['"]/g)) {
    try {
      encontradas.add(new URL(m[1], base).href)
    } catch {}
  }
  return encontradas
}

/**
 * Descarga recursiva: HTML -> CSS -> lo que el CSS referencie. No sigue los
 * .js (el tema se sirve estático; el JavaScript del template original no se
 * reusa) ni sale del salto que se le pida.
 */
async function capturar(id, url, { render = false } = {}) {
  const dirAssets = join(ROOT, 'temas', id, 'assets')
  mkdirSync(dirAssets, { recursive: true })

  let html
  if (render) {
    const { renderHtml } = await import('./render.mjs')
    html = await renderHtml(url)
  } else {
    const { buf } = await bajar(url)
    html = buf.toString('utf8')
  }

  const mapa = new Map() // url remota -> { nombre, css? }
  const enHtml = urlsDeHtml(html, url) // texto crudo del HTML -> url remota
  const pendientes = [...new Set(enHtml.values())]
  const vistas = new Set()
  let fallos = 0

  while (pendientes.length) {
    const remota = pendientes.shift()
    if (vistas.has(remota)) continue
    vistas.add(remota)

    let recurso
    try {
      recurso = await bajar(remota)
    } catch (e) {
      fallos++
      console.warn(`  no se pudo bajar ${remota}: ${e.message}`)
      continue
    }

    const nombre = nombreLocal(remota, recurso.tipo)
    const destino = join(dirAssets, nombre)

    const ext = extname(new URL(remota).pathname).toLowerCase()
    if (EXTENSIONES_TEXTO.has(ext) || recurso.tipo.includes('text/css')) {
      let css = recurso.buf.toString('utf8')
      const anidadas = urlsDeCss(css, remota)
      for (const a of anidadas) if (!vistas.has(a)) pendientes.push(a)
      // Se reescribe al final, cuando el mapa esté completo.
      mapa.set(remota, { nombre, css })
    } else {
      writeFileSync(destino, recurso.buf)
      mapa.set(remota, { nombre })
    }
  }

  const rutaLocal = (remota) => {
    const e = mapa.get(remota)
    return e ? `/temas/${id}/assets/${e.nombre}` : null
  }

  // Segunda pasada: reescribir las hojas de estilo ya con el mapa completo.
  for (const [remota, entrada] of mapa) {
    if (!entrada.css) continue
    let css = entrada.css
    for (const [otra, e] of mapa) {
      if (!e) continue
      const local = `/temas/${id}/assets/${e.nombre}`
      css = css.split(otra).join(local)
      // También las formas relativas tal como aparecen en ese archivo.
      try {
        const rel = new URL(otra).href.replace(new URL(remota).origin, '')
        if (rel && rel !== otra) css = css.split(`url(${rel})`).join(`url(${local})`)
      } catch {}
    }
    writeFileSync(join(dirAssets, entrada.nombre), css, 'utf8')
  }

  // Reescritura del HTML por el texto tal como aparece en el archivo, que es
  // el que puede venir relativo o con entidades (&amp;) y no coincide con la
  // URL que se descargó.
  const crudosPorLargo = [...enHtml.keys()].sort((a, b) => b.length - a.length)
  for (const crudo of crudosPorLargo) {
    const local = rutaLocal(enHtml.get(crudo))
    if (!local) continue
    html = html.split(crudo).join(local)
  }

  const destinoHtml = join(ROOT, 'src', 'temas', id, 'pagina.html')
  mkdirSync(dirname(destinoHtml), { recursive: true })
  writeFileSync(destinoHtml, html, 'utf8')

  return { assets: mapa.size, fallos, bytes: html.length, destinoHtml }
}

const args = process.argv.slice(2)
const render = args.includes('--render')
const [id, url] = args.filter((a) => !a.startsWith('--'))
if (!id || !url) {
  console.error('uso: node tools/capturar-tema.mjs <id> <url> [--render]')
  process.exit(1)
}
const r = await capturar(id, url, { render })
console.log(`${id}: ${r.assets} assets (${r.fallos} fallidos), ${(r.bytes / 1024).toFixed(0)} KB de HTML -> ${r.destinoHtml}`)
