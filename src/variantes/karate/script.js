(function () {
  'use strict'

  var calmo = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  /* Menú de móvil y tablet: a pantalla completa bajo la navegación. Se cierra
     con un enlace o con Escape, y queda inerte mientras está cerrado. */
  var menu = document.querySelector('[data-menu]')
  var abrir = document.querySelector('[data-menu-abrir]')
  if (menu && abrir) {
    var poner = function (abierto) {
      menu.classList.toggle('abierto', abierto)
      menu.inert = !abierto
      abrir.setAttribute('aria-expanded', String(abierto))
      abrir.setAttribute('aria-label', abierto ? 'Cerrar el menú' : 'Abrir el menú')
      document.body.style.overflow = abierto ? 'hidden' : ''
    }
    abrir.addEventListener('click', function () {
      poner(!menu.classList.contains('abierto'))
    })
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) poner(false)
    })
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('abierto')) {
        poner(false)
        abrir.focus()
      }
    })
    window.matchMedia('(min-width: 1024px)').addEventListener('change', function (m) {
      if (m.matches) poner(false)
    })
  }

  /* Nuestra historia: las fotos se turnan cada 2,6 s mientras están en pantalla. */
  var fotos = document.querySelector('[data-carrusel-fotos]')
  if (fotos && !calmo && 'IntersectionObserver' in window) {
    var cuadros = [].slice.call(fotos.children)
    var actual = 0
    var enPantalla = false
    new IntersectionObserver(function (entradas) {
      enPantalla = entradas[0].isIntersecting
    }).observe(fotos)
    setInterval(function () {
      if (!enPantalla || document.hidden) return
      cuadros[actual].classList.remove('activa')
      actual = (actual + 1) % cuadros.length
      cuadros[actual].classList.add('activa')
    }, 2600)
  }

  /* Horarios: una pestaña por día. Se cambia con clic o con las flechas, Inicio
     y Fin; las filas del día elegido entran escalonadas. */
  document.querySelectorAll('[data-pestanas]').forEach(function (grupo) {
    var pestanas = [].slice.call(grupo.querySelectorAll('[role="tab"]'))
    var elegir = function (pestana, enfocar) {
      pestanas.forEach(function (p) {
        var activa = p === pestana
        var panel = document.getElementById(p.getAttribute('aria-controls'))
        p.setAttribute('aria-selected', String(activa))
        p.tabIndex = activa ? 0 : -1
        panel.hidden = !activa
        if (activa && !calmo) {
          panel.classList.remove('entrando')
          void panel.offsetWidth
          panel.classList.add('entrando')
        }
      })
      if (enfocar) {
        pestana.focus()
        pestana.scrollIntoView({ block: 'nearest', inline: 'nearest' })
      }
    }
    pestanas.forEach(function (p, i) {
      p.addEventListener('click', function () { elegir(p, false) })
      p.addEventListener('keydown', function (e) {
        var destino = null
        if (e.key === 'ArrowRight') destino = pestanas[(i + 1) % pestanas.length]
        else if (e.key === 'ArrowLeft') destino = pestanas[(i - 1 + pestanas.length) % pestanas.length]
        else if (e.key === 'Home') destino = pestanas[0]
        else if (e.key === 'End') destino = pestanas[pestanas.length - 1]
        if (destino) {
          e.preventDefault()
          elegir(destino, true)
        }
      })
    })
  })

  /* Carrusel 3D de reseñas: la tarjeta activa va al frente y las demás se
     ordenan a los lados. Se cambia con las flechas, los puntos o un clic en una
     tarjeta; las de los lados quedan ocultas para lectores de pantalla. */
  document.querySelectorAll('[data-carrusel3d]').forEach(function (carrusel) {
    var tarjetas = [].slice.call(carrusel.querySelectorAll('[data-tarjeta]'))
    var puntos = [].slice.call(carrusel.querySelectorAll('[data-punto]'))
    var total = tarjetas.length
    var activa = 0
    var ir = function (indice) {
      activa = (indice + total) % total
      tarjetas.forEach(function (t, k) {
        var d = k - activa
        if (d > total / 2) d -= total
        if (d < -total / 2) d += total
        t.style.setProperty('--d', d)
        t.style.setProperty('--a', Math.abs(d))
        t.setAttribute('aria-hidden', String(d !== 0))
      })
      puntos.forEach(function (p, k) {
        p.setAttribute('aria-current', String(k === activa))
      })
    }
    tarjetas.forEach(function (t, k) {
      t.addEventListener('click', function () { ir(k) })
    })
    puntos.forEach(function (p, k) {
      p.addEventListener('click', function () { ir(k) })
    })
    var anterior = carrusel.querySelector('[data-carrusel-anterior]')
    var siguiente = carrusel.querySelector('[data-carrusel-siguiente]')
    if (anterior) anterior.addEventListener('click', function () { ir(activa - 1) })
    if (siguiente) siguiente.addEventListener('click', function () { ir(activa + 1) })
    ir(0)
  })

  /* Preguntas frecuentes: cada pregunta abre y cierra su respuesta, que queda
     inerte mientras está cerrada. */
  document.querySelectorAll('[data-faq]').forEach(function (boton) {
    var item = boton.closest('.faq__item')
    var respuesta = document.getElementById(boton.getAttribute('aria-controls'))
    boton.addEventListener('click', function () {
      var abierta = boton.getAttribute('aria-expanded') !== 'true'
      boton.setAttribute('aria-expanded', String(abierta))
      item.classList.toggle('abierta', abierta)
      respuesta.inert = !abierta
    })
  })

})()
