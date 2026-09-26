/**
 * Genera las fotos y los derivados de marca del sitio a partir de los originales
 * que entrega Kuyen. Los originales no entran al repo: pesan entre 3 y 5 MB.
 *
 *   node tools/assets.mjs fotos --origen=<carpeta con los JPG>
 *   node tools/assets.mjs marca --origen=<carpeta con los PNG del logo> \
 *        --titulo=<BebasNeue.ttf> --texto=<Inter.ttf>
 *
 *   node tools/assets.mjs escena --origen=<carpeta con el arte de 15 x 20>
 *
 * Necesita ImageMagick (convert e identify). Los TTF son las mismas familias de
 * fonts/, en su versión de escritorio de Google Fonts: ImageMagick no lee woff2.
 *
 * Salida:
 *   img/fotos/<id>-<ancho>.webp  y  img/fotos/fotos.json (medidas y pesos)
 *   img/marca/  isotipo, logo completo, favicons y og-kuyen.jpg (1200 x 630)
 *   img/escena/ la cordillera con los gatos y la luna del logo, con el cielo
 *               transparente, para montarlas sobre el gradiente del sitio
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
    // Recorte opcional, para dejar fuera una marca de terceros o reencuadrar.
    // Va después de -auto-orient, así la geometría se lee sobre la foto derecha.
    const recorte = foto.recorte ? ['-gravity', foto.recorte.desde, '-crop', foto.recorte.zona, '+repage'] : []

    manifiesto[foto.id] = {}
    for (const ancho of foto.anchos) {
      const salida = join(dir, `${foto.id}-${ancho}.webp`)
      // Se baja la calidad de a poco hasta quedar bajo el tope.
      for (const calidad of [78, 70, 62, 54]) {
        convert(original, '-auto-orient', ...recorte, '-resize', `${ancho}x${ancho}>`, '-strip', '-quality', String(calidad), '-define', 'webp:method=6', salida)
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
      '-fill', 'white', '-font', titulo, '-pointsize', '112', '-annotate', '+556+318', 'KÜYEN',
      '-font', titulo, '-pointsize', '112', '-annotate', '+556+440', 'CLIMBING',
      '-fill', '#F7E7B4', '-font', texto, '-pointsize', '30', '-annotate', '+562+508', 'Escalada en boulder · Padre Las Casas',
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

/**
 * Capas de la escena del logo, sacadas del arte de 15 x 20: la cordillera con
 * los dos gatos y la luna, con el cielo transparente. El sitio las monta sobre
 * su propio gradiente y con sus propias estrellas animadas.
 *
 * El cielo del arte es un gradiente muy saturado; la cordillera, los gatos, la
 * luna y las estrellas son tinta, blanco o gris. Cada píxel se vuelve más
 * transparente cuanto más saturado es. Después se agrupan las zonas sólidas:
 * lo que toca el borde de abajo es la cordillera con los gatos; la zona sólida
 * más grande del resto, con sus salpicaduras, es la luna; las estrellas quedan
 * afuera. En los bordes se descuenta el color del cielo para que no quede un
 * halo azul.
 */
function escena() {
  const origen = exigir('origen')
  const arte = join(origen, 'kuyen climbing 15x20_Mesa de trabajo 1.jpg')
  if (!existsSync(arte)) {
    console.error(`No está ${arte}.`)
    process.exit(1)
  }

  const [W, H] = identify('%w %h', arte).split(' ').map(Number)
  const rgb = execFileSync('convert', [arte, '-colorspace', 'sRGB', '-depth', '8', 'rgb:-'], { maxBuffer: 1 << 30 })
  const N = W * H

  // Opacidad según saturación: gris, blanco y tinta son sólidos; el cielo, transparente.
  const alfa = new Float32Array(N)
  for (let i = 0; i < N; i++) {
    const r = rgb[i * 3]
    const g = rgb[i * 3 + 1]
    const b = rgb[i * 3 + 2]
    const croma = Math.max(r, g, b) - Math.min(r, g, b)
    alfa[i] = Math.min(1, Math.max(0, (70 - croma) / 40))
  }

  // Color del cielo de cada fila: el promedio de sus píxeles saturados.
  const cielo = new Float32Array(H * 3)
  let ultimo = [0, 0, 0]
  for (let y = 0; y < H; y++) {
    let n = 0
    const suma = [0, 0, 0]
    for (let x = 0; x < W; x++) {
      const i = y * W + x
      if (alfa[i] > 0) continue
      suma[0] += rgb[i * 3]
      suma[1] += rgb[i * 3 + 1]
      suma[2] += rgb[i * 3 + 2]
      n++
    }
    if (n > 20) ultimo = suma.map((s) => s / n)
    cielo.set(ultimo, y * 3)
  }

  // Zonas sólidas conexas (cuatro vecinos).
  const etiqueta = new Int32Array(N).fill(-1)
  const pila = new Int32Array(N)
  const zonas = []
  for (let inicio = 0; inicio < N; inicio++) {
    if (alfa[inicio] <= 0.5 || etiqueta[inicio] !== -1) continue
    const zona = { id: zonas.length, minX: W, minY: H, maxX: 0, maxY: 0, total: 0, abajo: false }
    let tope = 0
    pila[tope++] = inicio
    etiqueta[inicio] = zona.id
    while (tope) {
      const j = pila[--tope]
      const x = j % W
      const y = (j - x) / W
      zona.total++
      if (x < zona.minX) zona.minX = x
      if (x > zona.maxX) zona.maxX = x
      if (y < zona.minY) zona.minY = y
      if (y > zona.maxY) zona.maxY = y
      if (y === H - 1) zona.abajo = true
      const vecinos = [x > 0 ? j - 1 : -1, x < W - 1 ? j + 1 : -1, y > 0 ? j - W : -1, y < H - 1 ? j + W : -1]
      for (const v of vecinos) {
        if (v >= 0 && alfa[v] > 0.5 && etiqueta[v] === -1) {
          etiqueta[v] = zona.id
          pila[tope++] = v
        }
      }
    }
    zonas.push(zona)
  }

  const primerPlano = new Set(zonas.filter((z) => z.abajo).map((z) => z.id))
  const luna = zonas.filter((z) => !z.abajo && z.maxY < H * 0.6).sort((a, b) => b.total - a.total)[0]
  // Las salpicaduras de la luna quedan cerca de ella.
  const margen = Math.round((luna.maxX - luna.minX) * 0.08)
  const cajaLuna = { minX: luna.minX - margen, minY: luna.minY - margen, maxX: luna.maxX + margen, maxY: luna.maxY + margen * 2 }
  const deLaLuna = new Set(
    zonas
      .filter((z) => !z.abajo && z.minX >= cajaLuna.minX && z.maxX <= cajaLuna.maxX && z.minY >= cajaLuna.minY && z.maxY <= cajaLuna.maxY)
      .map((z) => z.id)
  )

  /** Arma una capa RGBA de un recorte con las zonas elegidas, sus bordes suaves y sin el color del cielo. */
  function capa(ids, x0, y0, x1, y1) {
    const w = x1 - x0 + 1
    const h = y1 - y0 + 1
    const salida = Buffer.alloc(w * h * 4)
    const dentro = (i) => etiqueta[i] !== -1 && ids.has(etiqueta[i])
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const i = y * W + x
        let a = alfa[i]
        if (a > 0.5 && !dentro(i)) a = 0
        if (a > 0 && a <= 0.5) {
          // Borde: vale solo si toca una zona elegida a dos píxeles o menos.
          let cerca = false
          for (let dy = -2; dy <= 2 && !cerca; dy++) {
            for (let dx = -2; dx <= 2 && !cerca; dx++) {
              const xx = x + dx
              const yy = y + dy
              if (xx >= 0 && xx < W && yy >= 0 && yy < H && dentro(yy * W + xx)) cerca = true
            }
          }
          if (!cerca) a = 0
        }
        const k = ((y - y0) * w + (x - x0)) * 4
        if (a === 0) continue
        for (let c = 0; c < 3; c++) {
          const visto = rgb[i * 3 + c]
          const fondo = cielo[y * 3 + c]
          salida[k + c] = Math.max(0, Math.min(255, Math.round((visto - (1 - a) * fondo) / a)))
        }
        salida[k + 3] = Math.round(a * 255)
      }
    }
    return { salida, w, h }
  }

  const dir = join(ROOT, 'img', 'escena')
  mkdirSync(dir, { recursive: true })
  const tmp = mkdtempSync(join(tmpdir(), 'kuyen-escena-'))
  try {
    const guardar = (nombre, { salida, w, h }, anchos) => {
      const crudo = join(tmp, `${nombre}.rgba`)
      writeFileSync(crudo, salida)
      for (const ancho of anchos) {
        const archivo = join(dir, `${nombre}-${ancho}.webp`)
        convert('-size', `${w}x${h}`, '-depth', '8', `rgba:${crudo}`, '-resize', `${ancho}x`, '-strip', '-quality', '86', '-define', 'webp:alpha-quality=100', '-define', 'webp:method=6', archivo)
        console.log(`img/escena/${nombre}-${ancho}.webp  ${identify('%wx%h', archivo)}  ${kb(archivo)} KB`)
      }
    }

    const techo = Math.min(...[...primerPlano].map((id) => zonas[id].minY)) - 3
    guardar('cordillera-gatos', capa(primerPlano, 0, Math.max(0, techo), W - 1, H - 1), [2000, 1200])
    guardar(
      'luna',
      capa(deLaLuna, Math.max(0, cajaLuna.minX), Math.max(0, cajaLuna.minY), Math.min(W - 1, cajaLuna.maxX), Math.min(H - 1, cajaLuna.maxY)),
      [600, 300]
    )
  } finally {
    rmSync(tmp, { recursive: true, force: true })
  }
}

if (comando === 'fotos') fotos()
else if (comando === 'marca') marca()
else if (comando === 'escena') escena()
else {
  console.error('Uso: node tools/assets.mjs fotos|marca|escena --origen=<carpeta> [--titulo=<ttf> --texto=<ttf>]')
  process.exit(1)
}
