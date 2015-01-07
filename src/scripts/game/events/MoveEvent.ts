module SpaceTac.Game {
    "use strict";

    // Event logged when a ship moves
    export class MoveEvent extends BaseLogEvent {
        constructor(ship: Ship, x: number, y: number) {
            super("move", ship, Target.newFromLocation(x, y));
        }
    }
}
