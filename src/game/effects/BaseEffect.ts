/// <reference path="../Serializable.ts"/>

module SpaceTac.Game {
    // Base class for effects of actions
    //  Effects can be permanent or temporary (for a number of turns)
    export class BaseEffect extends Serializable {
        // Identifier code for the type of effect
        code: string;

        // Base constructor
        constructor(code: string) {
            super();

            this.code = code;
        }

        // Apply ponctually the effect on a given ship
        //  Return true if the effect could be applied
        applyOnShip(ship: Ship): boolean {
            return false;
        }
    }
}
