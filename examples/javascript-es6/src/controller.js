const _sameName = (a, b) => a.localeCompare(b, "es", { sensitivity: "base" }) === 0;

/**
 * ¿Hay otro integrante con ese nombre? (sin distinguir mayúsculas ni tildes)
 */
const _nameTaken = (members, name, exceptId) => members.some((member) => member.id !== exceptId && _sameName(member.name, name));

class Controller {
    /**
     * Take a model & view, then act as controller between them
     * @param  {object} model   The model instance
     * @param  {object} view    The view instance
     * @param  {object} members The members instance
     */
    constructor(model, view, members) {
        this.model = model;
        this.view = view;
        this.members = members;
        this._pendingCompletion = null;

        this.view.bindCallback("newTodo", (item) => this.addItem(item.title, item.assignee));
        this.view.bindCallback("itemEdit", (item) => this.editItem(item.id));
        this.view.bindCallback("itemEditDone", (item) => this.editItemSave(item.id, item.title));
        this.view.bindCallback("itemEditCancel", (item) => this.editItemCancel(item.id));
        this.view.bindCallback("itemRemove", (item) => this.removeItem(item.id));
        this.view.bindCallback("itemToggle", (item) => this.toggleComplete(item.id, item.completed));
        this.view.bindCallback("itemCompletedBy", (item) => this.setCompletedBy(item.id, item.memberId));
        this.view.bindCallback("removeCompleted", () => this.removeCompletedItems());
        this.view.bindCallback("toggleAll", (status) => this.toggleAll(status.completed));
        this.view.bindCallback("completerConfirm", (memberId) => this.confirmCompletion(memberId));
        this.view.bindCallback("completerCancel", () => this.cancelCompletion());
        this.view.bindCallback("memberAdd", (name) => this.addMember(name));
        this.view.bindCallback("memberEdit", (member) => this.editMember(member.id, member.name));
        this.view.bindCallback("memberRemove", (member) => this.removeMember(member.id));

        this._renderMembers();
    }

    /**
     * Load & Initialize the view
     * @param {string}  '' | 'active' | 'completed'
     */
    setView(hash) {
        const route = hash.split("/")[1];
        const page = route || "";
        this._updateFilter(page);
    }

    /**
     * Event fires on load. Gets all items & displays them
     */
    showAll() {
        this.model.read((data) => this._showEntries(data));
    }

    /**
     * Renders all active tasks
     */
    showActive() {
        this.model.read({ completed: false }, (data) => this._showEntries(data));
    }

    /**
     * Renders all completed tasks
     */
    showCompleted() {
        this.model.read({ completed: true }, (data) => this._showEntries(data));
    }

    /**
     * An event to fire whenever you want to add an item. Simply pass in the event
     * object and it'll handle the DOM insertion and saving of the new item.
     */
    addItem(title, assignee) {
        if (title.trim() === "")
            return;

        this.model.create(title, assignee, () => {
            this.view.render("clearNewTodo");
            this._afterChange();
        });
    }

    /*
     * Triggers the item editing mode.
     */
    editItem(id) {
        this.model.read(id, (data) => {
            let title = data[0].title;
            this.view.render("editItem", { id, title });
        });
    }

    /*
     * Finishes the item editing mode successfully.
     */
    editItemSave(id, title) {
        title = title.trim();

        if (title.length !== 0) {
            this.model.update(id, { title }, () => {
                this.view.render("editItemDone", { id, title });
            });
        } else {
            this.removeItem(id);
        }
    }

    /*
     * Cancels the item editing mode.
     */
    editItemCancel(id) {
        this.model.read(id, (data) => {
            const title = data[0].title;
            this.view.render("editItemDone", { id, title });
        });
    }

    /**
     * Find the DOM element with given ID,
     * Then remove it from DOM & Storage
     */
    removeItem(id) {
        this.model.remove(id, () => this.view.render("removeItem", id));
        this._filter();
        this._renderMembers();
    }

    /**
     * Will remove all completed items from the DOM and storage.
     */
    removeCompletedItems() {
        this.model.read({ completed: true }, (data) => {
            for (let item of data)
                this.removeItem(item.id);
        });

        this._filter();
    }

    /**
     * Marca o desmarca una tarea. Una tarea completada siempre registra quién
     * la completó: si tiene responsable se usa ese; si es General, se pregunta.
     *
     * @param {number} id The ID of the element to complete or uncomplete
     * @param {boolean} completed The new completed state
     */
    toggleComplete(id, completed) {
        if (!completed) {
            this.model.update(id, { completed: false, completedBy: null }, () => this._afterChange());
            return;
        }

        this.model.read(id, (data) => {
            const { assignee, title } = data[0];

            if (assignee) {
                this.model.update(id, { completed: true, completedBy: assignee }, () => this._afterChange());
            } else {
                this.view.render("elementComplete", { id, completed: false });
                this._askCompleter({ id }, `«${title}» es una tarea General.`);
            }
        });
    }

    /**
     * Cambia quién completó una tarea ya completada
     */
    setCompletedBy(id, memberId) {
        this.members.findAll((members) => {
            // Solo integrantes que todavía existen; si no, se repinta la lista
            if (!members.some((member) => member.id === memberId)) {
                this._filter(true);
                return;
            }

            this.model.update(id, { completedBy: memberId }, () => this._renderMembers());
        });
    }

    /**
     * Will toggle ALL checkboxes' on/off state and completeness of models.
     * Si hay tareas General pendientes, primero pregunta quién las completó.
     */
    toggleAll(completed) {
        if (!completed) {
            this.model.read({ completed: true }, (data) => {
                for (let item of data)
                    this.model.update(item.id, { completed: false, completedBy: null });
            });

            this._afterChange();
            return;
        }

        this.model.read({ completed: false }, (data) => {
            const general = data.filter((item) => !item.assignee).length;

            if (general === 0) {
                this._completeAll(null);
                return;
            }

            const detail = general === 1
                ? "Hay 1 tarea General pendiente."
                : `Hay ${general} tareas General pendientes.`;
            this._askCompleter({ all: true }, `${detail} Las tareas con responsable se completan a su nombre.`);
        });
    }

    /**
     * Completa la tarea (o todas) que esperaba saber quién la completó
     */
    confirmCompletion(memberId) {
        const pending = this._pendingCompletion;
        this._pendingCompletion = null;

        if (!pending || !memberId) {
            this._filter();
            return;
        }

        if (pending.all)
            this._completeAll(memberId);
        else
            this.model.update(pending.id, { completed: true, completedBy: memberId }, () => this._afterChange());
    }

    /**
     * Cierra la pregunta sin completar nada
     */
    cancelCompletion() {
        this._pendingCompletion = null;
        this._filter();
    }

    /**
     * Agrega un integrante; avisa si el nombre está vacío o repetido
     */
    addMember(name) {
        name = name.trim();

        this.members.findAll((members) => {
            if (name === "") {
                this.view.render("memberError", { message: "Escribí un nombre para agregar a alguien.", field: "new" });
                return;
            }

            if (_nameTaken(members, name)) {
                this.view.render("memberError", { message: `Ya hay alguien llamado «${name}». Usá otro nombre, por ejemplo con la inicial del apellido.`, field: "new" });
                return;
            }

            this.members.create(name, () => {
                this.view.render("clearNewMember");
                this.view.render("memberError", { message: "" });
                this._afterChange();
            });
        });
    }

    /**
     * Cambia el nombre de un integrante; si el nombre no sirve, conserva el
     * anterior y avisa por qué
     */
    editMember(id, name) {
        name = name.trim();

        this.members.findAll((members) => {
            const current = members.find((member) => member.id === id);

            if (!current)
                return;

            let problem = "";

            if (name === "")
                problem = "El nombre no puede quedar vacío";
            else if (_nameTaken(members, name, id))
                problem = `Ya hay alguien llamado «${name}»`;

            if (problem) {
                this._renderMembers();
                this.view.render("memberError", { message: `${problem}; se mantuvo «${current.name}».` });
                return;
            }

            this.members.update(id, name, () => {
                this.view.render("memberError", { message: "" });
                this._afterChange();
            });
        });
    }

    /**
     * Un integrante solo se borra si no figura en ninguna tarea
     */
    removeMember(id) {
        this._usedMemberIds((used) => {
            if (used.has(id))
                return;

            this.members.remove(id, () => {
                this.view.render("memberError", { message: "" });
                this._afterChange();
            });
        });
    }

    _completeAll(memberId) {
        this.model.read({ completed: false }, (data) => {
            for (let item of data)
                this.model.update(item.id, { completed: true, completedBy: item.assignee || memberId });
        });

        this._afterChange();
    }

    _askCompleter(target, detail) {
        this._pendingCompletion = target;
        this._updateCount();
        this.members.findAll((members) => this.view.render("askCompleter", { detail, members }));
    }

    _afterChange() {
        this._filter(true);
        this._renderMembers();
    }

    _showEntries(items) {
        this.members.findAll((members) => this.view.render("showEntries", { items, members }));
    }

    _usedMemberIds(callback) {
        this.model.read((todos) => {
            const used = new Set();

            for (let todo of todos) {
                if (todo.assignee)
                    used.add(todo.assignee);

                if (todo.completedBy)
                    used.add(todo.completedBy);
            }

            callback(used);
        });
    }

    _renderMembers() {
        this.members.findAll((members) => {
            this._usedMemberIds((used) => this.view.render("members", { members, used }));
        });
    }

    /**
     * Updates the pieces of the page which change depending on the remaining
     * number of todos.
     */
    _updateCount() {
        this.model.getCount((todos) => {
            const completed = todos.completed;
            const visible = completed > 0;
            const checked = completed === todos.total;

            this.view.render("updateElementCount", todos.active);
            this.view.render("clearCompletedButton", { completed, visible });
            this.view.render("toggleAll", { checked });
            this.view.render("contentBlockVisibility", { visible: todos.total > 0 });
        });
    }

    /**
     * Re-filters the todo items, based on the active route.
     * @param {boolean|undefined} force  forces a re-painting of todo items.
     */
    _filter(force) {
        const active = this._activeRoute;
        const activeRoute = active.charAt(0).toUpperCase() + active.substr(1);

        // Update the elements on the page, which change with each completed todo
        this._updateCount();

        // If the last active route isn't "All", or we're switching routes, we
        // re-create the todo item elements, calling:
        //   this.show[All|Active|Completed]()
        if (force || this._lastActiveRoute !== "All" || this._lastActiveRoute !== activeRoute)
            this[`show${activeRoute}`]();

        this._lastActiveRoute = activeRoute;
    }

    /**
     * Simply updates the filter nav's selected states
     */
    _updateFilter(currentPage) {
        // Store a reference to the active route, allowing us to re-filter todo
        // items as they are marked complete or incomplete.
        this._activeRoute = currentPage;

        if (currentPage === "")
            this._activeRoute = "All";

        this._filter();

        this.view.render("setFilter", currentPage);
    }
}

export default Controller;
