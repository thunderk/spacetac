/// <reference path="BaseEffect.ts"/>

module TS.SpaceTac {
    /**
     * Effect to add (or subtract if negative) an amount to a ship value.
     * 
     * The effect is immediate and permanent.
     */
    export class ValueEffect extends BaseEffect {
        // Affected value
        valuetype: keyof ShipValues;

        // Value to add (or subtract if negative)
        value: number;

        constructor(valuetype: keyof ShipValues, value: number = 0) {
            super("value");

            this.valuetype = valuetype;
            this.value = value;
        }

        applyOnShip(ship: Ship): boolean {
            return ship.setValue(this.valuetype, this.value, true);
        }

        isBeneficial(): boolean {
            return this.value >= 0;
        }

        getFullCode(): string {
            return `${this.code}-${this.valuetype}`;
        }

        getDescription(): string {
            let attrname = SHIP_VALUES[this.valuetype].name;
            return `${attrname} ${this.value > 0 ? "+" : "-"}${Math.abs(this.value)}`;
        }
    }
}
