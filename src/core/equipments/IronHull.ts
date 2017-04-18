/// <reference path="../LootTemplate.ts"/>

module TS.SpaceTac.Equipments {
    export class IronHull extends LootTemplate {
        constructor() {
            super(SlotType.Hull, "Iron Hull");

            this.setSkillsRequirements({ "skill_material": 1 });
            this.addAttributeEffect("hull_capacity", istep(200, irepeat(50)));
        }
    }
}
