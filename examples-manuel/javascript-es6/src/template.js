"use strict";

const htmlEscapes = {
    "&": "&amp",
    "<": "&lt",
    ">": "&gt",
    '"': "&quot",
    "'": "&#x27",
    "`": "&#x60",
};

const reUnescapedHtml = /[&<>"'`]/g;
const reHasUnescapedHtml = new RegExp(reUnescapedHtml.source);

const escape = (str) => str && reHasUnescapedHtml.test(str) ? str.replace(reUnescapedHtml, escapeHtmlChar) : str;
const escapeHtmlChar = (chr) => htmlEscapes[chr];

const createTodoItem = ({ id, title, completed, checked, index }) => `
<li data-id="${id}" class="${completed}">
    <div class="view">
        <input class="toggle" type="checkbox" id="toggle-${id}" aria-label="Complete" aria-labelledby="toggle-${id} todo-label-${id}" ${checked}>
        <label id="todo-label-${id}">${title}</label>
        <button type="button" class="edit-btn" id="edit-${id}" aria-label="Edit" aria-labelledby="edit-${id} todo-label-${id}">Edit</button>
        <button type="button" class="destroy" id="destroy-${id}" aria-label="Delete" aria-labelledby="destroy-${id} todo-label-${id}">Delete</button>
    </div>
</li>
`;

class Template {
    /**
     * Creates an <li> HTML string and returns it for placement in your app.
     *
     * NOTE: In real life you should be using a templating engine such as Mustache
     * or Handlebars, however, this is a vanilla JS example.
     *
     * @param {object} data The object containing keys you want to find in the
     *                      template to replace.
     * @returns {string} HTML String of an <li> element
     *
     * @example
     * view.show({
     *  id: 1,
     *  title: "Hello World",
     *  completed: 0,
     * })
     */
    show(data) {
        let view = "";

        data.reverse().forEach((item, index) => {
            view += createTodoItem({
                id: item.id,
                title: escape(item.title),
                completed: item.completed ? "completed" : "",
                checked: item.completed ? "checked" : "",
                index: index,
            });
        });

        return view;
    }

    /**
     * Builds the pagination controls (Prev, page numbers, Next).
     *
     * @param {number} current Zero-based index of the current page.
     * @param {number} total The total number of pages.
     * @returns {string} HTML String with the pagination buttons
     */
    pagination(current, total) {
        let view = `<button type="button" class="page-btn" data-page="${current - 1}" aria-label="Previous page" ${current === 0 ? "disabled" : ""}>Prev</button>`;

        for (let page = 0; page < total; page++) {
            const state = page === current ? "aria-current=\"page\"" : "";
            view += `<button type="button" class="page-btn" data-page="${page}" aria-label="Page ${page + 1}" ${state}>${page + 1}</button>`;
        }

        view += `<button type="button" class="page-btn" data-page="${current + 1}" aria-label="Next page" ${current === total - 1 ? "disabled" : ""}>Next</button>`;

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
        return `<strong>${activeTodos}</strong> item${plural} left`;
    }

    /**
     * Updates the text within the "Clear completed" button
     *
     * @param  {[type]} completedTodos The number of completed todos.
     * @returns {string} String containing the count
     */
    clearCompletedButton(completedTodos) {
        return completedTodos > 0 ? "Clear completed" : "";
    }
}

export default Template;
