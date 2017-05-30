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

        constructor(ship: Ship, start: ArenaLocationAngle, end: ArenaLocationAngle) {
            super("move", ship, Target.newFromLocation(end.x, end.y));

            this.start = start;
            this.end = end;
        }

        getReverse(): BaseBattleEvent {
            return new MoveEvent(this.ship, this.end, this.start);
        }

        /**
         * Get the distance travelled
         */
        getDistance(): number {
            return this.start.getDistanceTo(this.end);
        }
    }
}
