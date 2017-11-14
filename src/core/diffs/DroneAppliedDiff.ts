/// <reference path="BaseBattleDiff.ts"/>

module TK.SpaceTac {
    /**
     * A drone applies its effect on ships around
     */
    export class DroneAppliedDiff extends BaseBattleDiff {
        // ID of the drone
        drone: RObjectId

        // IDs of impacted ships
        ships: RObjectId[]

        constructor(drone: Drone, ships: Ship[]) {
            super();

            this.drone = drone.id;
            this.ships = ships.map(ship => ship.id);
        }

        apply(battle: Battle): void {
            let drone = battle.drones.get(this.drone);
            if (drone) {
                drone.duration -= 1;
            } else {
                console.error("Cannot apply diff - Drone not found", this);
            }
        }

        revert(battle: Battle): void {
            let drone = battle.drones.get(this.drone);
            if (drone) {
                drone.duration += 1;
            } else {
                console.error("Cannot revert diff - Drone not found", this);
            }
        }
    }
}
