/// <reference path="BaseEffect.ts"/>

module TS.SpaceTac.Game {
    /**
     * Effect to add (or subtract if negative) an amount to an attribute value.
     * 
     * The effect is "permanent", and will not be removed when the effect ends.
     */
    export class AttributeAddEffect extends BaseEffect {
        // Affected attribute
        attrcode: AttributeCode;

        // Value to add (or subtract if negative)
        value: number;

        constructor(attrcode: AttributeCode, value: number) {
            super("attradd");

            this.attrcode = attrcode;
            this.value = value;
        }

        applyOnShip(ship: Ship): boolean {
            return ship.setAttribute(this.attrcode, this.value, true);
        }

        isBeneficial(): boolean {
            return this.value >= 0;
        }

        getFullCode(): string {
            return this.code + "-" + AttributeCode[this.attrcode].toLowerCase().replace("_", "");
        }
    }
}
