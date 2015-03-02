module SpaceTac.Game {
    "use strict";

    // Serializer to cascade through Serializable objects
    export class Serializer {
        collectSerializableClasses(container: any = null, path: string = ""): {[index: string]: typeof Serializable} {
            if (container) {
                var result: {[index: string]: typeof Serializable} = {};
                for (var obj_name in container) {
                    if (obj_name) {
                        var obj = container[obj_name];
                        var obj_path = path + "." + obj_name;
                        if (typeof obj === "object") {
                            result = Tools.merge(result, this.collectSerializableClasses(obj, obj_path));
                        } else if (typeof obj === "function" && obj.prototype instanceof Serializable) {
                            result[obj_path] = obj;
                        }
                    }
                }
                return result;
            } else {
                return this.collectSerializableClasses(SpaceTac.Game, "SpaceTac.Game");
            }
        }

        getClassPath(obj: Serializable): string {
            var classes = this.collectSerializableClasses();
            for (var class_path in classes) {
                if (class_path) {
                    var class_obj = classes[class_path];
                    if (class_obj.prototype === obj.constructor.prototype) {
                        return class_path;
                    }
                }
            }
            return null;
        }

        serialize(obj: Serializable): string {
            var data = {
                path: this.getClassPath(obj),
                fields: obj
            };
            return JSON.stringify(data);
        }

        unserialize(sdata: string): Serializable {
            var data = JSON.parse(sdata);
            var class_info = this.collectSerializableClasses()[data.path];
            var obj = Object.create(class_info.prototype);
            obj = Tools.merge(obj, data.fields);
            return obj;
        }
    }
}
