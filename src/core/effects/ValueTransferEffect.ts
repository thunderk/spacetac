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

        applyOnShip(ship: Ship, source: Ship | Drone): boolean {
            if (source instanceof Ship) {
                if (this.amount < 0) {
                    return new ValueTransferEffect(this.valuetype, -this.amount).applyOnShip(source, ship);
                } else {
                    let amount = Math.min(source.getValue(this.valuetype), this.amount);
                    if (amount) {
                        source.setValue(this.valuetype, -amount, true);
                        ship.setValue(this.valuetype, amount, true);
                        return true;
                    } else {
                        return false;
                    }
                }
            } else {
                return false;
            }
        }

        isBeneficial(): boolean {
            return this.amount >= 0;
        }

        getFullCode(): string {
            return `${this.code}-${this.valuetype}`;
        }

        getDescription(): string {
            let attrname = SHIP_VALUES[this.valuetype].name;
            let verb = (this.amount < 0 ? "steal" : "give");
            return `${verb} ${Math.abs(this.amount)} ${attrname}`;
        }
    }
}
