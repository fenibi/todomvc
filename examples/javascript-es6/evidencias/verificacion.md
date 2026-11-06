# Verificación en navegador: TodoMVC javascript-es6

Fecha: 2026-11-03. Código bajo prueba: commit `eef4bc17` (sin cambios en `src/` desde entonces).

## Entorno y alcance

- Herramienta: Playwright MCP (Chromium) sobre `http://localhost:7001` (servidor `npm run dev`, con HMR). No se probó el build de producción.
- Tema: el navegador resolvió **oscuro** (`data-theme="dark"`) en todas las pasadas. **El tema claro no se ejercitó en esta verificación.**
- Las acciones son clics y teclas reales de Playwright. Excepciones: en la segunda ejecución de M09 los clics a los filtros se hicieron con `element.click()` del DOM; en K06 a K12 el recorrido con Tab parte de `page.focus('.new-todo')` (el input con autofocus) y sigue con Tab reales.
- Cada caso parte de una página recargada y se lee el estado del DOM tras la acción (60 ms de espera en teclado).
- "Como en el original" (M13) se comparó con lo documentado en `CLAUDE.md` (`src/store.js:6`) y con `evidencias/analisis.md`. **No se volvió a ejecutar la app original.**

## Resumen

| Bloque | Casos | Aprobados | Fallaron |
|---|---|---|---|
| Mouse (M01 a M13) | 13 | 13 (M09 en la 2.ª ejecución) | 0 |
| Teclado (K00 a K12) | 14 filas | 11 | **3: K04, K10, K11b** |
| Viewport y consola (V01 a V04) | 4 | 4 | 0 |

Los tres fallos son reales: coinciden con los hallazgos 1, 3 y 4 de la revisión anterior y **no están corregidos**.

## Notas sobre errores míos en la prueba

- **M09, 1.ª ejecución: falló por una lectura prematura.** Leí el DOM justo después del clic, y `hashchange` corre de forma asíncrona. Se vio el filtro anterior con el hash ya nuevo. En la 2.ª ejecución esperé el cambio de `.selected` y se asentó en 7 a 10 ms. Se registra como aprobado en la 2.ª ejecución; la 1.ª queda como falsa alarma de mi script, no como defecto de la app.
- **K03: el veredicto automático fue "falló" por mi lista esperada incompleta.** Omití el enlace "TodoMVC" del pie y mi bucle contó `body` como una parada más. Lo reevalué sobre la misma observación, sin volver a ejecutar: las primeras 13 paradas coinciden exactamente con la lista esperada. Luego viene el enlace "TodoMVC" (parada 14) y después el foco sale a `body`.
- **K04:** descarté la parada `body` del cálculo, porque era un artefacto del mismo bucle.

## Mouse, 1280×800

| ID | Caso | Entrada | Esperado | Observado | Resultado |
|---|---|---|---|---|---|
| M01 | Estado inicial | recargar | lista vacía; `.main` y `.footer` ocultos | 0 tareas; `.main` y `.footer` con `display: none` | Aprobado |
| M02 | Entrada vacía | clic en Add con input vacío; Enter con input vacío; clic en Add con `"   "` | 0 tareas en los 3 intentos | 0, 0 y 0 tareas | Aprobado |
| M03 | Crear con Enter | `Preparar taller` + Enter | 1 tarea; input vacío; "1 item left"; main y footer visibles | `["Preparar taller"]`; input `""`; "1 item left"; main `block`, footer `flex` | Aprobado |
| M04 | Crear con Add | `Revisar entrega` + clic en Add | 2 tareas, la nueva primero; "2 items left" | `["Revisar entrega","Preparar taller"]`; "2 items left"; input vacío | Aprobado |
| M05 | Editar con Enter | clic en Edit de "Revisar entrega"; Ctrl+A; `Revisar entrega editada`; Enter | `input.edit` con el título y con foco; al guardar cambia la etiqueta | al abrir: `value "Revisar entrega"` y con foco; después: `["Revisar entrega editada","Preparar taller"]`; 0 filas en edición | Aprobado |
| M06 | Cancelar con Escape | Edit; escribir `NO GUARDAR`; Escape | el título no cambia; sin modo edición | título `"Revisar entrega editada"`; 0 filas en edición | Aprobado |
| M07 | Completar | clic en el checkbox de "Preparar taller" | fila completada; "1 item left" | `"Preparar taller [done]"`; "1 item left" | Aprobado |
| M08 | Desmarcar | segundo clic en ese checkbox | sin completadas; "2 items left" | ninguna completada; "2 items left" | Aprobado |
| M09 | Filtros y contador | completar "Preparar taller"; clic en Active, Completed y All | Active: solo "Revisar entrega"; Completed: solo "Preparar taller"; All: ambas; contador "1 item left" siempre; hash y `.selected` siguen al filtro | **2.ª ejecución:** Active `["Revisar entrega"]` `#/active`; Completed `["Preparar taller [done]"]` `#/completed`; All 2 tareas `#/`; "1 item left" en los tres; asentado en 7 a 10 ms. **1.ª ejecución:** falló por lectura prematura (ver notas) | Aprobado (2.ª ejecución) |
| M10 | Eliminar | crear `Temporal`; clic en su Delete | desaparece; quedan 2; "1 item left" | antes: Temporal, Revisar entrega, Preparar taller [done]; después: sin Temporal; "1 item left" | Aprobado |
| M11 | Limpiar completadas | clic en "Clear completed" | queda solo "Revisar entrega" | `["Revisar entrega"]`; "1 item left"; hash `#/` | Aprobado |
| M12 | Estado vacío | eliminar la última tarea | lista vacía; main y footer ocultos; el input sigue visible | 0 tareas; main y footer `none`; input visible con placeholder "What needs to be done?". Captura: `evidencias/verif-estado-vacio.png` | Aprobado |
| M13 | Recargar reinicia datos | crear `Persistir?` y recargar | lista vacía tras recargar | antes `["Persistir?"]`; después `[]` | Aprobado |

## Teclado, 1280×800

| ID | Caso | Entrada | Esperado | Observado | Resultado |
|---|---|---|---|---|---|
| K00 | Foco inicial | recargar | foco en `input.new-todo` | `input.new-todo` | Aprobado |
| K01 | Crear con Enter | escribir `Preparar taller`; Enter | 1 tarea; input vacío; foco en el input | `["Preparar taller"]`; input vacío; foco `input.new-todo` | Aprobado |
| K02 | Tab a Add y Enter | escribir `Revisar entrega`; Tab; Enter | Tab enfoca Add; Enter crea; el foco vuelve al input | Tab dejó el foco en `button.add-todo`; 2 tareas, "2 items left"; foco final `input.new-todo` | Aprobado |
| K03 | Orden de tabulación y nombres | Shift+Tab desde el input; Tab repetido | 13 controles en orden con nombre (ver abajo) | las 13 paradas coinciden en orden y nombre; luego `TodoMVC` (enlace del pie); luego el foco sale a `body` | Aprobado (reevaluado, ver notas) |
| K04 | Foco visible, medido por píxeles | en cada parada, recorte enfocado vs. el mismo recorte sin foco; píxeles del color del outline (tolerancia 20 por canal) | anillo presente: diferencia de 30 px o más | 12 de 14 paradas con anillo (324 a 4110 px). **"Complete Revisar entrega" y "Complete Preparar taller": 0 px**, aunque el estilo computado dice `solid 3px rgb(250, 204, 21)` | **Falló** |
| K05 | Nombres según Playwright | `getByRole(rol, {name, exact})` para los 13 controles | 1 elemento por control | 13 de 13 resuelven a exactamente 1 | Aprobado |
| K06 | Editar con Enter | Tab hasta "Edit Revisar entrega" (4 Tab); Enter; Ctrl+A; `Revisar entrega editada`; Enter | se abre `input.edit` con foco y nombre; al guardar cambia la etiqueta | `input.edit` con `value "Revisar entrega"`, foco y `aria-label "Edit task"`; etiqueta `"Revisar entrega editada"` | Aprobado |
| K07 | Cancelar con Escape | Edit; `NO GUARDAR`; Escape | el título no cambia | título sin cambios; 0 filas en edición | Aprobado |
| K08 | Completar y desmarcar con Space | Tab hasta "Complete Preparar taller"; Space ×3 | completa, desmarca, completa | `[done]` y "1 item left"; sin completar y "2 items left"; `[done]` y "1 item left" | Aprobado |
| K09 | Filtros con Enter | Tab hasta Active, Completed y All; Enter en cada uno | Active: solo "Revisar entrega"; Completed: solo "Preparar taller"; All: ambas | `#/active` `["Revisar entrega"]`; `#/completed` `["Preparar taller [done]"]`; `#/` 2 tareas | Aprobado |
| K10 | Marcar todas con Space | Tab hasta "Mark all as complete"; Space | las 2 tareas completadas; "0 items left" | **el checkbox quedó tildado (`checked: true`) pero las tareas no cambiaron:** solo "Preparar taller" sigue `[done]`; contador "1 item left" | **Falló** |
| K11a | Eliminar con Enter | Tab hasta "Delete Revisar entrega"; Enter | la tarea desaparece | quedó `["Preparar taller [done]"]` | Aprobado |
| K11b | Foco tras eliminar | misma acción | el foco queda en un control de la página | `document.activeElement` = `body` | **Falló** |
| K12 | Limpiar completadas y estado vacío | Tab hasta "Clear completed"; Enter | lista vacía; `.main` oculto | lista vacía; `.main` `none` | Aprobado |

Orden esperado en K03: Dark mode, New task, Add, Mark all as complete, Complete / Edit / Delete de "Revisar entrega", Complete / Edit / Delete de "Preparar taller", All, Active, Completed. "Clear completed" no aparece mientras no haya tareas completadas, porque está oculto.

Observaciones sin puntuar (no formaban parte del criterio de esos casos):
- Tras guardar con Enter (K06) y tras cancelar con Escape (K07), el foco queda en `body`.
- Tras "Clear completed" (K12), el foco queda en `body`. Ahí es esperable, porque el botón se oculta.

### Detalle de K04 (píxeles del color del outline, enfocado menos sin foco)

| Parada | Tipo | Píxeles | Anillo |
|---|---|---|---|
| Dark mode | `button.theme-toggle` | 880 | sí |
| New task | `input.new-todo` | 3048 | sí |
| Add | `button.add-todo` | 712 | sí |
| Mark all as complete | `input.toggle-all` (anillo en su label) | 4110 | sí |
| Complete Revisar entrega | `input.toggle` | **0** | **no** |
| Edit Revisar entrega | `button.edit-btn` | 390 | sí |
| Delete Revisar entrega | `button.destroy` | 598 | sí |
| Complete Preparar taller | `input.toggle` | **0** | **no** |
| Edit Preparar taller | `button.edit-btn` | 390 | sí |
| Delete Preparar taller | `button.destroy` | 598 | sí |
| All | `a.selected` | 324 | sí |
| Active | `a` | 452 | sí |
| Completed | `a` | 778 | sí |
| TodoMVC | `a` | 522 | sí |

## Viewport y consola

| ID | Caso | Entrada | Esperado | Observado | Resultado |
|---|---|---|---|---|---|
| V01 | `evidencias/despues-escritorio.png` | 1280×800; recargar; crear "Preparar taller" y "Revisar entrega"; completar la primera; filtro All | mismo estado que `antes-escritorio.png`: "Revisar entrega" pendiente arriba, "Preparar taller" completada, "1 item left", All | `["Revisar entrega","Preparar taller [done]"]`; "1 item left"; All seleccionado; tema oscuro; `scrollWidth` 1280 = `innerWidth` 1280. Captura revisada a ojo | Aprobado |
| V02 | `evidencias/despues-movil.png` | 375×812; mismo estado | sin scroll horizontal | `scrollWidth` 375; `clientWidth` 375; `body.scrollWidth` 375; `scrollTo(200, 0)` deja `scrollX = 0`; 0 elementos visibles fuera de `[0, 375]`. Captura revisada a ojo | Aprobado |
| V03 | Título largo (extra) | 375 px; título de 80 caracteres sin espacios | sin scroll horizontal | mismas cifras que V02; la tarea aparece. Captura `evidencias/verif-movil-titulo-largo.png`: no la miré a ojo, solo las cifras | Aprobado |
| V04 | Consola | log de la sesión de Playwright | solo los 404 conocidos (`learn.json`, `favicon.ico`) | 15 errores en el log de la sesión (acumula todas las pruebas de hoy): todos 404 de esos dos archivos; 0 distintos; 0 warnings | Aprobado |

Los archivos `despues-escritorio.png` y `despues-movil.png` sustituyen a los del commit `4f84e2a7` (versión anterior de los mismos archivos, recuperable con git). Ahora muestran el tema oscuro.

## No cubierto

- Tema claro y el interruptor de tema (solo se probó antes, en la revisión anterior).
- Paginación con más de 5 tareas y su foco.
- Modo de alto contraste: probado en la revisión anterior (los checkboxes de fila desaparecían), no repetido aquí.
- Lector de pantalla real: los nombres se comprobaron con el motor de accesibilidad de Playwright, no con NVDA, JAWS ni VoiceOver.
- Build de producción, Firefox y Safari.

## Evidencias generadas

`despues-escritorio.png`, `despues-movil.png`, `verif-estado-vacio.png`, `verif-movil-titulo-largo.png`. Las dos de la revisión anterior (`revision-foco-checkbox.png`, `revision-forced-colors.png`) siguen sin commitear.

## Re-verificación tras las correcciones (K04, K10, K11b)

Ejecutado contra `http://localhost:7001` después de cambiar `src/app.css` y `src/view.js`.

| Caso | Entrada | Esperado | Observado | Resultado |
|---|---|---|---|---|
| K04 | Tab hasta el checkbox de la primera fila | Anillo de foco visible | `:focus-visible` verdadero; captura `correccion-foco-checkbox.png` muestra el anillo ámbar alrededor del checkbox | Aprobó |
| K04b | `forced-colors: active` | Checkbox nativo visible | `appearance: auto` calculado; **no** se hizo captura | Parcial: solo estilo calculado |
| K10 | Space en "Mark all as complete" con 2 tareas | Ambas completadas, "0 items left" | filas `completed, completed`, "0 items left"; segundo Space revierte a "2 items left"; clic en la etiqueta también alterna | Aprobó |
| K11b | Enter sobre Delete con 3 tareas, tres veces | Foco en el Delete de la fila siguiente; con la lista vacía, en el campo nuevo | `destroy`, `destroy`, `new-todo` (filas 2, 1, 0) | Aprobó |
| K12 | Enter / Escape en el campo de edición | Foco vuelve al botón Edit | `edit-btn` en ambos casos; Enter guarda ("UnaX"), Escape descarta | Aprobó |

Error mío durante la corrección: usé `.findIndex` sobre una NodeList y el borrado dejó de funcionar (TypeError en consola). Lo detecté por el log de consola y lo corregí con `Array.from`.
Consola final: solo el 404 conocido de `learn.json`.
No re-ejecutado: tema claro, paginación, captura en alto contraste.
