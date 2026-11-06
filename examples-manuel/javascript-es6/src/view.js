/* eslint no-invalid-this: 0, complexity:[2, 9] */
import { qs, qsa, $on, $parent, $delegate } from "./helpers";

const ENTER_KEY = 13;
const ESCAPE_KEY = 27;
const PAGE_SIZE = 5;

const _setFilter = (currentPage) => {
    qs(".filters .selected").className = "";
    qs(`.filters [href="#/${currentPage}"]`).className = "selected";
};

const _elementComplete = (id, completed) => {
    const listItem = qs(`[data-id="${id}"]`);

    if (!listItem)
        return;

    listItem.className = completed ? "completed" : "";

    // In case it was toggled from an event and not by clicking the checkbox
    qs("input", listItem).checked = completed;
};

const _editItem = (id, title) => {
    const listItem = qs(`[data-id="${id}"]`);

    if (!listItem)
        return;

    listItem.className = `${listItem.className} editing`;

    const input = document.createElement("input");
    input.className = "edit";
    input.setAttribute("aria-label", "Edit task");

    listItem.appendChild(input);
    input.focus();
    input.value = title;
};

const _editItemDone = (id, title) => {
    const listItem = qs(`[data-id="${id}"]`);

    if (!listItem)
        return;

    const input = qs("input.edit", listItem);
    listItem.removeChild(input);

    listItem.className = listItem.className.replace(" editing", "");

    qsa("label", listItem).forEach((label) => {
        label.textContent = title;
    });
};

/**
 * Returns keyboard focus to a row's Edit button after Enter or Escape closed
 * its edit field. Skipped when the row is gone (an empty title deletes it).
 * @param {HTMLElement} row The list item that was being edited.
 */
const _focusEditButton = (row) => {
    const button = row && row.isConnected ? qs(".edit-btn", row) : null;

    if (button)
        button.focus();
};

const _itemId = (element) => {
    const li = $parent(element, "li");
    return parseInt(li.dataset.id, 10);
};

/**
 * View that abstracts away the browser's DOM completely.
 * It has two simple entry points:
 *
 *   - bind(eventName, handler)
 *     Takes a todo application event and registers the handler
 *   - render(command, parameterObject)
 *     Renders the given command with the options
 */
export default class View {
    constructor(template) {
        this.template = template;

        this.$todoList = qs(".todo-list");
        this.$todoItemCounter = qs(".todo-count");
        this.$clearCompleted = qs(".clear-completed");
        this.$main = qs(".main");
        this.$footer = qs(".footer");
        this.$toggleAllInput = qs(".toggle-all");
        this.$toggleAll = qs(".toggle-all-label");
        this.$newTodo = qs(".new-todo");
        this.$addTodo = qs(".add-todo");
        this.$pagination = qs(".pagination");

        // Pagination state lives in the view: the full list received from the
        // controller (oldest first) and the zero-based index of the current page.
        this._entries = [];
        this._page = 0;
        this._currentFilter = null;

        $delegate(this.$pagination, ".page-btn", "click", (e) => this._goToPage(parseInt(e.target.dataset.page, 10)));

        this.render = this.render.bind(this);
        this.bindCallback = this.bindCallback.bind(this);
    }

    _clearCompletedButton(completedCount, visible) {
        this.$clearCompleted.innerHTML = this.template.clearCompletedButton(completedCount);
        this.$clearCompleted.style.display = visible ? "block" : "none";
    }

    /**
     * Paints the current page of the cached entries and its pagination controls.
     * The page index is clamped so it never points past the last page.
     */
    _renderPage() {
        const pages = Math.max(1, Math.ceil(this._entries.length / PAGE_SIZE));
        this._page = Math.min(Math.max(this._page, 0), pages - 1);

        // Newest first, the same order template.show produces. template.show
        // reverses its argument in place, so hand it the page in reverse.
        const start = this._page * PAGE_SIZE;
        const visible = this._entries.slice().reverse().slice(start, start + PAGE_SIZE);
        this.$todoList.innerHTML = this.template.show(visible.reverse());

        this.$pagination.hidden = pages <= 1;
        this.$pagination.innerHTML = pages > 1 ? this.template.pagination(this._page, pages) : "";
    }

    /**
     * Shows another page and keeps keyboard focus on its page button.
     * @param {number} page Zero-based page index.
     */
    _goToPage(page) {
        this._page = page;
        this._renderPage();

        const button = qs(`.page-btn[data-page="${this._page}"]`, this.$pagination);
        if (button)
            button.focus();
    }

    /**
     * Drops an entry and repaints. If the removed row held keyboard focus, focus
     * moves to the Delete button of the row now at the same position, or to the
     * new todo field when the list is empty, so it is never lost to the body.
     * @param {number} id The todo id.
     */
    _removeItem(id) {
        const hadFocus = this.$todoList.contains(document.activeElement);
        const index = Array.from(qsa("li", this.$todoList)).findIndex((li) => parseInt(li.dataset.id, 10) === id);

        this._entries = this._entries.filter((entry) => entry.id !== id);
        this._renderPage();

        if (!hadFocus)
            return;

        const rows = Array.from(qsa("li", this.$todoList));
        const next = rows[Math.min(Math.max(index, 0), rows.length - 1)];
        (next ? qs(".destroy", next) : this.$newTodo).focus();
    }

    /**
     * Finds a cached entry by id.
     * @param {number} id The todo id.
     * @returns {object|undefined} The cached entry, if any.
     */
    _findEntry(id) {
        return this._entries.find((entry) => entry.id === id);
    }

    // eslint-disable-next-line complexity
    render(viewCmd, parameter) {
        switch (viewCmd) {
            case "showEntries":
                this._entries = parameter.map((entry) => Object.assign({}, entry));
                this._renderPage();
                break;
            case "updateElementCount":
                this.$todoItemCounter.innerHTML = this.template.itemCounter(parameter);
                break;
            case "contentBlockVisibility":
                this.$main.style.display = this.$footer.style.display = parameter.visible ? "" : "none";
                break;
            case "toggleAll":
                this.$toggleAllInput.checked = parameter.checked;
                break;
            case "clearNewTodo":
                this.$newTodo.value = "";
                this._page = 0;
                break;
            case "removeItem":
                this._removeItem(parameter);
                break;
            case "setFilter":
                _setFilter(parameter);
                if (parameter !== this._currentFilter) {
                    this._currentFilter = parameter;
                    this._page = 0;
                    this._renderPage();
                }
                break;
            case "elementComplete":
                if (this._findEntry(parameter.id))
                    this._findEntry(parameter.id).completed = parameter.completed;
                _elementComplete(parameter.id, parameter.completed);
                break;
            case "editItem":
                _editItem(parameter.id, parameter.title);
                break;
            case "editItemDone":
                if (this._findEntry(parameter.id))
                    this._findEntry(parameter.id).title = parameter.title;
                _editItemDone(parameter.id, parameter.title);
                break;
            case "clearCompletedButton":
                this._clearCompletedButton(parameter.completed, parameter.visible, this.clearCompletedButton);
                break;
        }
    }

    bindCallback(event, handler) {
        switch (event) {
            case "newTodo":
                $on(this.$newTodo, "change", () => handler(this.$newTodo.value));
                $on(this.$addTodo, "click", () => {
                    handler(this.$newTodo.value);
                    this.$newTodo.focus();
                });
                break;
            case "removeCompleted":
                $on(this.$clearCompleted, "click", handler);
                break;
            case "toggleAll":
                // The label points at an id the input does not have, so a label click
                // is forwarded to the input. The input reports through "change",
                // which also covers Space on the focused input.
                $on(this.$toggleAll, "click", () => this.$toggleAllInput.click());
                $on(this.$toggleAllInput, "change", () => handler({ completed: this.$toggleAllInput.checked }));
                break;
            case "itemEdit":
                $delegate(this.$todoList, "li label", "dblclick", (e) => handler({ id: _itemId(e.target) }));
                $delegate(this.$todoList, ".edit-btn", "click", (e) => handler({ id: _itemId(e.target) }));
                break;
            case "itemRemove":
                $delegate(this.$todoList, ".destroy", "click", (e) => handler({ id: _itemId(e.target) }));
                break;
            case "itemToggle":
                $delegate(this.$todoList, ".toggle", "click", (e) => handler({ id: _itemId(e.target), completed: e.target.checked }));
                break;
            case "itemEditDone":
                $delegate(this.$todoList, "li .edit", "blur", function (e) {
                    if (!e.target.dataset.iscanceled) {
                        handler({
                            id: _itemId(e.target),
                            title: e.target.value,
                        });
                    }
                });
                $delegate(this.$todoList, "li .edit", "keypress", function (e) {
                    if (e.keyCode === ENTER_KEY) {
                        const row = $parent(e.target, "li");
                        e.target.blur();
                        _focusEditButton(row);
                    }
                });
                break;
            case "itemEditCancel":
                $delegate(this.$todoList, "li .edit", "keyup", (e) => {
                    if (e.keyCode === ESCAPE_KEY) {
                        const row = $parent(e.target, "li");
                        e.target.dataset.iscanceled = true;
                        e.target.blur();
                        handler({ id: _itemId(e.target) });
                        _focusEditButton(row);
                    }
                });
                break;
        }
    }
}
