/// <reference path="BaseLogEvent.ts"/>

module TS.SpaceTac.Game {
    // Event logged when a drone is destroyed
    export class DroneDestroyedEvent extends BaseLogEvent {
        // Pointer to the drone
        drone: Drone;

        constructor(drone: Drone) {
            super("dronedel", drone.owner);

            this.drone = drone;
        }
    }
}
