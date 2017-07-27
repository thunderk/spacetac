/// <reference path="../LootTemplate.ts"/>

module TS.SpaceTac.Equipments {
    export class IronHull extends LootTemplate {
        constructor() {
            super(SlotType.Hull, "Iron Hull", "Protective hull, based on layered iron alloys");

            this.setSkillsRequirements({ "skill_materials": 1 });
            this.addAttributeEffect("hull_capacity", istep(200, irepeat(20)));
        }
    }

    export class HardCoatedHull extends LootTemplate {
        constructor() {
            super(SlotType.Hull, "Hard Coated Hull", "Hardened hull, with titanium coating", 120, 210);

            this.setSkillsRequirements({ "skill_materials": 2 });
            this.addAttributeEffect("hull_capacity", istep(300, irepeat(15)));
            this.addAttributeEffect("maneuvrability", istep(-2, irepeat(-1)));
        }
    }

    export class FractalHull extends LootTemplate {
        constructor() {
            super(SlotType.Hull, "Fractal Hull", "Hull composed of recursively bound quantum patches", 250, 230);

            this.setSkillsRequirements({ "skill_quantum": 1 });
            this.addAttributeEffect("hull_capacity", istep(260, irepeat(10)));
            this.addAttributeEffect("maneuvrability", istep(-1, irepeat(-0.5)));
        }
    }
}
