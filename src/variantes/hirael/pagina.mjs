/**
 * Variante Hirael: la estructura del template Hirael Agency Landing con el
 * contenido, la tipografía y los colores de Kuyen.
 *
 * Sigue la ficha de estructura de la fase 0, sección por sección:
 *   1  Hero de alto de pantalla, con la cabecera en píldora adentro y el
 *      contenido anclado abajo a la izquierda.
 *   1b Menú móvil en hoja que sube desde abajo.
 *   2  "1 · Qué es Kuyen": título, párrafo, botón y dos fotos asimétricas.
 *   3  "2 · El muro y la comunidad": dos tarjetas 4:3 con píldora.
 *   4  Pie oscuro con bloque de llamado, columnas y marca gigante.
 *
 * Secciones agregadas con componentes del mismo template (decisión del
 * 15-09-2026), entre la 3 y el pie:
 *   "3 · Clases y Kuyencit@s" y "6 · Visítanos": tarjetas de la sección 2.
 *   "4 · Horarios y valores" y "5 · Reglamento": intro de la sección 1 con las
 *   columnas del pie.
 *
 * Diferencias con el template:
 * - El fondo animado del hero pasa a ser el gradiente del logo animado con CSS,
 *   con una estela que sigue al puntero.
 * - Los videos de las tarjetas pasan a fotos de Kuyen.
 * - La intro usa un solo bloque de markup para móvil y escritorio (el template
 *   lo repite dos veces).
 * - Títulos en Bebas Neue, sin tracking negativo; en tarjetas, más grandes que
 *   los 14 a 15 px del template para que la condensada se lea.
 * - El menú móvil también se cierra con Escape y queda inerte mientras está
 *   cerrado.
 */

const ICONOS = {
  flecha:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  diagonal:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg>',
  menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
  // Estrella de cuatro puntas, como las del cielo del logo.
  estrella:
    '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 1c.9 6.6 4.4 10.1 11 11-6.6.9-10.1 4.4-11 11-.9-6.6-4.4-10.1-11-11 6.6-.9 10.1-4.4 11-11z"/></svg>',
  pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/></svg>',
}

export default function pagina({ site, contenido, esc, foto, cabeza, leer }) {
  const {
    POR_CONFIRMAR,
    MARCA,
    UBICACION,
    CONTACTO,
    LINKS,
    HISTORIA,
    CIFRAS,
    SERVICIOS,
    HORARIOS,
    PRECIOS,
    COMUNIDAD,
    REGLAMENTO,
    SOLICITUD,
    TEXTOS,
  } = contenido

  const externo = ' target="_blank" rel="noopener"'
  const servicio = (id) => SERVICIOS.find((s) => s.id === id)
  const google = CIFRAS.find((c) => c.id === 'google')

  /** Dato que Kuyen no confirmó: visible en la página y comentado en el código. */
  const pendiente = (falta) => `<!-- POR CONFIRMAR: ${falta} --><span class="pendiente">${POR_CONFIRMAR}</span>`

  /** Botón píldora con texto que rueda y círculo con flecha. */
  const boton = ({ texto, href, variante = 'primario', afuera = false, clase = '' }) => `<a class="boton boton--${variante}${clase ? ` ${clase}` : ''}" href="${esc(href)}"${afuera ? externo : ''}>
            <span class="boton__texto"><span class="boton__rollo"><span>${esc(texto)}</span><span aria-hidden="true">${esc(texto)}</span></span></span>
            <span class="boton__circulo">${ICONOS.flecha}</span>
          </a>`

  /** Círculo numerado más insignia con borde. */
  const etiqueta = (numero, texto) => `<div class="etiqueta">
          <span class="etiqueta__numero">${numero}</span>
          <span class="insignia">${esc(texto)}</span>
        </div>`

  /** Píldora de 36 px que se estira en hover y muestra su texto. */
  const pildora = ({ texto, href, oscura = false, abierta, mapa }) => {
    const clases = `pildora${oscura ? ' pildora--oscura' : ''}`
    const contenidoPildora = `<span class="pildora__icono">${mapa ? ICONOS.pin : ICONOS.diagonal}</span><span class="pildora__texto">${esc(texto)}</span>`
    if (mapa) {
      return `<button type="button" class="${clases}" style="--abierta: ${abierta}" data-mapa="${esc(mapa.url)}" data-titulo="${esc(mapa.titulo)}">${contenidoPildora}</button>`
    }
    return `<a class="${clases}" style="--abierta: ${abierta}" href="${esc(href)}"${externo}>${contenidoPildora}</a>`
  }

  /** Tarjeta de la sección 2: medio 4:3 con píldora, descripción y título. */
  const tarjeta = ({ medio, pildoraHtml, descripcion, titulo, claseMedio = '' }) => `<article class="tarjeta">
            <div class="tarjeta__medio${claseMedio ? ` ${claseMedio}` : ''}">
              ${medio}
              ${pildoraHtml}
            </div>
            <p class="tarjeta__descripcion">${descripcion}</p>
            <h3 class="tarjeta__titulo">${titulo}</h3>
          </article>`

  const enlacesMenu = [
    ['#kuyen', 'Kuyen'],
    ['#muro', 'El muro'],
    ['#clases', 'Clases'],
    ['#visitanos', 'Visítanos'],
  ]

  const lema = esc(MARCA.lema).replace(' por ', ' <br class="hero__salto">por ').replace(' para ', ' <br class="hero__salto">para ')

  const enlacePie = (href, texto, afuera = false) =>
    `<li><a href="${esc(href)}"${afuera ? externo : ''}>${esc(texto)}${ICONOS.diagonal}</a></li>`

  const clases = servicio('clases')

  return `<!DOCTYPE html>
<html lang="${site.lang}">
${cabeza({ estilos: leer('estilos.css') })}
<body>
  <a class="saltar" href="#contenido">Saltar al contenido</a>

  <section class="hero tono-gradiente" data-hero>
    <div class="hero__fondo" aria-hidden="true">
      <div class="hero__remolino"></div>
      <div class="hero__acanalado"></div>
      <div class="hero__estela"></div>
      <div class="hero__grano"></div>
    </div>

    <header class="cabecera">
      <nav class="cabecera__nav tono-claro" aria-label="Principal">
        <div class="cabecera__izquierda">
          <a class="marca" href="#contenido" aria-label="${esc(MARCA.nombre)}, inicio">
            <img class="marca__isotipo" src="/img/marca/isotipo-256.webp" width="256" height="256" alt="">
            <span class="marca__nombre">${esc(MARCA.nombreLogo)}</span>
          </a>
          <div class="cabecera__enlaces">
            ${enlacesMenu.map(([href, texto]) => `<a href="${href}">${esc(texto)}</a>`).join('\n            ')}
          </div>
        </div>
        <div class="cabecera__derecha">
          <span class="cabecera__estado">Renovamos rutas de forma periódica</span>
          ${boton({ texto: TEXTOS.acciones.escribenos, href: CONTACTO.whatsapp, variante: 'oscuro', afuera: true })}
        </div>
        <button type="button" class="cabecera__menu" aria-label="Abrir el menú" aria-expanded="false" aria-controls="menu-movil" data-menu-abrir>${ICONOS.menu}</button>
      </nav>
    </header>

    <div class="hero__contenido" id="contenido" tabindex="-1">
      <div class="contenedor hero__interior">
        <span class="hero__antetitulo">Escalada en boulder · ${esc(UBICACION.comuna)}</span>
        <h1 class="titulo-grande">${lema}</h1>
        <div class="hero__acciones">
          ${boton({ texto: TEXTOS.acciones.solicitud, href: LINKS.solicitudIngreso, afuera: true })}
          <div class="chip tono-claro">
            ${ICONOS.estrella}
            <span class="chip__texto">${esc(google.valor)} en Google</span>
            <span class="chip__insignia">${esc(google.etiqueta.split(', con ')[1])}</span>
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

  <main>
    <section class="seccion seccion--intro tono-claro" id="kuyen">
      <div class="contenedor">
        ${etiqueta(1, 'Qué es Kuyen')}
        <h2 class="titulo-intro intro__titulo">${esc(MARCA.definicion)}<br> en ${esc(UBICACION.comuna)}.</h2>
        <div class="intro__grilla">
          <div class="intro__texto">
            <p class="intro__parrafo">${esc(MARCA.significado)} Desde ${HISTORIA.desde}, ${esc(MARCA.lema.charAt(0).toLowerCase() + MARCA.lema.slice(1))}.</p>
            ${boton({ texto: 'Conoce el muro', href: '#muro', clase: 'intro__boton' })}
          </div>
          ${foto('pancita', { clase: 'intro__foto intro__foto--chica', tamanos: '(min-width: 1024px) 24vw, (min-width: 640px) 45vw, 100vw' })}
          ${foto('escalador-muro-blanco', { clase: 'intro__foto intro__foto--grande', tamanos: '(min-width: 1024px) 44vw, (min-width: 640px) 55vw, 100vw' })}
        </div>
      </div>
    </section>

    <section class="seccion seccion--tarjetas seccion--tinte tono-claro" id="muro">
      <div class="contenedor">
        ${etiqueta(2, 'El muro y la comunidad')}
        <h2 class="titulo-grande tarjetas__titulo">Escalar en Kuyen</h2>
        <div class="tarjetas">
          ${tarjeta({
            medio: foto('escalador-desplome-amarillo', { tamanos: '(min-width: 768px) 50vw, 100vw' }),
            pildoraHtml: pildora({ texto: 'Ver en Instagram', href: CONTACTO.instagram, abierta: '10.25rem' }),
            descripcion: 'Desplomes continuos hasta 25°, moonboard y rutas nuevas de forma periódica.',
            titulo: esc(servicio('escalada-libre').nombre),
          })}
          ${tarjeta({
            medio: foto('comunidad-evento', { tamanos: '(min-width: 768px) 50vw, 100vw' }),
            pildoraHtml: pildora({ texto: 'Ver eventos', href: CONTACTO.instagram, oscura: true, abierta: '8.5rem' }),
            descripcion: esc(COMUNIDAD.resumen),
            titulo: 'Comunidad y eventos',
          })}
        </div>
      </div>
    </section>

    <section class="seccion seccion--tarjetas tono-claro" id="clases">
      <div class="contenedor">
        ${etiqueta(3, 'Clases y Kuyencit@s')}
        <h2 class="titulo-grande tarjetas__titulo">Aprende con nosotros</h2>
        <div class="tarjetas">
          ${tarjeta({
            medio: foto('escaladora-desplome', { tamanos: '(min-width: 768px) 50vw, 100vw' }),
            pildoraHtml: pildora({ texto: TEXTOS.acciones.escribenos, href: CONTACTO.whatsapp, abierta: '8.5rem' }),
            descripcion: `${esc(clases.resumen)} Técnica, seguridad y lectura de rutas. Días y horarios: ${pendiente('días, horarios y cupos de las clases guiadas (pregunta 4)')}`,
            titulo: esc(clases.nombre),
          })}
          ${tarjeta({
            medio: foto('nino-escalando', { tamanos: '(min-width: 768px) 50vw, 100vw' }),
            pildoraHtml: pildora({ texto: TEXTOS.acciones.escribenos, href: CONTACTO.whatsapp, oscura: true, abierta: '8.5rem' }),
            descripcion: `${esc(servicio('kuyencitos').resumen)} Edades y días: ${pendiente('edades, días, horario y valor de Kuyencit@s (pregunta 3)')}`,
            titulo: esc(servicio('kuyencitos').nombre),
          })}
        </div>
      </div>
    </section>

    <section class="seccion seccion--intro seccion--tinte tono-claro" id="horarios">
      <div class="contenedor">
        ${etiqueta(4, 'Horarios y valores')}
        <h2 class="titulo-intro intro__titulo">Dos tramos para escalar:<br> horario bajo y horario normal.</h2>
        <div class="bloque">
          <p class="intro__parrafo">Se paga al ingresar. Horarios y valores vigentes: ${pendiente('horario por día con los dos tramos y precios vigentes (preguntas 1 y 2)')}</p>
          ${boton({ texto: 'Consultar por WhatsApp', href: CONTACTO.whatsapp, afuera: true, clase: 'intro__boton' })}
        </div>
        <div class="columnas">
          ${HORARIOS.tramos
            .map(
              (tramo) => `<div class="columna">
            <h3 class="columna__titulo">${esc(tramo.nombre)}</h3>
            <ul class="columna__lista">
              <li>${esc(tramo.descripcion)}</li>
              <li>Días: ${pendiente(`días del ${tramo.nombre.toLowerCase()} (pregunta 1)`)}</li>
              <li>Horas: ${pendiente(`horas del ${tramo.nombre.toLowerCase()} (pregunta 1)`)}</li>
            </ul>
          </div>`
            )
            .join('\n          ')}
          <div class="columna columna--ancha">
            <h3 class="columna__titulo">Valores</h3>
            <ul class="columna__lista">
              ${PRECIOS.map((precio) => `<li>${esc(precio.nombre)}: ${pendiente(`valor de ${precio.nombre.toLowerCase()} (pregunta 2)`)}</li>`).join('\n              ')}
            </ul>
          </div>
        </div>
      </div>
    </section>

    <section class="seccion seccion--intro tono-claro" id="reglamento">
      <div class="contenedor">
        ${etiqueta(5, 'Reglamento')}
        <h2 class="titulo-intro intro__titulo">Para cuidarnos<br> entre todos.</h2>
        <div class="bloque">
          <p class="intro__parrafo">${esc(SOLICITUD.resumen)}</p>
          ${boton({ texto: TEXTOS.acciones.solicitud, href: LINKS.solicitudIngreso, afuera: true, clase: 'intro__boton' })}
        </div>
        <div class="columnas">
          ${[0, 5, 10]
            .map(
              (desde) => `<div class="columna${desde === 10 ? ' columna--ancha' : ''}">
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

    <section class="seccion seccion--tarjetas seccion--tinte tono-claro" id="visitanos">
      <div class="contenedor">
        ${etiqueta(6, 'Visítanos')}
        <h2 class="titulo-grande tarjetas__titulo">${esc(UBICACION.calle)}</h2>
        <div class="tarjetas">
          ${tarjeta({
            claseMedio: 'tono-gradiente',
            medio: `<div class="mapa">
                ${ICONOS.pin}
                <p class="mapa__direccion">${esc(UBICACION.calle)}<br>${esc(UBICACION.comuna)}, ${esc(UBICACION.region)}</p>
                <p class="mapa__nota">${esc(TEXTOS.mapa)}</p>
              </div>`,
            pildoraHtml: pildora({
              texto: TEXTOS.acciones.verMapa,
              abierta: '7.5rem',
              mapa: { url: UBICACION.mapaEmbebido, titulo: `Mapa de ${MARCA.nombre} en ${UBICACION.calle}, ${UBICACION.comuna}` },
            }),
            descripcion: `Plus code ${esc(UBICACION.plusCode)}. ${esc(UBICACION.referencia)}. <a class="enlace" href="${esc(UBICACION.maps)}"${externo}>${esc(TEXTOS.acciones.abrirMaps)}</a>`,
            titulo: 'Cómo llegar',
          })}
          ${tarjeta({
            medio: foto('joven-escalando', { tamanos: '(min-width: 768px) 50vw, 100vw' }),
            pildoraHtml: pildora({ texto: TEXTOS.acciones.escribenos, href: CONTACTO.whatsapp, oscura: true, abierta: '8.5rem' }),
            descripcion: `WhatsApp ${esc(CONTACTO.telefono)} o mensaje directo en Instagram, ${esc(CONTACTO.instagramUsuario)}.`,
            titulo: 'Contacto',
          })}
        </div>
      </div>
    </section>
  </main>

  <footer class="pie tono-oscuro">
    <div class="contenedor pie__interior">
      <div class="pie__llamado">
        <div class="pie__llamado-texto">
          <div class="etiqueta etiqueta--pie">
            <img class="etiqueta__isotipo" src="/img/marca/isotipo-256.webp" width="256" height="256" alt="">
            <span class="insignia">¿Primera vez en Kuyen?</span>
          </div>
          <h2 class="titulo-grande">Te esperamos <br class="pie__salto">en el muro.</h2>
        </div>
        <div class="pie__acciones">
          ${boton({ texto: TEXTOS.acciones.solicitud, href: LINKS.solicitudIngreso, afuera: true })}
          <a class="pie__enlace" href="${esc(CONTACTO.whatsapp)}"${externo}>${esc(TEXTOS.acciones.whatsapp)}</a>
        </div>
      </div>

      <div class="pie__grilla">
        <div class="pie__marca">
          <a class="marca" href="#contenido" aria-label="${esc(MARCA.nombre)}, inicio">
            <img class="marca__isotipo" src="/img/marca/isotipo-256.webp" width="256" height="256" alt="">
            <span class="marca__nombre">${esc(MARCA.nombreLogo)}</span>
          </a>
          <p class="pie__bio">${esc(MARCA.bio)}</p>
          <span class="pie__estado"><span class="pie__punto"></span>${esc(UBICACION.calle)}, ${esc(UBICACION.comuna)}</span>
        </div>
        <nav class="pie__columna" aria-label="Kuyen">
          <h3 class="columna__titulo">Kuyen</h3>
          <ul>
            ${enlacePie('#kuyen', 'Qué es Kuyen')}
            ${enlacePie('#muro', 'El muro')}
            ${enlacePie('#clases', 'Clases')}
            ${enlacePie('#reglamento', 'Reglamento')}
          </ul>
        </nav>
        <nav class="pie__columna" aria-label="Visítanos">
          <h3 class="columna__titulo">Visítanos</h3>
          <ul>
            ${enlacePie('#horarios', 'Horarios y valores')}
            ${enlacePie('#visitanos', 'Cómo llegar')}
            ${enlacePie(UBICACION.maps, 'Google Maps', true)}
            ${enlacePie(LINKS.solicitudIngreso, TEXTOS.acciones.solicitud, true)}
          </ul>
        </nav>
        <nav class="pie__columna" aria-label="Contacto">
          <h3 class="columna__titulo">Contacto</h3>
          <ul>
            ${enlacePie(CONTACTO.whatsapp, 'WhatsApp', true)}
            ${enlacePie(CONTACTO.instagram, 'Instagram', true)}
            ${enlacePie(LINKS.linktree, 'Linktree', true)}
            <li><span>Correo: ${pendiente('correo de contacto (pregunta 6)')}</span></li>
          </ul>
        </nav>
      </div>

      <div class="pie__gigante" aria-hidden="true"><span>KÜYEN</span></div>

      <div class="pie__legal">
        <p>© 2026 ${esc(MARCA.nombre)}.</p>
        <div class="pie__legal-enlaces">
          <a href="${esc(CONTACTO.instagram)}"${externo}>Instagram</a>
          <a href="${esc(CONTACTO.whatsapp)}"${externo}>WhatsApp</a>
        </div>
      </div>
    </div>
  </footer>

  <script>
${leer('script.js')}
  </script>
</body>
</html>
`
}
