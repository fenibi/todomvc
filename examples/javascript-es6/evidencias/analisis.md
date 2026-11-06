# analisis del proyecto

## referencia 1: Entrada

arhivo: src/index.html
linea: 13

claude indico que los todos se cargan en el input class="new-todo".

verificacion: revise el archivo y confirme que en la linea 13 existe el input indicado con el placeholder correspondiente con lo que se visualiza en la web, incluso tiene autofocus que coincide con el comportamiento

## referencia 2: Vinculo

archivo: view.js
lineas: 140-141

claude indico que el controlador registra newTodo (controller.js:11) y la view escucha change en ese input

verificacion: revise ambos archivos y se verifica que en controller se asocia la accion newTodo con el metodo addItem() y en view se registra un listener para el evento change sobre el campo newTodo, cuando se dispara un evento se ejecuta el callback recibido de controller, pasandole el valor del campo texto.

## Referencia 3: Validacion

arhcivo: controller.js
lineas: 56-58

claude indico que addItem descarta titulos vacios o hechos solo de espacios

verificacion: revise el metodo addItem y confirme que utiliza title.trim() para eliminar los espacios al principio y final del texto, si el resultado es una cadena vacia ejecuta return evitando asi que se cree la tarea

## referencia 4: Modelo

archivo: model.js
lineas: 17-26

claude indico que model.create arma { title: title.trim(), completed: false }

verificacion: revise el metodo create y confirme que genera un objeto newItem con el titulo sin espacios al inicio y final del texto y con el estado completed en false por defecto lo que crearia la tarea como pendiente

## referencia 5: Store

archivo: store.js
lineas: 102-110

claude indico que save sin id asigna id = uniqueID++, agrega la tarea y vuelve a serializar en memoryStorage (store.js:102-110)

verificacion: revise el metodo save y confirme que cuando no se proporciona un id, es decir cuando no se actualiza un todo sino que se esta creando un todo, se le asigna un id incremental mediante uniqueID++, luego se agrega la tarea al arreglo de todos utilizando push

## referencia 6: Callback

archivo: controller.js
lineas: 60-63

claude indica que se limpia el input con render("clearNewTodo") en view y llama a filter(true) en controller

verificacion: revise ambos archivos y confirme que depsues de guardar la tarea el controller ejecuta render que en la viw establece el valor del input como una cadena vacia y luego llama a filter que actualiza el contador y la lista segun el filtro activo

## referencia 7: Contadores y visibilidad

archivos: controller.js y views,js
lineas: controller: 157-168, views: 105-111 y 94-97

claude indica que \_updateCount actualiza el contador, el botón "Clear completed", el estado de toggle-all y si se muestran .main y .footer

verificacion: revise ambos archivos y confirme que updateCount obtiene las cantidades de tareas mediante model.getCount y utiliza view.render para actualizar los elementos de la interfaz. la view se encarga de mostrar el contador, actualizar el boton clear completed, definir el estado de toggle-all y mostrar u ocultar main y footer segun la cantidad de tareas

## referencia 8: Repintado

archivo: controller.js y views.js
lineas: controller: 174-188 y 34-50, views: 102-103

claude afirma que \_filter llama a show{All|Active|Completed} según la ruta. Eso termina en render("showEntries"), que reemplaza innerHTML de .todo-list

verificacion: revise ambos archivos y confirme que filter determina el filtro activo que se obtiene de la ruta y ejecuta dinamicamente el metodo correspondiente, los metodos consultan las tareas mediante model.read y envian resultados a view utilizando render. la view genera el html mediante this.template.show() y reemplaza el contenido del todo-list utilizando innerhtml

## referencia 9: HTML

archivos: template.js
lineas: 18-26 y 46-60

claude afirma que Template.show invierte el arreglo con reverse(), escapa el título y genera cada <li data-id class="completed?">

verificacion: revise el arhcivo y confirme que show utiliza reverse para invertir el orden de las tareas, para cada tarea llama createTodoItem, funciona a la que le envia el identificador, el tituo procesado mediante escape y el estado de completed, para luego generar un elemento li para cada item del arreglo, con la case completed cuando corresponda, un checkbox, titulo y boton para eliminar

## decisión a partir de las referencias

fuentes: referencia 9 (template.js, Template.show con reverse()) y referencia 8 (view.js, repintado de .todo-list con innerHTML)

decisión: conservar el orden invertido de la lista, con la tarea más nueva arriba. Al revisar el borrador de CLAUDE.md vi que el agente detectó que el código invierte el orden y lo planteó como duda, porque difiere de la especificación de TodoMVC, sin incluirlo en lo que había que conservar. Pedí agregarlo en "Comportamiento a conservar", porque es parte del comportamiento original y el rediseño no debe cambiarlo.

# hallazgos de la etapa de verificación

## referencia 10: Edición de tareas mediante teclado (K12)

archivos: src/template.js y src/view.js  
líneas: view.js:153 (evento dblclick)

error detectado: al crear una tarea y navegar hasta ella utilizando Tab, no es posible activar su edición mediante Enter o F2. Los únicos elementos que reciben foco dentro de cada tarea son la casilla de verificación y el botón de eliminar.

verificación: se comprobó que la edición se activa exclusivamente mediante el evento dblclick sobre la etiqueta del título, registrado en view.js. La etiqueta tiene tabindex="-1" y no existe un evento de teclado que permita iniciar la edición. Este comportamiento pertenece a la implementación original de TodoMVC y no fue introducido por los cambios visuales.

reproducción en el original: se repitió la prueba sobre TodoMVC sin rediseño (build del commit base ff43b02e) y falla igual: con Tab solo se alcanza la casilla y ni Enter ni F2 activan la edición. Detalle en verificacion.md, caso K12-O.

impacto: los usuarios que utilizan exclusivamente el teclado no pueden acceder a una de las funcionalidades principales de la aplicación. Esto representa un problema de accesibilidad relacionado con el criterio WCAG 2.1.1 (Teclado).

corrección sugerida: permitir que el título de cada tarea reciba foco mediante tabindex="0" en template.js y agregar en view.js un evento keydown que permita activar la edición con Enter o F2, reutilizando el controlador existente. También sería conveniente devolver el foco al título al finalizar o cancelar la edición y agregar un estilo :focus-visible para identificar visualmente el elemento seleccionado.

riesgos: incorporar el título al orden de tabulación agrega una parada adicional por tarea. También sería necesario comprobar que los nuevos eventos no interfieran con Enter para guardar ni Escape para cancelar la edición.

comprobación propuesta: navegar con Tab hasta el título de una tarea, presionar Enter o F2 y verificar que se active el modo de edición con el foco en el campo correspondiente. Luego comprobar que Enter guarde los cambios, Escape los cancele y el foco regrese al título.

estado: **fuera de alcance**. No se implementó la solución porque requiere modificar el manejo de eventos de la capa de vista, lo que excede las modificaciones visuales permitidas por la consigna del workshop.

## referencia 11: Marcar todas las tareas mediante teclado (K13)

archivos: src/index.html y src/view.js  
líneas: index.html:23-24 y view.js:147-150

error detectado: al navegar mediante Tab hasta la casilla "Mark all as complete" y presionar Espacio, la casilla cambia visualmente a marcada, pero las tareas continúan pendientes y el contador no se actualiza. Esto provoca una desincronización entre el estado visual del control y el estado real de las tareas.

verificación: se comprobó que view.js escucha el evento click sobre la etiqueta .toggle-all-label y ejecuta manualmente el clic sobre el input para notificar al controlador. Sin embargo, al utilizar Espacio directamente sobre la casilla, el evento no ejecuta el controlador. Además, en index.html la etiqueta utiliza for="toggle-all", pero el input correspondiente no tiene ese id. Ambos problemas pertenecen a la implementación original de TodoMVC.

reproducción en el original: se repitió la prueba sobre TodoMVC sin rediseño (build del commit base ff43b02e) y falla igual: con Espacio la casilla queda marcada, pero la tarea sigue pendiente y el contador en "1 item left". Detalle en verificacion.md, caso K13-O.

impacto: la funcionalidad de marcar todas las tareas no funciona correctamente mediante teclado y el control puede mostrar un estado diferente al de los datos. Esto afecta la accesibilidad y se relaciona con los criterios WCAG 2.1.1 (Teclado) y 4.1.2 (Nombre, función, valor).

corrección sugerida: agregar id="toggle-all" al input correspondiente en index.html para asociarlo correctamente con su etiqueta. En view.js, reemplazar el evento click de la etiqueta por un evento change sobre el input, notificando al controlador mediante el estado checked de la casilla. También sería necesario eliminar la llamada manual a input.click() para evitar que un mismo clic produzca dos cambios de estado.

riesgos: si se incorpora el evento change sin eliminar el manejador anterior, podrían producirse eventos duplicados que marquen y desmarquen las tareas en una misma interacción. Por este motivo, los cambios deben realizarse y comprobarse en conjunto.

comprobación propuesta: crear varias tareas pendientes, navegar hasta "Mark all as complete" y presionar Espacio. Verificar que todas las tareas cambien a completadas y que el contador muestre cero pendientes. Repetir la operación para comprobar que puedan volver a marcarse como pendientes. Realizar las mismas pruebas utilizando el mouse.

estado: **fuera de alcance**. No se implementó la solución porque requiere modificar el manejo de eventos de la capa de vista. Aunque se trata de un problema preexistente, se decidió documentarlo y proponer una solución sin modificar la lógica original, respetando las restricciones del workshop.

## conclusión de los hallazgos

Durante la revisión de accesibilidad y funcionamiento de TodoMVC se identificaron dos problemas preexistentes relacionados con la navegación mediante teclado: la imposibilidad de editar tareas sin utilizar el mouse y el funcionamiento incorrecto del control para marcar todas las tareas.

Ambos problemas fueron analizados y se identificaron posibles soluciones, junto con sus riesgos y procedimientos de comprobación. Sin embargo, **no se aplicaron las correcciones**, ya que requieren modificar el manejo de eventos de la aplicación y el objetivo del workshop es realizar mejoras visuales sin alterar la lógica y el comportamiento original de TodoMVC.

Se dejan documentados como limitaciones heredadas, fuera del alcance de este rediseño, para una futura etapa de mantenimiento o mejora de accesibilidad.
