module TK {
    export type RObjectId = number

    /**
     * Returns the id of an object
     */
    export function rid(obj: RObject | RObjectId): number {
        return (obj instanceof RObject) ? obj.id : obj;
    }

    /**
     * Referenced objects, with unique ID.
     * 
     * Objects extending this class will have an automatic unique ID, and may be tracked from an RObjectContainer.
     */
    export class RObject {
        readonly id: RObjectId = RObject._next_id++
        private static _next_id = 0

        postUnserialize() {
            if (this.id >= RObject._next_id) {
                RObject._next_id = this.id + 1;
            }
        }

        /**
         * Check that two objects are the same (only by comparing their ID)
         */
        is(other: RObject | RObjectId | null): boolean {
            if (other === null) {
                return false;
            } else if (other instanceof RObject) {
                return this.id === other.id;
            } else {
                return this.id === other;
            }
        }
    }

    /**
     * Container to track referenced objects
     */
    export class RObjectContainer<T extends RObject> {
        private objects: { [index: number]: T } = {}

        constructor(objects: T[] = []) {
            objects.forEach(obj => this.add(obj));
        }

        /**
         * Add an object to the container
         */
        add(object: T): T {
            this.objects[object.id] = object;
            return object;
        }

        /**
         * Remove an object from the container
         */
        remove(object: T): void {
            delete this.objects[object.id];
        }

        /**
         * Get an object from the container by its id
         */
        get(id: RObjectId): T | null {
            return this.objects[id] || null;
        }

        /**
         * Count the number of objects
         */
        count(): number {
            return this.list().length;
        }

        /**
         * Get all contained ids (list)
         */
        ids(): RObjectId[] {
            return this.list().map(obj => obj.id);
        }

        /**
         * Get all contained objects (list)
         */
        list(): T[] {
            return values(this.objects);
        }

        /**
         * Get all contained objects (iterator)
         */
        iterator(): Iterator<T> {
            return iarray(this.list());
        }
    }
}
