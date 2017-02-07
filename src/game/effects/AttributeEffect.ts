/// <reference path="BaseEffect.ts"/>

module TS.SpaceTac.Game {
    /**
     * Effect to modify an attribute.
     * 
     * Attribute effects are stacking, and the value of an attribute is in fact the sum of all active attribute effects.
     */
    export class AttributeEffect extends BaseEffect {
        // Affected attribute
        attrcode: keyof ShipAttributes;

        // Base value
        value: number;

        constructor(attrcode: keyof ShipAttributes, value: number) {
            super("attr");

            this.attrcode = attrcode;
            this.value = value;
        }

        applyOnShip(ship: Ship): boolean {
            ship.updateAttributes();
            return true;
        }

        isBeneficial(): boolean {
            return this.value >= 0;
        }

        getFullCode(): string {
            return this.code + "-" + this.attrcode;
        }
    }
}
