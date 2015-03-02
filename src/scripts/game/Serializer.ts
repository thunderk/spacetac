module SpaceTac.Game {
    "use strict";

    // Serializer to cascade through Serializable objects
    export class Serializer {
        // List all classes that implement "Serializable", with their full path in SpaceTac.Game namespace
        collectSerializableClasses(container: any = null, path: string = ""): {[index: string]: typeof Serializable} {
            if (container) {
                var result: {[index: string]: typeof Serializable} = {};
                for (var obj_name in container) {
                    if (container.hasOwnProperty(obj_name)) {
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

        // Get the full path in SpaceTac namespace, of a serializable object
        getClassPath(obj: Serializable): string {
            var classes = this.collectSerializableClasses();
            for (var class_path in classes) {
                if (classes.hasOwnProperty(class_path)) {
                    var class_obj = classes[class_path];
                    if (class_obj.prototype === obj.constructor.prototype) {
                        return class_path;
                    }
                }
            }
            return null;
        }

        // Serialize an object to a string
        serialize(obj: Serializable): string {
            var data = this.toData(obj);
            return JSON.stringify(data);
        }

        // Load an object from a serialized string
        unserialize(sdata: string): Serializable {
            var data = JSON.parse(sdata);
            var result = this.fromData(data);
            return result;
        }

        private toData(obj: Serializable): any {
            var fields = {};
            for (var field_name in obj) {
                if (obj.hasOwnProperty(field_name)) {
                    var field_value = obj[field_name];
                    if (field_value instanceof Serializable) {
                        fields[field_name] = this.toData(field_value);
                    } else {
                        fields[field_name] = field_value;
                    }
                }
            }

            var data = {
                path: this.getClassPath(obj),
                fields: fields
            };
            return data;
        }

        private fromData(data: any): Serializable {
            var class_info = this.collectSerializableClasses()[data.path];
            var obj = Object.create(class_info.prototype);
            for (var field_name in data.fields) {
                if (data.fields.hasOwnProperty(field_name)) {
                    var field_value = data.fields[field_name];
                    if (typeof field_value === "object" && field_value.hasOwnProperty("path")) {
                        obj[field_name] = this.fromData(field_value);
                    } else {
                        obj[field_name] = field_value;
                    }
                }
            }
            return obj;
        }
    }
}
