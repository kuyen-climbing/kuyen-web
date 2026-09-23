# Kuyen Climbing: sitio web

Sitio de **Kuyen Climbing**, centro de escalada en boulder en Los Patagones 375, Padre Las
Casas, La Araucanía. Repo de la organización `kuyen-climbing`, servido por GitHub Pages.

Sigue el flujo de sitios estáticos documentado en
`C:\Proyectos\INCBA\docs\Flujo-Sitios-Web-GitHub-Pages.md`: generador propio, verificación
funcional y CI que impide publicar HTML desincronizado.

## Estado (22-09-2026): etapa de contenido

Kuyen respondió la planilla de las 101 preguntas y el sitio ya publica sus datos reales:
horarios, valores, clases, Kuyencit@s, el muro en detalle, quiénes lo construyeron y quiénes
setean, la historia, los productos, las comodidades y el correo de contacto. Quedan dos
pendientes a la vista: los días y el horario de Kuyencit@s, y las reseñas.

Las tres variantes suman cuatro secciones armadas con ese material: **Quiénes somos** (los
profes, el seteo, los dueños y Pancita), **Kuyencit@s** con lugar propio, **Comunidad e
inclusión**, y **Tu primera vez** en cuatro pasos, que es el camino que Kuyen dijo que más le
importa.

Cada template candidato pasa a tener una variante propia con el contenido, la tipografía y los
colores de Kuyen. **Karate, Hirael y NexStudio ya son variantes propias**: el sitio generado no
publica nada de las capturas, que quedan en el repo y se ven solo en local, en `/ref/<id>`. El
marco de la raíz muestra el activo a pantalla completa con el **ToggleTheme** encima para pasar
al siguiente.

El estilo de las variantes, elegido el 15-09-2026: títulos en Rubik Dirt y texto en Rubik, la
página entera de noche (tinta y gradiente del logo 2.0) con acento amarillo luna y movimiento en
títulos, textos, fotos y secciones. En las tres, el hero abre sobre el cielo de estrellas que
titilan, con la luna en el medio y a la vista, entrada orquestada y rastro de tiza; la cabecera
queda fija arriba. Cada una suma lo suyo:

El logo con la cordillera y los gatos aparece en los tres heroes, y desde el 22-09-2026 cada
variante lo trata a su manera, para que la comparación no sea solo de estructura:

- **Hirael**: la escaladora en un arco, una foto redonda y presas que flotan con profundidad.
  El logo se apoya al pie del arco, nítido y a escala, con los gatos mirando hacia la
  escaladora. Es el único de los tres que se lee como dibujo y no como fondo.
- **NexStudio**: los pernos del muro que se iluminan donde apunta el mouse y la portada que se
  abre al bajar. El logo va detrás del título y se revela solo donde cae la luz del puntero,
  con la misma máscara redonda que usan los pernos.
- **Karate**: una pila de tres fotos que se inclina con el mouse y se abre en abanico, dentro de
  una tarjeta de vidrio. El logo va recortado dentro de esa tarjeta, pegado a su borde inferior
  y con sus esquinas redondeadas, como grabado en el vidrio.

Hive salió de los candidatos el 14-09-2026. Su captura sigue en el historial de git:
`git checkout 3ba77fb -- src/temas/hive temas/hive`.

| Ruta | Template |
|---|---|
| `/` | El marco: el template activo más el toggle |
| `/t/karate` | [Karate](https://karateacadamy.framer.website/) |
| `/t/hirael` | [Hirael Agency Landing](https://hirael.com/embed/templates/agency-landing) |
| `/t/nex` | [NexStudio](https://nexstudio.demos.tailgrids.com/) |

Cada template se sirve entero dentro de su propio documento: su HTML, sus estilos, sus
scripts y sus assets, sin compartir nada con el marco ni con los otros. Esa es la razón de que
el marco use un `iframe`: es lo que permite tenerlos a los tres sin que se pisen entre sí y
sin tocarles una línea.

El marco pinta blanco detrás del `iframe`, que es el fondo que pone el navegador cuando una
página no define el suyo. Un `iframe` es transparente, y NexStudio no pinta fondo propio: con
el fondo oscuro que tenía antes el marco, su texto negro quedaba sobre casi negro.

### Qué tan fiel es la copia

`tools/comparar-tema.mjs` toma la misma captura de pantalla completa del original en línea y
de la copia local, las superpone en memoria y cuenta los píxeles distintos, sin guardar
imágenes. Medición del 10-09-2026 a
1440 px de ancho:

| Template | Píxeles distintos |
|---|---|
| Karate | 0,03% |
| Hirael | 0,10% |
| NexStudio | 0,01% |

Nunca da cero: los templates tienen animaciones, videos y relojes que cambian entre una carga
y otra. Sirve para detectar lo que importa, que es una sección que no cargó, una tipografía
que no llegó o un bloque en blanco.

### El ToggleTheme

Es una copia del de Pagos Pendientes y Tipo de Cambio (`src/components/theme-toggle.tsx` en
los dos repos), en su tamaño `sm`, a la izquierda y centrado verticalmente (pedido del
10-09-2026; en el Login de PP va arriba a la derecha). Misma píldora, mismos colores del tema oscuro que usan por defecto, pulsador blanco
con un icono por opción, ciclo al siguiente en cada clic, `title` con la opción activa y
`aria-label` con la siguiente.

Con tres templates, la píldora mide 4,5 rem y el pulsador usa las mismas tres posiciones de PP.
Una diferencia, por el contenido: en vez de poner una clase en `<html>` cambia la fuente del
marco, porque cada template vive en su propio documento. La elección se guarda en
`localStorage` y la página de arriba no se recarga.

### Los templates son de terceros

Son templates comerciales de terceros, guardados enteros para elegir dirección visual con
Kuyen. **No son el sitio definitivo**: elegido uno, se reescribe el markup y se reemplazan los
assets por los de Kuyen. Por eso van con `noindex` y fuera del `sitemap.xml`.

## Cómo se edita

**Los `.html` de la raíz son generados. No los edites.** Se editan las fuentes de `src/` y se
regenera:

```bash
npm run build        # -> index.html + t/<id>.html + sitemap + robots
```

No hay dependencias que instalar: el generador es Node a secas.

### Trabajar en local

```bash
npm run dev
```

Genera el sitio en `dist/`, lo sirve en http://localhost:8100 y lo vuelve a generar solo cada
vez que cambia algo en `src/`. El servidor local responde sin caché, así que un cambio se ve con
solo recargar, sin esperar los 10 minutos que GitHub Pages guarda cada versión publicada.

| Qué querés cambiar | Dónde |
|---|---|
| Qué templates hay, su orden, nombre e icono | `TEMAS` en `src/site.config.mjs` |
| Con cuál abre el marco | `TEMA_POR_DEFECTO` en `src/site.config.mjs` |
| El aspecto y el comportamiento del toggle | `src/partials/marco.html` |
| Título y descripción del marco | `PAGINA` en `src/site.config.mjs` |
| Textos, datos del negocio, horarios, precios, eventos, reglamento y fotos | `src/contenido.mjs` |
| La página de una variante | `src/variantes/<id>/pagina.mjs` |
| Paleta, acento y tokens | `src/css/tokens.css` |

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
página de 404. No saca capturas: todo se comprueba leyendo el DOM y el resultado es texto.

En las variantes propias revisa además:

- que haya un solo `<h1>`;
- que Rubik Dirt y Rubik carguen desde el sitio y que no se pida nada a otros dominios al abrir
  la página;
- el contraste AA de cada texto visible contra su fondo, gradientes incluidos;
- que no haya desborde a lo ancho en 375, 640, 768, 1024 y 1440 px;
- que el menú móvil abra y se cierre con Escape;
- que el mapa y las tres publicaciones de Instagram vengan incrustados, sin clic, y con
  `loading="lazy"`, que es lo que evita que la primera pantalla pida algo a Google o a Instagram;
- que la entrada del hero termine;
- que la cabecera quede a la vista al bajar por la página;
- que el logo de fondo del hero quede detrás del texto, difuminado y con poca opacidad, y que
  donde el logo no sea fondo ningún texto ni la marquesina lo tapen, en todos los anchos;
- que no haya errores de JavaScript al cargar.

Antes de medir el contraste recorre la página entera, porque los textos y las fotos que entran
al hacer scroll están invisibles hasta aparecer.

Desde WSL se corre con el Chrome de Linux: `CHROME=/usr/bin/google-chrome npm run test:ui`.

### Variantes propias (etapa de contenido)

Cada template va a tener una variante con el contenido, la tipografía y los colores de Kuyen, y
la misma estructura del template: secciones, layout, componentes, espaciado y animaciones. El
markup, el CSS y el JavaScript de cada variante son propios.

| Qué | Dónde |
|---|---|
| Página de la variante | `src/variantes/<id>/pagina.mjs`, con su CSS y su JS en la misma carpeta |
| Textos y datos del negocio | `src/contenido.mjs`, sin HTML: lo leen todas las variantes |
| Qué publicaciones de Instagram se muestran | `INSTAGRAM` en `src/contenido.mjs`: solo públicas, sin precios ni horarios sin confirmar y sin marcas de terceros sin permiso. La publicación va incrustada y carga sola; `src/compartido/instagram.js` solo ajusta el alto que avisa Instagram |
| Paleta del logo 2.0, acento y tokens semánticos | `src/css/tokens.css` |
| Tipografías (Rubik Dirt y Rubik, licencia OFL) | `fonts/` y `src/css/fuentes.css` |
| Escena del logo y movimiento que comparten las variantes | `src/compartido/`: `escena.mjs` (cielo, luna, cordillera con los gatos, presas que flotan, títulos que se arman, marquesina y cifras), `movimiento.css` y `movimiento.js` (entrada del hero, profundidad con el puntero, paralaje, rastro de tiza y apariciones) |
| Fotos y derivados de marca | `img/fotos/` e `img/marca/`, generados con `tools/assets.mjs` |

Mientras un template no tenga `pagina.mjs`, `/t/<id>` sigue sirviendo su captura. Con
`npm run dev`, la captura de cada template queda además en `/ref/<id>` para comparar;
`npm run build` y `npm run preview` no la llevan.

`pagina.mjs` exporta por defecto una función que recibe el contexto y devuelve el HTML completo:

- `contenido`: todo `src/contenido.mjs`.
- `esc(texto)`: escapa texto para HTML.
- `foto(id, opciones)`: una `<img>` con `srcset`, `sizes`, `width` y `height` de una foto de
  `FOTOS`.
- `cabeza(opciones)`: el `<head>` con metadatos, Open Graph, datos estructurados, fuentes,
  tokens y el CSS de la variante (`estilos`).
- `leer(nombre)`: un archivo de la carpeta de la variante.

Lo que Kuyen no confirmó va como `[POR CONFIRMAR]`, con un comentario que dice qué falta. Cada
dato que viene de la planilla de preguntas lleva el código de su pregunta entre paréntesis
(`H4` es horarios y tarifas, `C1` clases, `M5` el muro, y así).

#### Fotos y marca

Los originales no entran al repo. Con ImageMagick instalado:

```bash
node tools/assets.mjs fotos --origen=<carpeta con los JPG>
node tools/assets.mjs marca --origen=<carpeta con los PNG del logo> --titulo=<RubikDirt.ttf> --texto=<Rubik.ttf>
node tools/assets.mjs escena --origen=<carpeta con el arte de 15 x 20>
```

`fotos` genera cada foto de `FOTOS` en WebP de 1600, 1200 y 800 px, con la orientación de la
cámara aplicada y bajo 300 KB, más `img/fotos/fotos.json` con las medidas. `marca` recorta el
isotipo del logo 2.0 y genera los favicons, el logo completo y la imagen para redes
(`og-kuyen.jpg`, de 1200 x 630). Los TTF son las versiones de escritorio de las mismas familias
de `fonts/`, porque ImageMagick no lee woff2.

`escena` saca del arte de 15 x 20 dos capas con el cielo transparente: la cordillera con los dos
gatos y la luna con su goteo (`img/escena/`). Separa por saturación: el cielo del arte es un
gradiente muy saturado y lo demás es tinta, blanco o gris. Deja fuera las estrellas, porque el
sitio dibuja las suyas, que titilan.

Para agregar una foto: se suma a `FOTOS` en `src/contenido.mjs`, con su `id`, el archivo original
y el texto alternativo, y se vuelve a correr `fotos`.

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

Lee el DOM ya renderizado con el Chrome instalado en headless, porque los tres arman su HTML
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

- **Karate sin la sección "Built different. Training different."** (10-09-2026). Karate es
  Framer y se hidrata con React, así que el bloque se oculta con CSS en vez de borrarlo del
  HTML: borrarlo dejaría a React sin el nodo que espera. Se oculta el bloque entero, que Framer
  llama "Built Steps" (etiqueta, título, texto, "Meet the team" y las tarjetas), y la sección
  del horario sube a su lugar. `comparar-tema.mjs` le aplica el mismo CSS al original.

Las pruebas de interfaz comprueban cada ajuste: que el texto sacado no se vea, que no quede el
margen de lo que se sacó y que las secciones de alrededor queden seguidas, sin hueco.

Fuera de eso, y del `noindex`, el HTML es el que publican sus autores.

### Si el build falla

El generador valida antes de escribir y no deja nada a medias: título o descripción demasiado
largos, más o menos de un `<h1>` en el marco, tokens sin resolver, o un template sin sus
assets.

En las variantes revisa además que haya un solo `<h1>`, que no haya anclas rotas ni assets que
falten en el repo, y que no queden referencias a los templates o a terceros (rutas `/temas/`,
dominios de los templates, fuentes pedidas a Google) ni datos sin confirmar. En
`src/contenido.mjs`, falla si un horario o un precio queda en blanco, o si aparece alguno de
los valores de `DATOS_SIN_CONFIRMAR`. Esa búsqueda la hace `apareceDatoViejo`, que exige una
frontera a la izquierda del valor: así `2.000`, que es un dato viejo, no salta dentro de
`$32.000`, que sí es un precio vigente.

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

### Fotos que tiene que subir Kuyen

F3 a F14 de la planilla quedaron todas en blanco. Las diez que van en una sección se muestran
en su sitio como un recuadro punteado que dice qué falta, con la misma lógica que
`[POR CONFIRMAR]`: lo que no está se ve. Están en `FOTOS_PENDIENTES` de `src/contenido.mjs`, y
el build falla si alguna deja de aparecer en cualquiera de las tres variantes.

| Código | Qué falta | Dónde se ve el hueco |
|---|---|---|
| F5 | El muro completo sin gente, con buena luz | El muro |
| F4 | Presas y volúmenes de cerca | El muro |
| F7 | El moonboard completo, y con alguien escalando | El muro |
| F12 | El armado de rutas: seteo, lavado de presas, volúmenes | El muro |
| F10 | El equipo: una foto de cada persona, o una grupal | Quiénes somos |
| F8 | Una clase guiada en acción | Clases |
| F9 | Kuyencit@s escalando, con autorización de sus apoderados | Kuyencit@s |
| F13 | Los productos a la venta, sobre fondo simple | En el lugar |
| F11 | La recepción y la zona de descanso | En el lugar |
| F6 | La fachada y la entrada | Visítanos |

Dos pedidos más no son una foto de sección y van solo en `MATERIAL_PENDIENTE`: los originales
de la sesión de abril de 2026 (F3) y videos cortos del muro, de 10 a 30 segundos (F14).

### Del sitio

- **Elegir template**: es la decisión que desbloquea todo lo demás. Elegido uno, se sacan los
  otros dos de `TEMAS` y se borran sus capturas de `temas/`.
- **Adaptar el elegido**: reemplazar textos, fotos y marca por los de Kuyen. Recién ahí entra
  el contenido real.
- **Dominio**: `kuyenclimbing.cl` está puesto en `SITES.cl` y en `CNAME` como valor
  provisorio. No está comprado ni confirmado con Kuyen.
- **DNS**: cuando exista el dominio, registros A a 185.199.108/109/110/111.153. Si el DNS
  queda en Cloudflare, tiene que estar "DNS only" (nube gris), nunca proxiado, o GitHub deja
  de renovar el certificado HTTPS.
- **Marca**: el isotipo, los favicons, el logo completo y `og-kuyen.jpg` salen del logo 2.0 con
  `tools/assets.mjs marca`. Falta el nombre de la tipografía del logo y el manual de marca, si
  existe.
- **Peso del repo**: las capturas ocupan cerca de 24 MB en `temas/`. Se van con los templates
  descartados.

## Datos del negocio

Todos en `src/contenido.mjs`. La base se revisó el 14-09-2026 en la ficha de Google Maps,
Instagram, Linktree y el formulario de solicitud de ingreso; el 22-09-2026 Kuyen confirmó el
resto en la planilla de preguntas:

- Los Patagones 375, Padre Las Casas, La Araucanía. Razón social: Kuyen SpA
- +56 9 3502 8838, kuyen.climbing@gmail.com
- [@kuyen.climbing](https://www.instagram.com/kuyen.climbing/)
- [Ficha de Google](https://maps.app.goo.gl/v9F89L5peqFyxcJc9): 5,0 con 14 reseñas
- Lunes a domingo de 10:00 a 22:00, con horario bajo hasta las 16:00 y horario alto después
- Muro de boulder de 4,26 m, paredes de 0° a 40°, moonboard 2016 completa, más de 1000 presas,
  clases guiadas, el programa infantil Kuyencit@s y talleres
- Sigue **sin confirmar** y va como `[POR CONFIRMAR]`: los días y el horario de Kuyencit@s
- Reseñas: las cinco de Google que tienen texto, copiadas de la ficha el 23-09-2026 abriéndola
  en Chrome. De las 14 opiniones, las otras nueve son estrellas sin comentario. Kuyen no
  respondió T1, que preguntaba por el permiso; Benjamín decidió publicarlas igual, y si alguien
  pide bajar la suya se borra su entrada de `RESENAS`
- **No se declara `aggregateRating`** en los datos estructurados: las guías de Google no
  permiten marcar como valoración propia una nota recogida en su propia ficha
- El plan de clases guiadas es de 4 clases al mes, una vez por semana. El de 8 clases al mes
  que Kuyen lanzó en marzo salió del sitio hasta saber si sigue existiendo y a qué valor
