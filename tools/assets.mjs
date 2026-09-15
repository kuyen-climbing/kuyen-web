/**
 * Genera las fotos y los derivados de marca del sitio a partir de los originales
 * que entrega Kuyen. Los originales no entran al repo: pesan entre 3 y 5 MB.
 *
 *   node tools/assets.mjs fotos --origen=<carpeta con los JPG>
 *   node tools/assets.mjs marca --origen=<carpeta con los PNG del logo> \
 *        --titulo=<BebasNeue.ttf> --texto=<Inter.ttf>
 *
 * Necesita ImageMagick (convert e identify). Los TTF son las mismas familias de
 * fonts/, en su versión de escritorio de Google Fonts: ImageMagick no lee woff2.
 *
 * Salida:
 *   img/fotos/<id>-<ancho>.webp  y  img/fotos/fotos.json (medidas y pesos)
 *   img/marca/  isotipo, logo completo, favicons y og-kuyen.jpg (1200 x 630)
 */
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { FOTOS } from '../src/contenido.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const TOPE_KB = 300

const [comando, ...resto] = process.argv.slice(2)
const args = Object.fromEntries(resto.map((a) => a.replace(/^--/, '').split('=')))

const convert = (...a) => execFileSync('convert', a, { stdio: ['ignore', 'pipe', 'inherit'] })
const identify = (formato, archivo) => execFileSync('identify', ['-format', formato, archivo], { encoding: 'utf8' }).trim()
const kb = (archivo) => Math.round(statSync(archivo).size / 1024)

function exigir(nombre) {
  if (!args[nombre] || !existsSync(args[nombre])) {
    console.error(`Falta --${nombre}=<ruta> o la ruta no existe.`)
    process.exit(1)
  }
  return args[nombre]
}

/** Fotos en WebP, con la orientación EXIF aplicada y bajo el tope de peso. */
function fotos() {
  const origen = exigir('origen')
  const dir = join(ROOT, 'img', 'fotos')
  mkdirSync(dir, { recursive: true })
  const manifiesto = {}

  for (const foto of FOTOS) {
    const original = join(origen, foto.original)
    if (!existsSync(original)) {
      console.error(`No está ${foto.original} en ${origen}.`)
      process.exit(1)
    }
    manifiesto[foto.id] = {}
    for (const ancho of foto.anchos) {
      const salida = join(dir, `${foto.id}-${ancho}.webp`)
      // Se baja la calidad de a poco hasta quedar bajo el tope.
      for (const calidad of [78, 70, 62, 54]) {
        convert(original, '-auto-orient', '-resize', `${ancho}x${ancho}>`, '-strip', '-quality', String(calidad), '-define', 'webp:method=6', salida)
        if (kb(salida) <= TOPE_KB) break
      }
      const [w, h] = identify('%w %h', salida).split(' ').map(Number)
      manifiesto[foto.id][ancho] = { ancho: w, alto: h, kb: kb(salida) }
      console.log(`${foto.id}-${ancho}.webp  ${w}x${h}  ${kb(salida)} KB`)
    }
  }

  writeFileSync(join(dir, 'fotos.json'), `${JSON.stringify(manifiesto, null, 2)}\n`)
}

/** Cinco tonos del gradiente del logo, con las mismas paradas que --kuyen-gradiente. */
const GRADIENTE = [
  [0, [0x2b, 0x2e, 0x83]],
  [0.25, [0x3c, 0x2d, 0x78]],
  [0.5, [0x4e, 0x2a, 0x65]],
  [0.75, [0x5b, 0x26, 0x52]],
  [1, [0x67, 0x1f, 0x37]],
]

function colorEn(t) {
  for (let i = 1; i < GRADIENTE.length; i++) {
    const [t1, c1] = GRADIENTE[i]
    const [t0, c0] = GRADIENTE[i - 1]
    if (t <= t1) {
      const f = (t - t0) / (t1 - t0)
      return c0.map((c, k) => Math.round(c + (c1[k] - c) * f))
    }
  }
  return GRADIENTE.at(-1)[1]
}

/** Isotipo, logo completo, favicons y og:image. */
function marca() {
  const origen = exigir('origen')
  const titulo = exigir('titulo')
  const texto = exigir('texto')
  const logoAlta = join(origen, 'Kuyen C. 2.0 borde blanco 300 dpi_impresion.png')
  const logoDigital = join(origen, 'Kuyen C. 2.0 borde blanco 72 dpi_uso digital.png')
  for (const f of [logoAlta, logoDigital]) {
    if (!existsSync(f)) {
      console.error(`No está ${f}.`)
      process.exit(1)
    }
  }

  const dir = join(ROOT, 'img', 'marca')
  mkdirSync(dir, { recursive: true })
  const tmp = mkdtempSync(join(tmpdir(), 'kuyen-marca-'))

  try {
    // El borde blanco del logo rodea el círculo y el texto como una sola forma,
    // así que el isotipo se recorta con una máscara circular:
    // 1. Un cuadrado del ancho del logo, pegado arriba.
    // 2. Dentro, la caja de lo que no es blanco da el círculo de color (la
    //    diéresis del texto que asoma abajo es más angosta y no cambia el ancho).
    // 3. La máscara es ese círculo más el grosor del borde blanco.
    const [w, , x, y] = identify('%@', logoAlta).match(/\d+/g).map(Number)
    const cuadrado = join(tmp, 'cuadrado.png')
    convert(logoAlta, '-crop', `${w}x${w}+${x}+${y}`, '+repage', cuadrado)
    const caja = execFileSync(
      'convert',
      [cuadrado, '-background', 'white', '-alpha', 'remove', '-alpha', 'off', '-fuzz', '12%', '-format', '%@', 'info:'],
      { encoding: 'utf8' }
    )
    const [diametro, , cx0, cy0] = caja.match(/\d+/g).map(Number)
    const radio = Math.round(diametro / 2 + (w - diametro) / 2)
    const cx = cx0 + Math.round(diametro / 2)
    const cy = cy0 + Math.round(diametro / 2)
    const isotipo = join(tmp, 'isotipo.png')
    convert(
      cuadrado,
      '(', '-size', `${w}x${w}`, 'xc:none', '-fill', 'white', '-draw', `circle ${cx},${cy} ${cx + radio},${cy}`, ')',
      '-compose', 'DstIn', '-composite',
      '-crop', `${radio * 2}x${radio * 2}+${cx - radio}+${cy - radio}`, '+repage',
      isotipo
    )

    const salidas = []
    const png = (nombre, lado, ...extra) => {
      const archivo = join(dir, nombre)
      convert(isotipo, '-resize', `${lado}x${lado}`, ...extra, '-strip', archivo)
      salidas.push(archivo)
    }
    png('isotipo-512.png', 512)
    png('favicon-512.png', 512)
    png('favicon-192.png', 192)
    png('favicon-32.png', 32)
    // iOS pinta de negro lo transparente: el ícono de inicio va sobre blanco.
    png('apple-touch-icon.png', 180, '-background', 'white', '-alpha', 'remove', '-alpha', 'off')
    for (const lado of [512, 256]) {
      const archivo = join(dir, `isotipo-${lado}.webp`)
      convert(isotipo, '-resize', `${lado}x${lado}`, '-strip', '-quality', '90', '-define', 'webp:alpha-quality=100', archivo)
      salidas.push(archivo)
    }
    // Logo completo, para fondos claros (el texto del logo es #2E2A2A).
    const completo = join(dir, 'logo-completo-600.webp')
    convert(logoDigital, '-trim', '+repage', '-resize', '600x600', '-strip', '-quality', '90', '-define', 'webp:alpha-quality=100', completo)
    salidas.push(completo)

    // og:image: el gradiente del logo en un PPM calculado con las mismas paradas
    // que --kuyen-gradiente, el isotipo a la izquierda y el nombre a la derecha.
    const W = 1200
    const H = 630
    const cabecera = Buffer.from(`P6\n${W} ${H}\n255\n`)
    const pixeles = Buffer.alloc(W * H * 3)
    for (let fila = 0; fila < H; fila++) {
      const [r, g, b] = colorEn(fila / (H - 1))
      for (let col = 0; col < W; col++) {
        const i = (fila * W + col) * 3
        pixeles[i] = r
        pixeles[i + 1] = g
        pixeles[i + 2] = b
      }
    }
    const fondo = join(tmp, 'fondo.ppm')
    writeFileSync(fondo, Buffer.concat([cabecera, pixeles]))

    const og = join(dir, 'og-kuyen.jpg')
    convert(
      fondo,
      '(', isotipo, '-resize', '380x380', ')', '-geometry', '+110+125', '-composite',
      '-fill', 'white', '-font', titulo, '-pointsize', '150', '-annotate', '+560+330', 'KÜYEN',
      '-font', titulo, '-pointsize', '150', '-annotate', '+560+465', 'CLIMBING',
      '-fill', '#C9B9F0', '-font', texto, '-pointsize', '30', '-annotate', '+566+525', 'Escalada en boulder · Padre Las Casas',
      '-strip', '-quality', '86', og
    )
    salidas.push(og)

    for (const archivo of salidas) {
      console.log(`${archivo.replace(`${ROOT}/`, '')}  ${identify('%wx%h', archivo)}  ${kb(archivo)} KB`)
    }
  } finally {
    rmSync(tmp, { recursive: true, force: true })
  }
}

if (comando === 'fotos') fotos()
else if (comando === 'marca') marca()
else {
  console.error('Uso: node tools/assets.mjs fotos|marca --origen=<carpeta> [--titulo=<ttf> --texto=<ttf>]')
  process.exit(1)
}
