/// <reference path="../LootTemplate.ts"/>

module TS.SpaceTac.Equipments {
    export class RocketEngine extends LootTemplate {
        constructor() {
            super(SlotType.Engine, "Rocket Engine", "First-era conventional deep-space engine, based on gas exhausts pushed through a nozzle", 120);

            this.setSkillsRequirements({ "skill_materials": leveled(1, 1) });
            this.setCooldown(irepeat(2), leveled(0));
            this.addAttributeEffect("maneuvrability", leveled(2));
            this.addMoveAction(leveled(200, 10, 0), undefined, irepeat(70));
        }
    }

    export class IonThruster extends LootTemplate {
        constructor() {
            super(SlotType.Engine, "Ion Thruster", "Electric propulsion based on accelerating ions through an electrostatic grid", 150);

            this.setSkillsRequirements({ "skill_photons": leveled(1, 1) });
            this.setCooldown(irepeat(3), irepeat(1));
            this.addAttributeEffect("maneuvrability", leveled(1, 1));
            this.addMoveAction(leveled(120, 10, 0));
        }
    }

    export class VoidhawkEngine extends LootTemplate {
        constructor() {
            super(SlotType.Engine, "VoidHawk Engine", "Mid-range gravity field warp generator, allowing to make small jumps", 300);

            this.setSkillsRequirements({ "skill_gravity": leveled(2, 1.5) });
            this.setCooldown(leveled(1, 0.2, 0), irepeat(0));
            this.addAttributeEffect("maneuvrability", leveled(-3, -0.1));
            this.addMoveAction(irepeat(2000), imap(leveled(1), x => 420 - (300 * x / (x + 1))), irepeat(0));
        }
    }
}
