/// <reference path="BaseBattleEvent.ts"/>

module TS.SpaceTac {
    /**
     * Event making a ship move 
     */
    export class MoveEvent extends BaseLogShipEvent {
        // Previous location
        start: ArenaLocationAngle

        // New location
        end: ArenaLocationAngle

        // Engine used
        engine: Equipment | null

        constructor(ship: Ship, start: ArenaLocationAngle, end: ArenaLocationAngle, engine: Equipment | null = null) {
            super("move", ship, Target.newFromLocation(end.x, end.y));

            this.start = start;
            this.end = end;
            this.engine = engine;
        }

        getReverse(): BaseBattleEvent {
            return new MoveEvent(this.ship, this.end, this.start, this.engine);
        }

        /**
         * Get the distance travelled
         */
        getDistance(): number {
            return arenaDistance(this.start, this.end);
        }
    }
}
