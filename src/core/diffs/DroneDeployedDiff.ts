/// <reference path="BaseBattleDiff.ts"/>

module TK.SpaceTac {
    /**
     * A drone is deployed by a ship
     */
    export class DroneDeployedDiff extends BaseBattleShipDiff {
        // Drone object
        drone: Drone

        constructor(drone: Drone) {
            super(drone.owner);

            this.drone = drone;
        }

        protected applyOnShip(ship: Ship, battle: Battle): void {
            battle.addDrone(this.drone);
        }

        protected getReverse(): BaseBattleDiff {
            return new DroneRecalledDiff(this.drone);
        }
    }

    /**
     * A drone is recalled
     */
    export class DroneRecalledDiff extends BaseBattleShipDiff {
        // Drone object
        drone: Drone

        constructor(drone: Drone) {
            super(drone.owner);

            this.drone = drone;
        }

        protected applyOnShip(ship: Ship, battle: Battle): void {
            battle.removeDrone(this.drone);
        }

        protected getReverse(): BaseBattleDiff {
            return new DroneDeployedDiff(this.drone);
        }
    }
}
