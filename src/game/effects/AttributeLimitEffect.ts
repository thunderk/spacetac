/// <reference path="TemporaryEffect.ts"/>

module SpaceTac.Game {
    // Hard limitation on attribute value
    //  For example, this could be used to slow a target by limiting its action points
    export class AttributeLimitEffect extends TemporaryEffect {
        // Affected attribute
        attrcode: AttributeCode;

        // Limit of the attribute value
        value: number;

        constructor(attrcode: AttributeCode, duration: number = 0, value: number = 0) {
            super("attrlimit", duration);

            this.attrcode = attrcode;
            this.value = value;
        }

        singleApply(ship: Ship, on_stick: boolean): void {
            var current = ship.attributes.getValue(this.attrcode);
            if (current > this.value) {
                ship.setAttribute(ship.attributes.getRawAttr(this.attrcode), this.value);
            }
        }

        getFullCode(): string {
            return this.code + "-" + AttributeCode[this.attrcode].toLowerCase().replace("_", "");
        }

        getDescription(): string {
            return `limit ${ATTRIBUTE_NAMES[this.attrcode]} to ${this.value}`;
        }
    }
}
