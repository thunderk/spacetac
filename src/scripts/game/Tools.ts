module SpaceTac.Game {
    "use strict";

    // Generic tools functions
    export class Tools {

        // Copy an object (only a shallow copy of immediate properties)
        static copyObject<T> (object: T): T {
            var objectCopy = <T>Object.create(object.constructor.prototype);

            for (var key in object) {
                if (object.hasOwnProperty(key)) {
                    objectCopy[key] = object[key];
                }
            }

            return objectCopy;
        }

        // Get a class name, from an instance
        static getClassName(object: any): string {
            return object.constructor.name;
        }
    }
}
