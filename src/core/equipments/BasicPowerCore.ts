/// <reference path="../LootTemplate.ts"/>

module TS.SpaceTac.Equipments {
    export class BasicPowerCore extends LootTemplate {
        constructor() {
            super(SlotType.Power, "Basic Power Core");

            this.setSkillsRequirements({ "skill_energy": 1 });
            this.addAttributeEffect("initiative", istep(1));
            this.addAttributeEffect("power_capacity", istep(6));
            this.addAttributeEffect("power_initial", istep(4, irepeat(0.5)));
            this.addAttributeEffect("power_recovery", istep(3, irepeat(0.3)));
        }
    }
}
