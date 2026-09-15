/**
 * Piezas de HTML compartidas por las variantes: la escena nocturna del logo
 * (estrellas, luna y cordillera con los gatos), los títulos que se arman palabra
 * por palabra, la marquesina y las cifras. El movimiento vive en movimiento.css
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

/** La luna del logo, con su goteo. Decorativa. */
export const luna = ({ clase = '', paralaje = -0.18, tamanos = '(min-width: 1024px) 13vw, 26vw' } = {}) =>
  `<img class="m-luna${clase ? ` ${clase}` : ''}" src="/img/escena/luna-600.webp" srcset="/img/escena/luna-300.webp 300w, /img/escena/luna-600.webp 600w" sizes="${tamanos}" alt="" data-m-paralaje="${paralaje}">`

/** La cordillera con los dos gatos del logo mirando la luna. Decorativa. */
export const cordillera = ({ clase = '', paralaje = -0.05, tamanos = '100vw' } = {}) =>
  `<img class="m-cordillera${clase ? ` ${clase}` : ''}" src="/img/escena/cordillera-gatos-2000.webp" srcset="/img/escena/cordillera-gatos-1200.webp 1200w, /img/escena/cordillera-gatos-2000.webp 2000w" sizes="${tamanos}" alt="" data-m-paralaje="${paralaje}">`

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
