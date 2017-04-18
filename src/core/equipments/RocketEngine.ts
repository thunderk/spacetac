/// <reference path="../LootTemplate.ts"/>

module TS.SpaceTac.Equipments {
    export class RocketEngine extends LootTemplate {
        constructor() {
            super(SlotType.Engine, "Rocket Engine", "First-era conventional deep-space engine, based on gas exhausts pushed through a nozzle");

            this.setSkillsRequirements({ "skill_energy": 1 });
            this.addAttributeEffect("initiative", 1);
            this.addMoveAction(istep(200, irepeat(20)));
        }
    }
}
