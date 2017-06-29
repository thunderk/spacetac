/// <reference path="MissionPart.ts" />

module TS.SpaceTac {
    /**
     * A mission part that requires the fleet to go to a specific location
     */
    export class MissionPartGoTo extends MissionPart {
        destination: StarLocation

        constructor(mission: Mission, destination: StarLocation, directive: string, hint = true) {
            super(mission, hint ? `${directive} in ${destination.star.name} system` : directive);

            this.destination = destination;
        }

        checkCompleted(): boolean {
            return this.fleet.location === this.destination && this.destination.isClear();
        }

        forceComplete(): void {
            this.destination.clearEncounter();
            this.fleet.setLocation(this.destination, true);
        }
    }
}
