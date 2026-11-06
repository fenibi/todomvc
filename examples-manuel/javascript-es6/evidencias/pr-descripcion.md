# Descripción de la PR

**Título:** `feat(ui): rediseño de la presentación de javascript-es6 con temas, paginación y acciones por tarea`

**Base:** `master` de `fenibi/todomvc` · **Rama:** `feat/mruizsalva-redisenio`

---

## Resumen

Rediseña la presentación del ejemplo TodoMVC en JavaScript ES6 vanilla, como ejercicio de taller. El comportamiento, la estructura MVC, el almacenamiento en memoria y la ausencia de framework no cambian.

## Qué cambió

- **Controles:** botón "Add" junto al campo de texto; botones "Edit" y "Delete" en cada tarea; paginación en el cliente (5 por página, la más nueva primero), mantenida en la vista.
- **Accesibilidad:** anillo de foco visible de 3 px en ambos temas, nombres accesibles en los controles ("Complete <título>", "Edit <título>", "Delete <título>"), navegación de paginación con etiqueta, interruptor de tema con `role="switch"`.
- **Temas:** claro tipo "cuaderno rayado" y oscuro tipo "panel HUD de vidrio", ambos con variables CSS. `src/theme.js` (nuevo) define `data-theme` según `prefers-color-scheme` (oscuro por defecto) y maneja el interruptor. La elección se guarda solo en memoria.
- **Responsive:** revisado a 375 px con un título largo sin espacios; sin desborde horizontal.
- **Correcciones (commit `d86df42c`):** restaura el anillo de foco del checkbox, hace que "toggle all" funcione por teclado y devuelve el foco tras borrar o editar.

## Qué no cambió

- `controller.js`, `model.js`, `store.js` y el flujo de datos.
- Los selectores CSS y los atributos `class` / `data-id` que usan `view.js` y `template.js`.
- El almacenamiento: los datos siguen en memoria y se pierden al recargar (`src/store.js:6`).

## Commits de funcionalidad

1. `9595d208` rediseño con botón Add, paginación y acciones por tarea
2. `45475474` estilo cuaderno
3. `eef4bc17` modo oscuro e interruptor de tema
4. `d86df42c` correcciones de foco y teclado

Además hay commits de documentación y evidencias (`4f84e2a7`, `d3e597d9` y uno de corrección). El mensaje de `d3e597d9` quedó mal formado; se recomienda **squash** al mergear.

## Cómo revisar

El diff de código es de unas 870 líneas, por encima de la guía habitual de 400, sobre todo porque `app.css` pasó de 20 líneas a una hoja de estilos completa. Orden sugerido: `index.html` → `template.js` → `view.js` → `theme.js` → `app.css`.

## Verificación

- `npm run build` compiló bien en los commits anteriores. No se volvió a ejecutar para el último (`d86df42c`).
- Flujos manuales con Playwright MCP en el servidor local: agregar (botón y Enter), completar, editar (Enter guarda, Escape descarta), borrar, toggle all, filtros, clear completed, paginación, cambio de tema, teclado y diseño a 375 px. Detalle en `evidencias/verificacion.md`.
- Esa verificación (sobre `eef4bc17`) registró 3 fallos de teclado y foco (K04, K10, K11b). El commit `d86df42c` apunta a corregirlos, pero no hay una reverificación registrada de esos casos.
- Vista previa desplegada: https://taller-todo-manuel.vercel.app/ (producción, desde la CLI, commit `d86df42c`). Un recorrido grabado cubrió: agregar dos tareas, editar una, completar una, filtros Active / Completed y viewport de 390 px sin desborde. La consola mostró solo los 404 conocidos de `learn.json` y `favicon.ico`. Detalle en `evidencias/verificacion-despliegue.md` y `evidencias/despliegue.md`.
- El proyecto no tiene pruebas automáticas; no se registró una fase RED previa.

## No verificado

- Contraste medido con herramienta, lector de pantalla, Firefox y Safari.
- En el sitio desplegado: borrar, toggle all, clear completed, recarga, paginación y cambio de tema.
- Que lo desplegado coincida exactamente con `d86df42c`: hay dos despliegues de producción con ese commit, ambos subidos desde la CLI, y el video se grabó sobre el primero.

## Notas para quien revisa

- `evidencias/` y `odd/tasks/` son material del taller, incluido para la revisión.
- `dist/` es salida de compilación versionada en este repo y el build la regeneró. Conviene ignorar esos cambios en la revisión.

## Capturas

Antes: `evidencias/antes-escritorio.png`, `evidencias/antes-movil.png`
Después: `evidencias/despues-escritorio.png`, `evidencias/despues-movil.png`
