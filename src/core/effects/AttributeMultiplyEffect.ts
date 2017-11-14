/// <reference path="BaseEffect.ts"/>

module TK.SpaceTac {
    /**
     * Boost or reduce an attribute value
     * 
     * This effect is stored as "20" for "+20%", or "-10" for "-10%".
     * Several multiply effects are cumulative (+20 and +10 will apply a +30 boost).
     */
    export class AttributeMultiplyEffect extends BaseEffect {
        // Affected attribute
        attrcode: keyof ShipAttributes;

        // Boost factor (percentage)
        value: number;

        constructor(attrcode: keyof ShipAttributes, value = 0) {
            super("attrmult");

            this.attrcode = attrcode;
            this.value = value;
        }

        getOnDiffs(ship: Ship, source: Ship | Drone): BaseBattleDiff[] {
            return [
                new ShipAttributeDiff(ship, this.attrcode, { multiplier: this.value }, {}),
            ];
        }

        getOffDiffs(ship: Ship, source: Ship | Drone): BaseBattleDiff[] {
            return [
                new ShipAttributeDiff(ship, this.attrcode, {}, { multiplier: this.value }),
            ];
        }

        isBeneficial(): boolean {
            return false;
        }

        getFullCode(): string {
            return this.code + "-" + this.attrcode;
        }

        getDescription(): string {
            let attrname = SHIP_VALUES_NAMES[this.attrcode];
            return `${attrname} ${this.value > 0 ? "+" : "-"}${Math.abs(this.value)}%`;
        }
    }
}
