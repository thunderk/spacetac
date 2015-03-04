module SpaceTac.Game {
    "use strict";

    // Base class for serializable objects
    export class Serializable {
        static _next_sid: number = 0;

        private _sid: string;

        constructor() {
            this._sid = null;
        }

        getSerializeId(): string {
            if (this._sid === null) {
                this._sid = (Serializable._next_sid++).toString();
            }
            return this._sid;
        }
    }
}
