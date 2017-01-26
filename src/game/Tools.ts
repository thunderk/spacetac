module TS.SpaceTac.Game {
    // Generic tools functions
    export class Tools {

        // Copy an object (only a shallow copy of immediate properties)
        static copyObject<T>(object: T): T {
            var objectCopy = <T>Object.create(object.constructor.prototype);

            for (var key in object) {
                if (object.hasOwnProperty(key)) {
                    objectCopy[key] = object[key];
                }
            }

            return objectCopy;
        }

        // Merge an object into another
        static merge(base: any, incoming: any): any {
            var result = Tools.copyObject(base);
            for (var obj_name in incoming) {
                if (obj_name) {
                    result[obj_name] = incoming[obj_name];
                }
            }
            return result;
        }

        // Partition a list by a predicate, returning the items that pass the predicate, then the ones that don't pass it
        static binpartition<T>(array: T[], predicate: (T) => boolean): [T[], T[]] {
            let pass = [];
            let fail = [];
            array.forEach(item => (predicate(item) ? pass : fail).push(item));
            return [pass, fail];
        }
    }
}
