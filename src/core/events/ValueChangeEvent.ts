/// <reference path="BaseLogEvent.ts"/>

module TS.SpaceTac {
    // Event logged when a ship value or attribute changed
    export class ValueChangeEvent extends BaseLogShipEvent {
        // Saved version of the current value
        value: ShipValue;

        // Value variation
        diff: number;

        constructor(ship: Ship, value: ShipValue, diff: number) {
            super("value", ship);

            this.value = copy(value);
            this.diff = diff;
        }
    }
}
