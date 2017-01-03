/// <reference path="BaseLogEvent.ts"/>

module SpaceTac.Game {
    // Event logged when a ship moves
    export class AttributeChangeEvent extends BaseLogEvent {
        // Saved version of the attribute
        attribute: Attribute;

        constructor(ship: Ship, attribute: Attribute) {
            super("attr", ship);

            this.attribute = Tools.copyObject(attribute);
        }
    }
}
