/// <reference path="MissionPart.ts" />

module TS.SpaceTac {
    /**
     * Level of hint to help find a destination
     */
    export enum MissionPartDestinationHint {
        PRECISE,
        SYSTEM_AND_INFO,
        SYSTEM
    }

    /**
     * A mission part that requires the fleet to go to a specific location
     */
    export class MissionPartGoTo extends MissionPart {
        destination: StarLocation
        hint: MissionPartDestinationHint

        constructor(mission: Mission, destination: StarLocation, directive?: string, hint = MissionPartDestinationHint.PRECISE) {
            super(mission, directive || `Go to ${destination.star.name} system`);

            this.destination = destination;
            this.hint = hint;
        }

        checkCompleted(): boolean {
            return this.fleet.location === this.destination && this.destination.isClear();
        }

        forceComplete(): void {
            this.destination.clearEncounter();
            this.fleet.setLocation(this.destination, true);
        }

        getLocationHint(): Star | StarLocation | null {
            return (this.hint == MissionPartDestinationHint.PRECISE) ? this.destination : this.destination.star;
        }
    }
}
