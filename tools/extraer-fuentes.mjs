/**
 * Junta las declaraciones @font-face de los templates capturados en un solo
 * archivo, para que los temas del sitio usen las mismas tipografías que la
 * referencia de la que salen.
 *
 *   node tools/extraer-fuentes.mjs      -> src/css/fuentes-temas.css
 *
 * Las URL dentro de esas declaraciones ya apuntan a temas/<id>/assets/, porque
 * las reescribió la captura. Inter no entra acá: el sitio ya la sirve desde
 * fonts/ (ver src/css/tailwind.css).
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { TEMAS } from '../src/site.config.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

/** Familias que usan los temas, con el tema del que se saca cada una. */
const FAMILIAS = ['Instrument Serif', 'DM Sans', 'Cormorant Garamond', 'Figtree']

/** Saca los bloques @font-face completos de un texto (CSS o HTML con <style>). */
function bloquesFontFace(texto) {
  const bloques = []
  let i = 0
  while ((i = texto.indexOf('@font-face', i)) !== -1) {
    const abre = texto.indexOf('{', i)
    if (abre === -1) break
    let nivel = 1
    let j = abre + 1
    while (j < texto.length && nivel > 0) {
      if (texto[j] === '{') nivel++
      else if (texto[j] === '}') nivel--
      j++
    }
    bloques.push(texto.slice(i, j))
    i = j
  }
  return bloques
}

const familiaDe = (bloque) => (bloque.match(/font-family:\s*['"]?([^;'"}]+)['"]?/i) || [])[1]?.trim()

const salida = []
const vistas = new Set()
let total = 0

for (const tema of TEMAS) {
  const fuentes = []

  const dirAssets = join(ROOT, 'temas', tema.id, 'assets')
  if (existsSync(dirAssets)) {
    for (const f of readdirSync(dirAssets)) {
      if (f.endsWith('.css')) fuentes.push(readFileSync(join(dirAssets, f), 'utf8'))
    }
  }
  const pagina = join(ROOT, 'src', 'temas', tema.id, 'pagina.html')
  if (existsSync(pagina)) fuentes.push(readFileSync(pagina, 'utf8'))

  for (const texto of fuentes) {
    for (const bloque of bloquesFontFace(texto)) {
      const familia = familiaDe(bloque)
      if (!familia || !FAMILIAS.includes(familia)) continue
      // Solo las que sirven un archivo local ya descargado.
      if (!bloque.includes('/temas/')) continue
      const clave = bloque.replace(/\s+/g, ' ')
      if (vistas.has(clave)) continue
      vistas.add(clave)
      salida.push(`/* ${familia} - del template ${tema.nombre} */\n${bloque.trim()}`)
      total++
    }
  }
}

if (!total) {
  console.error('No se encontró ninguna @font-face de las familias buscadas. ¿Están capturados los temas?')
  process.exit(1)
}

const cabecera = `/* Generado por tools/extraer-fuentes.mjs. No editar a mano.
   Tipografías de los templates de referencia, autoalojadas en temas/<id>/assets/.
   Familias: ${FAMILIAS.join(', ')}. */\n\n`

writeFileSync(join(ROOT, 'src', 'css', 'fuentes-temas.css'), cabecera + salida.join('\n\n') + '\n', 'utf8')
console.log(`${total} declaraciones @font-face -> src/css/fuentes-temas.css`)
