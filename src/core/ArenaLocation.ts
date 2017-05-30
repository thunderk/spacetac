module TS.SpaceTac {
    /**
     * Location in the arena
     */
    export class ArenaLocation {
        x: number
        y: number

        constructor(x = 0, y = 0) {
            this.x = x;
            this.y = y;
        }

        /**
         * Get the distance to another location
         */
        getDistanceTo(other: ArenaLocation) {
            let dx = this.x - other.x;
            let dy = this.y - other.y;
            return Math.sqrt(dx * dx + dy * dy);
        }
    }

    /**
     * Location in the arena, with a facing angle in radians
     */
    export class ArenaLocationAngle extends ArenaLocation {
        angle: number

        constructor(x = 0, y = 0, angle = 0) {
            super(x, y);
            this.angle = angle;
        }
    }
}
