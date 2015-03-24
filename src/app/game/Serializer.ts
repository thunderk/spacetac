module SpaceTac.Game {
    "use strict";

    // Serializer to cascade through Serializable objects
    export class Serializer {
        // Mapping of IDs to objects
        refs: {[index: string]: any};

        // Serializable classes
        classes: {[index: string]: typeof Serializable};

        constructor() {
            this.refs = {};
            this.classes = this.collectSerializableClasses();
        }

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
            for (var class_path in this.classes) {
                if (this.classes.hasOwnProperty(class_path)) {
                    var class_obj = this.classes[class_path];
                    if (class_obj.prototype === obj.constructor.prototype) {
                        return class_path;
                    }
                }
            }
            return null;
        }

        // Compute the highest known SID
        getMaxId(): number {
            var result = -1;
            for (var sid in this.refs) {
                if (typeof sid === "string") {
                    result = Math.max(result, parseInt(sid, 10));
                }
            }
            return result;
        }

        // Serialize an object to a string
        serialize(obj: Serializable): string {
            this.refs = {};
            var data = {
                refs: this.refs,
                root: this.toData(obj)
            };
            return JSON.stringify(data);
        }

        // Load an object from a serialized string
        unserialize(sdata: string): Serializable {
            var data = JSON.parse(sdata);
            this.refs = data.refs;
            var result = this.fromData(data.root);
            Serializable.resetIdSequence(this.getMaxId());
            return result;
        }

        private toData(obj: Serializable): any {
            var sid = obj.getSerializeId();
            var cached = this.refs[sid];
            var data = {
                _s: "r",
                _i: sid
            };
            if (typeof cached !== "undefined") {
                return data;
            }

            var fields = {};
            this.refs[sid] = {
                _s: "o",
                path: this.getClassPath(obj),
                fields: fields
            };

            for (var field_name in obj) {
                if (obj.hasOwnProperty(field_name)) {
                    var field_value = obj[field_name];
                    if (field_value instanceof Serializable) {
                        fields[field_name] = this.toData(field_value);
                    } else if (Array.isArray(field_value) && field_value.length > 0 && field_value[0] instanceof Serializable) {
                        var items: Serializable[] = [];
                        field_value.forEach((item: any) => {
                            items.push(this.toData(item));
                        });
                        fields[field_name] = {
                            _s: "a",
                            items: items
                        };
                    } else {
                        if (Object.prototype.toString.call(field_value) === "[object Object]") {
                            console.error("Non Serializable object", field_value);
                        }
                        fields[field_name] = field_value;
                    }
                }
            }
            obj.postSerialize(fields);

            return data;
        }

        private fromData(data: any): Serializable {
            var sid = data._i;
            var cached = this.refs[sid];

            if (cached._s === "o") {
                var class_info = this.classes[cached.path];
                var obj = Object.create(class_info.prototype);
                this.refs[sid] = obj;
                for (var field_name in cached.fields) {
                    if (cached.fields.hasOwnProperty(field_name)) {
                        var field_value = cached.fields[field_name];
                        if (field_value !== null && typeof field_value === "object" && field_value._s === "r") {
                            obj[field_name] = this.fromData(field_value);
                        } else if (field_value !== null && typeof field_value === "object" && field_value._s === "a") {
                            var items: Serializable[] = [];
                            field_value.items.forEach((item: any) => {
                                items.push(this.fromData(item));
                            });
                            obj[field_name] = items;
                        } else {
                            obj[field_name] = field_value;
                        }
                    }
                }
                return obj;
            } else {
                return cached;
            }
        }
    }
}
