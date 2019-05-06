module TK {

    function isObject(value: any): boolean {
        return value instanceof Object && !Array.isArray(value);
    }

    /**
     * A typescript object serializer.
     */
    export class Serializer {
        namespace: any;
        ignored: string[] = [];

        constructor(namespace: any = TK) {
            this.namespace = namespace;
        }

        /**
         * Add a class to the ignore list
         */
        addIgnoredClass(name: string) {
            this.ignored.push(name);
        }

        /**
         * Construct an object from a constructor name
         */
        constructObject(ctype: string): Object {
            if (ctype == "Object") {
                return {};
            } else {
                let cl = this.namespace[ctype];
                if (cl) {
                    return Object.create(cl.prototype);
                } else {
                    cl = (<any>TK)[ctype];
                    if (cl) {
                        return Object.create(cl.prototype);
                    } else {
                        console.error("Can't find class", ctype);
                        return {};
                    }
                }
            }
        }

        /**
         * Serialize an object to a string
         */
        serialize(obj: any): string {
            // Collect objects
            var objects: Object[] = [];
            var stats: any = {};
            crawl(obj, value => {
                if (isObject(value)) {
                    var vtype = classname(value);
                    if (vtype != "" && this.ignored.indexOf(vtype) < 0) {
                        stats[vtype] = (stats[vtype] || 0) + 1;
                        add(objects, value);
                        return value;
                    } else {
                        return TK.STOP_CRAWLING;
                    }
                } else {
                    return value;
                }
            });
            //console.log("Serialize stats", stats);

            // Serialize objects list, transforming deeper objects to links
            var fobjects = objects.map(value => <Object>{ $c: classname(value), $f: merge({}, value) });
            return JSON.stringify(fobjects, (key, value) => {
                if (key != "$f" && isObject(value) && !value.hasOwnProperty("$c") && !value.hasOwnProperty("$i")) {
                    return { $i: objects.indexOf(value) };
                } else {
                    return value;
                }
            });
        }

        /**
         * Unserialize a string to an object
         */
        unserialize(data: string): any {
            // Unserialize objects list
            var fobjects = JSON.parse(data);

            // Reconstruct objects
            var objects = fobjects.map((objdata: any) => merge(this.constructObject(objdata['$c']), objdata['$f']));

            // Reconnect links
            crawl(objects, value => {
                if (value instanceof Object && value.hasOwnProperty('$i')) {
                    return objects[value['$i']];
                } else {
                    return value;
                }
            }, true);

            // Post unserialize hooks
            crawl(objects[0], value => {
                if (value instanceof Object && typeof value.postUnserialize == "function") {
                    value.postUnserialize();
                }
            });

            // First object was the root
            return objects[0];
        }
    }
}
