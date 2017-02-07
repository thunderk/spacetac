/// <reference path="../LootTemplate.ts"/>

module TS.SpaceTac.Game.Equipments {
    export class BasicPowerCore extends LootTemplate {
        constructor() {
            super(SlotType.Power, "Basic Power Core");

            this.min_level = new IntegerRange(1, 1);

            this.addAttributeEffect("initiative", 1);
            this.addAttributeEffect("power_capacity", 8);
            this.addAttributeEffect("power_initial", 5);
            this.addAttributeEffect("power_recovery", 4);
        }
    }
}
