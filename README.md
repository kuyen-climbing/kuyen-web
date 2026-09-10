# Kuyen Climbing: sitio web

Sitio de **Kuyen Climbing**, centro de escalada en boulder en Los Patagones 375, Padre Las
Casas, La Araucanía. Repo de la organización `kuyen-climbing`, servido por GitHub Pages.

Sigue el flujo de sitios estáticos documentado en
`C:\Proyectos\INCBA\docs\Flujo-Sitios-Web-GitHub-Pages.md`: generador propio, verificación
funcional y CI que impide publicar HTML desincronizado.

## Estado (09-09-2026): los cuatro templates, tal cual

Todavía no hay contenido de Kuyen. Lo que hay son los **cuatro templates candidatos servidos
tal como los publican sus autores**, cada uno en su ruta, y un marco en la raíz que muestra el
activo a pantalla completa con el **ToggleTheme** encima para pasar al siguiente.

| Ruta | Template |
|---|---|
| `/` | El marco: el template activo más el toggle |
| `/t/hive` | [Hive](https://21st.dev/@shadcnblockscom/templates/hive) |
| `/t/karate` | [Karate](https://21st.dev/@dhileepkumargm/templates/karate) |
| `/t/hirael` | [Hirael Agency Landing](https://21st.dev/@mohammadshehadeh/templates/hirael-agency-landing) |
| `/t/nex` | [NexStudio](https://21st.dev/@tailgrids/templates/tailgrids-nexstudio) |

Cada template se sirve entero dentro de su propio documento: su HTML, sus estilos, sus
scripts y sus assets, sin compartir nada con el marco ni con los otros. Esa es la razón de que
el marco use un `iframe`: es lo que permite tenerlos a los cuatro sin que se pisen entre sí y
sin tocarles una línea.

### Qué tan fiel es la copia

`tools/comparar-tema.mjs` toma la misma captura de pantalla completa del original en línea y
de la copia local, las superpone y cuenta los píxeles distintos. Medición del 10-09-2026 a
1440 px de ancho:

| Template | Píxeles distintos |
|---|---|
| Hive | 0,12% |
| Karate | 0,01% |
| Hirael | 0,02% |
| NexStudio | 0,18% |

Nunca da cero: los templates tienen animaciones, videos y relojes que cambian entre una carga
y otra. Sirve para detectar lo que importa, que es una sección que no cargó, una tipografía
que no llegó o un bloque en blanco.

### El ToggleTheme

Es una copia del de Pagos Pendientes y Tipo de Cambio (`src/components/theme-toggle.tsx` en
los dos repos), en su tamaño `sm`, a la izquierda y centrado verticalmente (pedido del
10-09-2026; en el Login de PP va arriba a la derecha). Misma píldora, mismos colores del tema oscuro que usan por defecto, pulsador blanco
con un icono por opción, ciclo al siguiente en cada clic, `title` con la opción activa y
`aria-label` con la siguiente.

Dos diferencias, las dos por el contenido: tiene cuatro posiciones en vez de tres (la píldora
suma un paso de 1,375 rem y queda en 5,875 rem), y en vez de poner una clase en `<html>`
cambia la fuente del marco, porque cada template vive en su propio documento. La elección se
guarda en `localStorage` y la página de arriba no se recarga.

### Los templates son de terceros

Son templates comerciales de 21st.dev, guardados enteros para elegir dirección visual con
Kuyen. **No son el sitio definitivo**: elegido uno, se reescribe el markup y se reemplazan los
assets por los de Kuyen. Por eso van con `noindex` y fuera del `sitemap.xml`.

## Cómo se edita

**Los `.html` de la raíz son generados. No los edites.** Se editan las fuentes de `src/` y se
regenera:

```bash
npm run build        # -> index.html + t/<id>.html + sitemap + robots
```

No hay dependencias que instalar: el generador es Node a secas.

| Qué querés cambiar | Dónde |
|---|---|
| Qué templates hay, su orden, nombre e icono | `TEMAS` en `src/site.config.mjs` |
| Con cuál abre el marco | `TEMA_POR_DEFECTO` en `src/site.config.mjs` |
| El aspecto y el comportamiento del toggle | `src/partials/marco.html` |
| Título y descripción de la página | `PAGINA` en `src/site.config.mjs` |
| Dirección, teléfono, Instagram, coordenadas | `NEGOCIO` en `src/site.config.mjs` |

Para verlo local con las URLs resueltas como las resuelve GitHub Pages:

```bash
node tools/build.mjs --out=dist
node tools/serve.mjs dist --port=8100
node tools/verify.mjs --port=8100
node --experimental-websocket tools/pruebas-ui.mjs http://localhost:8100
node --experimental-websocket tools/comparar-tema.mjs http://localhost:8100
```

`pruebas-ui.mjs` comprueba que el marco arranque con el template por defecto, que cada clic
cargue el siguiente sin recargar la página de arriba, que la elección sobreviva a una recarga
y que cada template cargue su contenido, sus estilos y sus imágenes sin caer en su propia
página de 404. Deja una captura por template en `dist-pruebas/`.

### Capturar o actualizar un template

```bash
npm run capturar <id> <url>
```

Baja la página entera con lo que necesita para verse igual: hojas de estilo, tipografías,
imágenes, videos y su JavaScript. Los archivos quedan bajo `temas/<id>/` **espejando la ruta
original**, y todas las referencias se reescriben a ese prefijo.

Espejar la ruta no es un detalle: los bundles arman URLs en tiempo de ejecución concatenando
un prefijo literal (`/_next/static/chunks/` y similares) con el nombre del chunk. Con la
estructura intacta alcanza con reescribir ese prefijo dentro del JavaScript. Con nombres
planos esos pedidos daban 404 y el template quedaba a medias.

Lee el DOM ya renderizado con el Chrome instalado en headless, porque los cuatro arman su HTML
en el navegador: bajándolos con HTTP a secas, Framer deja secciones invisibles y React
devuelve un cascarón vacío.

### Lo único que se les inyecta

Dos arreglos, primeros de todo en el `<head>`, para que el template se comporte igual
sirviéndose desde otra ruta (ver `arranque()` en `tools/build.mjs`):

1. **La ruta.** El template vive en `/t/<id>`, pero su router espera la ruta original. Sin
   esto, NexStudio no encuentra coincidencia y muestra su propia página de 404.
2. **Las imágenes de Next.js.** Al hidratar, el componente de imagen vuelve a pedirlas a
   `/_next/image?url=...&w=...`, un endpoint que en un sitio estático no existe. Se reapuntan
   a la imagen original, que la captura descarga junto con las variantes.

Además, los **ajustes pedidos** para un template puntual, declarados en `ajustes` de su
entrada en `TEMAS`:

- **Hive sin la franja "Purchase this theme on shadcnblocks.com"** (10-09-2026). Se cierra con
  el mismo mecanismo que usa el botón de cerrar del template, la cookie `banner-dismissed`: la
  cabecera lee ese estado y quita su margen de 3,5 rem, así que no queda hueco arriba. Un CSS
  corto evita que la franja se vea un instante antes de hidratar. `comparar-tema.mjs` mira el
  original con esa misma cookie, para seguir midiendo fidelidad y no el ajuste.

Fuera de eso, y del `noindex`, el HTML es el que publican sus autores.

### Si el build falla

El generador valida antes de escribir y no deja nada a medias: título o descripción demasiado
largos, más o menos de un `<h1>` en el marco, tokens sin resolver, o un template sin sus
assets.

## Publicación

Push a `main` publica desde la raíz del repo. El workflow `verificar.yml` corre en cada push y
en cada PR: regenera el HTML y lo compara contra lo comiteado, después levanta el servidor
local y corre la verificación funcional.

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

- **Elegir template**: es la decisión que desbloquea todo lo demás. Elegido uno, se sacan los
  otros tres de `TEMAS` y se borran sus capturas de `temas/`.
- **Adaptar el elegido**: reemplazar textos, fotos y marca por los de Kuyen. Recién ahí entra
  el contenido real.
- **Dominio**: `kuyenclimbing.cl` está puesto en `SITES.cl` y en `CNAME` como valor
  provisorio. No está comprado ni confirmado con Kuyen.
- **DNS**: cuando exista el dominio, registros A a 185.199.108/109/110/111.153. Si el DNS
  queda en Cloudflare, tiene que estar "DNS only" (nube gris), nunca proxiado, o GitHub deja
  de renovar el certificado HTTPS.
- **Marca**: no hay archivos de logo. El isotipo `img/marca-luna.svg` es un placeholder propio
  (luna creciente, por "küyen", luna en mapudungun), y solo se usa como favicon del marco.
- **Peso del repo**: las capturas ocupan cerca de 45 MB en `temas/`. Se van con los templates
  descartados.
- **Escenas 3D de Hive**: el hero y el pie montan escenas que necesitan GPU. En Chrome
  headless fallan igual en el original que en la copia; en un navegador normal se ven.

## Datos del negocio

Verificados el 09-09-2026 en la ficha de Google Maps y el perfil de Instagram del centro, y
guardados en `NEGOCIO` de `src/site.config.mjs` para cuando entre el contenido real:

- Los Patagones 375, Padre Las Casas, La Araucanía
- +56 9 3502 8838
- [@kuyen.climbing](https://www.instagram.com/kuyen.climbing/) · 2.928 seguidores
- [Ficha de Google](https://maps.app.goo.gl/v9F89L5peqFyxcJc9): 5,0 con 14 reseñas
- Muro de boulder con desplomes continuos hasta 25° y moonboard, y clases guiadas
- Horarios, precios y planes de clases siguen **sin confirmar**: lo que circula sale de
  publicaciones públicas de distinta fecha y no se escribe en el sitio hasta que Kuyen lo
  confirme
