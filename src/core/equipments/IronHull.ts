/// <reference path="../LootTemplate.ts"/>

module TS.SpaceTac.Equipments {
    export class IronHull extends LootTemplate {
        constructor() {
            super(SlotType.Hull, "Iron Hull", "Protective hull, based on layered iron alloys");

            this.setSkillsRequirements({ "skill_materials": 1 });
            this.addAttributeEffect("hull_capacity", istep(200, irepeat(20)));
        }
    }
}
