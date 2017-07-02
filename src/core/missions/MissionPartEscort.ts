/// <reference path="MissionPartGoTo.ts" />

module TS.SpaceTac {
    /**
     * A mission part that requires the fleet to escort a specific ship to a destination
     */
    export class MissionPartEscort extends MissionPartGoTo {
        ship: Ship

        constructor(mission: Mission, destination: StarLocation, ship: Ship, directive?: string) {
            super(mission, destination, directive || `Escort ${ship.name} to ${destination.star.name} system`);

            this.ship = ship;
        }

        checkCompleted(): boolean {
            return super.checkCompleted() && contains(this.fleet.ships, this.ship);
        }

        onStarted(): void {
            this.ship.critical = true;
            this.fleet.addShip(this.ship);
        }

        onEnded(): void {
            this.fleet.removeShip(this.ship);
        }
    }
}
