/// <reference path="MissionPartGoTo.ts" />

module TK.SpaceTac {
    /**
     * A mission part that requires the fleet to clean a specific location of enemies
     */
    export class MissionPartCleanLocation extends MissionPartGoTo {
        ship: Ship

        constructor(mission: Mission, destination: StarLocation, directive?: string) {
            super(mission, destination, directive || `Clean a ${StarLocationType[destination.type].toLowerCase()} in ${destination.star.name} system`);
        }

        checkCompleted(): boolean {
            return super.checkCompleted() && this.destination.isClear();
        }

        onStarted(): void {
            this.destination.setupEncounter();

            if (this.destination.is(this.fleet.location)) {
                // Already there, re-enter the location to start the fight
                let battle = this.destination.enterLocation(this.fleet);
                if (battle) {
                    this.fleet.setBattle(battle);
                }
            }
        }
    }
}
