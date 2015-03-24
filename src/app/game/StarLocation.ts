/// <reference path="Serializable.ts"/>

module SpaceTac.Game {
    "use strict";

    export enum StarLocationType {
        STAR,
        WARP,
        PLANET,
        ASTEROID,
        STATION
    }

    // Point of interest in a star system
    export class StarLocation extends Serializable {
        // Parent star system
        star: Star;

        // Type of location
        type: StarLocationType;

        // Location in the star system
        x: number;
        y: number;

        constructor(star: Star, type: StarLocationType, x: number, y: number) {
            super();

            this.star = star;
            this.type = type;
            this.x = x;
            this.y = y;
        }
    }
}
