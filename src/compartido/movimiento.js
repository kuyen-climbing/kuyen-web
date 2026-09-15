(function () {
  'use strict'

  var calmo = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  /* Paralaje: cada capa se desplaza según qué tan lejos está su contenedor del
     centro de la pantalla. data-m-paralaje es el factor: negativo va más lento
     que la página, como un fondo, y positivo, más rápido. Lo que empieza en la
     primera pantalla parte en su lugar y se desplaza solo con el scroll. */
  var capas = [].slice.call(document.querySelectorAll('[data-m-paralaje]'))
  function paralaje() {
    var alto = window.innerHeight
    capas.forEach(function (el) {
      var caja = el.parentElement.getBoundingClientRect()
      if (caja.bottom < -200 || caja.top > alto + 200) return
      var distancia = caja.top + window.scrollY < alto ? -window.scrollY : caja.top + caja.height / 2 - alto / 2
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

  /* Entrada del hero: .m-listo cuando la foto principal está lista para
     pintarse, o a los 1,2 s si tarda. */
  document.querySelectorAll('[data-m-entrada]').forEach(function (zona) {
    var listo = function () {
      requestAnimationFrame(function () { requestAnimationFrame(function () { zona.classList.add('m-listo') }) })
    }
    if (calmo) { zona.classList.add('m-listo'); return }
    var fotos = [].slice.call(zona.querySelectorAll('img[fetchpriority="high"]'))
    var decodificadas = Promise.all(fotos.map(function (f) { return f.decode ? f.decode().catch(function () {}) : null }))
    Promise.race([decodificadas, new Promise(function (r) { setTimeout(r, 1200) })]).then(listo)
  })

  var conMouse = window.matchMedia('(hover: hover)').matches

  /* Profundidad con el puntero: [data-m-puntero] publica --m-mx y --m-my (de -1
     a 1) con un seguimiento suave; las .m-capa de adentro se mueven según su
     --m-prof. */
  if (!calmo && conMouse) {
    document.querySelectorAll('[data-m-puntero]').forEach(function (zona) {
      var objetivo = { x: 0, y: 0 }
      var actual = { x: 0, y: 0 }
      var andando = false
      function paso() {
        actual.x += (objetivo.x - actual.x) * 0.07
        actual.y += (objetivo.y - actual.y) * 0.07
        zona.style.setProperty('--m-mx', actual.x.toFixed(4))
        zona.style.setProperty('--m-my', actual.y.toFixed(4))
        if (Math.abs(objetivo.x - actual.x) > 0.001 || Math.abs(objetivo.y - actual.y) > 0.001) requestAnimationFrame(paso)
        else andando = false
      }
      function mover() { if (!andando) { andando = true; requestAnimationFrame(paso) } }
      zona.addEventListener('pointermove', function (e) {
        var caja = zona.getBoundingClientRect()
        objetivo.x = ((e.clientX - caja.left) / caja.width - 0.5) * 2
        objetivo.y = ((e.clientY - caja.top) / caja.height - 0.5) * 2
        mover()
      })
      zona.addEventListener('pointerleave', function () { objetivo.x = 0; objetivo.y = 0; mover() })
    })

    /* Imán: el botón se corre un poco hacia el puntero y vuelve al salir, con
       el mismo seguimiento suave. */
    document.querySelectorAll('[data-m-iman]').forEach(function (el) {
      el.classList.add('m-iman')
      var objetivo = { x: 0, y: 0 }
      var actual = { x: 0, y: 0 }
      var andando = false
      function paso() {
        actual.x += (objetivo.x - actual.x) * 0.18
        actual.y += (objetivo.y - actual.y) * 0.18
        el.style.setProperty('--m-ix', actual.x.toFixed(2) + 'px')
        el.style.setProperty('--m-iy', actual.y.toFixed(2) + 'px')
        if (Math.abs(objetivo.x - actual.x) > 0.05 || Math.abs(objetivo.y - actual.y) > 0.05) requestAnimationFrame(paso)
        else andando = false
      }
      function mover() { if (!andando) { andando = true; requestAnimationFrame(paso) } }
      el.addEventListener('pointermove', function (e) {
        var caja = el.getBoundingClientRect()
        objetivo.x = (e.clientX - caja.left - caja.width / 2) * 0.25
        objetivo.y = (e.clientY - caja.top - caja.height / 2) * 0.35
        mover()
      })
      el.addEventListener('pointerleave', function () { objetivo.x = 0; objetivo.y = 0; mover() })
    })
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
