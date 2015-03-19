/// <reference path="Serializable.ts"/>

module SpaceTac.Game {
    "use strict";

    // A star system
    export class Star extends Serializable {
        // Parent universe
        universe: Universe;

        // Location in the universe
        x: number;
        y: number;

        constructor(universe: Universe, x: number, y: number) {
            super();

            this.universe = universe;
            this.x = x;
            this.y = y;
        }

        // Get the distance to another star
        getDistanceTo(star: Star): number {
            var dx = this.x - star.x;
            var dy = this.y - star.y;

            return Math.sqrt(dx * dx + dy * dy);
        }
    }
}
