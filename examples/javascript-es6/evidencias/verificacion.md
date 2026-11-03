# Verificación de Entre Todos (TodoMVC ES6)

- **Fecha:** 2026-11-03
- **Herramienta:** Playwright MCP sobre Chromium, con clics y teclas reales.
- **Página probada:** `http://localhost:7002`, servida con `npm run serve` a partir del `dist/` generado por `npm run build` desde `src/`.
- **Selectores:** se usaron los nombres y etiquetas reales de la página: "Nueva tarea", "¿Quién la hace?", "Editar Revisar entrega", "Borrar completadas", los enlaces "Todas", "Pendientes" y "Completadas" y el diálogo "¿Quién la completó?". Solo se usaron clases CSS para leer el estado, como `.todo-list li`, `.completed`, `.todo-count`, `.main` y `.footer`.
- **Inicio de cada bloque:** se abre la página y se recarga.

**Resultado de la primera pasada:** 26 casos aprobados y 3 fallados, todos del manejo del foco (K02b, K03b y K08b).

**Resultado tras la corrección (sección 7):** los 3 fallos pasaron a aprobado y no aparecieron regresiones.

## Diferencias con el TodoMVC original

- **Diálogo al completar:** las tareas se crean como **General**. El brief exige registrar quién completó cada tarea, así que completar una tarea General abre el diálogo "¿Quién la completó?". El original solo marcaba la casilla.
- **Integrantes precargados:** la app trae a Ana, Martín, Sofía y Lucas, definidos en `src/members.js`. Por eso alcanzan para completar tareas sin agregar a nadie.
- **Nombres de los filtros:** All, Active y Completed se llaman Todas, Pendientes y Completadas. Las rutas son las mismas: `#/`, `#/active` y `#/completed`.

## 1. Flujo funcional con el mouse

| # | Entrada | Esperado | Observado | Resultado |
|---|---|---|---|---|
| F01 | Página recién recargada, sin acciones | Estado vacío: 0 tareas, `.main` y `.footer` ocultos | 0 tareas; `.main` visible=false; `.footer` visible=false | Aprobado |
| F02 | Enter en "Nueva tarea" vacía; después "    " (4 espacios) + Enter | No se crea ninguna tarea | 0 tareas; `.main` visible=false | Aprobado |
| F03 | Leer la lista "Integrantes" tras recargar | Los 4 precargados: Ana, Martín, Sofía, Lucas | `["Ana","Martín","Sofía","Lucas"]` | Aprobado |
| F04 | "Preparar taller" + Enter; "Revisar entrega" + Enter, con "¿Quién la hace?" en General | 2 tareas General, campo vacío, contador "2 tareas pendientes" | Títulos `["Revisar entrega","Preparar taller"]`; 2 etiquetas General; campo ""; contador "2 tareas pendientes" | Aprobado |
| F05 | Botón "Editar Revisar entrega"; escribir "Revisar entrega final"; Enter | El campo de edición recibe el foco; el título cambia; sale de edición | Foco en el campo (aria-label "Editar tarea"); títulos `["Revisar entrega final","Preparar taller"]`; 0 tareas en edición | Aprobado |
| F06 | Doble clic en "Revisar entrega final"; escribir "TEXTO DESCARTADO"; Escape | Se cancela y conserva "Revisar entrega final" | Títulos `["Revisar entrega final","Preparar taller"]`; 0 tareas en edición | Aprobado |
| F07 | Clic en la casilla de "Preparar taller" (General); en el diálogo elegir Ana y Confirmar | Abre "¿Quién la completó?"; queda completada por Ana; contador "1 tarea pendiente" | Diálogo abierto=true; clase `completed`; casilla marcada; "Completada por" = Ana; contador "1 tarea pendiente" | Aprobado |
| F08 | Clic en "Pendientes" (Active) | Solo "Revisar entrega"; URL `#/active`; `aria-current` en Pendientes | `["Revisar entrega"]`; `#/active`; `aria-current` = Pendientes | Aprobado |
| F09 | Clic en "Completadas" (Completed) | Solo "Preparar taller"; URL `#/completed` | `["Preparar taller"]`; `#/completed`; `aria-current` = Completadas | Aprobado |
| F10 | Clic en "Todas" (All) | Las 2 tareas; URL `#/` | 2 títulos; `#/`; `aria-current` = Todas | Aprobado |
| F11 | Clic en la casilla marcada de "Preparar taller" | Vuelve a pendiente; desaparece "Completada por"; contador 2 | Clase ""; casilla sin marcar; 0 selects "Completada por"; contador "2 tareas pendientes" | Aprobado |
| F12 | Crear "Tarea para borrar" y hacer clic en "Borrar Tarea para borrar" | Desaparece; quedan 2; contador 2 | 3 tareas antes y 2 después (`["Revisar entrega","Preparar taller"]`); contador "2 tareas pendientes" | Aprobado |
| F13 | Completar "Revisar entrega" (Martín); clic en "Borrar completadas" | Se borra solo la completada; queda "Preparar taller"; el botón se oculta | Botón visible antes=true; `["Preparar taller"]`; botón visible después=false; contador "1 tarea pendiente" | Aprobado |
| F14 | Clic en "Borrar" de la última tarea | Estado vacío: 0 tareas; `.main` y `.footer` ocultos | 0 tareas; `.main` y `.footer` ocultos; foco en `#new-todo-title` | Aprobado |
| F15 | Crear la tarea "Dato antes de recargar" y el integrante "Visita"; recargar | Como el original, los datos viven en memoria: 0 tareas y vuelven los 4 integrantes precargados | Antes: 1 tarea y 5 integrantes. Después: 0 tareas y `["Ana","Martín","Sofía","Lucas"]` | Aprobado |

**Primera corrida:** dio 4 falsos negativos (F03, F07, F09 y F13), causados por la prueba y no por la app. Se descartaron y se repitió la corrida completa.

- **F03:** esperaba poder agregar a "Ana", pero ya estaba precargada. La app rechazó el nombre repetido, que es lo correcto.
- **F07, F09 y F13:** se leyó el DOM antes de que llegaran los eventos asíncronos `close` del `<dialog>` y `hashchange`.

En la segunda corrida se espera cada evento y la tabla de arriba es su resultado.

## 2. Flujo principal solo con teclado

Todo con `keyboard.press` y `keyboard.type`, sin clics. Para empezar cada paso desde un lugar conocido se quitó el foco con `blur()` y se avanzó con Tab hasta el control indicado.

| # | Entrada | Esperado | Observado | Resultado |
|---|---|---|---|---|
| K01 | Al cargar, sin clic: escribir "Preparar taller" + Enter y "Revisar entrega" + Enter | El foco inicial está en "Nueva tarea" (autofocus); se crean 2 tareas | Foco inicial: textbox "Nueva tarea"; `["Revisar entrega","Preparar taller"]`; contador "2 tareas pendientes" | Aprobado |
| K02 | Tab ×3 hasta "Editar Revisar entrega"; Enter; Ctrl+A; escribir "Revisar entrega final"; Enter | El campo de edición recibe el foco; el título cambia | Foco en `input.edit`; `["Revisar entrega final","Preparar taller"]` | Aprobado |
| K02b | Mismo paso que K02: dónde queda el foco después de guardar con Enter | El foco vuelve a un control de la tarea, no a `<body>` | Foco en `BODY` | **Falló** (corregido, ver sección 7) |
| K03 | Tab hasta "Editar Revisar entrega final"; Enter; Ctrl+A; escribir "TEXTO DESCARTADO"; Escape | Se cancela y conserva "Revisar entrega final" | `["Revisar entrega final","Preparar taller"]`; 0 tareas en edición | Aprobado |
| K03b | Mismo paso que K03: dónde queda el foco después de Escape | El foco vuelve a un control de la tarea, no a `<body>` | Foco en `BODY` | **Falló** (corregido, ver sección 7) |
| K04 | Tab hasta la casilla "Preparar taller"; Espacio; Flecha abajo; Tab hasta "Confirmar"; Enter | Abre el diálogo con el foco dentro; queda completada por Ana | Diálogo abierto; foco al abrir en el combobox "Integrante"; elegido Ana; completada `["Preparar taller"]`; "Completada por" = Ana; al cerrar, el foco vuelve a `input.toggle` | Aprobado |
| K05 | Tab hasta cada filtro y Enter: Pendientes, Completadas, Todas | Pendientes = [Revisar entrega final]; Completadas = [Preparar taller]; Todas = 2 | Pendientes `["Revisar entrega final"]` (`/active`); Completadas `["Preparar taller"]` (`/completed`); Todas con 2 tareas (`/`) | Aprobado |
| K06 | Tab hasta la casilla marcada "Preparar taller"; Espacio | Vuelve a pendiente; contador 2; el foco sigue en la casilla | 0 completadas; contador "2 tareas pendientes"; foco en `input.toggle` con `:focus-visible` = true | Aprobado |
| K07 | Tab hasta "Borrar Revisar entrega final"; Enter | Se borra; el foco no queda en `<body>` | `["Preparar taller"]`; foco en `#new-todo-title` | Aprobado |
| K08 | Completar "Preparar taller" con teclado (Flecha abajo ×2 = Martín); Tab hasta "Borrar completadas"; Enter | Se borra; queda el estado vacío | 0 tareas; `.main` visible=false | Aprobado |
| K08b | Mismo paso que K08: dónde queda el foco después de "Borrar completadas" | El foco pasa a un control visible | Foco en `button.clear-completed`, que quedó oculto porque `.footer` tiene `display: none` | **Falló** (corregido, ver sección 7) |

## 3. Foco visible y nombres de los controles

- **Estado de partida:** "Preparar taller" completada por Ana, "Revisar entrega" pendiente y filtro Todas.
- **Recorrido:** se pulsó Tab hasta volver al primer control. Hubo 24 paradas.

| # | Entrada | Esperado | Observado | Resultado |
|---|---|---|---|---|
| A01 | Las 24 paradas de Tab | Cada parada coincide con `:focus-visible`, con un contorno visible | Las 24 dieron `:focus-visible` = true con contorno `solid 3px rgb(10, 63, 92)` | Aprobado |
| A02 | Nombre accesible de cada parada, leído del árbol de accesibilidad | Todas tienen nombre, y los botones repetidos dicen a qué tarea o integrante se refieren | Ver la lista de nombres más abajo | Aprobado |
| A03 | `ariaSnapshot` de `<body>`: buscar textbox, button, checkbox, combobox o link sin nombre | Ninguno | 0 controles sin nombre | Aprobado |
| A04 | Orden de Tab | Sigue el orden visual | Encabezado → lista de tareas → filtros → "Borrar completadas" → Integrantes → pie de página | Aprobado |

**Nombres observados en A02:**

- **Alta de tareas:**
  - combobox "¿Quién la hace?"
  - textbox "Nueva tarea"
  - checkbox "Marcar todas como completadas"
- **Por cada tarea:**
  - checkbox con el título, por ejemplo "Revisar entrega" o "Preparar taller"
  - botones "Editar Revisar entrega" y "Borrar Revisar entrega", y los mismos para "Preparar taller"
  - combobox "Completada por", en la tarea completada
- **Pie de la lista:**
  - links "Todas", "Pendientes" y "Completadas"
  - button "Borrar completadas"
- **Integrantes:**
  - textbox "Nuevo integrante"
  - button "Agregar"
  - un textbox por integrante: "Nombre de Ana", "Nombre de Martín", "Nombre de Sofía" y "Nombre de Lucas"
  - botones "Borrar a Martín", "Borrar a Sofía" y "Borrar a Lucas". Ana no tiene botón porque figura en una tarea; eso es lo esperado según el brief.
- **Pie de página:** link "TodoMVC"

## 4. Ancho de 375 px

- **Viewport:** 375 × 812.
- **Ancho útil:** el Chromium de escritorio muestra una barra de scroll vertical de 15 px, así que el ancho útil es 360 px (`clientWidth`).
- **Criterio:** no hay scroll horizontal si `scrollWidth` es igual a `clientWidth` y ningún elemento visible se sale por la izquierda o por la derecha.

| # | Entrada | Esperado | Observado | Resultado |
|---|---|---|---|---|
| M01 | Estado vacío | Sin scroll horizontal | `scrollWidth` 360 = `clientWidth` 360; 0 elementos fuera | Aprobado |
| M02 | Diálogo "¿Quién la completó?" abierto | Sin scroll horizontal | 360 = 360; 0 fuera | Aprobado |
| M03 | Preparar taller completada, Revisar entrega pendiente, filtro Todas | Sin scroll horizontal | 360 = 360; 0 fuera | Aprobado |
| M04 | Una tarea en edición | Sin scroll horizontal | 360 = 360; 0 fuera | Aprobado |
| M05 | Aviso de nombre repetido visible: agregar "Ana" | Sin scroll horizontal | 360 = 360; 0 fuera | Aprobado |

## 5. Capturas

| Archivo | Viewport | Estado | Comprobado |
|---|---|---|---|
| `evidencias/despues-movil.png` | 375 × 812 | Preparar taller completada por Ana, Revisar entrega pendiente, filtro Todas | Abrí la imagen y muestra ese estado, sin cortes laterales |
| `evidencias/despues-escritorio.png` | 1280 × 800 | El mismo estado, con URL `/` y `aria-current` en Todas | Abrí la imagen y muestra ese estado; `scrollWidth` 1265 = `clientWidth` 1265 |

**Sobre `antes-escritorio.png`:** el archivo no muestra TodoMVC. Es una página de un dominio de ejemplo con el texto "This domain is for use in documentation examples…". Por eso no puede servir de comparación visual. Repliqué el estado descrito en el pedido (Preparar taller completada, Revisar entrega pendiente y filtro All), no el que se ve en esa imagen.

**Actualización del 2026-11-03, 19:56:** `antes-escritorio.png` se volvió a capturar con el TodoMVC original.

- **Origen:** el `dist/` del commit `ff43b02`, previo al rediseño. Se extrajo con `git archive` a una carpeta temporal, sin tocar la copia de trabajo, y se abrió como `file://` con Playwright MCP.
- **Viewport:** 1280 × 800.
- **Estado observado:**
  - título "TodoMVC: JavaScript Es6 Webpack";
  - "Revisar entrega" pendiente y "Preparar taller" completada;
  - contador "1 item left" y filtro All seleccionado (`#/`);
  - 0 errores de JavaScript.
- **Consola:** solo mensajes informativos. El original avisa que, abierto desde `file://`, no puede cargar la barra informativa de TodoMVC; no afecta a la app.
- **Comprobación:** abrí la imagen y muestra ese estado. Ahora sí sirve como "antes" para comparar con `despues-escritorio.png`.

## 6. Consola

En toda la sesión hubo solo dos tipos de error:

- 16 veces `404 /learn.json`, que pide `base.js` de todomvc-common; ya ocurría antes de los cambios.
- 1 vez `404 /favicon.ico`.

No hubo errores de JavaScript.

## Lo que no se verificó

- **Cypress:** no se ejecutó, por indicación del usuario.
- **Otros navegadores:** no se probaron Firefox, Safari ni dispositivos móviles reales. El ancho de 375 px se simuló con el viewport de Chromium de escritorio.
- **Lector de pantalla:** no se probó con uno real. Los nombres salen del árbol de accesibilidad de Chromium.
- **Contraste del contorno de foco:** no se midió en esta corrida.

## 7. Corrección de los fallos de foco (segunda pasada, 2026-11-03)

### Cambios en `src/view.js`

Solo se tocó la vista. No cambiaron `controller.js`, `store.js`, el marcado ni los selectores.

1. **Foco tras editar una tarea (K02b y K03b):**
   - Al pulsar Enter o Escape en `input.edit`, el campo se marca con `data-refocus` antes del `blur()`.
   - `_editItemDone` lee esa marca y, después de quitar el campo, devuelve el foco al botón "Editar" de la misma tarea.
   - Si la edición se cierra con un clic en otro lugar (blur por mouse), no hay marca y el foco queda donde se hizo clic.
   - `_removeItem` también tiene en cuenta esa marca. Así, si se vacía el texto y se pulsa Enter, la tarea se elimina y el foco pasa a "Nueva tarea" en vez de caer en `<body>`.
2. **Foco tras "Borrar completadas" (K08b):** el nuevo método `_rescueFocus` mueve el foco a "Nueva tarea" cuando el control enfocado queda oculto. Se llama:
   - en `_clearCompletedButton`, cuando el botón se oculta;
   - en el nuevo `_contentBlockVisibility`, cuando se ocultan `.main` y `.footer`. Este método reemplaza la línea que antes estaba dentro de `render`.

### Verificación

- **Compilación:** `npm run build` sin errores.
- **Bundle servido:** se confirmó que el `app.bundle.js` que entrega `localhost:7002` incluye el cambio.

| # | Entrada | Esperado | Observado | Resultado |
|---|---|---|---|---|
| C1 | Tab hasta "Editar Revisar entrega"; Enter; Ctrl+A; "Revisar entrega final"; Enter | Guarda, y el foco vuelve a "Editar" de esa tarea con foco visible | Títulos `["Revisar entrega final","Preparar taller"]`; foco en button "Editar Revisar entrega final"; `:focus-visible` = true | Aprobado |
| C2 | Con foco en ese "Editar": Enter; Ctrl+A; "TEXTO DESCARTADO"; Escape | Cancela, y el foco vuelve a "Editar" de esa tarea con foco visible | Títulos sin cambio; foco en button "Editar Revisar entrega final"; `:focus-visible` = true | Aprobado |
| C3 | Editar "Revisar entrega final"; borrar todo el texto; Enter | La tarea se elimina, como en el original, y el foco va a "Nueva tarea" | `["Preparar taller"]`; foco en textbox "Nueva tarea" | Aprobado |
| C4 | Clic en "Editar Preparar taller" y luego clic en "Nuevo integrante" | Guarda por blur y el foco queda donde se hizo clic | 0 tareas en edición; foco en textbox "Nuevo integrante" | Aprobado |
| C5 | Completar "Preparar taller" (queda "Revisar entrega" pendiente); Tab hasta "Borrar completadas"; Enter | Se oculta el botón y el foco pasa a "Nueva tarea" | `["Revisar entrega"]`; botón visible=false; foco en textbox "Nueva tarea", visible y con `:focus-visible` | Aprobado |
| C6 | Completar la única tarea; Tab hasta "Borrar completadas"; Enter (mismo caso que K08b) | Estado vacío y foco en "Nueva tarea" | 0 tareas; `.footer` oculto; foco en textbox "Nueva tarea", visible | Aprobado |
| C7 | Lo mismo que C6, con el mouse | El foco no queda en un elemento oculto | 0 tareas; foco en textbox "Nueva tarea", visible | Aprobado |

### Regresión con el código corregido

- **F01–F15:** 15 de 15 aprobados.
- **K01–K08 con K02b, K03b y K08b:**
  - K02b: el foco queda en "Editar Revisar entrega final".
  - K03b: el foco queda en el mismo botón.
  - K08b: el foco queda en "Nueva tarea", visible.
  - K05 falló una vez en la corrida combinada: "Pendientes" mostró las 2 tareas. Se investigó así:
    - **Causa:** la prueba leía la lista apenas cambiaba `location.hash`, antes de que el evento `hashchange` la volviera a dibujar.
    - **Comprobación:** se repitieron los 3 filtros 5 veces con teclado (15 corridas), esperando a que `aria-current` cambiara.
    - **Resultado:** las 15 mostraron la lista correcta. En 6 de las 15, una lectura inmediata daba la lista anterior, lo que explica el fallo.
    - **Conclusión:** era un problema de sincronización de la prueba y no de la app, así que K05 queda **aprobado**. F08–F10 esperan `aria-current` y pasaron.
- **Foco y nombres (A01–A03) a 1280 × 800 y 375 × 812:**
  - Todos los controles muestran `:focus-visible` con un contorno sólido.
  - Hay 0 controles sin nombre.
  - A 1280, una de las paradas de Tab fue `<body>`: es cuando el foco sale de la página después del último control, no un control sin foco visible.
- **375 px:** `scrollWidth` 360 = `clientWidth` 360, sin scroll horizontal.
- **Consola:** solo los 404 de `learn.json` y `favicon.ico`, que ya ocurrían antes.

### Sigue sin verificarse

- Cypress, por indicación del usuario.
- Firefox, Safari y un lector de pantalla real.
- El orden de los eventos `blur`, `keyup` y `close` solo se comprobó en Chromium.

## 8. Recorrido grabado en producción (2026-11-03)

### Qué se grabó

- **URL recorrida:** https://taller-entre-todos.vercel.app, un alias de producción.
- **Despliegue grabado:** `dpl_JDea5w5dMLwmZfuf9oMwrsVwVjZA`, cuya URL exacta es https://taller-entre-todos-21yp8g33d-fvilla-7987.vercel.app (proyecto `taller-entre-todos`, cuenta `fvilla-7987`, estado READY). Es el único despliegue del proyecto (ver `evidencias/despliegue.md`); no se volvió a consultar Vercel al momento de grabar.
- **Archivo del video:** `C:\Users\Fabian\proyectocapacitacion\todomvc\examples\javascript-es6\evidencias\recorrido.webm`.
  - Se le pasó a `browser_start_video` como ruta absoluta.
  - La ruta indicada, `evidencias\recorrido.webm`, es relativa; se resolvió desde `examples/javascript-es6`, como se pidió.
- **Herramientas:** `browser_navigate`, `browser_start_video` (cursor animado, 1280 × 800), seis `browser_video_chapter` de 1,5 s cada uno, `browser_type`, `browser_select_option`, `browser_click`, `browser_resize`, `browser_evaluate` para verificar cada paso, y `browser_stop_video`.
- **Contenido:** no se grabaron logins ni secretos. La app no tiene autenticación y solo muestra datos de prueba en memoria.

### Preparación

- **Falta de ffmpeg:** el primer `browser_start_video` falló con "Executable doesn't exist at …\ms-playwright\ffmpeg-1011\ffmpeg-win64.exe".
  - Se instaló `ffmpeg-1011`, junto con su dependencia `winldd-1007`, con la propia CLI de la versión de Playwright que usa el MCP (`playwright-core` 1.64.0-alpha, `install ffmpeg`).
  - Se descarga en la caché de usuario `AppData\Local\ms-playwright` y no cambia la configuración del sistema.
- **Grabación que quedó abierta:** el MCP dejó una grabación abierta tras el error. Se detuvo antes de empezar y no dejó ningún archivo; se comprobó que la carpeta estaba vacía.

### Pasos y verificación durante la grabación

| # | Entrada | Esperado | Observado | Resultado |
|---|---|---|---|---|
| V01 | Abrir la URL publicada | Estado vacío; los 4 integrantes precargados | URL `https://taller-entre-todos.vercel.app/`; 0 tareas; `.main` oculto; integrantes `["Ana","Martín","Sofía","Lucas"]` | Aprobado |
| V02 | Escribir "Preparar taller" + Enter. Elegir Sofía en "¿Quién la hace?", escribir "Revisar entrega" + Enter | 2 tareas: una General y otra con Sofía como responsable; contador 2 | "Revisar entrega" con "Responsable: Sofía"; "Preparar taller" General; "2 tareas pendientes"; campo vacío | Aprobado |
| V03 | Clic en "Editar Revisar entrega"; escribir "Revisar entrega final"; Enter | Título actualizado; sale de edición; el foco vuelve a "Editar" | Títulos `["Revisar entrega final","Preparar taller"]`; 0 en edición; foco en "Editar Revisar entrega final" | Aprobado |
| V04 | Clic en la casilla "Preparar taller"; en el diálogo elegir Ana y Confirmar | Se abre el diálogo porque la tarea es General; queda completada por Ana; contador 1 | Diálogo abierto con «Preparar taller» es una tarea General.; luego cerrado; completadas `["Preparar taller"]`; "Completada por" = Ana; "1 tarea pendiente" | Aprobado |
| V05 | Clic en el filtro "Pendientes" | Solo "Revisar entrega final" | `#/active`; `aria-current` en Pendientes; `["Revisar entrega final"]` | Aprobado |
| V06 | Clic en el filtro "Completadas" | Solo "Preparar taller" | `#/completed`; `aria-current` en Completadas; `["Preparar taller"]` | Aprobado |
| V07 | Clic en "Todas"; cambiar el viewport a 375 × 812 | Sin scroll horizontal | `innerWidth` 375, `clientWidth` 360 (por la barra de scroll de 15 px), `scrollWidth` 360; 0 elementos fuera de pantalla; 2 tareas | Aprobado |
| V08 | A 375 px: clic en "Pendientes" y en "Todas"; clic en "Nuevo integrante" para bajar hasta Integrantes | Los filtros funcionan en móvil; se ve el apartado Integrantes | `#/active` y luego `#/`; `scrollY` 722; `scrollWidth` 360 = `clientWidth` 360 | Aprobado |

**Resultado:** 8 de 8 pasos aprobados.

**Consola:** un solo error, `404 /learn.json`, que es el mismo de siempre. No hubo errores de JavaScript.

### Comprobación del archivo

| Comprobación | Resultado |
|---|---|
| Existe | 7.144.395 bytes, con fecha 2026-11-03 17:25 |
| Formato | Cabecera EBML (`1a45dfa3`): WebM/Matroska válido |
| Metadatos (`ffmpeg -i`) | Duración 00:01:23.60; VP8, yuv420p, 1280 × 800, 25 fps |
| Duración pedida (60–90 s) | 83,6 s. No se agregaron esperas: los tiempos vienen de las acciones con cursor animado, que el MCP espacia 800 ms, y de las 6 tarjetas de capítulo de 1,5 s |
| Decodificación completa | Se volvió a codificar todo el video a otro WebM con el `ffmpeg` de Playwright. Terminó con código 0, sin errores y con la misma duración de 1:23.60 |
| Fotogramas extraídos | Se revisaron tres: a los 5 s, la tarjeta "1. Estado inicial"; a los 35 s, la tarea con "Responsable: Sofía" ya editada a "Revisar entrega final" y el cursor sobre "Editar"; a los 82 s, la vista de 375 px con Integrantes |

### Limitaciones

- **Reproducción:** se comprobó decodificando el archivo con `ffmpeg`, no abriéndolo en un reproductor.
- **Tramo móvil del video:** el video se grabó a 1280 × 800 fijo. En el tramo móvil la página de 375 px aparece a la izquierda del cuadro y el resto queda gris. La medición de 375 px se hizo en la página, no en el video.
- **Navegador:** solo Chromium.
