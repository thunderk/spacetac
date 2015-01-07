module SpaceTac.Game {
    "use strict";

    // Battle event, when a ship turn ended, and advanced to a new one
    export class ShipChangeEvent extends BaseLogEvent {
        constructor(ship: Ship, new_ship: Ship) {
            super("ship_change", ship, new_ship ? Target.newFromShip(new_ship) : null);
        }
    }
}
