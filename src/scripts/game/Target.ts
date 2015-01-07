module SpaceTac.Game {
    "use strict";

    // Target for a capability
    //  This could be a location in space, or a ship
    export class Target {
        // Coordinates of the target
        x: number;
        y: number;

        // If the target is a ship, this attribute will be set
        ship: Ship;

        // Standard constructor
        constructor(x: number, y: number, ship: Ship) {
            this.x = x;
            this.y = y;
            this.ship = ship;
        }

        // Constructor to target a single ship
        static newFromShip(ship: Ship): Target {
            return new Target(ship.arena_x, ship.arena_y, ship);
        }

        // Constructor to target a location in space
        static newFromLocation(x: number, y: number): Target {
            return new Target(x, y, null);
        }
    }
}
