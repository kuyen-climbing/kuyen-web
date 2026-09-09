# Kuyen Climbing: sitio web

Sitio de **Kuyen Climbing**, centro de escalada en boulder en Los Patagones 375, Padre Las
Casas, La Araucanía. Repo de la organización `kuyen-climbing`, servido por GitHub Pages.

Usa el flujo de sitios estáticos documentado en
`C:\Proyectos\INCBA\docs\Flujo-Sitios-Web-GitHub-Pages.md`: generador propio, Tailwind
compilado localmente, verificación funcional y CI que impide publicar HTML desincronizado.
La plantilla y las visuales son propias de este proyecto.

## Estado (09-09-2026): etapa de elección visual

Todavía no hay sitio de contenido. Lo que hay es una **maqueta para elegir dirección
visual**: los cuatro templates candidatos reproducidos tal como los publican sus autores, y
un selector para recorrerlos.

| Ruta | Qué es |
|---|---|
| `/` | Selector: las cuatro tarjetas, más los datos del centro ya cargados |
| `/t/hive` | Template [Hive](https://21st.dev/@shadcnblockscom/templates/hive) |
| `/t/karate` | Template [Karate](https://21st.dev/@dhileepkumargm/templates/karate) |
| `/t/hirael` | Template [Hirael Agency Landing](https://21st.dev/@mohammadshehadeh/templates/hirael-agency-landing) |
| `/t/nex` | Template [NexStudio](https://21st.dev/@tailgrids/templates/tailgrids-nexstudio) |

Al pie de cada template va el **ToggleTheme**, con el mismo patrón que el de Pagos
Pendientes (`APP-PAGOS-PENDIENTES-frontend/src/components/theme-toggle.tsx`): una píldora
con el pulsador en la posición del tema activo, que cicla al siguiente y recuerda la
elección en `localStorage`. Acá cada tema es una página completa, así que ciclar navega.

### Los templates son de terceros

Las cuatro capturas son markup y assets de templates comerciales de 21st.dev, guardados
para decidir el aire del sitio con el cliente. **No son el sitio definitivo**: elegida la
dirección, se reescribe el markup y se reemplazan los assets por los de Kuyen. Por eso las
páginas de tema se sirven con `noindex, nofollow` y quedan fuera del `sitemap.xml`.

## Cómo se edita

**Los `.html` de la raíz y `css/styles.css` son generados. No los edites.** Se editan las
fuentes de `src/` y se regenera:

```bash
npm install          # una vez: instala Tailwind
npm run build        # -> css/styles.css + los .html de la raíz + sitemap + robots
```

| Qué querés cambiar | Dónde |
|---|---|
| Texto del selector | `src/sections/selector.html` |
| Qué páginas existen, título, descripción | `PAGES` en `src/site.config.mjs` |
| Qué templates entran, su orden, nombre y resumen | `TEMAS` en `src/site.config.mjs` |
| Dirección, teléfono, Instagram, coordenadas | `NEGOCIO` en `src/site.config.mjs` |
| Header, pie y `<head>` | `src/partials/` |
| El ToggleTheme (aspecto y comportamiento) | `src/partials/toggle-tema.html` |
| Colores y tipografía del sitio propio | `tailwind.config.cjs` y `src/css/tailwind.css` |
| Menú móvil y selector | `js/main.js` |

Para verlo local con las URLs resueltas como las resuelve GitHub Pages:

```bash
node tools/build.mjs --out=dist
node tools/serve.mjs dist --port=8100
node tools/verify.mjs --port=8100
node --experimental-websocket tools/pruebas-ui.mjs http://localhost:8100
```

`pruebas-ui.mjs` comprueba el selector y, en cada template, que cargue contenido, que el
ToggleTheme esté presente y visible, que cicle al siguiente y que guarde la elección. Deja
capturas de pantalla en `dist-pruebas/`.

### Agregar o volver a capturar un template

```bash
node --experimental-websocket tools/capturar-tema.mjs <id> <url> --render
```

Baja el HTML, sus hojas de estilo, tipografías e imágenes, los guarda en
`temas/<id>/assets/` y reescribe las referencias a rutas locales. El markup queda en
`src/temas/<id>/pagina.html`. Después se agrega la entrada en `TEMAS` y se regenera.

`--render` usa el Chrome instalado en modo headless para leer el DOM ya armado. Hace falta
siempre que el template monte su contenido con JavaScript, que es el caso de los cuatro:
sin eso, Framer deja secciones invisibles y React devuelve un cascarón vacío.

### Si el build falla

El generador valida antes de escribir y no deja nada a medias: título o descripción
demasiado largos, metadatos repetidos entre páginas, más o menos de un `<h1>` por página,
tokens sin resolver, rutas de asset relativas, enlaces a un ancla que no existe, o contenido
por debajo del piso de palabras (`MINIMO_PALABRAS_DEFAULT`). Las páginas de template no
pasan por estas validaciones: son markup de terceros.

## Publicación

Push a `main` publica desde la raíz del repo. El workflow `verificar.yml` corre en cada push
y en cada PR: regenera CSS y HTML y los compara contra lo comiteado, después levanta el
servidor local y corre la verificación funcional.

### Preview mientras no hay dominio

La URL genérica de este repo no sirve para previsualizar: con `CNAME` redirige al dominio, y
sin él las rutas absolutas se rompen bajo el subpath. El preview vive en el repo espejo
`kuyen-climbing/kuyen-climbing.github.io`, que se sirve en la raíz:

```bash
npm run preview:publicar
```

Regenera la variante `preview` (sin CNAME y con `noindex`) y reemplaza el contenido del
espejo. Queda en https://kuyen-climbing.github.io/. El espejo es solo salida: no lleva `src/`
ni `tools/`.

## Pendientes

- **Dominio**: `kuyenclimbing.cl` está puesto en `SITES.cl` y en `CNAME` como valor
  provisorio. No está comprado ni confirmado con Kuyen. Mientras tanto se puede publicar la
  variante `preview` (`npm run preview`), que sale sin CNAME y con noindex para el repo
  `kuyen-climbing.github.io`.
- **DNS**: cuando exista el dominio, registros A a 185.199.108/109/110/111.153. Si el DNS
  queda en Cloudflare, tiene que estar "DNS only" (nube gris), nunca proxiado, o GitHub deja
  de renovar el certificado HTTPS.
- **Elegir template**: es la decisión que desbloquea todo lo demás.
- **Marca**: no hay archivos de logo. El isotipo `img/marca-luna.svg` es un placeholder
  propio (luna creciente, por "küyen", luna en mapudungun) y la paleta `noche`/`luna`/`presa`
  de `tailwind.config.cjs` es una propuesta, no la paleta oficial.
- **Falta `og:image`**: hace falta una foto real del muro, de 1200x630.
- **Contenido real**: fotos del muro, textos propios y datos por confirmar (abajo).
- **Datos por confirmar con Kuyen**, tomados de publicaciones públicas de distinta fecha:
  horario semanal (Google dice que cierra a las 22:00; una revista de 2023 decía lunes a
  viernes de 14:00 a 22:00), pase diario ($3.500 según esa misma revista), horario bajo de
  10:00 a 16:00 a $2.000, y el plan de 8 clases por $45.000. Nada de esto se escribe en el
  sitio hasta que Kuyen lo confirme.
- **Correo**: Kuyen no publica uno. Hoy el contacto va por WhatsApp e Instagram.
- **Peso del repo**: las capturas de los templates ocupan cerca de 35 MB en `temas/`. Se
  borran las que no se elijan una vez tomada la decisión.

### Lo que las capturas no reproducen

Las capturas no reusan el JavaScript de cada template, así que queda afuera lo que ese
código dibuja en vivo:

- **Hive**: dos escenas 3D (el hero y el pie). Se saca el cartel de error que dejan, con la
  regla `limpiar` de ese tema en `TEMAS`; el espacio queda vacío.
- **Karate**: el carrusel del equipo, en la sección "Built different", queda en blanco.
- Los carruseles y acordeones que se ven en las demás páginas quedan en su estado inicial:
  se ven, pero no se mueven.

## Datos del negocio

Verificados el 09-09-2026 en la ficha de Google Maps y el perfil de Instagram del centro:

- Los Patagones 375, Padre Las Casas, La Araucanía
- +56 9 3502 8838
- [@kuyen.climbing](https://www.instagram.com/kuyen.climbing/) · 2.928 seguidores
- [Ficha de Google](https://maps.app.goo.gl/v9F89L5peqFyxcJc9): 5,0 con 14 reseñas
- Muro de boulder con desplomes continuos hasta 25° y moonboard, y clases guiadas
