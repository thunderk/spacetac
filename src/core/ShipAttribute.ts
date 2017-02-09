/// <reference path="ShipValue.ts"/>

module TS.SpaceTac {
    /**
     * A ship attribute is a value computed by a sum of contributions from equipments and sticky effects.
     * 
     * A value may be limited by other effects.
     */
    export class ShipAttribute extends ShipValue {
        // Raw contributions value (without limits)
        private raw = 0

        // Temporary limits
        private limits: number[] = []
    }
}
