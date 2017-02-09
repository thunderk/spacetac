/// <reference path="BaseLogEvent.ts"/>

module TS.SpaceTac {
    // Event logged when a ship value or attribute changed
    export class ValueChangeEvent extends BaseLogEvent {
        // Saved version of the value
        value: ShipValue;

        constructor(ship: Ship, value: ShipValue) {
            super("value", ship);

            this.value = copy(value);
        }
    }
}
