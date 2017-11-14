/// <reference path="BaseBattleDiff.ts"/>

module TK.SpaceTac {
    /**
     * A ship value changed
     */
    export class ShipValueDiff extends BaseBattleShipDiff {
        // Value that changes
        code: keyof ShipValues

        // Value variation
        diff: number

        constructor(ship: Ship | RObjectId, code: keyof ShipValues, diff: number) {
            super(ship);

            this.code = code;
            this.diff = diff;
        }

        getReverse(): BaseBattleDiff {
            return new ShipValueDiff(this.ship_id, this.code, -this.diff);
        }

        applyOnShip(ship: Ship, battle: Battle): void {
            ship.values[this.code] += this.diff;
        }
    }
}
