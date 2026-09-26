/**
 * Generador del sitio de Kuyen Climbing.
 *
 *   node tools/build.mjs [--site=cl|preview] [--out=DIR]
 *
 * El sitio es una sola página, servida en la raíz: la variante de VARIANTE, con
 * markup, CSS y JavaScript propios, las fotos de img/ y las fuentes de fonts/.
 * Sale de src/variantes/<id>/pagina.mjs y toma sus textos de src/contenido.mjs.
 *
 * Hasta el 26-09-2026 la raíz era un marco con un selector que mostraba tres
 * templates candidatos en /t/<id>. Kuyen eligió Hirael y eso se fue: el marco,
 * las rutas /t/, las capturas de los templates y las herramientas para
 * capturarlos. Siguen en el historial, en 8dd4bad.
 *
 * El build es determinista y valida antes de escribir: si algo no cumple,
 * aborta sin tocar el disco y dice qué.
 */

import { readFileSync, writeFileSync, rmSync, mkdirSync, cpSync, existsSync } from 'node:fs'
import { join, dirname, resolve, sep } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { SITES, VARIANTE, LIMITES, VERIFICACION_GOOGLE } from '../src/site.config.mjs'
import * as contenido from '../src/contenido.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const SRC = join(ROOT, 'src')

const read = (...p) => readFileSync(join(SRC, ...p), 'utf8')
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

function fill(tpl, vars) {
  return tpl.replace(/\{\{(\w+)\}\}/g, (m, k) => (k in vars ? vars[k] : m))
}

/* ------------------------------------------------------------------ */
/* Variantes propias                                                   */
/* ------------------------------------------------------------------ */

/** La variante propia de un template, si existe. */
export const archivoVariante = (id) => join(SRC, 'variantes', id, 'pagina.mjs')

/**
 * Lo que no puede aparecer en una variante: rutas de las capturas, marcas de las
 * herramientas con que se hicieron los templates, fuentes pedidas a Google y los
 * dominios de los templates originales.
 */
export const TERCEROS = [
  '_next',
  'framer',
  'tailwind',
  'tailgrids',
  'shadcn',
  'fonts.googleapis',
  'fonts.gstatic',
  new URL(VARIANTE.fuente).hostname,
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
 * schema.org para un centro deportivo.
 */
function datosEstructurados(site) {
  const { MARCA, UBICACION, CONTACTO, LINKS, SEO, HORARIOS } = contenido
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
    email: CONTACTO.correo,
    // Kuyen abre los siete días con el mismo horario (planilla, pregunta H1).
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        opens: HORARIOS.abre,
        closes: HORARIOS.cierra,
      },
    ],
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
  <meta name="robots" content="${site.robots}">
  <link rel="canonical" href="${url}">
  <meta name="theme-color" content="#2b2e83">${VERIFICACION_GOOGLE ? `\n  <meta name="google-site-verification" content="${esc(VERIFICACION_GOOGLE)}">` : ''}

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

  <link rel="preload" href="/fonts/rubik-latin.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/fonts/rubik-dirt-latin.woff2" as="font" type="font/woff2" crossorigin>

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
 *   site, tema, ruta   la variante de sitio, la entrada de VARIANTE y su ruta
 *   contenido          todo src/contenido.mjs
 *   esc(texto)         escapa texto para HTML
 *   foto(id, opciones) <img> responsiva de una foto de FOTOS
 *   cabeza(opciones)   <head> completo; opciones: estilos, titulo, descripcion
 *   leer(nombre)       lee un archivo de la carpeta de la variante (su CSS o JS)
 *   compartido(nombre) lee un archivo de src/compartido/ (escena y movimiento
 *                      que usan todas las variantes)
 */
async function buildVariante(site, tema) {
  const ruta = '/'
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
    compartido: (nombre) => readFileSync(join(SRC, 'compartido', nombre), 'utf8'),
  })
  if (typeof html !== 'string') {
    throw new Error(`src/variantes/${tema.id}/pagina.mjs tiene que devolver el HTML de la página como texto`)
  }
  return html
}

/* ------------------------------------------------------------------ */
/* Capturas de los templates                                           */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/* Validaciones                                                        */
/* ------------------------------------------------------------------ */

/** Título y descripción, contra los puntos donde Google los trunca. */
function validarSeo() {
  const problemas = []
  const { SEO } = contenido
  if (SEO.titulo.length > LIMITES.title) {
    problemas.push(`SEO.titulo tiene ${SEO.titulo.length} caracteres (máximo ${LIMITES.title})`)
  }
  if (SEO.descripcion.length > LIMITES.description) {
    problemas.push(`SEO.descripcion tiene ${SEO.descripcion.length} caracteres (máximo ${LIMITES.description})`)
  }
  return problemas
}

/**
 * Busca un dato viejo dentro de un texto. La comparación no puede ser por
 * coincidencia simple: valores vigentes como $32.000 y $18.000 contienen
 * "2.000" y "8.000", que sí son datos viejos cuando van solos. La frontera de
 * la izquierda deja pasar el valor largo y sigue atajando el corto.
 */
function apareceDatoViejo(texto, dato) {
  const escapado = dato.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(`(?<![\\d.:])${escapado}`).test(texto)
}

/**
 * El contenido no puede publicar horarios ni precios en blanco, ni los valores
 * que circulan en publicaciones viejas. Cada horario y cada precio dice el dato
 * que Kuyen confirmó o POR_CONFIRMAR, nunca un campo vacío.
 */
function validarContenido() {
  const { HORARIOS, PRECIOS, DATOS_SIN_CONFIRMAR, SEO, INSTAGRAM, FOTOS } = contenido
  const problemas = []
  const vacio = (donde) => problemas.push(`contenido: ${donde} está vacío`)
  const lleno = (v) => typeof v === 'string' && v.trim() !== ''

  for (const tramo of HORARIOS.tramos) {
    for (const campo of ['dias', 'horas']) if (!lleno(tramo[campo])) vacio(`HORARIOS, tramo "${tramo.id}", ${campo},`)
  }
  for (const dia of HORARIOS.semana) {
    for (const campo of ['horas', 'tramo']) if (!lleno(dia[campo])) vacio(`HORARIOS, ${dia.dia}, ${campo},`)
  }
  for (const precio of PRECIOS) if (!lleno(precio.valor)) vacio(`PRECIOS, "${precio.id}",`)

  const { DATOS_SIN_CONFIRMAR: _, ...resto } = contenido
  const texto = JSON.stringify(resto)
  for (const dato of DATOS_SIN_CONFIRMAR) {
    if (apareceDatoViejo(texto, dato)) problemas.push(`contenido: aparece "${dato}", un dato que Kuyen no confirmó`)
  }

  // Las reseñas van copiadas de Google: no puede quedar una a medias, ni haber
  // más de las que la ficha tiene con texto.
  const { RESENAS, VALORACION } = contenido
  for (const r of RESENAS) {
    for (const campo of ['cita', 'autor']) {
      if (!lleno(r[campo])) problemas.push(`contenido: RESENAS, "${r.id}", ${campo} está vacío`)
    }
  }
  if (!(Number.isInteger(VALORACION.total) && VALORACION.total > 0)) {
    problemas.push('contenido: VALORACION.total tiene que ser un entero positivo')
  }
  if (!lleno(VALORACION.nota)) problemas.push('contenido: VALORACION.nota está vacía')
  if (RESENAS.length > VALORACION.conTexto) {
    problemas.push(`contenido: hay ${RESENAS.length} reseñas y la ficha solo tiene ${VALORACION.conTexto} con texto`)
  }

  // Cada publicación de Instagram: la ruta con la forma que usa el sitio y una foto de Kuyen.
  for (const pub of INSTAGRAM.publicaciones) {
    if (!/^(p|reel)\/[A-Za-z0-9_-]+$/.test(pub.ruta)) {
      problemas.push(`contenido: INSTAGRAM, "${pub.id}", la ruta "${pub.ruta}" tiene que ser p/<código> o reel/<código>`)
    }
    if (!FOTOS.some((f) => f.id === pub.foto)) {
      problemas.push(`contenido: INSTAGRAM, "${pub.id}", la foto "${pub.foto}" no está en FOTOS`)
    }
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
function validarVariante(site, { ruta, html }) {
  const problemas = []

  const h1 = (html.match(/<h1[\s>]/g) || []).length
  if (h1 !== 1) problemas.push(`${ruta}: ${h1} etiquetas <h1> (tiene que haber exactamente 1)`)
  if (!/<html lang="es-CL"/.test(html)) problemas.push(`${ruta}: falta lang="es-CL" en <html>`)
  if (!html.includes(`<meta name="robots" content="${site.robots}">`)) {
    problemas.push(`${ruta}: el robots del <head> no es "${site.robots}", que es lo que declara el sitio`)
  }

  const tokens = html.match(/\{\{\w+\}\}/g)
  if (tokens) problemas.push(`${ruta}: tokens sin resolver: ${[...new Set(tokens)].join(', ')}`)

  for (const ancla of new Set([...html.matchAll(/href="#([\w-]+)"/g)].map((m) => m[1]))) {
    if (!html.includes(`id="${ancla}"`)) problemas.push(`${ruta}: enlace a #${ancla}, que no existe en la página`)
  }

  for (const dato of contenido.DATOS_SIN_CONFIRMAR) {
    if (apareceDatoViejo(html, dato)) problemas.push(`${ruta}: aparece "${dato}", un dato que Kuyen no confirmó`)
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
  return `User-agent: *\nAllow: /\nSitemap: ${site.host}/sitemap.xml\n`
}

const sitemapXml = (site) =>
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>${site.host}/</loc>\n    <changefreq>monthly</changefreq>\n    <priority>1.0</priority>\n  </url>\n</urlset>\n`

/** Escribe una página en su ruta pública (/t/karate -> t/karate.html). */
function escribir(dir, ruta, html) {
  // La raíz es index.html; cualquier otra ruta, su propio .html.
  const relativa = ruta === '/' ? 'index.html' : `${ruta.replace(/^\//, '')}.html`
  const archivo = join(dir, relativa)
  mkdirSync(dirname(archivo), { recursive: true })
  writeFileSync(archivo, html)
}

export async function build({ siteId, out }) {
  const site = SITES[siteId]
  if (!site) throw new Error(`sitio desconocido: ${siteId}`)

  const dir = resolve(ROOT, out)
  if (dir !== ROOT && `${ROOT}${sep}`.startsWith(`${dir}${sep}`)) {
    throw new Error(`--out=${out} contiene al repo: se borraría entero`)
  }

  // El sitio es una sola página: la variante elegida, servida en la raíz.
  const paginas = [{ ruta: '/', html: await buildVariante(site, VARIANTE) }]

  const problemas = [
    ...validarSeo(),
    ...validarContenido(),
    ...paginas.flatMap((pagina) => validarVariante(site, pagina)),
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
    // El preview vive en kuyen-climbing.github.io y se sirve en la raíz, así
    // que va sin CNAME: con CNAME, GitHub Pages redirige al dominio propio.
    if (site.cname) writeFileSync(join(dir, 'CNAME'), `${site.cname}\n`)
    writeFileSync(join(dir, '.nojekyll'), '')
  }

  for (const pagina of paginas) escribir(dir, pagina.ruta, pagina.html)

  writeFileSync(join(dir, 'robots.txt'), robotsTxt(site))
  // El sitemap se borra cuando el sitio deja de indexarse: el build escribe
  // sobre la raíz del repo, así que uno viejo quedaría servido y comiteado,
  // contradiciendo al robots.txt que acaba de decir que no se indexe.
  if (site.sitemap) writeFileSync(join(dir, 'sitemap.xml'), sitemapXml(site))
  else rmSync(join(dir, 'sitemap.xml'), { force: true })

  return { site, paginas: paginas.length, dir: out }
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
  const r = await build({ siteId, out })
  console.log(`${siteId}: ${r.paginas} página en ${r.dir}/ (${r.site.cname || r.site.host})`)
}
