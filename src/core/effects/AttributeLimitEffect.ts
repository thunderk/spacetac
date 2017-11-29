/// <reference path="BaseEffect.ts"/>

module TK.SpaceTac {
    /**
     * Enforce a limitation on ship attribute final value
     * 
     * For example, this could be used to slow a target by limiting its action points
     */
    export class AttributeLimitEffect extends BaseEffect {
        // Affected attribute
        attrcode: keyof ShipAttributes;

        // Limit of the attribute value
        value: number;

        constructor(attrcode: keyof ShipAttributes, value = 0) {
            super("attrlimit");

            this.attrcode = attrcode;
            this.value = value;
        }

        getOnDiffs(ship: Ship, source: Ship | Drone): BaseBattleDiff[] {
            return [
                new ShipAttributeDiff(ship, this.attrcode, { limit: this.value }, {}),
            ];
        }

        getOffDiffs(ship: Ship): BaseBattleDiff[] {
            return [
                new ShipAttributeDiff(ship, this.attrcode, {}, { limit: this.value }),
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
            return `limit ${attrname} to ${this.value}`;
        }
    }
}
