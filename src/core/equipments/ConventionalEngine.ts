/// <reference path="../LootTemplate.ts"/>

module TS.SpaceTac.Equipments {
    // Equipment: Conventional Engine
    export class ConventionalEngine extends LootTemplate {
        constructor() {
            super(SlotType.Engine, "Conventional Engine");

            this.setSkillsRequirements({ "skill_energy": 1 });
            this.addAttributeEffect("initiative", 1);
            this.addMoveAction(istep(200, irepeat(20)));
        }
    }
}
