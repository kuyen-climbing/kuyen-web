/**
 * Generador del sitio de Kuyen Climbing.
 *
 *   node tools/build.mjs [--site=cl|preview] [--out=DIR] [--referencias]
 *
 * Etapa de contenido (15-09-2026): cada template de TEMAS pasa a tener una
 * variante propia con el contenido, la tipografía y los colores de Kuyen, que
 * conserva la estructura del template. El marco de la raíz la muestra en /t/<id>
 * con el ToggleTheme encima.
 *
 * - Si existe src/variantes/<id>/pagina.mjs, /t/<id> es la variante: markup, CSS
 *   y JavaScript propios, con las fotos de img/ y las fuentes de fonts/.
 * - Si todavía no existe, /t/<id> sigue siendo la captura del template.
 * - Con --referencias (lo usa npm run dev) también se escribe la captura en
 *   /ref/<id>, para compararla con la variante. build y preview no la llevan.
 *
 * El build es determinista y valida antes de escribir: si algo no cumple,
 * aborta sin tocar el disco y dice qué.
 */

import { readFileSync, writeFileSync, rmSync, mkdirSync, cpSync, existsSync } from 'node:fs'
import { join, dirname, resolve, sep } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { SITES, TEMAS, TEMA_POR_DEFECTO, PAGINA, LIMITES, rutaTema, rutaReferencia } from '../src/site.config.mjs'
import * as contenido from '../src/contenido.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const SRC = join(ROOT, 'src')

const read = (...p) => readFileSync(join(SRC, ...p), 'utf8')
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

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
    host: site.host,
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

/* ------------------------------------------------------------------ */
/* Variantes propias                                                   */
/* ------------------------------------------------------------------ */

/** La variante propia de un template, si existe. */
export const archivoVariante = (id) => join(SRC, 'variantes', id, 'pagina.mjs')
export const tieneVariante = (id) => existsSync(archivoVariante(id))

/**
 * Lo que no puede aparecer en una variante: rutas de las capturas, marcas de las
 * herramientas con que se hicieron los templates, fuentes pedidas a Google y los
 * dominios de los templates originales.
 */
export const TERCEROS = [
  '/temas/',
  '_next',
  'framer',
  'tailwind',
  'tailgrids',
  'shadcn',
  'fonts.googleapis',
  'fonts.gstatic',
  ...TEMAS.map((t) => new URL(t.fuente).hostname),
]

let medidasFotos = null
function medidasDeFotos() {
  if (!medidasFotos) {
    const archivo = join(ROOT, 'img', 'fotos', 'fotos.json')
    medidasFotos = existsSync(archivo) ? JSON.parse(readFileSync(archivo, 'utf8')) : {}
  }
  return medidasFotos
}

/**
 * <img> responsiva de una foto de FOTOS (src/contenido.mjs): srcset con los
 * anchos generados y width/height del archivo de 1200 px, para que la página no
 * salte al cargar.
 *
 * Opciones: tamanos (atributo sizes), clase, prioridad (carga inmediata, para
 * la foto principal) y alt (si la variante necesita otro texto).
 */
function foto(id, { tamanos = '100vw', clase = '', prioridad = false, alt } = {}) {
  const datos = contenido.FOTOS.find((f) => f.id === id)
  if (!datos) throw new Error(`foto desconocida: "${id}" (ver FOTOS en src/contenido.mjs)`)
  const medidas = medidasDeFotos()[id]
  if (!medidas) throw new Error(`falta generar la foto "${id}": node tools/assets.mjs fotos --origen=<carpeta>`)

  const anchos = Object.keys(medidas).map(Number).sort((a, b) => a - b)
  const base = medidas[1200] ? 1200 : anchos.at(-1)
  const srcset = anchos.map((a) => `/img/fotos/${id}-${a}.webp ${medidas[a].ancho}w`).join(', ')

  return [
    `<img src="/img/fotos/${id}-${base}.webp" srcset="${srcset}" sizes="${tamanos}"`,
    ` width="${medidas[base].ancho}" height="${medidas[base].alto}" alt="${esc(alt ?? datos.alt)}"`,
    clase ? ` class="${clase}"` : '',
    prioridad ? ' loading="eager" fetchpriority="high"' : ' loading="lazy"',
    ' decoding="async">',
  ].join('')
}

/**
 * Datos estructurados del negocio. SportsActivityLocation es el tipo de
 * schema.org para un centro deportivo. Va sin horario: Kuyen no lo confirmó.
 */
function datosEstructurados(site) {
  const { MARCA, UBICACION, CONTACTO, LINKS, SEO } = contenido
  return {
    '@context': 'https://schema.org',
    '@type': 'SportsActivityLocation',
    name: MARCA.nombre,
    description: SEO.descripcion,
    url: `${site.host}/`,
    image: `${site.host}/img/marca/og-kuyen.jpg`,
    logo: `${site.host}/img/marca/isotipo-512.png`,
    telephone: CONTACTO.telefonoE164,
    address: {
      '@type': 'PostalAddress',
      streetAddress: UBICACION.calle,
      addressLocality: UBICACION.comuna,
      addressRegion: UBICACION.region,
      postalCode: UBICACION.codigoPostal,
      addressCountry: UBICACION.pais,
    },
    geo: { '@type': 'GeoCoordinates', latitude: UBICACION.lat, longitude: UBICACION.lng },
    hasMap: UBICACION.maps,
    sameAs: [CONTACTO.instagram, LINKS.linktree],
  }
}

/**
 * <head> completo de una variante: metadatos, Open Graph, Twitter Card,
 * favicons, datos estructurados, precarga de fuentes y el CSS dentro de la
 * página (fuentes, tokens y el de la variante).
 */
function cabeza(site, { ruta, estilos = '', titulo = contenido.SEO.titulo, descripcion = contenido.SEO.descripcion }) {
  const url = `${site.host}${ruta}`
  const imagen = `${site.host}/img/marca/og-kuyen.jpg`
  const jsonld = JSON.stringify(datosEstructurados(site), null, 2).replace(/</g, '\\u003c')

  return `<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(titulo)}</title>
  <meta name="description" content="${esc(descripcion)}">
  <!-- Variante en comparación: fuera del índice hasta que se elija una. -->
  <meta name="robots" content="noindex, nofollow">
  <link rel="canonical" href="${url}">
  <meta name="theme-color" content="#2b2e83">

  <link rel="icon" type="image/png" sizes="32x32" href="/img/marca/favicon-32.png">
  <link rel="icon" type="image/png" sizes="192x192" href="/img/marca/favicon-192.png">
  <link rel="apple-touch-icon" href="/img/marca/apple-touch-icon.png">

  <meta property="og:type" content="website">
  <meta property="og:site_name" content="${esc(contenido.MARCA.nombre)}">
  <meta property="og:locale" content="${site.locale}">
  <meta property="og:url" content="${url}">
  <meta property="og:title" content="${esc(titulo)}">
  <meta property="og:description" content="${esc(descripcion)}">
  <meta property="og:image" content="${imagen}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${esc(contenido.MARCA.nombreLogo)}, escalada en boulder en ${esc(contenido.UBICACION.comuna)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(titulo)}">
  <meta name="twitter:description" content="${esc(descripcion)}">
  <meta name="twitter:image" content="${imagen}">

  <link rel="preload" href="/fonts/bebas-neue-latin.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/fonts/inter-latin.woff2" as="font" type="font/woff2" crossorigin>

  <script type="application/ld+json">
${jsonld}
  </script>

  <style>
${read('css', 'fuentes.css')}
${read('css', 'tokens.css')}
${estilos}
  </style>
</head>`
}

/**
 * Página de una variante. src/variantes/<id>/pagina.mjs exporta por defecto una
 * función que recibe el contexto y devuelve el HTML completo como texto:
 *
 *   site, tema, ruta   la variante de sitio, la entrada de TEMAS y su ruta
 *   contenido          todo src/contenido.mjs
 *   esc(texto)         escapa texto para HTML
 *   foto(id, opciones) <img> responsiva de una foto de FOTOS
 *   cabeza(opciones)   <head> completo; opciones: estilos, titulo, descripcion
 *   leer(nombre)       lee un archivo de la carpeta de la variante (su CSS o JS)
 */
async function buildVariante(site, tema) {
  const ruta = rutaTema(tema.id)
  const carpeta = join(SRC, 'variantes', tema.id)
  const { default: pagina } = await import(pathToFileURL(archivoVariante(tema.id)).href)

  const html = pagina({
    site,
    tema,
    ruta,
    contenido,
    esc,
    foto,
    cabeza: (opciones = {}) => cabeza(site, { ruta, ...opciones }),
    leer: (nombre) => readFileSync(join(carpeta, nombre), 'utf8'),
  })
  if (typeof html !== 'string') {
    throw new Error(`src/variantes/${tema.id}/pagina.mjs tiene que devolver el HTML de la página como texto`)
  }
  return html
}

/* ------------------------------------------------------------------ */
/* Capturas de los templates                                           */
/* ------------------------------------------------------------------ */

/**
 * Lo único que se le inyecta a un template, y va primero de todo en el <head>
 * para correr antes que sus bundles. Son dos arreglos para que el template se
 * comporte igual que en su sitio, sirviéndose desde otra ruta:
 *
 * 1. La ruta. El template se sirve en /t/<id> o /ref/<id>, pero su router espera
 *    la ruta original: sin esto, NexStudio no encuentra ninguna coincidencia y
 *    muestra su propia página de 404.
 * 2. Las imágenes de Next.js. Al hidratar, el componente de imagen vuelve a
 *    pedirlas a /_next/image?url=...&w=..., un endpoint que en un sitio
 *    estático no existe. Se reapuntan a la imagen original ya descargada.
 */
function arranque(tema) {
  const prefijo = `/temas/${tema.id}`
  const ruta = new URL(tema.fuente).pathname
  const ajustes = tema.ajustes || {}

  // Ajustes pedidos para un template puntual (ver `ajustes` en TEMAS): una
  // cookie que el template lee para cambiar su propio estado, y CSS para ocultar
  // lo que se pidió sacar sin tocar el markup que el template hidrata.
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

  return html
}

/* ------------------------------------------------------------------ */
/* Validaciones                                                        */
/* ------------------------------------------------------------------ */

function validar(marco, capturas) {
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

  // Cada captura que se sirve tiene que tener sus assets en su lugar.
  for (const id of capturas) {
    if (!existsSync(join(ROOT, 'temas', id))) problemas.push(`faltan los assets de "${id}" en temas/${id}/`)
  }

  return problemas
}

/**
 * El contenido no puede publicar horarios ni precios sin confirmar, ni los
 * valores que circulan en publicaciones viejas.
 */
function validarContenido() {
  const { POR_CONFIRMAR, HORARIOS, PRECIOS, DATOS_SIN_CONFIRMAR, SEO } = contenido
  const problemas = []
  const pendiente = (donde) =>
    problemas.push(`contenido: ${donde} tiene que decir ${POR_CONFIRMAR} mientras Kuyen no confirme el valor`)

  for (const tramo of HORARIOS.tramos) {
    for (const campo of ['dias', 'horas']) if (tramo[campo] !== POR_CONFIRMAR) pendiente(`HORARIOS, tramo "${tramo.id}", ${campo},`)
  }
  for (const dia of HORARIOS.semana) {
    for (const campo of ['horas', 'tramo']) if (dia[campo] !== POR_CONFIRMAR) pendiente(`HORARIOS, ${dia.dia}, ${campo},`)
  }
  for (const precio of PRECIOS) if (precio.valor !== POR_CONFIRMAR) pendiente(`PRECIOS, "${precio.id}",`)

  const { DATOS_SIN_CONFIRMAR: _, ...resto } = contenido
  const texto = JSON.stringify(resto)
  for (const dato of DATOS_SIN_CONFIRMAR) {
    if (texto.includes(dato)) problemas.push(`contenido: aparece "${dato}", un dato que Kuyen no confirmó`)
  }

  if (SEO.titulo.length > LIMITES.title) problemas.push(`contenido: SEO.titulo de ${SEO.titulo.length} caracteres (máximo ${LIMITES.title})`)
  if (SEO.descripcion.length > LIMITES.description) {
    problemas.push(`contenido: SEO.descripcion de ${SEO.descripcion.length} caracteres (máximo ${LIMITES.description})`)
  }

  return problemas
}

/**
 * Una variante: un solo <h1>, sin tokens sin resolver ni anclas rotas, sin datos
 * sin confirmar, sin nada de los templates ni de terceros, y con todos sus assets
 * locales en el repo.
 */
function validarVariante({ ruta, html }) {
  const problemas = []

  const h1 = (html.match(/<h1[\s>]/g) || []).length
  if (h1 !== 1) problemas.push(`${ruta}: ${h1} etiquetas <h1> (tiene que haber exactamente 1)`)
  if (!/<html lang="es-CL"/.test(html)) problemas.push(`${ruta}: falta lang="es-CL" en <html>`)
  if (!/<meta name="robots" content="noindex/.test(html)) problemas.push(`${ruta}: falta el noindex`)

  const tokens = html.match(/\{\{\w+\}\}/g)
  if (tokens) problemas.push(`${ruta}: tokens sin resolver: ${[...new Set(tokens)].join(', ')}`)

  for (const ancla of new Set([...html.matchAll(/href="#([\w-]+)"/g)].map((m) => m[1]))) {
    if (!html.includes(`id="${ancla}"`)) problemas.push(`${ruta}: enlace a #${ancla}, que no existe en la página`)
  }

  for (const dato of contenido.DATOS_SIN_CONFIRMAR) {
    if (html.includes(dato)) problemas.push(`${ruta}: aparece "${dato}", un dato que Kuyen no confirmó`)
  }

  const minusculas = html.toLowerCase()
  for (const t of TERCEROS) {
    if (minusculas.includes(t.toLowerCase())) problemas.push(`${ruta}: referencia a "${t}", que es de un template o de un tercero`)
  }

  const refs = new Set()
  for (const m of html.matchAll(/(?:src|href)="(\/[^"#?]*)/g)) refs.add(m[1])
  for (const m of html.matchAll(/srcset="([^"]+)"/g)) for (const parte of m[1].split(',')) refs.add(parte.trim().split(/\s+/)[0])
  for (const m of html.matchAll(/url\(["']?(\/[^"')?#]+)/g)) refs.add(m[1])
  for (const ref of refs) {
    // Solo archivos: las rutas de página (/, /t/karate) no tienen extensión.
    if (!ref.startsWith('/') || !/\.\w+$/.test(ref)) continue
    if (!existsSync(join(ROOT, ref))) problemas.push(`${ruta}: ${ref} no existe en el repo`)
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

/** Escribe una página en su ruta pública (/t/karate -> t/karate.html). */
function escribir(dir, ruta, html) {
  const archivo = join(dir, `${ruta.replace(/^\//, '')}.html`)
  mkdirSync(dirname(archivo), { recursive: true })
  writeFileSync(archivo, html)
}

export async function build({ siteId, out, referencias = false }) {
  const site = SITES[siteId]
  if (!site) throw new Error(`sitio desconocido: ${siteId}`)

  const dir = resolve(ROOT, out)
  if (dir !== ROOT && `${ROOT}${sep}`.startsWith(`${dir}${sep}`)) {
    throw new Error(`--out=${out} contiene al repo: se borraría entero`)
  }

  const partials = {
    head: read('partials', 'head.html'),
    marco: read('partials', 'marco.html'),
  }

  const marco = buildMarco(site, partials)

  const paginas = []
  for (const tema of TEMAS) {
    if (tieneVariante(tema.id)) {
      paginas.push({ tipo: 'variante', tema, ruta: rutaTema(tema.id), html: await buildVariante(site, tema) })
    } else {
      paginas.push({ tipo: 'captura', tema, ruta: rutaTema(tema.id), html: buildTema(tema) })
    }
    if (referencias) paginas.push({ tipo: 'referencia', tema, ruta: rutaReferencia(tema.id), html: buildTema(tema) })
  }
  const contar = (tipo) => paginas.filter((p) => p.tipo === tipo).length
  const capturas = [...new Set(paginas.filter((p) => p.tipo !== 'variante').map((p) => p.tema.id))]

  const problemas = [
    ...validar(marco, capturas),
    ...validarContenido(),
    ...paginas.filter((p) => p.tipo === 'variante').flatMap(validarVariante),
  ]
  if (problemas.length) {
    console.error(`\nEl build no pasa las validaciones:\n`)
    console.error(problemas.map((p) => `  ${p}`).join('\n'))
    console.error('\nNada se escribió en disco.\n')
    process.exit(1)
  }

  if (dir !== ROOT) {
    rmSync(dir, { recursive: true, force: true })
    mkdirSync(dir, { recursive: true })
    for (const asset of ['img', 'fonts']) {
      if (existsSync(join(ROOT, asset))) cpSync(join(ROOT, asset), join(dir, asset), { recursive: true })
    }
    // Las capturas viajan solo si alguna página las usa: un template que todavía
    // no tiene variante, o /ref/ en local.
    for (const id of capturas) {
      cpSync(join(ROOT, 'temas', id), join(dir, 'temas', id), { recursive: true })
    }
    // El preview vive en kuyen-climbing.github.io y se sirve en la raíz, así
    // que va sin CNAME: con CNAME, GitHub Pages redirige al dominio propio.
    if (site.cname) writeFileSync(join(dir, 'CNAME'), `${site.cname}\n`)
    writeFileSync(join(dir, '.nojekyll'), '')
  }

  writeFileSync(join(dir, 'index.html'), marco)
  for (const pagina of paginas) escribir(dir, pagina.ruta, pagina.html)

  writeFileSync(join(dir, 'robots.txt'), robotsTxt(site))
  if (site.sitemap) writeFileSync(join(dir, 'sitemap.xml'), sitemapXml(site))

  return { site, variantes: contar('variante'), capturas: contar('captura'), referencias: contar('referencia'), dir: out }
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
  const r = await build({ siteId, out, referencias: Boolean(args.referencias) })
  const partes = ['marco', `${r.variantes} variantes`, `${r.capturas} capturas`]
  if (r.referencias) partes.push(`${r.referencias} referencias`)
  console.log(`${siteId}: ${partes.join(' + ')} en ${r.dir}/ (${r.site.cname || r.site.host})`)
}
