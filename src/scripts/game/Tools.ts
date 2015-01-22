module SpaceTac.Game {
    "use strict";

    // Generic tools functions
    export class Tools {
        static copyObject<T> (object: T): T {
            var objectCopy = <T>{};

            for (var key in object) {
                if (object.hasOwnProperty(key)) {
                    objectCopy[key] = object[key];
                }
            }

            return objectCopy;
        }
    }
}
