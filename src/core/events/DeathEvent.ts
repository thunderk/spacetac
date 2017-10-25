/// <reference path="BaseBattleEvent.ts"/>

module TK.SpaceTac {
    /**
     * A ship dies (or rather is put in emergency stasis mode)
     * 
     * This typically happens when the ship's hull reaches 0.
     * A dead ship cannot be interacted with, and will be removed from play order.
     */
    export class DeathEvent extends BaseLogShipEvent {
        // Unique ID of the ship in the battle
        ship_id: RObjectId

        // Index in the play order at which the ship was
        play_index: number

        constructor(battle: Battle, ship: Ship) {
            super("death", ship);

            this.ship_id = ship.id;
            this.play_index = battle.play_order.indexOf(ship);
        }

        apply(battle: Battle) {
            let ship = battle.getShip(this.ship_id);
            if (ship) {
                ship.alive = false;
                if (this.play_index >= 0) {
                    battle.removeFromPlayOrder(this.play_index);
                }
            } else {
                console.warn("Ship not found", this);
            }
        }

        revert(battle: Battle) {
            let ship = battle.getShip(this.ship_id);
            if (ship) {
                ship.alive = true;
                if (this.play_index >= 0) {
                    battle.insertInPlayOrder(this.play_index, ship);
                }
            } else {
                console.warn("Ship not found", this);
            }
        }
    }
}
