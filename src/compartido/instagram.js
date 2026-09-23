(function () {
  'use strict'

  /* Publicaciones de Instagram: los iframes ya vienen en la página y cargan
     solos, sin que haya que hacer clic (22-09-2026). Van con loading="lazy", así
     que el navegador los pide recién cuando se acercan a la pantalla.

     Lo único que queda para el navegador es el alto: Instagram lo avisa con un
     mensaje MEASURE, y hasta que llega manda el alto mínimo del CSS. */
  var ORIGEN = 'https://www.instagram.com'
  var marcos = [].slice.call(document.querySelectorAll('iframe[data-instagram-marco]'))
  if (marcos.length === 0) return

  window.addEventListener('message', function (e) {
    if (e.origin !== ORIGEN) return
    var datos = e.data
    if (typeof datos === 'string') {
      try { datos = JSON.parse(datos) } catch (error) { return }
    }
    if (!datos || datos.type !== 'MEASURE' || !datos.details || !datos.details.height) return
    marcos.forEach(function (marco) {
      if (marco.contentWindow === e.source) marco.style.height = datos.details.height + 'px'
    })
  })
})()
