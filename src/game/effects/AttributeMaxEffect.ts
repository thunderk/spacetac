/// <reference path="BaseEffect.ts"/>

module SpaceTac.Game {
    // Effect on attribute maximum
    //  Typically, these effects are summed up to define an attribute maximum
    export class AttributeMaxEffect extends BaseEffect {
        // Affected attribute
        attrcode: AttributeCode;

        // Value to add to the maximum
        value: number;

        constructor(attrcode: AttributeCode, value: number) {
            super("attrmax");

            this.attrcode = attrcode;
            this.value = value;
        }

        getFullCode(): string {
            return this.code + "-" + AttributeCode[this.attrcode].toLowerCase().replace("_", "");
        }
    }
}
