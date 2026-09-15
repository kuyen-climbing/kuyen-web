/**
 * Variante Karate: la estructura del template Karate Academy con el contenido,
 * la tipografía y los colores de Kuyen.
 *
 * Sigue la ficha de estructura de la fase 0, sección por sección:
 *   1  Navegación fija con desenfoque; menú a pantalla completa en móvil y tablet.
 *   2  Hero de alto de pantalla: tarjeta con insignia, título de tres líneas con
 *      la última destacada, párrafo, dos botones y tres fotos 3:4 apiladas.
 *   3  Nuestra historia: carrusel de dos fotos 4:5 con insignia flotante,
 *      antetítulo, título de dos líneas, dos párrafos, tres cifras y botón.
 *   4  Programas: cabecera con enlace y tres tarjetas con foto, número, título,
 *      flecha, descripción y línea.
 *   6  Horarios: cabecera con enlace, pestañas por día y tabla de cuatro columnas.
 *   7  Testimonios: cuatro cifras, tarjeta de acento y carrusel 3D de cinco
 *      tarjetas sobre una foto oscura.
 *   8  Llamado: tarjeta con foto de fondo, antetítulo, título, párrafo y botón.
 *   9  Preguntas frecuentes: ocho preguntas en acordeón.
 *   10 Pie: marca con íconos, navegación, contacto y mapa.
 * La sección 5 (Built Steps) queda fuera, como en la captura.
 *
 * Sección agregada con componentes del mismo template: "En Instagram", con las
 * tarjetas de Programas, donde la publicación se carga al hacer clic.
 *
 * Diferencias con el template:
 * - Toda la página va de noche, con títulos en Rubik Dirt y acento amarillo luna.
 * - El fondo del hero pasa a ser el cielo del logo con estrellas que titilan, la
 *   luna en el medio de la tarjeta, rastro de tiza y entrada orquestada. La pila
 *   de fotos se inclina siguiendo al mouse y se abre en abanico al pasar el
 *   puntero, y los gatos del logo asoman chicos bajo la tarjeta.
 * - En los horarios, las filas quedan [POR CONFIRMAR] hasta tener el horario
 *   vigente, y en móvil cada fila se lee como una ficha.
 * - Las reseñas quedan [POR CONFIRMAR] hasta tener textos y permisos.
 * - El acordeón abre con clic o toque (el template también abre con hover), para
 *   que la lista no salte al pasar el mouse.
 */
import { cielo, luna, cordillera, presa, titulo, cifras } from '../../compartido/escena.mjs'

const trazo = (d, extra = '') =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"${extra}>${d}</svg>`

const ICONOS = {
  flecha: trazo('<path d="M5 12h14M13 6l6 6-6 6"/>'),
  flechaAtras: trazo('<path d="M19 12H5M11 6l-6 6 6 6"/>'),
  diagonal: trazo('<path d="M7 17 17 7M8 7h9v9"/>'),
  chevron: trazo('<path d="m6 9 6 6 6-6"/>'),
  menu: trazo('<path d="M4 7h16M4 12h16M4 17h16"/>'),
  cerrar: trazo('<path d="M6 6l12 12M18 6 6 18"/>'),
  pin: trazo('<path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/>'),
  telefono: trazo('<path d="M20 12a8 8 0 0 1-11.8 7L4 20l1.1-4A8 8 0 1 1 20 12z"/>'),
  correo: trazo('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>'),
  instagram: trazo('<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/>'),
  enlace: trazo('<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>'),
  // Estrella de cuatro puntas, como las del cielo del logo.
  estrella:
    '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 1c.9 6.6 4.4 10.1 11 11-6.6.9-10.1 4.4-11 11-.9-6.6-4.4-10.1-11-11 6.6-.9 10.1-4.4 11-11z"/></svg>',
}

const minusculaInicial = (texto) => texto.charAt(0).toLowerCase() + texto.slice(1)
const sinTildes = (texto) => texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

export default function pagina({ site, contenido, esc, foto, cabeza, leer, compartido }) {
  const {
    POR_CONFIRMAR,
    MARCA,
    SEO,
    UBICACION,
    CONTACTO,
    LINKS,
    HISTORIA,
    CIFRAS,
    INSTAGRAM,
    SERVICIOS,
    HORARIOS,
    COMUNIDAD,
    EVENTOS,
    REGLAMENTO,
    SOLICITUD,
    TESTIMONIOS,
    TEXTOS,
  } = contenido

  const externo = ' target="_blank" rel="noopener"'
  const retraso = (ms) => (ms ? ` style="--m-retraso: ${ms}ms"` : '')
  const cifra = (id) => CIFRAS.find((c) => c.id === id)
  const servicio = (id) => SERVICIOS.find((s) => s.id === id)
  const acento = (texto) => ({ texto, clase: 'm-acento' })

  /** Dato que Kuyen no confirmó: visible en la página y comentado en el código. */
  const pendiente = (falta) => `<!-- POR CONFIRMAR: ${falta} --><span class="pendiente">${POR_CONFIRMAR}</span>`

  /** Botón de esquinas suaves con flecha que se corre en hover. */
  const boton = ({ texto, href, variante = 'primario', afuera = false, flecha = true, clase = '', extra = '' }) =>
    `<a class="boton boton--${variante}${clase ? ` ${clase}` : ''}" href="${esc(href)}"${afuera ? externo : ''}${extra}><span>${esc(texto)}</span>${flecha ? ICONOS.flecha : ''}</a>`

  /** Antetítulo con la estrella del logo. */
  const antetitulo = (texto, extra = ' data-m-aparece') => `<p class="antetitulo"${extra}>${ICONOS.estrella}<span>${esc(texto)}</span></p>`

  const enlacesMenu = [
    ['#programas', 'Programas'],
    ['#historia', 'Nuestra historia'],
    ['#horarios', 'Horarios'],
    ['#contacto', 'Contacto'],
  ]

  const libre = servicio('escalada-libre')
  const clases = servicio('clases')
  const kuyencitos = servicio('kuyencitos')

  // "Nos vemos en las presas", en tres líneas con la última destacada.
  const [inicioDespedida, finDespedida] = MARCA.frases.despedida.split(' en las ')
  // "Desde marzo de 2026: un plan de 8 clases al mes, 2 veces por semana."
  const [desdeClases, planClases] = clases.resumen.split(': ')
  const clasesAlMes = planClases.match(/\d+ clases al mes/)[0]

  const proximo = EVENTOS.filter((e) => e.proximo).sort((a, b) => a.fecha.localeCompare(b.fecha))[0]

  const programas = [
    { servicio: libre, foto: 'escalador-muro-blanco', texto: `${esc(libre.resumen)} ${esc(libre.detalles[0])}` },
    { servicio: clases, foto: 'escalador-desplome-amarillo', texto: `${esc(clases.resumen)} Días y horarios: ${pendiente('días, horarios y cupos de las clases guiadas (pregunta 4)')}` },
    { servicio: kuyencitos, foto: 'nino-escalando', texto: `${esc(kuyencitos.resumen)} Edades, días y valor: ${pendiente('edades, días, horario y valor de Kuyencit@s (pregunta 3)')}` },
  ]

  const dias = HORARIOS.semana.map((d) => ({ ...d, id: sinTildes(d.dia) }))

  const preguntas = [
    {
      pregunta: '¿Qué hago antes de mi primera visita?',
      respuesta: `<p>${esc(SOLICITUD.resumen)}</p><p><a class="enlace" href="${esc(LINKS.solicitudIngreso)}"${externo}>Completar la solicitud de ingreso</a></p>`,
    },
    {
      pregunta: '¿Cuáles son las reglas del muro?',
      respuesta: `<p>El reglamento tiene ${REGLAMENTO.length} puntos:</p><ol class="faq__reglas">${REGLAMENTO.map((r) => `<li>${esc(r)}</li>`).join('')}</ol>`,
    },
    {
      pregunta: '¿Necesito experiencia para escalar?',
      respuesta: `<p>${esc(libre.resumen)} Si quieres aprender con guía, hay ${esc(clases.nombre.toLowerCase())} ${esc(minusculaInicial(clases.resumen))}</p>`,
    },
    {
      pregunta: '¿Hay escalada para niñas y niños?',
      respuesta: `<p>Sí: ${esc(kuyencitos.nombre)} es ${esc(minusculaInicial(kuyencitos.resumen))} Edades, días y valor: ${pendiente('edades, días, horario y valor de Kuyencit@s (pregunta 3)')}</p>`,
    },
    {
      pregunta: '¿Qué calzado necesito?',
      respuesta: `<p>El reglamento pide escalar con calzado. Arriendo de pies de gato y venta de magnesio: ${pendiente('si arriendan pies de gato y venden magnesio, y a qué valor (pregunta 5)')}</p>`,
    },
    {
      pregunta: '¿Cuáles son los horarios y valores?',
      respuesta: `<p>Hay dos tramos, horario bajo y horario normal, y se paga al ingresar. Horas y valores vigentes: ${pendiente('horario por día con los dos tramos y precios vigentes (preguntas 1 y 2)')}</p>`,
    },
    {
      pregunta: '¿Qué apps usan en el muro?',
      respuesta: `<p>${LINKS.apps.map((app) => `<a class="enlace" href="${esc(app.url)}"${externo}>${esc(app.nombre)}</a>, ${esc(minusculaInicial(app.uso))}`).join('; y ')}.</p>`,
    },
    {
      pregunta: '¿Dónde se anuncian los eventos?',
      respuesta: `<p>${esc(COMUNIDAD.anuncios)} Síguenos en <a class="enlace" href="${esc(CONTACTO.instagram)}"${externo}>${esc(CONTACTO.instagramUsuario)}</a>.</p>`,
    },
  ]

  return `<!DOCTYPE html>
<html lang="${site.lang}">
${cabeza({ estilos: `${compartido('movimiento.css')}\n${leer('estilos.css')}` })}
<body>
  <script>document.documentElement.classList.add('m-js')</script>
  <a class="saltar" href="#contenido">Saltar al contenido</a>

  <header class="cabecera" data-cabecera>
    <nav class="contenedor cabecera__barra" aria-label="Principal">
      <a class="marca" href="#contenido" aria-label="${esc(MARCA.nombre)}, inicio">
        <img class="marca__isotipo" src="/img/marca/isotipo-256.webp" width="256" height="256" alt="">
        <span class="marca__nombre">${esc(MARCA.nombreLogo)}</span>
      </a>
      <ul class="cabecera__enlaces">
        ${enlacesMenu.map(([href, texto]) => `<li><a href="${href}">${esc(texto)}</a></li>`).join('\n        ')}
      </ul>
      ${boton({ texto: TEXTOS.acciones.solicitud, href: LINKS.solicitudIngreso, afuera: true, flecha: false, clase: 'boton--cabecera' })}
      <button type="button" class="cabecera__menu" aria-label="Abrir el menú" aria-expanded="false" aria-controls="menu-movil" data-menu-abrir>
        <span class="cabecera__icono cabecera__icono--abrir">${ICONOS.menu}</span>
        <span class="cabecera__icono cabecera__icono--cerrar">${ICONOS.cerrar}</span>
      </button>
    </nav>
  </header>

  <div class="menu" id="menu-movil" data-menu inert>
    <nav class="contenedor menu__enlaces" aria-label="Menú">
      ${enlacesMenu.map(([href, texto]) => `<a href="${href}">${esc(texto)}</a>`).join('\n      ')}
      ${boton({ texto: TEXTOS.acciones.solicitud, href: LINKS.solicitudIngreso, afuera: true })}
    </nav>
  </div>

  <section class="hero tono-gradiente" data-m-puntero data-m-entrada data-m-tiza="255,255,255|247,231,180|201,185,240">
    ${cielo({ estrellas: 60, semilla: 331, alto: 76 })}
    <div class="hero__marco">
      <div class="hero__tarjeta">
        ${luna({ clase: 'hero__luna m-entra-sube', paralaje: -0.1, prof: 16, tamanos: '(min-width: 768px) 7rem, 6rem' })}
        <div class="hero__texto" id="contenido" tabindex="-1">
          <a class="oferta" href="#programas" data-m-aparece>
            <span class="oferta__etiqueta">${esc(clasesAlMes)}</span>
            <span class="oferta__texto">${esc(clases.nombre)} ${esc(minusculaInicial(desdeClases))}</span>
          </a>
          <h1 class="hero__titulo" data-m-revelar style="--m-retraso: 200ms">${titulo([inicioDespedida, 'en las', [acento(`${finDespedida}.`)]])}</h1>
          <p class="hero__parrafo" data-m-aparece style="--m-retraso: 650ms">${esc(SEO.descripcion)}</p>
          <div class="hero__acciones" data-m-aparece style="--m-retraso: 800ms">
            ${boton({ texto: TEXTOS.acciones.solicitud, href: LINKS.solicitudIngreso, afuera: true, extra: ' data-m-iman' })}
            ${boton({ texto: TEXTOS.acciones.escribenos, href: CONTACTO.whatsapp, afuera: true, variante: 'tercero' })}
          </div>
        </div>
        <div class="pila">
          <div class="pila__carta pila__carta--atras m-capa" style="--m-prof: 8" data-m-paralaje="0.03">
            <figure class="pila__foto m-entra-escala" style="--m-retraso: 250ms">${foto('escaladora-muro-azul', { tamanos: '(min-width: 1024px) 16rem, (min-width: 768px) 24vw, 52vw', prioridad: true })}</figure>
          </div>
          <div class="pila__carta pila__carta--medio m-capa" style="--m-prof: 18" data-m-paralaje="0.06">
            <figure class="pila__foto m-entra-escala" style="--m-retraso: 450ms">${foto('escalador-desplome-gris', { tamanos: '(min-width: 1024px) 16rem, (min-width: 768px) 24vw, 52vw', prioridad: true })}</figure>
          </div>
          <div class="pila__carta pila__carta--frente m-capa" style="--m-prof: 30" data-m-paralaje="0.1">
            <figure class="pila__foto m-entra-escala" style="--m-retraso: 650ms">${foto('escaladora-desplome', { tamanos: '(min-width: 1024px) 16rem, (min-width: 768px) 24vw, 52vw', prioridad: true })}</figure>
          </div>
          ${presa({ forma: 'canto', color: 'var(--kuyen-luna)', clase: 'm-entra-escala', x: 86, y: -4, tam: 15, prof: 44, paralaje: 0.16, giro: 16, retraso: 1000, duracion: 9 })}
          ${presa({ forma: 'pinza', color: 'var(--kuyen-blanco)', clase: 'm-entra-escala', x: -8, y: 84, tam: 10, prof: 56, paralaje: 0.22, giro: -12, retraso: 1150, duracion: 7 })}
          ${presa({ forma: 'roma', color: 'var(--kuyen-lila)', clase: 'm-entra-escala', x: 88, y: 82, tam: 13, prof: 36, paralaje: 0.12, giro: -24, retraso: 1300, duracion: 11 })}
        </div>
      </div>
    </div>
    <div class="hero__gatos" aria-hidden="true">
      ${cordillera({ clase: 'hero__cordillera m-entra-sube', paralaje: 0, prof: 6, tamanos: '24vw' })}
    </div>
  </section>

  <main>
    <section class="seccion historia" id="historia">
      <div class="contenedor historia__grilla">
        <div class="historia__medio">
          <div class="historia__fotos m-foto" data-carrusel-fotos>
            <div class="historia__foto activa">${foto('pancita', { tamanos: '(min-width: 1024px) 34rem, 100vw', alt: `${contenido.PANCITA.nombre}, la gata de Kuyen: ${minusculaInicial(contenido.PANCITA.descripcion)}` })}</div>
            <div class="historia__foto">${foto('joven-escalando', { tamanos: '(min-width: 1024px) 34rem, 100vw' })}</div>
          </div>
          <div class="historia__insignia" data-m-aparece style="--m-retraso: 300ms">
            <span class="historia__numero">${cifra('anios').valor}</span>
            <span class="historia__rotulo">${esc(cifra('anios').etiqueta)}</span>
          </div>
        </div>
        <div class="historia__texto">
          ${antetitulo('Nuestra historia')}
          <h2 class="titulo-seccion" data-m-revelar>${titulo(['Küyen significa', [acento('luna.')]])}</h2>
          <p class="historia__parrafo" data-m-aparece>${esc(MARCA.significado)} ${esc(MARCA.definicion)} en ${esc(UBICACION.comuna)}, ${esc(UBICACION.region)}, abierto desde ${HISTORIA.desde}. ${esc(MARCA.lema)}.</p>
          <p class="historia__parrafo" data-m-aparece style="--m-retraso: 100ms">${esc(COMUNIDAD.resumen)} ${esc(COMUNIDAD.publico)}</p>
          <div class="historia__cifras">
            ${cifras(['google', 'rutas', 'desplome'].map(cifra))}
          </div>
          <div data-m-aparece>
            ${boton({ texto: TEXTOS.acciones.instagram, href: CONTACTO.instagram, afuera: true, variante: 'tercero' })}
          </div>
        </div>
      </div>
    </section>

    <section class="seccion programas-seccion" id="programas">
      <div class="contenedor">
        <div class="cabeza-seccion">
          <div>
            ${antetitulo('Programas')}
            <h2 class="titulo-seccion" data-m-revelar>${titulo([['Encuentra tu', acento('ruta.')]])}</h2>
          </div>
          <a class="enlace-flecha" href="${esc(CONTACTO.whatsapp)}"${externo} data-m-aparece><span>${esc(TEXTOS.acciones.whatsapp)}</span>${ICONOS.flecha}</a>
        </div>
        <div class="programas">
          ${programas
            .map(
              (p, n) => `<a class="programa" href="${esc(CONTACTO.whatsapp)}"${externo}>
            <div class="programa__medio m-foto"${retraso(n * 120)}>
              ${foto(p.foto, { tamanos: '(min-width: 1024px) 22rem, (min-width: 768px) 45vw, 100vw' })}
              <span class="programa__numero">N.º 0${n + 1}</span>
            </div>
            <div class="programa__cabeza" data-m-aparece${retraso(n * 120 + 150)}>
              <h3 class="programa__nombre">${esc(p.servicio.nombre)}</h3>
              <span class="programa__flecha">${ICONOS.diagonal}</span>
            </div>
            <p class="programa__texto" data-m-aparece${retraso(n * 120 + 220)}>${p.texto}</p>
            <span class="programa__linea" aria-hidden="true"></span>
          </a>`
            )
            .join('\n          ')}
        </div>
      </div>
    </section>

    <section class="seccion horarios" id="horarios">
      <div class="contenedor">
        <div class="cabeza-seccion">
          <div>
            ${antetitulo('Horarios')}
            <h2 class="titulo-seccion" data-m-revelar>${titulo([['Horario', acento('semanal')]])}</h2>
          </div>
          <a class="enlace-flecha" href="${esc(CONTACTO.whatsapp)}"${externo} data-m-aparece><span>Consultar por WhatsApp</span>${ICONOS.flecha}</a>
        </div>
        <div class="horario" data-pestanas data-m-aparece>
          <div class="dias" role="tablist" aria-label="Días de la semana">
            ${dias
              .map(
                (d, n) =>
                  `<button type="button" class="dia" role="tab" id="dia-${d.id}" aria-controls="panel-${d.id}" aria-selected="${n === 0}" tabindex="${n === 0 ? 0 : -1}">${esc(d.dia)}</button>`
              )
              .join('\n            ')}
          </div>
          ${dias
            .map(
              (d, n) => `<div class="panel" role="tabpanel" id="panel-${d.id}" aria-labelledby="dia-${d.id}"${n === 0 ? '' : ' hidden'}>
            <table class="tabla">
              <thead><tr><th scope="col">Hora</th><th scope="col">Tramo</th><th scope="col">Actividad</th><th scope="col">A cargo</th></tr></thead>
              <tbody>
                ${HORARIOS.tramos
                  .map(
                    (tramo, f) => `<tr style="--i: ${f}">
                  <td data-etiqueta="Hora">${pendiente(`horas del ${tramo.nombre.toLowerCase()} el ${d.dia.toLowerCase()} (pregunta 1)`)}</td>
                  <td data-etiqueta="Tramo"><span class="tramo">${esc(tramo.nombre)}</span></td>
                  <td data-etiqueta="Actividad">${pendiente(`actividad del ${tramo.nombre.toLowerCase()} el ${d.dia.toLowerCase()} (pregunta 1)`)}</td>
                  <td data-etiqueta="A cargo">${pendiente(`quién está a cargo el ${d.dia.toLowerCase()} (pregunta 1)`)}</td>
                </tr>`
                  )
                  .join('\n                ')}
              </tbody>
            </table>
          </div>`
            )
            .join('\n          ')}
          <p class="horario__nota">${HORARIOS.tramos.map((t) => `${esc(t.nombre)}: ${esc(minusculaInicial(t.descripcion))}`).join(' ')} Se paga al ingresar.</p>
        </div>
      </div>
    </section>

    <section class="seccion testimonios-seccion" id="comunidad">
      <div class="contenedor">
        <div class="cabeza-seccion cabeza-seccion--sola">
          <div>
            ${antetitulo('Comunidad')}
            <h2 class="titulo-seccion" data-m-revelar>${titulo([['Lo que dice', acento('la comunidad.')]])}</h2>
          </div>
        </div>
        <div class="testimonios">
          <div class="testimonios__izquierda">
            ${cifras(['rutas', 'desplome', 'google', 'anios'].map(cifra))}
            <div class="acento-tarjeta" data-m-aparece>
              <p class="acento-tarjeta__etiqueta">Antes de venir</p>
              <h3 class="acento-tarjeta__titulo">Completa tu solicitud de ingreso y nos vemos en el muro.</h3>
              ${boton({ texto: TEXTOS.acciones.solicitud, href: LINKS.solicitudIngreso, afuera: true, variante: 'tinta' })}
            </div>
          </div>
          <div class="carrusel" data-carrusel3d data-m-aparece style="--m-retraso: 150ms">
            <div class="carrusel__fondo" aria-hidden="true">${foto('joven-escalando', { tamanos: '(min-width: 1024px) 34rem, 100vw', alt: '' })}</div>
            <div class="carrusel__escena">
              ${TESTIMONIOS.map(
                (t, n) => `<article class="resena" data-tarjeta="${n}" aria-label="Reseña ${n + 1} de ${TESTIMONIOS.length}">
                <span class="resena__icono">${ICONOS.estrella}</span>
                <p class="resena__cita">${pendiente('texto de la reseña y permiso de la persona para publicarla con su nombre')}</p>
                <div class="resena__autor">
                  <img class="resena__avatar" src="/img/marca/isotipo-256.webp" width="256" height="256" alt="">
                  <div>
                    <p class="resena__nombre">${pendiente('nombre de quien escribe la reseña')}</p>
                    <p class="resena__detalle">${pendiente('desde cuándo escala en Kuyen o qué hace ahí')}</p>
                  </div>
                </div>
              </article>`
              ).join('\n              ')}
            </div>
            <div class="carrusel__controles">
              <button type="button" class="carrusel__flecha" aria-label="Reseña anterior" data-carrusel-anterior>${ICONOS.flechaAtras}</button>
              <div class="carrusel__puntos">
                ${TESTIMONIOS.map((t, n) => `<button type="button" class="carrusel__punto" aria-label="Ver reseña ${n + 1}" data-punto="${n}"></button>`).join('')}
              </div>
              <button type="button" class="carrusel__flecha" aria-label="Reseña siguiente" data-carrusel-siguiente>${ICONOS.flecha}</button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="llamado">
      <div class="llamado__tarjeta">
        <div class="llamado__fondo m-foto" aria-hidden="true">${foto('comunidad-evento', { tamanos: '100vw', alt: '' })}</div>
        <div class="llamado__texto">
          ${antetitulo('Comunidad y eventos')}
          <h2 class="titulo-seccion" data-m-revelar>${titulo(['Competencias, encuentros', 'y talleres.'])}</h2>
          <p class="llamado__parrafo" data-m-aparece>${esc(COMUNIDAD.anuncios)}${proximo ? ` Próximo: ${esc(proximo.nombre)}, ${esc(proximo.fechaTexto)}.` : ''}</p>
          <div data-m-aparece style="--m-retraso: 150ms">
            ${boton({ texto: TEXTOS.acciones.instagram, href: CONTACTO.instagram, afuera: true })}
          </div>
        </div>
      </div>
    </section>

    <section class="seccion" id="instagram">
      <div class="contenedor">
        <div class="cabeza-seccion">
          <div>
            ${antetitulo('En Instagram')}
            <h2 class="titulo-seccion" data-m-revelar>${titulo([['Lo último que', acento('publicamos.')]])}</h2>
          </div>
          <a class="enlace-flecha" href="${esc(INSTAGRAM.perfil)}"${externo} data-m-aparece><span>${esc(CONTACTO.instagramUsuario)}</span>${ICONOS.flecha}</a>
        </div>
        <div class="programas">
          ${INSTAGRAM.publicaciones
            .map(
              (pub, n) => `<div class="programa" data-instagram-tarjeta>
            <div class="programa__medio m-foto"${retraso(n * 120)} data-instagram-medio>
              ${foto(pub.foto, { tamanos: '(min-width: 1024px) 22rem, (min-width: 768px) 45vw, 100vw' })}
              <span class="programa__numero">${esc(pub.tipo)}</span>
            </div>
            <div class="programa__cabeza" data-m-aparece${retraso(n * 120 + 150)}>
              <h3 class="programa__nombre">${esc(pub.titulo)}</h3>
              <span class="programa__flecha">${ICONOS.instagram}</span>
            </div>
            <p class="programa__texto" data-m-aparece${retraso(n * 120 + 220)}>${esc(pub.detalle)}</p>
            <div class="programa__acciones" data-m-aparece${retraso(n * 120 + 260)}>
              <button type="button" class="boton boton--primario boton--chico" data-instagram="${esc(pub.ruta)}" data-titulo="${esc(`Publicación de ${MARCA.nombre} en Instagram: ${pub.titulo}`)}"><span>${esc(TEXTOS.acciones.verPublicacion)}</span>${ICONOS.instagram}</button>
              <a class="enlace" href="${esc(`${INSTAGRAM.base}${pub.ruta}/`)}"${externo}>${esc(TEXTOS.acciones.abrirInstagram)}</a>
            </div>
            <span class="programa__linea" aria-hidden="true"></span>
          </div>`
            )
            .join('\n          ')}
        </div>
        <p class="seccion__nota" data-m-aparece>${esc(TEXTOS.instagram)}</p>
      </div>
    </section>

    <section class="seccion faq-seccion" id="preguntas">
      <div class="contenedor">
        <div class="faq__cabeza">
          ${antetitulo('Preguntas')}
          <h2 class="titulo-seccion" data-m-revelar>${titulo([['Antes de tu', acento('primera visita')]])}</h2>
        </div>
        <div class="faq">
          ${preguntas
            .map(
              (p, n) => `<div class="faq__item" data-m-aparece${retraso(n * 60)}>
            <h3 class="faq__pregunta">
              <button type="button" aria-expanded="false" aria-controls="respuesta-${n + 1}" data-faq>
                <span>${esc(p.pregunta)}</span>
                <span class="faq__chevron">${ICONOS.chevron}</span>
              </button>
            </h3>
            <div class="faq__respuesta" id="respuesta-${n + 1}" inert>
              <div class="faq__interior"><div class="faq__texto">${p.respuesta}</div></div>
            </div>
          </div>`
            )
            .join('\n          ')}
        </div>
      </div>
    </section>
  </main>

  <footer class="pie" id="contacto">
    <div class="contenedor">
      <div class="pie__grilla">
        <div class="pie__marca" data-m-aparece>
          <a class="marca" href="#contenido" aria-label="${esc(MARCA.nombre)}, inicio">
            <img class="marca__isotipo" src="/img/marca/isotipo-256.webp" width="256" height="256" alt="">
            <span class="marca__nombre">${esc(MARCA.nombreLogo)}</span>
          </a>
          <p class="pie__bio">${esc(MARCA.bio)}</p>
          <div class="pie__iconos">
            <a href="${esc(CONTACTO.instagram)}"${externo} aria-label="Instagram">${ICONOS.instagram}</a>
            <a href="${esc(CONTACTO.whatsapp)}"${externo} aria-label="WhatsApp">${ICONOS.telefono}</a>
            <a href="${esc(LINKS.linktree)}"${externo} aria-label="Linktree">${ICONOS.enlace}</a>
          </div>
        </div>
        <nav class="pie__columna" aria-label="Navegación" data-m-aparece style="--m-retraso: 100ms">
          <h3 class="pie__titulo">Navegación</h3>
          <ul class="pie__lista">
            <li><a href="#historia">Nuestra historia</a></li>
            <li><a href="#programas">Programas</a></li>
            <li><a href="#horarios">Horarios</a></li>
            <li><a href="#comunidad">Comunidad</a></li>
            <li><a href="#instagram">En Instagram</a></li>
            <li><a href="#preguntas">Preguntas</a></li>
          </ul>
        </nav>
        <div class="pie__columna" data-m-aparece style="--m-retraso: 200ms">
          <h3 class="pie__titulo">Contacto</h3>
          <ul class="pie__lista pie__contacto">
            <li>${ICONOS.pin}<span>${esc(UBICACION.calle)}, ${esc(UBICACION.comuna)}, ${esc(UBICACION.region)}</span></li>
            <li>${ICONOS.telefono}<a href="${esc(CONTACTO.whatsapp)}"${externo}>WhatsApp ${esc(CONTACTO.telefono)}</a></li>
            <li>${ICONOS.correo}<span>Correo: ${pendiente('correo de contacto (pregunta 6)')}</span></li>
          </ul>
        </div>
        <div class="pie__columna" data-m-aparece style="--m-retraso: 300ms">
          <h3 class="pie__titulo">Cómo llegar</h3>
          <div class="mapa-mini">
            <div class="mapa-mini__medio">
              ${luna({ clase: 'mapa-mini__luna', paralaje: -0.04, tamanos: '4rem' })}
              <p class="mapa-mini__nota">Plus code ${esc(UBICACION.plusCode)}. ${esc(TEXTOS.mapa)}</p>
              <button type="button" class="boton boton--primario boton--chico" data-mapa="${esc(UBICACION.mapaEmbebido)}" data-titulo="${esc(`Mapa de ${MARCA.nombre} en ${UBICACION.calle}, ${UBICACION.comuna}`)}"><span>${esc(TEXTOS.acciones.verMapa)}</span>${ICONOS.pin}</button>
            </div>
          </div>
        </div>
      </div>
      <div class="pie__legal">
        <p>© 2026 ${esc(MARCA.nombre)}.</p>
        <p><a href="${esc(UBICACION.maps)}"${externo}>${esc(TEXTOS.acciones.abrirMaps)}</a></p>
      </div>
    </div>
  </footer>

  <script>
${compartido('movimiento.js')};
${compartido('instagram.js')};
${leer('script.js')};
  </script>
</body>
</html>
`
}
