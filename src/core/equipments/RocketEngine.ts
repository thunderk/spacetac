/// <reference path="../LootTemplate.ts"/>

module TS.SpaceTac.Equipments {
    export class RocketEngine extends LootTemplate {
        constructor() {
            super(SlotType.Engine, "Rocket Engine", "First-era conventional deep-space engine, based on gas exhausts pushed through a nozzle");

            this.setSkillsRequirements({ "skill_photons": 1 });
            this.setCooldown(irepeat(2), 0);
            this.addAttributeEffect("maneuvrability", 1);
            this.addMoveAction(istep(200, irepeat(20)));
        }
    }
}
