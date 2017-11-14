/// <reference path="BaseBattleDiff.ts"/>

module TK.SpaceTac {
    /**
     * A ship dies (or rather is put in emergency stasis mode)
     * 
     * This typically happens when the ship's hull reaches 0.
     * A dead ship cannot be interacted with, and will be removed from play order.
     */
    export class ShipDeathDiff extends BaseBattleShipDiff {
        // Index in the play order at which the ship was
        play_index: number

        constructor(battle: Battle, ship: Ship) {
            super(ship);

            this.play_index = battle.play_order.indexOf(ship);
        }

        protected applyOnShip(ship: Ship, battle: Battle): void {
            ship.alive = false;
            if (this.play_index >= 0) {
                battle.removeFromPlayOrder(this.play_index);
            }
        }

        protected revertOnShip(ship: Ship, battle: Battle): void {
            ship.alive = true;
            if (this.play_index >= 0) {
                battle.insertInPlayOrder(this.play_index, ship);
            }
        }
    }
}
