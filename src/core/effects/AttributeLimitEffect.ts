/// <reference path="BaseEffect.ts"/>

module TS.SpaceTac {
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

        applyOnShip(ship: Ship, source: Ship | Drone): boolean {
            ship.updateAttributes();
            return true;
        }

        getFullCode(): string {
            return this.code + "-" + this.attrcode;
        }

        getDescription(): string {
            let attrname = SHIP_ATTRIBUTES[this.attrcode].name;
            return `limit ${attrname} to ${this.value}`;
        }
    }
}
