/**
 * Captura completa de un template, para servirlo tal cual desde este repo.
 *
 *   node --experimental-websocket tools/capturar-tema.mjs <id> <url> [--sin-render]
 *
 * Baja la página con todo lo que necesita para verse igual que el original:
 * hojas de estilo, tipografías, imágenes, videos y su JavaScript. Los archivos
 * quedan bajo temas/<id>/ **espejando la ruta original** (no con nombres
 * planos), y todas las referencias se reescriben a ese prefijo.
 *
 * Espejar la ruta importa: los bundles arman URLs en tiempo de ejecución
 * concatenando un prefijo literal ("/_next/static/chunks/" y similares) con el
 * nombre del chunk. Con la estructura intacta alcanza con reescribir ese
 * prefijo dentro del JavaScript para que los pedidos caigan donde están los
 * archivos. Con nombres planos, esos pedidos daban 404 y el template quedaba a
 * medias: escenas sin cargar y carruseles vacíos.
 *
 * Por defecto lee el DOM ya renderizado con el Chrome instalado en headless,
 * porque los templates arman su HTML en el navegador.
 *
 * IMPORTANTE: los templates son de terceros. Esta captura es material de
 * trabajo para elegir dirección visual; el markup y los assets se reemplazan
 * por los propios de Kuyen antes de publicar el sitio definitivo.
 */

import { writeFileSync, mkdirSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { join, dirname, extname, posix } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

const AGENTE =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36'

/** Extensiones que se consideran asset y no navegación. */
const EXTENSIONES_ASSET = new Set([
  '.css', '.js', '.mjs', '.json', '.map',
  '.png', '.jpg', '.jpeg', '.webp', '.avif', '.gif', '.svg', '.ico',
  '.woff', '.woff2', '.ttf', '.otf', '.eot',
  '.mp4', '.webm', '.mov',
])

/** Endpoints que sirven assets sin extensión en la ruta. */
const RUTAS_DE_ASSET = [/\/_next\/image/, /\/image\?/, /framerusercontent\.com/, /\/cdn-cgi\/image\//]

/** Extensión por tipo de contenido, para las URLs que no la traen en la ruta. */
const EXT_POR_TIPO = {
  'image/webp': '.webp', 'image/avif': '.avif', 'image/png': '.png', 'image/jpeg': '.jpg',
  'image/gif': '.gif', 'image/svg+xml': '.svg', 'image/x-icon': '.ico',
  'video/mp4': '.mp4', 'video/webm': '.webm',
  'font/woff2': '.woff2', 'font/woff': '.woff',
  'text/css': '.css', 'text/javascript': '.js', 'application/javascript': '.js',
  'application/json': '.json',
}

const decodificar = (s) =>
  s.split('&amp;').join('&').split('&#x26;').join('&').split('&quot;').join('"').split('&#39;').join("'")

function esAsset(url) {
  const ext = extname(new URL(url).pathname).toLowerCase()
  if (EXTENSIONES_ASSET.has(ext)) return true
  return RUTAS_DE_ASSET.some((re) => re.test(url))
}

async function bajar(url) {
  const r = await fetch(url, { headers: { 'user-agent': AGENTE }, redirect: 'follow' })
  if (!r.ok) throw new Error(`${r.status} ${r.statusText}`)
  return { buf: Buffer.from(await r.arrayBuffer()), tipo: r.headers.get('content-type') || '' }
}

/**
 * Ruta local de un asset, espejando la del original.
 *   mismo origen:  /_next/static/x.js  ->  /temas/<id>/_next/static/x.js
 *   otro origen:   https://cdn/f.woff2 ->  /temas/<id>/_ext/cdn/f.woff2
 * Si la URL lleva query (los endpoints de imagen la usan para el ancho), se
 * agrega un sufijo con su hash para no pisar una variante con otra.
 */
function rutaLocalDe(id, remota, origen, tipo = '') {
  const u = new URL(remota)
  let ruta = u.origin === origen ? u.pathname : posix.join('/_ext', u.host, u.pathname)
  let ext = extname(ruta).toLowerCase()

  // En código el query es un cache-buster y no entra al nombre: si entrara, el
  // pedido que arma el bundle en tiempo de ejecución no encontraría el archivo.
  // En media sí entra, porque ahí el query elige la variante (el ancho de la
  // imagen), y sin él las versiones de un srcset se pisarían entre sí.
  const CODIGO = ['.js', '.mjs', '.css', '.json', '.map']
  if (u.search && !CODIGO.includes(ext)) {
    const h = createHash('sha1').update(u.search).digest('hex').slice(0, 8)
    ruta = ruta + `__${h}`
    ext = extname(ruta).toLowerCase()
  }
  if (!ext || !EXTENSIONES_ASSET.has(ext)) {
    ruta += EXT_POR_TIPO[tipo.split(';')[0].trim()] || ''
  }
  return posix.join('/temas', id, ruta)
}

/** Assets referenciados por un HTML, como pares {crudo -> url absoluta}. */
function urlsDeHtml(html, base) {
  const encontradas = new Map()
  const patrones = [/(?:href|src|poster|data-src)="([^"]+)"/gi, /srcset="([^"]+)"/gi, /url\((['"]?)([^)'"]+)\1\)/gi]
  for (const re of patrones) {
    for (const m of html.matchAll(re)) {
      const completo = re.source.includes('url\\(') ? m[2] : m[1]
      for (const parte of completo.split(',')) {
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

/** Assets referenciados dentro de una hoja de estilo. */
function urlsDeCss(css, base) {
  const encontradas = new Map()
  for (const m of css.matchAll(/url\((['"]?)([^)'"]+)\1\)/g)) {
    const crudo = m[2].trim()
    if (!crudo || crudo.startsWith('data:')) continue
    try {
      const abs = new URL(crudo, base)
      if (abs.protocol === 'http:' || abs.protocol === 'https:') encontradas.set(crudo, abs.href)
    } catch {}
  }
  for (const m of css.matchAll(/@import\s+(?:url\()?['"]([^'"]+)['"]/g)) {
    try {
      encontradas.set(m[1], new URL(m[1], base).href)
    } catch {}
  }
  return encontradas
}

/**
 * Assets referenciados dentro de un bundle: las rutas que aparecen como texto
 * literal. Se buscan solo las absolutas del mismo origen, que es lo que los
 * cargadores concatenan en tiempo de ejecución.
 */
function urlsDeJs(js, origen) {
  const encontradas = new Map()
  for (const m of js.matchAll(/["'`](\/[\w./@-]+\.(?:js|mjs|css|json|woff2?|png|jpe?g|webp|avif|svg|gif|mp4|webm))["'`]/g)) {
    try {
      encontradas.set(m[1], new URL(m[1], origen).href)
    } catch {}
  }
  return encontradas
}

/** Prefijos de ruta que los bundles concatenan a mano y hay que reapuntar. */
const PREFIJOS_RUNTIME = ['/_next/', '/assets/', '/static/', '/images/', '/media/', '/fonts/', '/videos/']

async function capturar(id, url, { render = true } = {}) {
  const origen = new URL(url).origin
  const base = join(ROOT, 'temas', id)

  let html
  if (render) {
    const { renderHtml } = await import('./render.mjs')
    html = await renderHtml(url)
  } else {
    html = (await bajar(url)).buf.toString('utf8')
  }

  const local = new Map() // url remota -> ruta local (/temas/<id>/...)
  const pendientes = [...new Set(urlsDeHtml(html, url).values())]
  const vistas = new Set()
  const textos = [] // { ruta, contenido, refs } para reescribir al final
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
      continue
    }

    const ruta = rutaLocalDe(id, remota, origen, recurso.tipo)
    local.set(remota, ruta)

    // El optimizador de imágenes de Next.js sirve cada variante en
    // /_next/image?url=<original>&w=<ancho>. Al hidratar, el componente vuelve
    // a pedir esa URL con su query, que en un sitio estático no resuelve. Se
    // baja también la imagen original, que es a la que se reapunta después
    // (ver el script que inyecta tools/build.mjs).
    if (/\/_next\/image/.test(remota)) {
      const cruda = new URL(remota).searchParams.get('url')
      if (cruda) {
        try {
          const abs = new URL(decodeURIComponent(cruda), origen).href
          if (!vistas.has(abs)) pendientes.push(abs)
        } catch {}
      }
    }

    const ext = extname(ruta).toLowerCase()
    const esCss = ext === '.css' || recurso.tipo.includes('text/css')
    const esJs = ext === '.js' || ext === '.mjs' || recurso.tipo.includes('javascript')

    if (esCss || esJs) {
      const contenido = recurso.buf.toString('utf8')
      const refs = esCss ? urlsDeCss(contenido, remota) : urlsDeJs(contenido, origen)
      for (const a of refs.values()) if (!vistas.has(a)) pendientes.push(a)
      textos.push({ ruta, contenido, refs, esJs })
    } else {
      const destino = join(ROOT, ruta.replace(/^\/temas\//, 'temas/'))
      mkdirSync(dirname(destino), { recursive: true })
      writeFileSync(destino, recurso.buf)
    }
  }

  const prefijo = `/temas/${id}`

  /** Reescribe las referencias de un texto (CSS o JS) y lo escribe. */
  for (const t of textos) {
    let contenido = t.contenido
    const crudos = [...t.refs.keys()].sort((a, b) => b.length - a.length)
    for (const crudo of crudos) {
      const destino = local.get(t.refs.get(crudo))
      if (destino) contenido = contenido.split(crudo).join(destino)
    }
    if (t.esJs) {
      // Los prefijos que el bundle concatena en tiempo de ejecución.
      for (const p of PREFIJOS_RUNTIME) {
        contenido = contenido.split(`"${p}`).join(`"${prefijo}${p}`)
        contenido = contenido.split(`'${p}`).join(`'${prefijo}${p}`)
        contenido = contenido.split('`' + p).join('`' + prefijo + p)
      }
    }
    const destino = join(ROOT, t.ruta.replace(/^\/temas\//, 'temas/'))
    mkdirSync(dirname(destino), { recursive: true })
    writeFileSync(destino, contenido, 'utf8')
  }

  // El HTML se reescribe por el texto tal como aparece, de más largo a más
  // corto para que una ruta no se coma el prefijo de otra.
  const enHtml = urlsDeHtml(html, url)
  for (const crudo of [...enHtml.keys()].sort((a, b) => b.length - a.length)) {
    const destino = local.get(enHtml.get(crudo))
    if (destino) html = html.split(crudo).join(destino)
  }

  const destinoHtml = join(ROOT, 'src', 'temas', id, 'pagina.html')
  mkdirSync(dirname(destinoHtml), { recursive: true })
  writeFileSync(destinoHtml, html, 'utf8')

  return { assets: local.size, fallos, kb: Math.round(html.length / 1024), destinoHtml }
}

const args = process.argv.slice(2)
const render = !args.includes('--sin-render')
const [id, url] = args.filter((a) => !a.startsWith('--'))
if (!id || !url) {
  console.error('uso: node --experimental-websocket tools/capturar-tema.mjs <id> <url> [--sin-render]')
  process.exit(1)
}
const r = await capturar(id, url, { render })
console.log(`${id}: ${r.assets} assets (${r.fallos} fallidos), ${r.kb} KB de HTML -> ${r.destinoHtml}`)
