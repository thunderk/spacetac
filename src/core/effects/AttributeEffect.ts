/// <reference path="BaseEffect.ts"/>

module TK.SpaceTac {
    /**
     * Effect to modify an attribute.
     * 
     * Attribute effects are stacking, and the value of an attribute is in fact the sum of all active attribute effects.
     */
    export class AttributeEffect extends BaseEffect {
        // Affected attribute
        attrcode: keyof ShipAttributes

        // Base value
        value: number

        constructor(attrcode: keyof ShipAttributes, value = 0) {
            super("attr");

            this.attrcode = attrcode;
            this.value = value;
        }

        getOnDiffs(ship: Ship, source: Ship | Drone): BaseBattleDiff[] {
            return [
                new ShipAttributeDiff(ship, this.attrcode, { cumulative: this.value }, {}),
            ];
        }

        getOffDiffs(ship: Ship, source: Ship | Drone): BaseBattleDiff[] {
            return [
                new ShipAttributeDiff(ship, this.attrcode, {}, { cumulative: this.value }),
            ];
        }

        isBeneficial(): boolean {
            return this.value >= 0;
        }

        getFullCode(): string {
            return this.code + "-" + this.attrcode;
        }

        getDescription(): string {
            let attrname = SHIP_VALUES_NAMES[this.attrcode];
            return `${attrname} ${this.value > 0 ? "+" : "-"}${Math.abs(this.value)}`;
        }
    }
}
