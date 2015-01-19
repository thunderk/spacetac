/// <reference path="BaseLogEvent.ts"/>

module SpaceTac.Game {
    "use strict";

    // Event logged when a ship moves
    export class AttributeChangeEvent extends BaseLogEvent {
        constructor(ship: Ship, attribute: Attribute) {
            super("attr", ship);
        }
    }
}
