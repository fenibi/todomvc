# Consulta del despliegue en Vercel

- **Fecha de la consulta:** 2026-11-03
- **Herramientas:** el MCP de Vercel, usado solo con herramientas de lectura, y `curl`, `md5sum` y `git` en la máquina local.
- **Cambios:** no se modificó nada en Vercel, ni en este proyecto ni en ningún otro.

## Resultado

| Dato | Valor |
|---|---|
| Estado | **READY**. El despliegue no falló, así que no hubo errores que analizar en los logs. |
| Proyecto | `taller-entre-todos` (`prj_5ap4xhl9p0c3B8DSaFBhmjVhobbR`) |
| Cuenta | Personal, `fvilla-7987` (`team_M9q3foXaOvtwq1XRWP1vaFuJ`, plan Hobby) |
| URL pública | https://taller-entre-todos.vercel.app, que es un alias de producción |
| URL del despliegue | https://taller-entre-todos-21yp8g33d-fvilla-7987.vercel.app |
| ID del despliegue | `dpl_JDea5w5dMLwmZfuf9oMwrsVwVjZA` |
| Entorno | `production`, región `iad1` |
| Creado | 2026-11-03 20:12:53 UTC, que es 17:12:53 en hora local |
| Origen | `cli`: se subió con la CLI de Vercel, no desde un push a GitHub |
| Panel | https://vercel.com/fvilla-7987/taller-entre-todos/JDea5w5dMLwmZfuf9oMwrsVwVjZA |

## Herramientas usadas y resultado

| # | Herramienta | Parámetros | Resultado |
|---|---|---|---|
| 1 | `mcp__vercel__get_auth_user` | (ninguno) | Usuario `fvilla-7987`, plan Hobby. Ámbito por defecto: `team_M9q3foXaOvtwq1XRWP1vaFuJ`. |
| 2 | `mcp__vercel__list_teams` | (ninguno) | Un solo ámbito, "fvilla-7987's projects" (`fvilla-7987`): es la cuenta personal. No hay equipos ajenos. |
| 3 | `mcp__vercel__list_projects` | `teamId` = cuenta personal, `search` = `taller-entre-todos` | Un proyecto: `taller-entre-todos` (`prj_5ap4xhl9p0c3B8DSaFBhmjVhobbR`). |
| 4 | `mcp__vercel__get_deployment` | `idOrUrl` = `taller-entre-todos.vercel.app`, `withGitRepoInfo` = true | El alias apunta a `dpl_JDea5w5dMLwmZfuf9oMwrsVwVjZA`. Estado `READY`, `target` = production, `aliasError` = null. Alias: `taller-entre-todos.vercel.app` y `taller-entre-todos-fvilla-7987.vercel.app`. |
| 5 | `mcp__vercel__list_deployments` | `projectId` = el del proyecto, `limit` = 10 | El proyecto tiene 1 solo despliegue, el mismo, en `READY` y marcado como candidato para rollback. No hay despliegues fallidos. |
| 6 | `mcp__vercel__list_deployment_events` | El ID del despliegue, `limit` = -1 | El log de build tiene 12 eventos y ningún error. Ver el resumen abajo. |

### Log de build (build `bld_mfbw9pdpx`)

1. El build corrió en iad1, en una máquina de 2 núcleos y 8 GB.
2. No había caché de builds anteriores.
3. Se descargaron 6 archivos del despliegue.
4. Se ejecutó `vercel build` con Vercel CLI 65.4.0.
5. El build terminó en `/vercel/output` en 35 ms.
6. El log cerró con "Deployment completed" y luego "Skipping cache upload because no files were prepared".

**Nota sobre stderr:** dos líneas salen por stderr ("Vercel CLI 65.4.0" y "Build Completed…"), pero son mensajes informativos de la CLI, no errores. En los logs no aparecen secretos ni variables de entorno.

## Comprobaciones locales (fuera del MCP)

| Comprobación | Resultado |
|---|---|
| `curl https://taller-entre-todos.vercel.app/` | HTTP 200, 3219 bytes, `text/html`, `<title>Entre Todos</title>` |
| `curl` de `app.bundle.js`, `app.css` y `base.js` | Los tres responden HTTP 200 |
| `md5sum` de lo publicado frente a `dist/` local | `index.html`, `app.bundle.js`, `app.css` y `base.js` son **idénticos** |
| ¿Incluye la corrección de foco de hoy? | Sí: el bundle publicado contiene `refocus` |

## Observaciones

- **El build no compiló nada en Vercel.** Se subieron los 6 archivos ya generados de `dist/`: `index.html`, `app.bundle.js`, `app.css`, `base.js` y sus dos `.map`. Lo publicado es el `dist/` local generado a las 16:52.
- **Los metadatos de Git no describen el código publicado:**
  - El despliegue dice commit `ff43b02` ("Revise README for 2.0.0", 2026-05-02), rama `feat/FvillaGit7-redisenio`, repo `fenibi/todomvc`.
  - Ese commit es el HEAD local, pero el rediseño no está commiteado: `git status` muestra `src/` y `dist/` modificados, y `members.js`, `members-model.js` y `CLAUDE.md` sin seguimiento.
  - Lo publicado sale del árbol de trabajo, no de ese commit. Si se vuelve a desplegar desde Git, no va a incluir el rediseño hasta que se commitee.
- **El build local borra el vínculo con Vercel:**
  - La CLI creó `dist/.vercel/` (con `project.json` y `README.txt`) y `dist/.gitignore`.
  - `webpack.common.js:17` usa `clean: true`, así que el próximo `npm run build` va a borrar `dist/.vercel/`.
  - Después de eso hay que volver a vincular con `vercel link` antes de desplegar desde `dist/`.

## Prueba funcional en producción (Playwright MCP, 2026-11-03)

- **Navegador:** Chromium, viewport de 1280 × 800.
- **Interacción:** clics y teclas reales, con selectores por etiqueta y por rol.
- **Datos:** todo vive en memoria del navegador, así que la prueba no deja datos guardados en el sitio.

| # | Entrada | Esperado | Observado | Resultado |
|---|---|---|---|---|
| P01 | Abrir https://taller-entre-todos.vercel.app y recargar | HTTP 200, título "Entre Todos", lista vacía | HTTP 200; título "Entre Todos"; 0 tareas; `.main` oculto | Aprobado |
| P02 | "Preparar taller" + Enter y "Revisar entrega" + Enter en "Nueva tarea" | 2 tareas General, campo vacío, contador "2 tareas pendientes" | `["Revisar entrega","Preparar taller"]`; 2 etiquetas General; campo ""; "2 tareas pendientes" | Aprobado |
| P03 | Clic en la casilla "Preparar taller"; en el diálogo elegir Ana y Confirmar | Se abre "¿Quién la completó?"; queda completada por Ana; contador "1 tarea pendiente" | Diálogo abierto; completadas `["Preparar taller"]`; casilla marcada; "Completada por" = Ana; "1 tarea pendiente" | Aprobado |
| P04 | Clic en el filtro "Pendientes" (Active) | Solo "Revisar entrega"; URL `#/active` | `["Revisar entrega"]`; `#/active`; `aria-current` en Pendientes | Aprobado |
| P05 | Clic en el filtro "Completadas" (Completed) | Solo "Preparar taller"; URL `#/completed` | `["Preparar taller"]`; `#/completed`; `aria-current` en Completadas | Aprobado |
| P06 | Clic en el filtro "Todas" (All) | Las 2 tareas; URL `#/` | 2 tareas; `#/`; `aria-current` en Todas | Aprobado |

**Resultado:** 6 de 6 casos aprobados.

**Errores durante la prueba:**

- **Errores de JavaScript:** 0.
- **Respuestas con error:** solo `404 /learn.json`, que pide `base.js` de todomvc-common. Es el mismo error que aparece en local.

**Captura:** `evidencias/produccion-escritorio.png`. La abrí y muestra el estado final: "Preparar taller" completada por Ana, "Revisar entrega" pendiente y el filtro Todas.

## Segundo despliegue: publicación final (consulta del 2026-11-03, después de grabar el video)

| Dato | Versión grabada | Publicación final |
|---|---|---|
| ID | `dpl_JDea5w5dMLwmZfuf9oMwrsVwVjZA` | `dpl_HG6qtXCRyhKeJ9vPe4xMX9a3ZzNL` |
| URL del despliegue | taller-entre-todos-21yp8g33d-fvilla-7987.vercel.app | taller-entre-todos-gz3xig4yl-fvilla-7987.vercel.app |
| Creado | 17:12:53, hora local | 17:32:06, hora local, después de la grabación de las 17:24 |
| Estado | READY | READY; tiene los alias `taller-entre-todos.vercel.app` y `taller-entre-todos-fvilla-7987.vercel.app` |
| Origen | `cli` | `cli`, con los mismos metadatos de Git (`ff43b02`) |

### Cómo se compararon

- **Herramienta:** se usó `mcp__vercel__list_deployment_files` sobre los dos despliegues. Vercel identifica cada archivo por su SHA-1, y los SHA-1 se compararon con `sha1sum` de `dist/`.
- **Archivos de la app:** `index.html` (`99e017b9…`), `app.bundle.js` (`746559fb…`), `app.css` (`ed49a2db…`) y `base.js` (`b29d85de…`) tienen el mismo SHA-1 en las dos versiones y en `dist/` local.
- **Lo que suma la publicación final:** solo `evidencias/recorrido.webm` (`4158da55…`), idéntico al video local.
- **URL pública del video:** https://taller-entre-todos.vercel.app/evidencias/recorrido.webm. Responde HTTP 200 `video/webm` con 7.144.395 bytes, y su MD5 coincide con el archivo local.

### Acceso a las URL propias de cada despliegue

Las URL del tipo `…-21yp8g33d-…` y `…-gz3xig4yl-…` responden `302` hacia el inicio de sesión de Vercel porque la protección de despliegues está activa. Solo el alias público es accesible sin iniciar sesión.

## Tercer despliegue: desde la rama del fork (2026-11-03)

Este despliegue reemplaza en producción a `dpl_HG6qtXCRyhKeJ9vPe4xMX9a3ZzNL`.

| Dato | Valor |
|---|---|
| ID | `dpl_8ikGwpAhNGuuh8b1mCPvfNaucL7V` |
| URL del despliegue | taller-entre-todos-pco2gtcfy-fvilla-7987.vercel.app |
| Origen | GitHub `FvillaGit7/todomvc`, rama `feat/FvillaGit7-redisenio`, commit `929f8d43` |
| Estado | READY, `target` = production, `aliasError` = null |
| Alias | `taller-entre-todos.vercel.app`, `taller-entre-todos-fvilla-7987.vercel.app` y `taller-entre-todos-git-feat-fvillagit7-redisenio-fvilla-7987.vercel.app` |

### Cómo se creó

- **Herramienta:** `mcp__vercel__create_deployment` con `gitSource` = GitHub `FvillaGit7/todomvc`, ref `feat/FvillaGit7-redisenio` y sha `929f8d43`, y `target` = production.
- **Configuración guardada en el proyecto:**
  - `rootDirectory` = `examples/javascript-es6/dist`, `outputDirectory` = `.`
  - `buildCommand` e `installCommand` vacíos
  - `framework` = null
- **Por qué sin build:** se publica el `dist/` commiteado tal cual. `npm run build` vaciaría `dist/` (`clean: true`) y se perdería el video, que no se regenera en el build.
- **Permiso:** el primer intento lo bloqueó el modo automático de Claude Code. El usuario eligió permitirlo y el segundo intento se ejecutó.

### Log de build (`bld_d0nfmzt16`)

- Clonó `github.com/FvillaGit7/todomvc` (rama `feat/FvillaGit7-redisenio`, commit `929f8d4`) en 18,3 s.
- `vercel build` terminó en 58 ms.
- Cerró con "Deployment completed".
- Sin errores. Las dos líneas de stderr son mensajes informativos de la CLI.

### Comprobación

- **Contenido:** `index.html`, `app.bundle.js`, `app.css`, `base.js` y `evidencias/recorrido.webm` responden HTTP 200 en la URL pública y su MD5 coincide con los archivos del commit (`git show 929f8d43:…`). El bundle incluye la corrección de foco (`refocus`).
- **Prueba funcional (Playwright MCP):**
  - Se crearon "Preparar taller" y "Revisar entrega".
  - "Preparar taller" quedó completada por Ana y el contador marcó "1 tarea pendiente".
  - El filtro Pendientes mostró `["Revisar entrega"]` y Completadas, `["Preparar taller"]`.
  - No hubo errores de JavaScript.
- **Metadatos de Git:** ahora coinciden con el código publicado, commit `929f8d43` del fork. Ya no aparece `ff43b02`.

## Conexión con el fork y prueba de punta a punta (2026-11-03, 19:44–19:45)

### Conexión

- El usuario conectó el proyecto a `FvillaGit7/todomvc` desde el panel de Vercel.
- **Verificación:** `mcp__vercel__list_projects` con `repoUrl` = `https://github.com/FvillaGit7/todomvc` devuelve `taller-entre-todos`. Con `repoUrl` = `https://github.com/fenibi/todomvc`, usado como control, no devuelve ningún proyecto.
- **Momento:** `updatedAt` del proyecto es 19:44:21.

### Prueba

- **Commit `af8ac036`:** nota de despliegue en `CLAUDE.md`, sin cambios en la app. Se subió al fork en la rama `feat/FvillaGit7-redisenio`.
- **Despliegue automático:** Vercel creó `dpl_7nV7WAqDd1tHDAb6mdMFX8Xgw6os` 6 s después del push, con `source` = `git` y el commit `af8ac036`.
- **Log de build (`bld_moof11w1b`):** clonó el fork en la rama y el commit correctos y ejecutó `vercel build` (610 ms). Estado final READY.
- **Corrección posterior:** en ese momento se infirió que, como no hubo instalación ni `npm run build`, se mantenía la configuración. Era **incorrecto**. Al conectar el repositorio, el directorio raíz se había reiniciado a la raíz del repo. Los 610 ms (contra 57–58 ms con la raíz correcta) eran la señal. Ver la sección siguiente.

### Resultado

| Comprobación | Resultado |
|---|---|
| Push → despliegue automático | **Funciona** |
| Rama de producción = `feat/FvillaGit7-redisenio` | **No.** El despliegue salió con `target` = null (preview) y solo con el alias `taller-entre-todos-git-feat-fvillagit7-redisenio-fvilla-7987.vercel.app`. La rama de producción sigue siendo otra, probablemente `master` |
| Web pública | Sin cambios: `taller-entre-todos.vercel.app` sigue sirviendo `dpl_8ikGwpAhNGuuh8b1mCPvfNaucL7V` (commit `929f8d43`); `index.html` y `app.bundle.js` coinciden con ese commit |
| Contenido del preview | No se pudo comprobar. Sus URL responden 302 hacia el inicio de sesión de Vercel y `list_deployment_files` no tiene el árbol de archivos de los despliegues desde Git (404) |

**Riesgo:** mientras la rama de producción sea `master`, un push a `master` del fork publicaría en `taller-entre-todos.vercel.app` el TodoMVC original sin el rediseño.

## Cambio de rama de producción, incidente y corrección (2026-11-03, 19:49–19:52)

### Cambio de rama

- El usuario cambió la rama de producción a `feat/FvillaGit7-redisenio` y lanzó un Redeploy.
- Resultado: `dpl_H5fUQYtW7M2qea6oExXgDd8XQf7S` (`source` = `redeploy`, commit `af8ac036`) salió en **producción** y tomó `taller-entre-todos.vercel.app`. Eso confirma que la rama de producción quedó bien.

### Incidente

- Ese despliegue servía la **raíz del repositorio**, no `examples/javascript-es6/dist`, porque el directorio raíz se había reiniciado al conectar Git.
- `/` mostraba el índice del sitio de TodoMVC (`<title>TodoMVC</title>`).
- `/app.bundle.js`, `/app.css`, `/base.js` y `/evidencias/recorrido.webm` respondían 404. La app solo existía en `/examples/javascript-es6/dist/…`.
- La web pública quedó rota desde las 19:49 hasta el rollback.

### Corrección (el usuario eligió rollback y corregir la raíz)

1. **`mcp__vercel__request_rollback`** a `dpl_8ikGwpAhNGuuh8b1mCPvfNaucL7V`. Verificado: `index.html`, `app.bundle.js`, `app.css`, `base.js` y el video volvieron a responder HTTP 200, idénticos al commit `929f8d43`.
2. **`mcp__vercel__update_project`:** `rootDirectory` = `examples/javascript-es6/dist`, `outputDirectory` = `.`, `buildCommand` e `installCommand` vacíos y `framework` = null.
3. **`mcp__vercel__create_deployment`** de `af8ac036` desde el fork, **sin** `projectSettings`, para usar la configuración guardada.
   - Resultado: `dpl_LpVcohzDGZJ7psV88xZNN4jWhjpg`, build de 57 ms y estado READY.
   - Después del rollback, Vercel no reasigna el dominio de producción automáticamente.
4. **`mcp__vercel__request_promote`** de `dpl_LpVcohzDGZJ7psV88xZNN4jWhjpg`. `get_deployment` sobre `taller-entre-todos.vercel.app` confirma que el dominio apunta a ese despliegue.

### Verificación final

- **Archivos:** los 5 (`index.html`, `app.bundle.js`, `app.css`, `base.js` y el video) responden HTTP 200 e idénticos a `af8ac036:examples/javascript-es6/dist/`. `/examples/javascript-es6/dist/index.html` responde 404: la raíz del repositorio ya no queda expuesta.
- **Prueba con Playwright en producción:** título "Entre Todos"; crear dos tareas, completar "Preparar taller" a nombre de Ana ("1 tarea pendiente") y los filtros Pendientes y Completadas dieron lo esperado. 0 errores de JavaScript.

### Prueba de despliegue automático (push de prueba, 19:54)

- **Commit:** `eb8dfea2`, vacío (`--allow-empty`, sin cambios de archivos), subido al fork en la rama `feat/FvillaGit7-redisenio`.
- **Despliegue:** Vercel creó `dpl_9sd8NnbpEVqh6cJVM4G5e4KA4tHz` 6 s después del push, con `source` = `git` y `target` = **production**.
- **Build (`bld_l2xem4irn`):** clonó el commit `eb8dfea` en 1,9 s; `vercel build` en 49 ms, consistente con la raíz `examples/javascript-es6/dist`. Estado READY.
- **Dominio:** sin promote manual, `taller-entre-todos.vercel.app` pasó solo a `dpl_9sd8…` (`get_deployment` sobre el dominio), con `aliasError` = null.
- **Contenido:** los 5 archivos (`index.html`, `app.bundle.js`, `app.css`, `base.js` y el video) responden HTTP 200 e idénticos a `eb8dfea2:examples/javascript-es6/dist/`. La raíz del repositorio no queda expuesta (404).
- **Playwright en producción:**
  - Título "Entre Todos".
  - "Preparar taller" quedó completada por Ana y el contador dice "1 tarea pendiente".
  - Pendientes muestra `["Revisar entrega"]` y Completadas, `["Preparar taller"]`.
  - 0 errores de JavaScript. En consola, solo los 404 de siempre (`learn.json` y `favicon.ico`).
- **Resultado:** el despliegue automático a producción funciona.

### Repositorio original y PR (2026-11-06)

- Con acceso de escritura a `fenibi/todomvc`, la rama `feat/FvillaGit7-redisenio` se subió a `origin` (`fenibi/todomvc`) y la rama local pasó a seguir `origin`. La PR se abre desde ahí contra `master`.
- **Intento de reconectar Vercel a `fenibi/todomvc`:** no fue posible.
  - `mcp__vercel__git_namespaces` lista solo la cuenta `FvillaGit7`.
  - `mcp__vercel__search_repo` con "todomvc" devuelve solo `FvillaGit7/todomvc`.
  - La app de GitHub de Vercel no está instalada en la cuenta `fenibi`, e instalarla corresponde a su dueño.
- **Decisión:** Vercel sigue conectado al fork, solo para desplegar. Cada push se manda a los dos remotos (`origin` para la PR, `fork` para Vercel).

## Lo que no se hizo

- No se consultaron logs de runtime: es un sitio estático sin funciones y el despliegue no falló.
- No se redesplegó nada ni se cambió ninguna configuración, dominio ni variable.
