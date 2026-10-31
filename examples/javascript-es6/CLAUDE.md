# TodoMVC JavaScript ES6 — taller de rediseño

## Objetivo y alcance
Rediseño visual de este ejemplo (rama `feat/fran3478-redisenio`).
- Decisiones visuales: pendientes, se definen en la etapa siguiente.
- Fuera de alcance: migrar a otro framework, agregar librerías de UI,
  backend, persistencia o servicios externos.

## Comandos (de package.json)
- `npm run dev` — servidor de desarrollo con HMR (sirve también ./dist).
- `npm run build` — build de producción en `dist/` (¡reescribe archivos versionados!).
- `npm run serve` — sirve `dist/` en http://localhost:7002.
- Tests e2e (desde la raíz del repo, requieren build previo):
  `npm test -- --env framework=javascript-es6`  ← a confirmar

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

## Cómo verificar
1. `npm run dev` y probar manualmente cada punto de "Comportamiento a conservar".
2. Capturar a viewport 1280×800 y comparar con `evidencias/referencia-1280x800.jpg`
   (guardar nuevas evidencias en `evidencias/`).
3. `npm run build` + tests e2e de la raíz.
