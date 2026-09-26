/**
 * Variante Hirael: la estructura del template Hirael Agency Landing con el
 * contenido, la tipografía y los colores de Kuyen.
 *
 * Sigue la ficha de estructura de la fase 0, sección por sección:
 *   1  Hero de alto de pantalla, con la cabecera en píldora arriba y el
 *      contenido anclado abajo a la izquierda.
 *   1b Menú móvil en hoja que sube desde abajo.
 *   2  "1 · Qué es Kuyen": título, párrafo, botón y dos fotos asimétricas.
 *   3  "2 · El muro y la comunidad": dos tarjetas 4:3 con píldora.
 *   4  Pie oscuro con bloque de llamado, columnas y marca gigante.
 *
 * Secciones agregadas con componentes del mismo template (decisión del
 * 15-09-2026), entre la 3 y el pie:
 *   Clases, Kuyencit@s, En Instagram y Visítanos: tarjetas de la sección 2.
 *   El muro por dentro, El equipo, Horarios y valores, Tu primera vez,
 *   Reglamento, Comunidad y En el lugar: intro de la sección 1 con las columnas
 *   del pie.
 *   El orden de las trece secciones y la numeración de sus etiquetas se fijaron
 *   el 22-09-2026; el mapa y las publicaciones vienen incrustados.
 *
 * Revisión visual de Benjamín (15-09-2026): la página se veía plana. Se aplican
 * la tipografía (Rubik Dirt y Rubik), la noche completa con acento amarillo luna
 * y el movimiento de src/compartido/.
 *
 * Diferencias con el template:
 * - Toda la página va sobre la noche del logo (el template es blanco y gris).
 * - El fondo animado del hero pasa a ser la noche del logo con una composición
 *   de escalada (revisión del 15-09-2026: "lo primero que ve el usuario tiene que
 *   ser increíble"): la escaladora en un arco, una foto redonda que lo cruza y
 *   presas que flotan, con entrada orquestada, profundidad que sigue al puntero y
 *   rastro de tiza. La luna va a la vista, en el medio, entre el texto y la
 *   escalada. El logo con la cordillera y los gatos va de fondo del hero, como
 *   una cenefa centrada al pie, difuminada y atenuada (pedido del 22-09-2026).
 *   Hasta 1023 px la composición va arriba y el texto al medio.
 * - La cabecera queda fija arriba al bajar por la página y suma una sombra
 *   (pedido del 15-09-2026); en el template se va con el scroll.
 * - Marquesina con la jerga del muro entre el hero y la sección 1, y cifras en
 *   la sección 1.
 * - Títulos que se arman palabra por palabra, textos que entran y fotos que se
 *   revelan con paralaje; el template no tiene animaciones de entrada.
 * - Los videos de las tarjetas pasan a fotos de Kuyen.
 * - La intro usa un solo bloque de markup para móvil y escritorio (el template
 *   lo repite dos veces).
 * - El menú móvil también se cierra con Escape y queda inerte mientras está
 *   cerrado.
 */
import { cielo, luna, cordillera, presa, titulo, marquesina, cifras, mapa, publicacion, fotoCaja, graduacion, telon, valoracion } from '../../compartido/escena.mjs'

const ICONOS = {
  flecha:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  diagonal:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg>',
  menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
  // Estrella de cuatro puntas, como las del cielo del logo.
  estrella:
    '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 1c.9 6.6 4.4 10.1 11 11-6.6.9-10.1 4.4-11 11-.9-6.6-4.4-10.1-11-11 6.6-.9 10.1-4.4 11-11z"/></svg>',
  instagram:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>',
  pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/></svg>',
}

const mayusculaInicial = (texto) => texto.charAt(0).toUpperCase() + texto.slice(1)

export default function pagina({ site, contenido, esc, foto, cabeza, leer, compartido }) {
  const {
    MARCA,
    UBICACION,
    CONTACTO,
    LINKS,
    HISTORIA,
    CIFRAS,
    INSTAGRAM,
    MURO,
    EQUIPO,
    SERVICIOS,
    HORARIOS,
    PRECIOS,
    PRODUCTOS,
    COMODIDADES,
    INVITADOS,
    COMUNIDAD,
    REGLAMENTO,
    SOLICITUD,
    PRIMERA_VISITA,
    PANCITA,
    EVENTOS_INFO,
    LEGAL,
    RESENAS,
    VALORACION,
    MARQUESINA,
    TEXTOS,
    FOTOS,
  } = contenido

  /* Galería de una sección, por ids de FOTOS. Toda la fila toma la orientación
     de la primera foto, así las cajas quedan del mismo alto aunque los
     originales no lo estén. Las filas se arman agrupando por orientación. */
  const galeria = (...ids) => {
    const orientacion = FOTOS.find((f) => f.id === ids[0])?.orientacion || 'horizontal'
    const cajas = ids.map((id, n) => {
      if (!FOTOS.some((f) => f.id === id)) throw new Error(`foto desconocida en una galería: "${id}"`)
      return fotoCaja({
        formato: orientacion,
        retraso: n * 90,
        medio: foto(id, { tamanos: '(min-width: 1024px) 24vw, (min-width: 640px) 45vw, 92vw' }),
      })
    })
    const ancho = ids.length > 3 ? ' m-galeria--cuatro' : ids.length === 3 ? ' m-galeria--tres' : ids.length === 1 ? ' m-galeria--sola' : ''
    return `<div class="m-galeria${ancho}">${cajas.join('\n            ')}</div>`
  }

  const externo = ' target="_blank" rel="noopener"'
  const servicio = (id) => SERVICIOS.find((s) => s.id === id)
  const google = CIFRAS.find((c) => c.id === 'google')
  const retraso = (ms) => (ms ? ` style="--m-retraso: ${ms}ms"` : '')

  /** Botón píldora con texto que rueda y círculo con flecha. */
  const boton = ({ texto, href, variante = 'primario', afuera = false, clase = '', aparece = null, iman = false }) => `<a class="boton boton--${variante}${clase ? ` ${clase}` : ''}" href="${esc(href)}"${afuera ? externo : ''}${aparece === null ? '' : ` data-m-aparece${retraso(aparece)}`}${iman ? ' data-m-iman' : ''}>
            <span class="boton__texto"><span class="boton__rollo"><span>${esc(texto)}</span><span aria-hidden="true">${esc(texto)}</span></span></span>
            <span class="boton__circulo">${ICONOS.flecha}</span>
          </a>`

  /** Círculo numerado más insignia con borde. */
  const etiqueta = (numero, texto) => `<div class="etiqueta" data-m-aparece>
          <span class="etiqueta__numero">${numero}</span>
          <span class="insignia">${esc(texto)}</span>
        </div>`

  /** Píldora de 36 px que se estira en hover y muestra su texto. */
  const pildora = ({ texto, href, oscura = false, abierta }) => {
    const clases = `pildora${oscura ? ' pildora--oscura' : ''}`
    const interior = `<span class="pildora__icono">${ICONOS.diagonal}</span><span class="pildora__texto">${esc(texto)}</span>`
    return `<a class="${clases}" style="--abierta: ${abierta}" href="${esc(href)}"${externo}>${interior}</a>`
  }

  /** Tarjeta de la sección 2: medio 4:3 que se revela, con píldora, descripción y título. */
  const tarjeta = ({ medio, pildoraHtml, descripcion, titulo: nombre, claseMedio = 'm-foto--zoom', desde = 0, atributos = '', atributosMedio = '' }) => `<article class="tarjeta"${atributos}>
            <div class="tarjeta__medio m-foto ${claseMedio}"${retraso(desde)}${atributosMedio}>
              ${medio}
              ${pildoraHtml}
            </div>
            <p class="tarjeta__descripcion" data-m-aparece${retraso(desde + 250)}>${descripcion}</p>
            <h3 class="tarjeta__titulo" data-m-aparece${retraso(desde + 350)}>${nombre}</h3>
          </article>`

  /* La barra de escritorio lleva lo imprescindible, para que no se desborde;
     el menú de móvil es una hoja a pantalla completa y lleva el recorrido
     entero, incluidas las secciones nuevas. */
  const enlacesBarra = [
    ['#muro', 'El muro'],
    ['#clases', 'Clases'],
    ['#horarios', 'Horarios'],
    ['#primeravez', 'Primera vez'],
    ['#visitanos', 'Visítanos'],
  ]
  const enlacesMenu = [
    ['#kuyen', 'Qué es Kuyen'],
    ['#muro', 'El muro'],
    ['#equipo', 'Quiénes somos'],
    ['#clases', 'Clases'],
    ['#kuyencitos', 'Kuyencit@s'],
    ['#horarios', 'Horarios y valores'],
    ['#primeravez', 'Tu primera vez'],
    ['#inclusion', 'Comunidad'],
    ['#instagram', 'En Instagram'],
    ['#visitanos', 'Visítanos'],
  ]

  // "Un proyecto hecho por escaladores para escaladores", en tres renglones.
  const [inicioLema, restoLema] = MARCA.lema.split(' por ')
  const [medioLema, finLema] = restoLema.split(' para ')
  const lineasLema = [inicioLema, `por ${medioLema}`, `para ${finLema}`]

  const enlacePie = (href, texto, afuera = false) =>
    `<li><a href="${esc(href)}"${afuera ? externo : ''}>${esc(texto)}${ICONOS.diagonal}</a></li>`

  const clases = servicio('clases')

  return `<!DOCTYPE html>
<html lang="${site.lang}">
${cabeza({ estilos: `${compartido('movimiento.css')}\n${leer('estilos.css')}` })}
<body>
  <script>document.documentElement.classList.add('m-js')</script>
  <a class="saltar" href="#contenido">Saltar al contenido</a>

  <header class="cabecera" data-cabecera>
    <nav class="cabecera__nav tono-claro" aria-label="Principal">
      <div class="cabecera__izquierda">
        <a class="marca" href="#contenido" aria-label="${esc(MARCA.nombre)}, inicio">
          <img class="marca__isotipo" src="/img/marca/isotipo-256.webp" width="256" height="256" alt="">
          <span class="marca__nombre">${esc(MARCA.nombreLogo)}</span>
        </a>
        <div class="cabecera__enlaces">
          ${enlacesBarra.map(([href, texto]) => `<a href="${href}">${esc(texto)}</a>`).join('\n            ')}
        </div>
      </div>
      <div class="cabecera__derecha">
        <span class="cabecera__estado">Renovamos rutas de forma periódica</span>
        ${boton({ texto: TEXTOS.acciones.escribenos, href: CONTACTO.whatsapp, variante: 'oscuro', afuera: true })}
      </div>
      <button type="button" class="cabecera__menu" aria-label="Abrir el menú" aria-expanded="false" aria-controls="menu-movil" data-menu-abrir>${ICONOS.menu}</button>
    </nav>
  </header>

  <section class="hero tono-gradiente" data-hero data-m-tiza="255,255,255|247,231,180|201,185,240" data-m-puntero data-m-entrada>
    ${cielo({ estrellas: 52, semilla: 97, alto: 72 })}

    <div class="hero__visual">
      ${luna({ clase: 'hero__luna m-entra-sube', paralaje: -0.22, prof: 18, tamanos: '(min-width: 1024px) 11vw, 16vh' })}
      <div class="hero__composicion">
        <figure class="hero__arco m-capa m-entra-recorte" style="--m-prof: 14; --m-retraso: 150ms" data-m-paralaje="-0.08">
          ${foto('escaladora-muro-azul', { tamanos: '(min-width: 1024px) 28vw, 62vw', prioridad: true })}
        </figure>
        <figure class="hero__circulo m-capa m-entra-escala" style="--m-prof: 32; --m-retraso: 850ms" data-m-paralaje="0.08">
          ${foto('escalador-desplome-gris', { tamanos: '(min-width: 1024px) 13vw, 28vw', prioridad: true })}
        </figure>
        ${presa({ forma: 'canto', color: 'var(--kuyen-luna)', clase: 'm-entra-escala', x: 100, y: 18, tam: 17, prof: 38, paralaje: 0.18, giro: 12, retraso: 1050, duracion: 9 })}
        ${presa({ forma: 'roma', color: 'var(--kuyen-lila)', clase: 'm-entra-escala', x: 88, y: 66, tam: 23, prof: 24, paralaje: 0.1, giro: -20, retraso: 1200, duracion: 11 })}
        ${presa({ forma: 'pinza', color: 'var(--kuyen-blanco)', clase: 'm-entra-escala', x: 90, y: -6, tam: 12, prof: 52, paralaje: 0.3, giro: -8, retraso: 1300, duracion: 7 })}
        ${presa({ forma: 'regleta', color: 'var(--kuyen-luna)', clase: 'm-entra-escala', x: 60, y: 84, tam: 16, prof: 60, paralaje: 0.36, giro: 18, retraso: 1400, duracion: 8 })}
        ${presa({ forma: 'volumen', color: 'var(--kuyen-lila)', clase: 'm-entra-escala hero__presa--ancha', x: 44, y: -3, tam: 10, prof: 44, paralaje: 0.24, giro: 30, retraso: 1150, duracion: 10 })}
        ${cordillera({ clase: 'hero__cordillera m-entra-sube', paralaje: 0, prof: 6, tamanos: '(min-width: 1024px) 28vw, 62vw' })}
      </div>
    </div>

    <div class="hero__contenido" id="contenido" tabindex="-1">
      <div class="contenedor hero__interior">
        <span class="hero__antetitulo" data-m-aparece>Escalada en boulder · ${esc(UBICACION.comuna)}</span>
        <h1 class="titulo-grande" data-m-revelar style="--m-retraso: 150ms">${titulo(lineasLema)}</h1>
        <div class="hero__acciones">
          ${boton({ texto: TEXTOS.acciones.solicitud, href: LINKS.solicitudIngreso, afuera: true, aparece: 700, iman: true })}
          <div class="chip tono-claro" data-m-aparece style="--m-retraso: 850ms">
            ${ICONOS.estrella}
            <span class="chip__texto">${esc(google.valor)} en Google</span>
            <span class="chip__insignia">${VALORACION.total} reseñas</span>
          </div>
        </div>
      </div>
    </div>

  </section>

  <div class="menu" id="menu-movil" data-menu inert>
    <div class="menu__capa" data-menu-capa></div>
    <div class="menu__hoja tono-claro">
      <nav class="menu__enlaces" aria-label="Menú">
        ${enlacesMenu.map(([href, texto]) => `<a href="${href}">${esc(texto)}</a>`).join('\n        ')}
      </nav>
      ${boton({ texto: TEXTOS.acciones.solicitud, href: LINKS.solicitudIngreso, afuera: true, clase: 'boton--ancho' })}
    </div>
  </div>

  ${marquesina(MARQUESINA)}

  <main>
    <section class="seccion seccion--intro tono-oscuro" id="kuyen">
      <div class="contenedor">
        ${etiqueta(1, 'Qué es Kuyen')}
        <h2 class="titulo-intro intro__titulo" data-m-revelar>${titulo([`${MARCA.definicion}`, `en ${UBICACION.comuna}.`])}</h2>
        <div class="intro__grilla">
          <div class="intro__texto">
            <p class="intro__parrafo" data-m-aparece>${esc(MARCA.significado)} Desde ${HISTORIA.desde}, ${esc(MARCA.lema.charAt(0).toLowerCase() + MARCA.lema.slice(1))}.</p>
            ${HISTORIA.relato.map((p, n) => `<p class="intro__relato" data-m-aparece${retraso((n + 1) * 90)}>${esc(p)}</p>`).join('\n            ')}
            ${boton({ texto: 'Conoce el muro', href: '#muro', clase: 'intro__boton', aparece: 150 })}
          </div>
          <div class="m-foto intro__foto intro__foto--chica">
            ${foto('pancita', { tamanos: '(min-width: 1024px) 24vw, (min-width: 640px) 45vw, 100vw' })}
          </div>
          <div class="m-foto intro__foto intro__foto--grande" style="--m-retraso: 180ms">
            ${foto('escalador-muro-blanco', { tamanos: '(min-width: 1024px) 44vw, (min-width: 640px) 55vw, 100vw' })}
          </div>
        </div>
        <div class="intro__cifras">
          ${cifras(CIFRAS.filter((c) => c.id !== 'anios'))}
        </div>
      </div>
    </section>

    <section class="seccion m-con-telon seccion--tarjetas tono-gradiente" id="muro">
      ${telon({ semilla: 11, presas: 3 })}
      <div class="contenedor">
        ${etiqueta(2, 'El muro y la comunidad')}
        <h2 class="titulo-grande tarjetas__titulo" data-m-revelar>${titulo('Escalar en Kuyen')}</h2>
        <div class="tarjetas">
          ${tarjeta({
            medio: foto('escalador-desplome-amarillo', { tamanos: '(min-width: 768px) 50vw, 100vw' }),
            pildoraHtml: pildora({ texto: 'Ver en Instagram', href: CONTACTO.instagram, abierta: '10.25rem' }),
            descripcion: `${esc(MURO.altura)}, paredes de 0° a 40°, moonboard y rutas nuevas cada mes.`,
            titulo: esc(servicio('escalada-libre').nombre),
          })}
          ${tarjeta({
            medio: foto('comunidad-evento', { tamanos: '(min-width: 768px) 50vw, 100vw' }),
            pildoraHtml: pildora({ texto: 'Ver eventos', href: CONTACTO.instagram, oscura: true, abierta: '8.5rem' }),
            descripcion: esc(COMUNIDAD.resumen),
            titulo: 'Comunidad y eventos',
            desde: 160,
          })}
        </div>
      </div>
    </section>

    <section class="seccion seccion--intro tono-oscuro" id="pordentro">
      <div class="contenedor">
        ${etiqueta(3, 'El muro por dentro')}
        <h2 class="titulo-intro intro__titulo" data-m-revelar>${titulo([`${MURO.altura},`, 'de 0° a 40°.'])}</h2>
        <div class="bloque">
          <p class="intro__parrafo" data-m-aparece>${esc(MURO.resumen)} ${esc(EQUIPO.construccion)}</p>
        </div>
        <div class="columnas">
          ${MURO.caracteristicas
            .map(
              (c, n) => `<div class="columna" data-m-aparece${retraso(n * 90)}>
            <h3 class="columna__titulo">${esc(c.titulo)}</h3>
            <p class="columna__texto">${esc(c.texto)}</p>
          </div>`
            )
            .join('\n          ')}
          <div class="columna" data-m-aparece style="--m-retraso: 540ms">
            <h3 class="columna__titulo">Para entrenar</h3>
            <ul class="columna__lista">
              ${MURO.entrenamiento.map((e) => `<li>${esc(e)}</li>`).join('\n              ')}
            </ul>
          </div>
          <div class="columna" data-m-aparece style="--m-retraso: 630ms">
            <h3 class="columna__titulo">Quién setea</h3>
            <p class="columna__texto">${esc(EQUIPO.seteadores.resumen)} ${esc(EQUIPO.seteadores.headsetter)} es el headsetter del lugar.</p>
          </div>
        </div>
        ${graduacion({ datos: MURO.graduacion })}
        ${galeria('muro-placa', 'muro-15', 'muro-25', 'moonboard')}
        ${galeria('muro-desplomes', 'muro-placa-desplome', 'presa-cerca', 'presa-volumen')}
      </div>
    </section>

    <section class="seccion seccion--intro tono-gradiente" id="equipo">
      <div class="contenedor">
        ${etiqueta(4, 'El equipo')}
        <h2 class="titulo-intro intro__titulo" data-m-revelar>${titulo(['Quiénes', 'somos.'])}</h2>
        <div class="bloque">
          <p class="intro__parrafo" data-m-aparece>${esc(EQUIPO.resumen)}</p>
        </div>
        <div class="columnas">
          <div class="columna" data-m-aparece>
            <h3 class="columna__titulo">Clases</h3>
            <ul class="columna__lista">
              ${EQUIPO.profesores.map((prof) => `<li>${esc(prof.nombre)} <span class="columna__nota">${esc(prof.detalle)}</span></li>`).join('\n              ')}
            </ul>
          </div>
          <div class="columna" data-m-aparece style="--m-retraso: 120ms">
            <h3 class="columna__titulo">Seteo</h3>
            <p class="columna__texto">${esc(EQUIPO.seteadores.nombres.join(', '))}. ${esc(EQUIPO.seteadores.headsetter)} es el headsetter del lugar.</p>
          </div>
          <div class="columna" data-m-aparece style="--m-retraso: 240ms">
            <h3 class="columna__titulo">El muro</h3>
            <p class="columna__texto">${esc(EQUIPO.construccion)}</p>
          </div>
          <div class="columna" data-m-aparece style="--m-retraso: 360ms">
            <h3 class="columna__titulo">${esc(PANCITA.nombre)}</h3>
            <p class="columna__texto">${esc(PANCITA.descripcion)}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="seccion m-con-telon seccion--tarjetas tono-oscuro" id="clases">
      ${telon({ semilla: 23, presas: 4 })}
      <div class="contenedor">
        ${etiqueta(5, 'Clases guiadas')}
        <h2 class="titulo-grande tarjetas__titulo" data-m-revelar>${titulo('Aprende con nosotros')}</h2>
        <div class="tarjetas">
          ${tarjeta({
            medio: foto('escaladora-desplome', { tamanos: '(min-width: 768px) 50vw, 100vw' }),
            pildoraHtml: pildora({ texto: TEXTOS.acciones.escribenos, href: CONTACTO.whatsapp, abierta: '8.5rem' }),
            descripcion: `${esc(clases.dias)} ${esc(clases.cupos)} ${esc(clases.nivel)}`,
            titulo: esc(clases.nombre),
          })}
          ${tarjeta({
            medio: foto('aniversario-escalador', { tamanos: '(min-width: 768px) 50vw, 100vw' }),
            pildoraHtml: pildora({ texto: TEXTOS.acciones.escribenos, href: CONTACTO.whatsapp, oscura: true, abierta: '8.5rem' }),
            descripcion: `${esc(clases.prueba)} ${esc(clases.incluyeEntrada)} ${esc(clases.descuento)}`,
            titulo: 'Antes de inscribirte',
            desde: 160,
          })}
        </div>
        ${galeria('campus', 'competencia-escaladora')}
      </div>
    </section>

    <section class="seccion seccion--intro tono-gradiente" id="kuyencitos">
      <div class="contenedor">
        ${etiqueta(6, 'Niñas y niños')}
        <h2 class="titulo-intro intro__titulo" data-m-revelar>${titulo(['Kuyencit@s.'])}</h2>
        <div class="bloque">
          <p class="intro__parrafo" data-m-aparece>${esc(servicio('kuyencitos').resumen)} ${esc(servicio('kuyencitos').edades)}</p>
          ${boton({ texto: TEXTOS.acciones.escribenos, href: CONTACTO.whatsapp, afuera: true, clase: 'intro__boton', aparece: 150 })}
        </div>
        <div class="columnas">
          <div class="columna" data-m-aparece>
            <h3 class="columna__titulo">Días y horario</h3>
            <p class="columna__texto">${esc(servicio('kuyencitos').dias)}</p>
          </div>
          <div class="columna" data-m-aparece style="--m-retraso: 120ms">
            <h3 class="columna__titulo">Valores</h3>
            <ul class="columna__lista">
              ${PRECIOS.filter((v) => v.id.startsWith('kuyencitos')).map((v) => `<li>${esc(mayusculaInicial(v.nombre.replace('Kuyencit@s, ', '')))}: ${esc(v.valor)}</li>`).join('\n              ')}
            </ul>
          </div>
          <div class="columna" data-m-aparece style="--m-retraso: 240ms">
            <h3 class="columna__titulo">Quién acompaña</h3>
            <p class="columna__texto">${esc(servicio('kuyencitos').acompanamiento)}</p>
          </div>
          <div class="columna" data-m-aparece style="--m-retraso: 360ms">
            <h3 class="columna__titulo">Autorización</h3>
            <p class="columna__texto">${esc(servicio('kuyencitos').autorizacion)} ${esc(PRIMERA_VISITA.menores)}</p>
          </div>
        </div>
        ${galeria('nino-escalando', 'joven-escalando')}
      </div>
    </section>

    <section class="seccion seccion--intro tono-oscuro" id="horarios">
      <div class="contenedor">
        ${etiqueta(7, 'Horarios y valores')}
        <h2 class="titulo-intro intro__titulo" data-m-revelar>${titulo(['Lunes a domingo,', `de ${HORARIOS.abre} a ${HORARIOS.cierra}.`])}</h2>
        <div class="bloque">
          <p class="intro__parrafo" data-m-aparece>${esc(HORARIOS.pago)} ${esc(HORARIOS.aviso)} ${esc(HORARIOS.verano)}</p>
          ${boton({ texto: 'Consultar por WhatsApp', href: CONTACTO.whatsapp, afuera: true, clase: 'intro__boton', aparece: 150 })}
        </div>
        <div class="columnas">
          ${HORARIOS.tramos
            .map(
              (tramo, n) => `<div class="columna" data-m-aparece${retraso(n * 120)}>
            <h3 class="columna__titulo">${esc(tramo.nombre)}</h3>
            <ul class="columna__lista">
              <li>${esc(tramo.descripcion)}</li>
              <li>${esc(tramo.dias)}</li>
              <li>${esc(tramo.horas)}</li>
            </ul>
          </div>`
            )
            .join('\n          ')}
          <div class="columna" data-m-aparece style="--m-retraso: 240ms">
            <h3 class="columna__titulo">Valores</h3>
            <ul class="columna__lista">
              ${PRECIOS.map((precio) => `<li>${esc(precio.nombre)}: ${esc(precio.valor)}${precio.valorEstudiante ? ` <span class="columna__nota">${esc(precio.valorEstudiante)} con credencial de estudiante</span>` : ''}</li>`).join('\n              ')}
            </ul>
          </div>
        </div>
      </div>
    </section>

    <section class="seccion seccion--intro tono-gradiente" id="primeravez">
      <div class="contenedor">
        ${etiqueta(8, 'Primera visita')}
        <h2 class="titulo-intro intro__titulo" data-m-revelar>${titulo(['Tu', 'primera vez.'])}</h2>
        <div class="bloque">
          <p class="intro__parrafo" data-m-aparece>${esc(PRIMERA_VISITA.resumen)} ${esc(PRIMERA_VISITA.aviso)} ${esc(PRIMERA_VISITA.menores)}</p>
          ${boton({ texto: TEXTOS.acciones.solicitud, href: LINKS.solicitudIngreso, afuera: true, clase: 'intro__boton', aparece: 150 })}
        </div>
        <div class="columnas">
          ${PRIMERA_VISITA.pasos
            .map(
              (paso, n) => `<div class="columna" data-m-aparece${retraso(n * 120)}>
            <h3 class="columna__titulo">Paso ${n + 1}</h3>
            <ol class="columna__lista columna__lista--numerada" start="${n + 1}">
              <li>${esc(paso.titulo)}. <span class="columna__nota">${esc(paso.texto)}${paso.enlace ? ` <a class="enlace" href="${esc(paso.enlace.url)}"${externo}>${esc(paso.enlace.texto)}</a>.` : ''}</span></li>
            </ol>
          </div>`
            )
            .join('\n          ')}
        </div>
      </div>
    </section>

    <section class="seccion seccion--intro tono-oscuro" id="reglamento">
      <div class="contenedor">
        ${etiqueta(9, 'Reglamento')}
        <h2 class="titulo-intro intro__titulo" data-m-revelar>${titulo(['Para cuidarnos', 'entre todos.'])}</h2>
        <div class="bloque">
          <p class="intro__parrafo" data-m-aparece>${esc(SOLICITUD.resumen)} ${esc(LEGAL.privacidad)}</p>
          ${boton({ texto: TEXTOS.acciones.solicitud, href: LINKS.solicitudIngreso, afuera: true, clase: 'intro__boton', aparece: 150 })}
        </div>
        <div class="columnas">
          ${[0, 5, 10]
            .map(
              (desde) => `<div class="columna" data-m-aparece${retraso(desde * 24)}>
            <h3 class="columna__titulo">Del ${desde + 1} al ${desde + 5}</h3>
            <ol class="columna__lista columna__lista--numerada" start="${desde + 1}">
              ${REGLAMENTO.slice(desde, desde + 5).map((regla) => `<li>${esc(regla)}</li>`).join('\n              ')}
            </ol>
          </div>`
            )
            .join('\n          ')}
        </div>
      </div>
    </section>

    <section class="seccion seccion--intro tono-gradiente" id="inclusion">
      <div class="contenedor">
        ${etiqueta(10, 'Comunidad')}
        <h2 class="titulo-intro intro__titulo" data-m-revelar>${titulo(['Un muro para', 'hacer comunidad.'])}</h2>
        <div class="bloque">
          <p class="intro__parrafo" data-m-aparece>${esc(COMUNIDAD.foco)} ${esc(COMUNIDAD.destinatario)}</p>
          ${valoracion({ datos: VALORACION, clase: 'intro__valoracion' })}
          ${boton({ texto: TEXTOS.acciones.instagram, href: CONTACTO.instagram, afuera: true, clase: 'intro__boton', aparece: 150 })}
        </div>
        <div class="columnas">
          <div class="columna" data-m-aparece>
            <h3 class="columna__titulo">Espacio para todos</h3>
            <p class="columna__texto">${esc(COMUNIDAD.inclusion)} ${esc(COMUNIDAD.publico)}</p>
          </div>
          <div class="columna" data-m-aparece style="--m-retraso: 120ms">
            <h3 class="columna__titulo">Todos los años</h3>
            <p class="columna__texto">${esc(EVENTOS_INFO.repiten)}</p>
          </div>
          <div class="columna" data-m-aparece style="--m-retraso: 240ms">
            <h3 class="columna__titulo">Cómo inscribirse</h3>
            <p class="columna__texto">${esc(EVENTOS_INFO.inscripcion)} ${esc(COMUNIDAD.anuncios)}</p>
          </div>
          <div class="columna" data-m-aparece style="--m-retraso: 360ms">
            <h3 class="columna__titulo">Lo que nos importa</h3>
            <ul class="columna__lista">
              ${COMUNIDAD.valores.map((v) => `<li>${esc(v)}</li>`).join('\n              ')}
            </ul>
          </div>
        </div>
        <h3 class="columna__titulo comunidad__rotulo" data-m-aparece>Lo que dicen en ${esc(VALORACION.fuente)}</h3>
        <div class="columnas">
          ${RESENAS.map(
            (r, n) => `<div class="columna" data-m-aparece${retraso(n * 90)}>
            <blockquote class="resena__cita">${esc(`«${r.cita}»`)}</blockquote>
            <p class="resena__autor">${esc(r.autor)} <span class="columna__nota">${esc(r.perfil ? `${r.perfil} en ${r.fuente}` : `en ${r.fuente}`)}</span></p>
          </div>`
          ).join('\n          ')}
        </div>
        ${galeria('aniversario-galpon', 'aniversario-volumen', 'aniversario-travesia', 'competencia-publico')}
      </div>
    </section>

    <section class="seccion seccion--intro tono-oscuro" id="enellugar">
      <div class="contenedor">
        ${etiqueta(11, 'En el lugar')}
        <h2 class="titulo-intro intro__titulo" data-m-revelar>${titulo(['Todo lo que', 'hay en Kuyen.'])}</h2>
        <div class="bloque">
          <p class="intro__parrafo" data-m-aparece>${esc(COMODIDADES.seguridad)} ${esc(COMODIDADES.estacionamiento)}</p>
        </div>
        <div class="columnas">
          <div class="columna" data-m-aparece>
            <h3 class="columna__titulo">A la venta</h3>
            <ul class="columna__lista">
              ${PRODUCTOS.lista.map((p) => `<li>${esc(p)}</li>`).join('\n              ')}
            </ul>
          </div>
          <div class="columna" data-m-aparece style="--m-retraso: 120ms">
            <h3 class="columna__titulo">Comodidades</h3>
            <ul class="columna__lista">
              ${COMODIDADES.lista.map((c) => `<li>${esc(c)}</li>`).join('\n              ')}
            </ul>
          </div>
          <div class="columna" data-m-aparece style="--m-retraso: 240ms">
            <h3 class="columna__titulo">También pasa acá</h3>
            <ul class="columna__lista">
              ${INVITADOS.map(
                (i) =>
                  `<li>${i.url ? `<a class="enlace" href="${esc(i.url)}"${externo}>${esc(i.nombre)}</a>` : esc(i.nombre)}: ${esc(i.resumen)}</li>`
              ).join('\n              ')}
            </ul>
          </div>
        </div>
        ${galeria('galpon', 'descanso')}
      </div>
    </section>

    <section class="seccion m-con-telon seccion--tarjetas tono-oscuro" id="instagram">
      ${telon({ semilla: 37, presas: 3 })}
      <div class="contenedor">
        ${etiqueta(12, 'En Instagram')}
        <h2 class="titulo-grande tarjetas__titulo" data-m-revelar>${titulo('Lo que publicamos')}</h2>
        <div class="tarjetas tarjetas--tres">
          ${INSTAGRAM.publicaciones
            .map((pub, n) =>
              tarjeta({
                claseMedio: 'tarjeta__medio--instagram',
                atributos: ' data-instagram-tarjeta',
                atributosMedio: ' data-instagram-medio',
                claseMedio: 'con-publicacion',
                medio: publicacion({ base: INSTAGRAM.base, ruta: pub.ruta, titulo: `Publicación de ${MARCA.nombre} en Instagram: ${pub.titulo}` }),
                pildoraHtml: '',
                descripcion: `${esc(pub.detalle)} <a class="enlace" href="${esc(`${INSTAGRAM.base}${pub.ruta}/`)}"${externo}>${esc(TEXTOS.acciones.abrirInstagram)}</a>`,
                titulo: esc(pub.titulo),
                desde: n * 140,
              })
            )
            .join('\n          ')}
        </div>
        <p class="tarjetas__nota" data-m-aparece>${esc(TEXTOS.instagram)}</p>
      </div>
    </section>

    <section class="seccion m-con-telon seccion--tarjetas tono-gradiente" id="visitanos">
      ${telon({ semilla: 53, presas: 3 })}
      <div class="contenedor">
        ${etiqueta(13, 'Visítanos')}
        <h2 class="titulo-grande tarjetas__titulo" data-m-revelar>${titulo(UBICACION.calle)}</h2>
        <div class="tarjetas">
          ${tarjeta({
            claseMedio: 'tarjeta__medio--mapa',
            medio: mapa({ url: UBICACION.mapaEmbebido, titulo: `Mapa de ${MARCA.nombre} en ${UBICACION.calle}, ${UBICACION.comuna}` }),
            pildoraHtml: '',
            descripcion: `Plus code ${esc(UBICACION.plusCode)}. ${esc(UBICACION.referencia)}. <a class="enlace" href="${esc(UBICACION.maps)}"${externo}>${esc(TEXTOS.acciones.abrirMaps)}</a>`,
            titulo: 'Cómo llegar',
          })}
          ${tarjeta({
            medio: foto('fachada', { tamanos: '(min-width: 768px) 50vw, 100vw' }),
            pildoraHtml: pildora({ texto: TEXTOS.acciones.escribenos, href: CONTACTO.whatsapp, oscura: true, abierta: '8.5rem' }),
            descripcion: `WhatsApp ${esc(CONTACTO.telefono)}, mensaje directo en Instagram, ${esc(CONTACTO.instagramUsuario)}, o correo a <a class="enlace" href="mailto:${esc(CONTACTO.correo)}">${esc(CONTACTO.correo)}</a>. ${esc(CONTACTO.horarioRespuesta)} ${esc(COMODIDADES.referencia)}`,
            titulo: 'Contacto',
            desde: 160,
          })}
        </div>
      </div>
    </section>
  </main>

  <footer class="pie tono-oscuro">
    <div class="contenedor pie__interior">
      <div class="pie__llamado">
        <div class="pie__llamado-texto">
          <div class="etiqueta etiqueta--pie" data-m-aparece>
            <img class="etiqueta__isotipo" src="/img/marca/isotipo-256.webp" width="256" height="256" alt="">
            <span class="insignia">¿Primera vez en Kuyen?</span>
          </div>
          <h2 class="titulo-grande" data-m-revelar>${titulo(['Te esperamos', 'en el muro.'])}</h2>
        </div>
        <div class="pie__acciones" data-m-aparece style="--m-retraso: 300ms">
          ${boton({ texto: TEXTOS.acciones.solicitud, href: LINKS.solicitudIngreso, afuera: true })}
          <a class="pie__enlace" href="${esc(CONTACTO.whatsapp)}"${externo}>${esc(TEXTOS.acciones.whatsapp)}</a>
        </div>
      </div>

      <div class="pie__grilla">
        <div class="pie__marca" data-m-aparece>
          <a class="marca" href="#contenido" aria-label="${esc(MARCA.nombre)}, inicio">
            <img class="marca__isotipo" src="/img/marca/isotipo-256.webp" width="256" height="256" alt="">
            <span class="marca__nombre">${esc(MARCA.nombreLogo)}</span>
          </a>
          <p class="pie__bio">${esc(MARCA.bio)}</p>
          <span class="pie__estado"><span class="pie__punto"></span>${esc(UBICACION.calle)}, ${esc(UBICACION.comuna)}</span>
        </div>
        <nav class="pie__columna" aria-label="Kuyen" data-m-aparece style="--m-retraso: 100ms">
          <h3 class="columna__titulo">Kuyen</h3>
          <ul>
            ${enlacePie('#kuyen', 'Qué es Kuyen')}
            ${enlacePie('#muro', 'El muro')}
            ${enlacePie('#pordentro', 'El muro por dentro')}
            ${enlacePie('#equipo', 'Quiénes somos')}
            ${enlacePie('#clases', 'Clases')}
            ${enlacePie('#kuyencitos', 'Kuyencit@s')}
            ${enlacePie('#inclusion', 'Comunidad')}
            ${enlacePie('#primeravez', 'Tu primera vez')}
            ${enlacePie('#enellugar', 'En el lugar')}
            ${enlacePie('#reglamento', 'Reglamento')}
            ${enlacePie('#instagram', 'En Instagram')}
          </ul>
        </nav>
        <nav class="pie__columna" aria-label="Visítanos" data-m-aparece style="--m-retraso: 200ms">
          <h3 class="columna__titulo">Visítanos</h3>
          <ul>
            ${enlacePie('#horarios', 'Horarios y valores')}
            ${enlacePie('#visitanos', 'Cómo llegar')}
            ${enlacePie(UBICACION.maps, 'Google Maps', true)}
            ${enlacePie(LINKS.solicitudIngreso, TEXTOS.acciones.solicitud, true)}
          </ul>
        </nav>
        <nav class="pie__columna" aria-label="Contacto" data-m-aparece style="--m-retraso: 300ms">
          <h3 class="columna__titulo">Contacto</h3>
          <ul>
            ${enlacePie(CONTACTO.whatsapp, 'WhatsApp', true)}
            ${enlacePie(CONTACTO.instagram, 'Instagram', true)}
            ${enlacePie(CONTACTO.tiktok, 'TikTok', true)}
            ${enlacePie(CONTACTO.facebook, 'Facebook', true)}
            ${enlacePie(LINKS.linktree, 'Linktree', true)}
            ${enlacePie(`mailto:${CONTACTO.correo}`, CONTACTO.correo)}
          </ul>
        </nav>
      </div>

      <div class="pie__gigante" aria-hidden="true"><span>KÜYEN</span></div>

      <div class="pie__legal">
        <p>© 2026 ${esc(MARCA.nombre)}. ${esc(LEGAL.razonSocial)}.</p>
        <div class="pie__legal-enlaces">
          <a href="${esc(CONTACTO.instagram)}"${externo}>Instagram</a>
          <a href="${esc(CONTACTO.whatsapp)}"${externo}>WhatsApp</a>
        </div>
      </div>
    </div>
  </footer>

  <script>
${compartido('movimiento.js')};
${compartido('visor.js')};
${compartido('instagram.js')};
${leer('script.js')};
  </script>
</body>
</html>
`
}
