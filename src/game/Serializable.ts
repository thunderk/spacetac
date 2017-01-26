module TS.SpaceTac.Game {
    // Base class for serializable objects
    export class Serializable {
        static _next_sid: number = 0;

        private _sid: string;

        constructor() {
            this._sid = null;
        }

        // Reset the SID sequence, given a maximal known SID
        static resetIdSequence(highest_known: number): void {
            Serializable._next_sid = highest_known + 1;
        }

        // Get an ID that can be used for serialization
        getSerializeId(): string {
            if (this._sid === null) {
                this._sid = (Serializable._next_sid++).toString();
            }
            return this._sid;
        }

        // Method called when fields have been serialized in this object
        postSerialize(fields: any): void {
            // Abstract method
        }
    }
}
