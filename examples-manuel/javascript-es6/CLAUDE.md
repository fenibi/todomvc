# TodoMVC JavaScript ES6 — redesign workshop

## Goal and scope
Redesign the visual presentation of this vanilla JS TodoMVC app (workshop exercise).
Visual decisions are defined in a later stage; do not assume them here.

## Commands (package.json)
- `npm ci` — install dependencies
- `npm run dev` — opens the app for development. The config sets no port (`webpack.dev.js:7-9`), so pass `-- --port 7001 --host 127.0.0.1` (the README says 7001, but the config does not fix it)
- `npm run build` — produces the final version in `dist/`
- `npm run serve` — serves that final version on port 7002
There are no automated test or style-check commands (`package.json:11-13` lists only these three scripts).

## Relevant files
- `src/index.html` — page markup
- `src/app.css` — app styles (base styles come from `todomvc-app-css` and `todomvc-common`, imported in `src/app.js`)
- `src/template.js` — HTML strings for todo items, counter, clear button
- `src/view.js` — DOM access and event binding
- `src/controller.js`, `src/model.js`, `src/store.js` — logic; in-memory storage
- `webpack.*.js` — build config

## Existing conventions (observed)
- ES modules and classes; explicit MVC split
- 4-space indent, double quotes, semicolons
- JSDoc on most classes and methods; `_` prefix for private methods, `$` prefix for DOM refs
- Callback style, no promises

## Behavior to preserve
Add, toggle, toggle all, edit (dblclick, Enter, Escape, blur), delete, clear completed,
hash filters (#/, #/active, #/completed), "N item(s) left" counter,
main/footer hidden when empty. Data is in memory only (`src/store.js:6`) and resets on reload.

## Proposed rules for this workshop (not existing project rules)
- No framework migration; no new services, backends or storage.
- Keep the MVC structure and the behaviors above.
- Keep CSS selectors and `class`/`data-id` hooks used by `view.js`/`template.js`
  unless the change updates both sides.
- Make small changes; commit each coherent step.
- Verify every change (see below) before declaring it done.

## Verification
1. `npm run build` completes without errors.
2. `npm run dev -- --port 7001 --host 127.0.0.1`, then check in the browser
   (Playwright MCP, viewport 1280x800): add two todos, complete one, toggle all,
   edit, delete, clear completed, switch All/Active/Completed, reload.
   Recreate the test todos after every reload (nothing persists).
3. Save screenshots in `evidencias/`.
4. Check the browser console for new errors (known: 404 for `learn.json` and `favicon.ico`).
