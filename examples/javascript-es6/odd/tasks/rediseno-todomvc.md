# Feature: rediseno-todomvc

## Objective
Redesign the presentation of the javascript-es6 TodoMVC for students: modern, simple, restrained colors (no mascot). Add a create button, pagination, and per-task edit/complete/delete buttons; visible focus, accessible labels, no overflow at 375 px.

## Constraints
No change to business logic, in-memory storage or framework. Only `src/index.html`, `src/template.js`, `src/view.js`, `src/app.css`.

## Decisions
- Page size 5; UI text stays in English (project default).
- "Animalista" means simple and modern with calm colors, not a mascot (confirmed by the user). Teal accent over neutral greys.
- Keep `.toggle`, `.destroy`, `.edit`, `.new-todo`, `[data-id]` hooks; no `id` on the toggle-all input (view.js clicks it manually from the label).
- `contentBlockVisibility` now sets `display` to `""` instead of `"block"` so the footer flex layout is not overridden (same visible behavior).
- Complete control is the existing checkbox drawn as a circle; its name is exposed via aria-label/aria-labelledby ("Complete <title>"), not as visible text.

## TDD
Strict TDD requested, but the project has no test runner. Checks are Playwright MCP scenarios; no dependency added. No RED phase was recorded before the implementation (baseline screenshots only).

## Tasks
- [x] T1 Markup (`src/index.html`) — delegated writer
- [x] T2 Template (`src/template.js`) — delegated writer
- [x] T3 View (`src/view.js`) — delegated writer
- [x] T4 Styles (`src/app.css`) — delegated writer
- [x] T5 Verify — parent, Playwright MCP
- [x] T6 Restyle with the frontend-design skill (`src/app.css` only) — inline, one file, no delegation trigger fired. Concept: ruled notebook sheet (serif system stack, ink-blue accent, red margin line, blue rules, offset sheet edge). Focus ring changed to amber `#b45309`. Selectors and markup untouched. Evidence: `evidencias/estilo2-*.png`; 1280x800 flow (add by button x9, complete, edit focus, Escape, pagination, toggle-all, filters, clear completed) and 375 px (scrollWidth 360 <= 375). Console: only the known 404s. `npm run build` compiled; `dist/` discarded. Not verified: contrast ratios by tool, screen reader.

## Evidence
- Commit: `9595d208` feat(ui) — 4 files, 564 insertions, 28 deletions (above the ~400-line guide because `app.css` went from 20 lines to a full stylesheet).
- Baseline: `evidencias/antes-escritorio.png`, `evidencias/antes-movil.png` (scrollWidth 375 = innerWidth 375).
- After: `evidencias/despues-escritorio.png`, `despues-escritorio-paginado.png`, `despues-movil.png`, `despues-foco.png`.
- Delegation: writer trigger (4 non-trivial files).
- Observed at 1280x800: Add via button and Enter (no duplicates); 12 tasks → 3 pages, newest first; complete, Edit button (focus on edit input), Enter saves, Escape discards; Delete steps back a page when the last page empties; toggle-all, filters Active/Completed (pagination hidden when empty), Clear completed hides main/footer.
- Observed at 375x800 with 12 tasks and a very long unbroken title: scrollWidth 360 <= innerWidth 375, no element past the viewport.
- Accessibility snapshot: textbox "New task", buttons "Edit/Delete/Complete <title>", navigation "Pagination" with "Previous page", "Page N", "Next page".
- Focus: Tab reaches the Edit button with `:focus-visible`, outline solid 3px rgb(27, 95, 168), offset 2px.
- `npm run build` compiled successfully; the generated `dist/` changes were discarded (not committed).
- Console: only the known 404 for `learn.json` (and `favicon.ico`); no new errors.

## Not verified
- Contrast ratios were not measured with a tool (only designed for AA).
- Escape/Enter edge case of double blur (suspected in the first analysis) was not stressed.
- Screen reader output was checked only through the Playwright accessibility snapshot.

## Next step
User review of the screenshots; push and pull request remain the user's decision.
