/// <reference path="BaseEffect.ts"/>

module TK.SpaceTac {
    /**
     * Transfer a value between two ships.
     */
    export class ValueTransferEffect extends BaseEffect {
        // Affected value
        valuetype: keyof ShipValues

        // Value to give to target (negative to take it)
        amount: number

        constructor(valuetype: keyof ShipValues, amount = 0) {
            super("valuetransfer");

            this.valuetype = valuetype;
            this.amount = amount;
        }

        getOnDiffs(ship: Ship, source: Ship | Drone, success: number): BaseBattleDiff[] {
            if (source instanceof Ship) {
                if (this.amount < 0) {
                    return new ValueTransferEffect(this.valuetype, -this.amount).getOnDiffs(source, ship, success);
                } else {
                    let amount = Math.min(source.getValue(this.valuetype), this.amount);
                    if (amount) {
                        return source.getValueDiffs(this.valuetype, -amount, true).concat(ship.getValueDiffs(this.valuetype, amount, true));
                    } else {
                        return [];
                    }
                }
            } else {
                return [];
            }
        }

        isBeneficial(): boolean {
            return this.amount >= 0;
        }

        getFullCode(): string {
            return `${this.code}-${this.valuetype}`;
        }

        getDescription(): string {
            let attrname = SHIP_VALUES_NAMES[this.valuetype];
            let verb = (this.amount < 0 ? "steal" : "give");
            return `${verb} ${Math.abs(this.amount)} ${attrname}`;
        }
    }
}
