/// <reference path="BaseEffect.ts"/>

module TK.SpaceTac {
    /**
     * Repel ships from a central point
     */
    export class RepelEffect extends BaseEffect {
        value: number;

        constructor(value = 0) {
            super("repel");

            this.value = value;
        }

        getOnDiffs(ship: Ship, source: Ship | Drone): BaseBattleDiff[] {
            if (ship != source) {
                let angle = arenaAngle(source.location, ship.location);
                let destination = new ArenaLocation(ship.arena_x + Math.cos(angle) * this.value, ship.arena_y + Math.sin(angle) * this.value);
                let exclusions = ExclusionAreas.fromShip(ship);
                destination = exclusions.stopBefore(destination, ship.location);
                // TODO Apply area effect adding/removal
                return [
                    new ShipMoveDiff(ship, ship.location, new ArenaLocationAngle(destination.x, destination.y, ship.arena_angle))
                ];
            } else {
                return [];
            }
        }

        getDescription(): string {
            return `repel ships ${this.value}km away`;
        }
    }
}
