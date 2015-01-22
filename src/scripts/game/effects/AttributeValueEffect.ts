/// <reference path="BaseEffect.ts"/>

module SpaceTac.Game {
    "use strict";

    // Effect on attribute value
    //  Typically, these effects are summed up to define an attribute value
    export class AttributeValueEffect extends BaseEffect {
        // Affected attribute
        attrcode: AttributeCode;

        // Value to contribute
        value: number;

        constructor(attrcode: AttributeCode, value: number) {
            super("attr");

            this.attrcode = attrcode;
            this.value = value;
        }
    }
}
