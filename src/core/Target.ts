module TK.SpaceTac {
    // Find the nearest intersection between a line and a circle
    //  Circle is supposed to be centered at (0,0)
    //  Nearest intersection to (x1,y1) is returned
    function intersectLineCircle(x1: number, y1: number, x2: number, y2: number, r: number): [number, number] | null {
        let a = y2 - y1;
        let b = -(x2 - x1);
        let c = -(a * x1 + b * y1);
        let x0 = -a * c / (a * a + b * b), y0 = -b * c / (a * a + b * b);
        let EPS = 10e-8;
        if (c * c > r * r * (a * a + b * b) + EPS) {
            return null;
        } else if (Math.abs(c * c - r * r * (a * a + b * b)) < EPS) {
            return [x0, y0];
        } else {
            let d = r * r - c * c / (a * a + b * b);
            let mult = Math.sqrt(d / (a * a + b * b));
            let ax, ay, bx, by;
            ax = x0 + b * mult;
            bx = x0 - b * mult;
            ay = y0 - a * mult;
            by = y0 + a * mult;

            let candidates: [number, number][] = [
                [x0 + b * mult, y0 - a * mult],
                [x0 - b * mult, y0 + a * mult]
            ]
            return minBy(candidates, ([x, y]) => Math.sqrt((x - x1) * (x - x1) + (y - y1) * (y - y1)));
        }
    }

    // Target for a capability
    //  This could be a location in space, or a ship
    export class Target {
        // Coordinates of the target
        x: number
        y: number

        // If the target is a ship, this attribute will be set
        ship_id: RObjectId | null

        // Standard constructor
        constructor(x: number, y: number, ship: Ship | null = null) {
            this.x = x;
            this.y = y;
            this.ship_id = ship ? ship.id : null;
        }

        jasmineToString() {
            if (this.ship_id) {
                return `(${this.x},${this.y}) ship_id=${this.ship_id}}`;
            } else {
                return `(${this.x},${this.y})`;
            }
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
        getDistanceTo(other: { x: number, y: number }): number {
            var dx = other.x - this.x;
            var dy = other.y - this.y;
            return Math.sqrt(dx * dx + dy * dy);
        }

        // Get the normalized angle, in radians, to another target
        getAngleTo(other: { x: number, y: number }): number {
            var dx = other.x - this.x;
            var dy = other.y - this.y;
            return Math.atan2(dy, dx);
        }

        /**
         * Returns true if the target is a ship
         */
        isShip(): boolean {
            return this.ship_id !== null;
        }

        /**
         * Get the targetted ship in a battle
         */
        getShip(battle: Battle): Ship | null {
            if (this.isShip()) {
                return battle.getShip(this.ship_id);
            } else {
                return null;
            }
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
                var res = intersectLineCircle(sourcex - circlex, sourcey - circley, dx, dy, radius);
                if (res) {
                    return Target.newFromLocation(res[0] + circlex, res[1] + circley);
                } else {
                    return this;
                }
            }
        }

        /**
         * Keep the target inside a rectangle
         * 
         * May return the original target if it's already inside the rectangle
         */
        keepInsideRectangle(xmin: number, ymin: number, xmax: number, ymax: number, sourcex: number, sourcey: number): Target {
            let length = this.getDistanceTo({ x: sourcex, y: sourcey });
            let result: Target = this;
            if (result.x < xmin) {
                let factor = (xmin - sourcex) / (result.x - sourcex);
                length *= factor;
                result = result.constraintInRange(sourcex, sourcey, length);
            }
            if (result.x > xmax) {
                let factor = (xmax - sourcex) / (result.x - sourcex);
                length *= factor;
                result = result.constraintInRange(sourcex, sourcey, length);
            }
            if (result.y < ymin) {
                let factor = (ymin - sourcey) / (result.y - sourcey);
                length *= factor;
                result = result.constraintInRange(sourcex, sourcey, length);
            }
            if (result.y > ymax) {
                let factor = (ymax - sourcey) / (result.y - sourcey);
                length *= factor;
                result = result.constraintInRange(sourcex, sourcey, length);
            }
            return result;
        }
    }
}
