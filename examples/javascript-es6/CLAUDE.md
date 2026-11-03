# TodoMVC – JavaScript ES6 (Webpack)

Etiquetas: **[existente]** = surge del código actual. **[taller]** = regla propuesta para este taller.

## Objetivo y alcance [taller]
Rediseño "Entre Todos": app de tareas para adultos que organizan su hogar,
limitado a esta carpeta. Incluye una extensión funcional acordada (integrantes y
responsables) sin cambiar el framework ni el almacenamiento en memoria.

### Decisiones acordadas [taller]
- Textos de la interfaz siempre en español (`lang="es"`).
- Integrantes: `src/members.js` trae la lista precargada. Desde un apartado en
  pantalla se pueden agregar, editar y borrar, en memoria durante la sesión
  (no se escribe `members.js` desde el navegador).
- Un integrante solo se puede borrar si no figura como responsable ni como
  "completada por" en ninguna tarea existente; si figura, solo se puede editar.
- Cada tarea tiene un responsable opcional; sin responsable queda como **General**.
- El selector de responsable va antes de `.new-todo` (crear sigue por `change`).
- Toda tarea completada debe registrar quién la completó (no puede ser General).
  Si tiene responsable, se propone ese por defecto y se puede cambiar.
  Al desmarcarla se limpia "completada por".
- "Marcar todas": si hay tareas General pendientes, pide quién las completó;
  las asignadas quedan completadas por su responsable.
- Accesibilidad: foco visible, etiquetas accesibles en todos los controles y
  sin desbordamiento horizontal a 375 px.
- Estética: notas en celeste y verde lima, tono familiar; texto oscuro sobre
  lima para mantener contraste.

## Comandos [existente: package.json]
- `npm run dev`    → servidor de desarrollo (webpack.dev.js; puerto no configurado, el README dice 7001)
- `npm run build`  → genera `dist/` (webpack.prod.js; copia `base.js` de todomvc-common)
- `npm run serve`  → sirve `dist/` en http://localhost:7002
- Tests e2e, desde la raíz `todomvc/` (ver `tests/README.md`):
  `npm run server` y luego `npx cypress run --env framework=javascript-es6`.
  Cypress prueba `dist/` (`cypress/e2e/spec.cy.js:45`): construir antes.

## Archivos relevantes [existente]
- `src/index.html` – marcado estático (header, main, footer, filtros)
- `src/app.css` – todos los estilos de "Entre Todos"
- `src/members.js` – lista inicial de integrantes; `src/members-model.js` – integrantes en memoria
- `src/app.js` – punto de entrada; importa los CSS y arma el MVC
- `src/view.js` – único módulo que toca el DOM
- `src/template.js` – HTML de cada `<li>`, contador y botón "Clear completed"
- `src/controller.js`, `src/model.js`, `src/store.js`, `src/helpers.js`
- Estilos base: `todomvc-common/base.css` (en `node_modules`)

## Convenciones observadas [existente]
- MVC explícito: la View se usa solo vía `render(cmd, param)` y `bindCallback(event, handler)`.
- Clases ES6 con `export default`; helpers `qs`, `qsa`, `$on`, `$delegate`, `$parent`.
- JS con 4 espacios y comillas dobles; algunas líneas con tabs (`src/index.html`, `webpack.prod.js`).
- JSDoc en los métodos.
- Títulos escapados en `template.js` antes de insertarse como HTML.
- Almacenamiento en memoria: los datos no persisten al recargar.

## Comportamiento a conservar [taller, basado en el código existente]
- Selectores y clases que usa el JS: `.new-todo`, `.todo-list`, `.todo-count`,
  `.clear-completed`, `.main`, `.footer`, `.toggle-all`, `.toggle-all-label`,
  `.filters a[href="#/..."]`, `.toggle`, `.destroy`, `.edit`, `li[data-id]`,
  y las clases de estado `.completed`, `.editing`, `.selected`.
- Crear tarea (ignora vacías, aplica trim), marcar/desmarcar, marcar todas,
  editar con doble clic (Enter o blur guarda, Esc cancela, texto vacío elimina),
  borrar, limpiar completadas, filtros `#/`, `#/active`, `#/completed`,
  contador con singular/plural.
- Ocultar `.main` y `.footer` cuando no hay tareas.

## Cómo verificar cambios [taller]
1. `npm run build` sin errores.
2. `npm run serve` y revisar a mano cada comportamiento de la lista anterior.
3. Correr Cypress para `javascript-es6` y comparar con una corrida previa al cambio
   (puede haber fallos preexistentes: persistencia y orden de la lista).
   Los tests que buscan textos en inglés fallarán por la traducción acordada;
   cualquier otro test que antes pasaba debe seguir pasando.
4. Recorrido solo con teclado (foco visible) y viewport de 375 px con
   `document.documentElement.scrollWidth <= 375`.

## Límites [taller]
- No migrar a otro framework ni agregar librerías de UI.
- No agregar backend, APIs ni servicios externos.
- No editar `node_modules/` ni `dist/` a mano.
- No cambiar el modelo de almacenamiento sin acordarlo (`store.js` no se modifica;
  las tareas solo suman los campos `assignee` y `completedBy`).
- Estilos: `todomvc-app-css` ya no se importa; todo el diseño vive en `src/app.css`
  (se mantiene `todomvc-common/base.css`).
