/**
 * Verificación funcional del sitio generado, contra un servidor levantado con
 * tools/serve.mjs (que resuelve las URLs igual que GitHub Pages).
 *
 *   node tools/serve.mjs . --port=8100 &
 *   node tools/verify.mjs --port=8100
 *
 * El sitio es una sola página, servida en la raíz: la variante de Hirael con el
 * contenido de Kuyen. Lo que se revisa es que responda, que esté bien formada,
 * que no arrastre nada de terceros y que cada asset que nombra exista.
 */
import { SITES, VARIANTE } from '../src/site.config.mjs'
import { TERCEROS, politicaDeSeguridad } from './build.mjs'

const port = Number((process.argv.find((a) => a.startsWith('--port=')) || '--port=8100').split('=')[1])
const siteId = (process.argv.find((a) => a.startsWith('--site=')) || '--site=cl').split('=')[1]
const site = SITES[siteId]
const BASE = `http://localhost:${port}`

const fallas = []
const falla = (msg) => fallas.push(msg)

async function responde(ruta, donde) {
  const r = await fetch(BASE + ruta)
  if (r.status !== 200) falla(`${donde}: ${ruta} respondió ${r.status}`)
  return r.status === 200
}

const res = await fetch(`${BASE}/`)
if (res.status !== 200) {
  falla(`/: respondió ${res.status}`)
} else {
  const html = await res.text()

  if ((html.match(/<h1[\s>]/g) || []).length !== 1) falla('/: tiene que haber exactamente un <h1>')
  if (!/<html lang="es-CL"/.test(html)) falla('/: falta lang="es-CL" en <html>')
  if (!html.includes('"@type": "SportsActivityLocation"')) falla('/: faltan los datos estructurados')
  if (!html.includes(`<meta name="robots" content="${site.robots}">`)) {
    falla(`/: el robots del <head> no es "${site.robots}"`)
  }
  if (!html.includes(`<link rel="canonical" href="${site.host}/">`)) {
    falla(`/: la canónica no apunta a ${site.host}/`)
  }

  // La política de seguridad tiene que cubrir los scripts inline que la página
  // lleva ahora: si alguien toca el HTML a mano, el hash deja de coincidir.
  const csp = html.match(/<meta http-equiv="Content-Security-Policy" content="([^"]*)">/)
  if (!csp) falla('/: falta la política de seguridad (Content-Security-Policy)')
  else if (csp[1] !== politicaDeSeguridad(html)) falla('/: la política de seguridad no corresponde a los scripts de la página')
  if (!html.includes('<meta name="referrer" content="strict-origin-when-cross-origin">')) falla('/: falta la política de referrer')

  // Nada del template original ni de otros dominios: el markup es propio.
  const minusculas = html.toLowerCase()
  for (const t of TERCEROS) if (minusculas.includes(t.toLowerCase())) falla(`/: referencia a "${t}"`)

  // Cada asset que la página nombra tiene que existir en el sitio.
  const refs = new Set()
  for (const m of html.matchAll(/(?:src|href)="(\/[^"#?]*)/g)) refs.add(m[1])
  for (const m of html.matchAll(/srcset="([^"]+)"/g)) for (const p of m[1].split(',')) refs.add(p.trim().split(/\s+/)[0])
  for (const m of html.matchAll(/url\(["']?(\/[^"')?#]+)/g)) refs.add(m[1])
  for (const ref of refs) if (/\.\w+$/.test(ref)) await responde(ref, '/')
}

// robots.txt y sitemap tienen que decir lo mismo que la configuración del sitio.
const robots = await fetch(`${BASE}/robots.txt`)
if (robots.status !== 200) falla(`/robots.txt: respondió ${robots.status}`)
else {
  const txt = await robots.text()
  if (site.sitemap && !txt.includes(`${site.host}/sitemap.xml`)) falla('/robots.txt: no declara el sitemap')
  if (!site.sitemap && !/Disallow: \/\s*$/m.test(txt)) falla('/robots.txt: tendría que cerrar el sitio entero')
}

const sitemap = await fetch(`${BASE}/sitemap.xml`)
if (site.sitemap) {
  if (sitemap.status !== 200) falla(`/sitemap.xml: respondió ${sitemap.status}`)
  else if (!(await sitemap.text()).includes(`${site.host}/`)) falla('/sitemap.xml: no lista la raíz')
} else if (sitemap.status === 200) {
  falla('/sitemap.xml: existe, y este sitio no se indexa')
}

// Lo que se fue con la elección del template: si algo de esto sigue en pie, es
// que quedó material viejo servido.
for (const ruta of ['/t/hirael', '/t/karate', '/t/nex', '/temas/hirael/', '/ref/hirael']) {
  const r = await fetch(BASE + ruta)
  if (r.status === 200) falla(`${ruta}: sigue publicado, y ya no debería existir`)
}

if (fallas.length) {
  console.error('\nVerificación falló:\n')
  console.error(fallas.map((f) => `  ${f}`).join('\n'))
  process.exit(1)
}
console.log(`Verificación OK: ${site.host}/ sirve la variante ${VARIANTE.nombre}.`)
