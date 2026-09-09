/**
 * Publica el preview en el repo espejo kuyen-climbing/kuyen-climbing.github.io.
 *
 *   node tools/publicar-preview.mjs
 *
 * Por qué un repo aparte: GitHub Pages admite un solo dominio propio por
 * repositorio y responde 404 a cualquier otro Host. La URL genérica de
 * kuyen-web no sirve para previsualizar, porque con CNAME redirige al dominio
 * y sin él las rutas absolutas se rompen bajo el subpath. El espejo se sirve en
 * la raíz de kuyen-climbing.github.io, así que las rutas absolutas funcionan.
 *
 * El espejo es solo salida: no lleva src/ ni tools/. Se regenera y se
 * reemplaza entero en cada publicación. Sale sin CNAME y con noindex, para no
 * competirle en Google al dominio definitivo cuando exista.
 */
import { execFileSync } from 'node:child_process'
import { rmSync, mkdtempSync, cpSync, readdirSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { tmpdir } from 'node:os'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const ESPEJO = 'https://github.com/kuyen-climbing/kuyen-climbing.github.io.git'
const SALIDA = join(ROOT, 'dist-preview')

const git = (args, cwd) => execFileSync('git', args, { cwd, stdio: 'inherit' })

if (!existsSync(SALIDA)) {
  console.error('Falta dist-preview/. Corré antes: node tools/build.mjs --site=preview --out=dist-preview')
  process.exit(1)
}

const trabajo = mkdtempSync(join(tmpdir(), 'kuyen-preview-'))
try {
  console.log(`Clonando el espejo en ${trabajo}`)
  git(['clone', '--depth=1', ESPEJO, trabajo])
  // Si el espejo está recién creado y vacío, el clon deja una rama sin nacer y
  // con el nombre por defecto de quien clona; se fuerza main.
  git(['checkout', '-B', 'main'], trabajo)

  // Se borra todo salvo .git y se copia la salida nueva: así desaparecen del
  // espejo los archivos que ya no existen.
  for (const entrada of readdirSync(trabajo)) {
    if (entrada === '.git') continue
    rmSync(join(trabajo, entrada), { recursive: true, force: true })
  }
  cpSync(SALIDA, trabajo, { recursive: true })

  git(['add', '-A'], trabajo)
  const hay = execFileSync('git', ['status', '--porcelain'], { cwd: trabajo, encoding: 'utf8' }).trim()
  if (!hay) {
    console.log('El espejo ya estaba al día: nada que publicar.')
    process.exit(0)
  }

  const fecha = new Date().toISOString().slice(0, 10)
  git(['commit', '-m', `Preview del ${fecha}`], trabajo)
  git(['push', 'origin', 'main'], trabajo)
  console.log('\nPublicado en https://kuyen-climbing.github.io/')
} finally {
  rmSync(trabajo, { recursive: true, force: true })
}
