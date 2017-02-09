module TS.SpaceTac {
    // Find the nearest intersection between a line and a circle
    //  Circle is supposed to be centered at (0,0)
    //  Nearest intersection to (x1,y1) is returned
    function intersectLineCircle(x1: number, y1: number, x2: number, y2: number, r: number): [number, number] {
        // See http://mathworld.wolfram.com/Circle-LineIntersection.html
        var dx = x2 - x1;
        var dy = y2 - y1;
        var dr = Math.sqrt(dx * dx + dy * dy);
        var d = x1 * y2 - x2 * y1;
        var delta = r * r * dr * dr - d * d;

        var rx = (d * dy - dx * Math.sqrt(delta)) / (dr * dr);
        var ry = (-d * dx - dy * Math.sqrt(delta)) / (dr * dr);
        return [rx, ry];
    }

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

        // Force a target to stay out of a given circle
        //  If the target is in the circle, it will be moved to the nearest intersection between targetting line
        //  and the circle
        //  May return the original target if it's already out of the circle
        moveOutOfCircle(circlex: number, circley: number, radius: number, sourcex: number, sourcey: number): Target {
            var dx = this.x - circlex;
            var dy = this.y - circley;
            var length = Math.sqrt(dx * dx + dy * dy);
            if (length >= radius) {
                // Already out of circle
                return this;
            } else {
                // Find nearest intersection with circle
                var res = intersectLineCircle(sourcex - circlex, sourcey - circley,
                    this.x - circlex, this.y - circley, radius);
                return Target.newFromLocation(res[0] + circlex, res[1] + circley);
            }
        }
    }
}
