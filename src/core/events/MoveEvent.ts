/// <reference path="BaseLogEvent.ts"/>

module TS.SpaceTac {
    // Event logged when a ship moves
    export class MoveEvent extends BaseLogShipTargetEvent {
        // Distance traveled
        distance: number

        // New facing angle, in radians
        facing_angle: number

        constructor(ship: Ship, x: number, y: number, distance: number) {
            super("move", ship, Target.newFromLocation(x, y));

            this.distance = distance;
            this.facing_angle = ship.arena_angle;
        }
    }
}
