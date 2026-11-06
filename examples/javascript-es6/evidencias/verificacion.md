# Verificación funcional — QuestLog (TodoMVC JavaScript ES6)

- **Fecha:** 2026-11-03
- **Herramienta:** Playwright MCP (Chromium), sobre `http://localhost:7001/` (servidor `webpack serve` ya en ejecución).
- **Punto de partida:** página recargada, sin tareas. Tareas conocidas: **Preparar taller** y **Revisar entrega**.
- **Selectores usados:** los reales de la página: `.new-todo`, `.todo-list li`, `label`, `.edit`, `.todo-count`, `.clear-completed`, y los nombres accesibles `role=checkbox[name="Complete quest: …"]`, `role=button[name="Delete quest: …"]`, `role=link[name="All|Active|Completed"]`, `role=button[name="Clear completed"]`.
- **Cómo se observó:** después de cada acción se leyó el DOM (texto y clase de cada `li`, texto de `.todo-count`, `display` calculado de `.main`, `.footer` y `.clear-completed`, filtro con `.selected`, `location.hash`, elemento enfocado). Las capturas se indican donde corresponde.

## 1. Flujo con mouse

| # | Caso | Entrada | Esperado | Observado | Resultado |
|---|------|---------|----------|-----------|-----------|
| 1 | Estado inicial tras recargar | Abrir `http://localhost:7001/` | Sin tareas; `.main` y `.footer` ocultos; foco en el campo | 0 `li`; `.main` y `.footer` con `display: none`; contador "0 items left"; mensaje "No quests yet. Write your first one above."; foco en `.new-todo` | Aprobado |
| 2 | Entrada vacía | Enter con el campo vacío | No se crea tarea | 0 `li`; `.main` sigue oculto | Aprobado |
| 3 | Entrada solo con espacios | Escribir 4 espacios + Enter | No se crea tarea | 0 `li`. El campo conserva los espacios, igual que el original (`controller.js:57-58` sale sin limpiar) | Aprobado |
| 4 | Crear primera tarea | "Preparar taller" + Enter | 1 tarea pendiente; campo vacío; contador "1 item left" | `[ ] Preparar taller`; campo vacío; "1 item left"; `.main` y `.footer` visibles | Aprobado |
| 5 | Crear segunda tarea | "Revisar entrega" + Enter | 2 tareas, la nueva arriba (orden invertido original); "2 items left" | `[ ] Revisar entrega`, `[ ] Preparar taller`; "2 items left" | Aprobado |
| 6 | Editar con Enter | Doble clic en "Revisar entrega", reemplazar por "Revisar entrega final", Enter | Título actualizado y fin de la edición | Al entrar: `li.editing` con valor "Revisar entrega" y foco en `.edit`. Después: `[ ] Revisar entrega final`, ninguna `li.editing` | Aprobado |
| 7 | Cancelar edición con Escape | Doble clic, escribir "Texto que debe descartarse", Escape | Título sin cambios y fin de la edición | Sigue "Revisar entrega final"; ninguna `li.editing` | Aprobado |
| 8 | (Restaurar nombre) | Doble clic, "Revisar entrega", Enter | Vuelve al nombre conocido | `[ ] Revisar entrega` | Aprobado |
| 9 | Completar | Clic en casilla "Complete quest: Preparar taller" | `li.completed`; "1 item left"; aparece "Clear completed" | `[x] Preparar taller`; "1 item left"; `.clear-completed` con `display: block` | Aprobado |
| 10 | Desmarcar | Clic en la misma casilla | Vuelve a pendiente; "2 items left"; "Clear completed" se oculta | `[ ] Preparar taller`; "2 items left"; `.clear-completed` con `display: none` | Aprobado |
| 11 | Completar de nuevo (estado de la captura de escritorio) | Clic en la misma casilla | Preparar taller completada, Revisar entrega pendiente | `[ ] Revisar entrega`, `[x] Preparar taller`; "1 item left"; filtro "All" | Aprobado |
| 12 | Filtro Active | Clic en enlace "Active" | Solo pendientes; hash `#/active`; "Active" con `.selected` | Solo "Revisar entrega"; `#/active`; seleccionado "Active" | Aprobado |
| 13 | Filtro Completed | Clic en enlace "Completed" | Solo completadas; hash `#/completed` | Solo "Preparar taller"; `#/completed`; seleccionado "Completed" | Aprobado |
| 14 | Filtro All | Clic en enlace "All" | Ambas tareas; hash `#/` | Ambas tareas; `#/`; seleccionado "All" | Aprobado |
| 15 | Contador de pendientes | Observado en los casos 4, 5, 9, 10, 11, 16, 17 y 19 | Cuenta solo pendientes, con singular y plural | "0 items left", "1 item left", "2 items left" según el caso; las completadas no cuentan | Aprobado |
| 16 | Eliminar | Crear "Tarea temporal" ("2 items left"), hover y clic en "Delete quest: Tarea temporal" | La tarea desaparece; "1 item left" | Quedan Revisar entrega y Preparar taller; "1 item left" | Aprobado |
| 17 | Limpiar completadas | Clic en "Clear completed" | Se borra Preparar taller; el botón se oculta | Queda `[ ] Revisar entrega`; "1 item left"; `.clear-completed` con `display: none` | Aprobado |
| 18 | Estado vacío | Clic en "Delete quest: Revisar entrega" | Sin tareas; `.main` y `.footer` ocultos; invitación visible | 0 `li`; `.main` y `.footer` ocultos; mensaje "No quests yet. Write your first one above."; captura `despues-vacio.png` | Aprobado |
| 19 | Recargar reinicia los datos | Crear "Tarea antes de recargar" (1 `li`) y navegar de nuevo a `http://localhost:7001/` | Sin persistencia, como el original (almacenamiento en memoria, `store.js:6`) | Antes: 1 tarea; `localStorage` y `sessionStorage` vacíos. Después: 0 `li`, "0 items left", `.main` y `.footer` ocultos | Aprobado |

## 2. Flujo con teclado (desde la página recargada)

| # | Caso | Entrada | Esperado | Observado | Resultado |
|---|------|---------|----------|-----------|-----------|
| K1 | Foco inicial | Cargar la página | Foco en el campo, visible | `input.new-todo`, `:focus-visible` verdadero, anillo `solid 3px rgb(129, 63, 50)` | Aprobado |
| K2 | Crear con teclado | Escribir tecla a tecla "Preparar taller" + Enter y "Revisar entrega" + Enter | 2 tareas; "2 items left" | "Revisar entrega", "Preparar taller"; "2 items left"; el foco sigue en el campo | Aprobado |
| K3 | Orden de Tab | Tab ×4 | Campo → marcar todas → casilla 1 → eliminar 1 → casilla 2 | `toggle-all` → `toggle` "Revisar entrega" → `destroy` "Revisar entrega" (se hace visible: opacidad 1) → `toggle` "Preparar taller" | Aprobado |
| K4 | Completar con Espacio | Espacio en "Complete quest: Preparar taller" | Completada; "1 item left"; el foco se queda | `[x] Preparar taller`; "1 item left"; el foco sigue en la casilla | Aprobado |
| K5 | Desmarcar con Espacio | Espacio | Pendiente; "2 items left" | `[ ] Preparar taller`; "2 items left" | Aprobado |
| K6 | Completar otra vez | Espacio | Completada; "Clear completed" visible | `[x] Preparar taller`; "1 item left"; `.clear-completed` visible | Aprobado |
| K7 | Filtro Active con Enter | Tab ×3 hasta "Active", Enter | `#/active`; solo pendientes; el foco se queda en el enlace | `#/active`; "Revisar entrega"; foco en "Active" con anillo visible | Aprobado |
| K8 | Filtro Completed con Enter | Tab, Enter | `#/completed`; solo completadas | `#/completed`; "Preparar taller"; foco en "Completed" | Aprobado |
| K9 | Filtro All con Enter | Shift+Tab ×2, Enter | `#/`; ambas tareas | `#/`; ambas tareas; foco en "All" | Aprobado |
| K10 | Limpiar completadas con Enter | Tab ×3 hasta "Clear completed", Enter | Se borra Preparar taller | Queda "Revisar entrega"; "1 item left". El foco cae a `body` porque el botón se oculta (comportamiento original) | Aprobado |
| K11 | Eliminar con Enter | Shift+Tab ×4 hasta "Delete quest: Revisar entrega", Enter | Lista vacía; estado vacío | 0 `li`; `.main` y `.footer` ocultos; mensaje de lista vacía visible. El foco cae a `body` | Aprobado |
| K12 | Editar sin mouse | Crear "Editar sin mouse"; Tab ×2 hasta su casilla; Enter y F2 | Poder entrar en edición | Ninguna `li.editing`. Dentro del `li` solo son enfocables la casilla y el botón de eliminar; el `label` tiene `tabIndex -1`. La edición solo se activa con doble clic (`view.js:153`) | **Falló** |
| K13 | Marcar todas con Espacio | Shift+Tab hasta "Mark all as complete", Espacio | Todas las tareas pasan a completadas | La casilla quedó marcada (`checked: true`), pero la tarea siguió pendiente y el contador en "1 item left": la casilla y los datos quedan desincronizados. `view.js:147` solo escucha el clic en la etiqueta | **Falló** |

Los fallos K12 y K13 no los introdujo el rediseño: `view.js` no se modificó, y el análisis de código del original indica el mismo comportamiento. No ejecuté la versión original para compararlas lado a lado.

## 3. Foco visible y nombres de controles

| # | Caso | Entrada | Esperado | Observado | Resultado |
|---|------|---------|----------|-----------|-----------|
| F1 | Foco visible en cada parada de Tab | Recorrido K1–K11 | `:focus-visible` con anillo visible | En campo, casillas (anillo sobre la casilla dibujada), eliminar, All, Active, Completed y Clear completed: `:focus-visible` verdadero y `outline: solid 3px rgb(129, 63, 50)`. En el enlace "TodoMVC" del pie: `solid 3px rgb(196, 154, 70)`. Captura `despues-foco-teclado.png` | Aprobado |
| F2 | Nombres de los controles | Snapshot de accesibilidad | Nombres comprensibles y únicos por tarea | `textbox "What needs to be done?"` (ver F3), `checkbox "Mark all as complete"`, `checkbox "Complete quest: <título>"`, `button "Delete quest: <título>"`, `link "All" / "Active" / "Completed"`, `button "Clear completed"`, `heading "todos"` (nivel 1) | Aprobado |
| F3 | El nombre del campo incluye su texto visible | Comparar el nombre con el placeholder | El nombre contiene "What needs to be done?" | **Primera ejecución:** el nombre era "New quest" y no incluía el texto visible → falló. **Corrección:** `src/index.html:19` pasó a `aria-label="What needs to be done?"`. **Re-ejecución tras recargar:** `aria-label` igual al placeholder; el snapshot muestra `textbox "What needs to be done?"`; localizado con `role=textbox[name="What needs to be done?"]` creó "Preparar taller" ("1 item left") | Aprobado (tras corrección) |

## 4. Responsive y evidencias

| # | Caso | Entrada | Esperado | Observado | Resultado |
|---|------|---------|----------|-----------|-----------|
| R1 | Sin scroll horizontal a 375 px | Viewport 375 × 812, mismo estado que la captura de escritorio | `scrollWidth ≤ clientWidth`; sin elementos fuera | `clientWidth` 360 (15 px de barra vertical), `scrollWidth` 360; `scrollTo(500, 0)` deja `scrollX` en 0; 0 elementos fuera del ancho | Aprobado |
| R2 | Evidencia móvil | Captura del viewport 375 × 812 | `evidencias/despues-movil.png` | Guardada: una sola página con Revisar entrega pendiente, Preparar taller completada y filtro All | Aprobado |
| R3 | Evidencia escritorio | 1280 × 800 con Preparar taller completada, Revisar entrega pendiente y filtro All; foco quitado y puntero fuera de la lista | `evidencias/despues-escritorio.png` en el mismo estado que la captura "antes" | Guardada con ese estado (verificado en el DOM antes de capturar) | Aprobado |

**Captura "antes":** `evidencias/antes-escritorio.png`, tomada el 2026-11-06 con Playwright MCP (`browser_take_screenshot`) a 1280 × 800 sobre la versión original sin rediseño: el `dist/` del commit base `ff43b02e`, extraído con `git show` a una carpeta temporal y servido en `127.0.0.1:7099`, sin tocar el código del proyecto. Antes de capturar se comprobó en el DOM: `[ ] Revisar entrega`, `[x] Preparar taller`, "1 item left", filtro All. `evidencias/referencia-1280x800.jpg` es la captura previa, tomada con la extensión de Chrome, y queda como respaldo.

## 5. Consola

En las dos cargas solo aparecieron los 404 de `learn.json` y `favicon.ico`, ya presentes antes del rediseño. No hubo errores de JavaScript.

## 6. Resumen

- **Aprobados:** 19 de 19 casos con mouse, 11 de 13 con teclado, 3 de 3 de foco y nombres (F3 tras su corrección), y 3 de 3 de responsive y evidencias.
- **Fallados:**
  - **K12:** no se puede editar sin mouse.
  - **K13:** "Mark all as complete" con Espacio desincroniza la casilla y los datos.

  Los dos vienen de `view.js`, que no se modificó por consigna.
- **Corregido:** **F3**, el nombre del campo. Venía del `aria-label="New quest"` agregado en el rediseño; ahora coincide con el texto visible. Ningún test del repositorio verificaba ese nombre.

## 7. Recorrido grabado sobre el despliegue publicado

Grabación del 2026-11-06. Reemplaza a la primera (2026-11-03, 54,6 s), que quedaba por debajo de los 60–90 s pedidos. Para alargarla se agregaron acciones reales (otra tarea, eliminar, limpiar completadas, estado vacío, vuelta a escritorio y "Mark all"), sin esperas artificiales.

- **URL grabada:** `https://project-brg6s.vercel.app`. Durante la grabación (17:00–17:02 UTC) el dominio apuntaba al despliegue `dpl_EXb9Jc15HNiUV9q9ZqzPiskALQFx` (`READY`, producción), el último antes de publicar este video. La página cargó sin inicio de sesión: la grabación no contiene logins ni secretos.
- **Archivo:** `C:\Users\franc\Practica IA\todomvc\examples\javascript-es6\evidencias\recorrido.webm` (ruta absoluta pasada a `browser_start_video`).
- **Herramientas:** Playwright MCP `browser_start_video` (1280 × 800) y `browser_stop_video`.
- **Duración:** 72,4 s.

| # | Paso del recorrido | Entrada | Esperado | Observado (verificado en el DOM durante la grabación) | Resultado |
|---|---|---|---|---|---|
| V1 | Estado inicial | Abrir la URL a 1280 × 800 | Sin tareas, lista y pie ocultos | 0 tareas; `.main` y `.footer` ocultos; foco en el campo; lámpara visible | Aprobado |
| V2 | Crear dos tareas | "Preparar taller" + Enter y "Revisar entrega" + Enter en `textbox "What needs to be done?"` | 2 pendientes, la nueva arriba | `Revisar entrega`, `Preparar taller`; "2 items left" | Aprobado |
| V3 | Crear una tercera | "Tarea temporal" + Enter | 3 tareas | 3 tareas, "Tarea temporal" arriba | Aprobado |
| V4 | Editar una | Doble clic en "Revisar entrega", " final", Enter | "Revisar entrega final"; fin de la edición | `[ ] Revisar entrega final`; ninguna `li.editing` | Aprobado |
| V5 | Completar una | Clic en `checkbox "Complete quest: Preparar taller"` | Completada; "2 items left" | `[x] Preparar taller`; "2 items left" | Aprobado |
| V6 | Filtrar pendientes | Clic en `link "Active"` | Solo pendientes; `#/active` | "Tarea temporal" y "Revisar entrega final"; `#/active`; Active seleccionado | Aprobado |
| V7 | Filtrar completadas | Clic en `link "Completed"` | Solo completadas; `#/completed` | Solo "Preparar taller"; `#/completed`; Completed seleccionado | Aprobado |
| V8 | Volver a All y eliminar | Clic en `link "All"`, hover y clic en `button "Delete quest: Tarea temporal"` | La tarea desaparece | `[ ] Revisar entrega final`, `[x] Preparar taller`; "1 item left" | Aprobado |
| V9 | Adaptación móvil | Viewport 375 × 812 | Una sola página, sin scroll horizontal | Una columna (`grid-template-columns: 276px`); `scrollWidth` 360 = `clientWidth` 360 | Aprobado |
| V10 | Limpiar completadas (móvil) | Completar "Revisar entrega final" y clic en "Clear completed" | Lista vacía con invitación | 0 tareas; `.main` y `.footer` ocultos; "No quests yet. Write your first one above."; `.desk-scene` oculto; `scrollWidth` 375 | Aprobado |
| V11 | Vuelta a escritorio y Mark all | Crear "Mostrar QuestLog", viewport 1280 × 800, clic en "Mark all as complete" | Todas completadas; escena visible | `[x] Mostrar QuestLog`; "0 items left"; `.desk-scene` visible; llama con animación `lamp-flicker` | Aprobado |
| V12 | El archivo existe | Revisar el disco después de `browser_stop_video` | Archivo `.webm` presente | 9 709 740 bytes; WebM VP8 1280 × 800 a 25 fps; duración 00:01:12.36 (metadatos leídos con el ffmpeg de Playwright); SHA-1 `0b648443133ae07d4299237be6e4c57a85cd4255` | Aprobado |
| V13 | El archivo se reproduce | Cargar el `.webm` en un `<video>` de Chromium servido en local (el MCP bloquea `file:`), `play()` 1,5 s y salto a 70 s | Reproduce sin error | `videoWidth` 1280, `videoHeight` 800, duración 72,36 s, avanzó de 0 a 1,5 s, salto a 70 s correcto, `error: null` | Aprobado |

**Consola durante la grabación:** solo el 404 de `learn.json`, que ya existía antes del rediseño.

**Nota:** en la parte móvil, la página ocupa los 375 px de la izquierda del cuadro de 1280 × 800: el tamaño del video es fijo y el viewport se achica dentro de él.

### Publicación del video y comprobación final

El video se publicó con `npm run build`, copiándolo a `dist/evidencias/` y ejecutando `vercel dist --prod`.

| # | Comprobación | Herramienta | Observado | Resultado |
|---|---|---|---|---|
| P1 | Despliegue nuevo | Vercel MCP `list_deployments` y `get_deployment` (`project-brg6s.vercel.app`) | `dpl_9BWyNs7hzWm9hKPtqTSu7swnhW1n`, `READY`, producción, origen `cli`, alias `project-brg6s.vercel.app`; commit asociado `41d38890` | Aprobado |
| P2 | La app no cambió | Vercel MCP `list_deployment_files` en la versión grabada (`dpl_EXb9…`) y en la final (`dpl_9BWy…`) | Mismos hashes en `index.html`, `app.css`, `app.bundle.js`, `base.js` y los 22 recursos; solo cambia `evidencias/recorrido.webm` | Aprobado |
| P3 | Video público igual al local | `curl` a `https://project-brg6s.vercel.app/evidencias/recorrido.webm` | 200, `video/webm`, 9 709 740 bytes, SHA-1 `0b648443…4cd4255`, igual al archivo local | Aprobado |
| P4 | Flujo básico en la web publicada | Playwright MCP: crear dos tareas, completar "Preparar taller", filtro Active | `[ ] Revisar entrega` solo, "1 item left", `#/active`, Active seleccionado | Aprobado |

## 8. Qué no se probó

- Lectores de pantalla: no se verificó que el anuncio de `aria-live` del contador funcione.
- Firefox, Safari y dispositivos táctiles reales.
- Zoom real del navegador.
- Los tests e2e de Cypress del repositorio.
