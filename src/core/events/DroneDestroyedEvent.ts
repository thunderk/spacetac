/// <reference path="BaseBattleEvent.ts"/>

module TK.SpaceTac {
    // Event logged when a drone is destroyed
    export class DroneDestroyedEvent extends BaseLogShipEvent {
        // Pointer to the drone
        drone: Drone;

        constructor(drone: Drone) {
            super("dronedel", drone.owner);

            this.drone = drone;
        }

        getReverse(): BaseBattleEvent {
            return new DroneDeployedEvent(this.drone);
        }
    }
}
