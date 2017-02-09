/// <reference path="../LootTemplate.ts"/>

module TS.SpaceTac.Equipments {
    export class BasicForceField extends LootTemplate {
        constructor() {
            super(SlotType.Shield, "Basic Force Field");

            this.min_level = new IntegerRange(1, 3);

            this.addAttributeEffect("shield_capacity", 100, 200);
        }
    }
}
