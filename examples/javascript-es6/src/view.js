/* eslint no-invalid-this: 0, complexity:[2, 9] */
import { qs, qsa, $on, $parent, $delegate } from "./helpers";

const ENTER_KEY = 13;
const ESCAPE_KEY = 27;

const _setFilter = (currentPage) => {
    const selected = qs(".filters .selected");
    selected.className = "";
    selected.removeAttribute("aria-current");

    const current = qs(`.filters [href="#/${currentPage}"]`);
    current.className = "selected";
    current.setAttribute("aria-current", "page");
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
    input.setAttribute("aria-label", "Editar tarea");

    listItem.appendChild(input);
    input.focus();
    input.value = title;
};

const _editItemDone = (id, title) => {
    const listItem = qs(`[data-id="${id}"]`);

    if (!listItem)
        return;

    const input = qs("input.edit", listItem);
    const refocus = input.dataset.refocus;
    listItem.removeChild(input);

    listItem.className = listItem.className.replace(" editing", "");

    qs(".todo-title", listItem).textContent = title;

    // Si se terminó con Enter o Escape, el foco vuelve a "Editar" de la tarea
    // en vez de perderse en <body> junto con el campo que se quitó
    if (refocus)
        qs(".edit-btn", listItem).focus();
};

const _itemId = (element) => {
    const li = $parent(element, "li");
    return parseInt(li.dataset.id, 10);
};

const _memberId = (element) => {
    const li = $parent(element, "li");
    return parseInt(li.dataset.memberId, 10);
};

const _optionalId = (value) => value === "" ? null : parseInt(value, 10);

const _removeItem = (id, list, fallback) => {
    const elem = qs(`[data-id="${id}"]`);

    if (!elem)
        return;

    // También cuenta una edición vaciada y cerrada con Enter: el campo ya
    // perdió el foco, pero quien usa teclado sigue "dentro" de la tarea
    const hadFocus = elem.contains(document.activeElement) || !!qs(".edit[data-refocus]", elem);
    list.removeChild(elem);

    if (hadFocus)
        fallback.focus();
};

// Remember which control inside a re-rendered list had focus, so keyboard
// users don't lose their place when innerHTML is replaced.
const _focusState = (container, key) => {
    const active = document.activeElement;

    if (!active || active === container || !container.contains(active))
        return null;

    const li = $parent(active, "li");

    if (!li)
        return null;

    // selectionStart es null en controles que no son de texto
    const caret = typeof active.selectionStart === "number" ? [active.selectionStart, active.selectionEnd] : null;
    return { id: li.dataset[key], className: active.classList[0], caret };
};

const _restoreFocus = (container, state, attribute, fallback) => {
    if (!state)
        return;

    const li = qs(`[${attribute}="${state.id}"]`, container);
    const target = li && state.className ? qs(`.${state.className}`, li) : null;

    (target || fallback).focus();

    // Sin esto el cursor vuelve al principio del campo repintado
    if (target && state.caret && typeof target.selectionStart === "number")
        target.setSelectionRange(...state.caret);
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
        this.$assignee = qs(".assignee-select");
        this.$memberForm = qs(".member-form");
        this.$memberName = qs(".member-name");
        this.$memberList = qs(".member-list");
        this.$memberError = qs(".member-error");
        this.$completer = qs(".completer");
        this.$completerDetail = qs(".completer-detail");
        this.$completerSelect = qs(".completer-select");

        this.render = this.render.bind(this);
        this.bindCallback = this.bindCallback.bind(this);
    }

    _clearCompletedButton(completedCount, visible) {
        this.$clearCompleted.innerHTML = this.template.clearCompletedButton(completedCount);
        this.$clearCompleted.style.display = visible ? "" : "none";

        if (!visible)
            this._rescueFocus(this.$clearCompleted);
    }

    _contentBlockVisibility(visible) {
        this.$main.style.display = this.$footer.style.display = visible ? "" : "none";

        if (!visible) {
            this._rescueFocus(this.$main);
            this._rescueFocus(this.$footer);
        }
    }

    /**
     * Si el control con foco queda oculto, el foco pasa a "Nueva tarea"
     * para que quien usa teclado no quede en un elemento invisible
     *
     * @param {Element} hidden Elemento que se acaba de ocultar
     */
    _rescueFocus(hidden) {
        if (hidden.contains(document.activeElement))
            this.$newTodo.focus();
    }

    _showEntries(items, members) {
        const focus = _focusState(this.$todoList, "id");
        this.$todoList.innerHTML = this.template.show(items, members);
        _restoreFocus(this.$todoList, focus, "data-id", this.$newTodo);
    }

    _members(members, used) {
        const assignee = _optionalId(this.$assignee.value);
        const stillExists = members.some((member) => member.id === assignee);
        this.$assignee.innerHTML = this.template.memberOptions(members, stillExists ? assignee : null, "General");

        const focus = _focusState(this.$memberList, "memberId");
        this.$memberList.innerHTML = this.template.memberList(members, used);
        _restoreFocus(this.$memberList, focus, "data-member-id", this.$memberName);
    }

    /**
     * Muestra (o limpia, con mensaje vacío) el aviso del apartado Integrantes
     *
     * @param {string} message Texto del aviso
     * @param {string} [field] "new" si el problema está en "Nuevo integrante"
     */
    _memberError(message, field) {
        this.$memberError.textContent = message;

        if (message && field === "new")
            this.$memberName.setAttribute("aria-invalid", "true");
        else
            this.$memberName.removeAttribute("aria-invalid");
    }

    _askCompleter(detail, members) {
        this.$completerDetail.textContent = members.length > 0
            ? detail
            : `${detail} Primero agregá integrantes en el apartado Integrantes.`;
        this.$completerSelect.innerHTML = this.template.memberOptions(members, null, "Elegí a alguien");
        this.$completer.returnValue = "";
        this.$completer.showModal();
    }

    // eslint-disable-next-line complexity
    render(viewCmd, parameter) {
        switch (viewCmd) {
            case "showEntries":
                this._showEntries(parameter.items, parameter.members);
                break;
            case "updateElementCount":
                this.$todoItemCounter.innerHTML = this.template.itemCounter(parameter);
                break;
            case "contentBlockVisibility":
                this._contentBlockVisibility(parameter.visible);
                break;
            case "toggleAll":
                this.$toggleAllInput.checked = parameter.checked;
                break;
            case "clearNewTodo":
                this.$newTodo.value = "";
                break;
            case "clearNewMember":
                this.$memberName.value = "";
                break;
            case "removeItem":
                _removeItem(parameter, this.$todoList, this.$newTodo);
                break;
            case "setFilter":
                _setFilter(parameter);
                break;
            case "elementComplete":
                _elementComplete(parameter.id, parameter.completed);
                break;
            case "editItem":
                _editItem(parameter.id, parameter.title);
                break;
            case "editItemDone":
                _editItemDone(parameter.id, parameter.title);
                break;
            case "clearCompletedButton":
                this._clearCompletedButton(parameter.completed, parameter.visible);
                break;
            case "members":
                this._members(parameter.members, parameter.used);
                break;
            case "memberError":
                this._memberError(parameter.message, parameter.field);
                break;
            case "askCompleter":
                this._askCompleter(parameter.detail, parameter.members);
                break;
        }
    }

    bindCallback(event, handler) {
        switch (event) {
            case "newTodo":
                $on(this.$newTodo, "change", () => handler({
                    title: this.$newTodo.value,
                    assignee: _optionalId(this.$assignee.value),
                }));
                break;
            case "removeCompleted":
                $on(this.$clearCompleted, "click", handler);
                break;
            case "toggleAll":
                $on(this.$toggleAllInput, "change", () => {
                    handler({ completed: this.$toggleAllInput.checked });
                });
                break;
            case "itemEdit":
                $delegate(this.$todoList, "li .todo-title", "dblclick", (e) => handler({ id: _itemId(e.target) }));
                $delegate(this.$todoList, "li .edit-btn", "click", (e) => handler({ id: _itemId(e.target) }));
                break;
            case "itemRemove":
                $delegate(this.$todoList, ".destroy", "click", (e) => handler({ id: _itemId(e.target) }));
                break;
            case "itemToggle":
                $delegate(this.$todoList, ".toggle", "click", (e) => handler({ id: _itemId(e.target), completed: e.target.checked }));
                break;
            case "itemCompletedBy":
                $delegate(this.$todoList, ".completed-by", "change", (e) => handler({
                    id: _itemId(e.target),
                    memberId: _optionalId(e.target.value),
                }));
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
                        e.target.dataset.refocus = true;
                        e.target.blur();
                    }
                });
                break;
            case "itemEditCancel":
                $delegate(this.$todoList, "li .edit", "keyup", (e) => {
                    if (e.keyCode === ESCAPE_KEY) {
                        e.target.dataset.iscanceled = true;
                        e.target.dataset.refocus = true;
                        e.target.blur();
                        handler({ id: _itemId(e.target) });
                    }
                });
                break;
            case "completerConfirm":
                $on(this.$completer, "close", () => {
                    if (this.$completer.returnValue === "confirm")
                        handler(_optionalId(this.$completerSelect.value));
                });
                break;
            case "completerCancel":
                $on(this.$completer, "close", () => {
                    if (this.$completer.returnValue !== "confirm")
                        handler();
                });
                break;
            case "memberAdd":
                $on(this.$memberForm, "submit", (e) => {
                    e.preventDefault();
                    handler(this.$memberName.value);
                });
                break;
            case "memberEdit":
                $delegate(this.$memberList, ".member-edit", "change", (e) => {
                    const member = { id: _memberId(e.target), name: e.target.value };

                    // "change" llega antes de que Tab mueva el foco; si la lista se
                    // repinta en ese momento, el destino del Tab desaparece y el foco
                    // cae en <body>. Se espera a que el foco llegue a su destino.
                    setTimeout(() => handler(member), 0);
                });
                break;
            case "memberRemove":
                $delegate(this.$memberList, ".member-remove", "click", (e) => handler({ id: _memberId(e.target) }));
                break;
        }
    }
}
