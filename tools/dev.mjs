/**
 * Entorno local: genera el sitio en dist/, lo sirve en http://localhost:8100 y lo
 * vuelve a generar solo cada vez que cambia algo en src/.
 *
 *   npm run dev            (o: node tools/dev.mjs --port=8100)
 *
 * Sirve para trabajar sin esperar la caché de GitHub Pages, que guarda cada
 * versión 10 minutos: el servidor local responde con no-store, así que un cambio
 * se ve con solo recargar.
 */
import { spawn, spawnSync } from 'node:child_process'
import { watch } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const PUERTO = Number((process.argv.find((a) => a.startsWith('--port=')) || '--port=8100').split('=')[1])

function generar(motivo) {
  const inicio = Date.now()
  const r = spawnSync(process.execPath, ['tools/build.mjs', '--out=dist'], { cwd: ROOT, encoding: 'utf8' })
  const hora = new Date().toLocaleTimeString('es-CL')
  if (r.status === 0) {
    console.log(`[${hora}] ${motivo}: sitio regenerado en ${Date.now() - inicio} ms`)
  } else {
    console.error(`[${hora}] ${motivo}: el build falló\n${(r.stderr || r.stdout).trim()}`)
  }
  return r.status === 0
}

if (!generar('inicio')) process.exit(1)

const servidor = spawn(process.execPath, ['tools/serve.mjs', 'dist', `--port=${PUERTO}`], {
  cwd: ROOT,
  stdio: 'inherit',
})

// Un guardado dispara varios eventos seguidos: se agrupan en un solo build.
let pendiente = null
watch(join(ROOT, 'src'), { recursive: true }, (_, archivo) => {
  clearTimeout(pendiente)
  pendiente = setTimeout(() => generar(`cambió src/${String(archivo ?? '').replaceAll('\\', '/')}`), 250)
})

console.log(`\nAbre http://localhost:${PUERTO}/ en Chrome. Ctrl+C para salir.\n`)

const salir = () => {
  servidor.kill()
  process.exit(0)
}
process.on('SIGINT', salir)
process.on('SIGTERM', salir)
