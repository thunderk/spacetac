/// <reference path="MissionPart.ts" />

module TS.SpaceTac {
    /**
     * A mission part that requires the fleet to go to a specific location
     */
    export class MissionPartGoTo extends MissionPart {
        destination: StarLocation

        constructor(destination: StarLocation, directive: string, hint = true) {
            super(hint ? `${directive} in ${destination.star.name} system` : directive);

            this.destination = destination;
        }

        checkCompleted(fleet: Fleet, universe: Universe): boolean {
            return fleet.location === this.destination && this.destination.isClear();
        }
    }
}
