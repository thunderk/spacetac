/// <reference path="BaseBattleDiff.ts"/>

module TK.SpaceTac {
    /**
     * A ship moves in the arena
     */
    export class ShipMoveDiff extends BaseBattleShipDiff {
        // Previous location
        start: ArenaLocationAngle

        // New location
        end: ArenaLocationAngle

        // Engine used
        engine: Equipment | null

        constructor(ship: Ship | RObjectId, start: ArenaLocationAngle, end: ArenaLocationAngle, engine: Equipment | null = null) {
            super(ship);

            this.start = start;
            this.end = end;
            this.engine = engine;
        }

        /**
         * Get the distance travelled
         */
        getDistance(): number {
            return arenaDistance(this.start, this.end);
        }

        applyOnShip(ship: Ship, battle: Battle) {
            ship.setArenaPosition(this.end.x, this.end.y);
            ship.setArenaFacingAngle(this.end.angle);
        }

        getReverse(): ShipMoveDiff {
            return new ShipMoveDiff(this.ship_id, this.end, this.start, this.engine);
        }
    }
}
