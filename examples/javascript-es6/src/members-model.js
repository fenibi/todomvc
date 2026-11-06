import initialMembers from "./members";

/**
 * Lista de integrantes en memoria, inicializada desde members.js.
 * Usa callbacks, igual que Model y Store.
 */
class Members {
    constructor() {
        this._members = initialMembers.map((member) => ({ ...member }));
        this._nextId = Math.max(0, ...this._members.map((member) => member.id)) + 1;
    }

    /**
     * Devuelve una copia de todos los integrantes
     *
     * @param {function} callback The callback to fire with the members
     */
    findAll(callback) {
        if (!callback)
            return;

        callback(this._members.map((member) => ({ ...member })));
    }

    /**
     * Agrega un integrante
     *
     * @param {string} name The member's name
     * @param {function} [callback] The callback to fire after creating it
     */
    create(name, callback) {
        const member = { id: this._nextId++, name };
        this._members.push(member);

        if (callback)
            callback({ ...member });
    }

    /**
     * Cambia el nombre de un integrante
     *
     * @param {number} id The ID of the member to update
     * @param {string} name The new name
     * @param {function} [callback] The callback to fire after updating it
     */
    update(id, name, callback) {
        for (let member of this._members) {
            if (member.id === id) {
                member.name = name;
                break;
            }
        }

        if (callback)
            callback();
    }

    /**
     * Quita un integrante de la lista
     *
     * @param {number} id The ID of the member to remove
     * @param {function} [callback] The callback to fire after removing it
     */
    remove(id, callback) {
        this._members = this._members.filter((member) => member.id !== id);

        if (callback)
            callback();
    }
}

export default Members;
