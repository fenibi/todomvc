# Despliegue en Vercel — practica_ia

- **Fecha de la consulta:** 2026-11-03
- **Objetivo:** localizar el proyecto `practica_ia` en la cuenta personal y consultar el despliegue `https://practica-cm8oe0966-fran3478s-projects.vercel.app`.
- **Alcance:** solo consultas de lectura. No se modificó ningún proyecto, despliegue, dominio ni variable de entorno.

## Herramientas usadas y resultado

| # | Herramienta (Vercel MCP salvo indicación) | Parámetros | Resultado |
|---|---|---|---|
| 1 | `list_teams` | — | Un solo equipo: **Fran3478's projects**, slug `fran3478s-projects`, id `team_OyxPnDWv1rlRgzSSZAbJ8EU9`. Es el ámbito personal de la cuenta. |
| 2 | `list_projects` | `teamId` del paso 1, `search: "practica"` | Un proyecto: **`practica_ia`**, id `prj_R5Ko3P2AC596Ej26O05RE4u6ViMZ`. |
| 3 | `get_deployment` | `idOrUrl: practica-cm8oe0966-fran3478s-projects.vercel.app`, `withGitRepoInfo: true` | Ver la sección "Estado del despliegue". |
| 4 | `list_deployment_events` | id del despliegue, `builds: 1`, `limit: 60` | 12 eventos de build, sin errores ni advertencias. Ver la sección "Logs de build". |
| 5 | `list_deployment_files` | id del despliegue | 28 archivos, todos dentro de una carpeta `src/`. Ver "Contenido publicado". |
| 6 | `curl` (Bash, solo lectura) | `GET /`, `/src/`, `/src/index.html` | Las tres rutas responden **302** hacia `https://vercel.com/sso-api?...`: el despliegue está protegido por Vercel Authentication. |

No se usó `web_fetch_vercel_url`, porque crea un enlace para compartir temporal (23 h) que cambia el acceso al despliegue; requiere autorización explícita.

## Estado del despliegue

| Campo | Valor |
|---|---|
| Estado | **READY** (`state` y `readyState`) |
| Proyecto | `practica_ia` (`prj_R5Ko3P2AC596Ej26O05RE4u6ViMZ`) |
| URL | `https://practica-cm8oe0966-fran3478s-projects.vercel.app` |
| Id del despliegue | `dpl_E3pA4ywjtmSkLmQXeecG24uZPTP4` |
| Entorno | `production` |
| Alias | `project-brg6s.vercel.app`, `practicaia-fran3478s-projects.vercel.app` (`aliasError: null`) |
| Origen | `cli` (subido con Vercel CLI, no desde una integración de Git) |
| Creador | `fran3478` |
| Región | `iad1` |
| Framework | ninguno (`null`) |
| Metadatos de Git | rama `feat/fran3478-redisenio`, commit `93c0836e` ("Add CLAUDE.md for javascript-es6 redesign workshop"), repo `fenibi/todomvc` |
| Duración | ~1,5 s desde el inicio del build hasta `READY` |

**El despliegue no falló**, así que no hubo causa de error que investigar.

## Logs de build (resumen)

Ejecución en `iad1` con 2 núcleos y 8 GB, sin caché previa. Se descargaron 28 archivos, se ejecutó `vercel build` (Vercel CLI 65.4.0), el build terminó en 53 ms en `/vercel/output`, luego "Deploying outputs…" y "Deployment completed". El caché se omitió por no haber archivos preparados. No hubo líneas de error ni de advertencia. No se ejecutó `npm install` ni `npm run build`: se publicaron archivos ya compilados.

## Contenido publicado

Los 28 archivos son una compilación de producción del rediseño QuestLog: `index.html`, `app.bundle.js` (+ `.map`), `app.css` (+ `.map`), `base.js`, 20 SVG y 2 PNG con nombres hasheados. Los hashes coinciden con la compilación local del rediseño: `de1d2d77f094acb6b00d.svg` es `book.svg`, `66ffd019f6f53918ed2b.png` es `castle.png` y `95975bb65eed69368b95.png` es `dragon.png`.

## Verificación de la URL de producción (segunda consulta)

La URL consultada al principio es la **URL única del despliegue**. La URL de producción es **`https://project-brg6s.vercel.app`**.

| # | Herramienta | Parámetros | Resultado |
|---|---|---|---|
| 7 | `curl` (Bash, solo lectura) | `GET /`, `/src/` y `/src/index.html` en los dos alias | `project-brg6s.vercel.app/` → **200** `text/html`; `/src/` y `/src/index.html` → **404**. `practicaia-fran3478s-projects.vercel.app` → 302 al inicio de sesión de Vercel en las tres rutas. |
| 8 | `curl` (Bash, solo lectura) | HTML de `/` y recursos | El HTML es el rediseño QuestLog completo (incluye `aria-label="What needs to be done?"` y `.desk-scene`). `app.css`, `app.bundle.js`, `base.js`, `de1d2d77f094acb6b00d.svg` (libro) y `66ffd019f6f53918ed2b.png` (castillo) → **200**. Cabeceras: `Server: Vercel`, `X-Vercel-Cache: HIT`. |
| 9 | `get_deployment` | `idOrUrl: project-brg6s.vercel.app` | Resuelve al **mismo despliegue** `dpl_E3pA4ywjtmSkLmQXeecG24uZPTP4`, `production`, `READY`. |
| 10 | `get_project` | `prj_R5Ko3P2AC596Ej26O05RE4u6ViMZ` | `latestDeployment` = ese mismo despliegue (`production`, `READY`). Dominios: `project-brg6s.vercel.app` y `practicaia-fran3478s-projects.vercel.app`. Protección: `ssoProtection` activa con `deploymentType: all_except_custom_domains`; contraseña desactivada. |

**Conclusión:** `https://project-brg6s.vercel.app` es la URL de producción correcta. La dirección principal **no da 404**: responde 200 y sirve la app con todos sus recursos. La URL `practica-cm8oe0966-…` es la del despliegue concreto y, como la otra URL generada (`practicaia-fran3478s-projects…`), queda detrás de Vercel Authentication. `project-brg6s.vercel.app` es pública porque la protección cubre todo excepto los dominios asignados al proyecto (`all_except_custom_domains`).

## Observaciones

1. **Corregido: la app no está en `/src/`.** En la primera consulta inferí, por el árbol de `list_deployment_files`, que los archivos quedaban bajo `/src/` y que `/` daría 404. La verificación lo desmiente: `/` responde 200 y `/src/` 404. El nombre `src` en ese listado corresponde a la carpeta de origen de la subida, no a la ruta publicada.
2. **Commit asociado (resuelto).** En la primera consulta los metadatos de Git apuntaban a `93c0836e` (solo CLAUDE.md), porque el rediseño todavía no tenía commit cuando se subió con la CLI. El despliegue final (`dpl_9BWy…`, ver la sección siguiente) quedó asociado a `41d38890`, que ya contiene el rediseño y está en GitHub.
3. **Acceso.** La URL de producción es pública. Las URL generadas por Vercel (la del despliegue y `practicaia-fran3478s-projects…`) requieren iniciar sesión. No se creó ningún enlace para compartir ni se cambió la protección.

## Publicación final con el video (2026-11-06)

El video regrabado (72,4 s) se publicó con `npm run build`, la copia a `dist/evidencias/recorrido.webm` y `npx vercel@65.8.0 dist --prod`. Después se verificó con estas consultas de solo lectura:

| # | Herramienta | Parámetros | Resultado |
|---|---|---|---|
| 11 | `list_deployments` | `projectId` de `practica_ia`, `limit: 4` | Tres despliegues, todos `READY` en producción. El más nuevo es `dpl_9BWyNs7hzWm9hKPtqTSu7swnhW1n` (2026-11-06 17:09 UTC, commit `41d38890`). |
| 12 | `get_deployment` | `idOrUrl: project-brg6s.vercel.app` | Resuelve a `dpl_9BWyNs7hzWm9hKPtqTSu7swnhW1n`: `READY`, `production`, origen `cli`, alias `project-brg6s.vercel.app` y `practicaia-fran3478s-projects.vercel.app`, `aliasError: null`. |
| 13 | `list_deployment_files` | `dpl_EXb9Jc15HNiUV9q9ZqzPiskALQFx` (versión grabada) y `dpl_9BWyNs7hzWm9hKPtqTSu7swnhW1n` (final) | Mismos hashes en `index.html`, `app.css`, `app.bundle.js`, `base.js` y los 22 recursos. Solo cambia `evidencias/recorrido.webm`: `e9ef8133…` (video anterior) → `0b648443…` (video nuevo). |
| 14 | `curl` (Bash, solo lectura) | `GET /`, `/evidencias/recorrido.webm` y archivos de la app en `project-brg6s.vercel.app` | `/` → 200 `text/html`. Video → 200 `video/webm`, 9 709 740 bytes, SHA-1 `0b648443133ae07d4299237be6e4c57a85cd4255`, igual al archivo local. `index.html`, `app.css` y `app.bundle.js` tienen el mismo SHA-1 que el `dist/` local. |

**Conclusión:** la publicación final es `dpl_9BWyNs7hzWm9hKPtqTSu7swnhW1n`. Tiene la misma app que la versión grabada (`dpl_EXb9…`) y solo agrega el video nuevo, que se reproduce desde la URL pública. El flujo básico repetido sobre esta publicación con Playwright está en `verificacion.md` (P1–P4).

## Datos sensibles

No se consultaron ni se registraron variables de entorno, tokens ni secretos. Los `nonce` de las redirecciones al inicio de sesión se omitieron.
