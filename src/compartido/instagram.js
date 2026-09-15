(function () {
  'use strict'

  /* Publicaciones de Instagram: el iframe se crea recién al hacer clic, así que
     hasta entonces la página no le pide nada a Instagram. Cada tarjeta lleva
     data-instagram-tarjeta y, adentro, el recuadro con data-instagram-medio.
     Instagram avisa el alto de la publicación con un mensaje MEASURE; si ese
     mensaje no llega, queda el alto mínimo del CSS. */
  var ORIGEN = 'https://www.instagram.com'
  var marcos = []

  window.addEventListener('message', function (e) {
    if (e.origin !== ORIGEN || marcos.length === 0) return
    var datos = e.data
    if (typeof datos === 'string') {
      try { datos = JSON.parse(datos) } catch (error) { return }
    }
    if (!datos || datos.type !== 'MEASURE' || !datos.details || !datos.details.height) return
    marcos.forEach(function (marco) {
      if (marco.contentWindow === e.source) marco.style.height = datos.details.height + 'px'
    })
  })

  document.querySelectorAll('[data-instagram]').forEach(function (boton) {
    boton.addEventListener('click', function () {
      var tarjeta = boton.closest('[data-instagram-tarjeta]')
      var medio = tarjeta && tarjeta.querySelector('[data-instagram-medio]')
      if (!medio) return
      var marco = document.createElement('iframe')
      marco.className = 'instagram__marco'
      marco.src = ORIGEN + '/' + boton.getAttribute('data-instagram') + '/embed/captioned/'
      marco.title = boton.getAttribute('data-titulo')
      marco.allowFullscreen = true
      medio.classList.add('con-publicacion')
      medio.replaceChildren(marco)
      marcos.push(marco)
      marco.focus()
    })
  })
})()
