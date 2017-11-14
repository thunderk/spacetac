/// <reference path="../../common/DiffLog.ts" />

module TK.SpaceTac {
    /**
     * Base class for battle diffs
     * 
     * Events are the proper way to modify the battle state
     */
    export class BaseBattleDiff extends Diff<Battle> {
    }

    /**
     * Base class for battle diffs related to a ship
     */
    export class BaseBattleShipDiff extends BaseBattleDiff {
        ship_id: RObjectId

        constructor(ship: Ship | RObjectId) {
            super();

            this.ship_id = (ship instanceof Ship) ? ship.id : ship;
        }

        apply(battle: Battle): void {
            let ship = battle.getShip(this.ship_id);
            if (ship) {
                this.applyOnShip(ship, battle);
            } else {
                console.error("Diff apply failed - Ship not found", this);
            }
        }

        /**
         * Apply the diff on the ship
         */
        protected applyOnShip(ship: Ship, battle: Battle): void {
        }

        revert(battle: Battle): void {
            let ship = battle.getShip(this.ship_id);
            if (ship) {
                this.revertOnShip(ship, battle);
            } else {
                console.error("Diff revert failed - Ship not found", this);
            }
        }

        /**
         * Revert the diff on the ship
         */
        protected revertOnShip(ship: Ship, battle: Battle): void {
            this.getReverse().apply(battle);
        }
    }
}
