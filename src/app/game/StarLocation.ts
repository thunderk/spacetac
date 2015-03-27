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

        // Destination for jump, if its a WARP location
        jump_dest: StarLocation;

        constructor(star: Star, type: StarLocationType, x: number, y: number) {
            super();

            this.star = star;
            this.type = type;
            this.x = x;
            this.y = y;
            this.jump_dest = null;
        }

        // Set the jump destination of a WARP location
        setJumpDestination(jump_dest: StarLocation): void {
            if (this.type === StarLocationType.WARP) {
                this.jump_dest = jump_dest;
            }
        }
    }
}
