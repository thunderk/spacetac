/// <reference path="BaseEffect.ts"/>

module TS.SpaceTac {
    /**
     * Repel ships from a central point
     */
    export class RepelEffect extends BaseEffect {
        value: number;

        constructor(value = 0) {
            super("repel");

            this.value = value;
        }

        applyOnShip(ship: Ship, source: Ship | Drone): boolean {
            if (ship != source) {
                let angle = arenaAngle(source.location, ship.location);
                let destination = new ArenaLocation(ship.arena_x + Math.cos(angle) * this.value, ship.arena_y + Math.sin(angle) * this.value);
                let exclusions = ExclusionAreas.fromShip(ship);
                destination = exclusions.stopBefore(destination, ship.location);
                ship.moveTo(destination.x, destination.y);
            }
            return true;
        }

        getDescription(): string {
            return `repel ships ${this.value}km away`;
        }
    }
}
