# Verificación del despliegue publicado

Fecha: 2026-11-06

## Qué se grabó

- **URL exacta grabada:** `https://taller-todo-manuel.vercel.app/` (navegación final en `#/`, filtros en `#/active` y `#/completed`)
- **Despliegue de referencia (consulta previa con Vercel MCP):** `dpl_9SjcSwK1dE2sS81QQ7sfY6Tbxgc9`, producción, `READY`, commit `d86df42c` de `feat/mruizsalva-redisenio`. Ver `evidencias/despliegue.md`. En esta sesión no se volvió a consultar a qué despliegue apuntaba el alias durante la grabación.
- **Acceso:** la URL cargó directamente, sin pantalla de login. No se grabó ningún login ni secreto; los datos de prueba son tareas de ejemplo.
- **Video:** `E:\GestarCoop\Curso de AI\tododemo\todomvc\examples\javascript-es6\evidencias\recorrido.webm`

## Resultados del recorrido

Verificados con snapshots de accesibilidad mientras se actuaba (no se revisó visualmente el video cuadro a cuadro).

| # | Paso | Resultado observado |
|---|------|---------------------|
| 1 | Estado inicial (1280x800) | Switch "Dark mode", título "todos", campo "New task" y botón "Add". Sin lista ni footer de filtros |
| 2 | Crear "Comprar pan" y "Llamar al banco" | Ambas en la lista (la más nueva arriba); contador "2 items left" |
| 3 | Editar "Comprar pan" (botón Edit, Enter) | Pasó a "Comprar pan integral" |
| 4 | Completar "Llamar al banco" | Checkbox marcado; contador "1 item left"; aparece "Clear completed" |
| 5 | Filtro Active (`#/active`) | Solo "Comprar pan integral" |
| 6 | Filtro Completed (`#/completed`) | Solo "Llamar al banco" |
| 7 | Volver a All (`#/`) | Las 2 tareas |
| 8 | Móvil 390x844 | `scrollWidth` 390 = `innerWidth` 390: sin scroll horizontal; las 2 tareas presentes |

No se probaron en este recorrido: borrar, "toggle all", "Clear completed" ni recarga.

## Consola

2 errores, ambos 404 ya conocidos del proyecto: `/learn.json` y `/favicon.ico`. No aparecieron errores nuevos.

## Archivo de video

| Comprobación | Resultado |
|--------------|-----------|
| Existe | Sí, 963.255 bytes |
| Contenedor | WebM válido (cabecera EBML `1a45dfa3`) |
| Códec / tamaño | VP8, 1280x800, 25 fps |
| Duración | 32,72 s |
| Decodificación | Se transcodificó completo con el ffmpeg de Playwright sin errores (misma duración, 32,72 s) |

La duración es **menor a los 60-90 s pedidos**: se priorizó no agregar esperas artificiales, como se indicó. La grabación usa 1280x800 durante todo el video aunque el viewport pasó a 390x844 al final; la adaptación móvil se ve dentro de ese cuadro.

## Herramientas usadas

| Herramienta | Uso | Resultado |
|-------------|-----|-----------|
| `browser_resize` | 1280x800 inicial; 390x844 para móvil | OK |
| `browser_navigate` | Abrir la URL publicada | OK |
| `browser_start_video` | Ruta absoluta indicada, 1280x800 | Falló dos veces (falta ffmpeg); OK tras instalar la versión correcta |
| `browser_stop_video` | Cierre | OK; en dos llamadas intermedias solo limpió el estado "ya iniciado" tras un intento fallido y no escribió archivo |
| `browser_type`, `browser_click`, `browser_snapshot`, `browser_find` | Acciones y verificación | OK |
| `browser_evaluate` | Medir desbordamiento horizontal en móvil | OK |
| `browser_console_messages` | Errores de consola | 2 errores conocidos |

## Incidencia: ffmpeg

`browser_start_video` requería `ffmpeg-1011` en `%LOCALAPPDATA%\ms-playwright`. Un primer `npx playwright install ffmpeg` instaló `ffmpeg-1013` y `winldd-1007`, que el MCP no usa, porque `@playwright/mcp@0.0.83` trae su propio `playwright-core` (1.64.0-alpha). Se instaló la versión correcta con el `cli.js` de ese paquete (`install ffmpeg`), y quedó `ffmpeg-1011`. `ffmpeg-1013` y `winldd-1007` quedan en la caché sin uso; son inofensivos y se pueden borrar.
