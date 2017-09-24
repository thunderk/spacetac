/// <reference path="BaseBattleEvent.ts"/>

module TK.SpaceTac {
    // Event logged when a drone is deployed by a ship
    export class DroneDeployedEvent extends BaseLogShipEvent {
        // Pointer to the drone
        drone: Drone;

        constructor(drone: Drone) {
            super("droneadd", drone.owner);

            this.drone = drone;
        }

        getReverse(): BaseBattleEvent {
            return new DroneDestroyedEvent(this.drone);
        }
    }
}
