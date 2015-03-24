/// <reference path="Serializable.ts"/>

module SpaceTac.Game {
    "use strict";

    // Target for a capability
    //  This could be a location in space, or a ship
    export class Target extends Serializable {
        // Coordinates of the target
        x: number;
        y: number;

        // If the target is a ship, this attribute will be set
        ship: Ship;

        // Standard constructor
        constructor(x: number, y: number, ship: Ship) {
            super();

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

        // Get distance to another target
        getDistanceTo(other: Target): number {
            var dx = other.x - this.x;
            var dy = other.y - this.y;
            return Math.sqrt(dx * dx + dy * dy);
        }

        // Get the normalized angle, in radians, to another target
        getAngleTo(other: Target): number {
            var dx = other.x - this.x;
            var dy = other.y - this.y;
            return Math.atan2(dy, dx);
        }

        // Check if a target is in range from a specific point
        isInRange(x: number, y: number, radius: number): boolean {
            var dx = this.x - x;
            var dy = this.y - y;
            var length = Math.sqrt(dx * dx + dy * dy);
            return (length <= radius);
        }

        // Constraint a target, to be in a given range from a specific point
        //  May return the original target if it's already in radius
        constraintInRange(x: number, y: number, radius: number): Target {
            var dx = this.x - x;
            var dy = this.y - y;
            var length = Math.sqrt(dx * dx + dy * dy);
            if (length <= radius) {
                return this;
            } else {
                var factor = radius / length;
                return Target.newFromLocation(x + dx * factor, y + dy * factor);
            }
        }
    }
}
