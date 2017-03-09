/// <reference path="BaseLogEvent.ts"/>

module TS.SpaceTac {
    // Event logged when a ship is dead
    export class DeathEvent extends BaseLogShipEvent {
        constructor(ship: Ship) {
            super("death", ship);
        }
    }
}
