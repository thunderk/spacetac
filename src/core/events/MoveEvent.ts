/// <reference path="BaseLogEvent.ts"/>

module TS.SpaceTac {
    // Event logged when a ship moves
    export class MoveEvent extends BaseLogEvent {
        // New facing angle, in radians
        facing_angle: number;

        constructor(ship: Ship, x: number, y: number) {
            super("move", ship, Target.newFromLocation(x, y));

            this.facing_angle = ship.arena_angle;
        }
    }
}
