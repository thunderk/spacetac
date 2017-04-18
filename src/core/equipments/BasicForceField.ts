/// <reference path="../LootTemplate.ts"/>

module TS.SpaceTac.Equipments {
    export class BasicForceField extends LootTemplate {
        constructor() {
            super(SlotType.Shield, "Basic Force Field");

            this.setSkillsRequirements({ "skill_energy": 1 });
            this.addAttributeEffect("shield_capacity", istep(100, irepeat(50)));
        }
    }
}
