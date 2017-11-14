/// <reference path="BaseBattleDiff.ts"/>

module TK.SpaceTac {
    /**
     * A drone is deployed by a ship
     */
    export class DroneDeployedDiff extends BaseBattleShipDiff {
        // Drone object
        drone: Drone

        // Initial duration (number of activations)
        duration: number

        constructor(drone: Drone, duration = drone.duration) {
            super(drone.owner);

            this.drone = drone;
            this.duration = duration;
        }

        protected applyOnShip(ship: Ship, battle: Battle): void {
            this.drone.duration = this.duration;
            battle.addDrone(this.drone);
        }

        protected getReverse(): BaseBattleDiff {
            return new DroneDestroyedDiff(this.drone, this.duration);
        }
    }

    /**
     * A drone is destroyed
     */
    export class DroneDestroyedDiff extends BaseBattleShipDiff {
        // Drone object
        drone: Drone

        // Remaining duration
        duration: number

        constructor(drone: Drone, duration = drone.duration) {
            super(drone.owner);

            this.drone = drone;
            this.duration = duration;
        }

        protected applyOnShip(ship: Ship, battle: Battle): void {
            battle.removeDrone(this.drone);
        }

        protected getReverse(): BaseBattleDiff {
            return new DroneDeployedDiff(this.drone, this.duration);
        }
    }
}
