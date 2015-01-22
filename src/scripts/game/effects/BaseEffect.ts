module SpaceTac.Game {
    "use strict";

    // Base class for effects of actions
    //  Effects can be permanent or temporary (for a number of turns)
    export class BaseEffect {
        // Identifier code for the type of effect
        code: string;

        // Base constructor
        constructor(code: string) {
            this.code = code;
        }
    }
}
