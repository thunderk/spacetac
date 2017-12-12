module TK.SpaceTac {
    /**
     * Location in the arena (coordinates only)
     */
    export interface IArenaLocation {
        x: number
        y: number
    }
    export class ArenaLocation implements IArenaLocation {
        x: number
        y: number

        constructor(x = 0, y = 0) {
            this.x = x;
            this.y = y;
        }
    }

    /**
     * Location in the arena, with a facing angle in radians
     */
    export interface IArenaLocationAngle {
        x: number
        y: number
        angle: number
    }
    export class ArenaLocationAngle extends ArenaLocation implements IArenaLocationAngle {
        angle: number

        constructor(x = 0, y = 0, angle = 0) {
            super(x, y);
            this.angle = angle;
        }
    }

    /**
     * Circle area in the arena
     */
    export interface IArenaCircleArea {
        x: number
        y: number
        radius: number
    }

    export class ArenaCircleArea extends ArenaLocation implements IArenaCircleArea {
        radius: number

        constructor(x = 0, y = 0, radius = 0) {
            super(x, y);
            this.radius = radius;
        }
    }

    /**
     * Get the normalized angle (in radians) between two locations
     */
    export function arenaAngle(loc1: IArenaLocation, loc2: IArenaLocation): number {
        return Math.atan2(loc2.y - loc1.y, loc2.x - loc1.x);
    }

    /**
     * Get the "angular difference" between two angles in radians, in ]-pi,pi] range.
     */
    export function angularDifference(angle1: number, angle2: number): number {
        let diff = angle2 - angle1;
        return diff - Math.PI * 2 * Math.floor((diff + Math.PI) / (Math.PI * 2));
    }

    /**
     * Get the normalized distance between two locations
     */
    export function arenaDistance(loc1: IArenaLocation, loc2: IArenaLocation): number {
        let dx = loc2.x - loc1.x;
        let dy = loc2.y - loc1.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Check if a location is inside an area
     */
    export function arenaInside(loc1: IArenaLocation, loc2: IArenaCircleArea, border_inclusive = true): boolean {
        let dist = arenaDistance(loc1, loc2);
        return border_inclusive ? (dist <= loc2.radius) : (dist < loc2.radius);
    }

    /**
     * Convert radians angle to degrees
     */
    export function degrees(angle: number): number {
        return angle * 180 / Math.PI;
    }

    /**
     * Convert degrees angle to radians
     */
    export function radians(angle: number): number {
        return angle * Math.PI / 180;
    }
}
