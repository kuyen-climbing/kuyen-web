/**
 * Piezas de HTML compartidas por las variantes: la escena nocturna del logo
 * (estrellas, luna y cordillera con los gatos), las presas que flotan, los
 * títulos que se arman palabra por palabra, la marquesina y las cifras. El movimiento vive en movimiento.css
 * y movimiento.js, en esta misma carpeta.
 */

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

function azar(semilla) {
  return () => {
    semilla = (semilla * 16807) % 2147483647
    return (semilla - 1) / 2147483646
  }
}

/**
 * Estrellas de cuatro puntas, como las del logo, en posiciones fijas: la misma
 * semilla da siempre el mismo cielo y el build sigue siendo determinista.
 * `alto` es el porcentaje de la altura donde puede caer una estrella.
 */
export function cielo({ estrellas = 44, semilla = 97, alto = 70 } = {}) {
  const r = azar(semilla)
  const puntos = Array.from({ length: estrellas }, () => {
    const estilo = [
      `left:${(r() * 100).toFixed(2)}%`,
      `top:${(r() * alto).toFixed(2)}%`,
      `--t:${4 + Math.round(r() * 14)}px`,
      `--d:${(2.2 + r() * 3.6).toFixed(2)}s`,
      `--r:-${(r() * 5).toFixed(2)}s`,
    ].join(';')
    return `<span class="m-estrella" style="${estilo}"></span>`
  })
  return `<div class="m-cielo" aria-hidden="true">${puntos.join('')}</div>`
}

/**
 * La luna del logo, con su goteo. Decorativa. `paralaje` es cuánto se mueve con
 * el scroll y `prof`, cuánto sigue al puntero (en px por borde de la pantalla).
 */
export const luna = ({ clase = '', paralaje = -0.18, prof = 0, tamanos = '(min-width: 1024px) 13vw, 26vw' } = {}) =>
  `<img class="m-luna m-capa${clase ? ` ${clase}` : ''}" src="/img/escena/luna-600.webp" srcset="/img/escena/luna-300.webp 300w, /img/escena/luna-600.webp 600w" sizes="${tamanos}" alt="" style="--m-prof: ${prof}" data-m-paralaje="${paralaje}">`

/** La cordillera con los dos gatos del logo mirando la luna. Decorativa. */
export const cordillera = ({ clase = '', paralaje = -0.05, prof = 0, tamanos = '100vw' } = {}) =>
  `<img class="m-cordillera m-capa${clase ? ` ${clase}` : ''}" src="/img/escena/cordillera-gatos-2000.webp" srcset="/img/escena/cordillera-gatos-1200.webp 1200w, /img/escena/cordillera-gatos-2000.webp 2000w" sizes="${tamanos}" alt="" style="--m-prof: ${prof}" data-m-paralaje="${paralaje}">`

/** Formas de presas de escalada, dibujadas para el sitio (viewBox de 100 x 100). */
const FORMAS_PRESA = {
  canto: 'M50 8c20 0 38 14 40 34 2 22-14 44-38 48-26 4-44-14-44-36C8 30 26 8 50 8z',
  regleta: 'M8 56c2-16 20-28 44-30 20-2 38 6 40 18 2 14-16 26-40 30C28 78 6 72 8 56z',
  pinza: 'M50 8l38 58c7 11-1 26-14 26H26c-13 0-21-15-14-26z',
  roma: 'M10 66C10 38 30 14 56 14c20 0 34 14 34 32 0 26-24 44-52 44-16 0-28-8-28-24z',
  volumen: 'M30 10h40l24 40-24 40H30L6 50z',
}

/**
 * Presa que flota. Se posiciona en porcentaje de su contenedor (x, y) con un
 * ancho en porcentaje (tam). Decorativa.
 */
export const presa = ({ forma, color, clase = '', x, y, tam, prof = 30, paralaje = -0.2, giro = 0, retraso = 0, duracion = 8 }) =>
  `<span class="m-presa m-capa${clase ? ` ${clase}` : ''}" style="left: ${x}%; top: ${y}%; width: ${tam}%; --m-prof: ${prof}; --color: ${color}; --giro: ${giro}deg; --m-retraso: ${retraso}ms; --dur: ${duracion}s" data-m-paralaje="${paralaje}" aria-hidden="true"><svg viewBox="0 0 100 100"><path d="${FORMAS_PRESA[forma]}"/><circle cx="50" cy="50" r="7"/></svg></span>`

/**
 * Título que se arma: cada palabra sube desde su propia máscara, una tras otra.
 * Recibe un texto o una lista de líneas; cada línea queda en su renglón.
 */
export function titulo(lineas) {
  let i = 0
  return []
    .concat(lineas)
    .map((linea) => {
      const palabras = String(linea)
        .split(/\s+/)
        .filter(Boolean)
        .map((p) => `<span class="m-palabra"><span style="--m-i: ${i++}">${esc(p)}</span></span>`)
      return `<span class="m-linea">${palabras.join(' ')}</span>`
    })
    .join(' ')
}

/** Marquesina: una franja por lista de palabras, en sentidos alternados. */
export function marquesina(filas) {
  const pista = (palabras, n) => {
    const grupo = palabras.map((p) => `<span>${esc(p)}<i class="m-estrella-chica"></i></span>`).join('')
    return `<div class="m-pista${n % 2 ? ' m-pista--vuelta' : ''}">${grupo}${grupo}</div>`
  }
  return `<div class="m-marquesina" aria-hidden="true">${filas.map(pista).join('')}</div>`
}

/**
 * Cifras que suben al entrar en pantalla. Sin JavaScript se ve el valor final.
 * `valor` puede ser número (500) o texto con decimal ("5,0").
 */
export function cifras(lista) {
  const items = lista.map((c, n) => {
    const entero = typeof c.valor === 'number'
    const fin = entero ? c.valor : parseFloat(String(c.valor).replace(',', '.'))
    const decimales = entero ? 0 : 1
    return `<div class="m-cifra" data-m-aparece style="--m-retraso: ${n * 120}ms">
            <dt>${esc(c.etiqueta)}</dt>
            <dd data-m-contar="${fin}" data-m-decimales="${decimales}" data-m-sufijo="${esc(c.sufijo)}">${esc(c.valor)}${esc(c.sufijo)}</dd>
          </div>`
  })
  return `<dl class="m-cifras" data-m-cifras>
          ${items.join('\n          ')}
        </dl>`
}
