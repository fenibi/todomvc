# Consulta de despliegue: taller-todo-manuel

Fecha: 2026-11-06

## Resultado

**El despliegue existe y está en estado `READY` (producción).** No falló, por lo que no hay logs de error que analizar.

| Dato | Valor |
|------|-------|
| Estado | `READY` |
| Proyecto | `taller-todo-manuel` (`prj_ATgfN98RsbOf3v6YvkYuBaiTDsWm`) |
| Equipo / cuenta | `ManuelR` (`manuel-r`), usuario `manuelgerrs-8287`, plan Hobby |
| Despliegue | `dpl_9SjcSwK1dE2sS81QQ7sfY6Tbxgc9` |
| Entorno | production, región `iad1`, origen `cli` |
| URL del despliegue | `taller-todo-manuel-4uaesfut2-manuel-r.vercel.app` |
| Alias | `taller-todo-manuel.vercel.app`, `taller-todo-manuel-manuel-r.vercel.app` (sin `aliasError`) |
| Commit desplegado | `d86df42c` en `feat/mruizsalva-redisenio`: "fix(ui): restore checkbox focus ring, toggle-all via keyboard and focus after delete/edit" |
| Protección | SSO activo (`all_except_custom_domains`); protección por contraseña desactivada |

## Herramientas usadas (Vercel MCP, solo lectura)

### Segunda consulta (resultado válido)

| # | Herramienta | Parámetros relevantes | Resultado |
|---|-------------|-----------------------|-----------|
| 1 | `list_projects` | sin filtro ni equipo | 1 proyecto: `taller-todo-manuel` |
| 2 | `get_project` | `idOrName=taller-todo-manuel` | Proyecto con 2 dominios; último despliegue `READY` |
| 3 | `get_deployment` | `idOrUrl=taller-todo-manuel.vercel.app`, `withGitRepoInfo=true` | `READY`, producción, commit `d86df42c` |
| 4 | `list_teams` | `limit=50` | 1 equipo: `ManuelR` |

`list_deployment_events` no se usó: con el despliegue en `READY` no hay fallo que investigar.

### Primera consulta (resultado inconsistente)

| # | Herramienta | Parámetros relevantes | Resultado |
|---|-------------|-----------------------|-----------|
| 1 | `get_auth_user` | — | Usuario `manuelgerrs-8287` |
| 2 | `list_teams` | — | 1 equipo: `ManuelR` |
| 3 | `list_projects` | `teamId` fijado, con y sin `search` | 0 proyectos |
| 4 | `get_deployment` | `idOrUrl=taller-todo-manuel.vercel.app`, `teamId` fijado | 404 `not_found` |
| 5 | `list_deployments` | `teamId` fijado, `limit=10` | 0 despliegues |

La primera consulta devolvió vacío para el mismo equipo donde la segunda sí encontró el proyecto. La causa no está determinada; no se verificó si fue un retraso de propagación de la API u otra cosa.

No se modificó ningún proyecto ni configuración. No se consultaron ni mostraron secretos.

## Observaciones

- Con SSO activo para los dominios `.vercel.app`, quien abra la URL sin sesión de Vercel puede ser redirigido a un login. No se probó abriendo la URL; es lo que indica la configuración del proyecto.
- El repositorio de origen informado por Vercel es `fenibi/todomvc`.
