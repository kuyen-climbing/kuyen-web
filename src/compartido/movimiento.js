(function () {
  'use strict'

  var calmo = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  /* Paralaje: cada capa se desplaza según qué tan lejos está su contenedor del
     centro de la pantalla. data-m-paralaje es el factor (negativo sube). */
  var capas = [].slice.call(document.querySelectorAll('[data-m-paralaje]'))
  function paralaje() {
    var alto = window.innerHeight
    capas.forEach(function (el) {
      var caja = el.parentElement.getBoundingClientRect()
      if (caja.bottom < -200 || caja.top > alto + 200) return
      var distancia = caja.top + caja.height / 2 - alto / 2
      el.style.setProperty('--m-y', (distancia * parseFloat(el.getAttribute('data-m-paralaje'))).toFixed(1) + 'px')
    })
  }
  if (!calmo && capas.length) {
    var pedido = false
    window.addEventListener('scroll', function () {
      if (pedido) return
      pedido = true
      requestAnimationFrame(function () { pedido = false; paralaje() })
    }, { passive: true })
    window.addEventListener('resize', paralaje)
    paralaje()
  }

  /* Cifras que suben desde cero. */
  function escribir(n, valor) {
    var decimales = Number(n.getAttribute('data-m-decimales') || 0)
    n.textContent = valor.toFixed(decimales).replace('.', ',') + (n.getAttribute('data-m-sufijo') || '')
  }
  function contar(grupo) {
    grupo.querySelectorAll('[data-m-contar]').forEach(function (n) {
      var fin = parseFloat(n.getAttribute('data-m-contar'))
      var inicio = performance.now()
      requestAnimationFrame(function paso(t) {
        var p = Math.min(1, (t - inicio) / 1700)
        escribir(n, fin * (1 - Math.pow(1 - p, 3)))
        if (p < 1) requestAnimationFrame(paso)
      })
    })
  }

  /* Títulos, textos, fotos y cifras entran una sola vez, al aparecer. */
  var elementos = document.querySelectorAll('[data-m-revelar], [data-m-aparece], .m-foto, [data-m-cifras]')
  if (calmo || !('IntersectionObserver' in window)) {
    elementos.forEach(function (el) { el.classList.add('m-visible') })
  } else {
    document.querySelectorAll('[data-m-cifras] [data-m-contar]').forEach(function (n) { escribir(n, 0) })
    var observador = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        if (!entrada.isIntersecting) return
        var el = entrada.target
        el.classList.add('m-visible')
        if (el.hasAttribute('data-m-cifras')) contar(el)
        observador.unobserve(el)
      })
    }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' })
    elementos.forEach(function (el) { observador.observe(el) })
  }

  /* Rastro de tiza: polvo de magnesio que sigue al puntero, cae y se apaga.
     data-m-tiza lista los colores en r,g,b separados por |. */
  if (!calmo) {
    document.querySelectorAll('[data-m-tiza]').forEach(function (zona) {
      var lienzo = document.createElement('canvas')
      lienzo.className = 'm-tiza'
      lienzo.setAttribute('aria-hidden', 'true')
      zona.appendChild(lienzo)
      var ctx = lienzo.getContext('2d')
      var dpr = Math.min(window.devicePixelRatio || 1, 2)
      var colores = zona.getAttribute('data-m-tiza').split('|')
      var particulas = []
      var andando = false

      function medir() {
        lienzo.width = zona.clientWidth * dpr
        lienzo.height = zona.clientHeight * dpr
      }
      medir()
      window.addEventListener('resize', medir)

      function cuadro() {
        ctx.clearRect(0, 0, lienzo.width, lienzo.height)
        for (var i = particulas.length - 1; i >= 0; i--) {
          var p = particulas[i]
          p.x += p.vx
          p.y += p.vy
          p.vy += 0.012
          p.a -= 0.011
          if (p.a <= 0) { particulas.splice(i, 1); continue }
          ctx.fillStyle = 'rgba(' + p.c + ',' + p.a.toFixed(3) + ')'
          ctx.beginPath()
          ctx.arc(p.x * dpr, p.y * dpr, p.r * dpr, 0, Math.PI * 2)
          ctx.fill()
        }
        if (particulas.length) requestAnimationFrame(cuadro)
        else andando = false
      }

      zona.addEventListener('pointermove', function (e) {
        var caja = zona.getBoundingClientRect()
        var x = e.clientX - caja.left
        var y = e.clientY - caja.top
        for (var i = 0; i < 5; i++) {
          particulas.push({
            x: x + (Math.random() - 0.5) * 12,
            y: y + (Math.random() - 0.5) * 12,
            vx: (Math.random() - 0.5) * 0.8,
            vy: Math.random() * 0.8 + 0.1,
            r: Math.random() * 2.2 + 0.6,
            a: 0.7 + Math.random() * 0.3,
            c: colores[Math.floor(Math.random() * colores.length)],
          })
        }
        if (particulas.length > 700) particulas.splice(0, particulas.length - 700)
        if (!andando) { andando = true; requestAnimationFrame(cuadro) }
      })
    })
  }
})()
