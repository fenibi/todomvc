# Análisis: verificación de afirmaciones del CLAUDE.md

Las dos afirmaciones se comprobaron abriendo los archivos directamente, no a partir de un resumen.

## Fuente 1: los datos viven solo en memoria

- `src/store.js:6` — `let memoryStorage = {};` es un objeto JS a nivel de módulo.
- `src/store.js:20-26` — si no existe la colección, el constructor la crea vacía dentro de ese objeto.
- Contraste en vivo (Playwright, 30/10/2026): se creó una tarea, se recargó la página y la lista quedó vacía.


## Fuente 2: los comandos para usar el proyecto

- `package.json:11` — `dev`: abre la app en el navegador para trabajar en ella.
- `package.json:12` — `build`: genera la versión final en la carpeta `dist/`.
- `package.json:13` — `serve`: muestra esa versión final en el puerto 7002.
- No existen comandos para pruebas automáticas ni para revisar el estilo del código.
- `webpack.dev.js:7-9` — la configuración de `dev` no define ningún puerto. Por eso el `CLAUDE.md` indica agregar `-- --port 7001`.


## Decisión que depende de estas fuentes

**Decisión:** el rediseño no puede depender de datos persistentes. No se agrega almacenamiento (`localStorage` ni servicios), porque el `CLAUDE.md` lo excluye. Por eso:

1. Cada verificación visual recrea las tareas de prueba tras cada recarga ("Preparar taller" y "Revisar entrega", la primera completada, filtro All).
2. Las capturas de `evidencias/` se toman con ese mismo estado, para poder comparar antes y después.
3. Los comandos de verificación usan `npm run dev -- --port 7001 --host 127.0.0.1`, porque la configuración no fija puerto.

**Dependencia:** las decisiones 1 y 2 se apoyan en la Fuente 1. La decisión 3 se apoya en la Fuente 2.

## Pendiente (no comprobado)

- El puerto por defecto de `npm run dev` sin `--port`: se infiere que es 8080, pero no se probó.
- Errores 404 de `learn.json` y `favicon.ico`: se observaron en consola, pero no se leyó `todomvc-common/base.js` para confirmar el origen.
