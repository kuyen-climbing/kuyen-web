/**
 * Piezas de HTML compartidas por las variantes: la escena nocturna del logo
 * (estrellas, luna y cordillera con los gatos), las presas que flotan, los
 * títulos que se arman palabra por palabra, la marquesina y las cifras. El
 * movimiento vive en movimiento.css y movimiento.js, en esta misma carpeta.
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

/**
 * Mapa de Google y publicaciones de Instagram incrustados. Desde el 22-09-2026
 * cargan con la página y no al hacer clic (pedido de Benjamín). Van con
 * loading="lazy", así el navegador los pide recién cuando se acercan a la
 * pantalla: la persona no tiene que hacer nada y la primera pantalla sigue sin
 * pedirle nada a Google ni a Instagram.
 */
export const mapa = ({ url, titulo, clase = '' }) =>
  `<iframe class="m-marco${clase ? ` ${clase}` : ''}" src="${esc(url)}" title="${esc(titulo)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>`

/** El alto real lo avisa Instagram por mensaje; hasta entonces manda el CSS. */
export const publicacion = ({ base, ruta, titulo, clase = '' }) =>
  `<iframe class="instagram__marco${clase ? ` ${clase}` : ''}" src="${esc(`${base}${ruta}/embed/captioned/`)}" title="${esc(titulo)}" loading="lazy" allowfullscreen data-instagram-marco></iframe>`

/**
 * La valoración de Google: las estrellas, la nota, el recuento y los dos
 * enlaces a la ficha. Las estrellas van con aria-hidden porque el texto de al
 * lado ya dice la nota; quien usa lector de pantalla no oye cinco veces lo
 * mismo.
 */
export function valoracion({ datos, clase = '' }) {
  const estrella = `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.6l2.7 5.9 6.3.7-4.7 4.3 1.3 6.3-5.6-3.2-5.6 3.2 1.3-6.3L3 9.2l6.3-.7z"/></svg>`
  return `<div class="m-valoracion${clase ? ` ${clase}` : ''}" data-m-aparece>
          <p class="m-valoracion__estrellas" aria-hidden="true">${estrella.repeat(datos.maximo)}</p>
          <p class="m-valoracion__nota"><b>${esc(datos.nota)}</b> en ${esc(datos.fuente)}, con ${datos.total} opiniones</p>
          <p class="m-valoracion__texto">${esc(datos.resumen)}</p>
          <p class="m-valoracion__enlaces">
            <a class="enlace" href="${esc(datos.url)}" target="_blank" rel="noopener">${esc(datos.enlace)}</a>
            <span class="m-valoracion__invita">${esc(datos.invitacion)}</span>
          </p>
        </div>`
}

/**
 * La escala de graduación del muro: una chapa de cada color con los grados que
 * cubre, y la nota de los volúmenes. Sale de MURO.graduacion, que copia la
 * gráfica que Kuyen publica en el muro (25-09-2026).
 */
export function graduacion({ datos, clase = '' }) {
  const fila = (g) => `<li class="m-grados__fila">
              <span class="m-grados__chapa" style="--chapa: ${esc(g.muestra)}" aria-hidden="true"></span>
              <span class="m-grados__color">${esc(g.color)}</span>
              <span class="m-grados__valor">${esc(g.grados)}</span>
            </li>`
  return `<div class="m-grados${clase ? ` ${clase}` : ''}" data-m-aparece>
          <h3 class="m-grados__titulo">${esc(datos.titulo)}</h3>
          <p class="m-grados__intro">${esc(datos.intro)}</p>
          <ul class="m-grados__lista">
            ${datos.escala.map(fila).join('\n            ')}
          </ul>
          <p class="m-grados__nota">${esc(datos.nota)}</p>
        </div>`
}

/**
 * Una foto de la galería: proporción fija según su orientación y recorte al
 * centro, para que una fila quede pareja aunque los originales tengan medidas
 * distintas. `retraso` escalona la entrada de la fila, foto por foto.
 *
 * `data-m-puntero` hace que cada foto sea su propia zona de puntero: movimiento.js
 * le publica --m-mx y --m-my y el CSS la inclina un poco hacia donde está el mouse.
 */
export const fotoCaja = ({ medio, formato = 'horizontal', clase = '', retraso = 0 }) =>
  `<figure class="m-caja m-caja--${formato}${clase ? ` ${clase}` : ''}" data-m-aparece data-m-puntero${retraso ? ` style="--m-retraso: ${retraso}ms"` : ''}>
            ${medio}
          </figure>`

/**
 * Telón de una sección de poco texto: una cordillera dibujada muy atenuada al
 * pie y unas presas grandes flotando detrás del contenido. Es lo que evita que
 * un fondo plano se lea como un hueco.
 *
 * Decorativo de punta a punta: sin texto, sin foco, aria-hidden y sin atrapar
 * el puntero. El reparto sale de una semilla, así el build sigue siendo
 * determinista y cada sección queda distinta sin escribir las posiciones a mano.
 */
export function telon({ semilla = 7, presas = 3, cumbre = true, clase = '' } = {}) {
  const r = azar(semilla)
  const FORMAS = ['canto', 'regleta', 'pinza', 'roma', 'volumen']
  const COLORES = ['var(--kuyen-luna)', 'var(--kuyen-lila)', 'var(--kuyen-blanco)']
  const piezas = Array.from({ length: presas }, (_, n) => {
    const estilo = [
      `left: ${(4 + r() * 88).toFixed(1)}%`,
      `top: ${(6 + r() * 74).toFixed(1)}%`,
      `width: ${(7 + r() * 9).toFixed(1)}%`,
      `--color: ${COLORES[Math.floor(r() * COLORES.length)]}`,
      `--giro: ${(r() * 70 - 35).toFixed(0)}deg`,
      `--dur: ${(9 + r() * 7).toFixed(1)}s`,
      `--m-retraso: ${n * 160}ms`,
    ].join('; ')
    const forma = FORMAS[Math.floor(r() * FORMAS.length)]
    return `<span class="m-presa m-presa--telon" style="${estilo}" data-m-paralaje="${(0.06 + r() * 0.12).toFixed(2)}"><svg viewBox="0 0 100 100"><path d="${FORMAS_PRESA[forma]}"/></svg></span>`
  })
  const sierra = cumbre
    ? `<svg class="m-telon__cumbre" viewBox="0 0 1200 220" preserveAspectRatio="none" focusable="false"><path d="M0 220 140 118 232 168 392 58 520 142 636 96 760 176 880 108 1010 162 1120 120 1200 170 1200 220Z"/></svg>`
    : ''
  return `<div class="m-telon${clase ? ` ${clase}` : ''}" aria-hidden="true">${sierra}${piezas.join('')}</div>`
}

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
 * Recibe un texto o una lista de líneas; cada línea queda en su renglón. Una
 * línea también puede ser una lista de tramos, y un tramo { texto, clase } pone
 * esa clase en sus palabras (por ejemplo, para destacarlo en color).
 */
export function titulo(lineas) {
  let i = 0
  const palabras = (texto, clase = '') =>
    String(texto)
      .split(/\s+/)
      .filter(Boolean)
      .map((p) => `<span class="m-palabra${clase ? ` ${clase}` : ''}"><span style="--m-i: ${i++}">${esc(p)}</span></span>`)
  return []
    .concat(lineas)
    .map((linea) => {
      const tramos = Array.isArray(linea) ? linea : [linea]
      const html = tramos.flatMap((t) => (t !== null && typeof t === 'object' ? palabras(t.texto, t.clase) : palabras(t)))
      return `<span class="m-linea">${html.join(' ')}</span>`
    })
    .join(' ')
}

/** Marquesina: una franja por lista de palabras, en sentidos alternados. */
export function marquesina(filas, { clase = '' } = {}) {
  const pista = (palabras, n) => {
    const grupo = palabras.map((p) => `<span>${esc(p)}<i class="m-estrella-chica"></i></span>`).join('')
    return `<div class="m-pista${n % 2 ? ' m-pista--vuelta' : ''}">${grupo}${grupo}</div>`
  }
  return `<div class="m-marquesina${clase ? ` ${clase}` : ''}" aria-hidden="true">${filas.map(pista).join('')}</div>`
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
