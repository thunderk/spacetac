/// <reference path="BaseBattleDiff.ts"/>

module TK.SpaceTac {
    /**
     * Current playing ship changes
     */
    export class ShipChangeDiff extends BaseBattleShipDiff {
        // ID of the new playing ship
        new_ship: RObjectId

        // Diff in the cycle count
        cycle_diff: number

        constructor(ship: Ship | RObjectId, new_ship: Ship | RObjectId, cycle_diff = 0) {
            super(ship);

            this.new_ship = (new_ship instanceof Ship) ? new_ship.id : new_ship;
            this.cycle_diff = cycle_diff;
        }

        applyOnShip(ship: Ship, battle: Battle) {
            if (ship.is(battle.playing_ship)) {
                let new_ship = battle.getShip(this.new_ship);
                if (new_ship) {
                    battle.setPlayingShip(new_ship);
                    battle.cycle += this.cycle_diff;
                } else {
                    console.error("Cannot apply diff - new ship not found", this);
                }
            } else {
                console.error("Cannot apply diff - ship is not playing", this);
            }
        }

        getReverse(): BaseBattleDiff {
            return new ShipChangeDiff(this.new_ship, this.ship_id, -this.cycle_diff);
        }
    }
}
