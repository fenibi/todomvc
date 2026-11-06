# Análisis del código: Entre Todos

## Crear una tarea: `controller.js`, función `create()`

El controlador recibe el título y el responsable de la tarea, verifica que el texto no esté vacío y llama al modelo para guardarla. Luego actualiza la vista.

## Integrantes: `members.js`, función `constructor()`

Los integrantes se inicializan desde una lista precargada y se administran en memoria durante la sesión. Los cambios no modifican la lista original.

---

## Ubicación exacta en el código

Nota agregada al guardar este análisis, después de revisar `src/` en el commit `929f8d43`. El comportamiento descrito arriba coincide con el código, pero los nombres de función y archivo no son exactamente esos:

- **Crear una tarea:** en `controller.js` la función se llama `addItem(title, assignee)` (línea 74).
  - Si `title.trim()` queda vacío, sale sin hacer nada.
  - Si no, llama a `this.model.create(title, assignee, …)`. El `create()` propiamente dicho está en `model.js:18`.
  - En el callback limpia el campo (`render("clearNewTodo")`) y llama a `_afterChange()`, que vuelve a dibujar las tareas y los integrantes.
- **Integrantes:** `members.js` solo exporta la lista precargada (Ana, Martín, Sofía, Lucas). El `constructor()` está en `members-model.js:8`.
  - Copia cada integrante de esa lista con `initialMembers.map((member) => ({ ...member }))`. Por eso agregar, editar o borrar integrantes no modifica la lista original.
  - Calcula el siguiente id a partir del mayor id existente.
