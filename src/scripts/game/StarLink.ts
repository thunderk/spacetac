/// <reference path="Serializable.ts"/>

module SpaceTac.Game {
    "use strict";

    // An hyperspace link between two star systems
    export class StarLink extends Serializable {
        // Stars
        first: Star;
        second: Star;

        constructor(first: Star, second: Star) {
            super();

            this.first = first;
            this.second = second;
        }

        // Check if this links bounds the two stars together, in either way
        isLinking(first: Star, second: Star) {
            return (this.first === first && this.second === second) || (this.first === second && this.second === first);
        }
    }
}
