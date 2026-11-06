"use strict";

const htmlEscapes = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "`": "&#x60;",
};

const reUnescapedHtml = /[&<>"'`]/g;
const reHasUnescapedHtml = new RegExp(reUnescapedHtml.source);

const escape = (str) => str && reHasUnescapedHtml.test(str) ? str.replace(reUnescapedHtml, escapeHtmlChar) : str;
const escapeHtmlChar = (chr) => htmlEscapes[chr];

const memberName = (members, id) => {
    const member = members.find((item) => item.id === id);
    return member ? escape(member.name) : "";
};

const memberOptions = (members, selectedId) => members.map(({ id, name }) => {
    const selected = id === selectedId ? " selected" : "";
    return `<option value="${id}"${selected}>${escape(name)}</option>`;
}).join("");

const createOwner = (name) => name
    ? `<span class="todo-owner">Responsable: <strong>${name}</strong></span>`
    : `<span class="todo-owner tag-general">General</span>`;

const createCompletedBy = (id, members, completedBy) => `
            <span class="todo-done-by">
                <label for="completed-by-${id}">Completada por</label>
                <select id="completed-by-${id}" class="completed-by">${memberOptions(members, completedBy)}</select>
            </span>`;

const createTodoItem = ({ id, title, completed, checked, owner, completedBy }) => `
<li data-id="${id}" class="${completed}">
    <div class="view">
        <input class="toggle" type="checkbox" aria-labelledby="todo-title-${id}" ${checked}>
        <label class="todo-title" id="todo-title-${id}">${title}</label>
        <div class="todo-meta">
            ${owner}${completedBy}
        </div>
        <div class="todo-actions">
            <button class="edit-btn" type="button" id="edit-${id}" aria-labelledby="edit-${id} todo-title-${id}">Editar</button>
            <button class="destroy" type="button" id="destroy-${id}" aria-labelledby="destroy-${id} todo-title-${id}">Borrar</button>
        </div>
    </div>
</li>
`;

const createMemberItem = ({ id, name, used }) => `
<li data-member-id="${id}">
    <label class="visually-hidden" for="member-${id}">Nombre de ${name}</label>
    <input id="member-${id}" class="member-edit" value="${name}" autocomplete="off">
    ${used
        ? `<span class="member-note">En uso: solo se puede editar</span>`
        : `<button class="member-remove" type="button" aria-label="Borrar a ${name}">Borrar</button>`}
</li>
`;

class Template {
    /**
     * Creates an <li> HTML string and returns it for placement in your app.
     *
     * NOTE: In real life you should be using a templating engine such as Mustache
     * or Handlebars, however, this is a vanilla JS example.
     *
     * @param {object[]} data    The todos to render
     * @param {object[]} members The household members, to show their names
     * @returns {string} HTML String of an <li> element
     */
    show(data, members) {
        let view = "";

        data.reverse().forEach((item) => {
            view += createTodoItem({
                id: item.id,
                title: escape(item.title),
                completed: item.completed ? "completed" : "",
                checked: item.completed ? "checked" : "",
                owner: createOwner(memberName(members, item.assignee)),
                completedBy: item.completed ? createCompletedBy(item.id, members, item.completedBy) : "",
            });
        });

        return view;
    }

    /**
     * Displays a counter of how many to dos are left to complete
     *
     * @param {number} activeTodos The number of active todos.
     * @returns {string} String containing the count
     */
    itemCounter(activeTodos) {
        const plural = activeTodos === 1 ? "" : "s";
        return `<strong>${activeTodos}</strong> tarea${plural} pendiente${plural}`;
    }

    /**
     * Updates the text within the "Clear completed" button
     *
     * @param  {[type]} completedTodos The number of completed todos.
     * @returns {string} String containing the count
     */
    clearCompletedButton(completedTodos) {
        return completedTodos > 0 ? "Borrar completadas" : "";
    }

    /**
     * Opciones de integrantes para un <select>
     *
     * @param {object[]} members     The household members
     * @param {number|null} selected The member ID to preselect
     * @param {string} placeholder   Text for the empty first option
     * @returns {string} HTML String of <option> elements
     */
    memberOptions(members, selected, placeholder) {
        return `<option value="">${placeholder}</option>${memberOptions(members, selected)}`;
    }

    /**
     * Lista editable de integrantes
     *
     * @param {object[]} members The household members
     * @param {Set} used         IDs of members referenced by some todo
     * @returns {string} HTML String of <li> elements
     */
    memberList(members, used) {
        if (members.length === 0)
            return `<li class="member-empty">Todavía no hay integrantes. Agregá el primero.</li>`;

        return members.map(({ id, name }) => createMemberItem({ id, name: escape(name), used: used.has(id) })).join("");
    }
}

export default Template;
