/// <reference path="../LootTemplate.ts"/>

module TS.SpaceTac.Equipments {
    export class RocketEngine extends LootTemplate {
        constructor() {
            super(SlotType.Engine, "Rocket Engine", "First-era conventional deep-space engine, based on gas exhausts pushed through a nozzle", 120);

            this.setSkillsRequirements({ "skill_materials": 1 });
            this.setCooldown(irepeat(2), 0);
            this.addAttributeEffect("maneuvrability", 2);
            this.addMoveAction(istep(200, irepeat(20)), undefined, irepeat(70));
        }
    }

    export class IonThruster extends LootTemplate {
        constructor() {
            super(SlotType.Engine, "Ion Thruster", "Electric propulsion based on accelerating ions through an electrostatic grid", 150, 230);

            this.setSkillsRequirements({ "skill_photons": 1 });
            this.setCooldown(irepeat(3), irepeat(1));
            this.addAttributeEffect("maneuvrability", 1);
            this.addMoveAction(istep(120, irepeat(15)));
        }
    }

    export class VoidhawkEngine extends LootTemplate {
        constructor() {
            super(SlotType.Engine, "VoidHawk Engine", "Mid-range gravity field warp generator, allowing to make small jumps", 340, 160);

            this.setSkillsRequirements({ "skill_gravity": 2 });
            this.setCooldown(irepeat(1), 0);
            this.addAttributeEffect("maneuvrability", istep(-5, irepeat(0.8)));
            this.addMoveAction(irepeat(2000), istep(250, irepeat(-10)), irepeat(0));
        }
    }
}
