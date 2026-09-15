/**
 * Verificación funcional del sitio generado, contra un servidor levantado con
 * tools/serve.mjs (que resuelve las URLs igual que GitHub Pages).
 *
 *   node tools/serve.mjs dist --port=8100 &
 *   node tools/verify.mjs --port=8100
 *
 * Cada /t/<id> es la variante propia del template, si ya existe, o la captura.
 */
import { TEMAS, TEMA_POR_DEFECTO, rutaTema } from '../src/site.config.mjs'
import { tieneVariante, TERCEROS } from './build.mjs'

const port = Number((process.argv.find((a) => a.startsWith('--port=')) || '--port=8100').split('=')[1])
const BASE = `http://localhost:${port}`

const fallas = []
const falla = (msg) => fallas.push(msg)

async function responde(ruta, donde) {
  const r = await fetch(BASE + ruta)
  if (r.status !== 200) falla(`${donde}: ${ruta} respondió ${r.status}`)
  return r.status === 200
}

// El marco.
const res = await fetch(`${BASE}/`)
if (res.status !== 200) {
  falla(`/: respondió ${res.status}`)
} else {
  const html = await res.text()
  if ((html.match(/<h1[\s>]/g) || []).length !== 1) falla('/: tiene que haber exactamente un <h1>')
  if (!/<html lang="es-[A-Z]{2}"[^>]*>/.test(html)) falla('/: falta lang="es-*" en <html>')
  if (!html.includes('data-tema-boton')) falla('/: sin el ToggleTheme')
  if (!html.includes(`src="${rutaTema(TEMA_POR_DEFECTO)}"`)) falla('/: el marco no abre con el template por defecto')
  for (const t of TEMAS) {
    if (!html.includes(`"id":"${t.id}"`)) falla(`/: el toggle no conoce el template ${t.id}`)
  }
  for (const m of html.matchAll(/href="(\/img\/[^"]+)"/g)) await responde(m[1], '/')
}

let variantes = 0
for (const tema of TEMAS) {
  const ruta = rutaTema(tema.id)
  const r = await fetch(BASE + ruta)
  if (r.status !== 200) {
    falla(`${ruta}: respondió ${r.status}`)
    continue
  }
  const html = await r.text()
  if (!/name="robots"[^>]*noindex/.test(html)) falla(`${ruta}: sin noindex`)

  if (tieneVariante(tema.id)) {
    // La variante propia: un <h1>, datos estructurados, nada de terceros y todos
    // sus assets locales respondiendo.
    variantes++
    if ((html.match(/<h1[\s>]/g) || []).length !== 1) falla(`${ruta}: tiene que haber exactamente un <h1>`)
    if (!/<html lang="es-CL"/.test(html)) falla(`${ruta}: falta lang="es-CL" en <html>`)
    if (!html.includes('"@type": "SportsActivityLocation"')) falla(`${ruta}: faltan los datos estructurados`)
    const minusculas = html.toLowerCase()
    for (const t of TERCEROS) if (minusculas.includes(t.toLowerCase())) falla(`${ruta}: referencia a "${t}"`)

    const refs = new Set()
    for (const m of html.matchAll(/(?:src|href)="(\/[^"#?]*)/g)) refs.add(m[1])
    for (const m of html.matchAll(/srcset="([^"]+)"/g)) for (const p of m[1].split(',')) refs.add(p.trim().split(/\s+/)[0])
    for (const m of html.matchAll(/url\(["']?(\/[^"')?#]+)/g)) refs.add(m[1])
    for (const ref of refs) if (/\.\w+$/.test(ref)) await responde(ref, ruta)
    continue
  }

  // La captura: que lleve el arranque y que sus assets estén donde el HTML dice.
  if (!html.includes('history.replaceState')) falla(`${ruta}: sin el arranque que fija la ruta del router`)

  const assets = [...new Set([...html.matchAll(new RegExp(`/temas/${tema.id}/[\\w./@-]+`, 'g'))].map((m) => m[0]))]
  if (assets.length < 3) falla(`${ruta}: solo ${assets.length} assets locales referenciados`)

  // Una muestra, y siempre el JavaScript, que es lo que se rompía al moverlo.
  const js = assets.filter((a) => a.endsWith('.js')).slice(0, 4)
  for (const a of [...assets.slice(0, 6), ...js]) await responde(a, ruta)
}

if (fallas.length) {
  console.error('\nVerificación falló:\n')
  console.error(fallas.map((f) => `  ${f}`).join('\n'))
  process.exit(1)
}
console.log(`Verificación OK: el marco, ${variantes} variantes y ${TEMAS.length - variantes} capturas.`)
