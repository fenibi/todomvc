# TodoMVC JavaScript ES6 — taller de rediseño

## Objetivo y alcance
Rediseño visual de este ejemplo (rama `feat/fran3478-redisenio`).
- Identidad: **QuestLog**, diario de explorador abierto sobre un escritorio de
  madera (skeuomorfismo medieval). Eslogan: "Turn your tasks into adventures".
- Paleta: pergamino #E8D5AC, pergamino claro #F5E6C8, cuero #2C2118,
  tinta sepia #493222, dorado #C49A46 (solo decorativo o sobre cuero/madera:
  1.8:1 sobre pergamino), rojo lacre #813F32.
- Tipografías: Cinzel (marca y títulos), Lora (todo lo demás), vía Google Fonts
  (única excepción aprobada a "sin servicios externos").
- Todo el texto de la interfaz en inglés. El `<h1>` sigue siendo "todos" y
  visible (lo exige `cypress/e2e/spec.cy.js:482`); la marca va aparte.
- Referencia visual: libro abierto (izquierda: marca, dragón, castillo;
  derecha: estandarte, campo, tiras de pergamino por tarea, barra de filtros).
  Objetos sobre el escritorio y lámpara de aceite solo ≥1280px; la llama se
  anima con CSS y se detiene con `prefers-reduced-motion`.
- Recursos en `src/assets/` (solo se usan desde `app.css` como fondos
  decorativos): SVG dibujados a mano (estandarte, marcador, ornamentos,
  casillas, banderín, objetos, lámpara) y SVG generados (libro, tiras, campo,
  marco de página, papel, madera). `dragon.png` y `castle.png` son trazos de
  tinta extraídos de la imagen de referencia.
- Fuera de alcance: migrar a otro framework, agregar librerías de UI,
  backend, persistencia o servicios externos.

## Comandos (de package.json)
- `npm run dev` — servidor de desarrollo con HMR (sirve también ./dist).
- `npm run build` — build de producción en `dist/` (¡reescribe archivos versionados!).
- `npm run serve` — sirve `dist/` en http://localhost:7002.

## Archivos relevantes
- `src/index.html` — estructura y clases que usan view.js y los tests.
- `src/app.css` — único CSS propio; se carga después de todomvc-app-css.
- `src/template.js` — HTML de cada tarea y del contador.
- `src/view.js` — todo el acceso al DOM y los eventos.
- `src/controller.js`, `src/model.js`, `src/store.js` — lógica; no tocar en un rediseño visual.
- `node_modules/todomvc-app-css/index.css` — estilos base (no editar).

## Convenciones observadas (existentes)
- MVC explícito; solo View toca el DOM (`render`/`bindCallback`).
- Clases ES6 con `export default`; helpers como funciones flecha.
- Indentación de 4 espacios, comillas dobles, JSDoc en métodos públicos.
- `if` de una línea sin llaves.
- Eventos de la lista por delegación (`$delegate`) sobre `.todo-list`.

## Reglas propuestas para el taller
- No renombrar ni quitar las clases/selectores de los que dependen view.js
  y los tests: .new-todo, .todo-list, li[data-id], .toggle, .destroy, .edit,
  .editing, .completed, .toggle-all, .toggle-all-label, .todo-count, .filters
  a[href], .selected, .clear-completed, .main, .footer.
- Cambios de estilo en `src/app.css`; no editar node_modules.
- No commitear `dist/` regenerado salvo que se decida explícitamente.

## Comportamiento a conservar
- Agregar con Enter (input `change`); ignorar títulos vacíos; trim.
- Marcar/desmarcar, marcar todas, borrar, "Clear completed" (solo visible con completadas).
- Editar con doble clic; Enter/blur guarda; Escape cancela; título vacío borra.
- Filtros por hash: #/, #/active, #/completed con `.selected` en el activo.
- Contador "N item(s) left"; .main/.footer ocultos sin tareas.
- Orden invertido de la lista: la tarea más nueva arriba (`data.reverse()` en `template.js`).
- Escape de HTML en títulos.
- Almacenamiento en memoria (sin persistencia) — no cambiar.

## Limitaciones conocidas (previas, no corregir sin decisión explícita)
- `view.js` escribe `style.display` en `.main`, `.footer` y `.clear-completed`:
  no cambiar su `display` desde CSS. Por eso el pie usa `.footer-inner` como
  grilla y el libro se pinta en el fondo de `.todoapp`.
- `.header` usa `display: contents` para ubicar marca (página izquierda) y
  campo nuevo (página derecha) en la grilla del libro sin reordenar el DOM.
- La lista se repinta entera con `innerHTML`: no animar la entrada de `li`.
- Editar solo con doble clic (sin acceso por teclado).
- "Mark all as complete" con Espacio marca la casilla pero no las tareas
  (`view.js` solo escucha el clic en la etiqueta). No agregar `id="toggle-all"`:
  el `for` del label provocaría un doble toggle.
- Al eliminar una tarea el foco vuelve al `body`.

## Cómo verificar
1. `npm run dev` y probar manualmente cada punto de "Comportamiento a conservar".
2. Capturar a viewport 1280×800 y comparar con `evidencias/antes-escritorio.png`
   (guardar nuevas evidencias en `evidencias/`).
3. `npm run build` y repetir el flujo básico con Playwright MCP sobre la versión publicada.
