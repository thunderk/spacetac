/// <reference path="BaseLogEvent.ts"/>

module TS.SpaceTac.Game {
    // Event logged when a ship moves
    export class AttributeChangeEvent extends BaseLogEvent {
        // Saved version of the attribute
        attribute: Attribute;

        constructor(ship: Ship, attribute: Attribute) {
            super("attr", ship);

            this.attribute = copy(attribute);
        }
    }
}
