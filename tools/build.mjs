/**
 * Generador del sitio de Kuyen Climbing.
 *
 *   node tools/build.mjs [--site=cl|preview] [--out DIR]
 *
 * Mismo generador que usa INCBA para sus sitios institucionales (ver
 * C:\Proyectos\INCBA\docs\Flujo-Sitios-Web-GitHub-Pages.md), con la plantilla
 * y las visuales propias de Kuyen. Las páginas se arman con los partials de
 * src/partials/ y las secciones de src/sections/; todo lo que describe cada
 * página sale de src/site.config.mjs.
 *
 * El CSS (css/styles.css) lo genera Tailwind a partir de las clases usadas en
 * src/ y js/: `npm run build:css`. `npm run build` hace las dos cosas.
 *
 * El build es determinista y valida antes de escribir: si algo no cumple,
 * aborta sin tocar el disco y dice qué.
 */

import { readFileSync, writeFileSync, readdirSync, rmSync, mkdirSync, cpSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { SITES, PAGES, TEMAS, MENU, TEMA_POR_DEFECTO, LIMITES, MINIMO_PALABRAS_DEFAULT, NEGOCIO, rutaTema } from '../src/site.config.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const SRC = join(ROOT, 'src')

const read = (...p) => readFileSync(join(SRC, ...p), 'utf8')
const countOf = (hay, needle) => hay.split(needle).length - 1
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

function fill(tpl, vars) {
  return tpl.replace(/\{\{(\w+)\}\}/g, (m, k) => (k in vars ? vars[k] : m))
}

const urlOf = (site, slug) => (slug ? `${site.host}/${slug}` : `${site.host}/`)
const pathOf = (slug) => (slug ? `/${slug}` : '/')

// Clases de los enlaces de navegación. Como todo el sitio se pinta con los
// tokens del tema activo, el menú cambia de color junto con el resto.
const CLASE_ENLACE =
  'inline-block rounded-tema px-3 py-2 text-sm font-medium text-suave-texto transition hover:bg-suave hover:text-texto'
const CLASE_ENLACE_MOVIL = 'block w-full rounded-tema px-3 py-3 text-base font-medium hover:bg-suave'
const CLASE_ENLACE_PIE = 'text-suave-texto transition hover:text-texto'

/**
 * Datos estructurados. La home declara el negocio completo (SportsActivityLocation
 * es el tipo de schema.org para un centro deportivo: es lo que lee Google para la
 * ficha del negocio); el resto de las páginas declara su miga de pan.
 */
function jsonLd(site, page) {
  const blocks = []
  if (page.slug === '') {
    blocks.push({
      '@context': 'https://schema.org',
      '@type': 'SportsActivityLocation',
      name: NEGOCIO.nombre,
      url: site.host,
      description:
        'Centro de escalada en boulder en Padre Las Casas, La Araucanía: muro con desplomes hasta 25°, moonboard y clases guiadas.',
      telephone: NEGOCIO.telefonoE164,
      address: {
        '@type': 'PostalAddress',
        streetAddress: NEGOCIO.calle,
        addressLocality: NEGOCIO.comuna,
        addressRegion: NEGOCIO.region,
        postalCode: NEGOCIO.codigoPostal,
        addressCountry: site.addressCountry,
      },
      geo: { '@type': 'GeoCoordinates', latitude: NEGOCIO.lat, longitude: NEGOCIO.lng },
      sameAs: [NEGOCIO.instagram, NEGOCIO.maps],
      hasMap: NEGOCIO.maps,
    })
  } else {
    const trail = [{ name: 'Inicio', path: '/' }, { name: page.breadcrumb }]
    blocks.push({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: trail.map((n, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: n.name,
        item: n.path ? `${site.host}${n.path}` : urlOf(site, page.slug),
      })),
    })
  }
  return blocks
    .map((b) => `  <script type="application/ld+json">\n${JSON.stringify(b, null, 2).replace(/^/gm, '  ')}\n  </script>`)
    .join('\n')
}

/**
 * Enlaces del menú. Salen de MENU (hoy anclas de la única página); cuando se
 * abran las páginas internas, MENU pasa a listar rutas y esto no cambia.
 */
function navLinks(clase, sangria) {
  const pad = ' '.repeat(sangria)
  return MENU.map((m) => `${pad}<a class="${clase}" href="${m.href}">${m.texto}</a>`).join('\n')
}

// Versión corta del contenido de css/ y js/: va como ?v= en las URLs para que
// una publicación nueva no conviva con un CSS viejo en la caché del navegador
// (GitHub Pages cachea 10 minutos).
function versionDe(...archivos) {
  const h = createHash('sha1')
  // Saltos de línea normalizados: el hash tiene que dar igual en Windows (CRLF) y en la CI (LF).
  for (const a of archivos) if (existsSync(join(ROOT, a))) h.update(readFileSync(join(ROOT, a), 'utf8').split(String.fromCharCode(13)).join(''))
  return h.digest('hex').slice(0, 8)
}

function buildPage(site, page, sections, partials) {
  const vars = {
    lang: site.lang,
    host: site.host,
    locale: site.locale,
    robots: site.robots,
    cssv: versionDe('css/styles.css'),
    jsv: versionDe('js/main.js'),
    telefono: NEGOCIO.telefono,
    telefonoE164: NEGOCIO.telefonoE164,
    whatsapp: NEGOCIO.whatsapp,
    instagram: NEGOCIO.instagram,
    instagramUser: NEGOCIO.instagramUser,
    maps: NEGOCIO.maps,
    calle: NEGOCIO.calle,
    comuna: NEGOCIO.comuna,
    region: NEGOCIO.region,
    anio: new Date().getFullYear(),
    temaPorDefecto: TEMA_POR_DEFECTO,
    temasIds: JSON.stringify(TEMAS.map((t) => t.id)),
  }

  const body = page.sections
    .map((name) => {
      if (!(name in sections)) throw new Error(`falta src/sections/${name}.html (página /${page.slug})`)
      return fill(sections[name], vars)
    })
    .join('\n')

  const head = fill(partials.head, {
    ...vars,
    title: esc(page.title),
    description: esc(page.description),
    canonical: urlOf(site, page.slug),
    jsonld: jsonLd(site, page),
  })

  const bloqueMovil = fill(partials.navMovil, { ...vars, mobileLinks: navLinks(CLASE_ENLACE_MOVIL, 16) })

  const porDefecto = TEMAS.find((t) => t.id === TEMA_POR_DEFECTO) || TEMAS[0]
  const toggleTema = fill(partials.toggleTema, {
    ...vars,
    temasJson: JSON.stringify(TEMAS.map((t) => ({ id: t.id, nombre: t.nombre, icono: t.icono }))),
    temaIconoInicial: porDefecto.icono,
    temaNombreInicial: porDefecto.nombre,
  })

  const nav = fill(partials.nav, {
    ...vars,
    navLinks: navLinks(CLASE_ENLACE, 12),
    bloqueMovil,
    toggleTema,
  })

  const footer = fill(partials.footer, { ...vars, navLinks: navLinks(CLASE_ENLACE_PIE, 12) })

  const html = [head, nav, '', '  <main id="contenido">', body, '  </main>', '', footer].join('\n')

  return { title: page.title, description: page.description, canonical: urlOf(site, page.slug), html, page }
}

/**
 * Captura de referencia de un template: el HTML original tal cual, con un
 * noindex en la cabecera y un aviso de que es material de referencia. Sirve
 * para comparar el tema del sitio contra el template del que salió.
 */
function buildTema(tema) {
  const archivo = join(SRC, 'temas', tema.id, 'pagina.html')
  if (!existsSync(archivo)) {
    throw new Error(
      `falta la captura de "${tema.id}". Corré: node ${tema.render ? '--experimental-websocket ' : ''}tools/capturar-tema.mjs ${tema.id} ${tema.fuente}${tema.render ? ' --render' : ''}`
    )
  }
  let html = readFileSync(archivo, 'utf8')

  // Retoques del template: restos que deja la captura al no reusar el
  // JavaScript original (carteles de error de escenas 3D, por ejemplo).
  for (const patron of tema.limpiar || []) html = html.replace(patron, '')

  // Si el template ya trae su propio robots (Hive y Karate vienen con
  // index,follow), se reemplaza; si no trae, se agrega.
  const noindex = '<meta name="robots" content="noindex, nofollow">'
  if (/<meta[^>]+name=["']robots["'][^>]*>/i.test(html)) {
    html = html.replace(/<meta[^>]+name=["']robots["'][^>]*>/gi, noindex)
  } else if (/<head[^>]*>/i.test(html)) {
    html = html.replace(/<head([^>]*)>/i, `<head$1>\n${noindex}`)
  }

  // Aviso fijo: quien abra esta URL tiene que saber que está viendo el
  // template original de un tercero, no el sitio de Kuyen.
  const aviso = `<div style="position:fixed;left:50%;bottom:1rem;transform:translateX(-50%);z-index:2147483000;display:flex;align-items:center;gap:.75rem;padding:.6rem 1rem;border-radius:9999px;background:rgba(10,14,29,.92);color:#f5f5f5;border:1px solid rgba(255,255,255,.16);box-shadow:0 10px 30px rgba(0,0,0,.35);font:600 12px/1 ui-sans-serif,system-ui,sans-serif;backdrop-filter:blur(8px)">
  <span>Template de referencia: ${tema.nombre}</span>
  <a href="/" style="color:#ff9b57;text-decoration:none">Ver el sitio de Kuyen</a>
</div>`

  html = /<\/body>/i.test(html) ? html.replace(/<\/body>/i, `${aviso}\n</body>`) : html + aviso

  return { tema, html }
}

function contarPalabras(html) {
  const t = html
    .replace(/<(script|style|svg)\b[\s\S]*?<\/\1>/g, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<head\b[\s\S]*?<\/head>/g, ' ')
    .replace(/<header\b[\s\S]*?<\/header>/g, ' ')
    .replace(/<footer\b[\s\S]*?<\/footer>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
  return t.split(/\s+/).filter(Boolean).length
}

function validate(site, built) {
  const problems = []
  const seen = { title: new Map(), description: new Map(), canonical: new Map() }

  for (const [slug, page] of built) {
    const ruta = pathOf(slug)

    if (page.title.length > LIMITES.title) {
      problems.push(`${ruta}: título de ${page.title.length} caracteres (máximo ${LIMITES.title})`)
    }
    if (page.description.length > LIMITES.description) {
      problems.push(`${ruta}: descripción de ${page.description.length} caracteres (máximo ${LIMITES.description})`)
    }
    for (const campo of ['title', 'description', 'canonical']) {
      const previo = seen[campo].get(page[campo])
      if (previo !== undefined) problems.push(`${ruta}: ${campo} repetido, ya lo usa ${pathOf(previo)}`)
      else seen[campo].set(page[campo], slug)
    }

    const h1 = countOf(page.html, '<h1')
    if (h1 !== 1) problems.push(`${ruta}: ${h1} etiquetas <h1> (tiene que haber exactamente 1)`)

    const sinResolver = page.html.match(/\{\{\w+\}\}/g)
    if (sinResolver) problems.push(`${ruta}: tokens sin resolver ${[...new Set(sinResolver)].join(', ')}`)

    const relativos = page.html.match(/(?:src|href)="(?:img|css|js|fonts|site\.webmanifest)/g)
    if (relativos) problems.push(`${ruta}: ${relativos.length} rutas de asset relativas`)

    // Un enlace a una #ancla tiene que existir en la misma página.
    for (const m of page.html.matchAll(/href="#([\w-]+)"/g)) {
      if (!page.html.includes(`id="${m[1]}"`)) problems.push(`${ruta}: enlace a #${m[1]}, que no existe en esa página`)
    }

    const palabras = contarPalabras(page.html)
    const minimo = page.page.minPalabras ?? MINIMO_PALABRAS_DEFAULT
    if (palabras < minimo) {
      problems.push(`${ruta}: ${palabras} palabras de contenido (mínimo ${minimo})`)
    }
  }
  return problems
}

function robotsTxt(site) {
  if (!site.sitemap) return '# Preview interno: no indexar.\nUser-agent: *\nDisallow: /\n'
  return `User-agent: *\nAllow: /\nSitemap: ${site.host}/sitemap.xml\n`
}

function sitemapXml(site) {
  const urls = PAGES.map(
    (p) => `  <url>\n    <loc>${urlOf(site, p.slug)}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>${p.slug === '' ? '1.0' : '0.8'}</priority>\n  </url>`
  ).join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
}

export function build({ siteId, out }) {
  const site = SITES[siteId]
  if (!site) throw new Error(`sitio desconocido: ${siteId}`)

  const partials = {
    head: read('partials', 'head.html'),
    nav: read('partials', 'nav.html'),
    navMovil: read('partials', 'nav-movil.html'),
    toggleTema: read('partials', 'toggle-tema.html'),
    footer: read('partials', 'footer.html'),
  }

  const sections = {}
  for (const f of readdirSync(join(SRC, 'sections'))) {
    if (f.endsWith('.html')) sections[f.slice(0, -5)] = read('sections', f)
  }

  const built = PAGES.map((p) => [p.slug, buildPage(site, p, sections, partials)])

  // Las páginas de tema son markup de terceros capturado tal cual: no pasan
  // por las validaciones propias (títulos, un solo h1, rutas de asset).
  const temas = TEMAS.map((t) => buildTema(t))

  const problems = validate(site, built)
  if (problems.length) {
    console.error(`\nEl build no pasa las validaciones:\n`)
    console.error(problems.map((p) => `  ${p}`).join('\n'))
    console.error('\nNada se escribió en disco.\n')
    process.exit(1)
  }

  const dir = join(ROOT, out)
  if (out !== '.') {
    rmSync(dir, { recursive: true, force: true })
    mkdirSync(dir, { recursive: true })
    for (const asset of ['css', 'js', 'img', 'fonts', 'temas']) {
      if (existsSync(join(ROOT, asset))) cpSync(join(ROOT, asset), join(dir, asset), { recursive: true })
    }
    // El preview vive en kuyen-climbing.github.io y se sirve en la raíz, así
    // que va sin CNAME: con CNAME, GitHub Pages redirige al dominio propio.
    if (site.cname) writeFileSync(join(dir, 'CNAME'), `${site.cname}\n`)
    writeFileSync(join(dir, '.nojekyll'), '')
  }

  for (const [slug, page] of built) {
    const archivo = join(dir, slug ? `${slug}.html` : 'index.html')
    mkdirSync(dirname(archivo), { recursive: true })
    writeFileSync(archivo, page.html)
  }
  for (const { tema, html } of temas) {
    const archivo = join(dir, `${rutaTema(tema.id).replace(/^\//, '')}.html`)
    mkdirSync(dirname(archivo), { recursive: true })
    writeFileSync(archivo, html)
  }

  writeFileSync(join(dir, 'robots.txt'), robotsTxt(site))
  if (site.sitemap) writeFileSync(join(dir, 'sitemap.xml'), sitemapXml(site))

  return { site, count: built.length, temas: temas.length, dir: out }
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
  console.log(`${siteId}: ${r.count} página propia + ${r.temas} temas en ${r.dir}/ (${r.site.cname || r.site.host})`)
}
