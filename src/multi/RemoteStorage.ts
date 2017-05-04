/// <reference path="Parse.d.ts" />

module TS.SpaceTac.Multi {
    /**
     * Interface for a remote storage, used for networking/multiplayer features
     */
    export interface IRemoteStorage {
        /**
         * Search through a collection for equality of some fields
         */
        search(collection: string, fields: any): Promise<any[]>
        /**
         * Find a single object with equality of some fields
         */
        find(collection: string, fields: any): Promise<any>
        /**
         * Insert or update an object in a collection, based on some unicity fields
         */
        upsert(collection: string, unicity: any, additional: any): Promise<void>
    }

    /**
     * Remote storage using the Parse protocol
     */
    export class ParseRemoteStorage implements IRemoteStorage {
        constructor() {
            Parse.initialize("thunderk.net");
            Parse.serverURL = 'https://rs.thunderk.net/parse';
        }

        /**
         * Unpack a Parse.Object to a javascript object
         */
        static unpack(obj: Parse.Object): Object {
            return obj.toJSON();
        }

        /**
         * Get the Parse model for a given collection name.
         */
        private getModel(collection: string): any {
            return Parse.Object.extend("spacetac" + collection);
        }

        async search(collection: string, fields: any) {
            let query = new Parse.Query(this.getModel(collection));
            iteritems(fields, (key, value) => {
                query.equalTo(key, value);
            });

            let results = await query.find();
            return results.map(ParseRemoteStorage.unpack);
        }

        async find(collection: string, fields: any) {
            let results = await this.search(collection, fields);
            if (results.length == 1) {
                return results[0];
            } else {
                return null;
            }
        }

        async upsert(collection: string, unicity: any, additional: any) {
            let query = new Parse.Query(this.getModel(collection));
            iteritems(unicity, (key, value) => {
                query.equalTo(key, value);
            });

            let results = await query.find();
            let model = this.getModel(collection);
            let base = new model();
            if (results.length == 1) {
                base = results[0];
            } else {
                iteritems(unicity, (key, value) => {
                    base.set(key, value);
                });
            }

            iteritems(additional, (key, value) => {
                base.set(key, value);
            });
            await base.save();
        }
    }

    /**
     * Fake remote storage in memory (for testing purposes)
     */
    export class FakeRemoteStorage implements IRemoteStorage {
        collections: { [collection: string]: any[] } = {}
        getCollection(name: string): any {
            let collection = this.collections[name];
            if (collection) {
                return collection;
            } else {
                this.collections[name] = [];
                return this.collections[name];
            }
        }
        async search(collection: string, fields: any) {
            let objects = this.getCollection(collection);
            let result = objects.filter((obj: any) => !any(items(fields), ([key, value]) => obj[key] != value));
            return result;
        }
        async find(collection: string, fields: any) {
            let results = await this.search(collection, fields);
            if (results.length == 1) {
                return results[0];
            } else {
                return null;
            }
        }
        async upsert(collection: string, unicity: any, additional: any) {
            let existing = await this.find(collection, unicity);
            let base = existing || copy(unicity);
            copyfields(additional, base);
            if (!existing) {
                let objects = this.getCollection(collection);
                objects.push(base);
            }
        }
    }
}
