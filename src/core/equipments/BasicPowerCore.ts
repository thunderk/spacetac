/// <reference path="../LootTemplate.ts"/>

module TS.SpaceTac.Equipments {
    export class BasicPowerCore extends LootTemplate {
        constructor() {
            super(SlotType.Power, "Basic Power Core");

            this.min_level = new IntegerRange(1, 1);

            this.increaseAttribute("initiative", 1);
            this.increaseAttribute("power_capacity", 8);
            this.increaseAttribute("power_initial", 5);
            this.increaseAttribute("power_recovery", 4);
        }
    }
}
