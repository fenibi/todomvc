Mi público es jóvenes y adultos de entre 18 y 35 años, principalmente aficionados a los videojuegos RPG, los juegos de rol y la fantasía medieval, así como estudiantes, desarrolladores y personas que buscan una forma entretenida y visualmente atractiva de organizar sus tareas personales, académicas o laborales.

La identidad que elegí es **QuestLog**, cuyo concepto es transformar visualmente las tareas cotidianas en misiones de aventura, bajo el eslogan "Convertí tus pendientes en aventuras". Su estilo es **skeuomorfismo medieval fantástico**, simulando un antiguo diario de explorador o libro de aventuras abierto sobre un escritorio de madera, con páginas de pergamino envejecido, encuadernación de cuero, ornamentos medievales, separadores decorativos, detalles metálicos y sellos de misiones completadas. La personalidad visual será aventurera, nostálgica, inmersiva y acogedora. La paleta incluye pergamino (#E8D5AC), pergamino claro (#F5E6C8), cuero oscuro (#2C2118), tinta sepia (#493222), dorado antiguo (#C49A46) y rojo lacre (#813F32). Las tipografías serán Cinzel para títulos y encabezados, y Lora para las tareas y el contenido general. Como parte de la ambientación, me gustaría incorporar sobre el escritorio una **lámpara de aceite antigua con una llama animada**, cuyo movimiento simule suavemente el parpadeo del fuego y proyecte una iluminación cálida y sutil sobre el entorno. Este elemento deberá ser visible al menos en pantallas grandes, integrarse naturalmente con la composición y no interferir con los controles ni la lectura. La animación deberá realizarse preferentemente con CSS, evitando dependencias innecesarias y respetando las preferencias de movimiento reducido del usuario.

Quiero mejorar **la jerarquía visual y organización**, transformando la interfaz en un diario de misiones con secciones claramente diferenciadas, una distribución que recuerde a un libro abierto y un uso coherente de espaciados, tipografías y ornamentos; **la claridad de estados y controles**, representando las tareas como misiones pendientes o cumplidas mediante casillas personalizadas, tachaduras, sellos y símbolos medievales, además de adaptar visualmente los campos, botones, filtros y contador de tareas; y **la adaptación móvil y legibilidad**, manteniendo la estética del diario medieval en diferentes resoluciones, utilizando una disposición de dos páginas en escritorio y una sola página en dispositivos móviles cuando resulte apropiado.

Proponé un plan breve para rediseñar este TodoMVC sin cambiar su lógica de negocio, almacenamiento en memoria ni framework. Indicá los archivos que tocarías, qué podría romperse y cómo lo comprobarías. No implementes todavía.

Conservá las funciones de crear, editar, completar, filtrar, eliminar y limpiar tareas completadas. Priorizá cambios de CSS y modificaciones mínimas de HTML, sin agregar funcionalidades ni dependencias innecesarias. Incluí navegación por teclado, foco visible, etiquetas accesibles y comprensibles, contraste adecuado, estados hover y focus claramente identificables y una versión responsive sin desbordamiento horizontal a 375 px. La ambientación medieval y las animaciones decorativas no deben comprometer la legibilidad, la accesibilidad, el rendimiento ni el funcionamiento original de la aplicación.

Plan de rediseño de QuestLog

Lo nuevo en esta versión: todos los textos visibles y accesibles quedan en inglés, y se agregan los aria-label en template.js. Lo demás se mantiene: Google Fonts, no se toca la lógica, lo que ya estaba roto queda igual y no se instala Cypress.

1. Archivos que tocaría

┌─────────────────┬─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┬────────────┐
│ Archivo │ Cambio │ ¿Toca │
│ │ │ lógica? │
├─────────────────┼─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┼────────────┤
│ src/index.html │ <head> con <link> a Google Fonts (Cinzel y eslogan nuevos; aria-label en .new-todo y │ No │
│ │ .toggle-all; <div class="desk-lamp" aria-hidden="true"> fuera de .todoapp. │ ───────────────┼─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┼────────────┤
│ src/template.js │ Solo dentro del texto de createTodoItem: aria-label="Mark quest as complete" en .toggle y aria-label="Delete quest" │ No │
│ │ en .destroy. Sin tocar clases, estructura ni funciones. │ │
├─────────────────┼────────────────────────────────────────────────────────────────────────────────────────┼────────────┤
│ src/app.css │ Todo el rediseño. Reemplaza el .toggle-graph, que no se usa. │ No │
├─────────────────┼────────────────────────────────────────────────────────────────────────────────────────┼────────────┤
│ CLAUDE.md │ Registrar la identidad visual, que todo el texto va en inglés y Google Fonts como excepción aprobada. │ — │
└─────────────────┴────────────────────────────────────────────────────────────────────────────────────────┴────────────┘

No cambian controller.js, model.js, store.js, view.js, package.json ni la configuración de webpack.
Textos, todos en inglés

┌─────────────────────────────────────┬───────────────────────────────────────────────────────────────────────┬─────────────────────────────────────┐
│ Elemento │ │ Cómo │
├─────────────────────────────────────┼───────────────────────────────────────────────────────────────────────┼─────────────────────────────────────┤
│ Marca │ QuestLog │ <p class="brand"> nuevo, encima del │
│ │ │ <h1> │
├─────────────────────────────────────┼──────────────────────────────────────────┼─────────────────────────────────────┤
│ Eslogan │ "Turn your tasks into adventures" (propuesta de traducción de │ <p class="tagline"> nuevo │
│ │ "Convertí tus pendientes en aventuras") │ │
├─────────────────────────────────────┼──────────────────────────────────────────┼─────────────────────────────────────┤h1> │ todos, sin cambios y visible, con estilo de rótulo de capítulo (❦ │ Lo exige spec.cy.js:482 │
│ │ todos ❦) │ │
├─────────────────────────────────────┼───────────────────────────────────────────────────────────────────────┼─────────────────────────────────────┤
│ Encabezado de la página izquierda │ "New Quest" │ Pseudoelemento CSS │
├─────────────────────────────────────┼───────────────────────────────────────────────────────────────────────┼─────────────────────────────────────┤
│ Encabezado de la página derecha │ "Quest Journal" │ Pseudoelemento CSS │
├─────────────────────────────────────┼───────────────────────────────────────────────────────────────────────┼─────────────────────────────────────┤
│ Campo, filtros, contador, "Clear │ Sin cambios │ Los verifican los tests o salen de │
│ completed" y pie │ │ template.js │
├─────────────────────────────────────┼──────────────────────────────────────────┼─────────────────────────────────────┤
│ aria-label │ "New quest", "Mark all quests as complete", "Mark quest as complete", │ Atributos │
│ │ "Delete quest" │ │
└─────────────────────────────────────┴──────────────────────────────────────────┴─────────────────────────────────────┘

lang="en" se mantiene.

> **Actualización posterior (2026-11-03):** los `aria-label` de esta tabla cambiaron durante la implementación y la verificación:
> - Campo nuevo: "New quest" → **"What needs to be done?"**, igual al texto visible (WCAG 2.5.3, caso F3 de `verificacion.md`).
> - Casillas y botón de borrar: "Mark quest as complete" / "Delete quest" → **"Complete quest: \<título\>"** / **"Delete quest: \<título\>"**, con `aria-labelledby` para que cada tarea tenga un nombre único.
> - "Mark all as complete" quedó igual al texto visible de su etiqueta.

3. Diseño técnico

- Escritorio (≥ 1024 px):
  - body sin el max-width: 550px, con fondo de madera hecho con gradientes.
  - .todoapp como libro abierto con dos columnas de grilla.
  - Página izquierda: marca, "todos", eslogan y campo de nueva misión.
  - Página derecha: .main y .footer.
  - Las páginas, el lomo y el cuero se dibujan en .todoapp y sus pseudoelementos, para que la página derecha no desaparezca cuando JS oculta .main y
    .footer (view.js:109).
- Móvil (< 1024 px): una sola página. A 375 px: sin ancho mínimo, filtros que bajan de línea y lámpara oculta.
- Estados:
  - Casilla de pergamino con marca de tinta.
  - Misión cumplida: tachado sepia y un sello de lacre estático, sin animación, porque la lista se repinta entera con innerHTML.
  - Filtro activo resaltado con .selected.
  - Hover y foco con anillo lacre (5.4:1). El dorado solo sobre cuero (6:1) o como decoración. Sobre pergamino tiene 1.8:1.
- Borrar: el botón pasa de display: none a opacidad 0. Se muestra con :hover o :focus-within, así se alcanza con Tab, y en pantallas táctiles queda
  siempre visible.
- Lámpara:
  - Se ve desde 1280 px, en el margen del escritorio.
  - La llama se anima con transform y opacity.
  - El halo es un radial-gradient con pointer-events: none.
  - Con prefers-reduced-motion la llama queda quieta.

4. Qué podría romperse

1. El layout por los estilos en línea: .main, .footer y .clear-completed reciben display desde JS. Por eso no les cambio el display en el CSS.
1. Los tests: se conservan todas las clases, la estructura deican. Los aria-label no afectan a los selectores.
1. "Marcar todas": su <label for> roto queda como está. Si lo arreglara, la lista se marcaría y desmarcaría en el mismo clic. Fuentes: sin red, caen a Georgia y serif.
1. Lo que ya estaba mal, que queda igual:
   - No se puede editar una tarea con teclado.
   - Probablemente "marcar todas" con Espacio no actualiza laue voy a confirmar al probar.
   - La suite e2e probablemente falla por el orden invertido.

   Lo voy a anotar, no arreglar.

1. Cómo lo comprobaría

1. Funciones: la lista de "Comportamiento a conservar" del CLAUDE.md, a mano, en tu pestaña con npm run dev. El servidor de 127.0.0.1:7001 hoy no responde; hay que levantarlo.
1. Teclado: recorrido completo con Tab, Shift+Tab, Espacio y Enter, con foco visible en cada control.
1. Capturas en evidencias/:
   - 1280 × 800, comparada con la de referencia.
   - 375 × 812, con scrollWidth <= 375.
   - Con movimiento reducido emulado.
1. Contraste: cálculo por cada par de colores, más Lighthouse de Chrome.
1. Build: npm run build para confirmar que compila, sin commitear dist/.
